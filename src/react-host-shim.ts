/**
 * Lazy React shim — delegates all access to window.React at call time.
 *
 * Wealthfolio provides React as window.React AFTER the addon module loads,
 * so we must not capture it at module init time. Every export here reads
 * window.React on each invocation so the correct host instance is always used.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const r = (): any => (window as any).React;

// Default export — Proxy so any property access (e.g. React.Fragment) is lazy
const ReactProxy = new Proxy({} as typeof import("react"), {
  get: (_t, key) => r()[key],
});
export default ReactProxy;

// ── Hooks ──────────────────────────────────────────────────────────────────
export const useState: typeof import("react").useState = (...args: any[]) =>
  r().useState(...args);

export const useEffect: typeof import("react").useEffect = (...args: any[]) =>
  r().useEffect(...args);

export const useRef: typeof import("react").useRef = (...args: any[]) =>
  r().useRef(...args);

export const useCallback: typeof import("react").useCallback = (...args: any[]) =>
  r().useCallback(...args);

export const useMemo: typeof import("react").useMemo = (...args: any[]) =>
  r().useMemo(...args);

export const useContext: typeof import("react").useContext = (...args: any[]) =>
  r().useContext(...args);

export const useLayoutEffect: typeof import("react").useLayoutEffect = (...args: any[]) =>
  r().useLayoutEffect(...args);

export const useReducer: typeof import("react").useReducer = (...args: any[]) =>
  r().useReducer(...args);

export const useId: typeof import("react").useId = () => r().useId();

// ── Utilities ──────────────────────────────────────────────────────────────
export const createContext: typeof import("react").createContext = (...args: any[]) =>
  r().createContext(...args);

export const forwardRef: typeof import("react").forwardRef = (...args: any[]) =>
  r().forwardRef(...args);

export const memo: typeof import("react").memo = (...args: any[]) =>
  r().memo(...args);

export const lazy: typeof import("react").lazy = (fn: any) =>
  r().lazy(fn);

export const createElement: typeof import("react").createElement = (...args: any[]) =>
  r().createElement(...args);

export type { FC, ReactNode, ReactElement, CSSProperties, ChangeEvent,
  MouseEvent, FormEvent, KeyboardEvent, RefObject, MutableRefObject,
  Dispatch, SetStateAction, DependencyList, Context, ComponentType,
  ComponentProps, PropsWithChildren, LazyExoticComponent } from "react";
