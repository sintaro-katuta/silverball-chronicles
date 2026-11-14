---
name: issue-delivery
description: Advance one silverball-chronicles issue through the relevant requirements, design, implementation, verification, and operational handoff while preserving the project's production flow.
---

# Issue delivery

Use the issue's actual scope and acceptance criteria; documentation or investigation issues do not automatically require product code. Follow `AGENTS.md`, `docs/agile/AUTONOMY.md`, and `docs/agile/PRODUCTION_FLOW.md`; user instructions override skill guidance. Preserve unrelated work and identify the actual working-tree and published revisions.

Read and apply the relevant sibling skills: `issue-discovery` for intent and evidence, `issue-requirements` for acceptance, `issue-design` for the approach, `issue-implementation` for changes, `issue-verification` for evidence, and `issue-operations` for handoff. Read the stage skills as needed, not every stage blindly. Route rendering and sound work to project-specific skills when applicable. Match artifacts and checks to risk and scope; a small issue can use one compact record.

Carry acceptance criteria and evidence through each stage. Iterate on failures rather than reporting a failed check as completion. Separate local completion, human acceptance, PR integration and release; report any incomplete criterion. The skill does not grant permissions for external updates, main merge, or deployment. Refine these skills only from observed workflow gaps without broadening the issue.

## Delegate and integrate

For every applicable stage, when the user's current instructions and runtime permit delegation, start subagents for independently parallelizable work. Identify separable research, requirements checks, design alternatives, separate-file implementation, verification, and operational preparation; assign work in parallel whenever the results do not depend on each other. Do not split tightly coupled or sequential work merely to create parallelism. Respect available slots and higher-priority restrictions; if delegation is unavailable, continue locally and state any material limitation.

Assign each task its objective, acceptance criteria, relevant version and evidence, editable files or read-only scope, prohibited operations, and expected result including unresolved issues. Give concurrent writers non-overlapping ownership and avoid concurrent Git operations. Freeze relevant source during timing-sensitive measurements, captures and trials. Run independent verification against the completed candidate where practical. The parent inspects the actual changes, evidence and tested revision, reconciles conflicts, and owns the integrated result. Delegation does not expand authorization for external actions or publishing.

## One completed-candidate human review

Complete the requested artifact and all applicable non-human acceptance criteria first. Run the relevant end-to-end walkthrough against the actual finished candidate, then resolve failures and repeat affected checks. Independently inspect and integrate the result. Do not request routine intermediate human review or present a partial prototype as finished. Only when every applicable non-human criterion has passed and the candidate is complete, prepare one consolidated human review using `issue-human-review`. Human play, listening, judgment and acceptance are performed during that review; never fabricate them or treat the absence of a response as acceptance. If a required check is blocked, the result is not 100%: record the blocker, continue independent work, and explain what is needed rather than requesting acceptance of an incomplete candidate. This does not override explicit human instructions, necessary clarification, or the existing authorization boundaries for external actions, merge and publication. Address feedback and request follow-up review when needed; one review means one consolidated request for the completed candidate, not acceptance without review of subsequent changes.

When an authorized PR is requested, apply `issue-operations` for base/head and version preflight, then monitor the resulting CI through completion and investigate failures. Do not bypass checks or expand release permissions.

## Finish the issue

Verify the actual issue state and do not report full completion while the issue remains open. Once the user has accepted the completed work, the acceptance criteria and relevant checks are satisfied, and any required PR has been merged, close the issue as completed when authorized. A PR is not mandatory for an issue whose scope does not require one. A PR merged into a non-default release branch does not automatically close the issue: check and, if necessary, close it explicitly. Verify the resulting state. If acceptance, required checks, a required merge or authorization is missing, report the actual issue state and the unmet condition; do not equate an already-closed issue with verified completion. Closing an issue does not authorize a main merge or deployment.
