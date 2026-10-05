import test from 'node:test';
import assert from 'node:assert/strict';
import {createPredictionPlan} from '../src/pixi/prediction-plan.js';
import {storyPredictionWindow} from '../src/pixi/story-prediction-window.js';

test('story stays on one timeline across entrance/title split and original end',()=>{
 const p={drawId:17,mode:'normal',development:{family:'character'},battleFamily:'battleSP',precursorSeconds:5};
 for(const age of [.1,2.8,2.95,4.9])assert.deepEqual(storyPredictionWindow(p,age),{family:'step',time:age,start:0,duration:5,mode:'normal'});
 assert.equal(storyPredictionWindow(p,5),null);
});
test('RUSH stories use the existing two-second window, short cues fall back',()=>{
 for(const [before,family]of [['resolve','rescue'],['identity','memory'],['search','pursuit']]){
  const p={mode:'rush',beforeCue:{family:before,start:.1,end:.58},development:{family:'character'},precursorSeconds:2};
  assert.equal(storyPredictionWindow(p,.5).family,family);assert.equal(storyPredictionWindow(p,2),null);
  assert.equal(storyPredictionWindow(p,.3,{phase:'spin'}),null);
 }
});
test('plain reels and missing films preserve existing fallback; basic windows fit',()=>{
 assert.equal(storyPredictionWindow({mode:'normal'},1),null);
 const p={mode:'normal',basicPrelude:{family:'long',start:.5,end:3}};
 assert.equal(storyPredictionWindow(p,.4),null);assert.equal(storyPredictionWindow(p,1,{available:['step']}),null);
 assert.deepEqual(storyPredictionWindow(p,1),{family:'pursuit',time:1,start:.5,duration:2.5,mode:'normal'});
 assert.equal(storyPredictionWindow(p,3),null);
});
test('dedicated entrance choice cannot distinguish ordinary defeat from revival',()=>{
 for(const mode of ['normal','rush'])for(let drawId=1;drawId<150;drawId++)for(const variant of ['pressure','initiative','exchange']){
  const plan={route:'battle',variant,ending:'standard',premium:null};
  const win=createPredictionPlan({drawId,mode,win:true,plan}),loss=createPredictionPlan({drawId,mode,win:false,plan});
  for(const age of [.6,1.2,mode==='normal'?3:1.8])assert.deepEqual(storyPredictionWindow(win,age),storyPredictionWindow(loss,age));
 }
});
