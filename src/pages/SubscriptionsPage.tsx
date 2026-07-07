import { useState, useEffect, useCallback } from "react";
import { useBaseCurrency } from "../lib/useBaseCurrency";
import { Plus, Pencil, CreditCard, ChevronDown } from "lucide-react";
import { PageLayout } from "../components/PageLayout";
import { LogoAvatar } from "../components/LogoAvatar";
import { SubForm, blankSubForm, type SubFormState } from "../components/SubForm";
import {
  type Subscription,
  CYCLE_LABELS,
  CATEGORY_COLORS,
  getSubscriptions,
  saveSubscription,
  deleteSubscription,
  generateId,
  toMonthly,
  formatCurrency,
  isHydrated,
  getLogo,
  saveLogo,
  deleteLogo,
} from "../lib/storage";

const CURRENT_PATH = "/addons/bills-and-subscriptions";

type FormState = SubFormState;

export function SubscriptionsPage() {
  const baseCurrency = useBaseCurrency();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInitial, setFormInitial] = useState<FormState>(() => ({ ...blankSubForm(baseCurrency), currency: baseCurrency }));
  const [listOpen, setListOpen] = useState(true);
  const [ready, setReady] = useState(isHydrated);

  const refresh = useCallback(() => {
    setSubscriptions(getSubscriptions());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const onHydrated = () => { setReady(true); refresh(); };
    window.addEventListener("ss:storage-hydrated", onHydrated);
    return () => window.removeEventListener("ss:storage-hydrated", onHydrated);
  }, [refresh]);

  const openAdd = () => {
    if (!ready) return;
    setEditingId(null);
    setFormInitial({ ...blankSubForm(baseCurrency), currency: baseCurrency });
    setShowForm(true);
  };

  const openEdit = (sub: Subscription) => {
    setEditingId(sub.id);
    setFormInitial({
      name: sub.name,
      amount: String(sub.amount),
      currency: sub.currency,
      billingCycle: sub.billingCycle,
      category: sub.category,
      startDate: sub.startDate ?? "",
      website: sub.website ?? "",
      notes: sub.notes ?? "",
      active: sub.active,
      logo: getLogo("sub", sub.id) ?? undefined,
    });
    setShowForm(true);
  };

  const handleSave = async (form: FormState) => {
    if (!ready) return;
    const sub: Subscription = {
      id: editingId ?? generateId(),
      name: form.name.trim(),
      amount: parseFloat(form.amount) || 0,
      currency: form.currency,
      billingCycle: form.billingCycle,
      category: form.category,
      startDate: form.startDate || undefined,
      website: form.website.trim() || undefined,
      notes: form.notes.trim() || undefined,
      active: form.active,
    };
    saveSubscription(sub);
    setShowForm(false);
    if (form.logo) {
      await saveLogo("sub", sub.id, form.logo);
    } else {
      deleteLogo("sub", sub.id);
    }
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteSubscription(id);
    deleteLogo("sub", id);
    refresh();
    setShowForm(false);
  };

  const toggleActive = (sub: Subscription) => {
    saveSubscription({ ...sub, active: !sub.active });
    refresh();
  };

  const activeSubs = subscriptions.filter((s) => s.active);
  const currencyTotals = activeSubs.reduce<Record<string, { monthly: number; yearly: number }>>((acc, s) => {
    const cur = s.currency;
    if (!acc[cur]) acc[cur] = { monthly: 0, yearly: 0 };
    acc[cur].monthly += toMonthly(s.amount, s.billingCycle);
    acc[cur].yearly += toMonthly(s.amount, s.billingCycle) * 12;
    return acc;
  }, {});

  const sortedSubs = [...subscriptions].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return toMonthly(b.amount, b.billingCycle) - toMonthly(a.amount, a.billingCycle);
  });

  const currencies = Object.keys(currencyTotals);
  const primaryCurrency = currencies[0] ?? "USD";
  const mixedCurrencies = currencies.length > 1;

  return (
    <PageLayout activePath={CURRENT_PATH}>
      <div className="px-4 py-4 flex flex-col gap-3 max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">Subscriptions</h1>
          <button
            onClick={openAdd}
            disabled={!ready}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        {/* Totals banner */}
        {activeSubs.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            {mixedCurrencies ? (
              <div className="flex flex-wrap gap-5">
                {currencies.map((cur) => (
                  <div key={cur} className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">{cur} / month</span>
                    <span className="text-xl font-bold text-foreground tabular-nums">
                      {formatCurrency(currencyTotals[cur].monthly, cur)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(currencyTotals[cur].yearly, cur)} / yr
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Monthly</span>
                  <span className="text-4xl font-bold text-foreground tabular-nums">
                    {formatCurrency(currencyTotals[primaryCurrency].monthly, primaryCurrency)}
                  </span>
                </div>
                <div className="w-px bg-border self-stretch" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Yearly</span>
                  <span className="text-xl font-semibold text-foreground tabular-nums">
                    {formatCurrency(currencyTotals[primaryCurrency].yearly, primaryCurrency)}
                  </span>
                </div>
                <div className="flex-1" />
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs text-muted-foreground">{activeSubs.length} active</span>
                  {subscriptions.length > activeSubs.length && (
                    <span className="text-xs text-muted-foreground">
                      {subscriptions.length - activeSubs.length} paused
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subscription list */}
        {sortedSubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{ready ? "No subscriptions yet." : "Loading…"}</p>
            <button
              onClick={openAdd}
              disabled={!ready}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold mt-1 bg-primary text-primary-foreground disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Add your first subscription
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">

            {/* Collapsible header */}
            <button
              onClick={() => setListOpen((o) => !o)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 select-none w-fit"
            >
              <ChevronDown
                className="h-3.5 w-3.5 transition-transform duration-200"
                style={{ transform: listOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
              />
              {sortedSubs.length} subscription{sortedSubs.length !== 1 ? "s" : ""}
            </button>

            {/* Animated list */}
            <div
              className="grid transition-all duration-200"
              style={{ gridTemplateRows: listOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-1.5">
            {sortedSubs.map((sub) => {
              const catColors = CATEGORY_COLORS[sub.category];
              const monthly = toMonthly(sub.amount, sub.billingCycle);
              const isNotMonthly = sub.billingCycle !== "monthly";

              return (
                <div
                  key={sub.id}
                  className={`bg-card border border-border rounded-xl px-3 py-2.5 flex items-center gap-3 transition-opacity ${
                    sub.active ? "" : "opacity-45"
                  }`}
                >
                  <LogoAvatar id={sub.id} kind="sub" name={sub.name} colors={CATEGORY_COLORS[sub.category]} />

                  {/* Name + badge */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">{sub.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{ backgroundColor: catColors.bg, color: catColors.color }}
                    >
                      {sub.category}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-sm font-semibold text-foreground tabular-nums">
                      {formatCurrency(sub.amount, sub.currency)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        {CYCLE_LABELS[sub.billingCycle]}
                      </span>
                    </span>
                    {isNotMonthly && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        ≈ {formatCurrency(monthly, sub.currency)}/mo
                      </span>
                    )}
                  </div>

                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(sub)}
                    title={sub.active ? "Pause" : "Resume"}
                    className={`w-7 h-3.5 rounded-full transition-colors shrink-0 relative ${sub.active ? "bg-primary" : "bg-muted"}`}
                  >
                    {/* track bg handled by className */}
                    <span
                      className="absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-all"
                      style={{ left: sub.active ? "calc(100% - 12px)" : "2px" }}
                    />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(sub)}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1 rounded-lg hover:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
              })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <SubForm
          initial={formInitial}
          editingId={editingId}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setShowForm(false)}
        />
      )}
    </PageLayout>
  );
}
