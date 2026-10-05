export const REACH_ENDINGS=Object.freeze({
 standard:Object.freeze({seconds:54,decisionAt:51.7,attentionAt:17,upperAt:19,upperEnd:24}),
 revival:Object.freeze({seconds:58,decisionAt:55.7,attentionAt:17,upperAt:19,upperEnd:24}),
 flash:Object.freeze({seconds:12,decisionAt:9.7,attentionAt:2,upperAt:4,upperEnd:9})
});
export const reachSchedule=presentation=>REACH_ENDINGS[presentation?.reachEnding]??REACH_ENDINGS.standard;

// Eligible winning records only. Three ordinary endings and one special ending
// per shuffled bag; this is a presentation mix, never a new hit/entry lottery.
export function createReachEndingSelector(){
 const histories=new Map();
 return {choose(drawId,mode,win){
  if(!win)return 'standard';
  let state=histories.get(mode);
  if(!state){state={bag:[],id:null,last:null,cycle:0};histories.set(mode,state);}
  if(state.id===drawId)return state.last;
  const special=mode==='rush'?'flash':'revival';
  if(!state.bag.length){
   let seed=((Number(drawId)||1)^Math.imul(++state.cycle,0x74c129ab))>>>0;
   state.bag=['standard','standard','standard',special];
   for(let i=3;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=Math.floor(seed/4294967296*(i+1));[state.bag[i],state.bag[j]]=[state.bag[j],state.bag[i]];}
   if(state.last===special&&state.bag[0]===special)[state.bag[0],state.bag[1]]=[state.bag[1],state.bag[0]];
  }
  state.id=drawId;return state.last=state.bag.shift();
 }};
}
