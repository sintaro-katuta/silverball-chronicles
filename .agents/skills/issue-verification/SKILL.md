---
name: issue-verification
description: Verify a silverball-chronicles issue against its acceptance criteria with current, appropriately scoped evidence.
---

# Issue verification

Map each acceptance criterion to the current revision, conditions, evidence and result: pass, fail, or unverified. Run relevant checks at a scope appropriate to the change; repair failures caused by the work and repeat affected checks. For rendering compare current output at the same viewport and timeline, and for physical or sound changes use the project's production-flow conditions. Differentiate automated tests, natural play, real-device checks, listening and human acceptance; prior results and release records are not evidence of a fresh test. Report remaining discrepancies and limitations; do not close or claim the whole issue complete while a required criterion remains unmet.

First complete all applicable non-human criteria and an end-to-end walkthrough on the finished candidate; fix failures and rerun affected checks. Only when all applicable non-human criteria pass, use `issue-human-review` for one consolidated human review. Record human feedback separately from automated and agent checks. If a required check is blocked, identify the blocker and do not claim 100% completion or seek acceptance of the incomplete candidate.

## Parallel work

When this stage has independent work that can safely proceed in parallel and delegation is permitted and available, start subagents for those tasks. Assign non-overlapping file ownership or read-only scope; identify the candidate version and expected evidence. Integrate and check their actual outputs under the delegation rules in `issue-delivery`. Continue sequentially where dependencies require it or delegation is unavailable. Avoid duplicate tasks and recursive delegation with no independent work.
