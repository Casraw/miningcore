import { ExternalLink, Boxes } from "lucide-react";
import type { Block } from "@/api/types";
import {
  formatCoin,
  formatPercent,
  timeAgo,
  shortHash,
} from "@/lib/format";
import { blockTone } from "@/lib/pool";
import { Badge, EmptyState, ProgressBar } from "./ui/misc";

export function BlocksTable({
  blocks,
  symbol,
  showMiner = false,
}: {
  blocks: Block[];
  symbol?: string;
  showMiner?: boolean;
}) {
  if (!blocks.length) {
    return (
      <EmptyState
        icon={<Boxes className="h-8 w-8" />}
        title="No blocks yet"
        hint="Blocks found by the pool will show up here with their maturity status."
      />
    );
  }

  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
            <th className="px-3 py-2 font-medium">Height</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Maturity</th>
            <th className="px-3 py-2 font-medium">Effort</th>
            {showMiner && <th className="px-3 py-2 font-medium">Miner</th>}
            <th className="px-3 py-2 text-right font-medium">Reward</th>
            <th className="px-3 py-2 text-right font-medium">Found</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {blocks.map((b, i) => {
            const tone = blockTone(b.status);
            const confirmed = b.status?.toLowerCase() === "confirmed";
            return (
              <tr
                key={`${b.blockHeight}-${i}`}
                className="transition hover:bg-white/[0.02]"
              >
                <td className="px-3 py-3">
                  {b.infoLink ? (
                    <a
                      href={b.infoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mono flex items-center gap-1 font-medium text-brand-300 hover:text-brand-200"
                    >
                      {b.blockHeight}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="mono font-medium text-white">
                      {b.blockHeight}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <Badge tone={tone}>{b.status}</Badge>
                </td>
                <td className="px-3 py-3">
                  {confirmed ? (
                    <span className="text-xs text-emerald-300">Matured</span>
                  ) : b.status?.toLowerCase() === "orphaned" ? (
                    <span className="text-xs text-rose-300">—</span>
                  ) : (
                    <div className="flex w-28 items-center gap-2">
                      <ProgressBar
                        value={b.confirmationProgress ?? 0}
                        tone="amber"
                      />
                      <span className="mono text-[11px] text-slate-400">
                        {formatPercent((b.confirmationProgress ?? 0) * 100, 0)}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className="mono text-slate-300">
                    {b.effort != null
                      ? formatPercent(b.effort * 100, 0)
                      : "—"}
                  </span>
                </td>
                {showMiner && (
                  <td className="px-3 py-3">
                    <span className="mono text-xs text-slate-400">
                      {shortHash(b.miner)}
                    </span>
                  </td>
                )}
                <td className="px-3 py-3 text-right">
                  <span className="mono font-medium text-white">
                    {formatCoin(b.reward, symbol, 4)}
                  </span>
                </td>
                <td className="px-3 py-3 text-right text-xs text-slate-400">
                  {timeAgo(b.created)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
