import { ExternalLink, Coins } from "lucide-react";
import type { Payment } from "@/api/types";
import { formatCoin, timeAgo, shortHash } from "@/lib/format";
import { EmptyState } from "./ui/misc";

export function PaymentsTable({
  payments,
  symbol,
  showAddress = false,
}: {
  payments: Payment[];
  symbol?: string;
  showAddress?: boolean;
}) {
  if (!payments.length) {
    return (
      <EmptyState
        icon={<Coins className="h-8 w-8" />}
        title="No payments yet"
        hint="Payouts are sent once your pending balance reaches the pool minimum."
      />
    );
  }

  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
            <th className="px-3 py-2 font-medium">Date</th>
            {showAddress && <th className="px-3 py-2 font-medium">Address</th>}
            <th className="px-3 py-2 font-medium">Transaction</th>
            <th className="px-3 py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {payments.map((p, i) => (
            <tr key={i} className="transition hover:bg-white/[0.02]">
              <td className="px-3 py-3 text-xs text-slate-300">
                {timeAgo(p.created)}
              </td>
              {showAddress && (
                <td className="px-3 py-3">
                  <span className="mono text-xs text-slate-400">
                    {shortHash(p.address)}
                  </span>
                </td>
              )}
              <td className="px-3 py-3">
                {p.transactionInfoLink ? (
                  <a
                    href={p.transactionInfoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mono flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200"
                  >
                    {shortHash(p.transactionConfirmationData)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="mono text-xs text-slate-400">
                    {shortHash(p.transactionConfirmationData)}
                  </span>
                )}
              </td>
              <td className="px-3 py-3 text-right">
                <span className="mono font-medium text-emerald-300">
                  {formatCoin(p.amount, symbol, 6)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
