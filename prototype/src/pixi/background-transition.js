// Presentation-only transition, driven by the paused game clock.
export function createBackgroundTransition(duration=.8){
 let target=null,from=0,mix=0,started=0,lastTime=-Infinity;
 function value(time){const t=Math.max(0,Math.min(1,(time-started)/duration));return from+((target?1:0)-from)*t*t*(3-2*t);}
 return {update(time,rush){
  rush=Boolean(rush);
  if(target===null||time<lastTime){target=rush;from=mix=rush?1:0;started=time;}
  else {mix=value(time);if(rush!==target){from=mix;target=rush;started=time;}}
  lastTime=time;return mix;
 }};
}
