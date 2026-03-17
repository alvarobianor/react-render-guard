import { useState, useCallback, useContext, createContext, useReducer } from "react";
import { RenderFlash, withRenderFlash, useWhyDidYouRender } from "render-guard";
import "./App.css";

// ─────────────────────────────────────────────────────────────────────────────
// Section 1 — Controlled Form
// ─────────────────────────────────────────────────────────────────────────────
function FormSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("frontend");
  const [newsletter, setNewsletter] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="demo-section">
      <h2 className="section-title">
        <span className="section-icon">📝</span> Controlled Form
      </h2>
      <p className="section-desc">
        Each field is wrapped with <code>&lt;RenderFlash&gt;</code>. Typing in
        one field only flashes <em>that</em> field's component — not the others.
      </p>

      <form
        className="demo-form"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <RenderFlash name="NameField" display="block">
          <label className="field-label">Name</label>
          <input
            className="field-input"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </RenderFlash>

        <RenderFlash name="EmailField" display="block">
          <label className="field-label">Email</label>
          <input
            className="field-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </RenderFlash>

        <RenderFlash name="RoleSelect" display="block">
          <label className="field-label">Role</label>
          <select
            className="field-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="fullstack">Fullstack</option>
            <option value="devops">DevOps</option>
          </select>
        </RenderFlash>

        <RenderFlash name="NewsletterCheckbox" display="block">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
            />
            <span>Subscribe to newsletter</span>
          </label>
        </RenderFlash>

        <RenderFlash name="SubmitRow" display="block">
          <button className="btn btn-primary" type="submit">
            Submit
          </button>
          {submitted && <span className="success-badge">✅ Submitted!</span>}
        </RenderFlash>
      </form>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 2 — Counter Cascade
// ─────────────────────────────────────────────────────────────────────────────
const StatDisplay = withRenderFlash(
  ({ label, value }: { label: string; value: number }) => (
    <div className="stat-box">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  ),
  "StatDisplay",
);

function CascadeSection() {
  const [primary, setPrimary] = useState(0);
  const [secondary, setSecondary] = useState(0);

  return (
    <section className="demo-section">
      <h2 className="section-title">
        <span className="section-icon">🔢</span> Counter Cascade
      </h2>
      <p className="section-desc">
        Two independent counters each wrapped via <code>withRenderFlash</code>{" "}
        HOC. Incrementing one counter only flashes <em>its</em> component.
      </p>

      <div className="stat-grid">
        <div className="stat-group">
          <StatDisplay label="Counter A" value={primary} />
          <button className="btn" onClick={() => setPrimary((v) => v + 1)}>
            + Counter A
          </button>
        </div>
        <div className="stat-group">
          <StatDisplay label="Counter B" value={secondary} />
          <button className="btn" onClick={() => setSecondary((v) => v + 1)}>
            + Counter B
          </button>
        </div>
      </div>

      <RenderFlash
        name="CascadeParent"
        display="block"
        style={{ marginTop: "1rem" }}
      >
        <div className="info-box">
          <strong>Parent total:</strong> {primary + secondary}
          <span className="hint">← this re-renders on every button click</span>
        </div>
      </RenderFlash>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 3 — Dynamic List
// ─────────────────────────────────────────────────────────────────────────────
interface Task {
  id: number;
  text: string;
  done: boolean;
}

let nextId = 1;

const TaskItem = withRenderFlash(
  ({
    task,
    onToggle,
    onRemove,
  }: {
    task: Task;
    onToggle: (id: number) => void;
    onRemove: (id: number) => void;
  }) => (
    <li className={`task-item ${task.done ? "task-done" : ""}`}>
      <label className="task-label">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
        />
        <span>{task.text}</span>
      </label>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onRemove(task.id)}
      >
        ✕
      </button>
    </li>
  ),
  "TaskItem",
);

function ListSection() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: nextId++, text: "Build something cool", done: false },
    { id: nextId++, text: "Monitor re-renders", done: false },
  ]);
  const [input, setInput] = useState("");

  const addTask = () => {
    if (!input.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: nextId++, text: input.trim(), done: false },
    ]);
    setInput("");
  };

  const toggleTask = useCallback((id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }, []);

  const removeTask = useCallback((id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <section className="demo-section">
      <h2 className="section-title">
        <span className="section-icon">📋</span> Dynamic List
      </h2>
      <p className="section-desc">
        Each list item is wrapped with <code>withRenderFlash</code>. Toggling
        one task flashes only that <code>TaskItem</code> — not the siblings.
      </p>

      <div className="list-input-row">
        <input
          className="field-input"
          placeholder="New task…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <button className="btn btn-primary" onClick={addTask}>
          Add
        </button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={toggleTask}
            onRemove={removeTask}
          />
        ))}
        {tasks.length === 0 && (
          <li className="task-empty">No tasks yet — add one above!</li>
        )}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 4 — Isolated vs Propagated State
