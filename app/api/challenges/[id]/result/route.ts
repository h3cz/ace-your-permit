import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getIdentifier,
  getRateLimiter,
  rateLimitHeaders,
} from "@/lib/ratelimit";

/**
 * POST /api/challenges/[id]/result — Submit challenge result
 *
 * Records the user's score for this challenge.
 * Awards XP to participants (bonus to winner when both have submitted).
 * UNIQUE constraint on (challenge_id, user_id) prevents double submission.
 */
const rlChallengeResult = getRateLimiter("challenges:result", 30, 60 * 60);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success, retryAfter } = await rlChallengeResult.limit(
      getIdentifier(request, user.id)
    );
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Try again soon." },
        { status: 429, headers: rateLimitHeaders(retryAfter) }
      );
    }

    const { score, correctCount, totalQuestions, timeTakenSeconds } = await request.json();

    // Validate
    if (
      typeof score !== "number" ||
      typeof correctCount !== "number" ||
      typeof totalQuestions !== "number" ||
      !Number.isInteger(score) ||
      !Number.isInteger(correctCount) ||
      !Number.isInteger(totalQuestions) ||
      correctCount < 0 ||
      totalQuestions <= 0 ||
      correctCount > totalQuestions ||
      score < 0 ||
      score > 100 ||
      Math.round((correctCount / totalQuestions) * 100) !== score ||
      (
        timeTakenSeconds !== undefined &&
        timeTakenSeconds !== null &&
        (!Number.isInteger(timeTakenSeconds) || timeTakenSeconds < 0 || timeTakenSeconds > 24 * 60 * 60)
      )
    ) {
      return NextResponse.json({ error: "Invalid result data" }, { status: 400 });
    }

    // Check challenge exists and isn't expired
    const { data: challenge } = await supabase
      .from("challenges")
      .select("id, status, expires_at, question_ids")
      .eq("id", id)
      .maybeSingle();

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    if (new Date(challenge.expires_at) < new Date()) {
      return NextResponse.json({ error: "Challenge expired" }, { status: 410 });
    }

    if (challenge.status !== "open") {
      return NextResponse.json({ error: "Challenge is not accepting results" }, { status: 409 });
    }

    if (totalQuestions !== challenge.question_ids.length) {
      return NextResponse.json({ error: "Invalid result data" }, { status: 400 });
    }

    // Submit result (UNIQUE constraint handles double-submit)
    const { data: result, error: insertError } = await supabase
      .from("challenge_results")
      .insert({
        challenge_id: id,
        user_id: user.id,
        score,
        correct_count: correctCount,
        total_questions: totalQuestions,
        time_taken_seconds: timeTakenSeconds || null,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "Already submitted" }, { status: 409 });
      }
      console.error("Error submitting result:", insertError);
      return NextResponse.json({ error: "Failed to submit result" }, { status: 500 });
    }

    // Check if both players have submitted → mark challenge completed
    const { data: allResults } = await supabase
      .from("challenge_results")
      .select("user_id, score")
      .eq("challenge_id", id);

    if (allResults && allResults.length >= 2) {
      await supabase
        .from("challenges")
        .update({ status: "completed" })
        .eq("id", id);
    }

    // Award participation XP (25 XP for completing a challenge).
    const participationXP = 25;
    try {
      const { error: xpError } = await supabase.rpc("increment_total_xp", {
        user_id: user.id,
        xp_amount: participationXP,
      });
      if (xpError) {
        console.error("Failed to award challenge XP:", xpError);
      }
    } catch (xpErr) {
      console.error("Failed to award challenge XP:", xpErr);
    }

    return NextResponse.json({
      result,
      allResults: allResults || [],
      xpAwarded: participationXP,
    });
  } catch (error) {
    console.error("Error in challenge result API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
