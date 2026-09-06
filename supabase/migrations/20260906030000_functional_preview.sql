-- Retain existing data; one Reddit post can belong to several independent keywords.
ALTER TABLE public.reddit_posts DROP CONSTRAINT reddit_posts_post_id_key;
ALTER TABLE public.reddit_posts ADD CONSTRAINT reddit_posts_keyword_post_key UNIQUE (keyword_id, post_id);
ALTER TABLE public.reddit_posts ADD COLUMN body text NOT NULL DEFAULT '';
ALTER TABLE public.insights ADD COLUMN source_urls text[] NOT NULL DEFAULT '{}';

-- Billing fields must never be writable through a user's profile endpoint.
REVOKE INSERT, UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;

CREATE FUNCTION public.enforce_keyword_quota() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_plan text; keyword_limit integer;
BEGIN
  NEW.keyword := btrim(NEW.keyword);
  IF length(NEW.keyword) < 2 OR length(NEW.keyword) > 100 THEN
    RAISE EXCEPTION 'Keywords must be between 2 and 100 characters';
  END IF;
  -- Lock one owner row to serialize concurrent inserts.
  SELECT plan INTO current_plan FROM public.profiles WHERE user_id = NEW.user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  keyword_limit := CASE current_plan WHEN 'pro' THEN 10 WHEN 'agency' THEN 50 ELSE 3 END;
  IF (SELECT count(*) FROM public.keywords WHERE user_id = NEW.user_id) >= keyword_limit THEN
    RAISE EXCEPTION 'Keyword limit reached';
  END IF;
  IF EXISTS (SELECT 1 FROM public.keywords WHERE user_id = NEW.user_id AND lower(btrim(keyword)) = lower(NEW.keyword)) THEN
    RAISE EXCEPTION 'This keyword is already tracked';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER enforce_keyword_quota BEFORE INSERT ON public.keywords FOR EACH ROW EXECUTE FUNCTION public.enforce_keyword_quota();

CREATE TABLE public.processing_limits (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('fetch', 'insights')),
  usage_day date NOT NULL DEFAULT current_date,
  runs integer NOT NULL DEFAULT 0,
  next_run_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, action)
);
ALTER TABLE public.processing_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.processing_limits FROM anon, authenticated;
CREATE FUNCTION public.claim_processing_run(owner_id uuid, run_action text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE claimed boolean;
BEGIN
  INSERT INTO public.processing_limits(user_id, action, runs, next_run_at)
  VALUES (owner_id, run_action, 1, now() + interval '60 seconds')
  ON CONFLICT(user_id, action) DO UPDATE SET
    runs = CASE WHEN processing_limits.usage_day = current_date THEN processing_limits.runs + 1 ELSE 1 END,
    usage_day = current_date, next_run_at = now() + interval '60 seconds'
  WHERE processing_limits.next_run_at <= now() AND (processing_limits.usage_day <> current_date OR processing_limits.runs < 30)
  RETURNING true INTO claimed;
  RETURN coalesce(claimed, false);
END $$;
REVOKE ALL ON FUNCTION public.claim_processing_run(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_processing_run(uuid, text) TO service_role;

CREATE FUNCTION public.replace_keyword_insights(target_keyword uuid, findings jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Serialize replacement for this keyword and roll back the delete if any insert fails.
  PERFORM id FROM public.keywords WHERE id = target_keyword FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Keyword not found'; END IF;
  IF jsonb_typeof(findings) <> 'array' OR jsonb_array_length(findings) NOT BETWEEN 1 AND 20 THEN RAISE EXCEPTION 'Invalid findings'; END IF;
  DELETE FROM public.insights WHERE keyword_id = target_keyword;
  INSERT INTO public.insights(keyword_id, type, content, source_urls)
  SELECT target_keyword, (item->>'type')::public.insight_type, item->>'content',
    ARRAY(SELECT jsonb_array_elements_text(item->'source_urls'))
  FROM jsonb_array_elements(findings) item;
END $$;
REVOKE ALL ON FUNCTION public.replace_keyword_insights(uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_keyword_insights(uuid, jsonb) TO service_role;
