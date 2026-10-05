import {holdPredictionCue} from './prediction-plan.js';
import {wPublishedNormalOutcome} from '../domain/w-runtime-policy.js';
import {TOKYOGHOUL_W} from '../domain/tokyoghoul-w-spec.js';

// Pure adapter for an already admitted record. No peek at future RNG calls;
// a charge is excluded from symbol predictions, and guaranteed followups stay
// outside the ordinary RUSH expectation population.
export function queuedHoldPrediction(record,game){
 if(!record||!game.isWMachine)return 'none';
 const mode=record.kind==='fuzu'?'rush':'normal';
 if(mode==='normal'){
  const outcome=wPublishedNormalOutcome(record.roll).outcome;
  if(outcome==='charge')return 'none';
  return holdPredictionCue({drawId:record.id,mode,win:outcome==='symbol'});
 }
 if(record.guaranteed)return 'none';
 return holdPredictionCue({drawId:record.id,mode,win:record.roll<1/(record.odds??TOKYOGHOUL_W.rush.odds)});
}
