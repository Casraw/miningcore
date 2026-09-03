import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Cpu,
  Coins,
  Clock,
  Wallet as WalletIcon,
  Boxes,
  Gauge,
  Timer,
  TrendingUp,
  Users,
  CircleDollarSign,
  Info,
} from "lucide-react";
import {
  usePool,
  useMiner,
  useMinerPerformance,
  useMinerBlocks,
  useMinerPayments,
  useMinerEarnings,
} from "@/api/hooks";
import { WalletSearch } from "@/components/WalletSearch";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  Skeleton,
  ErrorState,
  EmptyState,
  Badge,
  ProgressBar,
  CopyButton,
} from "@/components/ui/misc";
import { BlocksTable } from "@/components/BlocksTable";
import { PaymentsTable } from "@/components/PaymentsTable";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { EarningsChart } from "@/components/charts/EarningsChart";
import {
  formatHashrate,
  formatCoin,
  formatCompact,
  formatDuration,
  formatDateTime,
  formatPercent,
  estimateTimeToBlock,
  sumWorkerHashrate,
  trim,
} from "@/lib/format";
import { coinLabel } from "@/lib/pool";

export function WalletPage() {
  const { poolId, address } = useParams<{ poolId: string; address: string }>();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Wallet</h1>
        <p className="mt-1 text-sm text-slate-400">
          Track earnings, workers and your estimated time to the next block.
        </p>
      </div>

      <WalletSearch
        initialPoolId={poolId}
        initialAddress={address}
        onSubmit={(pid, addr) =>
          navigate(`/wallet/${encodeURIComponent(pid)}/${encodeURIComponent(addr)}`)
        }
      />

      {poolId && address ? (
        <WalletDashboard poolId={poolId} address={address} />
      ) : (
        <Card>
          <EmptyState
            icon={<WalletIcon className="h-8 w-8" />}
            title="Enter your wallet address above"
            hint="Pick the pool you mine on and paste your payout address to load your dashboard."
          />
        </Card>
      )}
    </div>
  );
}

