import React, { PropsWithChildren } from "react";
import { useFlashOnRender } from "../hooks/useFlashOnRender";

interface RenderFlashProps {
  /** Identifier shown in data attributes and used for the global filter */
  name?: string;
  /** CSS display of the wrapper div. Default: "contents" (layout-transparent) */
  display?: React.CSSProperties["display"];
  /** Additional style overrides for the wrapper */
  style?: React.CSSProperties;
  /** Flash animation duration in ms. Default: 400 */
  duration?: number;
  className?: string;
}

/**
 * Declarative wrapper component that flashes its border on every re-render,
 * similar to React DevTools. Drop it around any JSX to visualize renders.
 *
 * Respects `configure({ only: [...] })` — only flashes if `name` is in the
 * allowlist (or when no filter is set). No-op in production.
 *
 * @example
 * <RenderFlash name="FormRow">
 *   <input value={value} onChange={...} />
 * </RenderFlash>
 */
export const RenderFlash: React.FC<PropsWithChildren<RenderFlashProps>> = ({
  children,
  name,
  display = "contents",
  style,
  duration,
  className,
}) => {
  const { ref, renderCount } = useFlashOnRender<HTMLDivElement>(name, {
    duration,
  });

  return (
    <div
      ref={ref}
      data-rg-flash={name}
      data-rg-renders={renderCount}
      className={className}
      style={{ display, ...style }}
    >
      {children}
    </div>
  );
};

RenderFlash.displayName = "RenderFlash";
