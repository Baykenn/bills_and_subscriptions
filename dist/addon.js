const r$1 = () => window.React;
const Fragment = /* @__PURE__ */ Symbol.for("react.fragment");
function makeElement(type, props, key) {
  const config = {};
  if (key !== void 0 && key !== null) {
    config.key = String(key);
  }
  if (props) {
    for (const k in props) {
      if (k !== "key") config[k] = props[k];
    }
  }
  const children = config.children;
  delete config.children;
  if (Array.isArray(children)) {
    return r$1().createElement(type, config, ...children);
  }
  if (children !== void 0) {
    return r$1().createElement(type, config, children);
  }
  return r$1().createElement(type, config);
}
function jsxDEV(type, props, key, _isStaticChildren, _source, _self) {
  return makeElement(type, props, key);
}
const r = () => window.React;
const ReactProxy = new Proxy({}, {
  get: (_t, key) => r()[key]
});
const useState = (...args) => r().useState(...args);
const useEffect = (...args) => r().useEffect(...args);
const useCallback = (...args) => r().useCallback(...args);
const useContext = (...args) => r().useContext(...args);
const createContext = (...args) => r().createContext(...args);
const forwardRef = (...args) => r().forwardRef(...args);
const createElement = (...args) => r().createElement(...args);
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};
const LucideContext = createContext({});
const useLucideContext = () => useContext(LucideContext);
const Icon = forwardRef(
  ({ color, size, strokeWidth, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => {
    const {
      size: contextSize = 24,
      strokeWidth: contextStrokeWidth = 2,
      absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
      color: contextColor = "currentColor",
      className: contextClass = ""
    } = useLucideContext() ?? {};
    const calculatedStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth ? Number(strokeWidth ?? contextStrokeWidth) * 24 / Number(size ?? contextSize) : strokeWidth ?? contextStrokeWidth;
    return createElement(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size ?? contextSize ?? defaultAttributes.width,
        height: size ?? contextSize ?? defaultAttributes.height,
        stroke: color ?? contextColor,
        strokeWidth: calculatedStrokeWidth,
        className: mergeClasses("lucide", contextClass, className),
        ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => createElement(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);
const createLucideIcon = (iconName, iconNode) => {
  const Component = forwardRef(
    ({ className, ...props }, ref) => createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};
const __iconNode$4 = [
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2", key: "ynyp8z" }],
  ["line", { x1: "2", x2: "22", y1: "10", y2: "10", key: "1b3vmo" }]
];
const CreditCard = createLucideIcon("credit-card", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
];
const Layers = createLucideIcon("layers", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$1);
const __iconNode = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode);
let _ctx = null;
function setContext(ctx) {
  _ctx = ctx;
}
function getContext() {
  if (!_ctx) throw new Error("Addon context not initialized");
  return _ctx;
}
const TABS = [
  { label: "Subscriptions", path: "/addons/subscription-stack" },
  { label: "Summary", path: "/addons/subscription-stack/summary" }
];
function PageLayout({ children, activePath }) {
  const ctx = getContext();
  return /* @__PURE__ */ jsxDEV("div", { className: "subscription-stack-root flex flex-col min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1 px-4 pt-4 pb-3 border-b border-border", children: TABS.map((tab) => {
      const isActive = activePath === tab.path;
      return /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: () => ctx.api.navigation.navigate(tab.path),
          style: isActive ? { backgroundColor: "#f59e0b", color: "#000" } : {},
          className: `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${isActive ? "" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`,
          children: tab.label
        },
        tab.path,
        false,
        {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/components/PageLayout.tsx",
          lineNumber: 29,
          columnNumber: 13
        },
        this
      );
    }) }, void 0, false, {
      fileName: "E:/Projects/Apps/Subscription_Stack/src/components/PageLayout.tsx",
      lineNumber: 25,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto", children }, void 0, false, {
      fileName: "E:/Projects/Apps/Subscription_Stack/src/components/PageLayout.tsx",
      lineNumber: 46,
      columnNumber: 7
    }, this)
  ] }, void 0);
}
const CATEGORIES = [
  "Entertainment",
  "Productivity",
  "Health & Fitness",
  "Finance",
  "News & Media",
  "Education",
  "Cloud & Storage",
  "Communication",
  "Shopping",
  "Other"
];
const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "NZD",
  "SGD",
  "HKD",
  "BRL",
  "MXN",
  "INR",
  "KRW",
  "PLN",
  "CZK",
  "HUF"
];
const CYCLE_LABELS = {
  monthly: "/ mo",
  yearly: "/ yr",
  quarterly: "/ qtr",
  weekly: "/ wk"
};
const CATEGORY_COLORS = {
  "Entertainment": { bg: "#3b0764", color: "#d8b4fe" },
  "Productivity": { bg: "#1e3a5f", color: "#93c5fd" },
  "Health & Fitness": { bg: "#14532d", color: "#86efac" },
  "Finance": { bg: "#713f12", color: "#fde68a" },
  "News & Media": { bg: "#7c2d12", color: "#fdba74" },
  "Education": { bg: "#134e4a", color: "#5eead4" },
  "Cloud & Storage": { bg: "#164e63", color: "#67e8f9" },
  "Communication": { bg: "#500724", color: "#fbcfe8" },
  "Shopping": { bg: "#4a044e", color: "#f0abfc" },
  "Other": { bg: "#1f2937", color: "#9ca3af" }
};
function toMonthly(amount, cycle) {
  switch (cycle) {
    case "weekly":
      return amount * 52 / 12;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
  }
}
function toYearly(amount, cycle) {
  switch (cycle) {
    case "weekly":
      return amount * 52;
    case "monthly":
      return amount * 12;
    case "quarterly":
      return amount * 4;
    case "yearly":
      return amount;
  }
}
function formatCurrency(amount, currency) {
  return new Intl.NumberFormat(void 0, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
const SUBS_KEY = "ss:subscriptions";
function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function save(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}
function getSubscriptions() {
  return load(SUBS_KEY);
}
function saveSubscription(sub) {
  const all = load(SUBS_KEY);
  const idx = all.findIndex((s) => s.id === sub.id);
  if (idx >= 0) {
    all[idx] = sub;
  } else {
    all.unshift(sub);
  }
  save(SUBS_KEY, all);
}
function deleteSubscription(id) {
  save(SUBS_KEY, load(SUBS_KEY).filter((s) => s.id !== id));
}
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
const CURRENT_PATH$1 = "/addons/subscription-stack";
const BLANK_FORM = {
  name: "",
  amount: "",
  currency: "USD",
  billingCycle: "monthly",
  category: "Other",
  notes: "",
  active: true
};
function SubForm({ initial, editingId, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(initial);
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleSave = () => {
    if (!form.name.trim() || !form.amount) return;
    onSave(form);
  };
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
      style: { backgroundColor: "rgba(0,0,0,0.6)" },
      onClick: (e) => {
        if (e.target === e.currentTarget) onClose();
      },
      children: /* @__PURE__ */ jsxDEV("div", { className: "bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "text-base font-semibold text-foreground", children: editingId ? "Edit subscription" : "Add subscription" }, void 0, false, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 61,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxDEV("label", { className: "text-xs text-muted-foreground", children: "Service name" }, void 0, false, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 67,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV(
            "input",
            {
              type: "text",
              placeholder: "e.g. Netflix, Spotify…",
              value: form.name,
              onChange: (e) => set("name", e.target.value),
              className: "bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
            },
            void 0,
            false,
            {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 68,
              columnNumber: 11
            },
            this
          )
        ] }, void 0, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 66,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-1 flex-1", children: [
            /* @__PURE__ */ jsxDEV("label", { className: "text-xs text-muted-foreground", children: "Amount" }, void 0, false, {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 80,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                type: "number",
                min: "0",
                step: "0.01",
                placeholder: "0.00",
                value: form.amount,
                onChange: (e) => set("amount", e.target.value),
                className: "bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              },
              void 0,
              false,
              {
                fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                lineNumber: 81,
                columnNumber: 13
              },
              this
            )
          ] }, void 0, true, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 79,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-1 w-28", children: [
            /* @__PURE__ */ jsxDEV("label", { className: "text-xs text-muted-foreground", children: "Currency" }, void 0, false, {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 92,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV(
              "select",
              {
                value: form.currency,
                onChange: (e) => set("currency", e.target.value),
                className: "bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500",
                children: CURRENCIES.map((c) => /* @__PURE__ */ jsxDEV("option", { value: c, children: c }, c, false, {
                  fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                  lineNumber: 99,
                  columnNumber: 17
                }, this))
              },
              void 0,
              false,
              {
                fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                lineNumber: 93,
                columnNumber: 13
              },
              this
            )
          ] }, void 0, true, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 91,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 78,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxDEV("label", { className: "text-xs text-muted-foreground", children: "Billing cycle" }, void 0, false, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 107,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2", children: ["monthly", "yearly", "quarterly", "weekly"].map((cycle) => /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => set("billingCycle", cycle),
              style: form.billingCycle === cycle ? { backgroundColor: "#f59e0b", color: "#000" } : {},
              className: `flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.billingCycle === cycle ? "border-transparent" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`,
              children: cycle.charAt(0).toUpperCase() + cycle.slice(1)
            },
            cycle,
            false,
            {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 110,
              columnNumber: 15
            },
            this
          )) }, void 0, false, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 108,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 106,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxDEV("label", { className: "text-xs text-muted-foreground", children: "Category" }, void 0, false, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 128,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV(
            "select",
            {
              value: form.category,
              onChange: (e) => set("category", e.target.value),
              className: "bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500",
              children: CATEGORIES.map((cat) => /* @__PURE__ */ jsxDEV("option", { value: cat, children: cat }, cat, false, {
                fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                lineNumber: 135,
                columnNumber: 15
              }, this))
            },
            void 0,
            false,
            {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 129,
              columnNumber: 11
            },
            this
          )
        ] }, void 0, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 127,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxDEV("label", { className: "text-xs text-muted-foreground", children: "Notes (optional)" }, void 0, false, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 142,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV(
            "input",
            {
              type: "text",
              placeholder: "e.g. Family plan, shared with…",
              value: form.notes,
              onChange: (e) => set("notes", e.target.value),
              className: "bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
            },
            void 0,
            false,
            {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 143,
              columnNumber: 11
            },
            this
          )
        ] }, void 0, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 141,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 pt-1", children: [
          editingId && /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => onDelete(editingId),
              className: "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors",
              children: [
                /* @__PURE__ */ jsxDEV(Trash2, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                  lineNumber: 159,
                  columnNumber: 15
                }, this),
                "Delete"
              ]
            },
            void 0,
            true,
            {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 155,
              columnNumber: 13
            },
            this
          ),
          /* @__PURE__ */ jsxDEV("div", { className: "flex-1" }, void 0, false, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 163,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: onClose,
              className: "px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
              children: "Cancel"
            },
            void 0,
            false,
            {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 164,
              columnNumber: 11
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: handleSave,
              disabled: !form.name.trim() || !form.amount,
              style: { backgroundColor: "#f59e0b", color: "#000" },
              className: "px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-opacity",
              children: editingId ? "Save changes" : "Add"
            },
            void 0,
            false,
            {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 170,
              columnNumber: 11
            },
            this
          )
        ] }, void 0, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 153,
          columnNumber: 9
        }, this)
      ] }, void 0, true, {
        fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
        lineNumber: 60,
        columnNumber: 7
      }, this)
    },
    void 0
  );
}
function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formInitial, setFormInitial] = useState(BLANK_FORM);
  const refresh = useCallback(() => {
    setSubscriptions(getSubscriptions());
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const openAdd = () => {
    setEditingId(null);
    setFormInitial(BLANK_FORM);
    setShowForm(true);
  };
  const openEdit = (sub) => {
    setEditingId(sub.id);
    setFormInitial({
      name: sub.name,
      amount: String(sub.amount),
      currency: sub.currency,
      billingCycle: sub.billingCycle,
      category: sub.category,
      notes: sub.notes ?? "",
      active: sub.active
    });
    setShowForm(true);
  };
  const handleSave = (form) => {
    const sub = {
      id: editingId ?? generateId(),
      name: form.name.trim(),
      amount: parseFloat(form.amount) || 0,
      currency: form.currency,
      billingCycle: form.billingCycle,
      category: form.category,
      notes: form.notes.trim() || void 0,
      active: form.active
    };
    saveSubscription(sub);
    refresh();
    setShowForm(false);
  };
  const handleDelete = (id) => {
    deleteSubscription(id);
    refresh();
    setShowForm(false);
  };
  const toggleActive = (sub) => {
    saveSubscription({ ...sub, active: !sub.active });
    refresh();
  };
  const activeSubs = subscriptions.filter((s) => s.active);
  const currencyTotals = activeSubs.reduce((acc, s) => {
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
  return /* @__PURE__ */ jsxDEV(PageLayout, { activePath: CURRENT_PATH$1, children: [
    /* @__PURE__ */ jsxDEV("div", { className: "px-4 py-4 flex flex-col gap-4 max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxDEV("h1", { className: "text-lg font-semibold text-foreground", children: "Subscription Stack" }, void 0, false, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 268,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: openAdd,
            style: { backgroundColor: "#f59e0b", color: "#000" },
            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold",
            children: [
              /* @__PURE__ */ jsxDEV(Plus, { className: "h-4 w-4" }, void 0, false, {
                fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                lineNumber: 274,
                columnNumber: 13
              }, this),
              "Add"
            ]
          },
          void 0,
          true,
          {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 269,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
        lineNumber: 267,
        columnNumber: 9
      }, this),
      activeSubs.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4", children: [
        mixedCurrencies ? currencies.map((cur) => /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: [
            cur,
            " / month"
          ] }, void 0, true, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 285,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-xl font-bold text-foreground tabular-nums", children: formatCurrency(currencyTotals[cur].monthly, cur) }, void 0, false, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 286,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: [
            formatCurrency(currencyTotals[cur].yearly, cur),
            " / year"
          ] }, void 0, true, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 289,
            columnNumber: 19
          }, this)
        ] }, cur, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 284,
          columnNumber: 17
        }, this)) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-0.5", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: "Monthly spend" }, void 0, false, {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 297,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "text-2xl font-bold text-foreground tabular-nums", children: formatCurrency(currencyTotals[primaryCurrency].monthly, primaryCurrency) }, void 0, false, {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 298,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 296,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "w-px bg-border self-stretch" }, void 0, false, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 302,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-0.5", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: "Yearly spend" }, void 0, false, {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 304,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "text-2xl font-bold text-foreground tabular-nums", children: formatCurrency(currencyTotals[primaryCurrency].yearly, primaryCurrency) }, void 0, false, {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 305,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 303,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 295,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex-1" }, void 0, false, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 311,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-end gap-0.5 justify-center", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: [
            activeSubs.length,
            " active"
          ] }, void 0, true, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 313,
            columnNumber: 15
          }, this),
          subscriptions.length > activeSubs.length && /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: [
            subscriptions.length - activeSubs.length,
            " paused"
          ] }, void 0, true, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 315,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 312,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
        lineNumber: 281,
        columnNumber: 11
      }, this),
      sortedSubs.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center justify-center py-16 gap-3 text-center", children: [
        /* @__PURE__ */ jsxDEV(
          "div",
          {
            className: "w-14 h-14 rounded-2xl flex items-center justify-center",
            style: { backgroundColor: "#1c1917" },
            children: /* @__PURE__ */ jsxDEV(CreditCard, { className: "h-7 w-7 text-muted-foreground" }, void 0, false, {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
              lineNumber: 330,
              columnNumber: 15
            }, this)
          },
          void 0,
          false,
          {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 326,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "No subscriptions yet." }, void 0, false, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
          lineNumber: 332,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: openAdd,
            style: { backgroundColor: "#f59e0b", color: "#000" },
            className: "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold mt-1",
            children: [
              /* @__PURE__ */ jsxDEV(Plus, { className: "h-4 w-4" }, void 0, false, {
                fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                lineNumber: 338,
                columnNumber: 15
              }, this),
              "Add your first subscription"
            ]
          },
          void 0,
          true,
          {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 333,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
        lineNumber: 325,
        columnNumber: 11
      }, this) : /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-2", children: sortedSubs.map((sub) => {
        const catColors = CATEGORY_COLORS[sub.category];
        const monthly = toMonthly(sub.amount, sub.billingCycle);
        const isNotMonthly = sub.billingCycle !== "monthly";
        return /* @__PURE__ */ jsxDEV(
          "div",
          {
            className: `bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 transition-opacity ${sub.active ? "" : "opacity-50"}`,
            children: [
              /* @__PURE__ */ jsxDEV(
                "div",
                {
                  className: "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                  style: { backgroundColor: catColors.bg, color: catColors.color },
                  children: sub.name.charAt(0).toUpperCase()
                },
                void 0,
                false,
                {
                  fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                  lineNumber: 357,
                  columnNumber: 19
                },
                this
              ),
              /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-0.5 flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-medium text-foreground truncate", children: sub.name }, void 0, false, {
                  fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                  lineNumber: 366,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV(
                  "span",
                  {
                    className: "text-xs px-1.5 py-0.5 rounded-full self-start",
                    style: { backgroundColor: catColors.bg, color: catColors.color },
                    children: sub.category
                  },
                  void 0,
                  false,
                  {
                    fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                    lineNumber: 367,
                    columnNumber: 21
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                lineNumber: 365,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-end gap-0.5 shrink-0", children: [
                /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-semibold text-foreground tabular-nums", children: [
                  formatCurrency(sub.amount, sub.currency),
                  " ",
                  /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-normal text-muted-foreground", children: CYCLE_LABELS[sub.billingCycle] }, void 0, false, {
                    fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                    lineNumber: 379,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                  lineNumber: 377,
                  columnNumber: 21
                }, this),
                isNotMonthly && /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
                  "≈ ",
                  formatCurrency(monthly, sub.currency),
                  "/mo"
                ] }, void 0, true, {
                  fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                  lineNumber: 384,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                lineNumber: 376,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  onClick: () => toggleActive(sub),
                  title: sub.active ? "Pause" : "Resume",
                  className: `w-8 h-4 rounded-full transition-colors shrink-0 relative ${sub.active ? "" : "bg-muted"}`,
                  style: sub.active ? { backgroundColor: "#f59e0b" } : {},
                  children: /* @__PURE__ */ jsxDEV(
                    "span",
                    {
                      className: "absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all",
                      style: { left: sub.active ? "calc(100% - 14px)" : "2px" }
                    },
                    void 0,
                    false,
                    {
                      fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                      lineNumber: 399,
                      columnNumber: 21
                    },
                    this
                  )
                },
                void 0,
                false,
                {
                  fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                  lineNumber: 391,
                  columnNumber: 19
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  onClick: () => openEdit(sub),
                  className: "text-muted-foreground hover:text-foreground transition-colors shrink-0",
                  children: /* @__PURE__ */ jsxDEV(Pencil, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                    lineNumber: 410,
                    columnNumber: 21
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
                  lineNumber: 406,
                  columnNumber: 19
                },
                this
              )
            ]
          },
          sub.id,
          true,
          {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
            lineNumber: 350,
            columnNumber: 17
          },
          this
        );
      }) }, void 0, false, {
        fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
        lineNumber: 343,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
      lineNumber: 264,
      columnNumber: 7
    }, this),
    showForm && /* @__PURE__ */ jsxDEV(
      SubForm,
      {
        initial: formInitial,
        editingId,
        onSave: handleSave,
        onDelete: handleDelete,
        onClose: () => setShowForm(false)
      },
      void 0,
      false,
      {
        fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SubscriptionsPage.tsx",
        lineNumber: 421,
        columnNumber: 9
      },
      this
    )
  ] }, void 0);
}
const CURRENT_PATH = "/addons/subscription-stack/summary";
function SummaryPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  useEffect(() => {
    setSubscriptions(getSubscriptions());
  }, []);
  const active = subscriptions.filter((s) => s.active);
  const byCurrency = active.reduce((acc, s) => {
    if (!acc[s.currency]) acc[s.currency] = [];
    acc[s.currency].push(s);
    return acc;
  }, {});
  const currencies = Object.keys(byCurrency);
  const primaryCurrency = currencies[0] ?? "USD";
  const primarySubs = byCurrency[primaryCurrency] ?? [];
  const grandMonthly = primarySubs.reduce((sum, s) => sum + toMonthly(s.amount, s.billingCycle), 0);
  const grandYearly = primarySubs.reduce((sum, s) => sum + toYearly(s.amount, s.billingCycle), 0);
  const categoryMap = primarySubs.reduce((acc, s) => {
    const cat = s.category;
    if (!acc[cat]) {
      acc[cat] = { category: cat, monthly: 0, yearly: 0, currency: s.currency, count: 0 };
    }
    acc[cat].monthly += toMonthly(s.amount, s.billingCycle);
    acc[cat].yearly += toYearly(s.amount, s.billingCycle);
    acc[cat].count += 1;
    return acc;
  }, {});
  const categoryTotals = Object.values(categoryMap).sort((a, b) => b.monthly - a.monthly);
  const maxMonthly = categoryTotals[0]?.monthly ?? 1;
  const topSubs = [...primarySubs].sort((a, b) => toMonthly(b.amount, b.billingCycle) - toMonthly(a.amount, a.billingCycle)).slice(0, 5);
  if (active.length === 0) {
    return /* @__PURE__ */ jsxDEV(PageLayout, { activePath: CURRENT_PATH, children: /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center justify-center py-20 gap-2 text-center px-4", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "No active subscriptions to summarise." }, void 0, false, {
        fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
        lineNumber: 70,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "Add subscriptions in the Subscriptions tab." }, void 0, false, {
        fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
        lineNumber: 71,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
      lineNumber: 69,
      columnNumber: 9
    }, this) }, void 0);
  }
  return /* @__PURE__ */ jsxDEV(PageLayout, { activePath: CURRENT_PATH, children: /* @__PURE__ */ jsxDEV("div", { className: "px-4 py-4 flex flex-col gap-5 max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "bg-card border border-border rounded-xl p-4 flex flex-col gap-1", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Monthly" }, void 0, false, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
          lineNumber: 84,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "text-2xl font-bold text-foreground tabular-nums", children: formatCurrency(grandMonthly, primaryCurrency) }, void 0, false, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
          lineNumber: 85,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: [
          active.length,
          " subscriptions"
        ] }, void 0, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
          lineNumber: 88,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
        lineNumber: 83,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "bg-card border border-border rounded-xl p-4 flex flex-col gap-1", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Yearly" }, void 0, false, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
          lineNumber: 91,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "text-2xl font-bold text-foreground tabular-nums", children: formatCurrency(grandYearly, primaryCurrency) }, void 0, false, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
          lineNumber: 92,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: [
          formatCurrency(grandYearly / 52, primaryCurrency),
          "/wk avg"
        ] }, void 0, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
          lineNumber: 95,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
        lineNumber: 90,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
      lineNumber: 82,
      columnNumber: 9
    }, this),
    currencies.length > 1 && /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground px-1", children: [
      "Showing totals for ",
      primaryCurrency,
      " only. You also have subscriptions in",
      " ",
      currencies.slice(1).join(", "),
      "."
    ] }, void 0, true, {
      fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
      lineNumber: 103,
      columnNumber: 11
    }, this),
    categoryTotals.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "bg-card border border-border rounded-xl p-4 flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxDEV("h2", { className: "text-sm font-semibold text-foreground", children: "By category" }, void 0, false, {
        fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
        lineNumber: 112,
        columnNumber: 13
      }, this),
      categoryTotals.map((ct) => {
        const colors = CATEGORY_COLORS[ct.category];
        const barPct = Math.round(ct.monthly / maxMonthly * 100);
        return /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxDEV(
                "span",
                {
                  className: "text-xs px-2 py-0.5 rounded-full font-medium",
                  style: { backgroundColor: colors.bg, color: colors.color },
                  children: ct.category
                },
                void 0,
                false,
                {
                  fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
                  lineNumber: 120,
                  columnNumber: 23
                },
                this
              ),
              /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: [
                ct.count,
                " ",
                ct.count === 1 ? "sub" : "subs"
              ] }, void 0, true, {
                fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
                lineNumber: 126,
                columnNumber: 23
              }, this)
            ] }, void 0, true, {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
              lineNumber: 119,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-end", children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-semibold text-foreground tabular-nums", children: [
                formatCurrency(ct.monthly, ct.currency),
                "/mo"
              ] }, void 0, true, {
                fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
                lineNumber: 131,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
                formatCurrency(ct.yearly, ct.currency),
                "/yr"
              ] }, void 0, true, {
                fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
                lineNumber: 134,
                columnNumber: 23
              }, this)
            ] }, void 0, true, {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
              lineNumber: 130,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
            lineNumber: 118,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxDEV(
            "div",
            {
              className: "h-full rounded-full transition-all",
              style: {
                width: `${barPct}%`,
                backgroundColor: colors.color
              }
            },
            void 0,
            false,
            {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
              lineNumber: 141,
              columnNumber: 21
            },
            this
          ) }, void 0, false, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
            lineNumber: 140,
            columnNumber: 19
          }, this)
        ] }, ct.category, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
          lineNumber: 117,
          columnNumber: 17
        }, this);
      })
    ] }, void 0, true, {
      fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
      lineNumber: 111,
      columnNumber: 11
    }, this),
    topSubs.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "bg-card border border-border rounded-xl p-4 flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxDEV("h2", { className: "text-sm font-semibold text-foreground", children: "Top by cost" }, void 0, false, {
        fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
        lineNumber: 158,
        columnNumber: 13
      }, this),
      topSubs.map((sub, idx) => {
        const colors = CATEGORY_COLORS[sub.category];
        return /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground w-4 text-right shrink-0", children: idx + 1 }, void 0, false, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
            lineNumber: 163,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV(
            "div",
            {
              className: "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
              style: { backgroundColor: colors.bg, color: colors.color },
              children: sub.name.charAt(0).toUpperCase()
            },
            void 0,
            false,
            {
              fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
              lineNumber: 166,
              columnNumber: 19
            },
            this
          ),
          /* @__PURE__ */ jsxDEV("span", { className: "text-sm text-foreground flex-1 truncate", children: sub.name }, void 0, false, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
            lineNumber: 172,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-semibold text-foreground tabular-nums shrink-0", children: [
            formatCurrency(toMonthly(sub.amount, sub.billingCycle), sub.currency),
            "/mo"
          ] }, void 0, true, {
            fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
            lineNumber: 173,
            columnNumber: 19
          }, this)
        ] }, sub.id, true, {
          fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
          lineNumber: 162,
          columnNumber: 17
        }, this);
      })
    ] }, void 0, true, {
      fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
      lineNumber: 157,
      columnNumber: 11
    }, this)
  ] }, void 0, true, {
    fileName: "E:/Projects/Apps/Subscription_Stack/src/pages/SummaryPage.tsx",
    lineNumber: 79,
    columnNumber: 7
  }, this) }, void 0);
}
function enable(ctx) {
  setContext(ctx);
  const sidebarItem = ctx.sidebar.addItem({
    id: "subscription-stack",
    label: "Subscription Stack",
    icon: /* @__PURE__ */ jsxDEV(Layers, { className: "h-5 w-5" }, void 0),
    route: "/addons/subscription-stack",
    order: 400
  });
  ctx.router.add({
    path: "/addons/subscription-stack",
    component: ReactProxy.lazy(() => Promise.resolve({ default: SubscriptionsPage }))
  });
  ctx.router.add({
    path: "/addons/subscription-stack/summary",
    component: ReactProxy.lazy(() => Promise.resolve({ default: SummaryPage }))
  });
  ctx.onDisable(() => {
    try {
      sidebarItem.remove();
    } catch {
    }
  });
}
export {
  enable as default
};
//# sourceMappingURL=addon.js.map
