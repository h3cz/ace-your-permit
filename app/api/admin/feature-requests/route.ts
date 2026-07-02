import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasValidAdminKey } from "@/lib/security";

const STATUSES = new Set(["new", "reviewing", "planned", "shipped", "closed"]);

function isAdmin(request: NextRequest): boolean {
  return hasValidAdminKey(request.headers.get("x-admin-key"), process.env.ADMIN_API_KEY);
}

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").trim();
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const status = cleanText(searchParams.get("status"));

    let query = admin
      .from("feature_requests")
      .select("id, user_id, category, title, details, status, created_at, updated_at, profile:profiles(username, display_name)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (status && STATUSES.has(status)) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading admin feature requests:", error);
      return NextResponse.json({ error: "Could not load suggestions." }, { status: 500 });
    }

    return NextResponse.json({ requests: data ?? [] });
  } catch (error) {
    console.error("Error in admin feature requests GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const id = cleanText((body as Record<string, unknown> | null)?.id);
    const status = cleanText((body as Record<string, unknown> | null)?.status);

    if (!id || !STATUSES.has(status)) {
      return NextResponse.json({ error: "Send a valid id and status." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("feature_requests")
      .update({ status })
      .eq("id", id)
      .select("id, user_id, category, title, details, status, created_at, updated_at, profile:profiles(username, display_name)")
      .single();

    if (error) {
      console.error("Error updating feature request:", error);
      return NextResponse.json({ error: "Could not update suggestion." }, { status: 500 });
    }

    return NextResponse.json({ request: data });
  } catch (error) {
    console.error("Error in admin feature requests PATCH:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
