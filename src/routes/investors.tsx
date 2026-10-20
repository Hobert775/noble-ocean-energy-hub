import { createFileRoute } from "@tanstack/react-router";
import { meta, PageHero } from "@/components/Site";

export const Route = createFileRoute("/investors")({
  head: () => meta("Investors — Noble Corporation plc (NYSE: NE)", "Second quarter 2026 results, dividend and investor resources for Noble Corporation plc."),
  component: Investors,
});

const kpis = [
  ["$720M", "Total revenue", "Down from $849M a year earlier"],
  ["−$37M", "Net income (loss)", "Reported quarterly loss"],
  ["$212M", "Adjusted EBITDA", "Operating performance measure"],
  ["$6.8B", "Contract backlog", "Reported July 27, 2026"],
];
const details = [
  ["Cash (June 30, 2026)", "~$456 million"],
  ["Debt principal", "~$1.9 billion"],
  ["Q2 operating cash flow", "$144 million"],
  ["Q2 free cash flow", "−$59 million"],
  ["2026 revenue guidance", "$2.8 – $2.9 billion"],
  ["Q3 2026 dividend", "$0.50 per share, payable Sept 24"],
];

function Investors() {
  return (
    <>
      <PageHero eyebrow="NYSE: NE" title="Investor relations">Second quarter 2026 results, three months ended June 30, 2026. All figures in US dollars.</PageHero>
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-4">
        {kpis.map(([v, l, n]) => (
          <div key={l} className="rounded border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className="mt-3 font-display text-4xl text-primary">{v}</p>
            <p className="mt-2 text-xs text-muted-foreground">{n}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto grid max-w-7xl gap-14 px-6 pb-24 md:grid-cols-2">
        <div>
          <h2 className="text-3xl text-primary">Financial details</h2>
          <dl className="mt-6 border-t border-border">
            {details.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border py-4">
                <dt className="text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded bg-primary p-10 text-primary-foreground">
          <p className="eyebrow">Resources</p>
          <ul className="mt-6 space-y-4">
            <li><a className="underline decoration-accent underline-offset-4" href="https://noblecorp.com/our-investors/" target="_blank" rel="noreferrer">Investor information</a></li>
            <li><a className="underline decoration-accent underline-offset-4" href="https://www.sec.gov/edgar/browse/?CIK=1895262&owner=exclude" target="_blank" rel="noreferrer">SEC filings</a></li>
            <li>Ian Macpherson, VP Investor Relations — <a className="underline decoration-accent underline-offset-4" href="mailto:imacpherson@noblecorp.com">imacpherson@noblecorp.com</a></li>
          </ul>
          <p className="mt-8 text-sm opacity-70">Dividends may change at the board's discretion. Contract backlog is not cash earned and does not guarantee future profit.</p>
        </div>
      </section>
    </>
  );
}
