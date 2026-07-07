// Persistence for subscriptions, backed by ctx.api.secrets (the host-brokered
// per-addon store) rather than localStorage. Wealthfolio 3.6 runs addons in a
// sandboxed iframe with an opaque origin, where the browser's localStorage is
// not durable — writes silently fail to survive a reload. Reads/writes here
// go through an in-memory cache hydrated once from secrets at startup (see
// hydrateStorage()), so the rest of the app can keep using a synchronous API.
// Keys are prefixed with "ss." to avoid collisions with other addons
// (the secrets API rejects ":" in key names).
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

// ─── Secrets-backed cache ─────────────────────────────────────────────────────
// ctx.api.secrets is backed by the OS keyring, which hard-caps each value at
// 2560 chars — a single JSON blob per collection breaks the moment the list
// grows past a handful of items (confirmed in production: a 9-item
// subscriptions array failed to persist while a 2-item bills array worked).
// So each subscription/bill/sync-log entry is stored as its own small secret,
// plus a small index secret listing the current IDs for that collection.

const SETTINGS_KEY = "ss.settings";

let hydrated = false;

/**
 * True once hydrateStorage() has loaded the secrets store into the cache.
 * Writes before this point would read a still-empty cache and overwrite
 * whatever's on disk with an incomplete snapshot — callers must gate
 * mutations (e.g. disable "Add") on this until it's true.
 */
export function isHydrated(): boolean {
  return hydrated;
}

function sanitizeKeySegment(raw: string): string {
  // secrets keys may only contain ASCII letters, digits, '.', '_' and '-'
  return raw.replace(/[^A-Za-z0-9._-]/g, "_");
}

function itemKey(prefix: string, id: string): string {
  return `ss.${prefix}.${sanitizeKeySegment(id)}`;
}

function indexKey(prefix: string): string {
  return `ss.${prefix}.index`;
}

