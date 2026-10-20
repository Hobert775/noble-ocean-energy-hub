import { createFileRoute } from "@tanstack/react-router";
import { meta, PageHero } from "@/components/Site";

export const Route = createFileRoute("/about")({
  head: () => meta("Company & Leadership — Noble Corporation plc", "Company profile, history and leadership of Noble Corporation plc."),
  component: About,
});

const profile = [
  ["Official name", "Noble Corporation plc"],
  ["Industry", "Offshore oil and gas drilling"],
  ["Established", "1921"],
  ["Incorporation", "England and Wales (2020)"],
  ["Exchange", "New York Stock Exchange — NE"],
  ["Principal office", "2101 CityWest Blvd, Suite 600, Houston, TX 77042"],
];

const leaders = [
  ["Robert W. Eifler", "President and Chief Executive Officer", "Leads the company's executive management and business strategy."],
  ["Jeffrey A. Miller", "Chairman of the Board", "Appointed chairman in May 2026. Also president and CEO of Halliburton."],
];

function About() {
  return (
    <>
      <PageHero eyebrow="Our company" title="More than a century offshore.">
        Noble's history dates to 1921. Today's public company, Noble Corporation plc, was incorporated in England and Wales in 2020 and is owned by its shareholders.
      </PageHero>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl text-primary">Company profile</h2>
        <dl className="mt-8 grid border-t border-border md:grid-cols-2">
          {profile.map(([k, v]) => (
            <div key={k} className="border-b border-border py-5 md:pr-10">
              <dt className="text-sm text-muted-foreground">{k}</dt>
              <dd className="mt-1 text-lg">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="eyebrow">Leadership</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {leaders.map(([n, r, d]) => (
              <div key={n} className="rounded border-t-4 border-accent bg-card p-8">
                <h3 className="text-2xl text-primary">{n}</h3>
                <p className="mt-1 font-semibold">{r}</p>
                <p className="mt-4 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
