// Display-only timing. The caller supplies the result already stored at admission.
export const SPECIAL_ROUTE_TIMINGS=Object.freeze({
 normal:Object.freeze({basic:Object.freeze({seconds:7,decisionAt:5.7}),direct:Object.freeze({seconds:4,decisionAt:2.8})}),
 rush:Object.freeze({basic:Object.freeze({seconds:5,decisionAt:3.8}),direct:Object.freeze({seconds:3,decisionAt:1.9})})
});
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-(1-clamp(x))**3;
export const BASIC_LOSS_PASS_SECONDS=.65;
// Unwrapped one-based digit coordinate. Increasing positions advance the digit
// 1→2→…→9→1 and move the current sprite DOWN; zero is a valid position (digit9).
export function specialReelStrip(position){
 if(!Number.isFinite(position))throw new RangeError('Finite reel position required');
 const value=position-1,index=Math.floor(value),fraction=value-index;
 return Array.from({length:3},(_,j)=>({digit:((index-j+1)%9+9)%9+1,y:(j-1+fraction)*50}));
}
export function specialRoutePose({route='basic',mode='normal',win=false,time=0,reducedEffects=false,premium=null,premiumAt=28,symbol=7}={}){
 if(!['basic','direct','battle'].includes(route))throw new RangeError('Unsupported special route');
 if(!['normal','rush'].includes(mode))throw new RangeError('Unsupported presentation mode');
 if(![null,'moon','sword'].includes(premium))throw new RangeError('Unsupported premium');
 if(!Number.isFinite(time)||!Number.isFinite(premiumAt))throw new RangeError('Finite presentation time required');
 if(route==='direct'&&!win)throw new RangeError('Direct route requires an existing winning record');
 if(!Number.isInteger(symbol)||symbol<1||symbol>9)throw new RangeError('Symbol must be 1–9');
 const timing=route==='battle'?null:SPECIAL_ROUTE_TIMINGS[mode][route];
 const age=timing?time-timing.decisionAt:-1,revealed=!!timing&&age>=0;
 // Identical pre-decision motion for a basic win/loss. Outcome is not encoded in
 // speed, near-miss position, banner or colour before the common reveal boundary.
 const reelProgress=timing?clamp(time/timing.decisionAt):0;
 const positions=[symbol,symbol,symbol],stopTimes=[0,0,0];
 if(timing){
  for(let i=0;i<3;i++){
   const stop=route==='basic'&&i!==1?0:timing.decisionAt-(route==='direct'?(2-i)*.13:0);
   stopTimes[i]=stop;
   if(time<stop){const remaining=stop-time;positions[i]=symbol-remaining*1.8-4.2*Math.max(0,remaining-.6);}
  }
 }
 // Continue through the target to its successor (including 9→1). Hermite interpolation
 // preserves the incoming 1.8-digit/s velocity and brakes to zero, rather
 // than replacing a centred texture at the result boundary.
 const passing=route==='basic'&&revealed&&!win&&age<BASIC_LOSS_PASS_SECONDS;
 if(route==='basic'&&revealed&&!win){
  const u=clamp(age/BASIC_LOSS_PASS_SECONDS),m=1.8*BASIC_LOSS_PASS_SECONDS;
  const progress=(-2*u**3+3*u**2)+(u**3-2*u**2+u)*m;
  positions[1]=symbol+progress;
 }
 const landingAge=age-(route==='basic'&&!win?BASIC_LOSS_PASS_SECONDS:0);
 const premiumAge=time-premiumAt,premiumEnabled=route==='battle'&&win&&premium!==null;
 const premiumVisible=premiumEnabled&&time>=premiumAt&&time<premiumAt+3.4;
 const formedAt=premium==='moon'?1.2:1.6;
 const formed=premiumVisible&&premiumAge>=formedAt;
 const premiumAlpha=premiumVisible?Math.min(ease(premiumAge/.35),clamp((3.4-premiumAge)/.6)):0;
 return {
  route,mode,visible:timing?time>=0&&time<timing.seconds:premiumVisible,
  seconds:timing?.seconds??null,decisionAt:timing?.decisionAt??null,
  finished:timing?time>=timing.seconds:premiumEnabled&&premiumAge>=3.4,
  phase:route==='battle'?(formed?'premium-confirmed':premiumVisible?'premium-forming':'inactive'):revealed?(win?'win':'loss'):route==='basic'&&time<1.6?'reach':'pursuit',
  revealed,result:revealed?(win?'win':'loss'):null,
  digits:revealed?[symbol,win?symbol:symbol%9+1,symbol]:[symbol,symbol,symbol],positions,
  stopped:timing?stopTimes.map((stop,i)=>revealed?!(i===1&&passing):time>=stop):[false,false,false],passing,
  banner:route==='basic'&&time>=0&&time<1.6,
  bannerAlpha:Math.min(1,clamp((1.6-time)/.25)),
  bannerScale:time<.12?1.22-.22*ease(time/.12):1,
  reelProgress,landing:revealed&&landingAge>=0?Math.sin(clamp(landingAge/.18)*Math.PI)*(reducedEffects?.025:.075):0,
  winGlow:revealed&&win?ease(age/.35):0,
  shake:revealed&&win&&!reducedEffects&&age<.2?Math.sin(age*100)*1.3*(1-age/.2):0,
  premium:premiumEnabled?premium:null,premiumAge,premiumVisible,premiumAlpha,formed,
  construction:premiumVisible?clamp(premiumAge/formedAt):0,
  orbit:reducedEffects?0:Math.max(0,premiumAge)*.18,
  sparkleCount:reducedEffects?0:12
 };
}
