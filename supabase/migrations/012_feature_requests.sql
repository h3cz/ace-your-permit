-- ============================================
-- Feature Requests / Suggestions
-- Migration: 012_feature_requests
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'feature',
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT feature_requests_category_check CHECK (
    category IN ('feature', 'question', 'bug', 'pwa', 'polish', 'other')
  ),
  CONSTRAINT feature_requests_status_check CHECK (
    status IN ('new', 'reviewing', 'planned', 'shipped', 'closed')
  ),
  CONSTRAINT feature_requests_title_length_check CHECK (
    char_length(trim(title)) BETWEEN 3 AND 120
  ),
  CONSTRAINT feature_requests_details_length_check CHECK (
    char_length(trim(details)) BETWEEN 10 AND 2000
  )
);

COMMENT ON TABLE public.feature_requests IS 'Authenticated user suggestions and feature requests.';

ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own feature requests" ON public.feature_requests;
CREATE POLICY "Users can view own feature requests"
  ON public.feature_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own feature requests" ON public.feature_requests;
CREATE POLICY "Users can create own feature requests"
  ON public.feature_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_feature_requests_updated_at ON public.feature_requests;
CREATE TRIGGER update_feature_requests_updated_at
  BEFORE UPDATE ON public.feature_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

GRANT SELECT, INSERT ON public.feature_requests TO authenticated;
