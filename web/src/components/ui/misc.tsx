import clsx from "clsx";
import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton", className)} />;
}

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "amber" | "rose" | "brand" | "cyan";
  className?: string;
}) {
  const tones: Record<string, string> = {
    slate: "border-white/10 bg-white/5 text-slate-300",
    green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
    rose: "border-rose-400/25 bg-rose-400/10 text-rose-300",
    brand: "border-brand-500/30 bg-brand-500/10 text-brand-300",
    cyan: "border-cyan-400/25 bg-cyan-400/10 text-accent-cyan",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={clsx(
          "absolute inline-flex h-full w-full rounded-full opacity-75",
          ok ? "bg-emerald-400 animate-ping" : "bg-slate-500",
        )}
      />
      <span
        className={clsx(
          "relative inline-flex h-2.5 w-2.5 rounded-full",
          ok ? "bg-emerald-400" : "bg-slate-500",
        )}
      />
    </span>
  );
}

export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-slate-300 transition hover:border-brand-500/40 hover:text-white",
        className,
      )}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {label && <span>{copied ? "Copied" : label}</span>}
    </button>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      {icon && <div className="text-slate-500">{icon}</div>}
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {hint && <p className="max-w-sm text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <p className="text-sm font-semibold text-rose-300">{title}</p>
      {message && <p className="max-w-md text-xs text-slate-400">{message}</p>}
      {onRetry && (
        <button className="btn-ghost" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function ProgressBar({
  value,
  max = 1,
  tone = "brand",
  className,
}: {
  value: number;
  max?: number;
  tone?: "brand" | "green" | "amber";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const tones: Record<string, string> = {
    brand: "from-brand-500 to-accent-cyan",
    green: "from-emerald-500 to-teal-400",
    amber: "from-amber-500 to-amber-300",
  };
  return (
    <div className={clsx("h-2 w-full overflow-hidden rounded-full bg-ink-700", className)}>
      <div
        className={clsx("h-full rounded-full bg-gradient-to-r transition-all duration-500", tones[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
