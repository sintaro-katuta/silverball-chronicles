import test from 'node:test';import assert from 'node:assert/strict';import {cabinetLightPose} from '../src/pixi/cabinet-light-motion.js';
test('cabinet lighting follows reach, win, payout, rush and returns to rest',()=>{
 assert.equal(cabinetLightPose({time:10}).phase,'normal');
 for(const win of [false,true]){const p=cabinetLightPose({time:10,presentation:{basicReach:true,time:1,win}});assert.equal(p.phase,'reach');assert.equal(p.rainbow,false);}
 const won={time:10.5,previewWinAt:10,jackpot:{}};assert.equal(cabinetLightPose(won).travel,1);assert.deepEqual(cabinetLightPose(won),cabinetLightPose(won));
 assert.equal(cabinetLightPose({time:13,previewWinAt:10,jackpot:{}}).phase,'payout');
 assert.equal(cabinetLightPose({time:14,rush:{}}).phase,'rush');assert.equal(cabinetLightPose({time:14}).travel,0);
});

import {cabinetSwordPose} from '../src/pixi/cabinet-light-motion.js';
test('sword makes one clockwise turn about a fixed hilt and stops in its original pose',()=>{
 const rest={phase:'rest',y:0,angle:0};
 for(const game of [{time:1},{time:1,presentation:{basicReach:true,time:1,win:false}},{time:1,rush:{}},{time:1,entryPrelude:{startedAt:0}}])assert.deepEqual(cabinetSwordPose(game),rest);
 const at=age=>cabinetSwordPose({time:10+age,previewWinAt:10});
 assert.deepEqual(at(.09),rest);assert.equal(at(.3).phase,'spin');
 assert.ok(Math.abs(at(.5).angle-Math.PI)<1e-12);
 const angles=[.15,.3,.5,.7,.85].map(t=>at(t).angle);assert.ok(angles.every((a,i)=>i===0||a>angles[i-1]));
 assert.equal(at(.95).phase,'settle');assert.ok(Math.abs(at(.95).angle-2*Math.PI)<.05);
 assert.deepEqual(at(1.2),rest);assert.deepEqual(at(.5),at(.5));
 for(const age of [.2,.36,.43,.6,1.3])assert.equal(at(age).y,0);
});

import {SWORD_HILT,SWORD_MOON_CENTER,SWORD_BLADE_TIP,SWORD_GRIP_CENTER,swordSourcePoint} from '../src/pixi/sword-geometry.js';
import {sourcePoint} from '../src/pixi/source-layout.js';
test('full blade orbit stays inside the board view and reaches the moved moon',()=>{
 const [hx,hy]=sourcePoint(SWORD_HILT),radius=(SWORD_BLADE_TIP-SWORD_GRIP_CENTER)/2;
 const cx=hx-12,cy=hy-166;
 assert.ok(cx-radius>=0&&cx+radius<=396&&cy-radius>=0&&cy+radius<=436);
 const [mx,my]=sourcePoint(SWORD_MOON_CENTER);assert.ok(Math.hypot(mx-hx,my-hy)+21<=radius);
 assert.deepEqual(swordSourcePoint(0,SWORD_GRIP_CENTER),SWORD_HILT);
});
