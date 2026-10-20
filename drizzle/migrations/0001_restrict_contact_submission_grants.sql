REVOKE ALL ON public.contact_submissions FROM anon, authenticated;
GRANT INSERT (name, email, subject, message) ON public.contact_submissions TO anon;
GRANT ALL ON public.contact_submissions TO service_role;