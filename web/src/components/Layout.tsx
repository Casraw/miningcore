import { NavLink, Link, useLocation } from "react-router-dom";
import { Activity, LayoutGrid, Wallet, Github, ExternalLink } from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";
import { STRATUM_HOST } from "@/lib/pool";

const nav = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/wallet", label: "My Wallet", icon: Wallet, end: false },
];

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-3">
            <Logo />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight text-white">
                mining-pool<span className="text-brand-400">.io</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">
                Pool Dashboard
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-1 rounded-2xl border border-white/5 bg-ink-900/60 p-1">
            {nav.map((item) => {
              const active = item.end
                ? pathname === item.to
                : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={clsx(
                    "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition",
                    active
                      ? "bg-brand-500/15 text-white shadow-[inset_0_0_0_1px_rgba(46,92,255,0.35)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-white/5 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-brand-400" />
            <span>
              Powered by Miningcore · stratum host{" "}
              <span className="mono text-slate-400">{STRATUM_HOST}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/oliverw/miningcore"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition hover:text-slate-300"
            >
              <Github className="h-3.5 w-3.5" /> Miningcore
            </a>
            <a
              href="/api/health-check"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition hover:text-slate-300"
            >
              <ExternalLink className="h-3.5 w-3.5" /> API
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan shadow-glow">
      <Activity className="h-5 w-5 text-ink-950" strokeWidth={2.5} />
    </div>
  );
}
