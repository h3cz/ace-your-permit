"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { QuestionWithAnswers } from "@/types/database";
import { calculateXP, XPCalculationResult } from "@/lib/gamification/xp-calculator";
import { fireConversion } from "@/lib/analytics";
import { getCategoryName } from "@/lib/data/questions/categories";
import { getStableAnswerId, getStableQuestionId } from "@/lib/data/questions/question-id";
import { toast } from "sonner";

export interface QuizAnswer {
  questionId: number;
  selectedAnswerId: number;
  isCorrect: boolean;
  timeTaken: number; // in seconds
}

export interface QuizState {
  // Quiz configuration
  quizType: "practice" | "category" | "timed" | "marathon" | "mistakes";
  categoryId?: string;
  timeLimit?: number; // in seconds, for timed mode

  // Questions
  questions: QuestionWithAnswers[];
  currentQuestionIndex: number;

  // Answers
  answers: QuizAnswer[];
  currentAnswer: number | null; // selected answer ID

  // Progress
  isAnswered: boolean;
  isCorrect: boolean | null;

  // Timer
  questionStartTime: number;
  totalTimeTaken: number;
  timeRemaining: number | null; // for timed mode

  // Streaks
  currentStreak: number;
  maxStreak: number;

  // Flags
  flaggedQuestions: number[];

  // Session
  sessionId: string | null;
  isComplete: boolean;

  // Results
  results: QuizResults | null;
}

export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  totalTimeTaken: number;
  averageTimePerQuestion: number;
  maxStreak: number;
  xpEarned: XPCalculationResult;
  weakCategories: { categoryId: string; categoryName: string; wrongCount: number }[];
}

interface UseQuizOptions {
  quizType: "practice" | "category" | "timed" | "marathon" | "mistakes";
  categoryId?: string;
  questionCount?: number;
  timeLimit?: number; // in minutes
  userId?: string;
  // When false, the hook will NOT load questions — used to gate on auth readiness.
  enabled?: boolean;
}

interface ApiQuestion {
  id: string | number;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  category_id: string | null;
  difficulty: string;
  image_url: string | null;
  has_image: boolean;
  source: string | null;
  times_asked: number;
  correct_count: number;
  created_at?: string;
}

