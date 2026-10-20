ALTER POLICY "Visitors can submit contact inquiries"
ON public.contact_submissions
TO anon
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100
  AND char_length(email) BETWEEN 3 AND 255
  AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  AND char_length(btrim(subject)) BETWEEN 1 AND 150
  AND char_length(btrim(message)) BETWEEN 1 AND 5000
);