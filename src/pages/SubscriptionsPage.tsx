import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";
import { PageLayout } from "../components/PageLayout";
import {
  type Subscription,
  type BillingCycle,
  type SubscriptionCategory,
  type Currency,
  CATEGORIES,
  CURRENCIES,
  CYCLE_LABELS,
  CATEGORY_COLORS,
  getSubscriptions,
  saveSubscription,
  deleteSubscription,
  generateId,
  toMonthly,
  formatCurrency,
} from "../lib/storage";

const CURRENT_PATH = "/addons/subscription-stack";

const BLANK_FORM = {
  name: "",
  amount: "",
  currency: "USD" as Currency,
  billingCycle: "monthly" as BillingCycle,
  category: "Other" as SubscriptionCategory,
  notes: "",
  active: true,
};

type FormState = typeof BLANK_FORM;

interface SubFormProps {
  initial: FormState;
  editingId: string | null;
  onSave: (form: FormState) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function SubForm({ initial, editingId, onSave, onDelete, onClose }: SubFormProps) {
  const [form, setForm] = useState<FormState>(initial);

  const set = (field: keyof FormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.amount) return;
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">
          {editingId ? "Edit subscription" : "Add subscription"}
        </h2>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Service name</label>
          <input
            type="text"
            placeholder="e.g. Netflix, Spotify…"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Amount + Currency */}
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-muted-foreground">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="flex flex-col gap-1 w-28">
            <label className="text-xs text-muted-foreground">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => set("currency", e.target.value as Currency)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Billing cycle */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Billing cycle</label>
          <div className="flex gap-2">
            {(["monthly", "yearly", "quarterly", "weekly"] as BillingCycle[]).map((cycle) => (
              <button
                key={cycle}
                onClick={() => set("billingCycle", cycle)}
                style={form.billingCycle === cycle ? { backgroundColor: "#f59e0b", color: "#000" } : {}}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  form.billingCycle === cycle
                    ? "border-transparent"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Category</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as SubscriptionCategory)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Notes (optional)</label>
          <input
            type="text"
            placeholder="e.g. Family plan, shared with…"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {editingId && (
            <button
              onClick={() => onDelete(editingId)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || !form.amount}
            style={{ backgroundColor: "#f59e0b", color: "#000" }}
            className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-opacity"
          >
            {editingId ? "Save changes" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInitial, setFormInitial] = useState<FormState>(BLANK_FORM);

  const refresh = useCallback(() => {
    setSubscriptions(getSubscriptions());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openAdd = () => {
    setEditingId(null);
    setFormInitial(BLANK_FORM);
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
      notes: sub.notes ?? "",
      active: sub.active,
    });
    setShowForm(true);
  };

  const handleSave = (form: FormState) => {
    const sub: Subscription = {
      id: editingId ?? generateId(),
      name: form.name.trim(),
      amount: parseFloat(form.amount) || 0,
      currency: form.currency,
      billingCycle: form.billingCycle,
      category: form.category,
      notes: form.notes.trim() || undefined,
      active: form.active,
    };
    saveSubscription(sub);
    refresh();
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteSubscription(id);
    refresh();
    setShowForm(false);
  };

  const toggleActive = (sub: Subscription) => {
    saveSubscription({ ...sub, active: !sub.active });
    refresh();
  };

  // Group totals by currency (active only)
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
      <div className="px-4 py-4 flex flex-col gap-4 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Subscription Stack</h1>
          <button
            onClick={openAdd}
            style={{ backgroundColor: "#f59e0b", color: "#000" }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {/* Totals banner */}
        {activeSubs.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4">
            {mixedCurrencies ? (
              currencies.map((cur) => (
                <div key={cur} className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{cur} / month</span>
                  <span className="text-xl font-bold text-foreground tabular-nums">
                    {formatCurrency(currencyTotals[cur].monthly, cur)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(currencyTotals[cur].yearly, cur)} / year
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Monthly spend</span>
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {formatCurrency(currencyTotals[primaryCurrency].monthly, primaryCurrency)}
                  </span>
                </div>
                <div className="w-px bg-border self-stretch" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Yearly spend</span>
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {formatCurrency(currencyTotals[primaryCurrency].yearly, primaryCurrency)}
                  </span>
                </div>
              </>
            )}
            <div className="flex-1" />
            <div className="flex flex-col items-end gap-0.5 justify-center">
              <span className="text-xs text-muted-foreground">{activeSubs.length} active</span>
              {subscriptions.length > activeSubs.length && (
                <span className="text-xs text-muted-foreground">
                  {subscriptions.length - activeSubs.length} paused
                </span>
              )}
            </div>
          </div>
        )}

        {/* Subscription list */}
        {sortedSubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "#1c1917" }}
            >
              <CreditCard className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No subscriptions yet.</p>
            <button
              onClick={openAdd}
              style={{ backgroundColor: "#f59e0b", color: "#000" }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold mt-1"
            >
              <Plus className="h-4 w-4" />
              Add your first subscription
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedSubs.map((sub) => {
              const catColors = CATEGORY_COLORS[sub.category];
              const monthly = toMonthly(sub.amount, sub.billingCycle);
              const isNotMonthly = sub.billingCycle !== "monthly";

              return (
                <div
                  key={sub.id}
                  className={`bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 transition-opacity ${
                    sub.active ? "" : "opacity-50"
                  }`}
                >
                  {/* Initial avatar */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: catColors.bg, color: catColors.color }}
                  >
                    {sub.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + category */}
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">{sub.name}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full self-start"
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
                    className={`w-8 h-4 rounded-full transition-colors shrink-0 relative ${
                      sub.active ? "" : "bg-muted"
                    }`}
                    style={sub.active ? { backgroundColor: "#f59e0b" } : {}}
                  >
                    <span
                      className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all"
                      style={{ left: sub.active ? "calc(100% - 14px)" : "2px" }}
                    />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(sub)}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit form modal */}
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
