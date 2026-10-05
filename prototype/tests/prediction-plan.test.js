import test from 'node:test';
import assert from 'node:assert/strict';
import {createPredictionPlan,predictionPose,holdPredictionCue,RUSH_PREDICTION_FAMILIES,PREDICTION_LABELS} from '../src/pixi/prediction-plan.js';
import {presentationDistribution,selectPresentation} from '../src/pixi/presentation-distribution.js';
const battle=Object.freeze({route:'battle',variant:'pressure',ending:'standard',premium:null,moonCue:null});

test('prediction selection is frozen, deterministic and cannot mutate saved plans',()=>{
 for(const mode of ['normal','rush'])for(const win of [false,true]){
  const input=Object.freeze({drawId:315,mode,win,plan:battle});
  const p=createPredictionPlan(input);
  assert.deepEqual(p,createPredictionPlan(input));
  assert.ok(Object.isFrozen(p)&&Object.isFrozen(p.chanceUps)&&Object.isFrozen(p.development));
  assert.equal(p.battleFamily,'climax');
  assert.equal(p.precursorSeconds,mode==='normal'?5:2);
  assert.equal(battle.ending,'standard');assert.equal(battle.moonCue,null);
 }
});

test('all routes remain available and prediction generation preserves calibrated decisions',()=>{
 for(const mode of ['normal','rush']){
  const distribution=presentationDistribution({mode,baseWinProbability:1/(mode==='normal'?399.9:95.3)});
  for(const win of [false,true])for(let drawId=0;drawId<4000;drawId++){
   const selected=selectPresentation({drawId,mode,win,distribution});
   const original=JSON.stringify(selected),p=createPredictionPlan({drawId,mode,win,plan:selected});
   assert.equal(JSON.stringify(selected),original);assert.equal(p.route,selected.route);
   assert.deepEqual(selected,selectPresentation({drawId,mode,win,distribution}));
   if(selected.route!=='battle'){assert.equal(p.precursorSeconds,0);assert.equal(p.development,null);assert.equal(p.chanceUps.length,0);}
   if(!win)assert.equal(p.resultFamily,null);
  }
 }
});

test('high-tier cues can occur on losses while winning battles can have quiet holds',()=>{
 for(const mode of ['normal','rush']){
  const counts={winGold:0,lossGold:0,winRed:0,lossRed:0,quietWin:0,lossStrong:0};
  const families=new Set(),development=new Set();
  for(let drawId=0;drawId<5000;drawId++)for(const win of [false,true]){
   const p=createPredictionPlan({drawId,mode,win,plan:battle});
   families.add(p.beforeCue?.family);development.add(p.development.family);
   if(p.holdCue==='gold')counts[win?'winGold':'lossGold']++;
   if(p.holdCue==='red')counts[win?'winRed':'lossRed']++;
   if(win&&p.holdCue==='none')counts.quietWin++;
   if(!win&&p.development.tier==='gold')counts.lossStrong++;
  }
  assert.ok(counts.winGold>counts.lossGold&&counts.lossStrong>0);
  assert.ok(counts.winRed>counts.lossRed);assert.ok(counts.quietWin>0);
  assert.equal(development.size,4);assert.equal(families.size,mode==='normal'?6:11);
 }
});

test('revival and premium remain hidden until existing late reveal logic',()=>{
 const p=createPredictionPlan({drawId:8,win:true,plan:{...battle,ending:'revival'}});
 const miss=createPredictionPlan({drawId:8,win:false,plan:battle});
 assert.equal(p.precursorSeconds,5);assert.equal(p.resultFamily,'special');
 assert.equal(p.battleFamily,miss.battleFamily);assert.equal(p.development.family,miss.development.family);
 for(let age=0;age<58;age+=.2){const pose=predictionPose(p,age,{phase:'reach'});assert.ok(!/復活|全回転|確定/.test(pose.text));}
 const premium=createPredictionPlan({drawId:8,win:true,plan:{...battle,premium:'moon'}});
 assert.ok([null,'fullrotation'].includes(premium.resultFamily));assert.equal(premium.battleFamily,'climax');
});

