import {presentationRoll} from './presentation-distribution.js';

// Connect authored films to existing display windows. No outcome reads, no new
// time, and no film is restarted when the entrance caption changes to its title.
export function storyPredictionWindow(plan,age,{phase='reach',available=['step','memory','episode','pursuit','rescue']}={}){
 if(!plan||!Number.isFinite(age)||age<0)return null;
 let family=null,start=0,end=0;
 if(phase==='spin'){
  const cue=plan.beforeCue;
  if(!cue||!['step','story','identity'].includes(cue.family))return null;
  family=cue.family==='step'?'step':'memory';start=cue.start;end=cue.end;
 }else if(phase==='reach'){
  if(plan.development){
   end=plan.precursorSeconds;
   const before=plan.beforeCue?.family;
   if(plan.mode==='rush'&&before==='identity')family='memory';
   else if(plan.mode==='rush'&&before==='resolve')family='rescue';
   else if(plan.mode==='rush'&&['trail','search','pursuit'].includes(before))family='pursuit';
   else if(plan.battleFamily==='episode')family=presentationRoll(plan.drawId,plan.mode,86)<.5?'episode':'rescue';
   else if(before==='story')family='memory';
   else if(plan.development.family==='character')family='step';
   else if(plan.development.family==='long')family='pursuit';
  }else if(plan.basicPrelude){
   family=plan.basicPrelude.family==='character'?'step':'pursuit';start=plan.basicPrelude.start;end=plan.basicPrelude.end;
  }
 }else throw new RangeError('Unknown story phase');
 const duration=end-start;
 if(!family||!available.includes(family)||duration<1.2||age<start||age>=end)return null;
 return {family,time:age,start,duration,mode:plan.mode};
}
