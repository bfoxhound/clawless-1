import assert from "node:assert";
import { ChaosMonkey, ChaosError } from "../src/index.js";

const results = [];

// errors fault
{
  const m = new ChaosMonkey({ errors: 1.0, seed: 1 });
  const agent = m.wrap(async (p) => "ans:" + p);
  let threw = false;
  try {
    await agent("hi");
  } catch (e) {
    threw = e instanceof ChaosError;
  }
  assert.ok(threw, "errors fault should throw ChaosError");
  results.push("OK errors");
}

// corruption fault
{
  const m = new ChaosMonkey({ corruption: 1.0, seed: 3 });
  const out = await m.run(() => "the quick brown fox");
  assert.strictEqual(typeof out, "string");
  assert.strictEqual(out.length, "the quick brown fox".length);
  results.push("OK corruption: " + JSON.stringify(out));
}

// truncation fault
{
  const m = new ChaosMonkey({ truncation: 1.0, seed: 5 });
  const original = "hello world long string";
  const out = await m.run(() => original);
  assert.ok(out.length <= original.length);
  results.push("OK truncation: " + JSON.stringify(out));
}

// empty fault
{
  const m = new ChaosMonkey({ empty: 1.0, seed: 2 });
  assert.strictEqual(await m.run(() => "gone"), "");
  results.push("OK empty");
}

// disabled passthrough
{
  const m = new ChaosMonkey({ enabled: false, errors: 1.0 });
  assert.strictEqual(await m.run(() => "untouched"), "untouched");
  results.push("OK passthrough");
}

console.log(results.join("\n"));
console.log("ALL TESTS PASSED");