test('basic preludes work on either saved outcome and staged text labels can all be preloaded',()=>{
 const families=new Map();
 for(const mode of ['normal','rush'])for(const win of [false,true])for(let drawId=0;drawId<100;drawId++){
  const p=createPredictionPlan({drawId,mode,win,plan:{route:'basic'}});
  assert.equal(p.precursorSeconds,0);
  assert.ok([null,'character','long'].includes(p.basicFamily));
  assert.equal(p.basicFamily,createPredictionPlan({drawId,mode,win:!win,plan:{route:'basic'}}).basicFamily);
  const lane=`${mode}/${win}`;
  if(!families.has(lane))families.set(lane,new Set());families.get(lane).add(p.basicFamily);
  const entrance=predictionPose(p,.6,{phase:'reach'});
  assert.equal(entrance.visible,p.basicFamily!==null);
  assert.equal(entrance.stage,p.basicFamily?'precursor':'none');
  if(!p.basicFamily)assert.equal(p.basicPrelude,null);
  assert.equal(p.resultFamily,null);assert.equal(p.chanceUps.length,0);
  assert.equal(predictionPose(p,3.1,{phase:'reach'}).visible,false);
  for(const phase of ['spin','reach'])for(let age=0;age<4;age+=.07){
   const pose=predictionPose(p,age,{phase});if(pose.visible)assert.ok(PREDICTION_LABELS.includes(pose.text),pose.text);
  }
 }
 for(const found of families.values())assert.deepEqual(found,new Set([null,'character','long']));
 let serial;
 for(let drawId=0;drawId<100&&!serial;drawId++){const p=createPredictionPlan({drawId,win:true,plan:battle});if(p.beforeCue?.family==='serial')serial=p;}
 assert.ok(serial);
 assert.equal(predictionPose(serial,.5).step,0);assert.equal(predictionPose(serial,1).step,1);assert.equal(predictionPose(serial,1.6).step,2);
 for(const mode of ['normal','rush']){
  let full=0,other=0;
  for(let drawId=0;drawId<300;drawId++){
   const p=createPredictionPlan({drawId,mode,win:true,plan:{...battle,premium:'moon'}});
   if(p.resultFamily==='fullrotation')full++;else other++;
  }
  assert.ok(full>0&&other>full);
 }
});

test('queue omen agrees with active selection without requiring battle anti-repeat state',()=>{
 for(const mode of ['normal','rush'])for(const win of [false,true])for(let drawId=0;drawId<2000;drawId++){
  const cue=holdPredictionCue({drawId,mode,win});
  assert.equal(createPredictionPlan({drawId,mode,win,plan:battle}).holdCue,cue);
  assert.equal(createPredictionPlan({drawId,mode,win,plan:{route:'ordinary'}}).holdCue,cue);
 }
 assert.equal(RUSH_PREDICTION_FAMILIES.length,12);
 assert.equal(RUSH_PREDICTION_FAMILIES.filter(c=>c.confirmed).length,1);
 for(const mode of ['normal','rush']){
  let found=false;
  for(let drawId=0;drawId<500000&&!found;drawId++)found=holdPredictionCue({drawId,mode,win:false})==='gold';
  assert.ok(found,'Gold queue omen is strong, never a guarantee');
 }
});

test('pose boundaries select one readable layer and sampling is independent of frame rate',()=>{
 const p=createPredictionPlan({drawId:7,win:false,plan:battle});
 assert.equal(predictionPose(p,-1).visible,false);
 assert.equal(predictionPose(p,0,{phase:'reach'}).stage,'precursor');
 assert.equal(predictionPose(p,3,{phase:'reach'}).stage,'development');
 assert.equal(predictionPose(p,5,{phase:'reach'}).visible,false);
 for(const cue of p.chanceUps){
  assert.equal(predictionPose(p,cue.start,{phase:'reach'}).stage,'chanceUp');
  assert.equal(predictionPose(p,cue.end,{phase:'reach'}).visible,false);
 }
 assert.deepEqual(predictionPose(p,3,{phase:'reach'}),predictionPose(p,3,{phase:'reach'}));
 assert.equal(predictionPose(p,60,{phase:'reach'}).visible,false);
});

test('invalid admission data fails instead of inventing an outcome',()=>{
 assert.throws(()=>createPredictionPlan({drawId:1,win:false,plan:{...battle,premium:'moon'}}),/saved win/);
 assert.throws(()=>createPredictionPlan({drawId:-1,win:true,plan:battle}),RangeError);
 assert.throws(()=>createPredictionPlan({drawId:1,mode:'other',win:true,plan:battle}),RangeError);
 assert.throws(()=>createPredictionPlan({drawId:1,win:1,plan:battle}),TypeError);
 assert.throws(()=>predictionPose({},NaN),TypeError);
});
