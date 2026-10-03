// Presentation metadata only. Cue reliability assignment awaits the user's percentages.
// No game RNG is consumed and draw outcomes are never changed here.
export const MOON_PHASES=Object.freeze(['crescent','half','full']);
export const MOON_COLORS=Object.freeze(['none','green','blue','red']);
export const MOON_PHASE_LABELS=Object.freeze(['三日月','半月','満月']);
export const MOON_COLOR_LABELS=Object.freeze(['無色','緑','青','赤']);
// Color has priority: crescent/red outranks full/blue.
export const MOON_CUES=Object.freeze(MOON_COLORS.flatMap((color,c)=>MOON_PHASES.map((phase,p)=>Object.freeze({phase,color,rank:c*3+p}))));
export const MOON_EXPECTATIONS=null;
const neutral=()=>({phase:'crescent',color:'none',rank:0});
export function createMoonCueController(){
 let cue=neutral(),id=null;
 return {render(game,blade){
  const record=game.spinResult??game.presentation;
  const key=record?(record.drawId??`reach-${record.id}`):null;
  if(key!==null&&key!==id){id=key;cue=neutral();}
  const source=record?.moonCue??game.moonCueReview;
  if(source&&MOON_PHASES.includes(source.phase)&&MOON_COLORS.includes(source.color))cue={phase:source.phase,color:source.color,rank:MOON_COLORS.indexOf(source.color)*3+MOON_PHASES.indexOf(source.phase)};
  const active=!!record||game.previewWinAt!==undefined&&game.time-game.previewWinAt<2.4||!!game.moonCueReview;
  const displayed=active?cue:neutral();
  const strike=['slash','impact','hold','return'].includes(blade.phase);
  return {...displayed,color:strike?'red':displayed.color,strike,reliabilityAssigned:MOON_EXPECTATIONS!==null};
 }};
}
