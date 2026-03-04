import { useState, useCallback } from "react";
import { RenderFlash, withRenderFlash } from "render-guard";
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
// Root
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-badge">DEV</div>
        <h1 className="app-title">RenderGuard Playground</h1>
        <p className="app-subtitle">
          Watch components flash as they re-render — just like React DevTools,
          but baked into your app.
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
      </main>
    </div>
  );
}

export default App;
