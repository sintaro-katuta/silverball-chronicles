import test from 'node:test';import assert from 'node:assert/strict';
import {directionCutinPose,DIRECTION_CUTIN_SECONDS} from '../src/pixi/direction-cutin.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
test('direction guidance enters from opposite sides, holds centrally and clears',()=>{
 assert.equal(directionCutinPose(0,'right').x,-210);assert.equal(directionCutinPose(0,'left').x,210);
 for(const side of ['left','right']){assert.equal(directionCutinPose(.5,side).x,0);assert.equal(directionCutinPose(.5,side).alpha,1);assert.equal(directionCutinPose(DIRECTION_CUTIN_SECONDS,side).visible,false);}
});
test('direction reflects model changes and its clock freezes when paused',()=>{
 const m=createBoardFlow({lcd:true});m.setMode('right-closed');assert.equal(m.getMode(),'right-closed');m.setMode('bonus');assert.equal(m.getMode(),'bonus');m.flow.pause(true);const t=m.flow.game.time;m.flow.step(.5);assert.equal(m.flow.game.time,t);m.setMode('normal');assert.equal(m.getMode(),'normal');
});
