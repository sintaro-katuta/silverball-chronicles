// Explicit game reconstruction policy. These timings/sensor geometry are NOT
// measured W values and must not be presented as exact hardware reproduction.
// Probability reference: https://pachi-e-tokyoghoul.jp/
// Four-branch/next-fuzu reconstruction cross-check:
// https://www.redesign777.tokyo/Topics/Details?category=1&id=20250201102557001&index=0
// https://pachinko-spec.info/spec-detail/154749/
export const W_RUNTIME_POLICY=Object.freeze({
 status:'public-odds-with-prototype-mechanics',
 fuzuHoldLimit:4,
 fuzuSeconds:.35,electricOpenSeconds:8,electricCountLimit:2,
 smallHitOpenSeconds:8,attackerOpenSeconds:15,attackerGapSeconds:.65,
 vSensor:'first-physical-admission-during-small-hit',
 nextGuaranteedFuzuRate:.03,
 normalEntryBasis:'public-rounded-four-branch-normalized-table',
});

// Secondary breakdown cross-checked against official 49/50/1 diagram.
// Rounded 1/199.9 combined stream, not exact ROM denominators.
export {wPublishedNormalOutcome} from './tokyoghoul-w-spec.js';
