/**
 * Snapshot tests for the public RenderGuard components.
 *
 * Philosophy
 * ──────────
 * Snapshot tests catch *unintentional* structural or stylistic regressions.
 * They are NOT a substitute for behavioural unit tests — they complement them.
 *
 * Rules:
 *  • Every snapshot describes a single, named rendering scenario.
 *  • Dynamic values (timers, Date.now, randomness) are mocked or fixed so
 *    snapshots stay deterministic across runs.
 *  • When you make an *intentional* UI change, update the snapshots with:
 *      npm test -- --update-snapshots
 */

import React, { act } from "react";
import {
  render,
  type RenderResult,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { RenderFlash } from "./RenderFlash";
import { RenderOverlay } from "./RenderOverlay";
import { withRenderFlash } from "../hoc/withRenderFlash";

// ─── Shared timer setup ────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ═══════════════════════════════════════════════════════════════════════════
// RenderFlash
// ═══════════════════════════════════════════════════════════════════════════

describe("Snapshot › RenderFlash", () => {
  it("renders with a name and default display", () => {
    const { container } = render(
      <RenderFlash name="MyWidget">
        <span>content</span>
      </RenderFlash>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders without a name prop (data-rg-flash attribute omitted by React)", () => {
    const { container } = render(
      <RenderFlash>
        <span>anonymous</span>
      </RenderFlash>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders with display='inline-block'", () => {
    const { container } = render(
      <RenderFlash name="Inline" display="inline-block">
        foo
      </RenderFlash>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders with a custom className and style overrides", () => {
    const { container } = render(
      <RenderFlash
        name="Styled"
        className="my-class"
        style={{ border: "1px solid red" }}
      >
        styled
      </RenderFlash>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders with a custom duration (attribute passthrough only)", () => {
    const { container } = render(
      <RenderFlash name="Slow" duration={800}>
        slow
      </RenderFlash>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RenderOverlay
// ═══════════════════════════════════════════════════════════════════════════

describe("Snapshot › RenderOverlay", () => {
  it("renders nothing (null) when renderCount is 0", () => {
    const { container } = render(
      <RenderOverlay lastRenderTime={0} renderCount={0} lastRenderId="" />,
    );
    expect(container.firstChild).toBeNull();
    expect(container).toMatchSnapshot();
  });

  it("renders the visible overlay on the first render (fast — < 16 ms)", () => {
    let result!: RenderResult;
    act(() => {
      result = render(
        <RenderOverlay
          lastRenderTime={8}
          renderCount={1}
          lastRenderId="root"
        />,
      );
    });
    expect(result.container.firstChild).toMatchSnapshot();
  });

  it("renders with a moderate render time (16 – 50 ms → orange)", () => {
    let result!: RenderResult;
    act(() => {
      result = render(
        <RenderOverlay
          lastRenderTime={32}
          renderCount={1}
          lastRenderId="root"
        />,
      );
    });
    expect(result.container.firstChild).toMatchSnapshot();
  });

  it("renders with a slow render time (> 50 ms → red)", () => {
    let result!: RenderResult;
    act(() => {
      result = render(
        <RenderOverlay
          lastRenderTime={75}
          renderCount={1}
          lastRenderId="root"
        />,
      );
    });
    expect(result.container.firstChild).toMatchSnapshot();
  });

  it("snapshot after flash timeout clears (border back to #333)", () => {
    let result!: RenderResult;
    act(() => {
      result = render(
        <RenderOverlay
          lastRenderTime={10}
          renderCount={1}
          lastRenderId="root"
        />,
      );
    });

    // Advance the fake timer so flash := false
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.container.firstChild).toMatchSnapshot();
  });

  it("renders with a long lastRenderId (truncated via CSS)", () => {
    let result!: RenderResult;
    act(() => {
      result = render(
        <RenderOverlay
          lastRenderTime={5}
          renderCount={3}
          lastRenderId="VeryLongComponentNameThatShouldTruncate"
        />,
      );
    });
    expect(result.container.firstChild).toMatchSnapshot();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// withRenderFlash HOC
// ═══════════════════════════════════════════════════════════════════════════

describe("Snapshot › withRenderFlash", () => {
  const Button: React.FC<{ label: string }> = ({ label }) => (
    <button type="button">{label}</button>
  );
  Button.displayName = "Button";

  it("wraps a named component — wrapper div has data-rg-flash", () => {
    const FlashButton = withRenderFlash(Button);
    const { container } = render(<FlashButton label="click me" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("accepts an explicit displayName argument", () => {
    const FlashButton = withRenderFlash(Button, "PrimaryButton");
    const { container } = render(<FlashButton label="primary" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("accepts a custom duration option", () => {
    const FlashButton = withRenderFlash(Button, "SlowButton", { duration: 800 });
    const { container } = render(<FlashButton label="slow" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
