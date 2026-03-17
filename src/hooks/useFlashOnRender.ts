import { useRef, useEffect } from "react";
import { isTracked } from "../config";

// Inject keyframes once into the document head (no-op if already present)
function injectFlashKeyframes() {
  if (typeof document === "undefined") return;
  const id = "__rg_flash_style__";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    @keyframes __rg_flash__ {
      0%   { box-shadow: inset 0 0 0 2px var(--rg-flash-color, #61dafb); }
      60%  { box-shadow: inset 0 0 0 2px var(--rg-flash-color, #61dafb); }
      100% { box-shadow: inset 0 0 0 2px transparent; }
    }
  `;
  document.head.appendChild(style);
}

injectFlashKeyframes();

function getRenderColor(count: number): string {
  if (count === 1) return "#4ade80"; // green — mount
  if (count <= 3) return "#61dafb"; // cyan — few re-renders
  if (count <= 8) return "#fb923c"; // orange — moderate
  return "#f87171"; // red — many re-renders
}

interface FlashOptions {
  /** Duration of the flash animation in ms. Default: 400 */
  duration?: number;
}

/**
 * Attaches a flash-on-render animation to any host element via a ref.
 * Color shifts from green → cyan → orange → red as render count increases.
 *
 * Respects the global `configure({ only: [...] })` allowlist.
 * Becomes a complete no-op in production (`process.env.NODE_ENV === 'production'`).
 *
 * @example
 * const { ref, renderCount } = useFlashOnRender("MyComponent");
 * return <div ref={ref}>...</div>;
 */
export function useFlashOnRender<T extends HTMLElement = HTMLDivElement>(
  name?: string,
  options: FlashOptions = {},
) {
  const { duration = 400 } = options;
  const ref = useRef<T>(null);
  const renderCount = useRef(0);
  renderCount.current += 1;

  const tracked = isTracked(name);

  useEffect(() => {
    if (!tracked) return;
    const el = ref.current;
    if (!el) return;
    const color = getRenderColor(renderCount.current);
    el.style.setProperty("--rg-flash-color", color);
    // Reset animation by forcing a reflow
    el.style.animation = "none";
    void el.offsetHeight;
    el.style.animation = `__rg_flash__ ${duration}ms ease-out forwards`;
  });

  return { ref, renderCount: renderCount.current };
}
