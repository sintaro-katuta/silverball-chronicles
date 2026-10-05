// Pure presentation allocation. Never reads a game, admits balls, or rolls a hit.
import {MOON_CUES} from './moon-cue.js';

const VARIANTS=['exchange','initiative','pressure'];
const SHARES=[.4,.35,.25];
const TARGETS={normal:[.05,.2,.5],rush:[.2,.5,.8]};
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const oddsFor=r=>(1-r)/r;
const freeze=values=>Object.freeze(values);
function probability(value,name){if(!Number.isFinite(value)||value<0||value>1)throw new RangeError(`${name} must be a probability`);}

/** All win/loss arrays are conditional on the already recorded outcome.
 * Losing-reach rate includes basic and battle, and excludes ordinary misses.
 * No assumption that all winning presentations remain 54-second battles.
 */
export function presentationDistribution({mode='normal',baseWinProbability,lossReachRate=.055}){
 if(!Object.hasOwn(TARGETS,mode))throw new RangeError('mode must be normal or rush');
 probability(baseWinProbability,'baseWinProbability');probability(lossReachRate,'lossReachRate');
 if(baseWinProbability===0||baseWinProbability===1)throw new RangeError('Reliability allocation requires a prior strictly between zero and one');
 const p=baseWinProbability,k=p/(1-p),targets=TARGETS[mode];
 const direct=.1,flash=mode==='rush'?.1:0;
 const battleLossFactor=sum(SHARES.map((w,i)=>w*oddsFor(targets[i])));
 // RUSH basic reaches target 10%; normal basic wins remain rare and absorb
 // leftover losing reaches (their derived reliability must stay below 1%).
 const basic=mode==='rush'?(lossReachRate/k-(1-direct-flash)*battleLossFactor)/(9-battleLossFactor):.05;
 const battle=1-direct-flash-basic;
 if(basic<=0||battle<=0)throw new RangeError('Prior/reach rate cannot support the adopted route shares and targets');
 const battleWin=SHARES.map(w=>battle*w);
 const battleLoss=battleWin.map((w,i)=>k*w*oddsFor(targets[i]));
 const basicLoss=lossReachRate-sum(battleLoss);
 if(basicLoss<=0)throw new RangeError('Insufficient losing reaches for the adopted battle targets');
 const basicReliability=p*basic/(p*basic+(1-p)*basicLoss);
 if(mode==='normal'&&basicReliability>=.01)throw new RangeError('Normal basic-reach reliability would exceed the under-1% target');
 const win=freeze([basic,...battleWin,direct,flash,0]);
 const loss=freeze([basicLoss,...battleLoss,0,0,1-lossReachRate]);
 // Moon cues occur only on battle or flash. Compute actual eligible masses,
 // rather than using the old all-wins/all-reaches prior and hiding cues later.
 const eligibleWin=battle+flash,eligibleLoss=sum(battleLoss);
 const cueOdds=k*eligibleWin/eligibleLoss;
 const ratios=MOON_CUES.map(c=>oddsFor(c.expectation/100));
 const coverage=Math.min(1,1/(cueOdds*sum(ratios)/12));
 const moonWin=freeze(MOON_CUES.map(()=>coverage/12));
 const moonLoss=freeze(ratios.map(r=>coverage/12*cueOdds*r));
 const premiumWinShare=.02,revivalWinShare=mode==='normal'?.08:0;
 if(battle<premiumWinShare+revivalWinShare)throw new RangeError('Insufficient battle wins for premium/revival quotas');
 return freeze({mode,baseWinProbability:p,lossReachRate,win,loss,
  keys:freeze(['basic',...VARIANTS,'direct','flash','ordinary']),
  targets:freeze([...targets]),basicReliability,battleWin:freeze(battleWin),battleLoss:freeze(battleLoss),
  eligibleWin,eligibleLoss,moon:freeze({win:moonWin,loss:moonLoss,winNone:1-sum(moonWin),lossNone:Math.max(0,1-sum(moonLoss)),coverage}),
  premiumProbability:premiumWinShare/battle,revivalProbability:revivalWinShare/(battle-premiumWinShare),
  premiumWinShare,revivalWinShare});
}

// Domain-separated, presentation-only hashes. Input IDs must be stable and not
// chosen using the winning roll; no mutable seed and no gameplay RNG callback.
export function presentationRoll(drawId,mode,channel){
 if(!Number.isSafeInteger(drawId)||drawId<0)throw new RangeError('drawId must be a nonnegative safe integer');
 let h=(drawId>>>0)^Math.imul(Math.floor(drawId/4294967296),0x9e3779b1)^Math.imul(channel+1,0x85ebca6b)^(mode==='rush'?0xc2b2ae35:0x27d4eb2f);
 h=Math.imul(h^(h>>>16),0x7feb352d);h=Math.imul(h^(h>>>15),0x846ca68b);return((h^(h>>>16))>>>0)/4294967296;
}
function pick(weights,roll){let value=roll;for(let i=0;i<weights.length;i++){value-=weights[i];if(value<0)return i;}return -1;}

