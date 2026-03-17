import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { withRenderFlash } from "./withRenderFlash";

// ---------------------------------------------------------------------------
// Fixture components
// ---------------------------------------------------------------------------

const SimpleButton: React.FC<{ label: string }> = ({ label }) => (
  <button>{label}</button>
);
SimpleButton.displayName = "SimpleButton";

const NoDisplayName = ({ text }: { text: string }) => <p>{text}</p>;
NoDisplayName.displayName = undefined as unknown as string;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("withRenderFlash HOC", () => {
  it("renders the wrapped component with its props", () => {
    const FlashingButton = withRenderFlash(SimpleButton, "SimpleButton");
    render(<FlashingButton label="Click me" />);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("sets displayName to withRenderFlash(<name>)", () => {
    const FlashingButton = withRenderFlash(SimpleButton, "SimpleButton");
    expect(FlashingButton.displayName).toBe("withRenderFlash(SimpleButton)");
  });

  it("falls back to WrappedComponent.displayName when no displayName arg is given", () => {
    const Wrapped = withRenderFlash(SimpleButton);
    expect(Wrapped.displayName).toBe("withRenderFlash(SimpleButton)");
  });

  it("falls back to WrappedComponent.name when displayName is absent", () => {
    const Anon: React.FC<{ x: string }> = ({ x }) => <span>{x}</span>;
    // Anon.name === 'Anon' (function name), no displayName
    const Wrapped = withRenderFlash(Anon);
    expect(Wrapped.displayName).toBe(`withRenderFlash(Anon)`);
  });

  it("produces withRenderFlash() when WrappedComponent has no name (empty string)", () => {
    // The HOC resolves name via nullish coalescing (??), which only activates
    // for null/undefined — NOT for an empty string "".
    // When the function.name is "", the resolved name is "", so the
    // displayName becomes "withRenderFlash()" instead of "withRenderFlash(Component)".
    const Anonymous = (() => {
      const comp: React.FC<object> = () => <div />;
      comp.displayName = undefined as unknown as string;
      Object.defineProperty(comp, "name", { value: "", configurable: true });
      return comp;
    })();

    const Wrapped = withRenderFlash(Anonymous);
    // The real behaviour: empty string is not nullish, so fallback "Component" is NOT used
    expect(Wrapped.displayName).toBe("withRenderFlash()");
  });

  it("attaches data-rg-flash attribute with the resolved name", () => {
    const FlashingButton = withRenderFlash(SimpleButton, "Btn");
    render(<FlashingButton label="hi" />);
    const wrapper = document.querySelector("[data-rg-flash='Btn']");
    expect(wrapper).not.toBeNull();
  });

  it("attaches data-rg-renders attribute", () => {
    const FlashingButton = withRenderFlash(SimpleButton, "Btn2");
    render(<FlashingButton label="hello" />);
    const wrapper = document.querySelector("[data-rg-renders]");
    expect(wrapper).not.toBeNull();
    expect(Number(wrapper?.getAttribute("data-rg-renders"))).toBeGreaterThanOrEqual(1);
  });

  it("uses display:contents on the wrapper div", () => {
    const FlashingButton = withRenderFlash(SimpleButton, "Btn3");
    render(<FlashingButton label="test" />);
    const wrapper = document.querySelector("[data-rg-flash='Btn3']") as HTMLElement | null;
    expect(wrapper?.style.display).toBe("contents");
  });

  it("accepts a custom duration option without crashing", () => {
    const FlashingButton = withRenderFlash(SimpleButton, "BtnDur", { duration: 600 });
    expect(() => render(<FlashingButton label="ok" />)).not.toThrow();
  });

  it("passes all props through to the wrapped component", () => {
    const Multi: React.FC<{ a: string; b: string }> = ({ a, b }) => (
      <div>
        <span data-testid="a">{a}</span>
        <span data-testid="b">{b}</span>
      </div>
    );
    const FlashingMulti = withRenderFlash(Multi, "Multi");
    render(<FlashingMulti a="alpha" b="beta" />);
    expect(screen.getByTestId("a")).toHaveTextContent("alpha");
    expect(screen.getByTestId("b")).toHaveTextContent("beta");
  });
});
