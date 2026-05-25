// localStorage-based persistence for subscriptions.
// Keys are prefixed with "ss:" to avoid collisions with other addons.

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
  startDate?: string; // ISO date string
  notes?: string;
  active: boolean;
}

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "/ mo",
  yearly: "/ yr",
  quarterly: "/ qtr",
  weekly: "/ wk",
};

export const CATEGORY_COLORS: Record<SubscriptionCategory, { bg: string; color: string }> = {
  "Entertainment":  { bg: "#3b0764", color: "#d8b4fe" },
  "Productivity":   { bg: "#1e3a5f", color: "#93c5fd" },
  "Health & Fitness": { bg: "#14532d", color: "#86efac" },
  "Finance":        { bg: "#713f12", color: "#fde68a" },
  "News & Media":   { bg: "#7c2d12", color: "#fdba74" },
  "Education":      { bg: "#134e4a", color: "#5eead4" },
  "Cloud & Storage":{ bg: "#164e63", color: "#67e8f9" },
  "Communication":  { bg: "#500724", color: "#fbcfe8" },
  "Shopping":       { bg: "#4a044e", color: "#f0abfc" },
  "Other":          { bg: "#1f2937", color: "#9ca3af" },
};

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

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const SUBS_KEY = "ss:subscriptions";

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

export function getSubscriptions(): Subscription[] {
  return load<Subscription>(SUBS_KEY);
}

export function saveSubscription(sub: Subscription): void {
  const all = load<Subscription>(SUBS_KEY);
  const idx = all.findIndex((s) => s.id === sub.id);
  if (idx >= 0) {
    all[idx] = sub;
  } else {
    all.unshift(sub);
  }
  save(SUBS_KEY, all);
}

export function deleteSubscription(id: string): void {
  save(SUBS_KEY, load<Subscription>(SUBS_KEY).filter((s) => s.id !== id));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