/** Safe integration point: invoke once for each admitted non-charge record,
 * before the old reach-only flow branch. Repeated calls give identical results.
 * The caller alone owns the recorded win and result/payout processing.
 */
export function selectPresentation({win,drawId,mode='normal',distribution,...options}){
 if(typeof win!=='boolean')throw new TypeError('win must be the recorded boolean result');
 const d=distribution??presentationDistribution({mode,...options});
 if(d.mode!==mode)throw new RangeError('Distribution mode mismatch');
 const index=pick(win?d.win:d.loss,presentationRoll(drawId,mode,0));
 if(index<0)throw new RangeError('Invalid distribution');
 const key=d.keys[index],isBattle=VARIANTS.includes(key);
 const route=isBattle?'battle':key;
 let ending=route==='flash'?'flash':'standard',premium=null;
 if(win&&isBattle){
  const r=presentationRoll(drawId,mode,1);
  if(r<d.premiumProbability)premium=r<d.premiumProbability/2?'moon':'sword';
  else if(mode==='normal'&&presentationRoll(drawId,mode,2)<d.revivalProbability)ending='revival';
 }
 const eligible=isBattle||route==='flash';
 const moonIndex=eligible?pick(win?d.moon.win:d.moon.loss,presentationRoll(drawId,mode,3)):-1;
 return freeze({route,reach:route==='basic'||isBattle||route==='flash',variant:isBattle?key:null,ending,premium,
  moonCue:moonIndex<0?null:MOON_CUES[moonIndex]});
}

/** Half-circle coupling: stationary weights are preserved, with the smallest
 * possible self-transition mass. No-repeat is impossible if a weight > .5.
 * The symmetric joint matrix proves detailed balance without empirical fitting.
 */
export function battleAntiRepeatKernel(probabilities){
 if(!Array.isArray(probabilities)||probabilities.length!==3||probabilities.some(w=>!Number.isFinite(w)||w<=0))throw new RangeError('Three positive battle weights required');
 const total=sum(probabilities),weights=probabilities.map(w=>w/total),starts=[0,weights[0],weights[0]+weights[1]];
 const overlap=(a,b,c,d)=>Math.max(0,Math.min(b,d)-Math.max(a,c));
 const transition=weights.map((w,i)=>freeze(weights.map((v,j)=>(overlap(starts[i],starts[i]+w,starts[j]-.5,starts[j]+v-.5)+overlap(starts[i],starts[i]+w,starts[j]+.5,starts[j]+v+.5))/w)));
 return freeze({weights:freeze(weights),starts:freeze(starts),transition:freeze(transition),repeatProbability:sum(weights.map(w=>Math.max(0,2*w-1)))});
}

/** Opt-in stateful alternative. Separate conditional win/loss histories retain
 * their own stationary marginals even when predetermined outcomes interleave.
 * Decisions, not game state, are cached. IDs must increase per mode; cached IDs
 * are idempotent, retired IDs fail instead of advancing the chain a second time.
 */
export function createPresentationSelector({cacheLimit=64}={}){
 if(!Number.isSafeInteger(cacheLimit)||cacheLimit<1)throw new RangeError('cacheLimit must be a positive integer');
 const modes=new Map();
 return {select(input){
  const {mode='normal',win,drawId}=input;
  if(typeof win!=='boolean')throw new TypeError('win must be the recorded boolean result');
  const d=input.distribution??presentationDistribution({...input,mode});
  if(d.mode!==mode)throw new RangeError('Distribution mode mismatch');
  presentationRoll(drawId,mode,4); // Validate IDs even on cache hits.
  const signature=`${d.baseWinProbability}:${d.lossReachRate}`;
  let state=modes.get(mode);
  if(!state){state={signature,lastId:-1,cache:new Map(),previous:[null,null],kernels:[battleAntiRepeatKernel(d.battleLoss),battleAntiRepeatKernel(d.battleWin)]};modes.set(mode,state);}
  if(state.signature!==signature)throw new RangeError('Distribution changed: explicitly reset the mode before starting a new history');
  const cached=state.cache.get(drawId);
  if(cached){if(cached.win!==win)throw new RangeError('Recorded outcome changed for an existing drawId');return cached.plan;}
  if(drawId<=state.lastId)throw new RangeError('Retired or out-of-order drawId: use the previously stored presentation plan');
  let plan=selectPresentation({...input,distribution:d});
  if(plan.route==='battle'){
   const lane=win?1:0,kernel=state.kernels[lane],previous=state.previous[lane];
   let next=VARIANTS.indexOf(plan.variant);
   if(previous!==null){
    const u=kernel.starts[previous]+kernel.weights[previous]*presentationRoll(drawId,mode,4);
    next=pick(kernel.weights,(u+.5)%1);
   }
   state.previous[lane]=next;plan=freeze({...plan,variant:VARIANTS[next]});
  }
  state.lastId=drawId;state.cache.set(drawId,{win,plan});
  if(state.cache.size>cacheLimit)state.cache.delete(state.cache.keys().next().value);
  return plan;
 },reset(mode){
  if(mode===undefined)modes.clear();else if(mode==='normal'||mode==='rush')modes.delete(mode);else throw new RangeError('mode must be normal or rush');
 }};
}
