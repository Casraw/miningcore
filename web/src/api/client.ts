// Thin typed fetch wrapper around the Miningcore REST API.
// The API is served under the same origin at /api (via Traefik in production,
// via the Vite dev proxy in development).

import type {
  Block,
  BalanceChange,
  AmountByDate,
  GetPoolResponse,
  GetPoolsResponse,
  GetPoolStatsResponse,
  MinerStats,
  Payment,
  WorkerPerformanceStatsContainer,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.responseMessageType && body?.message) detail = body.message;
    } catch {
      /* ignore parse errors */
    }
    throw new ApiError(detail || `Request failed (${res.status})`, res.status);
  }

  return (await res.json()) as T;
}

export type SampleRange = "day" | "month";
export type SampleInterval = "hour" | "day";

export const api = {
  getPools: (signal?: AbortSignal) =>
    get<GetPoolsResponse>("/pools", signal),

  getPool: (poolId: string, signal?: AbortSignal) =>
    get<GetPoolResponse>(`/pools/${encodeURIComponent(poolId)}`, signal),

  getPoolPerformance: (
    poolId: string,
    range: SampleRange = "day",
    interval: SampleInterval = "hour",
    signal?: AbortSignal,
  ) =>
    get<GetPoolStatsResponse>(
      `/pools/${encodeURIComponent(poolId)}/performance?r=${range}&i=${interval}`,
      signal,
    ),

  getPoolBlocks: (poolId: string, page = 0, pageSize = 20, signal?: AbortSignal) =>
    get<Block[]>(
      `/pools/${encodeURIComponent(poolId)}/blocks?page=${page}&pageSize=${pageSize}`,
      signal,
    ),

  getPoolPayments: (poolId: string, page = 0, pageSize = 20, signal?: AbortSignal) =>
    get<Payment[]>(
      `/pools/${encodeURIComponent(poolId)}/payments?page=${page}&pageSize=${pageSize}`,
      signal,
    ),

  getMiner: (
    poolId: string,
    address: string,
    perfMode: SampleRange = "day",
    signal?: AbortSignal,
  ) =>
    get<MinerStats>(
      `/pools/${encodeURIComponent(poolId)}/miners/${encodeURIComponent(
        address,
      )}?perfMode=${perfMode}`,
      signal,
    ),

  getMinerPerformance: (
    poolId: string,
    address: string,
    mode: SampleRange = "day",
    signal?: AbortSignal,
  ) =>
    get<WorkerPerformanceStatsContainer[]>(
      `/pools/${encodeURIComponent(poolId)}/miners/${encodeURIComponent(
        address,
      )}/performance?mode=${mode}`,
      signal,
    ),

  getMinerBlocks: (
    poolId: string,
    address: string,
    page = 0,
    pageSize = 15,
    signal?: AbortSignal,
  ) =>
    get<Block[]>(
      `/pools/${encodeURIComponent(poolId)}/miners/${encodeURIComponent(
        address,
      )}/blocks?page=${page}&pageSize=${pageSize}`,
      signal,
    ),

  getMinerPayments: (
    poolId: string,
    address: string,
    page = 0,
    pageSize = 15,
    signal?: AbortSignal,
  ) =>
    get<Payment[]>(
      `/pools/${encodeURIComponent(poolId)}/miners/${encodeURIComponent(
        address,
      )}/payments?page=${page}&pageSize=${pageSize}`,
      signal,
    ),

  getMinerBalanceChanges: (
    poolId: string,
    address: string,
    page = 0,
    pageSize = 15,
    signal?: AbortSignal,
  ) =>
    get<BalanceChange[]>(
      `/pools/${encodeURIComponent(poolId)}/miners/${encodeURIComponent(
        address,
      )}/balancechanges?page=${page}&pageSize=${pageSize}`,
      signal,
    ),

  getMinerEarnings: (
    poolId: string,
    address: string,
    page = 0,
    pageSize = 30,
    signal?: AbortSignal,
  ) =>
    get<AmountByDate[]>(
      `/pools/${encodeURIComponent(poolId)}/miners/${encodeURIComponent(
        address,
      )}/earnings/daily?page=${page}&pageSize=${pageSize}`,
      signal,
    ),
};
