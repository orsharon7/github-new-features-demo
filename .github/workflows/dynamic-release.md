---
name: Dynamic release readiness
description: Run the real code-defined two-agent Dynamic Workflow and publish its result.
on:
  workflow_dispatch:
permissions:
  contents: read
  copilot-requests: write
engine:
  id: copilot
  dynamic-workflows: true
  args: ["--experimental"]
timeout-minutes: 10
network:
  allowed:
    - defaults
safe-outputs:
  create-issue:
    title-prefix: "[dynamic demo] "
    max: 1
---

# Run the real release-readiness Dynamic Workflow

Run the registered `release-readiness` dynamic workflow exactly once with
arguments `{"scenario":"healthy","pauseForReview":false}`.
Use the native dynamic workflow tool and the existing project extension under
`.github/extensions/release-readiness/`. Do not author a replacement, calculate
the result yourself, or use a generic task agent instead of the workflow.

Wait for completion and inspect the actual returned JSON.
Create one issue titled `Release readiness: two-agent workflow result`.
Include:

- `SYNTHETIC DEMO DATA`.
- The actual dynamic workflow run ID and completion status.
- The exact returned decision and blockers.
- Both structured reviews, naming the quality and operations reviewers.
- A fenced JSON block containing the returned result.
- A link to this GitHub Actions run:
  `${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}`.

Success requires a completed native workflow with decision `READY`, no blockers,
and exactly two structured agent reviews. Do not infer success from registration.
If the workflow fails, publish the actual error as FAIL, never an invented result.
