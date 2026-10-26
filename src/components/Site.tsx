import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/about", label: "Company" },
  { to: "/operations", label: "Operations" },
  { to: "/investors", label: "Investors" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [signedIn, setSignedIn] = useState(false);
  const onHome = useLocation({ select: (s) => s.pathname === "/" });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <>
      <div className="bg-accent px-6 py-1.5 text-center text-xs font-semibold tracking-wide text-accent-foreground">
        Independent informational website — not affiliated with or endorsed by Noble Corporation plc
      </div>
      <header className="sticky top-0 z-50 border-b border-primary-foreground/10 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold">Noble</span>
          <span className="text-xs tracking-[0.2em] text-accent">CORPORATION PLC</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="opacity-80 hover:opacity-100" activeProps={{ className: "text-accent opacity-100" }}>
              {n.label}
            </Link>
          ))}
          {signedIn ? (
            <>
              <Link to="/admin" className="opacity-80 hover:opacity-100" activeProps={{ className: "text-accent opacity-100" }}>
                Admin
              </Link>
              <button type="button" onClick={handleSignOut} className="opacity-80 hover:opacity-100">
                Sign out
              </button>
            </>
          ) : onHome ? null : (
            <Link to="/auth" className="opacity-80 hover:opacity-100" activeProps={{ className: "text-accent opacity-100" }}>
              Sign in
            </Link>
          )}
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
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">Noble Corporation plc</p>
          <p className="mt-3 text-sm opacity-70">An independent overview of one of the world's longest-standing offshore drilling contractors, founded 1921.</p>
        </div>
        <div className="text-sm opacity-80">
          <p className="eyebrow mb-3">About this website</p>
          Independent informational site. Not affiliated with, sponsored by, or endorsed by Noble Corporation plc.
        </div>
        <div className="text-sm opacity-80">
          <p className="eyebrow mb-3">Official matters</p>
          For investor, career or media inquiries, use Noble's official website and published contact points.
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-5 text-center text-xs opacity-60">
        © {new Date().getFullYear()} · Independent informational website · Company figures shown are drawn from public reporting.
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
