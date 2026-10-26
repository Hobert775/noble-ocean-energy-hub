import { createFileRoute } from "@tanstack/react-router";
import { meta, PageHero } from "@/components/Site";

export const Route = createFileRoute("/careers")({
  head: () => meta("Careers — Noble Corporation plc", "Offshore and corporate career opportunities at Noble Corporation plc."),
  component: Careers,
});

const roles = [
  "Offshore drillers, assistant drillers and rig crews",
  "Mechanical, electrical and instrumentation technicians",
  "Engineers, safety officers and environmental specialists",
  "Marine operations and logistics personnel",
  "Finance, procurement, IT, HR and commercial staff",
];

function Careers() {
  return (
    <>
      <PageHero eyebrow="Careers" title="Build your career offshore and onshore.">
        Requirements vary by role. Offshore positions may require qualifications, industry certifications, safety training and rig experience. This site does not recruit — apply only through Noble's official careers channels.
      </PageHero>
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-3xl text-primary">Where you could work</h2>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {roles.map((r) => (
            <li key={r} className="flex items-center gap-4 py-5 text-lg"><span className="h-2 w-2 rounded-full bg-accent" />{r}</li>
          ))}
        </ul>
        <div className="mt-12 rounded border-l-4 border-accent bg-secondary p-6">
          <p className="font-semibold">Recruitment safety</p>
          <p className="mt-2 text-muted-foreground">Noble never asks candidates to pay for a job. Do not send identity or banking details to unverified contacts.</p>
        </div>
      </section>
    </>
  );
}
