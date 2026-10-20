import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import jackup from "@/assets/jackup.jpg";
import { meta } from "@/components/Site";

export const Route = createFileRoute("/")({
  head: () => meta("Noble Corporation plc — Offshore Drilling", "Noble Corporation plc is an international offshore drilling contractor serving oil and gas companies worldwide since 1921."),
  component: Index,
});

const stats = [
  ["1921", "Established"],
  ["$6.8B", "Contract backlog"],
  ["NYSE: NE", "Publicly traded"],
  ["Houston", "Headquarters"],
];

function Index() {
  return (
    <>
      <section className="relative min-h-[80vh] overflow-hidden text-primary-foreground">
        <img src={hero} alt="Noble drillship at dusk" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        <div className="bg-hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-center px-6">
          <p className="eyebrow">Offshore drilling since 1921</p>
          <h1 className="mt-5 max-w-3xl text-5xl leading-[1.05] md:text-7xl">Drilling deeper, safely, across the world's oceans.</h1>
          <p className="mt-6 max-w-xl text-lg opacity-85">Noble provides deepwater, ultra-deepwater and jack-up drilling services to leading oil and gas operators.</p>
          <div className="mt-10 flex gap-4">
            <Link to="/operations" className="rounded bg-accent px-6 py-3 font-semibold text-accent-foreground hover:opacity-90">Our operations</Link>
            <Link to="/investors" className="rounded border border-primary-foreground/40 px-6 py-3 font-semibold hover:bg-primary-foreground/10">Investors</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {stats.map(([v, l]) => (
            <div key={l} className="border-border p-8 md:border-r last:border-r-0">
              <p className="font-display text-3xl text-primary">{v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:grid-cols-2">
        <img src={jackup} alt="Noble jack-up rig" loading="lazy" width={1280} height={896} className="rounded" />
        <div>
          <p className="eyebrow">Who we are</p>
          <h2 className="mt-4 text-4xl text-primary">An international energy-services company</h2>
          <p className="mt-5 text-muted-foreground">We operate large offshore drilling rigs used to explore for and develop oil and gas reserves beneath the seabed — supplying equipment, skilled crews and technical expertise under contract to operators worldwide.</p>
          <Link to="/about" className="mt-8 inline-block font-semibold text-primary underline decoration-accent decoration-2 underline-offset-8">About Noble →</Link>
        </div>
      </section>
    </>
  );
}
