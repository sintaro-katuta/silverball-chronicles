import test from 'node:test';
import assert from 'node:assert/strict';
import {BUILD_STYLES,directionFrame,directionLine} from '../src/presentation/battle-direction.js';
import {beatsFor,reachBeat,timeline,durationFor} from '../src/presentation/cinematic.js';
import {SCENES} from '../src/presentation/reach-scenes.js';

test('build branches retain their cause across contact, opening and final attack',()=>{
 const expected={assault:['援護','防壁','援護','核心'],fortify:['防壁','受け止め','守り','突き'],counter:['受け流','隙','残した','返す'],balanced:['刃','亀裂','同じ','亀裂']};
 for(const style of BUILD_STYLES){const p={buildStyle:style,pattern:'feint',win:false};for(const [i,id] of ['clash','crisis','awakening','strike'].entries())assert.ok(directionLine(p,{id}).includes(expected[style][i]));
 assert.equal(directionFrame(p,'crisis',.5).crack,1);
 assert.equal(directionFrame(p,'strike',.8).crack,1);}
});
test('all live build branches keep result art and victory state hidden until judgment',()=>{
 for(const buildStyle of BUILD_STYLES)for(const pattern of ['victory','defeat','feint','awakening','revival'])for(const id of ['clash','crisis','awakening','strike']){
  const p={buildStyle,pattern,win:['victory','awakening','revival'].includes(pattern)};
  const f=directionFrame(p,id,.8);assert.equal(f.art,'feint');assert.equal(f.broken,false);assert.equal(f.failed,false);
  assert.equal(directionFrame(p,'judgment',.5).broken,p.win);
  assert.equal(directionFrame(p,'judgment',.5).failed,!p.win);
 }
});
test('style direction preserves every scene, beat interval, course rate and pause time',()=>{
 for(const buildStyle of [...BUILD_STYLES,'unknown'])for(const scene of SCENES)for(const pattern of ['victory','defeat','feint','awakening','revival'])for(const rate of [.5,1,2]){
  for(const beat of beatsFor(pattern)){
   const presentation=Object.freeze({buildStyle,sceneId:scene.id,pattern,time:(beat.from+2+.01)*rate,rate,win:pattern!=='defeat'&&pattern!=='feint'});
   const frame=timeline({presentation}),actual=reachBeat(frame);
   assert.equal(actual.id,beat.id);assert.equal(actual.from,beat.from);assert.equal(actual.to,beat.to);assert.equal(frame.scene.id,scene.id);
   assert.deepEqual(reachBeat(timeline({presentation})),actual);
  }
  assert.equal(durationFor(pattern),pattern==='revival'?28:20.5);
 }
});
test('loss and revival dialogue never claims an early breakthrough',()=>{
 assert.match(directionLine({win:false},{id:'resolve'}),/防壁は残った/);
 assert.match(directionLine({win:true},{id:'resolve'}),/突破成功/);
 assert.match(directionLine({pattern:'revival',t:21},{id:'strike'}),/残った亀裂/);
});
