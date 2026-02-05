import React, { Profiler, PropsWithChildren, useCallback } from "react";

// Threshold for "Waste Ratio" (Child Render Time / Parent Render Time) - illustrative
const DEFAULT_WASTE_THRESHOLD = 3;

interface RenderGuardProps {
  onRenderCallback?: React.ProfilerOnRenderCallback;
  threshold?: number;
}

import { createPortal } from "react-dom";
import { RenderOverlay } from "./RenderOverlay";

// Internal wrapper to prevent infinite loops.
// When RenderGuard state updates (to show the overlay), we don't want the Profiler to re-run.
// React.memo ensures this component only re-renders if 'children' or 'onRender' changes,
// ignoring the parent's (RenderGuard) state changes.
const ProfilerWrapper = React.memo(
  ({
    children,
    onRender,
  }: {
    children: React.ReactNode;
    onRender: React.ProfilerOnRenderCallback;
  }) => {
    return (
      <Profiler id="RenderGuardRoot" onRender={onRender}>
        {children}
      </Profiler>
    );
  },
);

export const RenderGuard: React.FC<PropsWithChildren<RenderGuardProps>> = ({
  children,
  onRenderCallback,
  threshold = DEFAULT_WASTE_THRESHOLD,
}) => {
  const [metrics, setMetrics] = React.useState({
    lastRenderTime: 0,
    renderCount: 0,
    lastRenderId: "",
  });

  const handleRender = useCallback<React.ProfilerOnRenderCallback>(
    (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
      // Use functional update to avoid dependency on 'metrics' state
      setMetrics((prev) => ({
        lastRenderTime: actualDuration,
        renderCount: prev.renderCount + 1,
        lastRenderId: id,
      }));

      // Basic logging
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
    <>
      <ProfilerWrapper onRender={handleRender}>{children}</ProfilerWrapper>
      {typeof document !== "undefined" &&
        createPortal(
          <RenderOverlay
            lastRenderTime={metrics.lastRenderTime}
            renderCount={metrics.renderCount}
            lastRenderId={metrics.lastRenderId}
          />,
          document.body,
        )}
    </>
  );
};
