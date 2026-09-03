import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate } from "@/lib/format";

export interface EarningPoint {
  t: number;
  amount: number;
}

interface Props {
  data: EarningPoint[];
  symbol: string;
  height?: number;
  format: (v: number) => string;
}

export function EarningsChart({ data, symbol, height = 220, format }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-earn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38e1ff" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#2e5cff" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(t) => formatDate(new Date(t as number).toISOString())}
          stroke="rgba(148,163,184,0.5)"
          tick={{ fontSize: 11 }}
          minTickGap={30}
        />
        <YAxis
          stroke="rgba(148,163,184,0.5)"
          tick={{ fontSize: 11 }}
          width={56}
          tickFormatter={(v) => format(v as number)}
        />
        <Tooltip
          cursor={{ fill: "rgba(46,92,255,0.08)" }}
          contentStyle={{
            background: "rgba(11,16,32,0.95)",
            border: "1px solid rgba(46,92,255,0.3)",
            borderRadius: 12,
            fontSize: 12,
          }}
          labelFormatter={(t) =>
            new Date(t as number).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          }
          formatter={(value: number) => [`${format(value)} ${symbol}`, "Earnings"]}
        />
        <Bar dataKey="amount" fill="url(#grad-earn)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
