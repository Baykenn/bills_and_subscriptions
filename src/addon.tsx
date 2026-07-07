import "./index.css";
import type { ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { AddonContext, AddonRouteRenderContext } from "@wealthfolio/addon-sdk";
import { setContext } from "./context";
import { hydrateStorage } from "./lib/storage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { SummaryPage } from "./pages/SummaryPage";
import { BillsPage } from "./pages/BillsPage";

// Routes may share the same underlying container element (a single sandboxed
// iframe for the whole addon), so roots are keyed by container identity
// rather than one-per-route — calling createRoot() twice on the same
// container throws and breaks navigation between routes. A regular Map (not
// WeakMap) so onDisable can iterate and unmount everything created.
const rootsByContainer = new Map<HTMLElement, Root>();

function mount(Page: ComponentType) {
  return {
    render: (context: AddonRouteRenderContext) => {
      let root = rootsByContainer.get(context.root);
      if (!root) {
        root = createRoot(context.root);
        rootsByContainer.set(context.root, root);
      }
      root.render(<Page />);
    },
  };
}

export default function enable(ctx: AddonContext) {
  setContext(ctx);

  hydrateStorage();

  const subscriptionsRoute = mount(SubscriptionsPage);
  const summaryRoute = mount(SummaryPage);
  const billsRoute = mount(BillsPage);

  const sidebarItem = ctx.sidebar.addItem({
    id: "bills-and-subscriptions",
    label: "Subscriptions & Bills",
    icon: "stack",
    route: "/addons/bills-and-subscriptions/summary",
    order: 400,
  });

  ctx.router.add({
    path: "/addons/bills-and-subscriptions",
    render: subscriptionsRoute.render,
  });

  ctx.router.add({
    path: "/addons/bills-and-subscriptions/summary",
    render: summaryRoute.render,
  });

  ctx.router.add({
    path: "/addons/bills-and-subscriptions/bills",
    render: billsRoute.render,
  });

  ctx.onDisable(() => {
    for (const root of rootsByContainer.values()) root.unmount();
    rootsByContainer.clear();
    try { sidebarItem.remove(); } catch {}
  });
}
