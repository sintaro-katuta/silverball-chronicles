import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync}from'node:fs';
import{createBoardFlow}from'../src/pixi/board-flow.js';import{Physics}from'../src/physics/physics.js';
import{inspectWindmillOffset,WINDMILL_FEED_LEFT175}from'../src/pixi/windmill-offset.js';
import{resolvePinAdjustment,preparePinAdjustment}from'../src/dev/pin-adjustment.js';import{measurePinAdjustment}from'../src/dev/pin-adjustment-measurement.js';
import{inspectAdmissionCase,prepareAdmissionCase,measureAdmissionCase,validateAdmissionResult}from'../src/dev/s8-admission-comparison.js';
import{inspectShotCase}from'../src/dev/s8-shot-comparison.js';import{inspectWindmillCase}from'../src/dev/s8-windmill-comparison.js';import{inspectWheelShapeCase}from'../src/dev/s8-wheel-shape-comparison.js';
const cases=JSON.parse(readFileSync(new URL('../tools/s8-feed-shift-cases.json',import.meta.url))).cases,candidate=()=>structuredClone(cases[2]),internal={windmillOffsetProfile:WINDMILL_FEED_LEFT175},data=x=>JSON.parse(JSON.stringify(x));
function synthetic(operation){const step=Physics.prototype.step,can=Physics.prototype.canLaunch;Physics.prototype.canLaunch=()=>true;Physics.prototype.step=function(dt,game){this.time+=dt;this.updateGate(game);for(const b of this.balls){this.recordOutcome(b,'out');game.lose(b);}this.balls=[];};try{return operation();}finally{Physics.prototype.step=step;Physics.prototype.canLaunch=can;}}
test('old default max0.25 and all older comparison routes reject feed offset and no config/CLI option unlock exists',async()=>{
 const p=createBoardFlow({lcd:true,leftAdmissionGuides:false}).flow.physics;
 for(const dx of [.251,-.251,-1.75]){assert.throws(()=>inspectWindmillOffset(p,{dx,dy:0}),/maximum/);assert.throws(()=>createBoardFlow({lcd:true,windmillOffset:{dx,dy:0}}),/maximum/);}
 const c=candidate();assert.throws(()=>resolvePinAdjustment(c),/maximum/);await assert.rejects(preparePinAdjustment(c),/maximum/);assert.throws(()=>measurePinAdjustment(c,{seconds:1,drain:0,windmillOffsetProfile:WINDMILL_FEED_LEFT175}),/maximum/);
 for(const inspect of[inspectShotCase,inspectWindmillCase,inspectWheelShapeCase])assert.equal(inspect(c).valid,false);
 assert.throws(()=>resolvePinAdjustment({...c,windmillOffsetProfile:WINDMILL_FEED_LEFT175},internal),/configuration/);assert.throws(()=>resolvePinAdjustment(c,{windmillOffsetProfile:'unknown'}),/Unknown/);
});
test('only exact declared case can use internal profile, no pins/radius/shape/offset mixing',()=>{
 const c=candidate(),i=inspectAdmissionCase(c);assert.equal(i.valid,true,i.skipReason);assert.equal(i.resolutionOptions.windmillOffsetProfile,WINDMILL_FEED_LEFT175);assert.equal(i.layout.flowOptions.windmillOffsetProfile,WINDMILL_FEED_LEFT175);assert.equal(i.windmillInspection.actualContactGeometry.centre.x,62.25);
 assert.deepEqual(cases.slice(0,2),JSON.parse(readFileSync(new URL('../tools/s8-approach-cases.json',import.meta.url))).cases.slice(0,2));assert.equal(cases.length,3);
 for(const edit of[{id:'three-base'},{windmillOffset:{dx:-1.5,dy:0}},{windmillOffset:{dx:-1.75,dy:.01}},{moves:[{pinId:2,dx:.25,dy:0}]},{ballRadius:1.8},{windmillShapeProfile:'legacy-capsules'},{leftAdmissionGuides:true},{hesoMouthWidth:12},{normalPower:.2}]){assert.throws(()=>resolvePinAdjustment({...c,...edit},internal));assert.equal(inspectAdmissionCase({...c,...edit}).valid,false);}
 const prepared=resolvePinAdjustment(c,internal);assert.equal(prepared.pins.length,101);assert.deepEqual(prepared.pins,createBoardFlow({lcd:true}).flow.physics.pins);assert.equal(Object.hasOwn(resolvePinAdjustment(cases[1]).flowOptions,'windmillOffsetProfile'),false);
});
test('factory contact/display mount options share new centre, every other model property/shape/physics remains exact',async()=>{
 const c=candidate(),prepared=await prepareAdmissionCase(c),base=await prepareAdmissionCase(cases[1]);
 const a=createBoardFlow({lcd:true,...base.flowOptions}),b=createBoardFlow({lcd:true,...prepared.flowOptions}),expected=data(a);expected.flow.physics.mechanisms[0].x=62.25;assert.deepEqual(data(b),expected);assert.deepEqual(Object.getOwnPropertyNames(b.flow.physics),Object.getOwnPropertyNames(a.flow.physics));assert.equal(Object.getPrototypeOf(a.flow.physics),Object.getPrototypeOf(b.flow.physics));
 assert.deepEqual(b.flow.physics.pins,a.flow.physics.pins);assert.deepEqual(b.flow.physics.colliders,a.flow.physics.colliders);assert.deepEqual(b.flow.physics.pockets,a.flow.physics.pockets);assert.deepEqual(b.flow.physics.outlet,a.flow.physics.outlet);assert.ok(inspectAdmissionCase(c).windmillInspection.conservativeLegacyEnvelopeGuard.margins.every(m=>m.gap>0));
 for(const patch of[{windmillOffset:null},{windmillShapeProfile:'legacy-capsules'},{ballRadius:2},{normalPower:.2},{launchInterval:.5},{rightPower:.8},{passGate:false},{pinPositions:[{id:1,x:0,y:0}]}])assert.throws(()=>createBoardFlow({lcd:true,...prepared.flowOptions,...patch}),/Feed shift|interference/);
});
test('short native measurement uses profile only through private third argument and synthetic250 validates every frame centre',()=>{
 const c=candidate(),i=inspectAdmissionCase(c),short=measurePinAdjustment(c,{seconds:1,drain:.25,replaySeconds:1.25,replayFPS:30},i.resolutionOptions);assert.equal(short.fixed.mechanisms[0].x,62.25);assert.ok(short.replayFrames.every(f=>f.mechanisms[0].x===62.25));
 const r=synthetic(()=>measureAdmissionCase(c));assert.equal(validateAdmissionResult(r),true);assert.equal(r.physical.shots,250);assert.equal(r.end.remaining,0);assert.equal(r.flowOptions,undefined);for(const f of [...r.replayFrames,...Object.values(r.replayEndpoints)])assert.equal(f.mechanisms[0].x,62.25);const bad=structuredClone(r);bad.replayFrames[1].mechanisms[0].x=64;assert.throws(()=>validateAdmissionResult(bad),/mechanism/);assert.throws(()=>measureAdmissionCase(c,{mode:'rush'}),/phase/);
});
