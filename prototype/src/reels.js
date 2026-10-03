import {timeline,reachBeat} from './cinematic.js';
export function reelState(game){
 const p=timeline(game),beat=p?reachBeat(p):null;
 const rolling=[11,13,17].map(rate=>Math.floor(game.time*rate)%9+1);
 if(game.jackpot)return {spinning:false,numbers:game.jackpot.charge?[1,3,5]:[7,7,7],stopped:[true,true,true]};
 if(p){
  // Revival's apparent failure is a presentation-only near miss. The stored
  // winning reelOutcome must not be exposed before the comeback resolves.
  if(beat.id==='silence')return {spinning:false,numbers:[7,7,6],stopped:[true,true,true]};
  const settled=beat.id==='resolve';
  return {spinning:!settled,numbers:settled?(p.win&&beat.id==='resolve'?[7,7,7]:game.reelOutcome):[7,7,rolling[2]],stopped:[true,true,settled]};
 }
 if(game.spinActive){
  const gap=game.reelStopGap;
  const stopped=[0,1,2].map(i=>game.drawTimer>=game.drawTempo+gap*i);
  const target=game.spinResult?.reels??game.stoppedReels;
  return {spinning:stopped.some(v=>!v),numbers:rolling.map((n,i)=>stopped[i]?target[i]:n),stopped};
 }
 return {spinning:false,numbers:game.stoppedReels,stopped:[true,true,true]};
}
