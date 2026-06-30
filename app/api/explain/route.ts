import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getIdentifier,
  getRateLimiter,
  rateLimitHeaders,
} from "@/lib/ratelimit";
import { illinoisDMVQuestions } from "@/lib/data/questions/illinois-dmv-questions";

// Two-tier limit: whichever is stricter at request time wins.
const rlExplainMinute = getRateLimiter("explain:minute", 30, 60); // 30/min
const rlExplainHour = getRateLimiter("explain:hour", 200, 60 * 60); // 200/hour

/**
 * POST /api/explain — AI-powered wrong answer explanation
 *
 * Calls synthetic.new API with Dash's hype-beast personality.
 * Caches results in ai_explanations table (same mistake = same explanation).
 * Falls back to static explanation if API is down/slow.
 *
 * Error handling:
 *   API timeout (>5s)  → static fallback
 *   API error          → static fallback
 *   API garbage        → static fallback
 *   Cache hit          → instant response
 */

const SYNTHETIC_API_URL = "https://api.synthetic.new/v1/chat/completions";
const TIMEOUT_MS = 5000;

const DASH_SYSTEM_PROMPT = `You are Dash, a hype-beast car mascot helping teens study for their driving test.
The user just answered a question wrong. Explain why they're wrong in 2-3 sentences.
Be ultra-casual, Gen Z, friendly. Never say "incorrect" or "wrong" — say "nah", "oof", or "close but".
Use at most one emoji. No exclamation marks after bad news.
Start by acknowledging their choice, then explain the right answer with a memorable hook.`;

const hashQuestionId = (id: string): number =>
  parseInt(id.replace(/\D/g, "").slice(0, 8), 10) || 0;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Require auth — AI calls cost credits; unauth = free abuse vector
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Two-tier rate limit. Run both in parallel; if either fails, return 429
    // with the larger retry-after (strictest tier wins).
    const id = getIdentifier(request, user.id);
    const [minuteRes, hourRes] = await Promise.all([
      rlExplainMinute.limit(id),
      rlExplainHour.limit(id),
    ]);
    if (!minuteRes.success || !hourRes.success) {
      const retryAfter = Math.max(minuteRes.retryAfter, hourRes.retryAfter);
      return NextResponse.json(
        { error: "Too many requests. Try again soon." },
        { status: 429, headers: rateLimitHeaders(retryAfter) }
      );
    }

    const { questionId, selectedAnswerIndex } = await request.json();

    if (!questionId || selectedAnswerIndex === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const numericQuestionId = Number(questionId);
    const selectedIndex = Number(selectedAnswerIndex);
    if (
      !Number.isInteger(numericQuestionId) ||
      !Number.isInteger(selectedIndex) ||
      selectedIndex < 0 ||
      selectedIndex > 3
    ) {
      return NextResponse.json({ error: "Invalid question or answer" }, { status: 400 });
    }

    const canonicalQuestion = illinoisDMVQuestions.find(
      (question) => hashQuestionId(question.id) === numericQuestionId
    );

    if (!canonicalQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (selectedIndex === canonicalQuestion.correct_answer) {
      return NextResponse.json({ error: "Explanation is only available for missed answers" }, { status: 400 });
    }

    const questionText = canonicalQuestion.question_text;
    const selectedAnswerText = canonicalQuestion.options[selectedIndex];
    const correctAnswerText = canonicalQuestion.options[canonicalQuestion.correct_answer];
    const staticExplanation = canonicalQuestion.explanation;

    // Check cache first
    const { data: cached } = await supabase
      .from("ai_explanations")
      .select("explanation")
      .eq("question_id", numericQuestionId)
      .eq("wrong_answer_index", selectedIndex)
      .maybeSingle();

    if (cached) {
      return NextResponse.json({ explanation: cached.explanation, source: "cache" });
    }

    // Call synthetic.new API
    const apiKey = process.env.SYNTHETIC_API_KEY;
    if (!apiKey) {
      // No API key configured — use static explanation
      return NextResponse.json({ explanation: staticExplanation || "Check the explanation above for the correct answer.", source: "static" });
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(SYNTHETIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "synthetic-small",
          messages: [
            { role: "system", content: DASH_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Question: ${questionText}\nThey picked: ${selectedAnswerText}\nCorrect answer: ${correctAnswerText}`,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const explanation = data.choices?.[0]?.message?.content?.trim();

      if (!explanation || explanation.length < 10) {
        throw new Error("Empty or invalid response from API");
      }

      // Cache the result via service-role client. The authenticated-role
      // INSERT/UPDATE policies on ai_explanations were dropped in migration
      // 006 (cache poisoning vector). Reads still go through the user client.
      try {
        const admin = createAdminClient();
        await admin.from("ai_explanations").upsert({
          question_id: numericQuestionId,
          wrong_answer_index: selectedIndex,
          explanation,
        }, { onConflict: "question_id,wrong_answer_index" });
      } catch (cacheErr) {
        // Cache write is best-effort — don't fail the response.
        console.error("ai_explanations cache write failed:", cacheErr);
      }

      return NextResponse.json({ explanation, source: "ai" });
    } catch (err) {
      // API failed — fall back to static explanation
      console.error("synthetic.new API error:", err);
      return NextResponse.json({
        explanation: staticExplanation || "Check the explanation above for the correct answer.",
        source: "static_fallback",
      });
    }
  } catch (error) {
    console.error("Error in explain API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
