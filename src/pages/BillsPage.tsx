import { useState, useEffect, useCallback, useRef } from "react";
import { useBaseCurrency } from "../lib/useBaseCurrency";
import { Plus, Pencil, Trash2, Zap, ChevronDown, RefreshCw, Upload } from "lucide-react";
import { PageLayout } from "../components/PageLayout";
import { LogoAvatar } from "../components/LogoAvatar";
import {
  type Bill,
  type BillCategory,
  type BillingCycle,
  type Currency,
  BILL_CATEGORIES,
  BILL_CATEGORY_COLORS,
  CURRENCIES,
  getBills,
  saveBill,
  deleteBill,
  generateId,
  formatCurrency,
  advanceDateByCycle,
  isHydrated,
  getLogo,
  saveLogo,
  deleteLogo,
} from "../lib/storage";
import { prepareLogoUpload } from "../lib/image";
import { getContext } from "../context";

const CURRENT_PATH = "/addons/bills-and-subscriptions/bills";

const BILL_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "monthly",   label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly",    label: "Yearly" },
];

const today = () => new Date().toISOString().slice(0, 10);

const BLANK_FORM = {
  name: "",
  amount: "",
  currency: "EUR" as Currency,
  category: "Electricity" as BillCategory,
  date: today(),
  website: "",
  notes: "",
  paid: false,
  recurring: false,
  billingCycle: "monthly" as BillingCycle,
  logo: undefined as string | undefined,
};

type FormState = typeof BLANK_FORM;

