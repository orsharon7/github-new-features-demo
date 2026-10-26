# Local sandbox: a real blocked file read

**Actual local Copilot run, 26 October 2026. Not a hosted Actions run.**

A native sandboxed shell could write an allowed workspace file but could not read the synthetic protected canary. The OS returned EPERM.

Local paths and session identifiers were removed. Output is otherwise from the real run.

## Recorded Copilot output

```text
● Run the requested local sandbox canary probe (sandboxed shell)
  │ node probe.mjs
  └ 1 line…

Exit status: **0**

Output:
```text
PASS: workspace write succeeded; canary read denied by OS (EPERM).
```



Changes    +0 -0
AI Credits 0.18 (9s)
Tokens     ↑ 28.1k (14.0k cached, 14.1k written) • ↓ 107 (36 reasoning)

```
