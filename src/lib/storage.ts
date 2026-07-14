// Persistence for subscriptions, backed by ctx.api.storage — a durable,
// SQLite-backed per-addon KV store (Wealthfolio 3.6.2+), used instead of
// localStorage, which is unavailable in the sandboxed iframe Wealthfolio 3.6
// runs addons in. Each collection is stored as a single JSON blob (the store
// caps values at ~250KB, comfortably enough for this addon's data), so unlike
// the old ctx.api.secrets-backed store (see migrateLegacySecretsIfNeeded)
// there's no need to split collections into per-item keys with an index.
import { getContext } from "../context";

export type BillingCycle = "monthly" | "yearly" | "quarterly" | "weekly";

export const CATEGORIES = [
  "Entertainment",
  "Productivity",
  "Health & Fitness",
  "Finance",
  "News & Media",
  "Education",
  "Cloud & Storage",
  "Communication",
  "Shopping",
  "Utilities",
  "Other",
] as const;

export type SubscriptionCategory = (typeof CATEGORIES)[number];

export const CURRENCIES = [
  "USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK",
  "NZD", "SGD", "HKD", "BRL", "MXN", "INR", "KRW", "PLN", "CZK", "HUF",
] as const;

export type Currency = (typeof CURRENCIES)[number];

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  billingCycle: BillingCycle;
  category: SubscriptionCategory;
  website?: string;    // optional — used to auto-fetch favicon
  startDate?: string;  // ISO date string
  notes?: string;
  active: boolean;
}

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "/ mo",
  yearly: "/ yr",
  quarterly: "/ qtr",
  weekly: "/ wk",
};

// Category colors — one distinct hue per category, no hue family repeated more than once.
export const CATEGORY_COLORS: Record<SubscriptionCategory, { bg: string; color: string }> = {
  "Entertainment":    { bg: "rgba(148,97,212,0.15)",  color: "#9461d4" },  // purple
  "Productivity":     { bg: "rgba(77,125,204,0.15)",  color: "#4d7dcc" },  // blue
  "Health & Fitness": { bg: "rgba(54,161,93,0.15)",   color: "#36a15d" },  // green
  "Finance":          { bg: "rgba(181,128,38,0.15)",  color: "#b58026" },  // amber
  "News & Media":     { bg: "rgba(198,83,133,0.15)",  color: "#c65385" },  // rose
  "Education":        { bg: "rgba(59,176,164,0.15)",  color: "#3bb0a4" },  // teal
  "Cloud & Storage":  { bg: "rgba(114,140,53,0.15)",  color: "#728c35" },  // olive
  "Communication":    { bg: "rgba(91,92,200,0.15)",   color: "#5b5cc8" },  // indigo
  "Shopping":         { bg: "rgba(175,140,44,0.15)",  color: "#af8c2c" },  // gold
  "Utilities":        { bg: "rgba(210,114,45,0.15)",  color: "#d2722d" },  // orange
  "Other":            { bg: "rgba(128,149,179,0.12)", color: "#8095b3" },  // slate
};

// ─── Bills ────────────────────────────────────────────────────────────────────

export const BILL_CATEGORIES = [
  "Electricity",
  "Water",
  "Gas",
  "Internet",
  "Phone",
  "Rent",
  "Insurance",
  "Other",
] as const;

export type BillCategory = (typeof BILL_CATEGORIES)[number];

export const BILL_CATEGORY_COLORS: Record<BillCategory, { bg: string; color: string }> = {
  "Electricity": { bg: "rgba(175,140,44,0.15)",  color: "#af8c2c" },  // gold
  "Water":       { bg: "rgba(59,176,164,0.15)",  color: "#3bb0a4" },  // teal
  "Gas":         { bg: "rgba(210,114,45,0.15)",  color: "#d2722d" },  // orange
  "Internet":    { bg: "rgba(91,92,200,0.15)",   color: "#5b5cc8" },  // indigo
  "Phone":       { bg: "rgba(198,83,133,0.15)",  color: "#c65385" },  // rose
  "Rent":        { bg: "rgba(200,64,64,0.15)",   color: "#c84040" },  // red
  "Insurance":   { bg: "rgba(54,161,93,0.15)",   color: "#36a15d" },  // green
  "Other":       { bg: "rgba(128,149,179,0.12)", color: "#8095b3" },  // slate
};

