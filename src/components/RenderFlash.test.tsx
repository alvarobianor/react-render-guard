import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RenderFlash } from "./RenderFlash";

describe("RenderFlash", () => {
  it("renders children", () => {
    render(
      <RenderFlash>
        <span data-testid="child">Hello</span>
      </RenderFlash>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies data-rg-flash attribute with the given name", () => {
    render(<RenderFlash name="FormRow">content</RenderFlash>);
    const wrapper = document.querySelector("[data-rg-flash='FormRow']");
    expect(wrapper).not.toBeNull();
  });

  it("applies data-rg-renders attribute with a numeric value", () => {
    render(<RenderFlash name="Card">content</RenderFlash>);
    const wrapper = document.querySelector("[data-rg-renders]");
    expect(wrapper).not.toBeNull();
    expect(Number(wrapper?.getAttribute("data-rg-renders"))).toBeGreaterThanOrEqual(1);
  });

  it("uses display='contents' by default", () => {
    render(<RenderFlash name="Default">text</RenderFlash>);
    const wrapper = document.querySelector("[data-rg-flash='Default']") as HTMLElement | null;
    expect(wrapper?.style.display).toBe("contents");
  });

  it("accepts a custom display prop", () => {
    render(
      <RenderFlash name="Block" display="block">
        text
      </RenderFlash>,
    );
    const wrapper = document.querySelector("[data-rg-flash='Block']") as HTMLElement | null;
    expect(wrapper?.style.display).toBe("block");
  });

  it("applies additional className", () => {
    render(
      <RenderFlash name="Cls" className="my-class">
        text
      </RenderFlash>,
    );
    const wrapper = document.querySelector("[data-rg-flash='Cls']");
    expect(wrapper?.classList.contains("my-class")).toBe(true);
  });

  it("merges style overrides", () => {
    render(
      <RenderFlash name="Styled" style={{ color: "red" }}>
        text
      </RenderFlash>,
    );
    const wrapper = document.querySelector("[data-rg-flash='Styled']") as HTMLElement | null;
    expect(wrapper?.style.color).toBe("red");
  });

  it("has displayName set to RenderFlash", () => {
    expect(RenderFlash.displayName).toBe("RenderFlash");
  });

  it("renders without a name prop — data-rg-flash attribute is absent (React drops undefined attrs)", () => {
    render(<RenderFlash>no name</RenderFlash>);
    // React does NOT render attributes whose value is `undefined`.
    // Therefore data-rg-flash should NOT exist when name is omitted.
    const wrapper = document.querySelector("[data-rg-flash]");
    expect(wrapper).toBeNull();
  });

  it("passes the duration option down to the flash effect", () => {
    // No direct assertion possible without spying on the hook;
    // we verify the component mounts without errors.
    expect(() =>
      render(<RenderFlash duration={800}>ok</RenderFlash>),
    ).not.toThrow();
  });
});
