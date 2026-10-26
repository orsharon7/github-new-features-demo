# GitHub Copilot: from a coding task to repeatable automation

One small project, **Release Radar**, connects these examples: understand release
code, fix a rollout planner, divide implementation work, and produce a release
readiness report.

The progression is simple:

**Choose intelligence -> coordinate work -> define a process -> automate it on GitHub.**

The results are already available. Code examples explain how they work; there is
no need to run commands during this walkthrough. Each section links to the
implementation and the actual execution or recorded output.

## The starting point: is this release ready?

Our [release input](https://github.com/orsharon7/github-new-features-demo/blob/main/data/release.json)
contains a few signals:

```json
{
  "tests": { "passed": 118, "total": 120 },
  "criticalAlerts": 1,
  "rollbackVerified": false
}
```

These are **synthetic release signals**, not counts from this repository's unit
tests. A release is blocked if tests fail, critical alerts remain, or rollback
has not been verified.

This gives us something concrete to implement, explain, and automate.

## 1. Smart Auto: let Copilot choose the model

The first decision is usually not *how many agents?* It is *which model should
handle this task?*

Auto considers the task and model availability, within the models allowed by
your plan and organization policies. The developer can focus on the request:

```text
Read README.md and src/rollout.mjs.
Explain the intended behavior and identify one mismatch.
Do not edit files.
```

In this run, Copilot identified that the rollout planner **ignored service
dependencies**. It explained the problem without changing code.

**Auto routes the task; it does not guarantee a model switch on every message.**

[Recorded request execution and response](https://github.com/orsharon7/github-new-features-demo/blob/main/evidence/auto.md)
| [Planner before/after code](https://github.com/orsharon7/github-new-features-demo/blob/main/evidence/hydrafusion.md#actual-code-changes)
| [Auto documentation](https://docs.github.com/en/copilot/concepts/models/auto-model-selection)

## 2. HydraFusion: coordinate models to solve the task

Now move from understanding the bug to fixing it. Services must be deployed only
after their dependencies have completed:

```js
planRollout([
  { name: "web", dependsOn: ["api"] },
  { name: "api", dependsOn: ["database"] },
  { name: "database", dependsOn: [] },
  { name: "metrics", dependsOn: [] }
], 2);
```

The correct result is three waves:

```json
[["database", "metrics"], ["api"], ["web"]]
```

**Auto selects a model. HydraFusion can select an execution pattern involving
models:**

- **Single:** one model solves the task.
- **Cascade:** an efficient model drafts; a quality gate can escalate.
- **Critique:** one model drafts, another critiques, and the draft is revised.

The recorded HydraFusion run repaired the planner. Independent checks passed
**12/12 tests**, including dependency cycles, invalid inputs, and input immutability.
The tests establish the code's behavior, not that one model is universally better.

[Actual implementation diff](https://github.com/orsharon7/github-new-features-demo/blob/main/evidence/hydrafusion.md#actual-code-changes)
| [Passing tests and rollout output](https://github.com/orsharon7/github-new-features-demo/blob/main/evidence/hydrafusion.md#independently-rerun-checks)
| [Recorded execution](https://github.com/orsharon7/github-new-features-demo/blob/main/evidence/hydrafusion.md#recorded-copilot-output)

HydraFusion is a research preview. **Max-specific behavior was not verified in
this demo**; no Max capability, price, or quality difference is assumed.
[Official HydraFusion explanation](https://github.blog/ai-and-ml/github-copilot/project-hydrafusion-frontier-quality-via-multi-model-orchestration/)

## 3. Fleet and autopilot: parallelism and continuation

The next step is a task with several independent pieces. Release Radar needs:

```text
Risk scoring      -> src/risk.mjs
Changelog groups  -> src/changelog.mjs
Code ownership    -> src/owners.mjs
                         |
                 Integrate + run all tests
```

Two controls serve different purposes:

| Control | Responsibility |
|---|---|
| **Fleet** | Delegate independent work to multiple agents in parallel. |
| **Autopilot** | Keep working through implementation, tests, and iteration without another prompt after every step. |

An abbreviated task makes ownership explicit:

```text
/fleet Implement the three workstreams in parallel.
One agent owns risk.mjs, one changelog.mjs, and one owners.mjs.
Do not change another agent's file or the tests.
After all three finish, run npm test and npm run demo.
```

For example, the risk module implements this contract:

```js
scoreRelease({
  failedTests: 0,
  criticalAlerts: 0,
  rollbackVerified: true
});
// Result: { status: "READY", reasons: [] }
```

The actual run used **three agents**, changed three source files, and passed all
**12 integration tests**. Disjoint ownership reduced editing conflicts; the
parent agent still had to check the combined result.

[Three implementation diffs](https://github.com/orsharon7/github-new-features-demo/blob/main/evidence/fleet.md#actual-code-changes)
| [Agent launches and execution](https://github.com/orsharon7/github-new-features-demo/blob/main/evidence/fleet.md#recorded-copilot-output)
| [Combined test results](https://github.com/orsharon7/github-new-features-demo/blob/main/evidence/fleet.md#independently-rerun-checks)

More agents are not automatically faster. Parallelism helps when work is
independent, and autopilot does not remove tool permissions or review.

## 4. Dynamic Workflows: make the process repeatable

Fleet lets the agent decide how to break down a task. Sometimes the team needs a
specific process to run each time:

```text
Validate input -> compute release gates -> two parallel reviews -> one report
```

A **Dynamic Workflow** defines that process in code. Agents handle analysis;
ordinary code controls the steps, data flow, and checks.

Our gate is deterministic. This excerpt comes from the implementation:

```js
const blockers = [];
if (data.tests.passed < data.tests.total) blockers.push("Failing tests");
if (data.criticalAlerts > 0) blockers.push("Critical alerts");
if (!data.rollbackVerified) blockers.push("Rollback unverified");
return { release: data.release, decision: blockers.length ? "BLOCK" : "READY", blockers };
```

The workflow then requests two structured explanations. This is an abridged
outline of the orchestration; the full source includes validation and journaling:

```js
const gates = await ctx.step("release-gates-v1", () => evaluateRelease(data));

const results = await ctx.parallel(
  ["quality", "operations"].map((label) => async () => {
    const review = await ctx.agent(
      `Explain the ${label} findings: ${JSON.stringify({ data, gates })}`,
      { label: `release-${label}`, schema: reviewSchema }
    );
    return validateReview(review, label);
  })
);
```

- `ctx.step` journals a completed result for reuse on resume.
- `ctx.parallel` runs the independent reviews concurrently.
- `schema` specifies the response shape; application checks reject missing or
  invalid results.
- The agents **explain the release gate; they cannot override it**.

For this run we used the [healthy input](https://github.com/orsharon7/github-new-features-demo/blob/main/data/healthy.json):
120/120 tests, zero critical alerts, and verified rollback. The actual result is
**READY**, with separate quality and operations reviews.

[Workflow registration](https://github.com/orsharon7/github-new-features-demo/blob/main/.github/extensions/release-readiness/extension.mjs)
| [Full implementation](https://github.com/orsharon7/github-new-features-demo/blob/main/.github/extensions/release-readiness/workflow.mjs)
| [Generated report](https://github.com/orsharon7/github-new-features-demo/issues/3)
| [Actual returned JSON](https://github.com/orsharon7/github-new-features-demo/blob/main/evidence/dynamic-workflow-result.json)

**Execution boundary:** this native Dynamic Workflow ran locally in Copilot.
GitHub Actions [validated and published its captured result](https://github.com/orsharon7/github-new-features-demo/actions/runs/40280944891);
it did not rerun the AI. Native workflow execution was unavailable with this
repository's hosted inference session. The
[publication workflow](https://github.com/orsharon7/github-new-features-demo/blob/main/.github/workflows/dynamic-release.yml)
makes that distinction explicit.

## 5. Agentic Workflows: automate the work on GitHub

Now change the question from *how does the process work?* to *what starts it?*

**GitHub Agentic Workflows** run repository automation in GitHub Actions.
Markdown describes the goal; configuration defines triggers, tools, permissions,
and allowed outputs.

This shortened excerpt captures our release-report workflow:

```markdown
---
on:
  workflow_dispatch:
permissions:
  contents: read
  copilot-requests: write
engine: copilot
safe-outputs:
  create-issue:
    max: 1
---

Read data/release.json.
Create a release-readiness issue with a decision, evidence, and next steps.
Block the release if tests fail, critical alerts remain, or rollback is unverified.
```

The full source also restricts the shell command, sets a timeout, and configures
network access. Compilation produces the Actions workflow:

```text
release-report.md
    -> gh aw compile release-report
    -> release-report.lock.yml
    -> GitHub Actions
    -> release-readiness issue
```

Three details matter:

1. `workflow_dispatch` makes this example manually triggered. Other workflows
   can use supported repository events or schedules.
2. The agent reads the repository; **a separate permission-controlled job**
   publishes the requested issue through a safe output.
3. `max: 1` bounds issue creation per run. It is not a global quota or a human
   approval requirement.

This workflow used the original **risky input** and produced **BLOCK**, with an
evidence table and three next steps. Unlike the previous example, **the agent
really ran in GitHub Actions**.

[Complete Markdown source](https://github.com/orsharon7/github-new-features-demo/blob/main/.github/workflows/release-report.md)
| [Compiled Actions workflow](https://github.com/orsharon7/github-new-features-demo/blob/main/.github/workflows/release-report.lock.yml)
| [Completed execution](https://github.com/orsharon7/github-new-features-demo/actions/runs/40279930312)
| [Generated issue](https://github.com/orsharon7/github-new-features-demo/issues/1)

**Dynamic Workflows define a process inside Copilot.
Agentic Workflows run repository automation in GitHub Actions.**

## 6. Agentic Autofix: from a security alert to a proposed fix

Security findings provide another starting point for agent work. This training
route contains an intentional flaw:

```js
const name = typeof request.query.name === "string" ? request.query.name : "world";
response.type("html").send(`<h1>Hello ${name}</h1>`);
```

The query value enters an HTML response without escaping. CodeQL detected the
real `js/reflected-xss` alert in this repository.

Agentic Autofix extends the remediation process:

```text
Default-branch alert -> assign to Copilot -> investigate + fix + validate
                    -> draft pull request -> human review
```

Ordinary **Copilot Autofix** suggests a change for a supported alert.
**Agentic Autofix** investigates assigned alerts and prepares a validated draft
PR. Validation is best effort; maintainers still review and test the change.

[Training route](https://github.com/orsharon7/github-new-features-demo/blob/main/src/app.mjs)
| [Harmless markup regression test](https://github.com/orsharon7/github-new-features-demo/blob/main/checks/escaping.test.mjs)
| [CodeQL configuration](https://github.com/orsharon7/github-new-features-demo/blob/main/.github/workflows/codeql.yml)
| [Completed scan](https://github.com/orsharon7/github-new-features-demo/actions/runs/40279768676)
| [Actual alert](https://github.com/orsharon7/github-new-features-demo/security/code-scanning/1)

**This demo verifies detection, not Agentic Autofix execution.** No completed
Autofix PR is claimed.
[Official comparison and access requirements](https://docs.github.com/en/code-security/concepts/code-scanning/autofix-for-code-scanning)

## 7. Local sandboxing and models: two separate boundaries

### Sandboxing controls what tools can access

The sandbox example allowed a workspace write but explicitly denied reading a
protected folder containing a harmless test file:

```text
node probe.mjs

PASS: workspace write succeeded; canary read denied by OS (EPERM).
```

This is an observed OS denial, not just a "sandbox enabled" badge. The same
probe outside the sandbox fails its assertion because the canary is readable.
Tool approval and OS isolation are different layers.

[Recorded sandbox execution](https://github.com/orsharon7/github-new-features-demo/blob/main/evidence/sandbox.md)
| [Machine-readable proof](https://github.com/orsharon7/github-new-features-demo/blob/main/evidence/sandbox-proof.json)
| [What the sandbox enforces](https://docs.github.com/en/copilot/concepts/security-governance-and-network-settings/understanding-local-sandboxing)

### A local model changes where inference happens

For an already-running, compatible local provider, the configuration has this
shape:

```sh
COPILOT_PROVIDER_BASE_URL=http://127.0.0.1:11434/v1 \
COPILOT_MODEL="your-installed-model-id" \
copilot
```

This is a **configuration example, not an executed demo**. No local model was
installed here. Local inference alone does not make network tools offline or
hide credentials; hosting, tool access, and data egress are separate decisions.

## 8. Computer use: reach applications without an API

Some tasks end in a desktop application rather than a repository. Computer use
lets Copilot interact with application content and visual context: click, type,
scroll, and navigate.

For example, a GUI-only business application can become part of an assisted
workflow. Access is opt-in and permission-controlled. An API, CLI, MCP
integration, or dedicated browser tool is usually preferable when available.

This is a concept-only segment, not a live desktop-control demo.
[Capabilities, supported platforms, and permissions](https://docs.github.com/en/copilot/concepts/agent-capabilities/agent-powered-workflows-and-operations/computer-use)

## The mental model to keep

| Question | Feature |
|---|---|
| Which model should handle the task? | **Auto** |
| How should models work together? | **HydraFusion** |
| Which work can happen in parallel? | **Fleet** |
| Should the agent keep implementing and checking? | **Autopilot** |
| What repeatable process must run? | **Dynamic Workflows** |
| How does repository automation run on GitHub? | **Agentic Workflows** |
| How does a security alert become a proposed fix? | **Agentic Autofix** |
| What can tools access, and where does inference run? | **Sandboxing / local models** |
| What if there is only a desktop UI? | **Computer use** |

The common thread is **explicit goals, bounded permissions, and verifiable
results**. More autonomy does not remove tests or human responsibility.

---

*Prepared 26 October 2026. All inputs are synthetic. The security example is
deliberately vulnerable and must not be deployed. Preview availability and
account entitlements can differ. Local recordings, hosted AI execution, and
result-publication jobs are labeled separately throughout this walkthrough.*
