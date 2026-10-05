// Published specification, not measured internal ROM probabilities or timings.
// W (2025) only; never mix MW / 超デカ超一撃 or the pachislot model.
export const W_SOURCE = 'https://pachi-e-tokyoghoul.jp/';
export const TOKYOGHOUL_W = Object.freeze({
  model: 'e東京喰種W',
  normal: Object.freeze({symbolOdds:399.9, chargeOdds:399.9, chargePayout:300, symbolPayout:1500}),
  rush: Object.freeze({drawKind:'fuzu', odds:95.3, draws:130}),
  holds: Object.freeze({tokuzu1:4, tokuzu2:1, fuzu:null}),
  prizes: Object.freeze({start:1, electric:1, ordinary:5, fuzu:1, attacker:15}),
  attacker: Object.freeze({countLimit:10, openSeconds:null, gapSeconds:null}),
  // 51% is a published total including charge entry, NOT the probability
  // to apply to every event in the combined ~1/199.9 normal hit stream.
  publishedEntryRate: .51,
  publishedRushAwards: Object.freeze([
    Object.freeze({payout:3000, share:.97}),
    Object.freeze({payout:6000, share:.03}),
  ]),
  unresolved: Object.freeze(['normal-entry-conditional-table','fuzu-hold-limit',
    'electric-opening-pattern','attacker-timing','v-routing','6000-plus-alpha']),
});

// Public-rounded reconstruction, not an exact internal ROM table.
// Equal symbol/charge masses; 50% symbol entry plus 1% charge entry.
// Shares describe the combined normal hit stream, not the published 51% basis.
export const W_NORMAL_MODEL=Object.freeze({
  combinedOdds:1/(1/TOKYOGHOUL_W.normal.symbolOdds+1/TOKYOGHOUL_W.normal.chargeOdds),
  branches:Object.freeze([
    Object.freeze({outcome:'symbol',entry:true,share:.25}),
    Object.freeze({outcome:'charge',entry:true,share:.005}),
    Object.freeze({outcome:'symbol',entry:false,share:.25}),
    Object.freeze({outcome:'charge',entry:false,share:.495}),
  ]),
});
export function wPublishedNormalOutcome(roll){
  const hit=1/W_NORMAL_MODEL.combinedOdds;
  if(roll>=hit)return {outcome:'miss',entry:false};
  const r=roll/hit;let end=0;
  for(const branch of W_NORMAL_MODEL.branches){end+=branch.share;if(r<end)return {outcome:branch.outcome,entry:branch.entry};}
  return {outcome:'charge',entry:false};
}
export function wNormalSymbolProbability(){
  return W_NORMAL_MODEL.branches.filter(b=>b.outcome==='symbol').reduce((n,b)=>n+b.share,0)/W_NORMAL_MODEL.combinedOdds;
}
// Cues describe a symbol win / successful fuzu, before electric and V entry.
export function wPresentationWinProbability(kind,rushOdds=TOKYOGHOUL_W.rush.odds){
  return kind==='fuzu'?1/rushOdds:wNormalSymbolProbability();
}

// Public rounded odds give an approximation, not an exact internal probability.
export function wRushHitProbability(draws=TOKYOGHOUL_W.rush.draws) {
  if(!Number.isInteger(draws)||draws<0)throw new RangeError('Nonnegative integer draws required');
  return -Math.expm1(draws*Math.log1p(-1/TOKYOGHOUL_W.rush.odds));
}

// Keep individual bonuses separate. 3000 is two 10R bonuses, never one 20R.
// This describes the announced base award, not an automatic grant or +alpha.
export function wBonusSequence(payout) {
  if(![300,1500,3000,6000].includes(payout))throw new RangeError('Unsupported W base award');
  const awards=payout===300?[300]:Array(payout/1500).fill(1500);
  return awards.map(amount=>Object.freeze({rounds:amount/150, countLimit:10,
    awardPerBall:15, maxPayout:amount}));
}
