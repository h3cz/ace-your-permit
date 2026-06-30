import crypto from "crypto";

export function safeCompareSecret(provided: string | null | undefined, expected: string | null | undefined): boolean {
  if (!provided || !expected) return false;

  const providedHash = crypto.createHash("sha256").update(provided).digest();
  const expectedHash = crypto.createHash("sha256").update(expected).digest();

  return crypto.timingSafeEqual(providedHash, expectedHash);
}

export function hasValidBearerSecret(authHeader: string | null, expectedSecret: string | undefined): boolean {
  const match = authHeader?.match(/^Bearer\s+(.+)$/i);
  return safeCompareSecret(match?.[1], expectedSecret);
}

export function hasValidAdminKey(headerValue: string | null, expectedSecret: string | undefined): boolean {
  return safeCompareSecret(headerValue, expectedSecret);
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeHeaderText(value: unknown): string {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 120);
}
