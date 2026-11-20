---
name: issue-requirements
description: Turn a silverball-chronicles issue into scoped, verifiable acceptance criteria without changing established game rules.
---

# Issue requirements

Translate the desired outcome into testable acceptance criteria, including relevant existing invariants, failure and recovery cases, and the intended evidence for each. Preserve explicit issue criteria and specification precedence; distinguish product behavior from documentation, investigation or operational deliverables. Record actual unknowns and contradictions rather than silently treating an old statement as current. For visual, physical, or audio work define comparable conditions and distinguish automated checks from human acceptance. Keep the record proportional to the issue and connect each criterion to design and verification.

## Parallel work

When this stage has independent work that can safely proceed in parallel and delegation is permitted and available, start subagents for those tasks. Assign non-overlapping file ownership or read-only scope; identify the candidate version and expected evidence. Integrate and check their actual outputs under the delegation rules in `issue-delivery`. Continue sequentially where dependencies require it or delegation is unavailable. Avoid duplicate tasks and recursive delegation with no independent work.
