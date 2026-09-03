import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface SeriesPoint {
  t: number; // epoch ms
  [key: string]: number;
}

export interface SeriesDef {
  key: string;
  label: string;
  color: string;
  format: (v: number) => string;
}

interface Props {
  data: SeriesPoint[];
  series: SeriesDef[];
  height?: number;
  xFormat?: (t: number) => string;
}

export function TimeSeriesChart({ data, series, height = 240, xFormat }: Props) {
  const formatX =
    xFormat ??
    ((t: number) =>
      new Date(t).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient
              key={s.key}
              id={`grad-${s.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
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
          tickFormatter={formatX}
          stroke="rgba(148,163,184,0.5)"
          tick={{ fontSize: 11 }}
          minTickGap={40}
        />
        <YAxis
          stroke="rgba(148,163,184,0.5)"
          tick={{ fontSize: 11 }}
          width={56}
          tickFormatter={(v) => series[0]?.format(v as number) ?? String(v)}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(11,16,32,0.95)",
            border: "1px solid rgba(46,92,255,0.3)",
            borderRadius: 12,
            fontSize: 12,
            boxShadow: "0 20px 40px -20px rgba(0,0,0,0.8)",
          }}
          labelStyle={{ color: "#cbd5e1", marginBottom: 4 }}
          labelFormatter={(t) =>
            new Date(t as number).toLocaleString(undefined, {
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          }
          formatter={(value: number, _name, item) => {
            const def = series.find((s) => s.key === item.dataKey);
            return [def ? def.format(value) : value, def?.label ?? ""];
          }}
        />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
