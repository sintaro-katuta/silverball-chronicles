import {WIN_SEQUENCE} from './win-sequence.js';
export const RUSH_WIN_SECONDS=WIN_SEQUENCE.rush.bonusAt;
export const RUSH_REACH_SECONDS=.45;
const clamp=x=>Math.max(0,Math.min(1,x));
export function rushWinPose(time){
 const rise=clamp((time-.09)/.15),settle=clamp((time-.24)/.3),release=clamp((time-1.8)/.35);
 const scale=time<.24?1+.68*(1-(1-rise)**3):1.08+.6*(1-settle)**3-.08*release;
 const shakeAge=time-.24,shake=shakeAge>=0&&shakeAge<.2?[3,-3,2,-1,0][Math.min(4,Math.floor(shakeAge/.04))]:0;
 const burst=clamp((time-.16)/.85);
 return {visible:time>=0&&time<RUSH_WIN_SECONDS,offset:0,scale,shake,
  darkAlpha:time<.09?.9:time<.55?.9-.5*clamp((time-.09)/.46):.4*(1-release),
  slashAlpha:time>=.16&&time<.38?Math.sin((time-.16)/.22*Math.PI):0,
  sparkAlpha:time>=.16&&time<1.01?(1-burst)**.6:0,burst,
  shine:clamp((time-.52)/.65),shineAlpha:time>=.52&&time<1.17?1:0};
}
