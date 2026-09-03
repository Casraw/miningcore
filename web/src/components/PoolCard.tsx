import { Link } from "react-router-dom";
import {
  Cpu,
  Users,
  Boxes,
  Network,
  ChevronRight,
  Coins,
} from "lucide-react";
import type { PoolInfo } from "@/api/types";
import {
  formatHashrate,
  formatInt,
  formatCompact,
  timeAgo,
} from "@/lib/format";
import {
  connectionsFor,
  isPoolLive,
  coinLabel,
  algoLabel,
} from "@/lib/pool";
import { Badge, StatusDot } from "./ui/misc";
import { ConnectionLine } from "./ConnectionLine";

export function PoolCard({ pool }: { pool: PoolInfo }) {
  const conns = connectionsFor(pool);
  const live = isPoolLive(pool);

  return (
    <div className="card card-hover flex flex-col gap-4 p-5 animate-fade-in">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-cyan/10 text-2xl">
            <Coins className="h-6 w-6 text-brand-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">
                {coinLabel(pool)}
              </h3>
              <Badge tone="brand">{pool.coin?.symbol}</Badge>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
              <span className="chip !py-0.5">{algoLabel(pool)}</span>
              <span className="flex items-center gap-1.5">
                <StatusDot ok={live} />
                {live ? "Live" : "Idle"}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wider text-slate-500">
            Fee
          </div>
          <div className="text-sm font-semibold text-white">
            {pool.poolFeePercent ?? 0}%
          </div>
        </div>
      </div>

      {/* stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat
          icon={<Cpu className="h-4 w-4" />}
          label="Pool Hashrate"
          value={formatHashrate(pool.poolStats?.poolHashrate)}
        />
        <MiniStat
          icon={<Users className="h-4 w-4" />}
          label="Miners"
          value={formatInt(pool.poolStats?.connectedMiners)}
        />
        <MiniStat
          icon={<Boxes className="h-4 w-4" />}
          label="Blocks"
          value={formatInt(pool.totalBlocks)}
        />
        <MiniStat
          icon={<Network className="h-4 w-4" />}
          label="Net Diff"
          value={formatCompact(pool.networkStats?.networkDifficulty)}
        />
      </div>

      {/* connection lines */}
      <div className="flex flex-col gap-2">
        <div className="stat-label">Connect your miner</div>
        {conns.map((c) => (
          <ConnectionLine key={c.port} conn={c} />
        ))}
      </div>

      {/* footer */}
      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-xs text-slate-500">
          Last block {timeAgo(pool.lastPoolBlockTime)}
        </span>
        <Link
          to={`/pools/${pool.id}`}
          className="flex items-center gap-1 text-sm font-semibold text-brand-300 transition hover:text-brand-200"
        >
          Details <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/40 p-3">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
