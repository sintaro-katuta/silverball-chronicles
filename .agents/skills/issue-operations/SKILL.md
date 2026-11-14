---
name: issue-operations
description: Prepare an operational and review handoff for a silverball-chronicles issue, keeping local work distinct from release and deployment.
---

# Issue operations

Prepare a reviewer-facing account of changes, scope, current revision or dirty working tree, acceptance evidence, limitations and unresolved decisions. When the issue affects release or operations, provide applicable build, configuration, monitoring and rollback steps tied to the actual target; for a documentation issue specify ownership and update triggers instead. Distinguish local work, PR, integration and publication, and preserve the project's explicit approval boundaries. Do not update external issues, publish or merge merely because the handoff is ready; follow the user's current authorization and `docs/agile/AUTONOMY.md`.

For the human-facing decision package, use `issue-human-review`. Make the candidate, requested decision, known failures and unverified items accessible without requiring the reviewer to reconstruct the full work history.

## PR preflight and CI

Before creating or updating an authorized PR, inspect the actual base and head, workflow triggers, and the candidate's `prototype/package.json` and `prototype/package-lock.json` root versions. For a sprint-to-release PR, the release branch suffix and package version must agree; where the lockfile has a root version, it must agree too. Reproduce the project's `node prototype/tools/release-cd.js check-pr` against an event matching the intended repository, head and base. Update both version files only when the next release requires it, and never relax CI or publishing checks to make a PR pass. Confirm the PR's triggers do not publish before sending changes.

After creating or updating the PR, verify its actual head, base and CI; monitor unit, browser and verify until they complete. Investigate failures from logs, fix their causes within the authorized scope, and repeat affected local checks and CI. Do not describe queued, skipped or incomplete checks as passing. If CI cannot complete, report its actual status and blocker.

## Parallel work

When this stage has independent work that can safely proceed in parallel and delegation is permitted and available, start subagents for those tasks. Assign non-overlapping file ownership or read-only scope; identify the candidate version and expected evidence. Integrate and check their actual outputs under the delegation rules in `issue-delivery`. Continue sequentially where dependencies require it or delegation is unavailable. Avoid duplicate tasks and recursive delegation with no independent work.

## Issue closure

Once the user has accepted the work, applicable acceptance criteria and checks are satisfied, and any required target PR has been merged, check the actual issue state and close it as completed when authorized. Issues that do not need a PR need no merge. For non-default release branches, do not assume a merged PR closed the issue. Verify the resulting state and report any missing completion condition or blocked closure without misstating the actual state. Closure does not authorize main merge or publication.
