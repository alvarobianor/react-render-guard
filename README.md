# 🛡️ React Render Guard

> **Stop guessing. Start optimizing.**  
> A lightweight, non-intrusive React library to detect and **visually highlight** unnecessary re-renders — right inside your app, just like React DevTools.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-16.8%2B-61DAFB.svg)](https://reactjs.org/)

## 🚀 The Problem

In complex React applications, "wasted renders" are the silent killers of performance.

- Children re-rendering even when props haven't changed.
- Parent components triggering waterfalls of updates.
- Inputs causing heavy lists to recalculate on every keystroke.

Finding these bottlenecks manually with general profiling tools is tedious and hard to reason about visually.

## 💡 The Solution

**RenderGuard** gives you two layers of tooling:

1. **Flash-on-Render** — every component that re-renders briefly flashes a colored border, exactly like React DevTools' "Highlight updates" feature, but living directly in your code.
2. **Profiler Overlay** — a floating panel showing render durations and counts powered by React's internal Profiler API.

### Key Features

- **🎨 Flash-on-Render**: Wrap any component with `<RenderFlash>` or `withRenderFlash()` to visually highlight every re-render.
- **🌈 Color-coded severity**: Green (mount) → Cyan (few renders) → Orange (moderate) → Red (too many renders).
- **🔍 Precision Monitoring**: Uses React's internal Profiler API 100% safely.
- **⚡ Zero Production Overhead**: Designed to be stripped out or disabled in production.
- **🛠️ Flexible API**: Use as a component, HOC, or hook — whatever fits your codebase.
- **📊 Real-time Overlay**: Floating panel showing render duration, count, and health status.

---

## 📦 Installation

```bash
npm install react-render-guard
# or
yarn add react-render-guard
```

> **Note**: Requires `react` and `react-dom` >= 16.8.0 as peer dependencies.

---

## 🛠️ Usage

### 1. Flash-on-Render — `<RenderFlash>` component

Wrap any JSX subtree. The component flashes its border every time it re-renders.

```tsx
import { RenderFlash } from "react-render-guard";

function MyForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <form>
      {/* Only this field flashes when `name` changes */}
      <RenderFlash name="NameField" display="block">
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </RenderFlash>

      {/* Only this field flashes when `email` changes */}
      <RenderFlash name="EmailField" display="block">
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </RenderFlash>
    </form>
  );
}
```

### 2. Flash-on-Render — `withRenderFlash()` HOC

Wrap an existing component at definition time.

```tsx
import { withRenderFlash } from "react-render-guard";

const FlashingCard = withRenderFlash(Card, "Card");
const FlashingListItem = withRenderFlash(ListItem, "ListItem", {
  duration: 600,
});

// Use them like the original components — flash is automatic
<FlashingCard title="Hello" />;
```

### 3. Flash-on-Render — `useFlashOnRender()` hook

Attach the flash effect to any DOM element via a ref.

```tsx
import { useFlashOnRender } from "react-render-guard";

function MyWidget() {
  const { ref, renderCount } = useFlashOnRender("MyWidget");

  return <div ref={ref}>Rendered {renderCount} times</div>;
}
```

### 4. Profiler Overlay — `<RenderGuard>`

Wrap your app (or a subtree) with `<RenderGuard>` to get a floating metrics panel.

```tsx
import { RenderGuard } from "react-render-guard";

const Root = () => (
  <RenderGuard
    threshold={3}
    onRenderCallback={(id, phase, duration) =>
      console.log(`[${id}] ${phase}: ${duration.toFixed(2)}ms`)
    }
  >
    <App />
  </RenderGuard>
);
```

### 5. Console logging — `useRenderCheck()` hook

Log render counts to the console for a specific component.

```tsx
import { useRenderCheck } from "react-render-guard";

const ExpensiveWidget = () => {
  const renderCount = useRenderCheck("ExpensiveWidget");
  return <div>Rendered: {renderCount} times</div>;
};
```

---

## ⚙️ API Reference

### `<RenderFlash />` Props

| Prop        | Type            | Default      | Description                                                            |
| ----------- | --------------- | ------------ | ---------------------------------------------------------------------- |
| `name`      | `string`        | `undefined`  | Identifier shown in `data-rg-flash` attribute for debugging.           |
| `display`   | `string`        | `"contents"` | CSS `display` of the wrapper div. Use `"block"` for block-level items. |
| `duration`  | `number`        | `400`        | Flash animation duration in milliseconds.                              |
| `style`     | `CSSProperties` | `undefined`  | Additional styles for the wrapper div.                                 |
| `className` | `string`        | `undefined`  | CSS class for the wrapper div.                                         |
| `children`  | `ReactNode`     | —            | The content to monitor.                                                |

### `withRenderFlash(Component, displayName?, options?)` HOC

| Argument           | Type            | Description                              |
| ------------------ | --------------- | ---------------------------------------- |
| `Component`        | `ComponentType` | The component to wrap.                   |
| `displayName`      | `string`        | Optional label shown in data attributes. |
| `options.duration` | `number`        | Flash duration in ms. Default: `400`.    |

### `useFlashOnRender(name?, options?)` Hook

Returns `{ ref, renderCount }`. Attach `ref` to any host element.

| Argument           | Type     | Description                           |
| ------------------ | -------- | ------------------------------------- |
| `name`             | `string` | Optional identifier for debugging.    |
| `options.duration` | `number` | Flash duration in ms. Default: `400`. |

### `<RenderGuard />` Props

| Prop               | Type        | Default     | Description                                                          |
| ------------------ | ----------- | ----------- | -------------------------------------------------------------------- |
| `threshold`        | `number`    | `3`         | Waste ratio (child/parent duration) that triggers a console warning. |
| `onRenderCallback` | `function`  | `undefined` | Raw Profiler callback for custom analytics.                          |
| `children`         | `ReactNode` | —           | The React tree to monitor.                                           |

### Flash Color Reference

| Color     | Renders | Meaning                      |
| --------- | ------- | ---------------------------- |
| 🟢 Green  | 1       | First mount                  |
| 🩵 Cyan   | 2–3     | Normal re-renders            |
| 🟠 Orange | 4–8     | Worth investigating          |
| 🔴 Red    | 9+      | Likely a performance problem |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
