import { Lock, Plug, Gauge } from "lucide-react";
import { CopyButton, Badge } from "./ui/misc";
import { formatCompact } from "@/lib/format";
import type { ConnectionInfo } from "@/lib/pool";

export function ConnectionLine({ conn }: { conn: ConnectionInfo }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-ink-900/50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-brand-500/10 text-brand-300">
          <Plug className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{conn.name}</span>
            {conn.tls ? (
              <Badge tone="green">
                <Lock className="h-3 w-3" /> TLS
              </Badge>
            ) : null}
          </div>
          <code className="mono block truncate text-xs text-brand-300">
            {conn.url}
          </code>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone="slate">
          <Gauge className="h-3 w-3" /> diff {formatCompact(conn.difficulty)}
        </Badge>
        <CopyButton value={conn.url} label="Copy" />
      </div>
    </div>
  );
}
