// Cue reliability means P(existing winning presentation | this moon cue).
// Selection uses a separate deterministic presentation hash, never the game RNG.
export const MOON_PHASES=Object.freeze(['crescent','half','full']);
export const MOON_COLORS=Object.freeze(['none','green','blue','red']);
export const MOON_PHASE_LABELS=Object.freeze(['三日月','半月','満月']);
export const MOON_COLOR_LABELS=Object.freeze(['無色','緑','青','赤']);
export const MOON_EXPECTATIONS=Object.freeze([[6,11,23],[8,19,31],[14,28,39],[26,38,54]].map(row=>Object.freeze(row)));
const ordered=MOON_EXPECTATIONS.flat().slice().sort((a,b)=>a-b);
export const MOON_CUES=Object.freeze(MOON_COLORS.flatMap((color,c)=>MOON_PHASES.map((phase,p)=>Object.freeze({phase,color,expectation:MOON_EXPECTATIONS[c][p],rank:ordered.indexOf(MOON_EXPECTATIONS[c][p])}))));
// Equal cue shares on winning reaches, with calibrated loss shares. A non-cue
// branch absorbs the remaining reaches so low base odds remain unchanged.
export function moonCueDistribution(baseWinProbability,lossReachRate){
 if(!Number.isFinite(baseWinProbability)||baseWinProbability<0||baseWinProbability>1||!Number.isFinite(lossReachRate)||lossReachRate<0||lossReachRate>1)throw new RangeError('Valid draw and losing-reach probabilities required');
 const reachMass=baseWinProbability+(1-baseWinProbability)*lossReachRate;
 const q=reachMass?baseWinProbability/reachMass:0;
 if(q===0||q===1)return {reachWinProbability:q,win:MOON_CUES.map(()=>0),loss:MOON_CUES.map(()=>0),winNone:1,lossNone:1};
 const odds=q/(1-q),ratios=MOON_CUES.map(c=>(1-c.expectation/100)/(c.expectation/100));
 const coverage=Math.min(1,1/(odds*ratios.reduce((a,b)=>a+b,0)/12));
 const win=MOON_CUES.map(()=>coverage/12),loss=ratios.map(r=>coverage/12*odds*r);
 return {reachWinProbability:q,win,loss,winNone:Math.max(0,1-win.reduce((a,b)=>a+b,0)),lossNone:Math.max(0,1-loss.reduce((a,b)=>a+b,0))};
}
export function moonPresentationRoll(drawId,mode='normal'){
 let h=Math.imul((Number(drawId)||0)^(mode==='rush'?0x3a754bc1:0x74c129ab),0x45d9f3b);h=Math.imul(h^(h>>>16),0x45d9f3b);h^=h>>>16;return(h>>>0)/4294967296;
}
export function assignMoonCue({win,reach,drawId,mode,baseWinProbability,lossReachRate,roll=moonPresentationRoll(drawId,mode)}){
 if(!reach)return null;
 const d=moonCueDistribution(baseWinProbability,lossReachRate),weights=win?d.win:d.loss;
 let r=roll;for(let i=0;i<weights.length;i++){r-=weights[i];if(r<0)return MOON_CUES[i];}return null;
}
const neutral=()=>({phase:'crescent',color:'none',rank:0,expectation:null,cueActive:false});
export function createMoonCueController(){
 let cue=neutral(),id=null;
 return {render(game,blade){
  const record=game.spinResult??game.presentation;
  const key=record?(record.drawId??`reach-${record.id}`):null;
  if(key!==null&&key!==id){id=key;cue=neutral();}
  const source=record?.moonCue??game.moonCueReview;
  if(source&&MOON_PHASES.includes(source.phase)&&MOON_COLORS.includes(source.color)){const definition=MOON_CUES.find(c=>c.phase===source.phase&&c.color===source.color);cue={...definition,cueActive:true};}
  const active=!!record||game.previewWinAt!==undefined&&game.time-game.previewWinAt<2.4||!!game.moonCueReview;
  const displayed=active?cue:neutral();
  const strike=['slash','impact','hold','return'].includes(blade.phase);
  // Post-result red is the sword's impact effect, not a new predictive cue.
  return {...displayed,color:strike?'red':displayed.color,strike,expectation:strike?null:displayed.expectation,reliabilityAssigned:true};
 }};
}
