import type { PoolInfo, PoolEndpoint } from "@/api/types";

/** Public stratum hostname miners connect to. Configurable at build time. */
export const STRATUM_HOST =
  import.meta.env.VITE_STRATUM_HOST ?? "new.mining-pool.io";

export interface ConnectionInfo {
  port: number;
  endpoint: PoolEndpoint;
  name: string;
  difficulty: number;
  tls: boolean;
  url: string;
}

/** Build the list of stratum connection endpoints for a pool. */
export function connectionsFor(pool: PoolInfo): ConnectionInfo[] {
  return Object.entries(pool.ports ?? {})
    .map(([portStr, ep]) => {
      const port = Number(portStr);
      const tls = !!ep.tls;
      const scheme = tls ? "stratum+ssl" : "stratum+tcp";
      return {
        port,
        endpoint: ep,
        name: ep.name || `Port ${port}`,
        difficulty: ep.difficulty,
        tls,
        url: `${scheme}://${STRATUM_HOST}:${port}`,
      };
    })
    .sort((a, b) => a.port - b.port);
}

/** A pool is considered "live" when it currently has connected miners or hashrate. */
export function isPoolLive(pool: PoolInfo): boolean {
  return (
    (pool.poolStats?.connectedMiners ?? 0) > 0 ||
    (pool.poolStats?.poolHashrate ?? 0) > 0
  );
}

export function coinLabel(pool: PoolInfo): string {
  return pool.coin?.name || pool.coin?.canonicalName || pool.id;
}

export function algoLabel(pool: PoolInfo): string {
  return pool.coin?.algorithm || pool.coin?.type || "—";
}

/** Normalize block status into a display tone. */
export function blockTone(
  status: string,
): "green" | "amber" | "rose" | "slate" {
  const s = status?.toLowerCase();
  if (s === "confirmed") return "green";
  if (s === "pending") return "amber";
  if (s === "orphaned") return "rose";
  return "slate";
}
