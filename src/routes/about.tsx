import { createFileRoute } from "@tanstack/react-router";
import rigNight from "@/assets/rig-night.jpg";
import { meta, PageHero } from "@/components/Site";

export const Route = createFileRoute("/about")({
  head: () => meta("About — Noble Corporation plc Overview", "An independent profile of Noble Corporation plc: history, business and public record."),
  component: About,
});

const profile = [
  ["Company", "Noble Corporation plc"],
  ["Industry", "Offshore oil and gas drilling"],
  ["Founded", "1921"],
  ["Listed", "New York Stock Exchange (ticker: NE)"],
  ["Principal office", "Houston, Texas, USA"],
  ["Business", "Contract drilling services for energy operators"],
];

const milestones = [
  ["1921", "Founded", "The company's roots in the drilling business date back more than a century."],
  ["Deepwater era", "Fleet expansion", "Grew into deepwater and ultra-deepwater drilling with drillships and semi-submersibles."],
  ["Today", "Global contractor", "Operates one of the industry's established fleets of floaters and jack-up rigs worldwide."],
];

function About() {
  return (
    <>
      <PageHero eyebrow="Company profile" title="More than a century offshore.">
        Noble's history dates to 1921. This page is an independent profile compiled from public reporting — it is not the company's official website.
      </PageHero>
      <section className="mx-auto max-w-7xl px-6 pt-20">
        <img src={rigNight} alt="Drillship illuminated at night on calm waters" loading="lazy" width={1280} height={896} className="w-full rounded" />
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl text-primary">At a glance</h2>
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
          <p className="eyebrow">Milestones</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {milestones.map(([era, t, d]) => (
              <div key={t} className="rounded border-t-4 border-accent bg-card p-8">
                <p className="text-sm font-semibold text-muted-foreground">{era}</p>
                <h3 className="mt-2 text-2xl text-primary">{t}</h3>
                <p className="mt-4 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
            For official company information, leadership and governance details, refer to Noble Corporation plc's official website and regulatory filings.
          </p>
        </div>
      </section>
    </>
  );
}
