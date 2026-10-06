import {REACH_CUTS,REACH_SCRIPTS,FLASH_CUTS,FLASH_STRIKES,REVIVAL_STRIKES} from '../long-reach-timeline.js';
import {reachSchedule} from '../reach-ending.js';
import {SPECIAL_ROUTE_TIMINGS} from '../special-route-motion.js';
import {queuedHoldPrediction} from '../hold-prediction.js';
import {REVIVAL_ENTRY} from '../revival-entry-motion.js';
import {entryTitleAt} from '../entry-title-schedule.js';

const cue=(at,name,id=name)=>({at,name,id});
export function reachAudioCues(p,{pushAvailable=false}={}){
 const plan=p.predictionPlan,schedule=reachSchedule(p),short=SPECIAL_ROUTE_TIMINGS[p.presentationMode??'normal']?.[p.displayRoute];
 const cues=[cue(0,p.displayRoute==='direct'?'spin':'reach')];
 if(plan?.development){cues.push(cue(.12,plan.development.family,'precursor'),cue(plan.precursorSeconds*.58,'development'));}
 if(plan?.basicPrelude)cues.push(cue(plan.basicPrelude.start,plan.basicPrelude.family,'precursor'));
 for(const c of plan?.chanceUps??[])cues.push(cue(c.start,'chance'+c.family[0].toUpperCase()+c.family.slice(1),'chance:'+c.start));
 if(short){cues.push(cue(short.decisionAt,p.win?'win':'loss','decision'));return cues;}
 if(!p.longReach){cues.push(cue(p.win?.45:1.8,p.win?'win':'loss','decision'));return cues;}
 if(p.reachEnding==='flash'){
  for(const c of FLASH_CUTS)if(!['reach','decision'].includes(c.id))cues.push(cue(c.at,c.id));
  for(const s of FLASH_STRIKES)cues.push(cue(s.at,'decisiveHit','strike:'+s.id));
  if(p.moonCue)cues.push(cue(schedule.attentionAt,'attention'),cue(schedule.upperAt,'upperSword'),cue(schedule.upperAt+.5,'moon'));
 }else{
  const script=REACH_SCRIPTS[p.reachVariant]??REACH_SCRIPTS.pressure;
  for(const c of script.cuts??REACH_CUTS){
   if(['reach','decision'].includes(c.id))continue;
   if(c.id==='silence'){cues.push(cue(c.at,'silence'));continue;}
   if(['attention','upper'].includes(c.id)&&!p.moonCue)continue;
   cues.push(cue(c.at,c.id==='upper'?'upperSword':c.id));
   if(c.id==='upper')cues.push(cue(c.at+.5,'moon'));
  }
  const strikes=(p.reachVariant??'pressure')!=='pressure'&&(p.reachEnding==='revival'||!p.win)?[...script.strikes,...(p.reachEnding==='revival'?REVIVAL_STRIKES:REVIVAL_STRIKES.slice(0,1))]:script.strikes;
  for(const s of strikes)cues.push(cue(s.at,s.dodge?'dodge':s.decisive?'decisiveHit':s.side==='hero'?'heroHit':'enemyHit','strike:'+s.id));
  if((p.reachVariant??'pressure')==='pressure')cues.push(cue(49.65,'silence','releaseSilence'));
  // Same apparent defeat for loss and revival; no confirmed motif until comeback.
  if(p.reachEnding==='revival')cues.push(cue(51.7,'loss','apparentLoss'),cue(53.3,'silence','revivalSilence'),cue(54,'revival'));
  if(pushAvailable&&!p.premium&&plan?.resultFamily!=='fullrotation')cues.push(cue(46.5,'pushPrompt'));
 }
 if(p.premium)cues.push(cue(p.premiumAt??45.5,plan?.resultFamily==='fullrotation'?'fullrotation':p.premium==='sword'?'premiumSword':'premiumMoon'));
 cues.push(cue(schedule.decisionAt,p.win?(p.presentationMode==='rush'?'rushWin':'win'):'loss','decision'));
 return cues.sort((a,b)=>a.at-b.at);
}
// A scope is a presentation object or immutable admission id. Muting, pause and
// late frames consume boundaries, preventing replay/backlogs on resume or seek.
export function createCueTracker(emit,stop){
 let scope=null,seen=new Set(),oldDraw=null,oldHolds=new Map(),oldRush=null,oldRemaining=null,oldRound=null,oldPrelude=null,oldGuide=null,oldWin=null,oldPush=null,pendingConfirmation=false,oldResolved=null,preludeSeen=new Set();
 const once=(id,name,allowed)=>{if(seen.has(id))return;seen.add(id);if(allowed){if(name==='silence')stop();else emit(name);}};
 return {
  reset(){scope=null;seen.clear();oldDraw=oldRush=oldRemaining=oldRound=oldPrelude=oldGuide=oldWin=oldPush=oldResolved=null;oldHolds.clear();preludeSeen.clear();pendingConfirmation=false;stop();},
  sync(g,{paused=false,enabled=true,rounds=null,pushAvailable=false}={}){
   if(!g)return;const allowed=enabled&&!paused;if(!allowed)stop();
   const current=g.presentation??g.spinResult?.drawId??null;
   if(scope!==current){scope=current;seen=new Set();if(current!==null)pendingConfirmation=false;}
   const timed=(list,t)=>{for(const c of list)if(t>=c.at)once(c.id,c.name,allowed&&t-c.at<.24);};
   if(g.spinActive&&g.spinResult){
    const id=g.spinResult.drawId;if(id!==oldDraw){if(allowed)emit('spin');oldDraw=id;}
    const b=g.spinResult.predictionPlan?.beforeCue;
    if(b){const steps=b.steps?.length??1;timed(Array.from({length:steps},(_,i)=>cue(b.start+(b.end-b.start)*i/steps,b.family,'before:'+i)),g.drawTimer);}
    timed([cue(g.drawTempo,'stopLeft'),cue(g.drawTempo+g.reelStopGap,'stopRight')],g.drawTimer);
   }
   const holds=g.acceptedDraws??[],nextHolds=new Map();
   for(const record of holds){const tier=queuedHoldPrediction(record,g);nextHolds.set(record.id,tier);
    if(tier!=='none'&&oldHolds.get(record.id)!==tier&&allowed)emit('hold'+tier[0].toUpperCase()+tier.slice(1));
   }oldHolds=nextHolds;
   const p=g.presentation;
   if(p){const cues=reachAudioCues(p,{pushAvailable});timed(cues,p.time);if(p.win&&cues.some(c=>c.id==='decision'&&p.time>=c.at))pendingConfirmation=true;if(p.pushInput&&oldPush!==p.pushInput){if(allowed)emit('pushPress');oldPush=p.pushInput;}}
   // Win zoom is secondary to the reach's decision. Direct/ordinary wins still
   // receive one confirmation. Never play a second win chord at every frame.
   if(g.previewWinAt!==undefined&&g.previewWinAt!==oldWin){
    if(allowed&&!p&&!pendingConfirmation)emit(g.jackpot?.charge?'charge':g.previewRushWin?'rushWin':'win');
    oldWin=g.previewWinAt;pendingConfirmation=false;
   }
   const guide=g.entryGuideAt??(g.previewWinAt===undefined?null:g.previewWinAt+(g.previewRushWin?2.4:5.8));
   if(guide!==null&&g.time>=guide&&oldGuide!==guide){if(allowed)emit('rightGuide');oldGuide=guide;}
   const prelude=g.entryPrelude;
   if(prelude!==oldPrelude){oldPrelude=prelude;preludeSeen.clear();}
   if(prelude){
    const age=g.time-prelude.startedAt,at=entryTitleAt(prelude.variant);
    const list=prelude.variant==='revival'?[cue(REVIVAL_ENTRY.resultAt,'loss'),cue(REVIVAL_ENTRY.blackoutAt,'silence'),cue(REVIVAL_ENTRY.awakeningAt,'revival')]:[cue(0,prelude.variant),...(prelude.variant==='castle'?[cue(6.3,'breakthrough')]:[]),cue(at??7.8,'rushStart','title')];
    for(const c of list)if(age>=c.at&&!preludeSeen.has(c.id)){preludeSeen.add(c.id);if(allowed&&age-c.at<.24){if(c.name==='silence')stop();else emit(c.name);}}
   }
   if(!p&&!g.spinActive&&g.lastResolvedDraw&&oldResolved!==g.lastResolvedDraw){if(allowed&&!g.lastDraw)emit('stopCenter');oldResolved=g.lastResolvedDraw;}
   const rush=!!g.rush;if(oldRush!==null&&oldRush!==rush&&allowed){if(!rush)emit('rushEnd');else if(!g.jackpot&&!prelude)emit('rushStart');}oldRush=rush;
   if(rush&&oldRemaining!==null&&g.rush.remaining>oldRemaining&&allowed)emit('rushReset');
   oldRemaining=g.rush?.remaining??null;
   if(rounds){const key=rounds.round+':'+rounds.phase;
    if(oldRound!==key){if(allowed){const name={opening:'open',closing:'close','payout-reveal':'roundReveal',finished:'clear'}[rounds.phase];if(name)emit(name);}oldRound=key;}
    if(rounds.payout>0)once('payout:'+rounds.payout,'payout',allowed);
   }
  }
 };
}
