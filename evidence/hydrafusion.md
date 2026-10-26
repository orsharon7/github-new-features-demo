# HydraFusion: fix the release planner

**Actual local Copilot run, 26 October 2026. Not a hosted Actions run.**

A real HydraFusion request repaired the planner. Independent verification passed all 12 tests and produced the correct rollout order.

Local paths and session identifiers were removed. Output is otherwise from the real run.

## Independently rerun checks

```text

> test
> node --test test/rollout.test.mjs

✔ empty input (0.54275ms)
✔ independent services use sorted, bounded waves (0.105125ms)
✔ dependencies finish in earlier waves (0.3295ms)
✔ ready services are reconsidered and sorted at every wave (0.072458ms)
✔ diamond dependency waits for both predecessors (0.046417ms)
✔ does not mutate frozen input (0.044166ms)
✔ rejects invalid concurrency (0.378416ms)
✔ rejects invalid service shapes (0.134125ms)
✔ rejects duplicate names (0.084583ms)
✔ rejects missing and duplicate dependencies (0.122083ms)
✔ rejects cycles, including a cycle after a valid wave (0.06075ms)
✔ rejects self-dependencies (0.050625ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 37.595625


> demo
> node demo.mjs

Expected: database + metrics -> api -> web
Actual:   database + metrics -> api -> web

```

## Actual code changes

```diff
diff --git a/src/rollout.mjs b/src/rollout.mjs
index 8e61713..198208d 100644
--- a/src/rollout.mjs
+++ b/src/rollout.mjs
@@ -2,10 +2,65 @@ export function planRollout(services, maxParallel) {
   if (!Number.isSafeInteger(maxParallel) || maxParallel < 1) {
     throw new RangeError("maxParallel must be a positive safe integer");
   }
-  services.sort((left, right) => left.name.localeCompare(right.name));
+  if (!Array.isArray(services)) {
+    throw new TypeError("services must be an array");
+  }
+
+  const dependencies = new Map();
+  for (const [index, service] of services.entries()) {
+    if (service === null || typeof service !== "object") {
+      throw new TypeError(`service at index ${index} must be an object`);
+    }
+    const { name, dependsOn } = service;
+    if (typeof name !== "string" || name.length === 0) {
+      throw new TypeError(`service at index ${index} must have a nonempty string name`);
+    }
+    if (!Array.isArray(dependsOn)) {
+      throw new TypeError(`service "${name}" must have a dependsOn array`);
+    }
+    if (dependencies.has(name)) {
+      throw new Error(`duplicate service name "${name}"`);
+    }
+    const unique = new Set();
+    for (const dependency of dependsOn) {
+      if (typeof dependency !== "string" || dependency.length === 0) {
+        throw new TypeError(`service "${name}" has a non-string or empty dependency`);
+      }
+      if (unique.has(dependency)) {
+        throw new Error(`service "${name}" has duplicate dependency "${dependency}"`);
+      }
+      if (dependency === name) {
+        throw new Error(`service "${name}" has a self-dependency`);
+      }
+      unique.add(dependency);
+    }
+    dependencies.set(name, unique);
+  }
+
+  for (const [name, deps] of dependencies) {
+    for (const dependency of deps) {
+      if (!dependencies.has(dependency)) {
+        throw new Error(`service "${name}" depends on unknown service "${dependency}"`);
+      }
+    }
+  }
+
+  const remaining = new Set(dependencies.keys());
+  const done = new Set();
   const waves = [];
-  for (let index = 0; index < services.length; index += maxParallel) {
-    waves.push(services.slice(index, index + maxParallel).map((service) => service.name));
+  while (remaining.size > 0) {
+    const ready = [...remaining]
+      .filter((name) => [...dependencies.get(name)].every((dep) => done.has(dep)))
+      .sort();
+    if (ready.length === 0) {
+      throw new Error(`dependency cycle detected among: ${[...remaining].sort().join(", ")}`);
+    }
+    const wave = ready.slice(0, maxParallel);
+    for (const name of wave) {
+      remaining.delete(name);
+      done.add(name);
+    }
+    waves.push(wave);
   }
   return waves;
 }

```

## Recorded Copilot output

```text
● Session limits: 18.2/30 AI credits used.

● Inspect spec, code, run tests (shell)
  │ cat README.md package.json src/rollout.mjs; ls -R | grep -v node_modules | head -30; npm test
  │ 2>&1 | tail -40
  └ 90 lines…

● Read tests and demo (shell)
  │ cat test/rollout.test.mjs demo.mjs; npm test 2>&1 | grep -E "^# |^✖"
  └ 110 lines…

● Rewrite planner, run tests and demo (shell)
  │ cat > src/rollout.mjs <<'EOF'
  │ export function planRollout(services, maxParallel) {
  │ if (!Number.isSafeInteger(maxParallel) || maxParallel < 1) {
  │ throw new RangeError("maxParallel must be a positive safe integer");
  │ }…
  └ 73 lines…



Changes    +0 -0
AI Credits 22.19 (21s)
Tokens     ↑ 109.4k (75.8k cached, 33.2k written) • ↓ 2.0k (233 reasoning)

```
