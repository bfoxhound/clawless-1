"""Built-in fault injectors for chaos-agents.

A fault is a small transformation applied around an agent call. Each fault
knows how to mangle either the *timing*, the *execution*, or the *output* of
a wrapped function. Faults are intentionally tiny and composable so the set
can grow as the library matures.
"""

from __future__ import annotations

import random
import time
from dataclasses import dataclass
from typing import Any, Callable


class ChaosError(RuntimeError):
    """Raised by the `error` fault to simulate an agent/tool failure."""


@dataclass
class Fault:
    """A single named chaos behaviour.

    Attributes:
        name: stable identifier, e.g. ``"latency"``.
        kind: one of ``"timing"``, ``"execution"`` or ``"output"``.
        apply: callable implementing the fault. Signature depends on ``kind``.
    """

    name: str
    kind: str
    apply: Callable[..., Any]


def _latency(rng: random.Random, min_s: float = 0.1, max_s: float = 2.0) -> None:
    """Block for a random duration to simulate a slow/hanging agent."""
    time.sleep(rng.uniform(min_s, max_s))


def _error(rng: random.Random) -> None:
    """Raise to simulate an agent or tool crashing mid-call."""
    raise ChaosError("chaos-agents: injected failure")


def _corrupt(rng: random.Random, value: Any) -> Any:
    """Scramble a string output to simulate hallucinated/garbled responses."""
    if not isinstance(value, str) or not value:
        return value
    chars = list(value)
    swaps = max(1, len(chars) // 10)
    for _ in range(swaps):
        i, j = rng.randrange(len(chars)), rng.randrange(len(chars))
        chars[i], chars[j] = chars[j], chars[i]
    return "".join(chars)


def _truncate(rng: random.Random, value: Any) -> Any:
    """Cut an output short to simulate token-limit / stream interruption."""
    if not isinstance(value, str) or not value:
        return value
    cut = rng.randint(0, len(value))
    return value[:cut]


def _empty(rng: random.Random, value: Any) -> Any:
    """Return an empty response to simulate a silent / dropped answer."""
    if isinstance(value, str):
        return ""
    if isinstance(value, (list, tuple)):
        return type(value)()
    if isinstance(value, dict):
        return {}
    return None


FAULTS: dict[str, Fault] = {
    "latency": Fault("latency", "timing", _latency),
    "errors": Fault("errors", "execution", _error),
    "corruption": Fault("corruption", "output", _corrupt),
    "truncation": Fault("truncation", "output", _truncate),
    "empty": Fault("empty", "output", _empty),
}
