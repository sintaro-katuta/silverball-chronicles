// Winning reach: announcement -> mechanical cover/retract -> center reel stop.
import {reachSchedule} from './reach-ending.js';
import {SPECIAL_ROUTE_TIMINGS} from './special-route-motion.js';
// The ornament and its SE share the pre-result presentation clock.
export const WIN_SEQUENCE=Object.freeze({
 normal:Object.freeze({reachSeconds:2.5,mechanismAt:.45,mechanismSeconds:1.9,bonusAt:5.8}),
 rush:Object.freeze({reachSeconds:2.5,mechanismAt:.45,mechanismSeconds:1.9,bonusAt:2.4})
});
export const winSequence=fromRush=>WIN_SEQUENCE[fromRush?'rush':'normal'];
export const DEVELOPMENT=Object.freeze({start:.45,converge:1,slash:1.8,returnAt:2.4,mechanismAt:2.4,seconds:4.8,lossHold:.7});
export const developsReach=(presentation,fromRush,override)=>!fromRush&&(typeof override==='boolean'?override:!!presentation.win||Number(presentation.drawId)%2===0);
export const isShortRoute=presentation=>presentation?.displayRoute==='basic'||presentation?.displayRoute==='direct';
export const reachSeconds=(presentation,fromRush)=>isShortRoute(presentation)?SPECIAL_ROUTE_TIMINGS[presentation.presentationMode??(fromRush?'rush':'normal')][presentation.displayRoute].seconds:presentation?.longReach?reachSchedule(presentation).seconds:!fromRush&&presentation?.developed?DEVELOPMENT.seconds:presentation?.win?winSequence(fromRush).reachSeconds:fromRush?.45:2;
// Short routes reveal the digits directly; do not cover their decision with a
// partly played 1.9-second ornament or squeeze in a five-second upper cue.
export const mechanismTime=game=>game.presentation?.basicReach&&game.presentation.win&&!isShortRoute(game.presentation)?game.presentation.time-(game.presentation.longReach?reachSchedule(game.presentation).decisionAt:!game.rush&&game.presentation.developed?DEVELOPMENT.mechanismAt:winSequence(!!game.rush).mechanismAt):-1;
export function developmentPose(presentation,fromRush=false){
 const t=presentation?.time??-1,visible=!!presentation?.developed&&!fromRush&&t>=DEVELOPMENT.start&&t<DEVELOPMENT.returnAt;
 const progress=Math.max(0,Math.min(1,(t-DEVELOPMENT.start)/(DEVELOPMENT.converge-DEVELOPMENT.start)));
 const slash=Math.max(0,Math.min(1,(t-DEVELOPMENT.slash)/.4));
 return {visible,progress,slash,stage:t<DEVELOPMENT.converge?'entry':t<DEVELOPMENT.slash?'gather':'slash',alpha:visible?Math.min(1,(t-DEVELOPMENT.start)/.12,(DEVELOPMENT.returnAt-t)/.18):0};
}
