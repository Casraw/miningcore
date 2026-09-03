// React Query hooks wrapping the API client.

import { useQuery } from "@tanstack/react-query";
import { api, type SampleRange, type SampleInterval } from "./client";

export function usePools() {
  return useQuery({
    queryKey: ["pools"],
    queryFn: ({ signal }) => api.getPools(signal),
    refetchInterval: 30_000,
  });
}

export function usePool(poolId: string | undefined) {
  return useQuery({
    queryKey: ["pool", poolId],
    queryFn: ({ signal }) => api.getPool(poolId!, signal),
    enabled: !!poolId,
    refetchInterval: 30_000,
  });
}

export function usePoolPerformance(
  poolId: string | undefined,
  range: SampleRange = "day",
  interval: SampleInterval = "hour",
) {
  return useQuery({
    queryKey: ["pool-perf", poolId, range, interval],
    queryFn: ({ signal }) =>
      api.getPoolPerformance(poolId!, range, interval, signal),
    enabled: !!poolId,
    refetchInterval: 60_000,
  });
}

export function usePoolBlocks(poolId: string | undefined, page = 0, pageSize = 20) {
  return useQuery({
    queryKey: ["pool-blocks", poolId, page, pageSize],
    queryFn: ({ signal }) => api.getPoolBlocks(poolId!, page, pageSize, signal),
    enabled: !!poolId,
    refetchInterval: 60_000,
  });
}

export function usePoolPayments(poolId: string | undefined, page = 0, pageSize = 20) {
  return useQuery({
    queryKey: ["pool-payments", poolId, page, pageSize],
    queryFn: ({ signal }) => api.getPoolPayments(poolId!, page, pageSize, signal),
    enabled: !!poolId,
    refetchInterval: 60_000,
  });
}

export function useMiner(
  poolId: string | undefined,
  address: string | undefined,
  perfMode: SampleRange = "day",
) {
  return useQuery({
    queryKey: ["miner", poolId, address, perfMode],
    queryFn: ({ signal }) => api.getMiner(poolId!, address!, perfMode, signal),
    enabled: !!poolId && !!address,
    refetchInterval: 30_000,
    retry: 0,
  });
}

export function useMinerPerformance(
  poolId: string | undefined,
  address: string | undefined,
  mode: SampleRange = "day",
) {
  return useQuery({
    queryKey: ["miner-perf", poolId, address, mode],
    queryFn: ({ signal }) =>
      api.getMinerPerformance(poolId!, address!, mode, signal),
    enabled: !!poolId && !!address,
    refetchInterval: 60_000,
    retry: 0,
  });
}

export function useMinerBlocks(
  poolId: string | undefined,
  address: string | undefined,
  page = 0,
  pageSize = 15,
) {
  return useQuery({
    queryKey: ["miner-blocks", poolId, address, page, pageSize],
    queryFn: ({ signal }) =>
      api.getMinerBlocks(poolId!, address!, page, pageSize, signal),
    enabled: !!poolId && !!address,
  });
}

export function useMinerPayments(
  poolId: string | undefined,
  address: string | undefined,
  page = 0,
  pageSize = 15,
) {
  return useQuery({
    queryKey: ["miner-payments", poolId, address, page, pageSize],
    queryFn: ({ signal }) =>
      api.getMinerPayments(poolId!, address!, page, pageSize, signal),
    enabled: !!poolId && !!address,
  });
}

export function useMinerEarnings(
  poolId: string | undefined,
  address: string | undefined,
) {
  return useQuery({
    queryKey: ["miner-earnings", poolId, address],
    queryFn: ({ signal }) => api.getMinerEarnings(poolId!, address!, 0, 30, signal),
    enabled: !!poolId && !!address,
    refetchInterval: 120_000,
  });
}
