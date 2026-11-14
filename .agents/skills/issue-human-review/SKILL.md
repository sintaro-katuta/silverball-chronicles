---
name: issue-human-review
description: Prepare a concise, evidence-backed human review of a silverball-chronicles issue, adapted to the decision and the medium.
---

# Human review

Use this exact Japanese Markdown structure for the human-facing review, with one title and these six headings in this order:

```markdown
# タイトル
## 概要
- 要点
  - 必要な補足

## 背景

## 課題

## 解決策

## 変更前
画像または文章

## 変更後
画像または文章
```

Use a descriptive title, not the literal placeholder. Keep the overview concise and include the specific review decision, relevant verification results and material limitations in the appropriate existing sections; link detailed evidence without hiding failures or uncertainty. Do not add extra headings. For a screen-affecting change, show actual before and after images captured at the same viewport, state and time; identify the revisions and conditions in the background or solution. Images must correspond to the actual candidate and baseline, not mockups or historical evidence presented as current. If no valid comparison is available, mark it unverified, continue obtaining the evidence if possible, and do not claim an essential visual criterion passed. For changes without a screen, use plain text alone in the before/after sections. For sound or motion, link representative playable evidence in an existing section when relevant; still use the requested before/after image-or-text format. Avoid adding boilerplate where it does not help the decision.

Distinguish automated checks and AI inspection from the person's actual play, listening or acceptance. A review of a local artifact does not itself approve an external update, merge or release. Request the consolidated human review only after the complete candidate passes all applicable non-human acceptance checks and an end-to-end walkthrough. Human judgment, hands-on play and listening occur in that review and must not be pre-claimed. If a required check is blocked, report the blocker without claiming completion or requesting acceptance of an incomplete candidate. Follow-up review can be needed after changes. Preserve project authorization boundaries and do not invent intermediate approval gates.

## Parallel work

When this stage has independent work that can safely proceed in parallel and delegation is permitted and available, start subagents for those tasks. Assign non-overlapping file ownership or read-only scope; identify the candidate version and expected evidence. Integrate and check their actual outputs under the delegation rules in `issue-delivery`. Continue sequentially where dependencies require it or delegation is unavailable. Avoid duplicate tasks and recursive delegation with no independent work.