// ─────────────────────────────────────────────────────────────────────────────
const IsolatedCounter = () => {
  const [count, setCount] = useState(0);
  return (
    <RenderFlash name="IsolatedCounter" display="block">
      <div className="isolated-box">
        <span className="isolated-label">Isolated</span>
        <span className="isolated-val">{count}</span>
        <button className="btn btn-sm" onClick={() => setCount((v) => v + 1)}>
          +
        </button>
      </div>
    </RenderFlash>
  );
};

const DisplayBox = ({ value, label }: { value: number; label: string }) => (
  <RenderFlash name={`Display-${label}`} display="block">
    <div className="isolated-box">
      <span className="isolated-label">{label}</span>
      <span className="isolated-val">{value}</span>
    </div>
  </RenderFlash>
);

function IsolatedSection() {
  const [lifted, setLifted] = useState(0);

  return (
    <section className="demo-section">
      <h2 className="section-title">
        <span className="section-icon">⚡</span> Isolated vs Propagated State
      </h2>
      <p className="section-desc">
        Left column: state lives <strong>inside</strong> each component — only
        it flashes. Right column: state is <strong>lifted</strong> to the parent
        — all children flash on every update.
      </p>

      <div className="compare-grid">
        <div className="compare-col">
          <h3 className="col-title col-green">✅ Isolated State</h3>
          <IsolatedCounter />
          <IsolatedCounter />
          <IsolatedCounter />
        </div>

        <div className="compare-col">
          <h3 className="col-title col-red">⚠️ Propagated State</h3>
          <DisplayBox value={lifted} label="Child A" />
          <DisplayBox value={lifted} label="Child B" />
          <DisplayBox value={lifted} label="Child C" />
          <button
            className="btn btn-outline"
            onClick={() => setLifted((v) => v + 1)}
          >
            Increment all (parent state)
          </button>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 5 — Props Diff (useWhyDidYouRender)
// ─────────────────────────────────────────────────────────────────────────────

interface UserCardProps {
  name: string;
  score: number;
  tag: { label: string }; // object — new ref every render unless memoised
}

/**
 * Component that uses useWhyDidYouRender to track which props changed.
 * Open the browser console and interact with the controls below to see the diff.
 */
const PropsDiffDemo = (props: UserCardProps) => {
  useWhyDidYouRender("PropsDiffDemo", props as unknown as Record<string, unknown>);

  return (
    <RenderFlash name="PropsDiffDemo" display="block">
      <div className="info-box" style={{ fontFamily: "monospace" }}>
        <div><strong>name:</strong> {props.name}</div>
        <div><strong>score:</strong> {props.score}</div>
        <div><strong>tag.label:</strong> {props.tag.label}</div>
      </div>
    </RenderFlash>
  );
};

function PropsDiffSection() {
  const [score, setScore] = useState(0);
  const [name, setName] = useState("Alice");
  // stableTag keeps the same object reference; won't trigger a prop-change log
  const [stableTag] = useState({ label: "pro" });
  const [unstableToggle, setUnstableToggle] = useState(false);

  // Simulate unstable prop: new object reference each render
  const unstableTag = { label: "pro" };

  return (
    <section className="demo-section">
      <h2 className="section-title">
        <span className="section-icon">🔍</span> Props Diff
      </h2>
      <p className="section-desc">
        <code>useWhyDidYouRender</code> logs which props changed between renders.{" "}
        Check the <strong>browser console</strong> — you'll see a diff table for every re-render.
        <br />
        <em>Tip: toggle "Unstable tag" to see object identity mismatches.</em>
      </p>

      <div className="stat-grid" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
        <button className="btn" onClick={() => setScore((v) => v + 1)}>
          + Score (changes <code>score</code> prop)
        </button>
        <button
          className="btn btn-outline"
          onClick={() => setName((n) => (n === "Alice" ? "Bob" : "Alice"))}
        >
          Toggle Name (changes <code>name</code> prop)
        </button>
        <button
          className="btn btn-outline"
          onClick={() => setUnstableToggle((v) => !v)}
          title="Forces a parent render to produce a new tag object reference"
        >
          Unstable tag re-render {unstableToggle ? "🔴" : "🟢"}
        </button>
      </div>

      <PropsDiffDemo
        name={name}
        score={score}
        tag={unstableToggle ? unstableTag : stableTag}
      />

      <p className="section-desc" style={{ marginTop: "0.5rem", opacity: 0.7 }}>
        📦 Stable tag: same object reference — no prop change logged for <code>tag</code>.<br />
        🔴 Unstable tag: new <code>{`{ label: "pro" }`}</code> every render — triggers a
        change even though the <em>value</em> looks identical.
      </p>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 6 — Hooks Tracker (useWhyDidYouRender)
// ─────────────────────────────────────────────────────────────────────────────

const ThemeCtx = createContext<{ theme: "light" | "dark" }>({ theme: "light" });

type CountAction = { type: "inc" } | { type: "dec" } | { type: "reset" };
function countReducer(state: number, action: CountAction): number {
  if (action.type === "inc") return state + 1;
  if (action.type === "dec") return state - 1;
  return 0;
}

const HooksTrackerDemo = (_props: Record<string, never>) => {
  const { theme } = useContext(ThemeCtx);
  const [localCount, setLocalCount] = useState(0);
  const [reducerCount, dispatch] = useReducer(countReducer, 0);

  // Pass labelled hook values so useWhyDidYouRender can diff them
  useWhyDidYouRender("HooksTrackerDemo", _props, {
    "useContext(ThemeCtx) › theme": theme,
    "useState › localCount": localCount,
    "useReducer › reducerCount": reducerCount,
  });

  return (
    <RenderFlash name="HooksTrackerDemo" display="block">
      <div className="info-box" style={{ fontFamily: "monospace" }}>
        <div><strong>theme:</strong> {theme}</div>
        <div><strong>localCount:</strong> {localCount}</div>
        <div><strong>reducerCount:</strong> {reducerCount}</div>
      </div>
      <div className="stat-grid" style={{ marginTop: "0.75rem", gap: "0.5rem" }}>
        <button className="btn btn-sm" onClick={() => setLocalCount((v) => v + 1)}>
          + useState
        </button>
        <button className="btn btn-sm btn-outline" onClick={() => dispatch({ type: "inc" })}>
          + useReducer
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => dispatch({ type: "reset" })}>
          Reset reducer
        </button>
      </div>
    </RenderFlash>
  );
};

function HooksTrackerSection() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ThemeCtx value={{ theme: darkMode ? "dark" : "light" }}>
      <section className="demo-section">
        <h2 className="section-title">
          <span className="section-icon">🪝</span> Hooks Tracker
        </h2>
        <p className="section-desc">
          Pass a <code>hooks</code> record to <code>useWhyDidYouRender</code> to diff
          each named hook value between renders. Check the{" "}
          <strong>browser console</strong> for grouped output.
        </p>

        <div style={{ marginBottom: "1rem" }}>
          <button className="btn btn-outline" onClick={() => setDarkMode((v) => !v)}>
            Toggle theme context ({darkMode ? "dark" : "light"}) — changes{" "}
            <code>useContext</code>
          </button>
        </div>

        <HooksTrackerDemo />
      </section>
    </ThemeCtx>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-badge">DEV</div>
        <h1 className="app-title">RenderGuard Playground</h1>
        <p className="app-subtitle">
          Watch components flash • diff props • track hooks — all in one lib.
          Open the <strong>browser console</strong> to see the rich diff logs.
        </p>
        <div className="legend">
          <span className="legend-item">
            <span className="dot dot-green" /> Mount
          </span>
          <span className="legend-item">
            <span className="dot dot-cyan" /> Few re-renders
          </span>
          <span className="legend-item">
            <span className="dot dot-orange" /> Moderate
          </span>
          <span className="legend-item">
            <span className="dot dot-red" /> Many re-renders
          </span>
        </div>
      </header>

      <main className="app-main">
        <FormSection />
        <CascadeSection />
        <ListSection />
        <IsolatedSection />
        <PropsDiffSection />
        <HooksTrackerSection />
      </main>
    </div>
  );
}

export default App;
