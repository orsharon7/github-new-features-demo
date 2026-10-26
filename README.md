# GitHub demos: open, show, say

**No setup or live waiting required. Use these completed examples.**

## 1. Agentic Workflows

**Open:** [the generated release report](https://github.com/orsharon7/github-new-features-demo/issues/1).

**Show:** the BLOCK decision, the evidence table and the next steps.

**Say:** "I wrote the task in Markdown. An agent ran in GitHub Actions, read our
release data, and published this report. The agent was read-only; a separate
permission-controlled job created the issue."

[Completed Actions run](https://github.com/orsharon7/github-new-features-demo/actions/runs/40279930312)
| [Short workflow source](./.github/workflows/release-report.md)

## 2. Dynamic Workflows

**Open:** [the two-agent workflow result](https://github.com/orsharon7/github-new-features-demo/issues/3).

**Show:** the real workflow run ID, READY decision, and quality/operations reviews.

**Say:** "This process is defined in code. It validates data, checks release gates,
runs two agents in parallel, and combines their answers. The agents explain the
result; they cannot override the release gates."

This actual Copilot Dynamic Workflow ran **locally**, with two real AI agents.
GitHub Actions validated and published its captured output; it did not rerun the
AI workflow. Native Dynamic Workflows were unavailable with this repository's
hosted inference session, so no hosted inference success is claimed.

[Completed validation/publication run](https://github.com/orsharon7/github-new-features-demo/actions/runs/40280944891)
| [Actual workflow implementation](./.github/extensions/release-readiness/workflow.mjs)

## 3. Fleet + autopilot

**Open:** [the recorded three-agent result](./evidence/fleet.md).

**Show:** 12 passing tests, the three-file diff, and the real agent launches.

**Say:** "Fleet splits independent work across agents. Autopilot keeps the task
moving through implementation and tests. The parent checks the combined result."

This is genuine local Copilot output, not a hosted Actions run.

## 4. HydraFusion and Auto

**Open:** [HydraFusion's actual fix](./evidence/hydrafusion.md), then
[Auto's actual explanation](./evidence/auto.md).

**Say:** "Auto selects a suitable model. HydraFusion can coordinate models:
solve directly, draft and escalate, or draft, critique and revise."

HydraFusion's fix passed all 12 tests. These different tasks are **not** a
price/performance benchmark. Max-specific behavior was not verified: talk about
the concept, but do not promise a Max difference.

## 5. Local sandboxing

**Open:** [the real sandbox result](./evidence/sandbox.md).

**Show:** the successful workspace write and the native `EPERM` read denial.

**Say:** "The OS restricts what an agent-run command can access. A local model is
a separate choice about where inference runs; it does not automatically make
every tool offline."

## Talk-only topics

- **Computer use:** Copilot can click/type/navigate GUI-only applications with
  permission. Prefer APIs or CLI tools where available.
- **Local models:** no local model was installed for this demo; explain BYOK/local
  inference rather than trying a cold model live.
- **Agentic Autofix:** [the real CodeQL alert](https://github.com/orsharon7/github-new-features-demo/security/code-scanning/1)
  is available. Explain "assign alert -> agent investigates and validates -> draft
  PR -> human review." **No completed Agentic Autofix PR is claimed.** Ordinary
  Copilot Autofix suggestions are a separate feature.

## Important boundaries

This is **synthetic, deliberately vulnerable training code**, not a deployable app.
There is no start script. The small test server binds only to loopback.
Do not add private/customer code, credentials, or production data.

The Agentic Workflow succeeded using the scoped `copilot-requests: write`
Actions permission; no personal-token secret was uploaded. The Dynamic Workflow
publisher only validates recorded output and does not request inference access.
This is verified here, not a promise that every account has the same entitlement.
The two demo workflows run only when manually dispatched. CodeQL and ordinary
tests also run on pushes and pull requests.

<details>
<summary>Maintainer checks</summary>

```sh
npm ci
npm test
npm run test:regression
```

The ordinary test passes on the starter. The harmless markup-escaping regression
intentionally fails until the training flaw is fixed. CodeQL has detected the
real `js/reflected-xss` backlog alert. Do not confuse it with the separate
dependency advisory reported by Dependabot; neither is production code.

Both Markdown workflow sources and generated lock files must be retained.

</details>
