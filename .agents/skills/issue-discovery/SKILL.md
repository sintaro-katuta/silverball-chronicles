---
name: issue-discovery
description: Clarify the user outcome, current evidence, constraints, and scope before working on a silverball-chronicles issue.
---

# Issue discovery

Read the issue and its dependencies, the current project instructions, relevant specification precedence, existing implementation and working-tree state. Identify the user's desired result, affected users or situations, what is in and out of scope, and facts versus assumptions. Distinguish historical evidence, current source, release records and live observation; record the version and date of material evidence. Check for existing work before starting it again. Resolve ordinary uncertainty with a stated assumption; ask only when the missing answer materially affects work and cannot be inferred. Hand off the problem and unresolved decisions to requirements.

## Parallel work

When this stage has independent work that can safely proceed in parallel and delegation is permitted and available, start subagents for those tasks. Assign non-overlapping file ownership or read-only scope; identify the candidate version and expected evidence. Integrate and check their actual outputs under the delegation rules in `issue-delivery`. Continue sequentially where dependencies require it or delegation is unavailable. Avoid duplicate tasks and recursive delegation with no independent work.
