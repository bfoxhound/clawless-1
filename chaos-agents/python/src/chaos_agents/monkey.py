"""The ChaosMonkey: a configurable fault injector for agent functions."""

from __future__ import annotations

import functools
import random
from typing import Any, Callable

from .faults import FAULTS, ChaosError


class ChaosMonkey:
    """Wrap agent/tool callables and randomly inject faults.

    Each fault is given an independent probability in ``[0, 1]``. On every call
    the monkey rolls the dice per fault and applies the ones that trigger:
    timing faults run before the call, execution faults short-circuit it, and
    output faults mangle the return value.

    Args:
        latency: probability of injecting an artificial delay.
        errors: probability of raising :class:`ChaosError` instead of running.
        corruption: probability of scrambling a string return value.
        truncation: probability of truncating a string return value.
        empty: probability of blanking the return value.
        seed: optional seed for reproducible chaos.
        enabled: master switch; when ``False`` calls pass through untouched.
    """

    def __init__(
        self,
        latency: float = 0.0,
        errors: float = 0.0,
        corruption: float = 0.0,
        truncation: float = 0.0,
        empty: float = 0.0,
        *,
        seed: int | None = None,
        enabled: bool = True,
    ) -> None:
        self.probabilities = {
            "latency": latency,
            "errors": errors,
            "corruption": corruption,
            "truncation": truncation,
            "empty": empty,
        }
        self.enabled = enabled
        self._rng = random.Random(seed)
        self.log: list[str] = []

    def _fires(self, name: str) -> bool:
        return self._rng.random() < self.probabilities.get(name, 0.0)

    def _record(self, name: str) -> None:
        self.log.append(name)

    def run(self, fn: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
        """Invoke ``fn`` once, applying any faults that trigger this call."""
        if not self.enabled:
            return fn(*args, **kwargs)

        # Timing faults run before the call.
        if self._fires("latency"):
            self._record("latency")
            FAULTS["latency"].apply(self._rng)

        # Execution faults replace the call entirely.
        if self._fires("errors"):
            self._record("errors")
            FAULTS["errors"].apply(self._rng)

        result = fn(*args, **kwargs)

        # Output faults mangle the return value (first match wins).
        for name in ("corruption", "truncation", "empty"):
            if self._fires(name):
                self._record(name)
                return FAULTS[name].apply(self._rng, result)

        return result

    def wrap(self, fn: Callable[..., Any]) -> Callable[..., Any]:
        """Decorator form of :meth:`run`."""

        @functools.wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            return self.run(fn, *args, **kwargs)

        wrapper.__chaos__ = self  # type: ignore[attr-defined]
        return wrapper

    def __call__(self, fn: Callable[..., Any]) -> Callable[..., Any]:
        return self.wrap(fn)

    def report(self) -> dict[str, int]:
        """Return a count of how many times each fault has fired so far."""
        counts: dict[str, int] = {name: 0 for name in self.probabilities}
        for name in self.log:
            counts[name] += 1
        return counts


__all__ = ["ChaosMonkey", "ChaosError"]
