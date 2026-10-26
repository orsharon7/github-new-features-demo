import { defineWorkflow, joinSession } from "@github/copilot-sdk/extension";
import { runReleaseReadiness } from "./workflow.mjs";

const releaseReadiness = defineWorkflow({
  meta: {
    name: "release-readiness",
    description: "Evaluate a synthetic release using deterministic gates and two agent reviews. " +
      "args: { scenario: 'risky' | 'healthy', pauseForReview: boolean }.",
    phases: [
      { title: "Validate and gate" },
      { title: "Parallel explanations" },
      { title: "Human checkpoint" },
      { title: "Report" }
    ],
    argsSchema: {
      type: "object",
      required: ["scenario", "pauseForReview"],
      properties: {
        scenario: { type: "string", enum: ["risky", "healthy"] },
        pauseForReview: { type: "boolean" }
      }
    },
    limits: {
      maxConcurrentSubagents: 2,
      maxTotalSubagents: 2
    }
  },
  run: runReleaseReadiness
});

await joinSession({ workflows: [releaseReadiness] });
