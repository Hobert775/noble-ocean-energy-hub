import { createFileRoute, Link } from "@tanstack/react-router";
import rigNight from "@/assets/rig-night.jpg";
import fleet from "@/assets/fleet.jpg";
import { meta, PageHero } from "@/components/Site";

export const Route = createFileRoute("/operations")({
  head: () => meta("Operations & Fleet — Noble Corporation plc", "Deepwater, ultra-deepwater and jack-up drilling services from Noble."),
  component: Ops,
});

const services = [
  ["01", "Deepwater & ultra-deepwater", "Floating drilling units operating in deep ocean environments, where reserves lie far beneath the seabed."],
  ["02", "Jack-up drilling rigs", "Mobile offshore platforms with legs lowered to the seabed, built for drilling in shallower waters."],
  ["03", "Contracts & technical operations", "Drilling equipment, crews, operational expertise and related services under contract with operators."],
];

function Ops() {
  return (
    <>
      <PageHero eyebrow="What we do" title="Offshore drilling services for energy companies.">
        The business is driven by contract awards, day rates, rig utilization and operators' investment in offshore projects.
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-px bg-border px-0 md:grid-cols-3">
        {services.map(([n, t, d]) => (
          <div key={n} className="bg-background p-10">
            <p className="font-display text-5xl text-accent">{n}</p>
            <h3 className="mt-6 text-2xl text-primary">{t}</h3>
            <p className="mt-4 text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="eyebrow">The fleet</p>
        <h2 className="mt-4 text-3xl text-primary">Floaters and jack-ups</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <figure>
            <img src={rigNight} alt="Drillship illuminated at night" loading="lazy" width={1280} height={896} className="rounded" />
            <figcaption className="mt-3 text-sm text-muted-foreground">Drillships and semi-submersibles handle deepwater and ultra-deepwater wells, holding position over the wellhead with dynamic positioning systems.</figcaption>
          </figure>
          <figure>
            <img src={fleet} alt="Jack-up rig standing on legs in shallow water" loading="lazy" width={1280} height={896} className="rounded" />
            <figcaption className="mt-3 text-sm text-muted-foreground">Jack-up rigs stand on legs lowered to the seabed, providing a stable drilling platform in shallower waters.</figcaption>
          </figure>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-16 text-center">
        <Link to="/contact" className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-8">Get in touch →</Link>
      </section>
    </>
  );
}
