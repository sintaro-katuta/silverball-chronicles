import test from 'node:test';
import assert from 'node:assert/strict';
import {presentationResolution} from '../src/pixi/presentation-quality.js';
import {longReachPose} from '../src/pixi/long-reach-timeline.js';
test('sampling follows CSS size and DPR without changing logical coordinates or exceeding the pixel budget',()=>{
 assert.equal(presentationResolution(396,436,396,1),1);
 assert.equal(presentationResolution(396,436,390,3),390/396*3);
 assert.equal(presentationResolution(396,436,792,1),2);
 for(const width of [320,390,792,2000])for(const dpr of [1,2,3,4]){
  const r=presentationResolution(396,436,width,dpr);assert.ok(r<=3);assert.ok(396*436*r*r<=1_600_000+.001);
 }
});
test('resolve posture has an intermediate exposure while the decisive impact retains its authored hold',()=>{
 const a=longReachPose(15.08,{motionFrames:true});assert.ok(a.hero.frameBlend>0&&a.hero.frameBlend<1);
 const a1=longReachPose(50.2,{motionFrames:true}),a2=longReachPose(50.26,{motionFrames:true});
 assert.equal(a1.impact.alpha,a2.impact.alpha);assert.equal(a1.hero.x,a2.hero.x);
 assert.ok(longReachPose(44).camera.scale<longReachPose(45).camera.scale);
});
