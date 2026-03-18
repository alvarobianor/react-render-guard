import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRenderCheck } from "./useRenderCheck";

describe("useRenderCheck", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("logs on every render with the correct component name", () => {
    const { rerender } = renderHook(() => useRenderCheck("MyComponent"));

    rerender();
    rerender();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("MyComponent"),
    );
  });

  it("increments the render count on each re-render", () => {
    const { result, rerender } = renderHook(() => useRenderCheck("Counter"));

    // After initial mount useEffect runs once, but the ref is 0 before the effect
    expect(result.current).toBe(0);

    rerender();
    expect(result.current).toBe(1);

    rerender();
    expect(result.current).toBe(2);
  });

  it("logs message matching [RenderGuard] format", () => {
    renderHook(() => useRenderCheck("TestComp"));

    // After mount, effect fires once
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[RenderGuard\] TestComp rendered \d+ times/),
    );
  });

  it("works independently for different component names", () => {
    const { rerender: rerenderA } = renderHook(() => useRenderCheck("CompA"));
    const { rerender: rerenderB } = renderHook(() => useRenderCheck("CompB"));

    rerenderA();
    rerenderB();

    const calls = consoleSpy.mock.calls.map((c: unknown[]) => c[0]);
    expect(calls.some((msg: string | string[]) => msg.includes("CompA"))).toBe(
      true,
    );
    expect(calls.some((msg: string | string[]) => msg.includes("CompB"))).toBe(
      true,
    );
  });
});
