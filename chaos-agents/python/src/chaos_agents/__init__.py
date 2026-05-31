"""chaos-agents: Chaos engineering for AI agents.

Chaos Monkey, but for AI agents. Inject controlled faults — latency,
errors, corrupted/truncated/empty outputs, dropped calls — into your
agent or tool functions to test how resilient they really are.

Example
-------
    from chaos_agents import ChaosMonkey

    monkey = ChaosMonkey(latency=0.3, errors=0.1, corruption=0.1, seed=42)

    @monkey.wrap
    def my_agent(prompt: str) -> str:
        return call_llm(prompt)

    my_agent("hello")  # may be delayed, may raise, may return garbage
"""

from .monkey import ChaosMonkey, ChaosError
from .faults import Fault, FAULTS

__all__ = ["ChaosMonkey", "ChaosError", "Fault", "FAULTS", "__version__"]
__version__ = "0.1.0"