export interface Bill {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  category: BillCategory;
  date: string;   // ISO date — when the bill arrived / is due
  website?: string;
  notes?: string;
  paid: boolean;
  recurring: boolean;
  billingCycle?: BillingCycle; // only meaningful when recurring === true
}

// ─── Storage-backed cache ─────────────────────────────────────────────────────

const SUBSCRIPTIONS_KEY = "ss.subscriptions";
const BILLS_KEY = "ss.bills";
const SETTINGS_KEY = "ss.settings";
const SYNC_LOG_KEY = "ss.synclog";
const MIGRATION_MARKER_KEY = "ss.migrated.storage-api";

let hydrated = false;

/**
 * True once hydrateStorage() has loaded the KV store into the cache.
 * Writes before this point would read a still-empty cache and overwrite
 * whatever's on disk with an incomplete snapshot — callers must gate
 * mutations (e.g. disable "Add") on this until it's true.
 */
export function isHydrated(): boolean {
  return hydrated;
}

function sanitizeKeySegment(raw: string): string {
  // storage keys may only contain ASCII letters, digits, '.', '_', ':' and '-'
  return raw.replace(/[^A-Za-z0-9._:-]/g, "_");
}

// Writes are serialized so two never land out of order and clobber each
// other with a stale snapshot (each write sends the whole current cache).
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueueWrite<T>(op: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(op, op);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function storageGet(key: string): Promise<string | null> {
  return getContext().api.storage.get(key);
}

function storageSet(key: string, value: string): Promise<void> {
  return enqueueWrite(() => getContext().api.storage.set(key, value));
}

function storageDelete(key: string): Promise<void> {
  return enqueueWrite(() => getContext().api.storage.delete(key));
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await storageGet(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (err: unknown) {
    getContext().api.logger.error(`Failed to read "${key}": ${String(err)}`);
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  storageSet(key, JSON.stringify(value)).catch((err: unknown) => {
    getContext().api.logger.error(`Failed to persist "${key}": ${String(err)}`);
  });
}

let subsCache: Subscription[] = [];
let billsCache: Bill[] = [];
let syncLogCache: Record<string, string> = {};
let settingsCache: string | null = null;
let subLogoCache: Record<string, string> = {};
let subLogoIds: string[] = [];
let billLogoCache: Record<string, string> = {};
let billLogoIds: string[] = [];

/** Load subscriptions, bills, settings, the sync log, and logos from the host storage store. */
export async function hydrateStorage(): Promise<void> {
  await migrateLegacySecretsIfNeeded();

  const [subs, bills, syncLog, settingsRaw, subLogos, billLogos] = await Promise.all([
    readJson<Subscription[]>(SUBSCRIPTIONS_KEY, []),
    readJson<Bill[]>(BILLS_KEY, []),
    readJson<Record<string, string>>(SYNC_LOG_KEY, {}),
    storageGet(SETTINGS_KEY),
    loadLogos("sub"),
    loadLogos("bill"),
  ]);
  subsCache = subs;
  billsCache = bills;
  syncLogCache = syncLog;
  settingsCache = settingsRaw;
  subLogoCache = subLogos.cache;
  subLogoIds = subLogos.ids;
  billLogoCache = billLogos.cache;
  billLogoIds = billLogos.ids;
  hydrated = true;
  window.dispatchEvent(new CustomEvent("ss:storage-hydrated"));
}

// ─── Legacy migration ─────────────────────────────────────────────────────────
// Wealthfolio versions before 3.6.2 gave addons no durable storage other than
// ctx.api.secrets (OS keyring-backed, capped at 2560 chars/value), so this
// addon split each collection into one secret per item plus an index, and
// chunked logos into ~1000-char pieces. ctx.api.storage removes the reason
// for all of that — this one-time pass reads any pre-3.6.2 data out of
// secrets, writes it into the new storage keys, and deletes the old secrets
// so they don't linger in the keyring. Runs once, gated by a marker key.

function itemKey(prefix: string, id: string): string {
  return `ss.${prefix}.${sanitizeKeySegment(id)}`;
}

function indexKey(prefix: string): string {
  return `ss.${prefix}.index`;
}

async function loadLegacyCollection<T>(
  secrets: { get(key: string): Promise<string | null> },
  prefix: string,
): Promise<{ items: T[]; ids: string[] }> {
  try {
    const indexRaw = await secrets.get(indexKey(prefix));
    const ids: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    const items: (T | null)[] = await Promise.all(
      ids.map(async (id): Promise<T | null> => {
        try {
          const raw = await secrets.get(itemKey(prefix, id));
          return raw ? (JSON.parse(raw) as T) : null;
        } catch {
          return null;
        }
      }),
    );
    return { items: items.filter((item): item is T => item !== null), ids };
  } catch {
    return { items: [], ids: [] };
  }
}

async function loadLegacyChunkedValue(
  secrets: { get(key: string): Promise<string | null> },
  prefix: string,
  id: string,
): Promise<{ value: string | null; chunkCount: number }> {
  try {
    const metaRaw = await secrets.get(itemKey(prefix, id));
    if (!metaRaw) return { value: null, chunkCount: 0 };
    const meta = JSON.parse(metaRaw) as { chunks: number };
    const chunks = await Promise.all(
      Array.from({ length: meta.chunks }, (_, i) => secrets.get(`${itemKey(prefix, id)}.c${i}`)),
    );
    if (chunks.some((c) => c === null)) return { value: null, chunkCount: meta.chunks };
    return { value: chunks.join(""), chunkCount: meta.chunks };
  } catch {
    return { value: null, chunkCount: 0 };
  }
}

async function loadLegacyLogos(
  secrets: { get(key: string): Promise<string | null> },
  prefix: string,
): Promise<{ cache: Record<string, string>; chunkCounts: Record<string, number> }> {
  const indexRaw = await secrets.get(indexKey(prefix)).catch(() => null);
  const ids: string[] = indexRaw ? JSON.parse(indexRaw) : [];
  const loaded = await Promise.all(ids.map((id) => loadLegacyChunkedValue(secrets, prefix, id)));
  const cache: Record<string, string> = {};
  const chunkCounts: Record<string, number> = {};
  ids.forEach((id, i) => {
    if (loaded[i].value !== null) cache[id] = loaded[i].value as string;
    chunkCounts[id] = loaded[i].chunkCount;
  });
  return { cache, chunkCounts };
}

async function migrateLegacySecretsIfNeeded(): Promise<void> {
  const marker = await storageGet(MIGRATION_MARKER_KEY).catch(() => null);
  if (marker) return;

  const secrets = getContext().api.secrets;

  const [subs, bills, syncLog, settingsRaw, subLogos, billLogos] = await Promise.all([
    loadLegacyCollection<Subscription>(secrets, "sub"),
    loadLegacyCollection<Bill>(secrets, "bill"),
    loadLegacyCollection<string>(secrets, "synclog"),
    secrets.get(SETTINGS_KEY).catch(() => null),
    loadLegacyLogos(secrets, "logo-sub"),
    loadLegacyLogos(secrets, "logo-bill"),
  ]);

  const subLogoIdsFound = Object.keys(subLogos.cache);
  const billLogoIdsFound = Object.keys(billLogos.cache);
  const foundLegacyData =
    subs.items.length > 0 ||
    bills.items.length > 0 ||
    syncLog.items.length > 0 ||
    !!settingsRaw ||
    subLogoIdsFound.length > 0 ||
    billLogoIdsFound.length > 0;

  if (foundLegacyData) {
    const syncLogEntries = Object.fromEntries(
      syncLog.ids.map((id, i) => [id, syncLog.items[i]]).filter(([, v]) => v !== undefined),
    );
    await Promise.all([
      storageSet(SUBSCRIPTIONS_KEY, JSON.stringify(subs.items)),
      storageSet(BILLS_KEY, JSON.stringify(bills.items)),
      storageSet(SYNC_LOG_KEY, JSON.stringify(syncLogEntries)),
      settingsRaw ? storageSet(SETTINGS_KEY, settingsRaw) : Promise.resolve(),
      ...subLogoIdsFound.map((id) => storageSet(itemKey("logo.sub", id), subLogos.cache[id])),
      subLogoIdsFound.length ? storageSet(indexKey("logo.sub"), JSON.stringify(subLogoIdsFound)) : Promise.resolve(),
      ...billLogoIdsFound.map((id) => storageSet(itemKey("logo.bill", id), billLogos.cache[id])),
      billLogoIdsFound.length ? storageSet(indexKey("logo.bill"), JSON.stringify(billLogoIdsFound)) : Promise.resolve(),
    ]);

    const legacyKeysToDelete = [
      SETTINGS_KEY,
      indexKey("sub"), ...subs.ids.map((id) => itemKey("sub", id)),
      indexKey("bill"), ...bills.ids.map((id) => itemKey("bill", id)),
      indexKey("synclog"), ...syncLog.ids.map((id) => itemKey("synclog", id)),
      indexKey("logo-sub"),
      ...Object.keys(subLogos.chunkCounts).flatMap((id) =>
        Array.from({ length: subLogos.chunkCounts[id] }, (_, i) => `${itemKey("logo-sub", id)}.c${i}`).concat(
          itemKey("logo-sub", id),
        ),
      ),
      indexKey("logo-bill"),
      ...Object.keys(billLogos.chunkCounts).flatMap((id) =>
        Array.from({ length: billLogos.chunkCounts[id] }, (_, i) => `${itemKey("logo-bill", id)}.c${i}`).concat(
          itemKey("logo-bill", id),
        ),
      ),
    ];
    await Promise.all(legacyKeysToDelete.map((key) => secrets.delete(key).catch(() => {})));
    getContext().api.logger.info(
      `Migrated legacy secrets-backed data to storage API: ${subs.items.length} subscriptions, ${bills.items.length} bills`,
    );
  }

  await storageSet(MIGRATION_MARKER_KEY, "1");
}

// ─── Logos ────────────────────────────────────────────────────────────────────
// Keyed individually rather than folded into one blob, since they're looked
// up by subscription/bill id and added/removed independently. An index lists
// the ids that currently have a logo, since the storage API has no key
// listing/enumeration of its own.

export type LogoKind = "sub" | "bill";

function logoPrefix(kind: LogoKind): string {
  return kind === "sub" ? "logo.sub" : "logo.bill";
}

async function loadLogos(kind: LogoKind): Promise<{ cache: Record<string, string>; ids: string[] }> {
  const prefix = logoPrefix(kind);
  const ids = await readJson<string[]>(indexKey(prefix), []);
  const values = await Promise.all(ids.map((id) => storageGet(itemKey(prefix, id))));
  const cache = Object.fromEntries(
    ids.map((id, i) => [id, values[i]]).filter((entry): entry is [string, string] => entry[1] !== null),
  );
  return { cache, ids: Object.keys(cache) };
}

export function getLogo(kind: LogoKind, id: string): string | null {
  return (kind === "sub" ? subLogoCache : billLogoCache)[id] ?? null;
}

/** Returns true if the logo was saved successfully. */
export async function saveLogo(kind: LogoKind, id: string, dataUri: string): Promise<boolean> {
  const prefix = logoPrefix(kind);
  try {
    await storageSet(itemKey(prefix, id), dataUri);
  } catch (err: unknown) {
    getContext().api.logger.error(`Failed to persist logo ${prefix}/${id}: ${String(err)}`);
    getContext().api.toast.error("Couldn't save that logo — it may still be too large. Try a smaller image.");
    return false;
  }
  if (kind === "sub") {
    subLogoCache = { ...subLogoCache, [id]: dataUri };
    if (!subLogoIds.includes(id)) {
      subLogoIds = [id, ...subLogoIds];
      writeJson(indexKey(prefix), subLogoIds);
    }
  } else {
    billLogoCache = { ...billLogoCache, [id]: dataUri };
    if (!billLogoIds.includes(id)) {
      billLogoIds = [id, ...billLogoIds];
      writeJson(indexKey(prefix), billLogoIds);
    }
  }
  return true;
}

export function deleteLogo(kind: LogoKind, id: string): void {
  const prefix = logoPrefix(kind);
  storageDelete(itemKey(prefix, id)).catch(() => {});
  if (kind === "sub") {
    const { [id]: _removed, ...rest } = subLogoCache;
    subLogoCache = rest;
    subLogoIds = subLogoIds.filter((existing) => existing !== id);
    writeJson(indexKey(prefix), subLogoIds);
  } else {
    const { [id]: _removed, ...rest } = billLogoCache;
    billLogoCache = rest;
    billLogoIds = billLogoIds.filter((existing) => existing !== id);
    writeJson(indexKey(prefix), billLogoIds);
  }
}

// ─── Bills ────────────────────────────────────────────────────────────────────

export function getBills(): Bill[] {
  return billsCache;
}

export function saveBill(bill: Bill): void {
  const idx = billsCache.findIndex((b) => b.id === bill.id);
  billsCache = idx >= 0
    ? billsCache.map((b, i) => (i === idx ? bill : b))
    : [bill, ...billsCache];
  writeJson(BILLS_KEY, billsCache);
}

export function deleteBill(id: string): void {
  billsCache = billsCache.filter((b) => b.id !== id);
  writeJson(BILLS_KEY, billsCache);
}

// ─── Addon settings ───────────────────────────────────────────────────────────

export interface AddonSettings {
  billsEnabled: boolean;
  syncAccountId: string | null; // null = sync disabled
}

export const DEFAULT_SETTINGS: AddonSettings = { billsEnabled: true, syncAccountId: null };

export function getSettings(): AddonSettings {
  try {
    if (!settingsCache) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsCache) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AddonSettings): void {
  settingsCache = JSON.stringify(settings);
  storageSet(SETTINGS_KEY, settingsCache).catch((err: unknown) => {
    getContext().api.logger.error(`Failed to persist settings: ${String(err)}`);
  });
  window.dispatchEvent(new CustomEvent("ss:settings-changed"));
}

// ─── Sync log ─────────────────────────────────────────────────────────────────
// Maps "${subId}:${date}" → activityId so we never push the same charge twice.

export function getSyncLog(): Record<string, string> {
  return syncLogCache;
}

export function updateSyncLog(entries: Record<string, string>): void {
  syncLogCache = { ...syncLogCache, ...entries };
  writeJson(SYNC_LOG_KEY, syncLogCache);
}

export function getSyncLogCount(): number {
  return Object.keys(syncLogCache).length;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Extract a clean hostname from a website string entered by the user. */
export function extractDomain(website: string): string {
  try {
    const url = website.startsWith("http") ? website : `https://${website}`;
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return website.replace(/^www\./, "");
  }
}

/** Convert any billing cycle amount to its monthly equivalent. */
export function toMonthly(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "weekly":    return (amount * 52) / 12;
    case "monthly":   return amount;
    case "quarterly": return amount / 3;
    case "yearly":    return amount / 12;
  }
}

/** Convert any billing cycle amount to its yearly equivalent. */
export function toYearly(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "weekly":    return amount * 52;
    case "monthly":   return amount * 12;
    case "quarterly": return amount * 4;
    case "yearly":    return amount;
  }
}

/** Advance an ISO date string by one billing cycle. */
export function advanceDateByCycle(dateStr: string, cycle: BillingCycle): string {
  const d = new Date(dateStr);
  switch (cycle) {
    case "weekly":    d.setDate(d.getDate() + 7); break;
    case "monthly":   d.setMonth(d.getMonth() + 1); break;
    case "quarterly": d.setMonth(d.getMonth() + 3); break;
    case "yearly":    d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().slice(0, 10);
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getSubscriptions(): Subscription[] {
  return subsCache;
}

export function saveSubscription(sub: Subscription): void {
  const idx = subsCache.findIndex((s) => s.id === sub.id);
  subsCache = idx >= 0
    ? subsCache.map((s, i) => (i === idx ? sub : s))
    : [sub, ...subsCache];
  writeJson(SUBSCRIPTIONS_KEY, subsCache);
}

export function deleteSubscription(id: string): void {
  subsCache = subsCache.filter((s) => s.id !== id);
  writeJson(SUBSCRIPTIONS_KEY, subsCache);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
