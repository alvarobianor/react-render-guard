import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useFlashOnRender } from "./useFlashOnRender";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal HTMLElement stub that tracks style changes. */
function makeFakeEl() {
  let _animation = "";
  let _flashColor = "";
  return {
    style: {
      get animation() {
        return _animation;
      },
      set animation(v: string) {
        _animation = v;
      },
      setProperty(prop: string, value: string) {
        if (prop === "--rg-flash-color") _flashColor = value;
      },
      get flashColor() {
        return _flashColor;
      },
    },
    get offsetHeight() {
      return 42;
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useFlashOnRender", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a ref and renderCount of 1 on first render", () => {
    const { result } = renderHook(() => useFlashOnRender("TestComp"));

    expect(result.current.ref).toBeDefined();
    expect(result.current.renderCount).toBe(1);
  });

  it("increments renderCount on re-render", () => {
    const { result, rerender } = renderHook(() =>
      useFlashOnRender("TestComp"),
    );

    expect(result.current.renderCount).toBe(1);
    rerender();
    expect(result.current.renderCount).toBe(2);
    rerender();
    expect(result.current.renderCount).toBe(3);
  });

  it("injects the keyframe <style> into document.head (happens at module load time)", () => {
    // injectFlashKeyframes() runs at module level (outside any hook) so the
    // tag is present as soon as the module is imported.
    const styleTag = document.getElementById("__rg_flash_style__");
    expect(styleTag).not.toBeNull();
    expect(styleTag?.textContent).toContain("__rg_flash__");
  });

  it("does NOT inject duplicate <style> tags across multiple hook instances", () => {
    renderHook(() => useFlashOnRender("A"));
    renderHook(() => useFlashOnRender("B"));

    const tags = document.querySelectorAll("#__rg_flash_style__");
    expect(tags.length).toBe(1);
  });

  it("applies animation to the DOM element when ref is attached and hook re-renders", () => {
    const fakeEl = makeFakeEl();
    const { result, rerender } = renderHook(() =>
      useFlashOnRender<HTMLDivElement>("TestComp"),
    );

    act(() => {
      (result.current.ref as { current: unknown }).current =
        fakeEl as unknown as HTMLDivElement;
    });

    rerender(); // effect fires with the ref populated now

    expect(fakeEl.style.animation).toMatch(/__rg_flash__/);
  });

  it("uses the custom duration when provided", () => {
    const fakeEl = makeFakeEl();
    const { result, rerender } = renderHook(() =>
      useFlashOnRender<HTMLDivElement>("X", { duration: 800 }),
    );

    act(() => {
      (result.current.ref as { current: unknown }).current =
        fakeEl as unknown as HTMLDivElement;
    });
    rerender();

    expect(fakeEl.style.animation).toContain("800ms");
  });

  it("defaults to 400ms duration when none is specified", () => {
    const fakeEl = makeFakeEl();
    const { result, rerender } = renderHook(() =>
      useFlashOnRender<HTMLDivElement>("Y"),
    );

    act(() => {
      (result.current.ref as { current: unknown }).current =
        fakeEl as unknown as HTMLDivElement;
    });
    rerender();

    expect(fakeEl.style.animation).toContain("400ms");
  });

  describe("getRenderColor colour thresholds (via element style)", () => {
    /** Mount a hook, attach the fake element, re-render to `targetCount` total renders. */
    function getColorAtRenderCount(
      targetCount: number,
      fakeEl: ReturnType<typeof makeFakeEl>,
    ) {
      const { result, rerender } = renderHook(() =>
        useFlashOnRender<HTMLDivElement>("ColourTest"),
      );

      act(() => {
        (result.current.ref as { current: unknown }).current =
          fakeEl as unknown as HTMLDivElement;
      });

      // Additional rerenders to reach targetCount (mount already counted as 1)
      for (let i = 1; i < targetCount; i++) rerender();

      return fakeEl.style.flashColor;
    }

    it("uses cyan (#61dafb) when renderCount is 2 or 3", () => {
      const fakeEl = makeFakeEl();
      const color = getColorAtRenderCount(3, fakeEl);
      expect(color).toBe("#61dafb");
    });

    it("uses orange (#fb923c) when renderCount is between 4 and 8", () => {
      const fakeEl = makeFakeEl();
      const color = getColorAtRenderCount(5, fakeEl);
      expect(color).toBe("#fb923c");
    });

    it("uses red (#f87171) when renderCount exceeds 8", () => {
      const fakeEl = makeFakeEl();
      const color = getColorAtRenderCount(10, fakeEl);
      expect(color).toBe("#f87171");
    });

    it("uses green (#4ade80) or cyan (#61dafb) on the very first observable render", () => {
      // On mount (renderCount = 1), the ref is null so the effect is a no-op.
      // The earliest colour we can observe is renderCount = 2 after attaching.
      const fakeEl = makeFakeEl();
      const { result, rerender } = renderHook(() =>
        useFlashOnRender<HTMLDivElement>("EarlyColour"),
      );
      // Attach ref before the second render
      act(() => {
        (result.current.ref as { current: unknown }).current =
          fakeEl as unknown as HTMLDivElement;
      });
      rerender(); // renderCount = 2
      expect(["#4ade80", "#61dafb"]).toContain(fakeEl.style.flashColor);
    });
  });
});
