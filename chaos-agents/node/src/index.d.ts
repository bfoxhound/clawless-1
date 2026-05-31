export declare const VERSION: string;

export declare class ChaosError extends Error {
  constructor(message?: string);
}

export interface ChaosMonkeyOptions {
  /** Probability [0,1] of injecting an artificial delay. */
  latency?: number;
  /** Probability [0,1] of throwing ChaosError instead of running. */
  errors?: number;
  /** Probability [0,1] of scrambling a string return value. */
  corruption?: number;
  /** Probability [0,1] of truncating a string return value. */
  truncation?: number;
  /** Probability [0,1] of blanking the return value. */
  empty?: number;
  /** Seed for reproducible chaos. */
  seed?: number;
  /** Master switch; when false, calls pass through untouched. Default true. */
  enabled?: boolean;
  /** Delay bounds in milliseconds for the latency fault. Default [100, 2000]. */
  latencyRange?: [number, number];
}

export type FaultName =
  | "latency"
  | "errors"
  | "corruption"
  | "truncation"
  | "empty";

export declare class ChaosMonkey {
  probabilities: Record<FaultName, number>;
  enabled: boolean;
  latencyRange: [number, number];
  log: FaultName[];

  constructor(opts?: ChaosMonkeyOptions);

  /** Invoke `fn` once, applying any faults that trigger this call. */
  run<T>(fn: (...args: any[]) => T | Promise<T>, ...args: any[]): Promise<T>;

  /** Wrap a function so every call may have faults injected. */
  wrap<F extends (...args: any[]) => any>(
    fn: F
  ): (...args: Parameters<F>) => Promise<Awaited<ReturnType<F>>>;

  /** Count how many times each fault has fired so far. */
  report(): Record<FaultName, number>;
}

declare const _default: {
  ChaosMonkey: typeof ChaosMonkey;
  ChaosError: typeof ChaosError;
  VERSION: string;
};
export default _default;
