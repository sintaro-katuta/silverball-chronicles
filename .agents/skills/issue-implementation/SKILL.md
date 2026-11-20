---
name: issue-implementation
description: Implement the authorized scope of a silverball-chronicles issue while preserving existing changes and established game behavior.
---

# Issue implementation

Inspect relevant code and local modifications before editing. Implement the scoped design in the project's existing structure; preserve unrelated work and explicitly protect game and presentation invariants. Use a representative change first when the production flow calls for one. Add focused tests when they verify meaningful behavior or regression risk; documentation-only work may need links and factual checks instead. Record local changes and known gaps for verification. Do not silently expand an issue or mark an incomplete prototype as adopted.

## Parallel work

When this stage has independent work that can safely proceed in parallel and delegation is permitted and available, start subagents for those tasks. Assign non-overlapping file ownership or read-only scope; identify the candidate version and expected evidence. Integrate and check their actual outputs under the delegation rules in `issue-delivery`. Continue sequentially where dependencies require it or delegation is unavailable. Avoid duplicate tasks and recursive delegation with no independent work.