interface BillFormProps {
  initial: FormState;
  editingId: string | null;
  onSave: (form: FormState) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function BillForm({ initial, editingId, onSave, onDelete, onClose }: BillFormProps) {
  const [form, setForm] = useState<FormState>(initial);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const set = (field: keyof FormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleLogoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const dataUri = await prepareLogoUpload(file);
    if (!dataUri) {
      getContext().api.toast.error("Couldn't use that image — try a smaller or simpler one.");
      return;
    }
    set("logo", dataUri);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">
          {editingId ? "Edit bill" : "Add bill"}
        </h2>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
            {form.logo ? (
              <img src={form.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <Upload className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="absolute w-px h-px p-0 -m-px overflow-hidden opacity-0"
              style={{ clip: "rect(0,0,0,0)" }}
              onChange={handleLogoPick}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-foreground hover:underline w-fit"
            >
              {form.logo ? "Change logo" : "Upload logo"}
            </button>
            {form.logo && (
              <button
                type="button"
                onClick={() => set("logo", undefined)}
                className="text-xs text-muted-foreground hover:text-red-400 w-fit"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Name</label>
          <input
            type="text"
            placeholder="e.g. Water Q1, January electricity…"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Website */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Website <span className="text-muted-foreground/50">(optional)</span></label>
          <input
            type="text"
            placeholder="e.g. edf.fr, voo.be…"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Amount + Currency */}
        <div className="flex gap-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs text-muted-foreground">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-28">
            <label className="text-xs text-muted-foreground">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => set("currency", e.target.value as Currency)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Category</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as BillCategory)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {BILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Date received</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Recurring toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs text-muted-foreground">Recurring</label>
            {form.recurring && (
              <span className="text-xs text-muted-foreground/60">
                Next bill created automatically when paid
              </span>
            )}
          </div>
          <button
            onClick={() => set("recurring", !form.recurring)}
            className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${form.recurring ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
              style={{ left: form.recurring ? "calc(100% - 18px)" : "2px" }}
            />
          </button>
        </div>

        {/* Billing cycle — only when recurring */}
        {form.recurring && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Billing cycle</label>
            <div className="flex gap-2">
              {BILL_CYCLES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => set("billingCycle", value)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.billingCycle === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paid toggle */}
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Mark as paid</label>
          <button
            onClick={() => set("paid", !form.paid)}
            className={`w-9 h-5 rounded-full transition-colors relative ${form.paid ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
              style={{ left: form.paid ? "calc(100% - 18px)" : "2px" }}
            />
          </button>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Notes <span className="text-muted-foreground/50">(optional)</span></label>
          <input
            type="text"
            placeholder="e.g. Higher than usual due to winter…"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
          {editingId && (
            <button
              onClick={() => onDelete(editingId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (form.name.trim() && form.amount) onSave(form); }}
            disabled={!form.name.trim() || !form.amount}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-40 transition-opacity bg-primary text-primary-foreground"
          >
            {editingId ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function monthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function BillsPage() {
  const baseCurrency = useBaseCurrency();
  const [bills, setBills] = useState<Bill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInitial, setFormInitial] = useState<FormState>(() => ({ ...BLANK_FORM, currency: baseCurrency }));
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(isHydrated);

  const refresh = useCallback(() => setBills(getBills()), []);
  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const onHydrated = () => { setReady(true); refresh(); };
    window.addEventListener("ss:storage-hydrated", onHydrated);
    return () => window.removeEventListener("ss:storage-hydrated", onHydrated);
  }, [refresh]);

  const openAdd = () => {
    if (!ready) return;
    setEditingId(null);
    setFormInitial({ ...BLANK_FORM, currency: baseCurrency, date: today() });
    setShowForm(true);
  };

  const openEdit = (bill: Bill) => {
    setEditingId(bill.id);
    setFormInitial({
      name: bill.name,
      amount: String(bill.amount),
      currency: bill.currency,
      category: bill.category,
      date: bill.date,
      website: bill.website ?? "",
      notes: bill.notes ?? "",
      paid: bill.paid,
      recurring: bill.recurring,
      billingCycle: bill.billingCycle ?? "monthly",
      logo: getLogo("bill", bill.id) ?? undefined,
    });
    setShowForm(true);
  };

  const handleSave = async (form: FormState) => {
    if (!ready) return;
    const id = editingId ?? generateId();
    saveBill({
      id,
      name: form.name.trim(),
      amount: parseFloat(form.amount) || 0,
      currency: form.currency,
      category: form.category,
      date: form.date,
      website: form.website.trim() || undefined,
      notes: form.notes.trim() || undefined,
      paid: form.paid,
      recurring: form.recurring,
      billingCycle: form.recurring ? form.billingCycle : undefined,
    });
    setShowForm(false);
    if (form.logo) {
      await saveLogo("bill", id, form.logo);
    } else {
      deleteLogo("bill", id);
    }
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteBill(id);
    deleteLogo("bill", id);
    refresh();
    setShowForm(false);
  };

  const togglePaid = (bill: Bill) => {
    const markingPaid = !bill.paid;
    saveBill({ ...bill, paid: markingPaid });

    // If recurring and just marked as paid, auto-create the next occurrence
    if (markingPaid && bill.recurring && bill.billingCycle) {
      const nextDate = advanceDateByCycle(bill.date, bill.billingCycle);
      // Guard: skip if an unpaid occurrence with the same name already exists on that date
      const alreadyExists = getBills().some(
        (b) => b.name === bill.name && b.date === nextDate && !b.paid,
      );
      if (!alreadyExists) {
        saveBill({
          id: generateId(),
          name: bill.name,
          amount: bill.amount,
          currency: bill.currency,
          category: bill.category,
          date: nextDate,
          website: bill.website,
          notes: bill.notes,
          paid: false,
          recurring: true,
          billingCycle: bill.billingCycle,
        });
      }
    }

    refresh();
  };

  const toggleMonth = (month: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      next.has(month) ? next.delete(month) : next.add(month);
      return next;
    });
  };

  // Sort newest first
  const sorted = [...bills].sort((a, b) => b.date.localeCompare(a.date));

  // Group by month
  const grouped = sorted.reduce<{ month: string; items: Bill[] }[]>((acc, bill) => {
    const month = monthLabel(bill.date);
    const group = acc.find((g) => g.month === month);
    if (group) group.items.push(bill);
    else acc.push({ month, items: [bill] });
    return acc;
  }, []);

  // Current month banner stats
  const currentMonth = monthLabel(today());
  const currentMonthBills = grouped.find((g) => g.month === currentMonth)?.items ?? [];
  const unpaidCount = currentMonthBills.filter((b) => !b.paid).length;

  // Group current-month totals by currency so mixed-currency bills are shown correctly
  const currentByCurrency = currentMonthBills.reduce<Record<string, number>>((acc, b) => {
    acc[b.currency] = (acc[b.currency] ?? 0) + b.amount;
    return acc;
  }, {});
  const currentCurrencies = Object.keys(currentByCurrency);

  return (
    <PageLayout activePath={CURRENT_PATH}>
      <div className="px-4 py-4 flex flex-col gap-3 max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">Bills</h1>
          <button
            onClick={openAdd}
            disabled={!ready}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        {/* This month banner */}
        {currentMonthBills.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">This month</span>
                {currentCurrencies.length === 1 ? (
                  <span className="text-4xl font-bold text-foreground tabular-nums">
                    {formatCurrency(currentByCurrency[currentCurrencies[0]], currentCurrencies[0])}
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {currentCurrencies.map((cur) => (
                      <span key={cur} className="text-2xl font-bold text-foreground tabular-nums">
                        {formatCurrency(currentByCurrency[cur], cur)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-px bg-border self-stretch" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Unpaid</span>
                <span className="text-xl font-semibold text-foreground tabular-nums">
                  {unpaidCount} bill{unpaidCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {bills.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <Zap className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{ready ? "No bills yet." : "Loading…"}</p>
            <button
              onClick={openAdd}
              disabled={!ready}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold mt-1 bg-primary text-primary-foreground disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Add your first bill
            </button>
          </div>
        )}

        {/* Grouped list */}
        {grouped.map(({ month, items }) => {
          const isOpen = !collapsedMonths.has(month);
          const monthByCurrency = items.reduce<Record<string, number>>((acc, b) => {
            acc[b.currency] = (acc[b.currency] ?? 0) + b.amount;
            return acc;
          }, {});
          const monthCurrencies = Object.keys(monthByCurrency);

          return (
            <div key={month} className="flex flex-col gap-1.5">
              {/* Month header */}
              <button
                onClick={() => toggleMonth(month)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 select-none w-full"
              >
                <ChevronDown
                  className="h-3.5 w-3.5 transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                />
                <span>{month}</span>
                <span className="flex-1" />
                <span className="tabular-nums">
                  {monthCurrencies.map((cur) => formatCurrency(monthByCurrency[cur], cur)).join(" + ")}
                </span>
              </button>

              {/* Animated rows */}
              <div
                className="grid transition-all duration-200"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-1.5">
                    {items.map((bill) => {
                      const colors = BILL_CATEGORY_COLORS[bill.category];
                      return (
                        <div
                          key={bill.id}
                          className={`bg-card border border-border rounded-xl px-3 py-2.5 flex items-center gap-3 transition-opacity ${bill.paid ? "opacity-50" : ""}`}
                        >
                          {/* Logo / category avatar */}
                          <LogoAvatar id={bill.id} kind="bill" name={bill.name} colors={colors} />

                          {/* Name + badges + date */}
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-medium text-foreground truncate">{bill.name}</span>
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                                style={{ backgroundColor: colors.bg, color: colors.color }}
                              >
                                {bill.category}
                              </span>
                              {bill.recurring && (
                                <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 bg-muted text-muted-foreground">
                                  <RefreshCw className="h-2.5 w-2.5" />
                                  {bill.billingCycle}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(bill.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                            </span>
                          </div>

                          {/* Amount */}
                          <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                            {formatCurrency(bill.amount, bill.currency)}
                          </span>

                          {/* Paid toggle */}
                          <button
                            onClick={() => togglePaid(bill)}
                            title={bill.paid ? "Mark unpaid" : "Mark paid"}
                            className={`w-7 h-3.5 rounded-full transition-colors shrink-0 relative ${bill.paid ? "bg-primary" : "bg-muted"}`}
                          >
                            <span
                              className="absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-all"
                              style={{ left: bill.paid ? "calc(100% - 12px)" : "2px" }}
                            />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEdit(bill)}
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
          );
        })}
      </div>

      {showForm && (
        <BillForm
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
