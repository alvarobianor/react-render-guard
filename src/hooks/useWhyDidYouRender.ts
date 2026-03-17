import { useRef, useEffect } from "react";
import { isTracked } from "../config";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PropChange {
  prop: string;
  prev: unknown;
  next: unknown;
}

export interface HookChange {
  hook: string;
  index: number;
  prev: unknown;
  next: unknown;
}

export interface WhyRenderResult {
  /** Props that changed between the last two renders */
  changedProps: PropChange[];
  /** Hook slots whose values changed between the last two renders */
  changedHooks: HookChange[];
  /** Human-readable summary logged to the console */
  summary: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatValue(v: unknown): string {
  if (v === undefined) return "undefined";
  if (v === null) return "null";
  if (typeof v === "function") return `[Function ${(v as Function).name || "anonymous"}]`;
  try {
    const s = JSON.stringify(v);
    return s.length > 80 ? s.slice(0, 77) + "…" : s;
  } catch {
    return String(v);
  }
}

// ─── Main hook ───────────────────────────────────────────────────────────────

/**
 * Tracks which props and hook values changed between renders.
 * Logs a diff table to the browser console automatically.
 *
 * **Props diff** — compares every key of the `props` object by reference (`!==`).
 *
 * **Hooks tracker** — pass an object of named hook values, e.g.:
 * ```ts
 * const { user } = useContext(AuthCtx);
 * const [count, setCount] = useState(0);
 *
 * useWhyDidYouRender("MyComponent", props, {
 *   "useContext(AuthCtx) › user": user,
 *   "useState › count": count,
 * });
 * ```
 *
 * @param name      Component name shown in the console diff
 * @param props     Component props object (from the render function argument)
 * @param hooks     Optional flat record of labelled hook values to track
 *
 * @example
 * function UserCard(props: Props) {
 *   const { theme } = useContext(ThemeCtx);
 *   const [open, setOpen] = useState(false);
 *   useWhyDidYouRender("UserCard", props, {
 *     "useContext › theme": theme,
 *     "useState › open": open,
 *   });
 *   return <div>...</div>;
 * }
 */
export function useWhyDidYouRender<P extends Record<string, unknown>>(
  name: string,
  props: P,
  hooks?: Record<string, unknown>,
): WhyRenderResult {
  const prevProps = useRef<P | null>(null);
  const prevHooks = useRef<Record<string, unknown> | null>(null);
  const renderCount = useRef(0);
  renderCount.current += 1;

  const changedProps: PropChange[] = [];
  const changedHooks: HookChange[] = [];

  // ── Props diff ──────────────────────────────────────────────────────────────
  if (prevProps.current !== null) {
    const allKeys = new Set([
      ...Object.keys(prevProps.current),
      ...Object.keys(props),
    ]);
    for (const key of allKeys) {
      if (prevProps.current[key] !== props[key]) {
        changedProps.push({
          prop: key,
          prev: prevProps.current[key],
          next: props[key],
        });
      }
    }
  }

  // ── Hooks diff ──────────────────────────────────────────────────────────────
  if (hooks && prevHooks.current !== null) {
    const keys = Object.keys(hooks);
    keys.forEach((key, idx) => {
      if (prevHooks.current![key] !== hooks[key]) {
        changedHooks.push({
          hook: key,
          index: idx,
          prev: prevHooks.current![key],
          next: hooks[key],
        });
      }
    });
  }

  // ── Update refs ─────────────────────────────────────────────────────────────
  prevProps.current = props;
  prevHooks.current = hooks ?? null;

  // ── Build summary ───────────────────────────────────────────────────────────
  let summary = "";
  if (renderCount.current > 1) {
    const parts: string[] = [];
    if (changedProps.length) {
      parts.push(`props: [${changedProps.map((c) => c.prop).join(", ")}]`);
    }
    if (changedHooks.length) {
      parts.push(`hooks: [${changedHooks.map((c) => c.hook).join(", ")}]`);
    }
    summary =
      parts.length === 0
        ? `[RenderGuard] ${name} re-rendered — no tracked changes detected (parent/context trigger?)`
        : `[RenderGuard] ${name} re-rendered because ${parts.join(" • ")}`;
  } else {
    summary = `[RenderGuard] ${name} mounted`;
  }

  // ── Console output (only in dev and when tracked) ───────────────────────────
  useEffect(() => {
    if (!isTracked(name)) return;
    if (renderCount.current === 1) {
      console.log(`%c[RenderGuard] ${name} mounted`, "color: #4ade80");
      return;
    }
    if (changedProps.length === 0 && changedHooks.length === 0) {
      console.warn(summary);
      return;
    }
    console.groupCollapsed(
      `%c[RenderGuard] ${name} %c#${renderCount.current}`,
      "color: #61dafb; font-weight: bold",
      "color: #aaa",
    );
    if (changedProps.length) {
      console.group("📦 Changed Props");
      console.table(
        changedProps.map((c) => ({
          prop: c.prop,
          prev: formatValue(c.prev),
          next: formatValue(c.next),
        })),
      );
      console.groupEnd();
    }
    if (changedHooks.length) {
      console.group("🪝 Changed Hooks");
      console.table(
        changedHooks.map((c) => ({
          hook: c.hook,
          prev: formatValue(c.prev),
          next: formatValue(c.next),
        })),
      );
      console.groupEnd();
    }
    console.groupEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return { changedProps, changedHooks, summary };
}
