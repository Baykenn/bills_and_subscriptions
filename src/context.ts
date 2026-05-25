import type { AddonContext } from "@wealthfolio/addon-sdk";

let _ctx: AddonContext | null = null;

export function setContext(ctx: AddonContext): void {
  _ctx = ctx;
}

export function getContext(): AddonContext {
  if (!_ctx) throw new Error("Addon context not initialized");
  return _ctx;
}
