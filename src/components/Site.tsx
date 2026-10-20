import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const nav = [
  { to: "/about", label: "Company" },
  { to: "/operations", label: "Operations" },
  { to: "/investors", label: "Investors" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary-foreground/10 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold">Noble</span>
          <span className="text-xs tracking-[0.2em] text-accent">CORPORATION PLC</span>
        </Link>
        <nav className="hidden gap-8 text-sm md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="opacity-80 hover:opacity-100" activeProps={{ className: "text-accent opacity-100" }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      <nav className="flex gap-5 overflow-x-auto px-6 pb-3 text-sm md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className="whitespace-nowrap opacity-80" activeProps={{ className: "text-accent opacity-100" }}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">Noble Corporation plc</p>
          <p className="mt-3 text-sm opacity-70">Offshore drilling excellence since 1921. NYSE: NE.</p>
        </div>
        <div className="text-sm opacity-80">
          <p className="eyebrow mb-3">Principal Executive Office</p>
          2101 CityWest Boulevard, Suite 600<br />Houston, Texas 77042, USA
        </div>
        <div className="text-sm opacity-80">
          <p className="eyebrow mb-3">Registered</p>
          England and Wales · Company No. 12958050
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-5 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Noble Corporation plc. All rights reserved.
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl md:text-6xl">{title}</h1>
        {children && <p className="mt-6 max-w-2xl text-lg opacity-80">{children}</p>}
      </div>
    </section>
  );
}

export function meta(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
