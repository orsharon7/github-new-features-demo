# Fleet and autopilot: three independent implementations

**Actual local Copilot run, 26 October 2026. Not a hosted Actions run.**

Three real subagents implemented risk scoring, changelog grouping and ownership separately. The combined result passed all 12 tests. An initial read-only shell command was denied; the agent recovered without bypassing permissions.

Local paths and session identifiers were removed. Output is otherwise from the real run.

## Independently rerun checks

```text

> test
> node --test test/*.test.mjs

✔ groups conventional commits while preserving text and order (0.565709ms)
✔ empty and malformed prefixes (0.059417ms)
✔ frozen inputs are not mutated (0.052875ms)
✔ invalid commit collections are rejected (0.083958ms)
✔ longest matching prefix wins (0.297291ms)
✔ first rule wins ties (0.078541ms)
✔ unmatched paths are unowned (0.037791ms)
✔ invalid owner rules are rejected (0.097125ms)
✔ ready when all gates pass (0.480042ms)
✔ all blockers have stable order (0.049ms)
✔ one blocker suffices (0.040209ms)
✔ invalid risk inputs are rejected (0.091042ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 36.314167


> demo
> node demo.mjs

{
  "release": {
    "status": "READY",
    "reasons": []
  },
  "changes": {
    "features": [
      "feat(api): release status"
    ],
    "fixes": [
      "fix: rollback timeout"
    ],
    "other": []
  },
  "owner": "api-team"
}

```

## Actual code changes

```diff
diff --git a/src/changelog.mjs b/src/changelog.mjs
index 3c7f9ba..4003a40 100644
--- a/src/changelog.mjs
+++ b/src/changelog.mjs
@@ -1,3 +1,18 @@
-export function groupChanges() {
-  throw new Error("Demo starter: implement groupChanges from README.md");
+export function groupChanges(commits) {
+  if (!Array.isArray(commits) || !commits.every(commit => typeof commit === "string")) {
+    throw new TypeError("commits must be an array of strings");
+  }
+
+  const grouped = { features: [], fixes: [], other: [] };
+  for (const commit of commits) {
+    if (/^feat: |^feat\([^()]+\): /.test(commit)) {
+      grouped.features.push(commit);
+    } else if (/^fix: |^fix\([^()]+\): /.test(commit)) {
+      grouped.fixes.push(commit);
+    } else {
+      grouped.other.push(commit);
+    }
+  }
+
+  return grouped;
 }
diff --git a/src/owners.mjs b/src/owners.mjs
index 3dda77a..dc2575d 100644
--- a/src/owners.mjs
+++ b/src/owners.mjs
@@ -1,3 +1,28 @@
-export function findOwner() {
-  throw new Error("Demo starter: implement findOwner from README.md");
+export function findOwner(path, rules) {
+  if (typeof path !== "string" || path.length === 0 || !Array.isArray(rules)) {
+    throw new TypeError("Expected a nonempty path string and an array of rules");
+  }
+
+  let owner = "unowned";
+  let longestPrefix = 0;
+
+  for (const rule of rules) {
+    if (
+      rule === null ||
+      typeof rule !== "object" ||
+      typeof rule.prefix !== "string" ||
+      rule.prefix.length === 0 ||
+      typeof rule.owner !== "string" ||
+      rule.owner.length === 0
+    ) {
+      throw new TypeError("Each rule must have nonempty prefix and owner strings");
+    }
+
+    if (rule.prefix.length > longestPrefix && path.startsWith(rule.prefix)) {
+      owner = rule.owner;
+      longestPrefix = rule.prefix.length;
+    }
+  }
+
+  return owner;
 }
diff --git a/src/risk.mjs b/src/risk.mjs
index 4167b97..7da77c0 100644
--- a/src/risk.mjs
+++ b/src/risk.mjs
@@ -1,3 +1,19 @@
-export function scoreRelease() {
-  throw new Error("Demo starter: implement scoreRelease from README.md");
+export function scoreRelease(input) {
+  if (input === null || typeof input !== "object" || Array.isArray(input)) {
+    throw new TypeError("Risk input must be an object");
+  }
+
+  const { failedTests, criticalAlerts, rollbackVerified } = input;
+  if (!Number.isSafeInteger(failedTests) || failedTests < 0 ||
+      !Number.isSafeInteger(criticalAlerts) || criticalAlerts < 0 ||
+      typeof rollbackVerified !== "boolean") {
+    throw new TypeError("Counts must be nonnegative safe integers and rollbackVerified must be boolean");
+  }
+
+  const reasons = [];
+  if (failedTests > 0) reasons.push("Failing tests");
+  if (criticalAlerts > 0) reasons.push("Critical alerts");
+  if (!rollbackVerified) reasons.push("Rollback unverified");
+
+  return { status: reasons.length > 0 ? "BLOCK" : "READY", reasons };
 }

```

