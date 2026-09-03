// Formatting + estimation helpers for the dashboard.

const HASH_UNITS = ["H/s", "KH/s", "MH/s", "GH/s", "TH/s", "PH/s", "EH/s", "ZH/s"];
const PLAIN_UNITS = ["", "K", "M", "B", "T", "P", "E"];

/** Format a hashrate (hashes per second) with an adaptive SI unit. */
export function formatHashrate(hps: number | null | undefined, digits = 2): string {
  if (hps == null || !isFinite(hps) || hps <= 0) return "0 H/s";
  const i = Math.min(
    HASH_UNITS.length - 1,
    Math.floor(Math.log(hps) / Math.log(1000)),
  );
  const value = hps / Math.pow(1000, i);
  return `${trim(value, digits)} ${HASH_UNITS[i]}`;
}

/** Format a large plain number (difficulty, shares) with K/M/B/T suffixes. */
export function formatCompact(n: number | null | undefined, digits = 2): string {
  if (n == null || !isFinite(n)) return "0";
  if (Math.abs(n) < 1000) return trim(n, n < 1 ? 4 : 2);
  const i = Math.min(
    PLAIN_UNITS.length - 1,
    Math.floor(Math.log(Math.abs(n)) / Math.log(1000)),
  );
  const value = n / Math.pow(1000, i);
  return `${trim(value, digits)}${PLAIN_UNITS[i]}`;
}

/** Format a coin amount with a sensible number of decimals. */
export function formatCoin(
  amount: number | null | undefined,
  symbol?: string,
  digits = 8,
): string {
  if (amount == null || !isFinite(amount)) return symbol ? `0 ${symbol}` : "0";
  // Trim trailing zeros but keep at least 2 decimals for readability.
  const fixed = amount.toFixed(digits);
  const trimmed = fixed.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, ".0");
  const out = trimmed.endsWith(".") ? `${trimmed}0` : trimmed;
  return symbol ? `${out} ${symbol}` : out;
}

/** Short number with fixed decimals, trailing zeros trimmed. */
export function trim(n: number, digits = 2): string {
  if (!isFinite(n)) return "0";
  const s = n.toFixed(digits);
  return s.replace(/\.?0+$/, "") || "0";
}

export function formatInt(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "0";
  return Math.round(n).toLocaleString("en-US");
}

export function formatPercent(n: number | null | undefined, digits = 1): string {
  if (n == null || !isFinite(n)) return "0%";
  return `${trim(n, digits)}%`;
}

/** Human friendly duration from seconds, e.g. "2d 4h", "13 min", "~3 years". */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !isFinite(seconds) || seconds <= 0) return "—";
  if (seconds === Infinity) return "∞";

  const units: [string, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3_600],
    ["min", 60],
    ["sec", 1],
  ];

  for (let i = 0; i < units.length; i++) {
    const [label, secs] = units[i];
    if (seconds >= secs) {
      const value = Math.floor(seconds / secs);
      const rest = Math.floor((seconds % secs) / (units[i + 1]?.[1] ?? 1));
      const main = `${value} ${label}${value !== 1 ? "s" : ""}`;
      if (rest > 0 && i < units.length - 1) {
        const [nLabel, _] = units[i + 1];
        return `${main} ${rest} ${nLabel}${rest !== 1 ? "s" : ""}`;
      }
      return main;
    }
  }
  return "< 1 sec";
}

/** Relative time from an ISO timestamp, e.g. "3 min ago", "just now". */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "—";
  const diff = (Date.now() - then) / 1000;
  if (diff < 5) return "just now";
  if (diff < 0) return "in the future";
  return `${formatDuration(diff)} ago`;
}

/** Absolute local date-time. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
  });
}

/**
 * Statistical estimate of the expected time (in seconds) for a given hashrate
 * to find a block at the current network difficulty.
 *
 * For SHA-256 / most PoW coins: expectedSeconds = difficulty * 2^32 / hashrate.
 * This is a long-run average, not a countdown — actual times vary widely.
 */
export function estimateTimeToBlock(
  hashrate: number | null | undefined,
  networkDifficulty: number | null | undefined,
): number {
  if (
    !hashrate ||
    !networkDifficulty ||
    hashrate <= 0 ||
    networkDifficulty <= 0 ||
    !isFinite(hashrate) ||
    !isFinite(networkDifficulty)
  ) {
    return Infinity;
  }
  return (networkDifficulty * 2 ** 32) / hashrate;
}

/** Shorten a long hash/address for display. */
export function shortHash(s: string | null | undefined, head = 8, tail = 6): string {
  if (!s) return "—";
  if (s.length <= head + tail + 3) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

/** Sum worker hashrates from a MinerStats.performance.workers map. */
export function sumWorkerHashrate(
  workers: Record<string, { hashrate: number }> | null | undefined,
): number {
  if (!workers) return 0;
  return Object.values(workers).reduce((acc, w) => acc + (w.hashrate || 0), 0);
}
