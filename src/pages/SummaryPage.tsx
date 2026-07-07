import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { PageLayout } from "../components/PageLayout";
import { LogoAvatar } from "../components/LogoAvatar";
import {
  type Subscription,
  type SubscriptionCategory,
  type Bill,
  type BillCategory,
  CATEGORY_COLORS,
  BILL_CATEGORY_COLORS,
  getSubscriptions,
  getBills,
  getSettings,
  saveSubscription,
  generateId,
  toMonthly,
  toYearly,
  formatCurrency,
  extractDomain,
  isHydrated,
  saveLogo,
} from "../lib/storage";
import { useBaseCurrency } from "../lib/useBaseCurrency";
import { SubForm, blankSubForm, type SubFormState } from "../components/SubForm";

const CURRENT_PATH = "/addons/bills-and-subscriptions/summary";

interface SubCategoryTotal {
  category: SubscriptionCategory;
  monthly: number;
  yearly: number;
  currency: string;
  count: number;
}

interface BillCategoryTotal {
  category: BillCategory;
  total: number;
  currency: string;
  count: number;
}

function currentMonthLabel(): string {
  return new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function billMonthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function SummaryPage() {
  const baseCurrency = useBaseCurrency();
  const [settings, setSettings] = useState(getSettings);
  const billsEnabled = settings.billsEnabled;
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [ready, setReady] = useState(isHydrated);

  useEffect(() => {
    const onSettingsChanged = () => {
      const next = getSettings();
      setSettings(next);
      if (!next.billsEnabled) setBills([]);
      else setBills(getBills());
    };
    window.addEventListener("ss:settings-changed", onSettingsChanged);
    return () => window.removeEventListener("ss:settings-changed", onSettingsChanged);
  }, []);

  useEffect(() => {
    setSubscriptions(getSubscriptions());
    if (billsEnabled) setBills(getBills());
  }, [billsEnabled]);

  useEffect(() => {
    const onHydrated = () => {
      setReady(true);
      setSettings(getSettings());
      setSubscriptions(getSubscriptions());
      setBills(getBills());
    };
    window.addEventListener("ss:storage-hydrated", onHydrated);
    return () => window.removeEventListener("ss:storage-hydrated", onHydrated);
  }, []);

  const handleAddSub = async (form: SubFormState) => {
    if (!ready) return;
    const id = generateId();
    saveSubscription({
      id,
      name: form.name.trim(),
      amount: parseFloat(form.amount) || 0,
      currency: form.currency,
      billingCycle: form.billingCycle,
      category: form.category,
      website: form.website || undefined,
      notes: form.notes || undefined,
      active: true,
    });
    setShowAddForm(false);
    if (form.logo) await saveLogo("sub", id, form.logo);
    setSubscriptions(getSubscriptions());
  };

  // ── Subscriptions ─────────────────────────────────────────────────────────
  const active = subscriptions.filter((s) => s.active);

  const byCurrency = active.reduce<Record<string, Subscription[]>>((acc, s) => {
    if (!acc[s.currency]) acc[s.currency] = [];
    acc[s.currency].push(s);
    return acc;
  }, {});

  const currencies = Object.keys(byCurrency);
  const primaryCurrency = currencies[0] ?? "USD";
  const primarySubs = byCurrency[primaryCurrency] ?? [];

  const grandMonthly = primarySubs.reduce((sum, s) => sum + toMonthly(s.amount, s.billingCycle), 0);
  const grandYearly  = primarySubs.reduce((sum, s) => sum + toYearly(s.amount, s.billingCycle), 0);

  const subCategoryMap = primarySubs.reduce<Record<string, SubCategoryTotal>>((acc, s) => {
    const cat = s.category;
    if (!acc[cat]) acc[cat] = { category: cat, monthly: 0, yearly: 0, currency: s.currency, count: 0 };
    acc[cat].monthly += toMonthly(s.amount, s.billingCycle);
    acc[cat].yearly  += toYearly(s.amount, s.billingCycle);
    acc[cat].count   += 1;
    return acc;
  }, {});

  const subCategoryTotals = Object.values(subCategoryMap).sort((a, b) => b.monthly - a.monthly);
  const maxSubMonthly = subCategoryTotals[0]?.monthly ?? 1;

  const sortedSubs = [...primarySubs]
    .sort((a, b) => toMonthly(b.amount, b.billingCycle) - toMonthly(a.amount, a.billingCycle));

  // ── Bills ─────────────────────────────────────────────────────────────────
  const thisMonth      = currentMonthLabel();
  const thisMonthBills = bills.filter((b) => billMonthLabel(b.date) === thisMonth);
  const billPrimaryCur = thisMonthBills[0]?.currency ?? primaryCurrency;

  // This-month totals
  const billMonthTotal  = thisMonthBills.reduce((sum, b) => sum + b.amount, 0);
  const billUnpaidTotal = thisMonthBills.filter((b) => !b.paid).reduce((sum, b) => sum + b.amount, 0);
  const billUnpaidCount = thisMonthBills.filter((b) => !b.paid).length;

  // Category breakdown across all bills (not just this month)
  const billCategoryMap = bills.reduce<Record<string, BillCategoryTotal & { bills: Bill[] }>>((acc, b) => {
    const cat = b.category;
    if (!acc[cat]) acc[cat] = { category: cat, total: 0, currency: b.currency, count: 0, bills: [] };
    acc[cat].total += b.amount;
    acc[cat].count += 1;
    // Keep unique bills by name for logo display
    const isDuplicate = acc[cat].bills.some((existing) => {
      if (b.website && existing.website)
        return extractDomain(b.website) === extractDomain(existing.website);
      return existing.name.trim().toLowerCase() === b.name.trim().toLowerCase();
    });
    if (!isDuplicate) acc[cat].bills.push(b);
    return acc;
  }, {});

  const billCategoryTotals = Object.values(billCategoryMap).sort((a, b) => b.total - a.total);
  const maxBillTotal = billCategoryTotals[0]?.total ?? 1;

  // Last 6 months bill history
  const billsByMonth = bills.reduce<Record<string, { total: number; currency: string }>>((acc, b) => {
    const m = billMonthLabel(b.date);
    if (!acc[m]) acc[m] = { total: 0, currency: b.currency };
    acc[m].total += b.amount;
    return acc;
  }, {});

  const billMonthHistory = Object.entries(billsByMonth)
    .sort(([a], [b]) => {
      const toSort = (label: string) => {
        const d = new Date(label);
        return isNaN(d.getTime()) ? label : d.toISOString();
      };
      return toSort(b).localeCompare(toSort(a));
    })
    .slice(0, 6)
    .reverse();

  const maxMonthHistory = Math.max(...billMonthHistory.map(([, v]) => v.total), 1);

  const hasSubscriptions = active.length > 0;
  const hasBills = billsEnabled && bills.length > 0;

  // Bills monthly average across all recorded months
  const billMonthCount   = Object.keys(billsByMonth).length;
  const billTotalAllTime = bills.reduce((sum, b) => sum + b.amount, 0);
  const billMonthlyAvg   = billMonthCount > 0 ? billTotalAllTime / billMonthCount : 0;

  // Combined totals (same currency assumed — note shown if they differ)
  const combinedCurrency   = primaryCurrency;
  const combinedMonthly    = grandMonthly + billMonthlyAvg;
  const combinedYearly     = grandYearly + billMonthlyAvg * 12;
  const currenciesMismatch = hasBills && billPrimaryCur !== primaryCurrency;

  if (!hasSubscriptions && !hasBills) {
    return (
      <PageLayout activePath={CURRENT_PATH}>
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-center px-4">
          <p className="text-sm text-muted-foreground">Nothing to summarise yet.</p>
          <p className="text-xs text-muted-foreground/60">Add subscriptions or bills to see your spending overview.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activePath={CURRENT_PATH}>
      <div className="px-4 py-4 flex flex-col gap-4">

        {/* ── TOP ROW: total spend ─────────────────────────────────────────── */}
        {(hasSubscriptions || hasBills) && (
          <div className="border rounded-xl p-5 w-[calc(50%-0.5rem)]" style={{ backgroundColor: "color-mix(in srgb, var(--chart-1) 8%, transparent)", borderColor: "color-mix(in srgb, var(--chart-1) 25%, transparent)" }}>
            <div className={`grid divide-x divide-border items-stretch ${hasBills ? "grid-cols-3" : "grid-cols-2"}`}>

              {/* 1/3: Monthly total */}
              <div className="flex flex-col justify-center gap-1 pr-5">
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Total spend</span>
                <span className="text-3xl font-bold text-foreground tabular-nums leading-none">
                  {formatCurrency(combinedMonthly, combinedCurrency)}
                </span>
                <span className="text-xs text-muted-foreground">per month</span>
              </div>

              {/* 2/3: Yearly projection */}
              <div className="flex flex-col justify-center gap-1 px-5">
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Yearly projection</span>
                <span className="text-3xl font-bold text-foreground tabular-nums leading-none">
                  {formatCurrency(combinedYearly, combinedCurrency)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(combinedYearly / 52, combinedCurrency)} / week
                </span>
              </div>

              {/* 3/3: Spend sources */}
              {hasSubscriptions && hasBills && combinedMonthly > 0 && (
                <div className="flex flex-col justify-center gap-3 pl-5">
                  {(() => {
                    const pct = Math.round((grandMonthly / combinedMonthly) * 100);
                    return (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Subscriptions</span>
                          <span className="font-semibold text-foreground tabular-nums">{formatCurrency(grandMonthly, combinedCurrency)}</span>
                        </div>
                        <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: "color-mix(in srgb, var(--chart-1) 20%, transparent)" }}>
                          <div className="h-full rounded-full flex items-center" style={{ width: `${pct}%`, backgroundColor: "color-mix(in srgb, var(--chart-1) 60%, var(--chart-2))" }}>
                            <span className="text-xs font-semibold text-white px-2 whitespace-nowrap">{pct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  {(() => {
                    const pct = Math.round((billMonthlyAvg / combinedMonthly) * 100);
                    return (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Bills</span>
                          <span className="font-semibold text-foreground tabular-nums">{formatCurrency(billMonthlyAvg, combinedCurrency)}</span>
                        </div>
                        <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: "color-mix(in srgb, var(--chart-5) 20%, transparent)" }}>
                          <div className="h-full rounded-full flex items-center" style={{ width: `${pct}%`, backgroundColor: "color-mix(in srgb, var(--chart-5) 60%, var(--chart-6))" }}>
                            <span className="text-xs font-semibold text-white px-2 whitespace-nowrap">{pct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
            {currenciesMismatch && (
              <p className="text-xs text-muted-foreground/60 mt-3">
                Bills are in {billPrimaryCur}; combined total uses {combinedCurrency} figures as-is.
              </p>
            )}
          </div>
        )}

        {/* ── SUBSCRIPTIONS + BILLS SIDE BY SIDE ──────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 items-start">

          {/* ── SUBSCRIPTIONS ─────────────────────────────────────────────── */}
          {hasSubscriptions && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subscriptions</h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Monthly</span>
                  <span className="text-xl font-bold text-foreground tabular-nums">
                    {formatCurrency(grandMonthly, primaryCurrency)}
                  </span>
                  <span className="text-xs text-muted-foreground">{active.length} active</span>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Yearly</span>
                  <span className="text-xl font-bold text-foreground tabular-nums">
                    {formatCurrency(grandYearly, primaryCurrency)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(grandYearly / 52, primaryCurrency)}/wk
                  </span>
                </div>
              </div>

              {currencies.length > 1 && (
                <p className="text-xs text-muted-foreground/70 px-1">
                  Showing {primaryCurrency} only. Also in {currencies.slice(1).join(", ")}.
                </p>
              )}

              {subCategoryTotals.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">By category</h3>
                  {subCategoryTotals.map((ct) => {
                    const colors = CATEGORY_COLORS[ct.category];
                    const barPct = Math.round((ct.monthly / maxSubMonthly) * 100);
                    return (
                      <div key={ct.category} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: colors.bg, color: colors.color }}>
                              {ct.category}
                            </span>
                            <span className="text-xs text-muted-foreground/60">{ct.count} {ct.count === 1 ? "sub" : "subs"}</span>
                          </div>
                          <span className="text-sm font-semibold text-foreground tabular-nums">
                            {formatCurrency(ct.monthly, ct.currency)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                          </span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${barPct}%`, backgroundColor: colors.color, opacity: 0.7 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stack</h3>
                  <button
                    onClick={() => ready && setShowAddForm(true)}
                    disabled={!ready}
                    className="w-5 h-5 rounded-full flex items-center justify-center bg-muted hover:bg-muted-foreground/20 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>

                {sortedSubs.length === 0 ? (
                  <p className="text-xs text-muted-foreground/60 py-2">No active subscriptions.</p>
                ) : (
                  sortedSubs.map((sub, idx) => (
                    <div key={sub.id} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground/50 w-4 text-right shrink-0 tabular-nums">{idx + 1}</span>
                      <LogoAvatar id={sub.id} kind="sub" name={sub.name} colors={CATEGORY_COLORS[sub.category]} size="sm" />
                      <span className="text-sm text-foreground flex-1 truncate">{sub.name}</span>
                      <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                        {formatCurrency(toMonthly(sub.amount, sub.billingCycle), sub.currency)}
                        <span className="text-xs font-normal text-muted-foreground">/mo</span>
                      </span>
                    </div>
                  ))
                )}

              </div>
            </div>
          )}

          {/* ── BILLS ─────────────────────────────────────────────────────── */}
          {hasBills && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bills</h2>

              {thisMonthBills.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">This month</span>
                    <span className="text-xl font-bold text-foreground tabular-nums">
                      {formatCurrency(billMonthTotal, billPrimaryCur)}
                    </span>
                    <span className="text-xs text-muted-foreground">{thisMonthBills.length} bill{thisMonthBills.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Unpaid</span>
                    <span className="text-xl font-bold text-foreground tabular-nums">
                      {formatCurrency(billUnpaidTotal, billPrimaryCur)}
                    </span>
                    <span className="text-xs text-muted-foreground">{billUnpaidCount} outstanding</span>
                  </div>
                </div>
              )}

              {billMonthHistory.length > 1 && (() => {
                const VIEW_W = 480;
                const VIEW_H = 180;
                const PAD_L = 44;
                const PAD_R = 44;
                const PAD_T = 12;
                const PAD_B = 22;
                const plotW = VIEW_W - PAD_L - PAD_R;
                const plotH = VIEW_H - PAD_T - PAD_B;
                const n = billMonthHistory.length;
                const slotW = plotW / n;
                const barW = Math.max(slotW * 0.24, 3);

                const cumulativeTotals: number[] = [];
                let running = 0;
                for (const [, { total }] of billMonthHistory) {
                  running += total;
                  cumulativeTotals.push(running);
                }
                const maxCumulative = running || 1;
                const barYMax = maxMonthHistory || 1;

                const toX = (i: number) => PAD_L + slotW * i + slotW / 2;
                const toBarY = (v: number) => PAD_T + plotH - (v / barYMax) * plotH;
                const toLineY = (v: number) => PAD_T + plotH - (v / maxCumulative) * plotH;

                const TICK_COUNT = 4;
                const barTicks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => Math.round((i / TICK_COUNT) * barYMax));
                const lineTicks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => Math.round((i / TICK_COUNT) * maxCumulative));
                const linePoints = cumulativeTotals.map((v, i) => `${toX(i)},${toLineY(v)}`).join(' ');

                const fmtTick = (v: number) => {
                  if (v >= 10000) return `${(v / 1000).toFixed(0)}k`;
                  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
                  return String(Math.round(v));
                };

                return (
                  <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monthly history</h3>
                    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" className="overflow-visible">
                      {/* Grid lines */}
                      {barTicks.map((tick, i) => (
                        <line key={i} x1={PAD_L} y1={toBarY(tick)} x2={VIEW_W - PAD_R} y2={toBarY(tick)}
                          stroke="currentColor" strokeOpacity={i === 0 ? 0 : 0.06} strokeWidth="1" />
                      ))}
                      {/* Baseline */}
                      <line x1={PAD_L} y1={toBarY(0)} x2={VIEW_W - PAD_R} y2={toBarY(0)}
                        style={{ stroke: "var(--chart-3)" }} strokeWidth="0.5" strokeDasharray="2 4" strokeLinecap="round" />
                      {/* Left Y-axis labels */}
                      {barTicks.filter((_, i) => i > 0).map((tick, i) => (
                        <text key={i} x={PAD_L - 6} y={toBarY(tick) + 3.5}
                          textAnchor="end" fontSize="9" fill="currentColor" fillOpacity="0.45">
                          {fmtTick(tick)}
                        </text>
                      ))}
                      {/* Right Y-axis labels (cumulative) */}
                      {lineTicks.filter((_, i) => i > 0).map((tick, i) => (
                        <text key={i} x={VIEW_W - PAD_R + 6} y={toLineY(tick) + 3.5}
                          textAnchor="start" fontSize="9" fill="var(--chart-2)" fillOpacity="0.8">
                          {fmtTick(tick)}
                        </text>
                      ))}
                      {/* Bars */}
                      {billMonthHistory.map(([month, { total }], i) => {
                        const isCurrentMonth = month === thisMonth;
                        const bH = Math.max((total / barYMax) * plotH, 1);
                        const x = toX(i) - barW / 2;
                        const y = PAD_T + plotH - bH;
                        const r = Math.min(5, barW / 2, bH);
                        const d = `M${x},${y + bH} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + barW - r},${y} Q${x + barW},${y} ${x + barW},${y + r} L${x + barW},${y + bH} Z`;
                        return (
                          <g key={month}>
                            <path d={d}
                              style={{ fill: isCurrentMonth ? "var(--chart-1)" : "color-mix(in srgb, var(--chart-3) 45%, transparent)" }} />
                            <text x={toX(i)} y={y - 4}
                              textAnchor="middle" fontSize="8" fill="currentColor" fillOpacity={isCurrentMonth ? 0.8 : 0.45}
                              fontWeight={isCurrentMonth ? "600" : "400"}>
                              {fmtTick(total)}
                            </text>
                          </g>
                        );
                      })}
                      {/* Cumulative line */}
                      <polyline points={linePoints} fill="none" style={{ stroke: "var(--chart-2)" }}
                        strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                      {/* Line dots */}
                      {cumulativeTotals.map((v, i) => (
                        <circle key={i} cx={toX(i)} cy={toLineY(v)} r="2.5" style={{ fill: "var(--chart-2)" }} />
                      ))}
                      {/* X-axis labels */}
                      {billMonthHistory.map(([month], i) => {
                        const isCurrentMonth = month === thisMonth;
                        const label = new Date(month).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
                        return (
                          <text key={month} x={toX(i)} y={VIEW_H - 4}
                            textAnchor="middle" fontSize="9"
                            fill="currentColor" fillOpacity={isCurrentMonth ? 0.8 : 0.4}
                            fontWeight={isCurrentMonth ? "600" : "400"}>
                            {label}
                          </text>
                        );
                      })}
                    </svg>
                    <div className="flex items-center gap-5 pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-2.5 rounded-sm" style={{ backgroundColor: "color-mix(in srgb, var(--chart-3) 50%, transparent)" }} />
                        <span className="text-xs text-muted-foreground">Monthly</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg width="16" height="10" viewBox="0 0 16 10">
                          <line x1="0" y1="5" x2="16" y2="5" style={{ stroke: "var(--chart-2)" }} strokeWidth="1.5" />
                          <circle cx="8" cy="5" r="2.5" style={{ fill: "var(--chart-2)" }} />
                        </svg>
                        <span className="text-xs text-muted-foreground">Cumulative</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {billCategoryTotals.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">By category</h3>
                  {billCategoryTotals.map((ct) => {
                    const colors = BILL_CATEGORY_COLORS[ct.category];
                    const barPct = Math.round((ct.total / maxBillTotal) * 100);
                    const uniqueBills = (ct as BillCategoryTotal & { bills: Bill[] }).bills;
                    const categoryBills = uniqueBills.slice(0, 4);
                    const overflow = uniqueBills.length - categoryBills.length;
                    return (
                      <div key={ct.category} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0" style={{ backgroundColor: colors.bg, color: colors.color }}>
                              {ct.category}
                            </span>
                            {/* Bill logos */}
                            <div className="flex items-center gap-1">
                              {categoryBills.map((b) => (
                                <LogoAvatar key={b.id} id={b.id} kind="bill" name={b.name} colors={colors} size="sm" />
                              ))}
                              {overflow > 0 && (
                                <span className="text-xs text-muted-foreground/60 ml-1">+{overflow}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(ct.total, ct.currency)}</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${barPct}%`, backgroundColor: colors.color, opacity: 0.7 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      {showAddForm && (
        <SubForm
          initial={blankSubForm(baseCurrency)}
          editingId={null}
          onSave={handleAddSub}
          onDelete={() => {}}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </PageLayout>
  );
}
