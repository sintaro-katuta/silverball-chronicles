import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePortraitPose} from '../src/pixi/resolve-portrait.js';
test('dedicated face belongs only to the two pressure face cuts, with identical win/loss/revival and bounded transitions',()=>{
 for(const t of [0,38.999,46,50.2,54,55.2])assert.equal(resolvePortraitPose(t).visible,false);
 for(const t of [39.16,41,42.9,43,44.5,45.84]){
  const p=resolvePortraitPose(t);assert.equal(p.visible,true);assert.ok(p.alpha>.99);assert.ok(p.width>=300&&p.width<=386);
  assert.deepEqual(p,resolvePortraitPose(t,{ending:'revival'}));
  for(const variant of ['initiative','exchange'])assert.equal(resolvePortraitPose(t,{variant}).visible,false);
  assert.equal(resolvePortraitPose(t,{ending:'flash'}).visible,false);
 }
 assert.equal(resolvePortraitPose(39).alpha,0);
 assert.ok(resolvePortraitPose(45.999).alpha<.001);
 assert.equal(resolvePortraitPose(41,{reducedEffects:true}).width,300);
 assert.equal(resolvePortraitPose(44,{reducedEffects:true}).width,380);
});
