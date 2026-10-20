import { createFileRoute } from "@tanstack/react-router";
import { meta, PageHero } from "@/components/Site";

export const Route = createFileRoute("/contact")({
  head: () => meta("Contact — Noble Corporation plc", "Contact details and offices for Noble Corporation plc."),
  component: Contact,
});

const cards = [
  ["Principal executive office", "2101 CityWest Boulevard, Suite 600\nHouston, Texas 77042, USA"],
  ["Investor relations", "Ian Macpherson, VP Investor Relations\nimacpherson@noblecorp.com"],
  ["UK registration", "Noble Corporation plc\nCompany No. 12958050 · Incorporated Oct 16, 2020"],
];

function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch.">Always verify any person, job offer, contract or payment request claiming to represent Noble.</PageHero>
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3">
        {cards.map(([t, b]) => (
          <div key={t} className="rounded border border-border bg-card p-8">
            <p className="eyebrow">{t}</p>
            <p className="mt-4 whitespace-pre-line text-lg">{b}</p>
          </div>
        ))}
      </section>
    </>
  );
}
