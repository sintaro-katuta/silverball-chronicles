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

test('review close-ups contain both specified left zones without changing the board view',()=>{
 const views=createViewCameras(lcd);for(const [name,points]of [['left',[[73.15,437.35],[72.85,488],[178.85,544.25]]],['entry',[[73.15,437.35]]],['road',[[72.85,488],[178.85,544.25]]]]){const p=views[name];for(const[x,y]of points){assert.ok(p.x+x*p.scale>=10-1e-6);assert.ok(p.x+x*p.scale<=386+1e-6);assert.ok(p.y+y*p.scale>=10-1e-6);assert.ok(p.y+y*p.scale<=426+1e-6);}}
 assert.deepEqual(views.board,{...PLAY_CAMERA,frameAlpha:0});
});


test('right-road review camera contains the annotated electric decoration and road pins',()=>{const p=createViewCameras({x:100,y:200,width:100,height:100}).rightRoad;for(const[x,y]of[[235.75,548.75],[248.25,538.25],[289.3,519.6]]){assert.ok(p.x+x*p.scale>=10);assert.ok(p.x+x*p.scale<=386);assert.ok(p.y+y*p.scale>=10);assert.ok(p.y+y*p.scale<=426);}});


test('right-only review cameras contain the upper route, attacker and electric starter without changing board pose',()=>{const vs=createViewCameras({x:100,y:200,width:100,height:100});for(const[name,points]of[['right',[[209.15,198.45],[373.6,300.85],[356,430],[280.5,542]]],['rightUpper',[[373.6,300.85],[375,426.5]]],['rightAttacker',[[356,430],[359.5,434],[360,510],[355.8,523.5]]]])for(const[x,y]of points){const p=vs[name];assert.ok(p.x+x*p.scale>=10-1e-6);assert.ok(p.x+x*p.scale<=386+1e-6);assert.ok(p.y+y*p.scale>=10-1e-6);assert.ok(p.y+y*p.scale<=426+1e-6);}assert.deepEqual(vs.board,{...PLAY_CAMERA,frameAlpha:0});});
