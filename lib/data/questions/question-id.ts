const MAX_QUESTION_ID = 200_000_000;

/**
 * Stable numeric id for local question-bank slugs.
 *
 * The local bank uses string IDs like "il-ts-001". Parsing digits collapses
 * IDs across categories, so we use a compact FNV-1a hash that still leaves
 * room for answer ids (`questionId * 10 + optionIndex`) inside int32 range.
 */
export function getStableQuestionId(rawId: string | number): number {
  if (typeof rawId === "number" && Number.isFinite(rawId)) {
    return Math.max(1, Math.trunc(rawId));
  }

  const id = String(rawId);
  let hash = 0x811c9dc5;

  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0) % MAX_QUESTION_ID + 1;
}

/**
 * Legacy parser used by older attempts/wrong-answer rows. Keep this around
 * only for backwards-compatible lookups in Mistakes Mode.
 */
export function getLegacyQuestionId(rawId: string | number): number {
  if (typeof rawId === "number" && Number.isFinite(rawId)) {
    return Math.trunc(rawId);
  }

  return parseInt(String(rawId).replace(/\D/g, "").slice(0, 8), 10) || 0;
}

export function getStableAnswerId(questionId: number, sourceIndex: number): number {
  return questionId * 10 + sourceIndex;
}