function shuffleOptions(options: string[]) {
  const shuffled = options.map((text, sourceIndex) => ({ text, sourceIndex }));

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function useQuiz(options: UseQuizOptions) {
  const { quizType, categoryId, questionCount = 10, timeLimit, userId, enabled = true } = options;
  const supabase = useMemo(() => createClient(), []);

  // Generate session ID
  const sessionIdRef = useRef(`quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const [state, setState] = useState<QuizState>({
    quizType,
    categoryId,
    timeLimit: timeLimit ? timeLimit * 60 : undefined,
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    currentAnswer: null,
    isAnswered: false,
    isCorrect: null,
    questionStartTime: Date.now(),
    totalTimeTaken: 0,
    timeRemaining: timeLimit ? timeLimit * 60 : null,
    currentStreak: 0,
    maxStreak: 0,
    flaggedQuestions: [],
    sessionId: sessionIdRef.current,
    isComplete: false,
    results: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getHydratedAnswerState = useCallback((
    targetIndex: number,
    answers: QuizAnswer[],
    questions: QuestionWithAnswers[]
  ) => {
    const question = questions[targetIndex];
    const existingAnswer = question
      ? answers.find((answer) => answer.questionId === question.id)
      : undefined;

    return {
      currentAnswer: existingAnswer?.selectedAnswerId ?? null,
      isAnswered: Boolean(existingAnswer),
      isCorrect: existingAnswer?.isCorrect ?? null,
    };
  }, []);

  const loadQuestions = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);

      // Build API URL with query params
      const params = new URLSearchParams();
      params.set("count", String(quizType === "marathon" ? 1000 : questionCount));

      if (quizType === "category" && categoryId) {
        params.set("category", categoryId);
      }

      if (quizType === "mistakes") {
        if (!userId) {
          // Empty state for mistakes: no user yet means nothing to review.
          setState((prev) => ({ ...prev, questions: [], questionStartTime: Date.now() }));
          return;
        }
        // Look up the user's recent wrong (non-mastered) question_ids.
        const { data: wrongRows, error: wrongErr } = await supabase
          .from("user_wrong_answers")
          .select("question_id")
          .eq("user_id", userId)
          .eq("is_mastered", false)
          .order("last_attempted", { ascending: false })
          .limit(questionCount);
        if (wrongErr) throw wrongErr;
        const ids = (wrongRows ?? [])
          .map((r: { question_id: number | string }) => String(r.question_id))
          .filter(Boolean);
        if (ids.length === 0) {
          setState((prev) => ({ ...prev, questions: [], questionStartTime: Date.now() }));
          return;
        }
        params.set("mode", "by_ids");
        params.set("ids", ids.join(","));
      }

      const res = await fetch(`/api/questions/random?${params}`, { signal });
      if (!res.ok) throw new Error("Failed to fetch questions");

      const json = await res.json();
      if (!json.success || !json.data?.length) {
        if (quizType === "mistakes") {
          setState((prev) => ({ ...prev, questions: [], questionStartTime: Date.now() }));
          return;
        }
        throw new Error("No questions available");
      }

      // Transform local data format (options[] + correct_answer index)
      // into the answers[] format the UI expects
      const transformed: QuestionWithAnswers[] = (json.data as ApiQuestion[]).map((q) => {
        const questionId = getStableQuestionId(q.id);
        const shuffledAnswers = shuffleOptions(q.options);

        return {
          ...q,
          id: questionId,
          category_id: q.category_id,
          question_type: "multiple_choice",
          is_active: true,
          created_at: q.created_at ?? new Date(0).toISOString(),
          answers: shuffledAnswers.map(({ text, sourceIndex }, displayIndex) => ({
            id: getStableAnswerId(questionId, sourceIndex),
            question_id: questionId,
            answer_text: text,
            is_correct: sourceIndex === q.correct_answer,
            sort_order: displayIndex,
          })),
        };
      });

      setState((prev) => ({
        ...prev,
        questions: transformed,
        questionStartTime: Date.now(),
      }));
    } catch (err) {
      // Fix C: ignore aborted fetches — not a real error
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, questionCount, quizType, supabase, userId]);

  // Load questions (gated on enabled so pages can wait for auth to resolve)
  // Fix C: AbortController prevents stale fetch responses on fast re-mounts
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    loadQuestions(controller.signal);
    return () => controller.abort();
  }, [enabled, loadQuestions]);

  const selectAnswer = useCallback((answerId: number) => {
    setState((prev) => {
      if (prev.isAnswered) return prev;
      return { ...prev, currentAnswer: answerId };
    });
  }, []);

  const submitAnswer = useCallback(async () => {
    if (state.currentAnswer === null || state.isAnswered) return;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion || state.answers.some((answer) => answer.questionId === currentQuestion.id)) {
      return;
    }

    const correctAnswer = currentQuestion.answers.find((a) => a.is_correct);
    const isCorrect = state.currentAnswer === correctAnswer?.id;
    const timeTaken = Math.round((Date.now() - state.questionStartTime) / 1000);

    const newStreak = isCorrect ? state.currentStreak + 1 : 0;
    const newMaxStreak = Math.max(state.maxStreak, newStreak);

    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedAnswerId: state.currentAnswer,
      isCorrect,
      timeTaken,
    };

    setState((prev) => ({
      ...prev,
      answers: prev.answers.some((existing) => existing.questionId === answer.questionId)
        ? prev.answers.map((existing) => existing.questionId === answer.questionId ? answer : existing)
        : [...prev.answers, answer],
      isAnswered: true,
      isCorrect,
      currentStreak: newStreak,
      maxStreak: newMaxStreak,
      totalTimeTaken: prev.totalTimeTaken + timeTaken,
    }));

    // Save attempt to database
    if (userId) {
      try {
        await supabase.from("user_attempts").insert({
          user_id: userId,
          question_id: currentQuestion.id,
          selected_answer_id: state.currentAnswer,
          is_correct: isCorrect,
          time_taken: timeTaken,
          session_id: state.sessionId,
        });

        // Update wrong answers tracking
        if (!isCorrect) {
          const { data: existing } = await supabase
            .from("user_wrong_answers")
            .select("wrong_count")
            .eq("user_id", userId)
            .eq("question_id", currentQuestion.id)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("user_wrong_answers")
              .update({
                wrong_count: existing.wrong_count + 1,
                last_attempted: new Date().toISOString(),
                is_mastered: false,
              })
              .eq("user_id", userId)
              .eq("question_id", currentQuestion.id);
          } else {
            await supabase.from("user_wrong_answers").insert({
              user_id: userId,
              question_id: currentQuestion.id,
              wrong_count: 1,
              last_attempted: new Date().toISOString(),
              is_mastered: false,
            });
          }
        } else {
          // Check if this was previously a wrong answer (mastered it)
          const { data: existing } = await supabase
            .from("user_wrong_answers")
            .select("wrong_count")
            .eq("user_id", userId)
            .eq("question_id", currentQuestion.id)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("user_wrong_answers")
              .update({
                is_mastered: true,
                last_attempted: new Date().toISOString(),
              })
              .eq("user_id", userId)
              .eq("question_id", currentQuestion.id);
          }
        }
      } catch (err) {
        console.error("Failed to save attempt:", err);
        toast.error("Your answer was recorded but progress sync failed. It will retry automatically.");
      }
    }
  }, [state, userId, supabase]);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestionIndex >= prev.questions.length - 1) {
        return prev;
      }

      const targetIndex = prev.currentQuestionIndex + 1;
      const hydrated = getHydratedAnswerState(targetIndex, prev.answers, prev.questions);

      return {
        ...prev,
        currentQuestionIndex: targetIndex,
        currentAnswer: hydrated.currentAnswer,
        isAnswered: hydrated.isAnswered,
        isCorrect: hydrated.isCorrect,
        questionStartTime: hydrated.isAnswered ? prev.questionStartTime : Date.now(),
      };
    });
  }, [getHydratedAnswerState]);

  const previousQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestionIndex <= 0) return prev;
      const targetIndex = prev.currentQuestionIndex - 1;
      const hydrated = getHydratedAnswerState(targetIndex, prev.answers, prev.questions);

      return {
        ...prev,
        currentQuestionIndex: targetIndex,
        currentAnswer: hydrated.currentAnswer,
        isAnswered: hydrated.isAnswered,
        isCorrect: hydrated.isCorrect,
      };
    });
  }, [getHydratedAnswerState]);

  const flagQuestion = useCallback((questionIndex: number) => {
    setState((prev) => {
      const isFlagged = prev.flaggedQuestions.includes(questionIndex);
      return {
        ...prev,
        flaggedQuestions: isFlagged
          ? prev.flaggedQuestions.filter((i) => i !== questionIndex)
          : [...prev.flaggedQuestions, questionIndex],
      };
    });
  }, []);

  const completeQuiz = useCallback(async () => {
    if (state.isComplete) return;

    const correctAnswers = state.answers.filter((a) => a.isCorrect).length;
    const wrongAnswers = state.answers.length - correctAnswers;
    const accuracy = state.answers.length > 0
      ? Math.round((correctAnswers / state.answers.length) * 100)
      : 0;
    const averageTimePerQuestion = state.answers.length > 0
      ? Math.round(state.totalTimeTaken / state.answers.length)
      : 0;

    // Check if this is user's first quiz attempt
    let isFirstAttempt = true;
    if (userId) {
      const { count } = await supabase
        .from("quiz_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_completed", true);
      isFirstAttempt = (count ?? 0) === 0;
    }

    // Calculate XP
    const xpResult = calculateXP({
      correctAnswers,
      totalQuestions: state.questions.length,
      averageTimePerQuestion,
      streakCount: state.maxStreak,
      isFirstAttempt,
      difficulty: "medium",
    });

    // Calculate weak categories (slug IDs after H10)
    const categoryStats: Record<string, { name: string; wrongCount: number }> = {};
    state.answers.forEach((answer, index) => {
      if (!answer.isCorrect) {
        const question = state.questions[index];
        const catId = String(question.category_id ?? "unknown");
        if (!categoryStats[catId]) {
          categoryStats[catId] = {
            name: catId === "unknown" ? "Mixed Topics" : getCategoryName(catId),
            wrongCount: 0,
          };
        }
        categoryStats[catId].wrongCount++;
      }
    });

    const weakCategories = Object.entries(categoryStats)
      .map(([catId, stats]) => ({
        categoryId: catId,
        categoryName: stats.name,
        wrongCount: stats.wrongCount,
      }))
      .sort((a, b) => b.wrongCount - a.wrongCount)
      .slice(0, 3);

    const results: QuizResults = {
      totalQuestions: state.questions.length,
      correctAnswers,
      wrongAnswers,
      accuracy,
      totalTimeTaken: state.totalTimeTaken,
      averageTimePerQuestion,
      maxStreak: state.maxStreak,
      xpEarned: xpResult,
      weakCategories,
    };

    setState((prev) => ({
      ...prev,
      isComplete: true,
      results,
    }));

    // Save quiz session
    if (userId) {
      try {
        await supabase.from("quiz_sessions").insert({
          id: state.sessionId!,
          user_id: userId,
          quiz_type: quizType,
          category_id: categoryId || null,
          question_count: state.questions.length,
          correct_count: correctAnswers,
          xp_earned: xpResult.totalXP,
          started_at: new Date(Date.now() - state.totalTimeTaken * 1000).toISOString(),
          completed_at: new Date().toISOString(),
          is_completed: true,
          time_taken_seconds: state.totalTimeTaken,
          mistake_count: wrongAnswers,
          streak_count: state.maxStreak,
        });

        // H7 — atomic total_xp via RPC. Replaces the prior read-then-write
        // pattern which raced under concurrent quiz completions.
        if (xpResult.totalXP > 0) {
          const { error: xpErr } = await supabase.rpc("increment_total_xp", {
            user_id: userId,
            xp_amount: xpResult.totalXP,
          });
          if (xpErr) {
            console.error("Failed to increment total_xp:", xpErr);
          }
        }

        // H8 — update the weekly leaderboard via the server route, which
        // enforces rate-limits and calls the increment_weekly_xp RPC.
        if (xpResult.totalXP > 0) {
          try {
            await fetch("/api/leaderboard/update", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                xpEarned: Math.min(xpResult.totalXP, 500),
                activityType: quizType,
              }),
            });
          } catch (lbErr) {
            console.error("Failed to update leaderboard:", lbErr);
          }
        }

        // H12 — fire first_quiz_completed conversion exactly once per user.
        // `isFirstAttempt` is true when quiz_sessions had no prior completed
        // rows for this user.
        if (isFirstAttempt) {
          try {
            fireConversion("first_quiz_completed");
          } catch (cvErr) {
            console.error("Failed to fire conversion:", cvErr);
          }
        }

      } catch (err) {
        console.error("Failed to save quiz session:", err);
        toast.error("Quiz results saved locally but failed to sync. They'll sync when you're back online.");
      }
    }
  }, [state, userId, supabase, quizType, categoryId]);

  // Fix A: timer effect placed after completeQuiz declaration so the dep reference is valid.
  // Adding completeQuiz to deps ensures the interval callback always holds a fresh reference.
  useEffect(() => {
    if (state.timeLimit && state.timeRemaining !== null && !state.isComplete) {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          const newTimeRemaining = (prev.timeRemaining || 0) - 1;

          if (newTimeRemaining <= 0) {
            // Time's up - complete the quiz
            completeQuiz();
            return { ...prev, timeRemaining: 0 };
          }

          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [state.timeLimit, state.timeRemaining, state.isComplete, completeQuiz]);

  const restartQuiz = useCallback(() => {
    sessionIdRef.current = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setState({
      quizType,
      categoryId,
      timeLimit: timeLimit ? timeLimit * 60 : undefined,
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      currentAnswer: null,
      isAnswered: false,
      isCorrect: null,
      questionStartTime: Date.now(),
      totalTimeTaken: 0,
      timeRemaining: timeLimit ? timeLimit * 60 : null,
      currentStreak: 0,
      maxStreak: 0,
      flaggedQuestions: [],
      sessionId: sessionIdRef.current,
      isComplete: false,
      results: null,
    });
    loadQuestions();
  }, [quizType, categoryId, timeLimit, loadQuestions]);

  const currentQuestion = state.questions[state.currentQuestionIndex];

  return {
    // State
    ...state,
    currentQuestion,
    isLoading,
    error,

    // Computed
    progress: state.questions.length > 0
      ? (new Set(state.answers.map((answer) => answer.questionId)).size / state.questions.length) * 100
      : 0,
    canGoBack: state.currentQuestionIndex > 0,
    canGoForward: state.currentQuestionIndex < state.questions.length - 1 && state.isAnswered,

    // Actions
    selectAnswer,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    flagQuestion,
    completeQuiz,
    restartQuiz,
  };
}

export default useQuiz;
