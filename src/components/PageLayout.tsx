import { getContext } from "../context";
import type { ReactNode } from "react";

interface Tab {
  label: string;
  path: string;
}

const TABS: Tab[] = [
  { label: "Subscriptions", path: "/addons/subscription-stack" },
  { label: "Summary",       path: "/addons/subscription-stack/summary" },
];

interface PageLayoutProps {
  children: ReactNode;
  activePath: string;
}

export function PageLayout({ children, activePath }: PageLayoutProps) {
  const ctx = getContext();

  return (
    <div className="subscription-stack-root flex flex-col min-h-screen bg-background text-foreground">
      {/* Tab nav */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-3 border-b border-border">
        {TABS.map((tab) => {
          const isActive = activePath === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => ctx.api.navigation.navigate(tab.path)}
              style={isActive ? { backgroundColor: "#f59e0b", color: "#000" } : {}}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? ""
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