// Writes are queued so two never overlap — mostly hygiene, since the actual
// bug that first looked like write corruption turned out to be two separate,
// simpler issues (see persistItem and lib/image.ts). A write is verified with
// a single read-back; mismatches are logged but not retried, since a retry
// won't help a value that's genuinely too large for the keyring to store.
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueueWrite<T>(op: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(op, op);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function secretsGet(key: string): Promise<string | null> {
  return getContext().api.secrets.get(key);
}

function secretsSet(key: string, value: string): Promise<void> {
  return enqueueWrite(async () => {
    const secrets = getContext().api.secrets;
    await secrets.set(key, value);
    const readBack = await secrets.get(key);
    if (readBack !== value) {
      getContext().api.logger.error(`secrets.set verification mismatch for "${key}"`);
    }
  });
}

function secretsDelete(key: string): Promise<void> {
  return enqueueWrite(() => getContext().api.secrets.delete(key));
}

async function loadCollection<T>(prefix: string): Promise<{ items: T[]; ids: string[] }> {
  try {
    const indexRaw = await secretsGet(indexKey(prefix));
    const ids: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    const items: (T | null)[] = await Promise.all(
      ids.map(async (id): Promise<T | null> => {
        try {
          const raw = await secretsGet(itemKey(prefix, id));
          return raw ? (JSON.parse(raw) as T) : null;
        } catch {
          return null;
        }
      }),
    );
    return { items: items.filter((item): item is T => item !== null), ids };
  } catch (err: unknown) {
    getContext().api.logger.error(`Failed to load collection "${prefix}": ${String(err)}`);
    return { items: [], ids: [] };
  }
}

/**
 * Persists one item's JSON and updates the collection's index if it's new.
 * Queued, not awaited by callers — but the index is only updated once the
 * item's own write actually succeeds, so a rejected write (e.g. too large
 * for the keyring's size cap) can't leave a phantom id in the index with no
 * retrievable value behind it.
 */
function persistItem(prefix: string, id: string, json: string, ids: string[]): string[] {
  const alreadyKnown = ids.includes(id);
  const nextIds = alreadyKnown ? ids : [id, ...ids];
  secretsSet(itemKey(prefix, id), json).then(
    () => {
      if (!alreadyKnown) {
        secretsSet(indexKey(prefix), JSON.stringify(nextIds)).catch(() => {});
      }
    },
    (err: unknown) => {
      getContext().api.logger.error(`Failed to persist ${prefix}/${id}: ${String(err)}`);
      if (prefix.startsWith("logo")) {
        getContext().api.toast.error("Couldn't save that logo — it may still be too large. Try a smaller image.");
      }
    },
  );
  return nextIds;
}

/** Deletes one item's secret and updates the collection's index. Queued, not awaited by callers. */
function removeItem(prefix: string, id: string, ids: string[]): string[] {
  secretsDelete(itemKey(prefix, id)).catch(() => {});
  const nextIds = ids.filter((existing) => existing !== id);
  secretsSet(indexKey(prefix), JSON.stringify(nextIds)).catch(() => {});
  return nextIds;
}

let subsCache: Subscription[] = [];
let subsIds: string[] = [];
let billsCache: Bill[] = [];
let billsIds: string[] = [];
let syncLogCache: Record<string, string> = {};
let syncLogIds: string[] = [];
let settingsCache: string | null = null;
let subLogoCache: Record<string, string> = {};
let subLogoIds: string[] = [];
let billLogoCache: Record<string, string> = {};
let billLogoIds: string[] = [];

async function loadLogoCollection(prefix: string): Promise<{ cache: Record<string, string>; ids: string[] }> {
  const indexRaw = await secretsGet(indexKey(prefix)).catch(() => null);
  const ids: string[] = indexRaw ? JSON.parse(indexRaw) : [];
  const values = await Promise.all(ids.map((id) => loadChunkedValue(prefix, id)));
  const cache = Object.fromEntries(
    ids.map((id, i) => [id, values[i]]).filter((entry): entry is [string, string] => entry[1] !== null),
  );
  return { cache, ids: Object.keys(cache) };
}

/** Load subscriptions, bills, settings, the sync log, and logos from the host secrets store. */
export async function hydrateStorage(): Promise<void> {
  const [subs, bills, syncLog, settingsRaw, subLogos, billLogos] = await Promise.all([
    loadCollection<Subscription>("sub"),
    loadCollection<Bill>("bill"),
    loadCollection<string>("synclog"),
    secretsGet(SETTINGS_KEY).catch(() => null),
    loadLogoCollection("logo-sub"),
    loadLogoCollection("logo-bill"),
  ]);
  subsCache = subs.items;
  subsIds = subs.ids;
  billsCache = bills.items;
  billsIds = bills.ids;
  syncLogCache = Object.fromEntries(syncLog.ids.map((id, i) => [id, syncLog.items[i]]).filter(([, v]) => v !== undefined));
  syncLogIds = syncLog.ids;
  settingsCache = settingsRaw;
  subLogoCache = subLogos.cache;
  subLogoIds = subLogos.ids;
  billLogoCache = billLogos.cache;
  billLogoIds = billLogos.ids;
  hydrated = true;
  window.dispatchEvent(new CustomEvent("ss:storage-hydrated"));
}

// ─── Logos ────────────────────────────────────────────────────────────────────
// User-picked images, resized client-side (see lib/image.ts). A single secret
// caps out at ~1280 usable chars (2560 bytes, halved for UTF-16 encoding) —
// nowhere near enough for a recognizable logo — so each logo is split across
// multiple small secrets ("chunks") and reassembled on read. A tiny manifest
// key records the chunk count.
const LOGO_CHUNK_SIZE = 1000;

function chunkKey(prefix: string, id: string, index: number): string {
  return `${itemKey(prefix, id)}.c${index}`;
}

async function saveChunkedValue(prefix: string, id: string, value: string): Promise<boolean> {
  const chunkCount = Math.ceil(value.length / LOGO_CHUNK_SIZE) || 1;
  try {
    for (let i = 0; i < chunkCount; i++) {
      await secretsSet(chunkKey(prefix, id, i), value.slice(i * LOGO_CHUNK_SIZE, (i + 1) * LOGO_CHUNK_SIZE));
    }
    await secretsSet(itemKey(prefix, id), JSON.stringify({ chunks: chunkCount }));
    return true;
  } catch (err: unknown) {
    getContext().api.logger.error(`Failed to persist chunked ${prefix}/${id}: ${String(err)}`);
    return false;
  }
}

async function loadChunkedValue(prefix: string, id: string): Promise<string | null> {
  try {
    const metaRaw = await secretsGet(itemKey(prefix, id));
    if (!metaRaw) return null;
    const meta = JSON.parse(metaRaw) as { chunks: number };
    const chunks = await Promise.all(
      Array.from({ length: meta.chunks }, (_, i) => secretsGet(chunkKey(prefix, id, i))),
    );
    if (chunks.some((c) => c === null)) return null;
    return chunks.join("");
  } catch {
    return null;
  }
}

async function deleteChunkedValue(prefix: string, id: string): Promise<void> {
  const metaRaw = await secretsGet(itemKey(prefix, id)).catch(() => null);
  const chunkCount = metaRaw ? (JSON.parse(metaRaw) as { chunks: number }).chunks : 0;
  await Promise.all(
    Array.from({ length: chunkCount }, (_, i) => secretsDelete(chunkKey(prefix, id, i)).catch(() => {})),
  );
  await secretsDelete(itemKey(prefix, id)).catch(() => {});
}

export type LogoKind = "sub" | "bill";

export function getLogo(kind: LogoKind, id: string): string | null {
  return (kind === "sub" ? subLogoCache : billLogoCache)[id] ?? null;
}

/** Returns true if the logo was saved successfully. */
export async function saveLogo(kind: LogoKind, id: string, dataUri: string): Promise<boolean> {
  const prefix = kind === "sub" ? "logo-sub" : "logo-bill";
  const ok = await saveChunkedValue(prefix, id, dataUri);
  if (!ok) {
    getContext().api.toast.error("Couldn't save that logo — try a smaller or simpler image.");
    return false;
  }
  if (kind === "sub") {
    subLogoCache = { ...subLogoCache, [id]: dataUri };
    if (!subLogoIds.includes(id)) {
      subLogoIds = [id, ...subLogoIds];
      secretsSet(indexKey(prefix), JSON.stringify(subLogoIds)).catch(() => {});
    }
  } else {
    billLogoCache = { ...billLogoCache, [id]: dataUri };
    if (!billLogoIds.includes(id)) {
      billLogoIds = [id, ...billLogoIds];
      secretsSet(indexKey(prefix), JSON.stringify(billLogoIds)).catch(() => {});
    }
  }
  return true;
}

export function deleteLogo(kind: LogoKind, id: string): void {
  const prefix = kind === "sub" ? "logo-sub" : "logo-bill";
  deleteChunkedValue(prefix, id).catch(() => {});
  if (kind === "sub") {
    const { [id]: _removed, ...rest } = subLogoCache;
    subLogoCache = rest;
    subLogoIds = subLogoIds.filter((existing) => existing !== id);
    secretsSet(indexKey(prefix), JSON.stringify(subLogoIds)).catch(() => {});
  } else {
    const { [id]: _removed, ...rest } = billLogoCache;
    billLogoCache = rest;
    billLogoIds = billLogoIds.filter((existing) => existing !== id);
    secretsSet(indexKey(prefix), JSON.stringify(billLogoIds)).catch(() => {});
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
  billsIds = persistItem("bill", bill.id, JSON.stringify(bill), billsIds);
}

export function deleteBill(id: string): void {
  billsCache = billsCache.filter((b) => b.id !== id);
  billsIds = removeItem("bill", id, billsIds);
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
  secretsSet(SETTINGS_KEY, settingsCache).catch((err: unknown) => {
    getContext().api.logger.error(`Failed to persist settings: ${String(err)}`);
  });
  window.dispatchEvent(new CustomEvent("ss:settings-changed"));
}

// ─── Sync log ─────────────────────────────────────────────────────────────────
// Maps "${subId}:${date}" → activityId so we never push the same charge twice.
// Each entry is its own secret since the log grows indefinitely over time.

export function getSyncLog(): Record<string, string> {
  return syncLogCache;
}

export function updateSyncLog(entries: Record<string, string>): void {
  syncLogCache = { ...syncLogCache, ...entries };
  for (const [key, activityId] of Object.entries(entries)) {
    syncLogIds = persistItem("synclog", key, JSON.stringify(activityId), syncLogIds);
  }
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
  subsIds = persistItem("sub", sub.id, JSON.stringify(sub), subsIds);
}

export function deleteSubscription(id: string): void {
  subsCache = subsCache.filter((s) => s.id !== id);
  subsIds = removeItem("sub", id, subsIds);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
