import test from 'node:test';
import assert from 'node:assert/strict';
import {createIntroCamera,createViewCameras,PLAY_CAMERA} from '../src/pixi/intro-camera.js';
const lcd={x:95,y:300,width:225,height:150};
test('persistent views reuse introduction poses and preserve adopted board pose',()=>{
 const views=createViewCameras(lcd),intro=createIntroCamera({lcd});
 assert.deepEqual(views.whole,intro.pose());
 assert.deepEqual(views.board,{...PLAY_CAMERA,frameAlpha:0});
 for(let i=0;i<26;i++)intro.step(.1);
 assert.deepEqual(views.lcd,intro.pose());
});
test('introduction visits whole, board, LCD and returns exactly to adopted play view',()=>{
 const phases=[],camera=createIntroCamera({lcd,onState:s=>phases.push(s.phase)});
 assert.equal(camera.snapshot().active,true);
 for(let i=0;i<38;i++)camera.step(.1);
 assert.deepEqual(phases,['whole','board','lcd','return','complete']);
 assert.deepEqual(camera.pose(),{...PLAY_CAMERA,frameAlpha:0});
 const before=camera.snapshot();camera.step(20);assert.deepEqual(camera.snapshot(),before);
});
test('skip and reduced motion restore adopted camera with no residual outer frame',()=>{
 for(const reducedMotion of [false,true]){
  const camera=createIntroCamera({lcd,reducedMotion});camera.step(.1);camera.skip();
  assert.equal(camera.snapshot().active,false);
  assert.deepEqual(camera.pose(),{...PLAY_CAMERA,frameAlpha:0});
 }
});
test('LCD camera contains every corner with padding and clamps long frame gaps',()=>{
 const camera=createIntroCamera({lcd});camera.step(100);assert.equal(camera.snapshot().elapsed,.1);
 for(let i=0;i<25;i++)camera.step(.1);
 const {x,y,scale}=camera.pose();
 assert.ok(x+lcd.x*scale>=14-1e-8);assert.ok(y+lcd.y*scale>=14-1e-8);
 assert.ok(x+(lcd.x+lcd.width)*scale<=382+1e-8);assert.ok(y+(lcd.y+lcd.height)*scale<=422+1e-8);
});
