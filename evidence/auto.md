# Auto: explain the release planner

**Actual local Copilot run, 26 October 2026. Not a hosted Actions run.**

Auto chose a model and identified a real dependency-ordering bug without changing files.

Local paths and session identifiers were removed. Output is otherwise from the real run.

## Recorded Copilot output

```text
● Read README.md
  └ 19 lines read

● Read rollout.mjs
  │ src/rollout.mjs
  └ 11 lines read

- The project is a demo starter for a dependency-aware service rollout planner: it should group service names into waves, with each dependency completed in an earlier wave and no more than `maxParallel` services per wave.
- **Mismatch:** `planRollout` ignores `dependsOn`, so it can place a service in the same wave as—or before—a service it depends on.



Changes    +0 -0
AI Credits 0.18 (8s)
Tokens     ↑ 27.3k (13.4k cached, 13.9k written) • ↓ 290 (107 reasoning)

```
