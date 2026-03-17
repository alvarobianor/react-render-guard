import { useRef, useEffect } from "react";
import { isTracked } from "../config";

/**
 * Logs a message to the console every time the calling component renders.
 * Respects the global `configure({ only: [...] })` allowlist.
 * No-op in production.
 *
 * @returns Current render count (1-based)
 */
export const useRenderCheck = (componentName: string) => {
  const renders = useRef(0);

  useEffect(() => {
    if (!isTracked(componentName)) return;
    renders.current += 1;
    console.log(
      `[RenderGuard] ${componentName} rendered ${renders.current} times`,
    );
  });

  return renders.current;
};
