# 🛡️ RenderGuard

> **Stop guessing. Start optimizing.**  
> A lightweight, non-intrusive React library to detect, visualize, and eliminate unnecessary re-renders in your application.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB.svg)](https://reactjs.org/)

## 🚀 The Problem

In complex React applications, "wasted renders" are the silent killers of performance.

- Children re-rendering even when props haven't changed.
- Parent components triggering waterfalls of updates.
- Inputs causing heavy lists to recalculate on every keystroke.

Finding these bottlenecks manually with general profiling tools is tedious and difficult to visualize in real-time.

## 💡 The Solution

**RenderGuard** wraps your application (or specific parts of it) and silently monitors the React Render Tree. It calculates the **"Waste Ratio"** (how much time a child took relative to its parent) and alerts you when efficiency drops below your defined threshold.

### Key Features

- **🔍 Precision Monitoring**: Uses React's internal Profiler API 100% safely.
- **⚡ Zero Production Overhead**: Designed to be stripped out or disabled in production.
- **🛠️ Developer Experience**: Simple `Provider` API.
- **📊 Real-time Insights**: Console alerts for expensive renders (Visual Overlay coming soon!).

## 📦 Installation

```bash
npm install render-render-guard
# or
yarn add render-render-guard
```

> **Note**: This library requires `react` and `react-dom` >= 16.8.0 as peer dependencies.

## 🛠️ Usage

### 1. Wrap your App

Simply wrap your root component (or any subtree) with `<RenderGuard>`.

```tsx
import React from "react";
import { RenderGuard } from "render-render-guard";
import App from "./App";

const Root = () => (
  // Alerts when a child takes > 3x longer than expected or hits specific triggers
  <RenderGuard threshold={3}>
    <App />
  </RenderGuard>
);
```

### 2. Manual Hook Monitoring

For fine-grained control over specific components, use the `useRenderCheck` hook.

```tsx
import { useRenderCheck } from "render-render-guard";

const ExpensiveWidget = () => {
  const renderCount = useRenderCheck("ExpensiveWidget");

  return <div>Rendered: {renderCount} times</div>;
};
```

## ⚙️ Configuration API

### `<RenderGuard />` Props

| Prop               | Type        | Default     | Description                                                |
| ------------------ | ----------- | ----------- | ---------------------------------------------------------- |
| `threshold`        | `number`    | `3`         | The ratio (Child/Parent duration) that triggers a warning. |
| `onRenderCallback` | `function`  | `undefined` | Custom callback to receive raw Profiler data.              |
| `children`         | `ReactNode` | -           | The React components to monitor.                           |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
