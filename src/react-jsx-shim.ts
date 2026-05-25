/**
 * Shim for react/jsx-runtime AND react/jsx-dev-runtime.
 *
 * In production mode react/cjs/react-jsx-dev-runtime.production.js sets
 * jsxDEV = void 0, so calls from compiled JSX crash at runtime.
 * This shim delegates to window.React.createElement so all JSX goes
 * through the host React instance.
 */

const r = (): typeof import("react") => (window as any).React;

// Symbol.for is a global registry — this will equal the host's Fragment symbol.
export const Fragment: unique symbol = Symbol.for("react.fragment") as never;

function makeElement(type: unknown, props: Record<string, unknown> | null, key?: unknown) {
  const config: Record<string, unknown> = {};

  if (key !== undefined && key !== null) {
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
    return r().createElement(type as React.ElementType, config as React.Attributes, ...(children as React.ReactNode[]));
  }
  if (children !== undefined) {
    return r().createElement(type as React.ElementType, config as React.Attributes, children as React.ReactNode);
  }
  return r().createElement(type as React.ElementType, config as React.Attributes);
}

export function jsx(type: unknown, props: Record<string, unknown> | null, key?: unknown) {
  return makeElement(type, props, key);
}

export function jsxs(type: unknown, props: Record<string, unknown> | null, key?: unknown) {
  return makeElement(type, props, key);
}

export function jsxDEV(
  type: unknown,
  props: Record<string, unknown> | null,
  key?: unknown,
  _isStaticChildren?: boolean,
  _source?: unknown,
  _self?: unknown,
) {
  return makeElement(type, props, key);
}
