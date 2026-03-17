/**
 * RenderGuard global configuration singleton.
 *
 * Call `configure()` once in your app entry-point (main.tsx / index.tsx).
 * Individual components can override config via their own props.
 *
 * @example
 * import { configure } from 'react-render-guard';
 *
 * configure({
 *   only: ['UserCard', 'Header'],   // only track these components
 *   enabled: true,                  // default: true in dev, false in prod
 * });
 */

export interface RenderGuardConfig {
  /**
   * Allowlist of component names to track.
   * When set, only components whose name is in this list will flash / log.
   * When omitted (default), all components are tracked.
   */
  only?: string[];

  /**
   * Global on/off switch.
   * Defaults to `true` in development and `false` in production.
   * Set explicitly to `true` to enable in staging.
   */
  enabled?: boolean;
}

const defaultConfig: Required<RenderGuardConfig> = {
  only: [],
  enabled: process.env.NODE_ENV !== "production",
};

let _config: Required<RenderGuardConfig> = { ...defaultConfig };

/**
 * Set global RenderGuard configuration.
 * Merges with current config — partial updates are supported.
 */
export function configure(options: RenderGuardConfig): void {
  _config = { ..._config, ...options };
}

/**
 * Read the current global config. Internal use only.
 * @internal
 */
export function getConfig(): Readonly<Required<RenderGuardConfig>> {
  return _config;
}

/**
 * Returns true if the given component name should be tracked,
 * based on the global `only` filter and `enabled` flag.
 * @internal
 */
export function isTracked(name: string | undefined): boolean {
  if (!_config.enabled) return false;
  if (_config.only.length === 0) return true;
  return name !== undefined && _config.only.includes(name);
}

/**
 * Reset config to defaults. Useful in tests.
 * @internal
 */
export function resetConfig(): void {
  _config = { ...defaultConfig };
}
