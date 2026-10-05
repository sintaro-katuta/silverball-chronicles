import test from 'node:test';
import assert from 'node:assert/strict';
import {storyPredictionPose,STORY_PRESENTATIONS,STORY_FAMILY_MAPPING} from '../src/pixi/story-prediction-motion.js';
test('all five films carry unique causal events and complete six shots',()=>{
 const signatures=[];
 for(const [kind,story]of Object.entries(STORY_PRESENTATIONS)){
  signatures.push(story.cuts.map(c=>c.event).join(','));
  const observed=story.cuts.map(c=>storyPredictionPose({family:kind,time:c.at+.01}).frame);assert.deepEqual(observed,[0,1,2,3,4,5]);
  assert.equal(storyPredictionPose({family:kind,time:story.seconds}).visible,false);
  assert.equal(storyPredictionPose({family:kind,time:story.seconds}).finished,true);
 }
 assert.equal(new Set(signatures).size,5);
});
test('family mapping never infers or changes an outcome',()=>{
 for(const family of Object.keys(STORY_FAMILY_MAPPING)){
  const p=storyPredictionPose({family,time:.5,win:true}),q=storyPredictionPose({family,time:.5,win:false});assert.deepEqual(p,q);assert.equal(p.result,null);
 }
});
test('brief windows use edited two/three-shot versions; normal entrance has five events',()=>{
 for(const family of ['step','memory','episode','pursuit','rescue']){
  const short=Array.from({length:150},(_,i)=>storyPredictionPose({family,time:i*.01,duration:1.5}).frame);
  assert.deepEqual([...new Set(short)],[0,5]);
  const rush=Array.from({length:200},(_,i)=>storyPredictionPose({family,time:i*.01,duration:2}).frame);
  assert.equal(new Set(rush).size,3);
  const normal=Array.from({length:500},(_,i)=>storyPredictionPose({family:'rescue',time:i*.01,duration:5}).frame);
  assert.deepEqual([...new Set(normal)],[0,1,3,4,5]);
  assert.equal(storyPredictionPose({family,time:29,start:28,duration:6}).visible,true);
  assert.equal(storyPredictionPose({family,time:34,start:28,duration:6}).finished,true);
 }
});
test('reduced effects preserve shots/timing; replay seeks remain deterministic',()=>{
 for(const family of ['rescue','pursuit','episode'])for(const time of [.02,1.5,2.5,4.2]){
  const p=storyPredictionPose({family,time}),r=storyPredictionPose({family,time,reducedEffects:true});assert.equal(p.frame,r.frame);assert.equal(p.event,r.event);assert.equal(r.impact,0);assert.equal(r.particleCount,0);assert.equal(r.cameraX,0);
 }
 const input=Object.freeze({family:'rescue',time:4.01});const p=storyPredictionPose(input);storyPredictionPose({family:'rescue',time:1});assert.deepEqual(storyPredictionPose(input),p);
 assert.throws(()=>storyPredictionPose({family:'other',time:0}));assert.throws(()=>storyPredictionPose({family:'step',time:0,duration:.8}));
});
test('short edits leave reading time for the final shot instead of rushing it',()=>{
 for(const family of Object.keys(STORY_PRESENTATIONS))for(const duration of [1.43,2,5]){
  const runs=[];for(let t=0;t<duration;t+=.001){const frame=storyPredictionPose({family,time:t,duration}).frame;const last=runs.at(-1);if(last?.frame===frame)last.seconds+=.001;else runs.push({frame,seconds:.001});}
  assert.equal(runs.length,duration===1.43?2:duration===2?3:5);
  for(const run of runs)assert.ok(run.seconds>.64);
 }
});
