import { useState, useEffect } from "react";
import { PageLayout } from "../components/PageLayout";
import {
  type Subscription,
  type SubscriptionCategory,
  CATEGORY_COLORS,
  getSubscriptions,
  toMonthly,
  toYearly,
  formatCurrency,
} from "../lib/storage";

const CURRENT_PATH = "/addons/subscription-stack/summary";

interface CategoryTotal {
  category: SubscriptionCategory;
  monthly: number;
  yearly: number;
  currency: string;
  count: number;
}

export function SummaryPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    setSubscriptions(getSubscriptions());
  }, []);

  const active = subscriptions.filter((s) => s.active);

  // Group by currency first, then compute totals
  const byCurrency = active.reduce<Record<string, Subscription[]>>((acc, s) => {
    if (!acc[s.currency]) acc[s.currency] = [];
    acc[s.currency].push(s);
    return acc;
  }, {});

  const currencies = Object.keys(byCurrency);
  const primaryCurrency = currencies[0] ?? "USD";
  const primarySubs = byCurrency[primaryCurrency] ?? [];

  const grandMonthly = primarySubs.reduce((sum, s) => sum + toMonthly(s.amount, s.billingCycle), 0);
  const grandYearly = primarySubs.reduce((sum, s) => sum + toYearly(s.amount, s.billingCycle), 0);

  // Category breakdown (primary currency)
  const categoryMap = primarySubs.reduce<Record<string, CategoryTotal>>((acc, s) => {
    const cat = s.category;
    if (!acc[cat]) {
      acc[cat] = { category: cat, monthly: 0, yearly: 0, currency: s.currency, count: 0 };
    }
    acc[cat].monthly += toMonthly(s.amount, s.billingCycle);
    acc[cat].yearly += toYearly(s.amount, s.billingCycle);
    acc[cat].count += 1;
    return acc;
  }, {});

  const categoryTotals = Object.values(categoryMap).sort((a, b) => b.monthly - a.monthly);
  const maxMonthly = categoryTotals[0]?.monthly ?? 1;

  // Most expensive subscriptions
  const topSubs = [...primarySubs]
    .sort((a, b) => toMonthly(b.amount, b.billingCycle) - toMonthly(a.amount, a.billingCycle))
    .slice(0, 5);

  if (active.length === 0) {
    return (
      <PageLayout activePath={CURRENT_PATH}>
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-center px-4">
          <p className="text-sm text-muted-foreground">No active subscriptions to summarise.</p>
          <p className="text-xs text-muted-foreground">Add subscriptions in the Subscriptions tab.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activePath={CURRENT_PATH}>
      <div className="px-4 py-4 flex flex-col gap-5 max-w-2xl mx-auto">

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Monthly</span>
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrency(grandMonthly, primaryCurrency)}
            </span>
            <span className="text-xs text-muted-foreground">{active.length} subscriptions</span>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Yearly</span>
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrency(grandYearly, primaryCurrency)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(grandYearly / 52, primaryCurrency)}/wk avg
            </span>
          </div>
        </div>

        {/* Mixed currency note */}
        {currencies.length > 1 && (
          <p className="text-xs text-muted-foreground px-1">
            Showing totals for {primaryCurrency} only. You also have subscriptions in{" "}
            {currencies.slice(1).join(", ")}.
          </p>
        )}

        {/* Category breakdown */}
        {categoryTotals.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">By category</h2>
            {categoryTotals.map((ct) => {
              const colors = CATEGORY_COLORS[ct.category];
              const barPct = Math.round((ct.monthly / maxMonthly) * 100);
              return (
                <div key={ct.category} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: colors.bg, color: colors.color }}
                      >
                        {ct.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {ct.count} {ct.count === 1 ? "sub" : "subs"}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {formatCurrency(ct.monthly, ct.currency)}/mo
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(ct.yearly, ct.currency)}/yr
                      </span>
                    </div>
                  </div>
                  {/* Bar */}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${barPct}%`,
                        backgroundColor: colors.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Top 5 by cost */}
        {topSubs.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">Top by cost</h2>
            {topSubs.map((sub, idx) => {
              const colors = CATEGORY_COLORS[sub.category];
              return (
                <div key={sub.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: colors.bg, color: colors.color }}
                  >
                    {sub.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-foreground flex-1 truncate">{sub.name}</span>
                  <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                    {formatCurrency(toMonthly(sub.amount, sub.billingCycle), sub.currency)}/mo
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
