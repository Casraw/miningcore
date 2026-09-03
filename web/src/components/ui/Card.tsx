import clsx from "clsx";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div className={clsx("card p-5", hover && "card-hover", className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div className={clsx("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-brand-500/10 text-brand-300">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
