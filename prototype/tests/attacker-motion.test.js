import test from 'node:test';
import assert from 'node:assert/strict';
import {createPartFlow} from '../src/physics/ball-flow.js';
import {attachAttackerMotion} from '../src/pixi/attacker-motion.js';
test('lower hinge is fixed, panel reverses without jumps and pauses',()=>{
 const f=createPartFlow(),m=attachAttackerMotion(f),hinge=structuredClone(f.physics.gate.panel.hingeA);m.request(true);
 for(let i=0;i<30;i++)f.step(1/120);
 const before=structuredClone(f.physics.gate.panel);m.request(false);assert.deepEqual(f.physics.gate.panel,before);
 f.pause(true);f.step(.05);assert.deepEqual(f.physics.gate.panel,before);f.pause(false);
 for(let i=0;i<90;i++)f.step(1/120);
 assert.equal(f.physics.gate.active,false);assert.deepEqual(f.physics.gate.panel.hingeA,hinge);
 m.request(true);for(let i=0;i<90;i++)f.step(1/120);
 assert.equal(f.physics.gate.active,true);assert.deepEqual(f.physics.gate.panel.hingeA,hinge);assert.ok(f.physics.gate.panel.freeA.y>hinge.y);
 m.request(false);assert.equal(f.physics.gate.active,false);
});
test('open tray physically receives balls; closed panel lets them reach slope',()=>{
 const f=createPartFlow(),m=attachAttackerMotion(f),colliders=structuredClone(f.physics.colliders);f.start();let slope=false;
 for(let i=0;i<2400;i++){m.request(i>=600&&i<1800);f.step(1/120);if(i===599)assert.equal(f.counts.bonus,0);if(i===1800)f.countAtClose=f.counts.bonus;for(const b of f.physics.balls)slope ||= b.lastContact==='out-right';}
 assert.ok(f.counts.bonus>0);assert.equal(f.counts.bonus,f.countAtClose);assert.equal(slope,true);
 assert.equal(f.physics.attackerReceipts.length,f.counts.bonus);assert.ok(f.physics.attackerReceipts.every(r=>r.contact==='attacker-door'));assert.deepEqual(f.physics.colliders,colliders);
});

test('housing and open tray stay inside right guide',()=>{
 const f=createPartFlow(),m=attachAttackerMotion(f);m.request(true);for(let i=0;i<90;i++)f.step(1/120);
 const edge=f.physics.colliders.find(c=>c.role==='right-outer').a.x;
 assert.ok(f.physics.gate.panel.freeB.x+1.5<edge);
 assert.ok(f.physics.gate.panel.hingeB.x<edge);
});

test('left guide moves left and tray is centred between guides with edge clearance',()=>{
 const f=createPartFlow(),before=structuredClone(f.physics.colliders.find(c=>c.role==='right-inner-lower'));attachAttackerMotion(f);
 const left=f.physics.colliders.find(c=>c.role==='right-inner-lower'),right=f.physics.colliders.find(c=>c.role==='right-outer'),p=f.physics.pockets.find(p=>p.kind==='bonus');
 assert.equal(left.a.x,before.a.x-20);assert.equal(left.b.x,before.b.x-20);
 assert.equal(p.x-2.75,(left.b.x+right.b.x)/2);
 assert.ok(p.captureTray.left>left.b.x+1.5);assert.ok(p.captureTray.right<right.b.x-1.5);
});
