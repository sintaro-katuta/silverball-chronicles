import {RUSH_ENTRY_DURATION} from './rush-entry-motion.js';

// Physical direction can already be right during a bonus. Announce RUSH entry
// as its own event instead of depending on a left-to-right direction change.
export function createRushDirectionGuide(){
 let wasRush=false,lastEntry,pending=false;
 return {update(game){
  const entered=!!game.rush&&!wasRush;
  wasRush=!!game.rush;
  if(entered)pending=true;
  if(!game.rush)pending=false;
  if(game.entryGuideAt!==undefined&&game.entryGuideAt!==lastEntry){
   lastEntry=game.entryGuideAt;
   pending=false;
   return {direction:'right',delay:Math.max(0,RUSH_ENTRY_DURATION-(game.entryTitleOffset||0))};
  }
  if(pending&&!game.jackpot&&!game.entryPrelude&&game.previewWinAt===undefined){
   pending=false;
   return {direction:'right',delay:RUSH_ENTRY_DURATION};
  }
  return null;
 }};
}
