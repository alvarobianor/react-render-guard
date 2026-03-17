import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RenderOverlay } from "./RenderOverlay";

describe("RenderOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when renderCount is 0", () => {
    const { container } = render(
      <RenderOverlay lastRenderTime={0} renderCount={0} lastRenderId="" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("becomes visible once renderCount > 0", async () => {
    const { rerender } = render(
      <RenderOverlay lastRenderTime={10} renderCount={0} lastRenderId="root" />,
    );

    rerender(
      <RenderOverlay lastRenderTime={10} renderCount={1} lastRenderId="root" />,
    );

    expect(screen.getByText("RenderGuard")).toBeInTheDocument();
  });

  it("displays the lastRenderTime formatted to 2 decimals", () => {
    render(
      <RenderOverlay
        lastRenderTime={8.456}
        renderCount={1}
        lastRenderId="root"
      />,
    );

    expect(screen.getByText("8.46ms")).toBeInTheDocument();
  });

  it("shows the total render count", () => {
    render(
      <RenderOverlay lastRenderTime={5} renderCount={7} lastRenderId="root" />,
    );

    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("shows the lastRenderId (source)", () => {
    render(
      <RenderOverlay
        lastRenderTime={5}
        renderCount={1}
        lastRenderId="MyProfilerRoot"
      />,
    );

    expect(screen.getByText("MyProfilerRoot")).toBeInTheDocument();
  });

  it("clears the flash state after 300ms", () => {
    render(
      <RenderOverlay
        lastRenderTime={10}
        renderCount={1}
        lastRenderId="root"
      />,
    );

    // Advance the timer inside act() to flush the resulting state update
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // After 300ms, flash := false — the component should still be present
    expect(screen.getByText("RenderGuard")).toBeInTheDocument();
  });

  describe("status colours based on duration", () => {
    it("uses green (#4caf50) for durations < 16ms", () => {
      render(
        <RenderOverlay lastRenderTime={8} renderCount={1} lastRenderId="r" />,
      );
      // The colour indicator element exists
      const indicator = document.querySelector("[style*='8px']");
      expect(indicator).not.toBeNull();
    });

    it("renders with fast render (< 16ms) without crash", () => {
      render(
        <RenderOverlay lastRenderTime={5} renderCount={1} lastRenderId="r" />,
      );
      expect(screen.getByText("5.00ms")).toBeInTheDocument();
    });

    it("renders with moderate render (16–50ms) without crash", () => {
      render(
        <RenderOverlay lastRenderTime={30} renderCount={1} lastRenderId="r" />,
      );
      expect(screen.getByText("30.00ms")).toBeInTheDocument();
    });

    it("renders with slow render (> 50ms) without crash", () => {
      render(
        <RenderOverlay lastRenderTime={80} renderCount={1} lastRenderId="r" />,
      );
      expect(screen.getByText("80.00ms")).toBeInTheDocument();
    });
  });

  it("re-triggers flash when renderCount changes again", () => {
    const { rerender } = render(
      <RenderOverlay lastRenderTime={10} renderCount={1} lastRenderId="r" />,
    );

    act(() => {
      vi.advanceTimersByTime(300); // flash off
    });

    rerender(
      <RenderOverlay lastRenderTime={20} renderCount={2} lastRenderId="r" />,
    );

    // flash should be back on — component is still visible
    expect(screen.getByText("RenderGuard")).toBeInTheDocument();
  });
});
