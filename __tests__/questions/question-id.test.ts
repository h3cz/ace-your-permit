import { describe, expect, it } from "vitest";
import { illinoisDMVQuestions } from "@/lib/data/questions/illinois-dmv-questions";
import {
  getLegacyQuestionId,
  getStableAnswerId,
  getStableQuestionId,
} from "@/lib/data/questions/question-id";

describe("question id helpers", () => {
  it("does not collapse local question slugs across categories", () => {
    const stableIds = illinoisDMVQuestions.map((question) =>
      getStableQuestionId(question.id)
    );
    const legacyIds = illinoisDMVQuestions.map((question) =>
      getLegacyQuestionId(question.id)
    );

    expect(new Set(stableIds).size).toBe(illinoisDMVQuestions.length);
    expect(new Set(legacyIds).size).toBeLessThan(illinoisDMVQuestions.length);
  });

  it("keeps generated answer ids inside signed int32 range", () => {
    for (const question of illinoisDMVQuestions) {
      const questionId = getStableQuestionId(question.id);

      for (let index = 0; index < question.options.length; index++) {
        const answerId = getStableAnswerId(questionId, index);
        expect(answerId).toBeGreaterThan(0);
        expect(answerId).toBeLessThanOrEqual(2_147_483_647);
      }
    }
  });
});
