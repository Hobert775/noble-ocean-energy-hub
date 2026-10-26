import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import jackup from "@/assets/jackup.jpg";
import safety from "@/assets/safety.jpg";
import technology from "@/assets/technology.jpg";
import rigNight from "@/assets/rig-night.jpg";
import fleet from "@/assets/fleet.jpg";
import crew from "@/assets/crew.jpg";
import { meta } from "@/components/Site";

export const Route = createFileRoute("/")({
  head: () => meta("Noble Corporation plc — Offshore Drilling", "Noble Corporation plc is an international offshore drilling contractor serving oil and gas companies worldwide since 1921."),
  component: Index,
});

const stats = [
  ["1921", "Founded"],
  ["$6.8B", "Reported contract backlog"],
  ["100+ yrs", "Offshore experience"],
  ["Global", "Fleet operations"],
];

function Index() {
  return (
    <>
      <section className="relative min-h-[80vh] overflow-hidden text-primary-foreground">
        <img src={hero} alt="Noble drillship at dusk" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        <div className="bg-hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-center px-6">
          <p className="eyebrow">An independent overview · Offshore drilling since 1921</p>
          <h1 className="mt-5 max-w-3xl text-5xl leading-[1.05] md:text-7xl">Drilling deeper, safely, across the world's oceans.</h1>
          <p className="mt-6 max-w-xl text-lg opacity-85">Noble provides deepwater, ultra-deepwater and jack-up drilling services to leading oil and gas operators. This site is an independent profile of the company, built from public reporting.</p>
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
          <p className="eyebrow">The company</p>
          <h2 className="mt-4 text-4xl text-primary">An international energy-services company</h2>
          <p className="mt-5 text-muted-foreground">Noble operates large offshore drilling rigs used to explore for and develop oil and gas reserves beneath the seabed — supplying equipment, skilled crews and technical expertise under contract to operators worldwide.</p>
          <Link to="/about" className="mt-8 inline-block font-semibold text-primary underline decoration-accent decoration-2 underline-offset-8">About Noble →</Link>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <p className="eyebrow">Safety</p>
            <h2 className="mt-4 text-4xl text-primary">Safety above everything</h2>
            <p className="mt-5 text-muted-foreground">Offshore drilling is one of the most demanding working environments on earth. Leading contractors build their reputations on rigorous safety management, continuous training and a culture where anyone on the rig can stop the job.</p>
            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-accent" />Stop-work authority for every crew member</li>
              <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-accent" />Continuous hazard assessment and drills</li>
              <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-accent" />Industry-certified safety training programmes</li>
            </ul>
          </div>
          <img src={safety} alt="Safety inspector checking equipment on an offshore rig" loading="lazy" width={1280} height={896} className="order-1 rounded md:order-2" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:grid-cols-2">
        <img src={technology} alt="Drilling control room with live well data" loading="lazy" width={1280} height={896} className="rounded" />
        <div>
          <p className="eyebrow">Technology</p>
          <h2 className="mt-4 text-4xl text-primary">Technology at the wellsite</h2>
          <p className="mt-5 text-muted-foreground">Modern drillships are floating data centres. Real-time downhole measurements, automated pipe handling and dynamic positioning let crews drill kilometres beneath the seabed with precision — in water depths of up to 12,000 feet.</p>
          <Link to="/operations" className="mt-8 inline-block font-semibold text-primary underline decoration-accent decoration-2 underline-offset-8">Explore operations →</Link>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="eyebrow">The fleet in pictures</p>
          <h2 className="mt-4 text-4xl text-primary">Working around the clock, around the world</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <figure>
              <img src={rigNight} alt="Drillship illuminated at night" loading="lazy" width={1280} height={896} className="rounded" />
              <figcaption className="mt-3 text-sm text-muted-foreground">Drillships — deepwater and ultra-deepwater operations</figcaption>
            </figure>
            <figure>
              <img src={fleet} alt="Jack-up rig in shallow turquoise waters" loading="lazy" width={1280} height={896} className="rounded" />
              <figcaption className="mt-3 text-sm text-muted-foreground">Jack-up rigs — shallow-water drilling</figcaption>
            </figure>
            <figure>
              <img src={crew} alt="Rig crew reviewing plans on deck" loading="lazy" width={1280} height={896} className="rounded" />
              <figcaption className="mt-3 text-sm text-muted-foreground">Crews — the people behind every well</figcaption>
            </figure>
          </div>
        </div>
      </section>
    </>
  );
}