function WalletDashboard({
  poolId,
  address,
}: {
  poolId: string;
  address: string;
}) {
  const poolQ = usePool(poolId);
  const minerQ = useMiner(poolId, address);
  const perfQ = useMinerPerformance(poolId, address, "day");
  const blocksQ = useMinerBlocks(poolId, address, 0, 15);
  const paymentsQ = useMinerPayments(poolId, address, 0, 15);
  const earningsQ = useMinerEarnings(poolId, address);

  const pool = poolQ.data?.pool;
  const symbol = pool?.coin?.symbol;
  const miner = minerQ.data;

  // Workers + hashrate totals
  const workers = miner?.performance?.workers ?? {};
  const workerEntries = Object.entries(workers);
  const totalHashrate = sumWorkerHashrate(workers);

  // Time to next block estimate (statistical)
  const networkDiff = pool?.networkStats?.networkDifficulty;
  const ttb = estimateTimeToBlock(totalHashrate, networkDiff);

  // Payout estimation
  const minPayment = pool?.paymentProcessing?.minimumPayment ?? 0;
  const pending = miner?.pendingBalance ?? 0;
  const payoutProgress = minPayment > 0 ? pending / minPayment : 0;
  const reachedThreshold = minPayment > 0 && pending >= minPayment;

  // Average daily earning from the earnings series (for payout ETA)
  const earnings = earningsQ.data ?? [];
  const avgDaily = useMemo(() => {
    if (!earnings.length) return 0;
    const recent = earnings.slice(0, 7);
    const sum = recent.reduce((a, e) => a + (e.amount || 0), 0);
    return sum / recent.length;
  }, [earnings]);

  const payoutEtaSeconds = useMemo(() => {
    if (reachedThreshold) return 0;
    if (avgDaily <= 0) return Infinity;
    const remaining = Math.max(0, minPayment - pending);
    return (remaining / avgDaily) * 86_400;
  }, [reachedThreshold, avgDaily, minPayment, pending]);

  // Chart data
  const perfChart = useMemo(() => {
    const samples = perfQ.data ?? [];
    return samples.map((s) => {
      const hr = sumWorkerHashrate(s.workers);
      const sps = Object.values(s.workers ?? {}).reduce(
        (a, w) => a + (w.sharesPerSecond || 0),
        0,
      );
      return { t: new Date(s.created).getTime(), hashrate: hr, shares: sps };
    });
  }, [perfQ.data]);

  const earningsChart = useMemo(
    () =>
      [...earnings]
        .map((e) => ({ t: new Date(e.date).getTime(), amount: e.amount }))
        .sort((a, b) => a.t - b.t),
    [earnings],
  );

  // Blocks matured / pending counts
  const blocks = blocksQ.data ?? [];
  const maturedCount = blocks.filter(
    (b) => b.status?.toLowerCase() === "confirmed",
  ).length;
  const pendingCount = blocks.filter(
    (b) => b.status?.toLowerCase() === "pending",
  ).length;

  if (minerQ.isError) {
    return (
      <Card>
        <ErrorState
          title="No data for this address"
          message="This address hasn't submitted shares to this pool yet, or the address/pool combination is wrong. Double-check the pool and address."
          onRetry={() => minerQ.refetch()}
        />
      </Card>
    );
  }

  if (minerQ.isLoading || poolQ.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Address bar */}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-brand-500/10 text-brand-300">
            <WalletIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge tone="brand">{coinLabel(pool!)}</Badge>
              <span className="text-xs text-slate-500">on {symbol}</span>
            </div>
            <code className="mono block truncate text-sm text-slate-200">
              {address}
            </code>
          </div>
        </div>
        <CopyButton value={address} label="Copy address" />
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Your Hashrate"
          value={formatHashrate(totalHashrate)}
          sub={`${workerEntries.length} worker${workerEntries.length !== 1 ? "s" : ""}`}
          icon={<Cpu className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Pending Balance"
          value={formatCoin(pending, symbol, 6)}
          sub={`min payout ${formatCoin(minPayment, symbol, 4)}`}
          icon={<CircleDollarSign className="h-5 w-5" />}
          accent="cyan"
        />
        <StatCard
          label="Total Paid"
          value={formatCoin(miner?.totalPaid, symbol, 4)}
          sub={`today ${formatCoin(miner?.todayPaid, symbol, 4)}`}
          icon={<Coins className="h-5 w-5" />}
          accent="teal"
        />
        <StatCard
          label="Est. Time to Block"
          value={ttb === Infinity ? "—" : formatDuration(ttb)}
          sub="statistical estimate"
          icon={<Timer className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      {/* Payout + Next block */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Next Payout"
            subtitle="Progress toward the pool minimum"
            icon={<CircleDollarSign className="h-4 w-4" />}
          />
          <div className="flex items-end justify-between">
            <div>
              <div className="stat-value">{formatCoin(pending, symbol, 6)}</div>
              <div className="text-xs text-slate-400">
                of {formatCoin(minPayment, symbol, 4)} minimum
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-brand-300">
                {formatPercent(Math.min(100, payoutProgress * 100), 0)}
              </div>
            </div>
          </div>
          <ProgressBar
            value={payoutProgress}
            max={1}
            tone={reachedThreshold ? "green" : "brand"}
            className="mt-3 h-2.5"
          />
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/5 bg-ink-900/50 p-3 text-sm">
            <Clock className="h-4 w-4 text-brand-300" />
            {reachedThreshold ? (
              <span className="text-emerald-300">
                Threshold reached — due on the next payout run.
              </span>
            ) : payoutEtaSeconds === Infinity ? (
              <span className="text-slate-400">
                Keep mining to reach the payout threshold.
              </span>
            ) : (
              <span className="text-slate-300">
                Est. <b className="text-white">{formatDuration(payoutEtaSeconds)}</b>{" "}
                to reach minimum at your recent rate.
              </span>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Next Block Estimate"
            subtitle="Based on your hashrate vs. network difficulty"
            icon={<Timer className="h-4 w-4" />}
          />
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-label">Expected time to find a block</div>
              <div className="mt-1 text-3xl font-bold text-white">
                {ttb === Infinity ? "—" : formatDuration(ttb)}
              </div>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
              <Gauge className="h-7 w-7 text-accent-violet" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-ink-900/50 p-3">
              <div className="stat-label">Your Hashrate</div>
              <div className="mono mt-1 text-sm font-semibold text-white">
                {formatHashrate(totalHashrate)}
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-ink-900/50 p-3">
              <div className="stat-label">Network Difficulty</div>
              <div className="mono mt-1 text-sm font-semibold text-white">
                {formatCompact(networkDiff)}
              </div>
            </div>
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            This is a long-run statistical average (difficulty × 2³² ÷ hashrate).
            Actual luck varies widely block to block.
          </p>
        </Card>
      </div>

      {/* Workers */}
      <Card>
        <CardHeader
          title="Workers"
          subtitle={`${workerEntries.length} active · total ${formatHashrate(totalHashrate)}`}
          icon={<Users className="h-4 w-4" />}
          action={
            <Badge tone="cyan">
              <Cpu className="h-3 w-3" /> {formatHashrate(totalHashrate)}
            </Badge>
          }
        />
        {workerEntries.length === 0 ? (
          <EmptyState
            icon={<Cpu className="h-8 w-8" />}
            title="No active workers"
            hint="Workers appear here a few minutes after they start submitting shares."
          />
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2 font-medium">Worker</th>
                  <th className="px-3 py-2 text-right font-medium">Hashrate</th>
                  <th className="px-3 py-2 text-right font-medium">Shares / s</th>
                  <th className="px-3 py-2 text-right font-medium">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {workerEntries
                  .sort((a, b) => b[1].hashrate - a[1].hashrate)
                  .map(([name, w]) => (
                    <tr key={name} className="transition hover:bg-white/[0.02]">
                      <td className="px-3 py-3">
                        <span className="font-medium text-white">
                          {name || "(default)"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="mono font-medium text-brand-300">
                          {formatHashrate(w.hashrate)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="mono text-slate-300">
                          {trim(w.sharesPerSecond, 2)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="mono text-slate-400">
                          {totalHashrate > 0
                            ? formatPercent((w.hashrate / totalHashrate) * 100, 0)
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <td className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="mono font-bold text-white">
                      {formatHashrate(totalHashrate)}
                    </span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Hashrate chart */}
      <Card>
        <CardHeader
          title="Your Hashrate (24h)"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        {perfQ.isLoading ? (
          <Skeleton className="h-56" />
        ) : perfChart.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            No performance history yet.
          </div>
        ) : (
          <TimeSeriesChart
            data={perfChart}
            height={260}
            series={[
              {
                key: "hashrate",
                label: "Hashrate",
                color: "#2e5cff",
                format: (v) => formatHashrate(v),
              },
            ]}
          />
        )}
      </Card>

      {/* Earnings + block summary */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Daily Earnings"
            subtitle="Paid amounts per day"
            icon={<Coins className="h-4 w-4" />}
          />
          {earningsQ.isLoading ? (
            <Skeleton className="h-52" />
          ) : earningsChart.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No earnings recorded yet.
            </div>
          ) : (
            <EarningsChart
              data={earningsChart}
              symbol={symbol ?? ""}
              format={(v) => formatCoin(v, undefined, 4)}
            />
          )}
        </Card>

        <Card>
          <CardHeader
            title="Your Blocks"
            icon={<Boxes className="h-4 w-4" />}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-4 text-center">
              <div className="text-3xl font-bold text-emerald-300">
                {maturedCount}
              </div>
              <div className="stat-label mt-1">Matured</div>
            </div>
            <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-4 text-center">
              <div className="text-3xl font-bold text-amber-300">
                {pendingCount}
              </div>
              <div className="stat-label mt-1">Pending</div>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Pending shares" value={formatCompact(miner?.pendingShares)} />
            <Row
              label="Miner effort"
              value={formatPercent((miner?.minerEffort ?? 0) * 100, 0)}
            />
            <Row
              label="Last payment"
              value={miner?.lastPayment ? formatDateTime(miner.lastPayment) : "—"}
            />
          </div>
        </Card>
      </div>

      {/* Blocks + payments tables */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Block History" icon={<Boxes className="h-4 w-4" />} />
          {blocksQ.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <BlocksTable blocks={blocks} symbol={symbol} />
          )}
        </Card>
        <Card>
          <CardHeader title="Payment History" icon={<Coins className="h-4 w-4" />} />
          {paymentsQ.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <PaymentsTable payments={paymentsQ.data ?? []} symbol={symbol} />
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="mono font-medium text-white">{value}</span>
    </div>
  );
}