## Recorded Copilot output

```text
I’ll split the three independent implementations into separate file-owned tasks, then integrate and run the requested checks.

● Read README.md
  └ 34 lines read

✗ Check worktree and project files (shell)
  │ git status --short && printf '\nRoot files:\n' && ls -1
  └ Permission denied because no interactive user response was available. Retry in an interactive
    session so the user can approve it, or try an alternative that does not require this permission.
  Approval check
    └ ✗ Denied, no one to approve

/ Search (glob)
  │ "**/*{risk,changelog,owners}*"
  └ 6 files found

● Todo added 3 items
  │ Implementing release risk score
  │ Implementing changelog grouping
  └ Implementing owner lookup

● Todo started 3 items
  │ implement-release-risk-score
  │ implement-release-changelog
  └ implement-release-owner-lookup

All three workstreams are independent and ready; I’m launching isolated agents with ownership limited to their assigned source file and matching test read.

● General-purpose (model: gpt-6-luna) Implement risk score

● General-purpose (model: gpt-6-luna) Implement changelog grouping

● General-purpose (model: gpt-6-luna) Implement owner lookup

● Read package.json
  └ 9 lines read

● Todo added 1 item, 3 dependencies
  │ Integrating release workstreams
  │ Dependency: integrate-release-radar → implement-release-risk-score
  │ Dependency: integrate-release-radar → implement-release-changelog
  └ Dependency: integrate-release-radar → implement-release-owner-lookup

Implemented only `src/risk.mjs`: strict input validation, READY/BLOCK scoring, and exact ordered reasons.

Read `test/risk.test.mjs` and README requirements. All 4 risk tests pass; diff checks pass. Session todo marked done. No blockers.Implemented only `src/owners.mjs`: argument validation, literal longest-prefix matching, first-rule tie handling, and `"unowned"` fallback.

Read `test/owners.test.mjs` first and applied README requirements. All four ownership tests and additional edge-case checks passed. Updated the session todo to `done`.

No blockers; unrelated concurrent changes were untouched.● Read (General-purpose agent — Implement risk score)
  └ idle

● Read (General-purpose agent — Implement owner lookup)
  └ idle

Implemented `groupChanges` in `src/changelog.mjs`: it validates string arrays, groups matching feature and fix prefixes, preserves full messages and order, and leaves input unchanged.

Read `test/changelog.test.mjs`; all four tests pass. Changes were limited to the assigned file. No blockers.● Read (General-purpose agent — Implement changelog grouping)                                    27s
  └ idle

● Todo started integrate-release-radar

The three agents report their assigned implementations and matching-test reads; the todos are complete. I’m running the requested project-wide tests and demo now.

● Run Release Radar demo (shell)
  │ npm run demo
  └ 19 lines…

● Run project test suite (shell)
  │ npm test
  └ 23 lines…

● Review implementation diff (shell)
  │ git status --short && git --no-pager diff -- src/risk.mjs src/changelog.mjs src/owners.mjs
  └ 89 lines…

✔ Todo completed integrate-release-radar



Changes    +62 -6
AI Credits 7.15 (1m 52s)
Tokens     ↑ 511.8k (457.2k cached, 54.5k written) • ↓ 8.9k (4.8k reasoning)

```
