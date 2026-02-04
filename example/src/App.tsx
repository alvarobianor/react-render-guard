import { useState } from "react";
import { RenderGuard } from "render-guard";
import "./App.css";

const ChildComponent = ({ count }: { count: number }) => {
  return (
    <div
      style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}
    >
      Child Component Content: {count}
    </div>
  );
};

function App() {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState(0);

  return (
    <RenderGuard
      onRenderCallback={(id, phase, actualDuration) =>
        console.log(`[${id}] ${phase} duration: ${actualDuration}`)
      }
    >
      <div className="card">
        <h1>RenderGuard Playground</h1>
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => setCount((count) => count + 1)}>
            Increment Child (Trigger Re-render)
          </button>
          <button
            onClick={() => setOtherState((val) => val + 1)}
            style={{ marginLeft: "10px" }}
          >
            Update Parent Only (Unrelated State)
          </button>
        </div>

        <p>Parent State: {otherState}</p>

        <ChildComponent count={count} />

        <p className="read-the-docs">Check the console for RenderGuard logs.</p>
      </div>
    </RenderGuard>
  );
}

export default App;
