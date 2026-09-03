import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Cpu,
  Users,
  Activity,
  Network,
  Boxes,
  Coins,
  Layers,
  Gauge,
  Server,
} from "lucide-react";
import {
  usePool,
  usePoolPerformance,
  usePoolBlocks,
  usePoolPayments,
} from "@/api/hooks";
import type { SampleRange } from "@/api/client";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Skeleton, ErrorState, Badge } from "@/components/ui/misc";
import { ConnectionLine } from "@/components/ConnectionLine";
import { BlocksTable } from "@/components/BlocksTable";
import { PaymentsTable } from "@/components/PaymentsTable";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import {
  formatHashrate,
  formatInt,
  formatCompact,
  formatCoin,
  formatPercent,
  trim,
} from "@/lib/format";
import { connectionsFor, coinLabel, algoLabel } from "@/lib/pool";

export function PoolDetailPage() {
  const { poolId } = useParams<{ poolId: string }>();
  const [range, setRange] = useState<SampleRange>("day");

  const { data, isLoading, isError, error, refetch } = usePool(poolId);
  const pool = data?.pool;
  const perf = usePoolPerformance(poolId, range, range === "day" ? "hour" : "day");
  const blocks = usePoolBlocks(poolId, 0, 15);
  const payments = usePoolPayments(poolId, 0, 15);

  const symbol = pool?.coin?.symbol;

  const chartData = useMemo(
    () =>
      (perf.data?.stats ?? []).map((s) => ({
        t: new Date(s.created).getTime(),
        hashrate: s.poolHashrate,
        shares: s.validSharesPerSecond,
        miners: s.connectedMiners,
      })),
    [perf.data],
  );

  if (isError) {
    return (
      <Card>
        <ErrorState
          title="Pool not found"
          message={(error as Error)?.message}
          onRetry={() => refetch()}
        />
        <div className="mt-4 text-center">
          <Link to="/" className="btn-ghost">
            <ArrowLeft className="h-4 w-4" /> Back to overview
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/"
        className="flex w-fit items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> All pools
      </Link>

      {/* Header */}
      {isLoading || !pool ? (
        <Skeleton className="h-24" />
      ) : (
        <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-cyan/10">
              <Coins className="h-7 w-7 text-brand-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">
                  {coinLabel(pool)}
                </h1>
                <Badge tone="brand">{symbol}</Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="chip">
                  <Gauge className="h-3 w-3" /> {algoLabel(pool)}
                </span>
                <span className="chip">
                  <Layers className="h-3 w-3" />{" "}
                  {pool.paymentProcessing?.payoutScheme ?? "—"}
                </span>
                <span className="chip">Fee {pool.poolFeePercent ?? 0}%</span>
              </div>
            </div>
          </div>
          <Link to="/wallet" className="btn-primary">
            <Users className="h-4 w-4" /> Check my earnings
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading || !pool ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          <>
            <StatCard
              label="Pool Hashrate"
              value={formatHashrate(pool.poolStats?.poolHashrate)}
              icon={<Cpu className="h-5 w-5" />}
              accent="brand"
            />
            <StatCard
              label="Miners"
              value={formatInt(pool.poolStats?.connectedMiners)}
              icon={<Users className="h-5 w-5" />}
              accent="cyan"
            />
            <StatCard
              label="Shares / s"
              value={trim(pool.poolStats?.sharesPerSecond ?? 0, 2)}
              icon={<Activity className="h-5 w-5" />}
              accent="teal"
            />
            <StatCard
              label="Pool Effort"
              value={formatPercent((pool.poolEffort ?? 0) * 100, 0)}
              icon={<Gauge className="h-5 w-5" />}
              accent="violet"
            />
            <StatCard
              label="Network Hashrate"
              value={formatHashrate(pool.networkStats?.networkHashrate)}
              icon={<Network className="h-5 w-5" />}
              accent="brand"
            />
            <StatCard
              label="Network Difficulty"
              value={formatCompact(pool.networkStats?.networkDifficulty)}
              icon={<Gauge className="h-5 w-5" />}
              accent="cyan"
            />
            <StatCard
              label="Block Height"
              value={formatInt(pool.networkStats?.blockHeight)}
              icon={<Server className="h-5 w-5" />}
              accent="teal"
            />
            <StatCard
              label="Blocks / Paid"
              value={formatInt(pool.totalBlocks)}
              sub={`${formatCoin(pool.totalPaid, symbol, 2)} paid`}
              icon={<Boxes className="h-5 w-5" />}
              accent="violet"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <Card>
        <CardHeader
          title="Performance"
          subtitle={range === "day" ? "Last 24 hours" : "Last 30 days"}
          icon={<Activity className="h-4 w-4" />}
          action={
            <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-ink-900/60 p-1">
              {(["day", "month"] as SampleRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition " +
                    (range === r
                      ? "bg-brand-500/20 text-white"
                      : "text-slate-400 hover:text-white")
                  }
                >
                  {r === "day" ? "24h" : "30d"}
                </button>
              ))}
            </div>
          }
        />
        {perf.isLoading ? (
          <Skeleton className="h-60" />
        ) : chartData.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            No performance samples yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
              <div className="stat-label mb-2">Hashrate</div>
              <TimeSeriesChart
                data={chartData}
                series={[
                  {
                    key: "hashrate",
                    label: "Hashrate",
                    color: "#2e5cff",
                    format: (v) => formatHashrate(v),
                  },
                ]}
              />
            </div>
            <div>
              <div className="stat-label mb-2">Valid shares / s</div>
              <TimeSeriesChart
                data={chartData}
                series={[
                  {
                    key: "shares",
                    label: "Shares/s",
                    color: "#38e1ff",
                    format: (v) => trim(v, 2),
                  },
                ]}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Connection */}
      {pool && (
        <Card>
          <CardHeader
            title="Stratum Endpoints"
            subtitle="Point your miner at one of these"
            icon={<Server className="h-4 w-4" />}
          />
          <div className="flex flex-col gap-2">
            {connectionsFor(pool).map((c) => (
              <ConnectionLine key={c.port} conn={c} />
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Username is your <span className="text-slate-300">{symbol}</span>{" "}
            wallet address (optionally <span className="mono">address.worker</span>
            ), password is usually <span className="mono">x</span>.
          </p>
        </Card>
      )}

      {/* Blocks + Payments */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent Blocks"
            icon={<Boxes className="h-4 w-4" />}
          />
          {blocks.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <BlocksTable blocks={blocks.data ?? []} symbol={symbol} showMiner />
          )}
        </Card>
        <Card>
          <CardHeader
            title="Recent Payments"
            icon={<Coins className="h-4 w-4" />}
          />
          {payments.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <PaymentsTable
              payments={payments.data ?? []}
              symbol={symbol}
              showAddress
            />
          )}
        </Card>
      </div>
    </div>
  );
}
