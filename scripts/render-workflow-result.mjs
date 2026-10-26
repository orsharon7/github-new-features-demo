import { readFile, writeFile, appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export function validateReport(report) {
  if (!report || report.decision !== "READY" || report.scenario !== "healthy" ||
      typeof report.runId !== "string" || report.runId.length === 0 ||
      !Array.isArray(report.blockers) || report.blockers.length !== 0 ||
      !Array.isArray(report.reviews) || report.reviews.length !== 2 ||
      new Set(report.reviews.map((review) => review?.label)).size !== 2 ||
      report.reviews.some((review) => !review || !["quality", "operations"].includes(review.label) ||
        typeof review.summary !== "string" || !review.summary.trim() ||
        typeof review.evidence !== "string" || !review.evidence.trim())) {
    throw new Error("Dynamic Workflow did not produce a verified READY report with two distinct real agent reviews");
  }
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = validateReport(JSON.parse(await readFile(process.argv[2], "utf8")));
  const runUrl = new URL(process.env.DEMO_RUN_URL);
  if (runUrl.hostname !== "github.com" || runUrl.protocol !== "https:") {
    throw new Error("Expected an HTTPS GitHub Actions run URL");
  }
  const body = [
    "# Dynamic Workflow: READY",
    "**SYNTHETIC DEMO DATA. This is the actual output of a registered Copilot Dynamic Workflow run locally.**",
    "**Execution location:** the two AI agents ran in the presenter's authenticated Copilot CLI. This GitHub Actions run validates and publishes the captured output; it does not rerun the AI workflow.",
    `- Native workflow run ID: \`${report.runId}\``,
    "- Status: completed and independently validated",
    "- Decision: **READY**",
    "- Blockers: **none**",
    "- Real workflow-owned agents: **2**",
    `- [Result validation and publication run](${runUrl.href})`,
    ...report.reviews.flatMap((review) => [`## ${review.label}`, review.summary, `Evidence: ${review.evidence}`]),
    "## What to say",
    "The process is defined in code: validate data, apply deterministic gates, run two agents in parallel, and combine their explanations. This real process ran in Copilot locally; its completed output is shown here on GitHub.",
    "## Availability note",
    "The native Dynamic Workflow was unavailable with this repository's scoped Actions inference session. Rather than simulate it, we ran it in the entitled local Copilot session and published the real result. Agentic Workflows ran directly in Actions in the separate release-report demo.",
    "## Actual returned JSON",
    "```json", JSON.stringify(report, null, 2), "```"
  ].join("\n\n") + "\n";
  await writeFile("workflow-result.md", body);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, body);
  console.log(`Verified native workflow ${report.runId}: READY, no blockers, two distinct reviews.`);
}
