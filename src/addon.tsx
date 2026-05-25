import "./index.css";
import React from "react";
import { Layers } from "lucide-react";
import type { AddonContext } from "@wealthfolio/addon-sdk";
import { setContext } from "./context";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { SummaryPage } from "./pages/SummaryPage";

export default function enable(ctx: AddonContext) {
  setContext(ctx);

  const sidebarItem = ctx.sidebar.addItem({
    id: "subscription-stack",
    label: "Subscription Stack",
    icon: <Layers className="h-5 w-5" />,
    route: "/addons/subscription-stack",
    order: 400,
  });

  ctx.router.add({
    path: "/addons/subscription-stack",
    component: React.lazy(() => Promise.resolve({ default: SubscriptionsPage })),
  });

  ctx.router.add({
    path: "/addons/subscription-stack/summary",
    component: React.lazy(() => Promise.resolve({ default: SummaryPage })),
  });

  ctx.onDisable(() => {
    try { sidebarItem.remove(); } catch {}
  });
}
