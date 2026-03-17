import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { configure } from 'render-guard'
import './index.css'
import App from './App.tsx'

// ─── RenderGuard global config ────────────────────────────────────────────────
// Remove the `only` key (or pass an empty array) to track ALL components.
// Add component names to `only` to restrict tracking to a subset:
//
//   configure({ only: ['UserCard', 'TaskItem'] });
//
configure({
  // only: ['PropsDiffDemo', 'HooksTrackerDemo'],  // ← uncomment to filter
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
