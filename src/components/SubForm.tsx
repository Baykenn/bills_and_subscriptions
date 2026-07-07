import { useState, useRef } from "react";
import { Trash2, Upload } from "lucide-react";
import {
  type BillingCycle,
  type SubscriptionCategory,
  type Currency,
  CATEGORIES,
  CURRENCIES,
} from "../lib/storage";
import { prepareLogoUpload } from "../lib/image";
import { getContext } from "../context";

export interface SubFormState {
  name: string;
  amount: string;
  currency: Currency;
  billingCycle: BillingCycle;
  category: SubscriptionCategory;
  startDate: string;
  website: string;
  notes: string;
  active: boolean;
  logo?: string;
}

export function blankSubForm(currency: Currency = "USD"): SubFormState {
  return {
    name: "",
    amount: "",
    currency,
    billingCycle: "monthly",
    category: "Other",
    startDate: "",
    website: "",
    notes: "",
    active: true,
    logo: undefined,
  };
}

interface SubFormProps {
  initial: SubFormState;
  editingId: string | null;
  onSave: (form: SubFormState) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function SubForm({ initial, editingId, onSave, onDelete, onClose }: SubFormProps) {
  const [form, setForm] = useState<SubFormState>(initial);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof SubFormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.amount) return;
    onSave(form);
  };

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
          {editingId ? "Edit subscription" : "Add subscription"}
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
          <label className="text-xs text-muted-foreground">Service name</label>
          <input
            autoFocus
            type="text"
            placeholder="e.g. Netflix, Spotify…"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
              className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-28">
            <label className="text-xs text-muted-foreground">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => set("currency", e.target.value as Currency)}
              className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Billing cycle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Billing cycle</label>
          <div className="flex gap-1.5">
            {(["monthly", "yearly", "quarterly", "weekly"] as BillingCycle[]).map((cycle) => (
              <button
                key={cycle}
                onClick={() => set("billingCycle", cycle)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  form.billingCycle === cycle
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Start date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">
            Start date <span className="text-muted-foreground/50">(optional — required for sync)</span>
          </label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Category</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as SubscriptionCategory)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Website */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">
            Website <span className="text-muted-foreground/50">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. netflix.com"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Notes <span className="text-muted-foreground/50">(optional)</span></label>
          <input
            type="text"
            placeholder="e.g. Family plan, shared with…"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
            onClick={handleSave}
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
