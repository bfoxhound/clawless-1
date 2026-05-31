/**
 * chaos-agents: Chaos engineering for AI agents.
 *
 * Chaos Monkey, but for AI agents. Inject controlled faults — latency,
 * errors, corrupted/truncated/empty outputs — into your agent or tool
 * functions to test how resilient they really are.
 *
 * @example
 *   import { ChaosMonkey } from "chaos-agents";
 *
 *   const monkey = new ChaosMonkey({ latency: 0.3, errors: 0.1, seed: 42 });
 *   const agent = monkey.wrap(async (prompt) => callLLM(prompt));
 *   await agent("hello"); // may be delayed, may throw, may return garbage
 */

export const VERSION = "0.1.0";

/** Error thrown by the `errors` fault to simulate an agent/tool failure. */
export class ChaosError extends Error {
  constructor(message = "chaos-agents: injected failure") {
    super(message);
    this.name = "ChaosError";
  }
}

/** Small seedable PRNG (mulberry32) so chaos can be made reproducible. */
function makeRng(seed) {
  if (seed === undefined || seed === null) {
    return Math.random;
  }
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Output-mangling faults, applied to the resolved return value. */
const OUTPUT_FAULTS = {
  corruption(rng, value) {
    if (typeof value !== "string" || value.length === 0) return value;
    const chars = value.split("");
    const swaps = Math.max(1, Math.floor(chars.length / 10));
    for (let n = 0; n < swaps; n++) {
      const i = Math.floor(rng() * chars.length);
      const j = Math.floor(rng() * chars.length);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
  },
  truncation(rng, value) {
    if (typeof value !== "string" || value.length === 0) return value;
    return value.slice(0, Math.floor(rng() * (value.length + 1)));
  },
  empty(rng, value) {
    if (typeof value === "string") return "";
    if (Array.isArray(value)) return [];
    if (value && typeof value === "object") return {};
    return null;
  },
};

/**
 * Wrap agent/tool callables and randomly inject faults. Each fault has an
 * independent probability in [0, 1]; on every call the monkey rolls per fault
 * and applies the ones that trigger. The wrapped function is always async.
 */
export class ChaosMonkey {
  /**
   * @param {object} [opts]
   * @param {number} [opts.latency=0]    probability of an artificial delay
   * @param {number} [opts.errors=0]     probability of throwing ChaosError
   * @param {number} [opts.corruption=0] probability of scrambling a string result
   * @param {number} [opts.truncation=0] probability of truncating a string result
   * @param {number} [opts.empty=0]      probability of blanking the result
   * @param {number} [opts.seed]         seed for reproducible chaos
   * @param {boolean}[opts.enabled=true] master switch
   * @param {[number,number]} [opts.latencyRange=[100,2000]] delay bounds in ms
   */
  constructor(opts = {}) {
    this.probabilities = {
      latency: opts.latency ?? 0,
      errors: opts.errors ?? 0,
      corruption: opts.corruption ?? 0,
      truncation: opts.truncation ?? 0,
      empty: opts.empty ?? 0,
    };
    this.enabled = opts.enabled ?? true;
    this.latencyRange = opts.latencyRange ?? [100, 2000];
    this._rng = makeRng(opts.seed);
    this.log = [];
  }

  _fires(name) {
    return this._rng() < (this.probabilities[name] ?? 0);
  }

  /** Invoke `fn` once, applying any faults that trigger this call. */
  async run(fn, ...args) {
    if (!this.enabled) return fn(...args);

    if (this._fires("latency")) {
      this.log.push("latency");
      const [lo, hi] = this.latencyRange;
      await sleep(lo + this._rng() * (hi - lo));
    }

    if (this._fires("errors")) {
      this.log.push("errors");
      throw new ChaosError();
    }

    const result = await fn(...args);

    for (const name of ["corruption", "truncation", "empty"]) {
      if (this._fires(name)) {
        this.log.push(name);
        return OUTPUT_FAULTS[name](this._rng, result);
      }
    }
    return result;
  }

  /** Decorator/wrapper form of {@link run}. Returns an async function. */
  wrap(fn) {
    const self = this;
    const wrapped = function (...args) {
      return self.run(fn, ...args);
    };
    wrapped.__chaos__ = this;
    return wrapped;
  }

  /** Count how many times each fault has fired so far. */
  report() {
    const counts = {};
    for (const name of Object.keys(this.probabilities)) counts[name] = 0;
    for (const name of this.log) counts[name] += 1;
    return counts;
  }
}

export default { ChaosMonkey, ChaosError, VERSION };
