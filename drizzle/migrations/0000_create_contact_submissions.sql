CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255 AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  subject text NOT NULL CHECK (char_length(btrim(subject)) BETWEEN 1 AND 150),
  message text NOT NULL CHECK (char_length(btrim(message)) BETWEEN 1 AND 5000)
);
GRANT INSERT (name, email, subject, message) ON public.contact_submissions TO anon;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can submit contact inquiries" ON public.contact_submissions FOR INSERT TO anon WITH CHECK (true);
COMMENT ON TABLE public.contact_submissions IS 'Contact inquiries; no visitor read, update, or delete access. Review through Lovable Cloud.';