import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useWhyDidYouRender } from "./useWhyDidYouRender";
import { configure, resetConfig } from "../config";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Spy on all relevant console methods at once. */
function spyOnConsole() {
  return {
    log: vi.spyOn(console, "log").mockImplementation(() => {}),
    warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
    groupCollapsed: vi
      .spyOn(console, "groupCollapsed")
      .mockImplementation(() => {}),
    group: vi.spyOn(console, "group").mockImplementation(() => {}),
    groupEnd: vi.spyOn(console, "groupEnd").mockImplementation(() => {}),
    table: vi.spyOn(console, "table").mockImplementation(() => {}),
  };
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe("useWhyDidYouRender", () => {
  let spies: ReturnType<typeof spyOnConsole>;

  beforeEach(() => {
    resetConfig();
    // Enable tracking for all components so console output is exercised
    configure({ enabled: true });
    spies = spyOnConsole();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Return shape ───────────────────────────────────────────────────────────

  describe("return value shape", () => {
    it("returns changedProps, changedHooks and summary on first render", () => {
      const { result } = renderHook(() =>
        useWhyDidYouRender("TestComp", { value: 1 }),
      );
      expect(result.current).toHaveProperty("changedProps");
      expect(result.current).toHaveProperty("changedHooks");
      expect(result.current).toHaveProperty("summary");
    });

    it("changedProps and changedHooks are empty arrays on first render", () => {
      const { result } = renderHook(() =>
        useWhyDidYouRender("TestComp", { value: 1 }),
      );
      expect(result.current.changedProps).toEqual([]);
      expect(result.current.changedHooks).toEqual([]);
    });
  });

  // ── Summary on mount ───────────────────────────────────────────────────────

  describe("summary — first render (mount)", () => {
    it('contains the component name and "mounted"', () => {
      const { result } = renderHook(() =>
        useWhyDidYouRender("MyCard", { count: 0 }),
      );
      expect(result.current.summary).toContain("MyCard");
      expect(result.current.summary).toContain("mounted");
    });

    it("summary uses [RenderGuard] prefix", () => {
      const { result } = renderHook(() =>
        useWhyDidYouRender("Header", { x: 1 }),
      );
      expect(result.current.summary).toMatch(/^\[RenderGuard\]/);
    });
  });

  // ── Props diff ─────────────────────────────────────────────────────────────

  describe("props diff", () => {
    it("detects a changed prop after re-render", () => {
      let count = 0;
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Comp", { count }),
      );

      count = 1;
      rerender();

      expect(result.current.changedProps).toHaveLength(1);
      expect(result.current.changedProps[0]).toEqual({
        prop: "count",
        prev: 0,
        next: 1,
      });
    });

    it("detects multiple changed props simultaneously", () => {
      let a = "hello";
      let b = 42;
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Comp", { a, b }),
      );

      a = "world";
      b = 99;
      rerender();

      const propNames = result.current.changedProps.map((c) => c.prop);
      expect(propNames).toContain("a");
      expect(propNames).toContain("b");
      expect(result.current.changedProps).toHaveLength(2);
    });

    it("detects an added prop (new key not present before)", () => {
      let props: Record<string, unknown> = { x: 1 };
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Comp", props),
      );

      props = { x: 1, y: 2 };
      rerender();

      const propNames = result.current.changedProps.map((c) => c.prop);
      expect(propNames).toContain("y");
    });

    it("detects a removed prop (key present before, now undefined)", () => {
      let props: Record<string, unknown> = { x: 1, y: 2 };
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Comp", props),
      );

      props = { x: 1 };
      rerender();

      const changed = result.current.changedProps.find((c) => c.prop === "y");
      expect(changed).toBeDefined();
      expect(changed?.prev).toBe(2);
      expect(changed?.next).toBeUndefined();
    });

    it("reports NO changed props when all values are referentially identical", () => {
      const obj = { a: 1 };
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Comp", { obj }),
      );

      rerender(); // same reference

      expect(result.current.changedProps).toHaveLength(0);
    });

    it("detects object reference change even when value is deeply equal", () => {
      let obj = { a: 1 };
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Comp", { obj }),
      );

      obj = { a: 1 }; // new reference, same shape
      rerender();

      expect(result.current.changedProps).toHaveLength(1);
      expect(result.current.changedProps[0].prop).toBe("obj");
    });
  });

  // ── Hooks diff ─────────────────────────────────────────────────────────────

  describe("hooks diff", () => {
    it("detects a changed hook value after re-render", () => {
      let theme = "light";
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Comp", {}, { "useContext › theme": theme }),
      );

      theme = "dark";
      rerender();

      expect(result.current.changedHooks).toHaveLength(1);
      expect(result.current.changedHooks[0]).toMatchObject({
        hook: "useContext › theme",
        prev: "light",
        next: "dark",
      });
    });

    it("assigns the correct index to each changed hook", () => {
      let count = 0;
      let open = false;
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Comp", {}, {
          "hook-0-unchanged": "x",
          "useState › count": count,
          "useState › open": open,
        }),
      );

      count = 5;
      open = true;
      rerender();

      const countChange = result.current.changedHooks.find(
        (h) => h.hook === "useState › count",
      );
      const openChange = result.current.changedHooks.find(
        (h) => h.hook === "useState › open",
      );
      expect(countChange?.index).toBe(1); // second key in object
      expect(openChange?.index).toBe(2); // third key in object
    });

    it("does NOT report unchanged hook values", () => {
      let value = 1;
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Comp", {}, {
          "stable": "unchanged",
          "dynamic": value,
        }),
      );

      value = 2;
      rerender();

      expect(result.current.changedHooks).toHaveLength(1);
      expect(result.current.changedHooks[0].hook).toBe("dynamic");
    });

    it("works correctly without a hooks argument", () => {
      let count = 0;
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Comp", { count }),
      );

      count = 1;
      rerender();

      expect(result.current.changedHooks).toHaveLength(0);
      expect(result.current.changedProps).toHaveLength(1);
    });

    it("changedHooks is empty on first render even when hooks are provided", () => {
      const { result } = renderHook(() =>
        useWhyDidYouRender("Comp", {}, { "someHook": 42 }),
      );
      expect(result.current.changedHooks).toEqual([]);
    });
  });

  // ── Summary on re-render ───────────────────────────────────────────────────

  describe("summary — re-renders", () => {
    it("mentions the changed prop name in the summary", () => {
      let title = "A";
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Card", { title }),
      );

      title = "B";
      rerender();

      expect(result.current.summary).toContain("title");
      expect(result.current.summary).toContain("props");
    });

    it("mentions the changed hook name in the summary", () => {
      let theme = "light";
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Card", {}, { "useContext › theme": theme }),
      );

      theme = "dark";
      rerender();

      expect(result.current.summary).toContain("useContext › theme");
      expect(result.current.summary).toContain("hooks");
    });

    it('reports "no tracked changes" when nothing changed on re-render', () => {
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("Card", { stable: 1 }),
      );

      rerender();

      expect(result.current.summary).toContain("no tracked changes");
    });

    it("includes component name in re-render summary", () => {
      let x = 0;
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("SpecialComp", { x }),
      );

      x = 1;
      rerender();

      expect(result.current.summary).toContain("SpecialComp");
    });
  });

  // ── Console output ─────────────────────────────────────────────────────────

  describe("console output", () => {
    it("calls console.log with green colour on mount", () => {
      renderHook(() => useWhyDidYouRender("LogTest", { a: 1 }));

      expect(spies.log).toHaveBeenCalledWith(
        expect.stringContaining("[RenderGuard] LogTest mounted"),
        "color: #4ade80",
      );
    });

    it("calls console.warn on re-render with no changes", () => {
      const { rerender } = renderHook(() =>
        useWhyDidYouRender("WarnTest", { stable: true }),
      );

      rerender();

      expect(spies.warn).toHaveBeenCalledWith(
        expect.stringContaining("no tracked changes"),
      );
    });

    it("calls console.groupCollapsed when props changed", () => {
      let count = 0;
      const { rerender } = renderHook(() =>
        useWhyDidYouRender("GroupTest", { count }),
      );

      count = 1;
      rerender();

      expect(spies.groupCollapsed).toHaveBeenCalled();
    });

    it("calls console.table with changed props data", () => {
      let name = "Alice";
      const { rerender } = renderHook(() =>
        useWhyDidYouRender("TableTest", { name }),
      );

      name = "Bob";
      rerender();

      expect(spies.table).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ prop: "name" }),
        ]),
      );
    });

    it("calls console.table with changed hooks data", () => {
      let count = 0;
      const { rerender } = renderHook(() =>
        useWhyDidYouRender("HookTableTest", {}, { "useState › count": count }),
      );

      count = 1;
      rerender();

      expect(spies.table).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ hook: "useState › count" }),
        ]),
      );
    });

    it("does NOT call console output when component is not tracked", () => {
      configure({ enabled: true, only: ["OtherComp"] });

      renderHook(() => useWhyDidYouRender("UntrackableComp", { x: 1 }));

      expect(spies.log).not.toHaveBeenCalled();
      expect(spies.warn).not.toHaveBeenCalled();
      expect(spies.groupCollapsed).not.toHaveBeenCalled();
    });

    it("does NOT log when enabled is false", () => {
      configure({ enabled: false });

      const { rerender } = renderHook(() =>
        useWhyDidYouRender("DisabledComp", { x: 1 }),
      );
      rerender();

      expect(spies.log).not.toHaveBeenCalled();
      expect(spies.warn).not.toHaveBeenCalled();
    });

    it("logs when component name is in the only allowlist", () => {
      configure({ enabled: true, only: ["AllowedComp"] });

      renderHook(() => useWhyDidYouRender("AllowedComp", { a: 1 }));

      expect(spies.log).toHaveBeenCalledWith(
        expect.stringContaining("AllowedComp mounted"),
        expect.any(String),
      );
    });
  });

  // ── formatValue (tested indirectly via console.table) ─────────────────────

  describe("formatValue (via table output)", () => {
    it("formats undefined as the string 'undefined'", () => {
      let val: unknown = undefined;
      const { rerender } = renderHook(() =>
        useWhyDidYouRender("FmtTest", { val }),
      );

      val = 1;
      rerender();

      expect(spies.table).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ prev: "undefined" }),
        ]),
      );
    });

    it("formats null as the string 'null'", () => {
      let val: unknown = null;
      const { rerender } = renderHook(() =>
        useWhyDidYouRender("FmtTest", { val }),
      );

      val = 1;
      rerender();

      expect(spies.table).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ prev: "null" }),
        ]),
      );
    });

    it("formats a named function as '[Function functionName]'", () => {
      function myFunc() {}
      let val: unknown = myFunc;
      const { rerender } = renderHook(() =>
        useWhyDidYouRender("FmtTest", { val }),
      );

      val = () => {};
      rerender();

      expect(spies.table).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ prev: "[Function myFunc]" }),
        ]),
      );
    });

    it("formats an anonymous function as '[Function anonymous]'", () => {
      // Arrow functions assigned to a variable may or may not have a name;
      // use Object.defineProperty to guarantee it's anonymous.
      const anon = Object.defineProperty(() => {}, "name", { value: "" });
      let val: unknown = anon;
      const { rerender } = renderHook(() =>
        useWhyDidYouRender("FmtTest", { val }),
      );

      val = () => {};
      rerender();

      expect(spies.table).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ prev: "[Function anonymous]" }),
        ]),
      );
    });

    it("truncates long JSON strings to 80 chars with an ellipsis", () => {
      const longString = "x".repeat(100);
      let val: unknown = longString;
      const { rerender } = renderHook(() =>
        useWhyDidYouRender("FmtTest", { val }),
      );

      val = "different";
      rerender();

      const tableCall = spies.table.mock.calls[0][0] as Array<{
        prev: string;
      }>;
      // JSON.stringify("xx...") adds quotes, so total length is 102.
      // Truncated version: 77 visible chars + "…" = 78 chars (after slicing the stringified form).
      expect(tableCall[0].prev.endsWith("…")).toBe(true);
      expect(tableCall[0].prev.length).toBeLessThanOrEqual(80);
    });
  });

  // ── Render count tracking ──────────────────────────────────────────────────

  describe("render count tracking", () => {
    it("does not include changes on the very first render", () => {
      const { result } = renderHook(() =>
        useWhyDidYouRender("RC", { a: 1, b: 2 }),
      );
      expect(result.current.changedProps).toHaveLength(0);
    });

    it("accumulates independent state between consecutive re-renders", () => {
      let val = 0;
      const { result, rerender } = renderHook(() =>
        useWhyDidYouRender("RC", { val }),
      );

      val = 1;
      rerender(); // render #2
      expect(result.current.changedProps[0].prev).toBe(0);
      expect(result.current.changedProps[0].next).toBe(1);

      val = 2;
      rerender(); // render #3
      expect(result.current.changedProps[0].prev).toBe(1);
      expect(result.current.changedProps[0].next).toBe(2);
    });
  });
});
