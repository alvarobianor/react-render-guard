# 🛡️ React Render Guard

> Visualize React re-renders in real time — just like React DevTools, but living directly in your code.

[![npm](https://img.shields.io/npm/v/react-render-guard.svg)](https://www.npmjs.com/package/react-render-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-16.8%2B-61DAFB.svg)](https://reactjs.org/)

## What it does

Every time a component re-renders, its border briefly flashes with a color that reflects how often it has rendered. No DevTools panel needed — the feedback is right on screen.

| Color | Renders | What it means |
| --- | --- | --- |
| 🟢 Green | 1 | First mount |
| 🩵 Cyan | 2–3 | Normal |
| 🟠 Orange | 4–8 | Worth a look |
| 🔴 Red | 9+ | Probably a problem |

---

## 🚨 The Problem

React re-renders components more often than you think — and most of the time, silently.

You change one input field and an entire list re-renders. You lift state up and suddenly five unrelated components update on every keystroke. You add a new prop and something three levels deep starts lagging.

The tricky part: **these renders are invisible by default.** You only notice them when the app starts feeling slow — and by then, tracking down the cause with generic DevTools is a painful, trial-and-error process.

RenderGuard makes wasted renders **visible**, **immediate**, and **component-level precise** — so you catch them the moment they happen, not after the fact.

---

## Installation

```bash
npm install react-render-guard
# or
yarn add react-render-guard
```

---

## Quick Start

Pick whichever API fits your use case:

### `<RenderFlash>` — wrap any JSX

The simplest option. Drop it around anything you want to watch.

```tsx
import { RenderFlash } from "react-render-guard";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Click me</button>

      {/* This will flash every time count changes */}
      <RenderFlash name="Counter" display="block">
        <p>Count: {count}</p>
      </RenderFlash>
    </div>
  );
}
```

---

### `withRenderFlash()` — wrap a whole component

Great for adding flash to existing components without touching their internals.

```tsx
import { withRenderFlash } from "react-render-guard";

// Wrap once...
const UserCard = withRenderFlash(UserCardBase, "UserCard");

// ...use normally. Flash is automatic.
<UserCard name="Alice" />
```

---

### `useFlashOnRender()` — hook

Use this when you need full control — attach the flash to any element via a `ref`.

```tsx
import { useFlashOnRender } from "react-render-guard";

function UserCard({ name }: { name: string }) {
  const { ref, renderCount } = useFlashOnRender("UserCard");

  return (
    <div ref={ref}>
      <p>{name}</p>
      <small>rendered {renderCount}x</small>
    </div>
  );
}
```

---

### `<RenderGuard>` — floating metrics panel

Wraps your app with a floating overlay that shows render times and counts using React's Profiler API.

```tsx
import { RenderGuard } from "react-render-guard";

// In your entry point (main.tsx or index.tsx)
<RenderGuard>
  <App />
</RenderGuard>
```

---

### `useRenderCheck()` — console logging

Logs render counts to the console. Quick and simple.

```tsx
import { useRenderCheck } from "react-render-guard";

function HeavyList() {
  useRenderCheck("HeavyList"); // logs every render
  return <ul>...</ul>;
}
```

---

## API Reference

### `<RenderFlash />`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | — | Label for debugging (shown in `data-rg-flash` attribute). |
| `display` | `string` | `"contents"` | CSS display of the wrapper. Use `"block"` for block-level content. |
| `duration` | `number` | `400` | Flash duration in ms. |
| `style` | `CSSProperties` | — | Extra styles for the wrapper. |
| `className` | `string` | — | CSS class for the wrapper. |

### `withRenderFlash(Component, name?, options?)`

| Argument | Type | Description |
| --- | --- | --- |
| `Component` | `ComponentType` | The component to wrap. |
| `name` | `string` | Optional debug label. |
| `options.duration` | `number` | Flash duration in ms. Default `400`. |

### `useFlashOnRender(name?, options?)`

Returns `{ ref, renderCount }`. Attach `ref` to any host element.

| Argument | Type | Description |
| --- | --- | --- |
| `name` | `string` | Optional debug label. |
| `options.duration` | `number` | Flash duration in ms. Default `400`. |

### `<RenderGuard />`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `threshold` | `number` | `3` | Warn in console when child/parent render ratio exceeds this. |
| `onRenderCallback` | `ProfilerOnRenderCallback` | — | Raw callback with Profiler data for custom analytics. |

---

## License

MIT — see [`LICENSE`](./LICENSE) for details.
