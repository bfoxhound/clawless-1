# chaos-agents

**Chaos Monkey, but for AI agents.**

`chaos-agents` injects controlled faults — latency, errors, corrupted /
truncated / empty outputs — into your agent and tool functions, so you can find
out how your system behaves *before* the real world does it for you.

> ⚠️ Early alpha (v0.1.0). The API is small on purpose and will grow.

## Install

```bash
pip install chaos-agents
```

## Usage

```python
from chaos_agents import ChaosMonkey

# Roll the dice on every call.
monkey = ChaosMonkey(
    latency=0.3,      # 30% chance of an artificial delay
    errors=0.1,       # 10% chance of raising ChaosError
    corruption=0.1,   # 10% chance of scrambling the string output
    truncation=0.05,  # 5%  chance of truncating the output
    seed=42,          # reproducible chaos
)

@monkey.wrap
def my_agent(prompt: str) -> str:
    return call_llm(prompt)

my_agent("summarize this document")
print(monkey.report())   # {'latency': 1, 'errors': 0, ...}
```

You can also wrap inline:

```python
result = monkey.run(call_llm, prompt)
```

Disable chaos in production without touching call sites:

```python
monkey = ChaosMonkey(errors=0.1, enabled=False)
```

## Built-in faults

| Fault        | What it simulates                                  |
| ------------ | -------------------------------------------------- |
| `latency`    | slow / hanging agents and tools                    |
| `errors`     | crashes and tool failures (raises `ChaosError`)    |
| `corruption` | hallucinated / garbled responses                   |
| `truncation` | token-limit cutoffs and interrupted streams        |
| `empty`      | silent / dropped responses                         |

## License

MIT
