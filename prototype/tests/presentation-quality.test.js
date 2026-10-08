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


test('caption backdrop stays behind actors in LCD coordinates and defaults to hidden',async()=>{
 const {Container}=await import('pixi.js');
 const {createCaptionBackdrop,updateCaptionBackdrop}=await import('../src/pixi/long-reach-view.js');
 const world=new Container(),landscape=new Container(),actor=new Container();
 world.addChild(landscape);const layer=createCaptionBackdrop(world);world.addChild(actor);
 assert.deepEqual(world.children,[landscape,layer,actor]);assert.equal(layer.visible,false);assert.equal(layer.alpha,0);
 for(const camera of [{x:105,y:70,scale:1},{x:64,y:52,scale:1.55},{x:112,y:70,scale:2.35}]){
  world.pivot.set(camera.x,camera.y);world.position.set(105,70);world.scale.set(camera.scale);
  updateCaptionBackdrop(layer,camera,.2);
  const top=layer.toGlobal({x:0,y:0}),bottom=layer.toGlobal({x:210,y:30});
  assert.ok(Math.abs(top.x)<1e-6&&Math.abs(top.y)<1e-6);
  assert.ok(Math.abs(bottom.x-210)<1e-6&&Math.abs(bottom.y-30)<1e-6);
  assert.equal(layer.alpha,.2);
  updateCaptionBackdrop(layer,camera);assert.equal(layer.visible,false);assert.equal(layer.alpha,0);
 }
 world.destroy({children:true});assert.equal(layer.destroyed,true);assert.equal(actor.destroyed,true);
});


test('caption backdrop feathers only the last six LCD pixels down to transparency',async()=>{
 const {CAPTION_BACKDROP_BANDS:bands}=await import('../src/pixi/long-reach-view.js');
 assert.deepEqual(bands[0],{y:0,height:24,alpha:1});
 let edge=0,previous=1;
 for(const band of bands){
  assert.equal(band.y,edge);edge+=band.height;
  assert.ok(band.alpha>=0&&band.alpha<=previous);
  if(band.y>=24)assert.ok(band.alpha<previous);
  previous=band.alpha;
 }
 assert.equal(edge,30);assert.equal(previous,0);
});
