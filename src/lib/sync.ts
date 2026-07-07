import { getContext } from "../context";
import {
  getSubscriptions,
  getBills,
  getSyncLog,
  updateSyncLog,
  advanceDateByCycle,
} from "./storage";
import type { Subscription, Bill } from "./storage";

export interface SyncResult {
  synced: number;
  failed: number;
  skipped: number;
}

function getSubscriptionDates(sub: Subscription, today: string): string[] {
  if (!sub.startDate) return [];
  const dates: string[] = [];
  let current = sub.startDate;
  while (current <= today) {
    dates.push(current);
    current = advanceDateByCycle(current, sub.billingCycle);
  }
  return dates;
}

function getBillDates(bill: Bill, today: string): string[] {
  if (bill.date > today) return [];
  if (!bill.recurring || !bill.billingCycle) return [bill.date];
  const dates: string[] = [];
  let current = bill.date;
  while (current <= today) {
    dates.push(current);
    current = advanceDateByCycle(current, bill.billingCycle);
  }
  return dates;
}

/** date|amount|currency|comment — good enough to catch prior syncs the log itself doesn't know about
 * (e.g. entries recovered from a backup with different key formatting, or synced before a bug fix). */
function activitySignature(date: string, amount: number, currency: string, comment: string): string {
  return `${date}|${amount.toFixed(2)}|${currency}|${comment}`;
}

export async function syncAll(accountId: string): Promise<SyncResult> {
  const ctx = getContext();
  const log = getSyncLog();
  const today = new Date().toISOString().slice(0, 10);

  const existing = await ctx.api.activities.getAll(accountId);
  const existingSignatures = new Set(
    existing
      .filter((a) => a.activityType === "WITHDRAWAL" && a.amount !== null)
      .map((a) => activitySignature(
        new Date(a.date).toISOString().slice(0, 10),
        Number(a.amount),
        a.currency,
        a.comment ?? "",
      )),
  );

  let synced = 0, failed = 0, skipped = 0;
  const newEntries: Record<string, string> = {};

  const subs = getSubscriptions().filter((s) => s.active && s.startDate);
  for (const sub of subs) {
    for (const date of getSubscriptionDates(sub, today)) {
      const key = `${accountId}:${sub.id}:${date}`;
      const comment = `${sub.name} · ${sub.category}`;
      if (key in log || key in newEntries || existingSignatures.has(activitySignature(date, sub.amount, sub.currency, comment))) {
        skipped++;
        continue;
      }
      try {
        const activity = await ctx.api.activities.create({
          accountId,
          activityType: "WITHDRAWAL",
          activityDate: date,
          amount: sub.amount,
          currency: sub.currency,
          comment,
        });
        newEntries[key] = activity.id;
        synced++;
      } catch {
        failed++;
      }
    }
  }

  const bills = getBills();
  for (const bill of bills) {
    for (const date of getBillDates(bill, today)) {
      const key = `${accountId}:bill:${bill.id}:${date}`;
      const comment = `${bill.name} · ${bill.category}`;
      if (key in log || key in newEntries || existingSignatures.has(activitySignature(date, bill.amount, bill.currency, comment))) {
        skipped++;
        continue;
      }
      try {
        const activity = await ctx.api.activities.create({
          accountId,
          activityType: "WITHDRAWAL",
          activityDate: date,
          amount: bill.amount,
          currency: bill.currency,
          comment,
        });
        newEntries[key] = activity.id;
        synced++;
      } catch {
        failed++;
      }
    }
  }

  if (Object.keys(newEntries).length > 0) {
    updateSyncLog(newEntries);
  }

  return { synced, failed, skipped };
}
