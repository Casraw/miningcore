// Types mirroring the Miningcore REST API responses.
// Only the fields the dashboard consumes are declared; the API returns more.

export interface ApiCoinConfig {
  type: string;
  name: string;
  symbol: string;
  website?: string;
  market?: string;
  family?: string;
  algorithm?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  canonicalName?: string;
}

export interface PoolEndpoint {
  listenAddress: string;
  name?: string;
  difficulty: number;
  varDiff?: {
    minDiff: number;
    maxDiff?: number | null;
    targetTime: number;
    retargetTime: number;
    variancePercent?: number;
  } | null;
  tls?: boolean;
  tlsAuto?: boolean;
}

export interface PoolStats {
  lastPoolBlockTime?: string | null;
  connectedMiners: number;
  poolHashrate: number;
  sharesPerSecond: number;
}

export interface BlockchainStats {
  networkType?: string;
  networkHashrate: number;
  networkDifficulty: number;
  lastNetworkBlockTime?: string | null;
  blockHeight: number;
  connectedPeers: number;
  nodeVersion?: string;
  rewardType?: string;
}

export interface PayoutSchemeConfig {
  factor?: number | null;
  blockFinderPercentage?: number | null;
}

export interface PoolPaymentProcessingConfig {
  enabled: boolean;
  minimumPayment: number;
  payoutScheme: string;
  payoutSchemeConfig?: PayoutSchemeConfig | null;
  // Miningcore serializes unknown extra fields here (e.g. interval isn't exposed).
  [key: string]: unknown;
}

export interface MinerPerformanceStats {
  miner: string;
  hashrate: number;
  sharesPerSecond: number;
}

export interface PoolInfo {
  id: string;
  coin: ApiCoinConfig;
  ports: Record<string, PoolEndpoint>;
  paymentProcessing: PoolPaymentProcessingConfig;
  clientConnectionTimeout: number;
  jobRebroadcastTimeout: number;
  blockRefreshInterval: number;
  poolFeePercent: number;
  address: string;
  addressInfoLink?: string;
  poolStats: PoolStats;
  networkStats: BlockchainStats;
  topMiners: MinerPerformanceStats[];
  totalPaid: number;
  totalBlocks: number;
  lastPoolBlockTime?: string | null;
  poolEffort: number;
}

export interface GetPoolsResponse {
  pools: PoolInfo[];
}

export interface GetPoolResponse {
  pool: PoolInfo;
}

export interface AggregatedPoolStats {
  poolHashrate: number;
  connectedMiners: number;
  validSharesPerSecond: number;
  networkHashrate: number;
  networkDifficulty: number;
  created: string;
}

export interface GetPoolStatsResponse {
  stats: AggregatedPoolStats[];
}

export type BlockStatus = "pending" | "confirmed" | "orphaned" | string;

export interface Block {
  poolId: string;
  blockHeight: number;
  networkDifficulty: number;
  status: BlockStatus;
  type?: string;
  confirmationProgress: number;
  effort?: number | null;
  minerEffort?: number | null;
  transactionConfirmationData?: string;
  reward: number;
  infoLink?: string;
  hash?: string;
  miner?: string;
  source?: string;
  created: string;
}

export interface Payment {
  coin: string;
  address: string;
  addressInfoLink?: string;
  amount: number;
  transactionConfirmationData?: string;
  transactionInfoLink?: string;
  created: string;
}

export interface BalanceChange {
  poolId?: string;
  address?: string;
  amount: number;
  usage?: string;
  created: string;
}

export interface AmountByDate {
  amount: number;
  date: string;
}

export interface WorkerPerformanceStats {
  hashrate: number;
  sharesPerSecond: number;
}

export interface WorkerPerformanceStatsContainer {
  created: string;
  workers: Record<string, WorkerPerformanceStats>;
}

export interface MinerStats {
  pendingShares: number;
  pendingBalance: number;
  totalPaid: number;
  todayPaid: number;
  minerEffort: number;
  lastPayment?: string | null;
  lastPaymentLink?: string;
  performance?: WorkerPerformanceStatsContainer | null;
  performanceSamples?: WorkerPerformanceStatsContainer[];
}

export interface PagedResult<T> {
  result: T;
  pageCount: number;
  pageSize: number;
  count?: number;
  total?: number;
}
