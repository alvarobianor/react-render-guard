import React from "react";
import { useFlashOnRender } from "../hooks/useFlashOnRender";

interface RenderFlashOptions {
  duration?: number;
}

/**
 * Higher-Order Component that wraps a component with a flash-on-render effect.
 * The component's border flashes every time it re-renders, similar to React DevTools.
 *
 * @param WrappedComponent - The component to wrap
 * @param displayName - Optional name shown in the animation label
 * @param options - Flash options (duration)
 *
 * @example
 * const FlashingCounter = withRenderFlash(Counter, "Counter");
 */
export function withRenderFlash<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  displayName?: string,
  options: RenderFlashOptions = {},
) {
  const name =
    displayName ??
    WrappedComponent.displayName ??
    WrappedComponent.name ??
    "Component";

  const FlashedComponent = (props: P) => {
    const { ref, renderCount } = useFlashOnRender<HTMLDivElement>(
      name,
      options,
    );

    return (
      <div
        ref={ref}
        data-rg-flash={name}
        data-rg-renders={renderCount}
        style={{ display: "contents" }}
      >
        <WrappedComponent {...props} />
      </div>
    );
  };

  FlashedComponent.displayName = `withRenderFlash(${name})`;
  return FlashedComponent;
}
