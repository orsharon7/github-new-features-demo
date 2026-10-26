# Release Radar: GitHub-hosted demos

**Synthetic, deliberately vulnerable training fixture. Not a deployable app.**
There is no start script. Tests bind only to loopback on an ephemeral port.

This repository supports two separate GitHub product demos:

1. **GitHub Agentic Workflows:** manually trigger `release-report.lock.yml`.
   A read-only agent examines `data/release.json`; a separate safe-output job
   creates at most one report issue per run.
2. **Agentic Autofix:** CodeQL scans the intentional reflected-HTML flaw in
   `src/app.mjs`. Assign the resulting default-branch backlog alert to Copilot.
   Inspect its actual agent session, draft PR, tests and CodeQL revalidation.

No live cloud run or CodeQL detection is implied by having these files.
Enable and rehearse them in an eligible, dedicated demo repository first.
Do not publish this fixture to a repository containing private/customer data.

## Local checks

```sh
npm ci
npm test
npm run test:regression
```

The ordinary test passes on the starter. The markup-escaping regression
intentionally fails until the flaw is fixed. It uses harmless `<b>` markup,
not an executable attack.

## Setup on GitHub

- Copy this fixture with the demo kit's `npm run prepare -- cloud`.
- Choose an approved demo repository with Actions enabled.
- Keep both the agentic Markdown source and generated `.lock.yml` file.
- Configure `COPILOT_GITHUB_TOKEN` as a repository Actions secret using an
  appropriate fine-grained PAT with **Copilot Requests: Read**. Do not put it
  in a file or commit, and do not assume a normal `gh` login token is suitable
  for workflow inference. Organization-billed `copilot-requests: write` is an
  alternative configuration, not enabled by this fixture.
- Push to the default branch. Run CodeQL and confirm that an actual backlog
  alert exists. Do not enable default setup alongside this advanced workflow.
- Enable Agentic Autofix using the required enterprise/organization/repository
  policies. Review Code Security AI credit and Actions minute costs.
- For eligible personal repositories, the documented Agentic Autofix path is
  a public repository; do not assume a personal private repository qualifies.
- Agentic Autofix is not available for EMU-owned repositories. A preview-enabled
  organization may need to enable it again.

Use the main presenter guide for exact UI clicks, demo order and fallbacks.
Never automatically merge a generated fix.
