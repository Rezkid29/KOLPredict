import { randomUUID } from "crypto";

type LogLevel = "error" | "warn" | "info" | "debug";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function normalizeLogLevel(raw?: string | null): LogLevel {
  if (!raw) return "info";
  const normalized = raw.toLowerCase() as LogLevel;
  return normalized in LEVEL_WEIGHT ? normalized : "info";
}

const BASE_LOG_LEVEL = normalizeLogLevel(process.env.LOG_LEVEL);
const RESOLUTION_VERBOSE = process.env.RESOLUTION_LOG_VERBOSE === "true";
const RESOLUTION_LOG_LEVEL_WEIGHT = RESOLUTION_VERBOSE
  ? LEVEL_WEIGHT.debug
  : LEVEL_WEIGHT[BASE_LOG_LEVEL];

function emitLog(category: string, level: LogLevel, payload: Record<string, unknown>): void {
  if (LEVEL_WEIGHT[level] > LEVEL_WEIGHT[BASE_LOG_LEVEL]) {
    // General log level filtering (non-resolution usage)
    return;
  }

  const entry = {
    ts: new Date().toISOString(),
    level,
    category,
    ...payload,
  };

  try {
    console.log(JSON.stringify(entry));
  } catch (_err) {
    console.log(`[${level.toUpperCase()}][${category}]`, payload);
  }
}

export type ResolutionLogEvent = {
  type:
    | "RESOLUTION_RUN_START"
    | "RESOLUTION_SUMMARY"
    | "FETCH_SCRAPE_SUMMARY"
    | "MISSING_KOL_DATA"
    | "SCRAPE_TRIGGERED"
    | "SCRAPE_RETRY_RESULT"
    | "AUTO_WIN_APPLIED"
    | "FALLBACK_METADATA_APPLIED"
    | "MANUAL_REVIEW_QUEUED";
  runId?: string;
  marketId?: string;
  marketType?: string;
  title?: string;
  metadataKols?: string[];
  scrapedUsernamesSample?: string[];
  rowCount?: number;
  scrapeAgeHours?: number;
  retryCount?: number;
  decision?: string;
  reason?: string;
  totals?: {
    processed: number;
    successes: number;
    failures: number;
    missingKolCount?: number;
  };
};

const RESOLUTION_EVENT_LEVEL: Record<ResolutionLogEvent["type"], LogLevel> = {
  RESOLUTION_RUN_START: "info",
  RESOLUTION_SUMMARY: "info",
  MANUAL_REVIEW_QUEUED: "info",
  FETCH_SCRAPE_SUMMARY: "debug",
  MISSING_KOL_DATA: "debug",
  SCRAPE_TRIGGERED: "debug",
  SCRAPE_RETRY_RESULT: "debug",
  AUTO_WIN_APPLIED: "debug",
  FALLBACK_METADATA_APPLIED: "debug",
};

const RESOLUTION_ALWAYS_ON: ReadonlySet<ResolutionLogEvent["type"]> = new Set<ResolutionLogEvent["type"]>([
  "RESOLUTION_RUN_START",
  "RESOLUTION_SUMMARY",
  "MANUAL_REVIEW_QUEUED",
]);

export function logResolutionEvent(event: ResolutionLogEvent): void {
  const level = RESOLUTION_EVENT_LEVEL[event.type] ?? "info";
  const weight = LEVEL_WEIGHT[level];
  const allowedWeight = RESOLUTION_VERBOSE ? LEVEL_WEIGHT.debug : RESOLUTION_LOG_LEVEL_WEIGHT;

  if (weight > allowedWeight && !RESOLUTION_ALWAYS_ON.has(event.type)) {
    return;
  }

  emitLog("resolution", level, { eventType: event.type, ...event });
}

export function logInfo(message: string, meta: Record<string, unknown> = {}): void {
  emitLog("app", "info", { message, ...meta });
}

export function logWarn(message: string, meta: Record<string, unknown> = {}): void {
  emitLog("app", "warn", { message, ...meta });
}

export function logError(message: string, meta: Record<string, unknown> = {}): void {
  emitLog("app", "error", { message, ...meta });
}

export function newRunId(): string {
  try {
    return randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
