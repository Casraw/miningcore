import clsx from "clsx";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  accent?: "brand" | "cyan" | "teal" | "violet" | "amber" | "rose";
  className?: string;
}

const accentMap: Record<string, string> = {
  brand: "text-brand-300 bg-brand-500/10 border-brand-500/20",
  cyan: "text-accent-cyan bg-cyan-400/10 border-cyan-400/20",
  teal: "text-accent-teal bg-teal-400/10 border-teal-400/20",
  violet: "text-accent-violet bg-violet-400/10 border-violet-400/20",
  amber: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  rose: "text-rose-300 bg-rose-400/10 border-rose-400/20",
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "brand",
  className,
}: StatCardProps) {
  return (
    <div className={clsx("card card-hover p-4 animate-fade-in", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-1 truncate">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        {icon && (
          <div
            className={clsx(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl border",
              accentMap[accent],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
