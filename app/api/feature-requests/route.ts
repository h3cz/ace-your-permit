import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getIdentifier,
  getRateLimiter,
  rateLimitHeaders,
} from "@/lib/ratelimit";

const TOO_MANY = { error: "Too many requests. Try again soon." };
const CATEGORIES = new Set(["feature", "question", "bug", "pwa", "polish", "other"]);

const rlList = getRateLimiter("feature_requests:list", 60, 60);
const rlCreate = getRateLimiter("feature_requests:create", 8, 60 * 60);

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
}

function validatePayload(body: unknown):
  | { ok: true; category: string; title: string; details: string }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Send a title and details." };
  }

  const record = body as Record<string, unknown>;
  const category = cleanText(record.category) || "feature";
  const title = cleanText(record.title);
  const details = cleanText(record.details);

  if (!CATEGORIES.has(category)) {
    return { ok: false, error: "Choose a valid category." };
  }

  if (title.length < 3 || title.length > 120) {
    return { ok: false, error: "Title must be 3-120 characters." };
  }

  if (details.length < 10 || details.length > 2000) {
    return { ok: false, error: "Details must be 10-2000 characters." };
  }

  return { ok: true, category, title, details };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success, retryAfter } = await rlList.limit(
      getIdentifier(request, user.id)
    );
    if (!success) {
      return NextResponse.json(TOO_MANY, {
        status: 429,
        headers: rateLimitHeaders(retryAfter),
      });
    }

    const { data, error } = await supabase
      .from("feature_requests")
      .select("id, category, title, details, status, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) {
      console.error("Error loading feature requests:", error);
      return NextResponse.json({ error: "Could not load suggestions." }, { status: 500 });
    }

    return NextResponse.json({ requests: data ?? [] });
  } catch (error) {
    console.error("Error in feature requests GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success, retryAfter } = await rlCreate.limit(
      getIdentifier(request, user.id)
    );
    if (!success) {
      return NextResponse.json(TOO_MANY, {
        status: 429,
        headers: rateLimitHeaders(retryAfter),
      });
    }

    const body = await request.json().catch(() => null);
    const payload = validatePayload(body);

    if (!payload.ok) {
      return NextResponse.json({ error: payload.error }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("feature_requests")
      .insert({
        user_id: user.id,
        category: payload.category,
        title: payload.title,
        details: payload.details,
      })
      .select("id, category, title, details, status, created_at, updated_at")
      .single();

    if (error) {
      console.error("Error creating feature request:", error);
      return NextResponse.json({ error: "Could not save suggestion." }, { status: 500 });
    }

    return NextResponse.json({ request: data }, { status: 201 });
  } catch (error) {
    console.error("Error in feature requests POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
