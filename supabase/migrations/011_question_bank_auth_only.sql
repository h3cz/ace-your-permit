-- ============================================
-- Question bank auth-only access
-- Migration: 011_question_bank_auth_only
--
-- The original question-bank policy allowed anonymous users to select full
-- question rows, including answer indexes and explanations. API routes already
-- require auth; this migration aligns direct Supabase access with that model.
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'questions'
  ) THEN
    ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;
    DROP POLICY IF EXISTS "Questions are viewable by authenticated users" ON public.questions;

    CREATE POLICY "Questions are viewable by authenticated users"
      ON public.questions
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Helper functions return full question rows, so only authenticated users should
-- execute them. Some environments were seeded from the local file bank and do
-- not have these DB helper functions, so guard each grant by existence.
DO $$
BEGIN
  IF to_regprocedure('public.get_random_questions(integer, text, text)') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.get_random_questions(integer, text, text) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.get_random_questions(integer, text, text) TO authenticated;
  END IF;

  IF to_regprocedure('public.get_questions_by_difficulty_distribution(integer, integer, integer)') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.get_questions_by_difficulty_distribution(integer, integer, integer) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.get_questions_by_difficulty_distribution(integer, integer, integer) TO authenticated;
  END IF;
END $$;
