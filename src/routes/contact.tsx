import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { meta, PageHero } from "@/components/Site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/lib/contact-schema";
import { submitContact } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => meta("Contact — Noble Corporation plc", "Send an inquiry and find contact details and offices for Noble Corporation plc."),
  component: Contact,
});

const CONTACT_EMAIL = "noblecoperationplc@noblecorporationplc.info";

const cards: [string, string, string?][] = [
  ["Principal executive office", "2101 CityWest Boulevard, Suite 600\nHouston, Texas 77042, USA"],
  ["Email", CONTACT_EMAIL, `mailto:${CONTACT_EMAIL}`],
  ["UK registration", "Noble Corporation plc\nCompany No. 12958050 · Incorporated Oct 16, 2020"],
];

function Contact() {
  const submit = useServerFn(submitContact);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const parsed = contactSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const result = await submit({ data: parsed.data });
      if (result.saved) {
        setSaved(true);
        form.reset();
      }
    } catch {
      setError("Your message could not be saved. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch.">Always verify any person, job offer, contract or payment request claiming to represent Noble.</PageHero>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pt-16 md:grid-cols-[1fr_1.5fr]">
        <div>
          <p className="eyebrow">Inquiries</p>
          <h2 className="mt-4 text-3xl">Send a message.</h2>
        </div>
        {saved ? (
          <div role="status" className="py-6">
            <CheckCircle2 className="mb-4 size-8 text-primary" />
            <h3 className="text-2xl">Thank you for getting in touch.</h3>
            <p className="mt-3 text-muted-foreground">Your inquiry has been received.</p>
            <Button variant="outline" className="mt-6" onClick={() => setSaved(false)}>Send another message</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <fieldset disabled={pending} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-2 text-sm font-semibold" htmlFor="contact-name">Name
                  <Input id="contact-name" name="name" autoComplete="name" required maxLength={100} className="h-11" />
                </label>
                <label className="block space-y-2 text-sm font-semibold" htmlFor="contact-email">Email
                  <Input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={255} className="h-11" />
                </label>
              </div>
              <label className="block space-y-2 text-sm font-semibold" htmlFor="contact-subject">Subject
                <Input id="contact-subject" name="subject" required maxLength={150} className="h-11" />
              </label>
              <label className="block space-y-2 text-sm font-semibold" htmlFor="contact-message">Message
                <Textarea id="contact-message" name="message" required maxLength={5000} rows={6} className="resize-y" />
              </label>
              <div hidden aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <Input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
            </fieldset>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              {pending ? "Submitting…" : "Submit inquiry"}
            </Button>
          </form>
        )}
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3">
        {cards.map(([t, b, href]) => (
          <div key={t} className="rounded border border-border bg-card p-8">
            <p className="eyebrow">{t}</p>
            {href ? (
              <p className="mt-4 text-sm leading-relaxed">
                <a className="underline decoration-accent underline-offset-4" href={href}>{b}</a>
              </p>
            ) : (
              <p className="mt-4 whitespace-pre-line text-lg">{b}</p>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
