import { useMemo } from "react";
import { Cpu, Users, Boxes, Layers, Wallet as WalletIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { usePools } from "@/api/hooks";
import { PoolCard } from "@/components/PoolCard";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton, ErrorState, EmptyState } from "@/components/ui/misc";
import { formatHashrate, formatInt } from "@/lib/format";

export function OverviewPage() {
  const { data, isLoading, isError, error, refetch } = usePools();
  const pools = data?.pools ?? [];

  const totals = useMemo(() => {
    return pools.reduce(
      (acc, p) => {
        acc.hashrate += p.poolStats?.poolHashrate ?? 0;
        acc.miners += p.poolStats?.connectedMiners ?? 0;
        acc.blocks += p.totalBlocks ?? 0;
        return acc;
      },
      { hashrate: 0, miners: 0, blocks: 0 },
    );
  }, [pools]);

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-ink-850/60 p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-accent-cyan/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="chip mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            Live pool statistics
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Mine smarter on{" "}
            <span className="bg-gradient-to-r from-brand-300 to-accent-cyan bg-clip-text text-transparent">
              mining-pool.io
            </span>
          </h1>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Real-time hashrate, blocks and payouts across every pool. Point your
            miner at a stratum endpoint below, then track your wallet's earnings
            and estimated time to the next block.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/wallet" className="btn-primary">
              <WalletIcon className="h-4 w-4" /> Look up my wallet
            </Link>
            <a href="#pools" className="btn-ghost">
              <Layers className="h-4 w-4" /> Browse pools
            </a>
          </div>
        </div>
      </section>

      {/* Aggregate stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Hashrate"
              value={formatHashrate(totals.hashrate)}
              icon={<Cpu className="h-5 w-5" />}
              accent="brand"
            />
            <StatCard
              label="Active Miners"
              value={formatInt(totals.miners)}
              icon={<Users className="h-5 w-5" />}
              accent="cyan"
            />
            <StatCard
              label="Blocks Found"
              value={formatInt(totals.blocks)}
              icon={<Boxes className="h-5 w-5" />}
              accent="teal"
            />
            <StatCard
              label="Pools"
              value={formatInt(pools.length)}
              icon={<Layers className="h-5 w-5" />}
              accent="violet"
            />
          </>
        )}
      </section>

      {/* Pools */}
      <section id="pools" className="scroll-mt-20">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Available Pools</h2>
          {!isLoading && (
            <span className="text-xs text-slate-500">
              {pools.length} pool{pools.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {isError ? (
          <div className="card">
            <ErrorState
              message={(error as Error)?.message}
              onRetry={() => refetch()}
            />
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : pools.length === 0 ? (
          <div className="card">
            <EmptyState
              title="No pools online yet"
              hint="Pools will appear here once Miningcore has them enabled."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {pools.map((p) => (
              <PoolCard key={p.id} pool={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
