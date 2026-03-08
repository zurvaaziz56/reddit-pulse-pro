
-- Allow service role to insert/delete insights and reddit_posts
-- These are managed by edge functions using service role key, so RLS doesn't block them.
-- But we need permissive policies for the SELECT to work for authenticated users.
-- Current policies are RESTRICTIVE (not permissive), let's fix that.

-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can view insights for own keywords" ON public.insights;
CREATE POLICY "Users can view insights for own keywords" ON public.insights
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.keywords WHERE keywords.id = insights.keyword_id AND keywords.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view posts for own keywords" ON public.reddit_posts;
CREATE POLICY "Users can view posts for own keywords" ON public.reddit_posts
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.keywords WHERE keywords.id = reddit_posts.keyword_id AND keywords.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view own keywords" ON public.keywords;
CREATE POLICY "Users can view own keywords" ON public.keywords
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own keywords" ON public.keywords;
CREATE POLICY "Users can insert own keywords" ON public.keywords
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own keywords" ON public.keywords;
CREATE POLICY "Users can delete own keywords" ON public.keywords
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
