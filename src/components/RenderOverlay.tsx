import React, { useEffect, useState } from "react";

interface OverlayProps {
  lastRenderTime: number;
  renderCount: number;
  lastRenderId: string;
}

const styles = {
  container: {
    position: "fixed" as const,
    bottom: "20px",
    right: "20px",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    color: "#fff",
    padding: "12px",
    borderRadius: "8px",
    fontFamily: "monospace",
    fontSize: "12px",
    zIndex: 9999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    minWidth: "200px",
    border: "1px solid #333",
    backdropFilter: "blur(4px)",
    transition: "border-color 0.3s ease",
  },
  metricRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  label: {
    color: "#aaa",
  },
  value: {
    fontWeight: "bold" as const,
  },
  indicator: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    marginRight: "8px",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    fontWeight: "bold" as const,
    borderBottom: "1px solid #444",
    paddingBottom: "4px",
    display: "flex",
    alignItems: "center",
  },
};

const getStatusColor = (duration: number) => {
  if (duration < 16) return "#4caf50"; // Green (60fps friendly)
  if (duration < 50) return "#ff9800"; // Orange
  return "#f44336"; // Red
};

export const RenderOverlay: React.FC<OverlayProps> = ({
  lastRenderTime,
  renderCount,
  lastRenderId,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (renderCount > 0) {
      setIsVisible(true);
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 300);
      return () => clearTimeout(timer);
    }
  }, [renderCount, lastRenderTime]);

  if (!isVisible) return null;

  const statusColor = getStatusColor(lastRenderTime);

  return (
    <div
      style={{
        ...styles.container,
        borderColor: flash ? statusColor : "#333",
      }}
    >
      <h4 style={styles.title}>
        <span
          style={{ ...styles.indicator, backgroundColor: statusColor }}
        ></span>
        RenderGuard
      </h4>

      <div style={styles.metricRow}>
        <span style={styles.label}>Last Render:</span>
        <span style={{ ...styles.value, color: statusColor }}>
          {lastRenderTime.toFixed(2)}ms
        </span>
      </div>

      <div style={styles.metricRow}>
        <span style={styles.label}>Total Renders:</span>
        <span style={styles.value}>{renderCount}</span>
      </div>

      <div style={styles.metricRow}>
        <span style={styles.label}>Source:</span>
        <span
          style={{
            ...styles.value,
            maxWidth: "100px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {lastRenderId}
        </span>
      </div>
    </div>
  );
};
