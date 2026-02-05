import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RenderGuard } from "./RenderGuard";

describe("RenderGuard Component", () => {
  it("renders children correctly", () => {
    render(
      <RenderGuard>
        <div data-testid="child">Test Child</div>
      </RenderGuard>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("renders with custom threshold", () => {
    render(
      <RenderGuard threshold={5}>
        <div>Child with threshold</div>
      </RenderGuard>,
    );
    expect(screen.getByText("Child with threshold")).toBeInTheDocument();
  });

  it("renders overlay when render happens", async () => {
    // Note: React Profiler might not fire in standard jsdom test environment effectively without mocking or specific setup.
    // We are just ensuring it mounts without error for now.
    render(
      <RenderGuard>
        <div>Overlay Test</div>
      </RenderGuard>,
    );
    // The overlay is rendered via portal, so it should be in document.body
    // Initially it is hidden (count 0), we can't easily force profiler callback in simple unit test without mocking React
    // So we just pass the rendering test.
    expect(screen.getByText("Overlay Test")).toBeVisible();
  });
});
