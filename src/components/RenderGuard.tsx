import React, { Profiler, PropsWithChildren, useCallback } from "react";

// Threshold for "Waste Ratio" (Child Render Time / Parent Render Time) - illustrative
const DEFAULT_WASTE_THRESHOLD = 3;

interface RenderGuardProps {
  onRenderCallback?: React.ProfilerOnRenderCallback;
  threshold?: number;
}

export const RenderGuard: React.FC<PropsWithChildren<RenderGuardProps>> = ({
  children,
  onRenderCallback,
  threshold = DEFAULT_WASTE_THRESHOLD,
}) => {
  const handleRender = useCallback<React.ProfilerOnRenderCallback>(
    (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
      // Basic logging for now
      if (actualDuration > 5) {
        // Arbitrary threshold for demo
        console.warn(
          `[RenderGuard] Slow render detected in ${id}: ${actualDuration.toFixed(2)}ms`,
        );
      }

      if (onRenderCallback) {
        onRenderCallback(
          id,
          phase,
          actualDuration,
          baseDuration,
          startTime,
          commitTime,
        );
      }
    },
    [onRenderCallback, threshold],
  );

  return (
    <Profiler id="RenderGuardRoot" onRender={handleRender}>
      {children}
    </Profiler>
  );
};
