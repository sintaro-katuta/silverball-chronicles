export const RUSH_ENTRY_DURATION=2.4;
export function rushEntryPose(age){
 const letters=Array.from({length:4},(_,i)=>{
  const t=age-.1-i*.16,impact=t-.1,fall=Math.max(0,Math.min(1,t/.1)),settle=Math.max(0,Math.min(1,impact/.09));
  return {visible:t>=0,y:impact<0?Math.round(-105*(1-fall*fall)):Math.round(-3*Math.sin(settle*Math.PI)),
   scaleX:impact>=0?1+.1*(1-settle):1,scaleY:impact>=0?1-.14*(1-settle):1,
   landed:impact>=0,impact,burst:impact>=0&&impact<.1?1-impact/.1:0};
 });
 const shineAge=age-.8;
 return {visible:age>=0&&age<RUSH_ENTRY_DURATION,age,letters,alpha:1-Math.max(0,Math.min(1,(age-2.05)/.35)),
  shineVisible:shineAge>=0&&shineAge<1.05,shine:Math.round(-30+shineAge*250)};
}
export function createRushEntryMotion(){
 let previous=null,started=-Infinity,lastTime=-Infinity;
 return {update(time,playingRush,initialAge=0){
  if(time<lastTime){previous=null;started=-Infinity;}
  if(previous===false&&playingRush)started=time-Math.max(0,initialAge);
  if(!playingRush)started=-Infinity;
  previous=!!playingRush;lastTime=time;
  return rushEntryPose(time-started);
 }};
}
