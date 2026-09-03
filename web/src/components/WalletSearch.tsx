import { useEffect, useState } from "react";
import { Search, Wallet } from "lucide-react";
import { usePools } from "@/api/hooks";
import { coinLabel } from "@/lib/pool";

interface Props {
  initialPoolId?: string;
  initialAddress?: string;
  onSubmit: (poolId: string, address: string) => void;
}

export function WalletSearch({ initialPoolId, initialAddress, onSubmit }: Props) {
  const { data } = usePools();
  const pools = data?.pools ?? [];
  const [poolId, setPoolId] = useState(initialPoolId ?? "");
  const [address, setAddress] = useState(initialAddress ?? "");

  useEffect(() => {
    if (!poolId && pools.length) setPoolId(initialPoolId ?? pools[0].id);
  }, [pools, poolId, initialPoolId]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const addr = address.trim();
        if (addr && poolId) onSubmit(poolId, addr);
      }}
      className="card p-5"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-brand-500/10 text-brand-300">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Wallet lookup</h2>
          <p className="text-xs text-slate-400">
            Enter your mining address to see live earnings and workers.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={poolId}
          onChange={(e) => setPoolId(e.target.value)}
          className="input sm:w-56"
        >
          {pools.length === 0 && <option value="">Loading pools…</option>}
          {pools.map((p) => (
            <option key={p.id} value={p.id} className="bg-ink-900">
              {coinLabel(p)} ({p.coin?.symbol})
            </option>
          ))}
        </select>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your wallet address…"
            className="input pl-10"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>

        <button type="submit" className="btn-primary sm:w-auto" disabled={!poolId}>
          <Search className="h-4 w-4" /> Look up
        </button>
      </div>
    </form>
  );
}
