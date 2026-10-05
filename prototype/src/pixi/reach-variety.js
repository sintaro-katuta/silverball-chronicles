export const REACH_VARIANTS=Object.freeze(['pressure','initiative','exchange']);
export const REACH_VARIANT_NAMES=Object.freeze({pressure:'溜めて放つ一閃',initiative:'先手からの逆転劇',exchange:'互角の斬り合い'});

// Presentation-only shuffle bags. No lottery RNG, win, moon cue, or payout is
// an input. Separate normal/RUSH histories prevent one mode exhausting the other.
export function createReachVariety(){
 const modes=new Map();
 return {choose(drawId,mode='normal'){
  let state=modes.get(mode);
  if(!state){state={bag:[],last:null,id:null,cycle:0};modes.set(mode,state);}
  if(state.id===drawId)return state.last;
  if(!state.bag.length){
   let seed=((Number(drawId)||1)^(mode==='rush'?0x31f726a5:0x7ab46319)^Math.imul(++state.cycle,0x45d9f3b))>>>0;
   const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
   state.bag=[...REACH_VARIANTS];
   for(let i=state.bag.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[state.bag[i],state.bag[j]]=[state.bag[j],state.bag[i]];}
   if(state.bag[0]===state.last)[state.bag[0],state.bag[1]]=[state.bag[1],state.bag[0]];
  }
  state.last=state.bag.shift();state.id=drawId;return state.last;
 }};
}
