import {RUSH_PAYOUT_DISTRIBUTION,perSpinProbability} from './payout-distribution.js';
// Fictional prototype specifications. Values are tuning defaults, not a claim
// that every real machine uses these prizes, counts, or opening times.
import {RED_RATE} from './cinematic.js';
const editions = [
 {name:'月影機関',subtitle:'第一幕 ── 蒼月の起動',color:'#78dcf3',odds:199,pityLimit:1990,scale:1,tempo:2.2,description:'蒼い月が照らす機械都市。すべてはここから始まる。'},
 {name:'紅蓮境界',subtitle:'第二幕 ── 炎の記憶',color:'#fb866c',odds:229,pityLimit:2290,scale:2.5,tempo:0.7,description:'短い変動と鋭い閃光。大きな出玉を追う高速の戦場。'},
 {name:'白夜終章',subtitle:'第三幕 ── 星を継ぐ者',color:'#e2c786',odds:259,pityLimit:2590,scale:6,tempo:3.8,description:'最後の月が昇る。静かな予兆の先に、最大の試練。'}
];
export const MACHINE_SPECS = editions.map((course,index)=>({
 id:`fiction-${index}`,status:'prototype',course,
 normal:{odds:course.odds,rounds:[4,6,10],weights:[45,35,20]},
 prizes:{normal:4,start:2,rush:1,bonus:15},
 reels:{stopGap:.55},
 attacker:{countLimit:10,openSeconds:15,gapSeconds:.65},
 rightDraw:{odds:index===0?1/perSpinProbability(.66,100):66,spins:100,tempo:.35,stopGap:.18,weights:index===0?[30,50,20]:[20,30,50],payouts:index===0?RUSH_PAYOUT_DISTRIBUTION:null,holdLimit:5},
 rushEntry:{fourRoundRate:.5},
 roundReveal:{initial:4,earlyTenRate:.2,atCount:7,atSeconds:12},
 presentation:{lossReachRate:.055,redGivenWin:RED_RATE.win,redGivenLossReach:RED_RATE.loss},
 gameRules:{holdLimit:5,pityLimit:course.pityLimit,payoutScale:course.scale,
  pityMode:'normal-only',rushBoundary:'reserved-spins-no-extra-holds'}
}));
export const COURSES=MACHINE_SPECS.map(spec=>({...spec.course}));
export function runtimeMachine(course,index,rules){
 const spec=MACHINE_SPECS[index];
 return {...spec,normal:{...spec.normal,odds:course.odds,weights:[...rules.weights]},
  ...spec.attacker,holdLimit:spec.gameRules.holdLimit,
  rightDraw:{...spec.rightDraw,payouts:spec.rightDraw.payouts?.map((p,i)=>({...p,weight:(rules.rushWeights??spec.rightDraw.weights)[i]}))??null,odds:rules.rushOdds??spec.rightDraw.odds,spins:rules.rushSpins??spec.rightDraw.spins,tempo:rules.rushTempo??spec.rightDraw.tempo,weights:[...(rules.rushWeights??spec.rightDraw.weights)]},
  rushEntry:{fourRoundRate:rules.rushEntryRate??spec.rushEntry.fourRoundRate},
  gameRules:{...spec.gameRules,pityLimit:rules.pityLimit,payoutScale:course.scale}};
}
// Frequency, conditional reliability and share of jackpots are distinct.
// These figures exclude the game pity/skills and describe presentation sampling.
export function presentationMetrics(machine){
 const win=1/machine.normal.odds,p=machine.presentation;
 const redWin=win*p.redGivenWin,redLoss=(1-win)*p.lossReachRate*p.redGivenLossReach;
 return {redFrequency:redWin+redLoss,redReliability:redWin/(redWin+redLoss),
  redJackpotShare:p.redGivenWin,lossReachRate:p.lossReachRate};
}
