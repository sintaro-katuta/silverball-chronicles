import test from 'node:test';
import assert from 'node:assert/strict';
import {longReachPose,RESOLVE_STRIKE,REACH_SCRIPTS} from '../src/pixi/long-reach-timeline.js';

test('resolve never swings before its only release and builds charge in distinct shots',()=>{
 assert.equal(REACH_SCRIPTS.pressure.strikes.length,1);
 for(const ending of ['standard','revival'])for(const win of [false,true]){
  for(let t=5;t<49.55;t+=1/60){
   const p=longReachPose(t,{variant:'pressure',ending,win,motionFrames:true});
   assert.equal(p.slash.alpha,0);assert.equal(p.impact.alpha,0);assert.ok(p.sparks.every(s=>s.alpha===0));
   assert.ok(![2,7].includes(p.hero.frame),`no attack pose at ${t}`);
  }
 }
 const samples=[20,28,36,44,48].map(t=>longReachPose(t,{variant:'pressure'}));
 for(let i=1;i<samples.length;i++)assert.ok(samples[i].charge>samples[i-1].charge);
 assert.ok(new Set(samples.map(p=>p.camera.scale)).size>2);
 assert.equal(longReachPose(49.5,{variant:'pressure'}).resolveQuiet,1);
});

test('one release holds contact briefly and follows through without returning for more taps',()=>{
 const options={variant:'pressure',win:true,motionFrames:true};
 const a=longReachPose(RESOLVE_STRIKE.at,options),b=longReachPose(RESOLVE_STRIKE.at+.10,options);
 assert.deepEqual(a.hero,b.hero);assert.deepEqual(a.enemy,b.enemy);
 assert.ok(a.slash.scale>2&&a.slash.alpha>0);assert.ok(a.contact.gap<1e-5);
 const follow=longReachPose(50.6,options),late=longReachPose(51.5,options);
 assert.equal(follow.hero.frame,7);assert.equal(late.hero.frame,7);
 assert.ok(late.hero.x>=follow.hero.x);assert.equal(late.slash.alpha,0);
});

test('resolve effects can be reduced without changing the strike or revealing revival early',()=>{
 for(const t of [20,28,39,49.5,50.2,50.4,51.8,53.99]){
  const full=longReachPose(t,{variant:'pressure',win:false,motionFrames:true});
  const reduced=longReachPose(t,{variant:'pressure',win:false,motionFrames:true,reducedEffects:true});
  assert.deepEqual(full.hero,reduced.hero);assert.equal(full.cut,reduced.cut);assert.equal(full.charge,reduced.charge);
  assert.equal(reduced.slash.alpha,0);assert.equal(reduced.impact.alpha,0);assert.ok(reduced.sparks.every(s=>s.alpha===0));
  assert.deepEqual(full,longReachPose(t,{variant:'pressure',win:true,ending:'revival',motionFrames:true}));
 }
 for(const t of [54.4,55.25]){
  const p=longReachPose(t,{variant:'pressure',win:true,ending:'revival',motionFrames:true});
  assert.ok(p.charge>0);assert.equal(p.slash.alpha,0);assert.ok(![2,6,7].includes(p.hero.frame));
 }
});
