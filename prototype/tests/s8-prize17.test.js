import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{createBoardFlow}from'../src/pixi/board-flow.js';
import{resolvePinAdjustment,prize17Moves}from'../src/dev/pin-adjustment.js';
import{inspectAdmissionCase,prepareAdmissionCase}from'../src/dev/s8-admission-comparison.js';
import{inspectShotCase}from'../src/dev/s8-shot-comparison.js';import{inspectWindmillCase}from'../src/dev/s8-windmill-comparison.js';import{inspectWheelShapeCase}from'../src/dev/s8-wheel-shape-comparison.js';
const cases=JSON.parse(readFileSync(new URL('../tools/s8-prize17-cases.json',import.meta.url))).cases,plain=x=>JSON.parse(JSON.stringify(x));
test('prize17 exact group preserves all101 attributes, other84 positions and internal relative positions with existing geometry guards',()=>{
 const old=JSON.parse(readFileSync(new URL('../tools/s8-road-transition-cases.json',import.meta.url))).cases;assert.deepEqual(cases.slice(0,2),old.slice(0,2));assert.equal(cases.length,3);const c=cases[2],inspection=inspectAdmissionCase(c);assert.equal(inspection.valid,true,inspection.skipReason);assert.deepEqual(c.moves,Array.from({length:17},(_,i)=>({pinId:47+i,dx:-2,dy:0})));assert.deepEqual(prize17Moves(),c.moves);
 const original=createBoardFlow({lcd:true}).flow.physics.pins,pins=inspection.layout.pins;assert.equal(pins.length,101);assert.equal(new Set(pins.map(p=>p.id)).size,101);
 for(const p of pins){const q=original.find(q=>q.id===p.id);assert.deepEqual(p,{...q,x:q.x+(p.id>=47&&p.id<=63?-2:0)});}
 for(const a of pins.filter(p=>p.id>=47&&p.id<=63))for(const b of pins){if(a.id===b.id)continue;assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=4-1e-9);if(b.id>=47&&b.id<=63){const oa=original.find(p=>p.id===a.id),ob=original.find(p=>p.id===b.id);assert.equal(a.x-b.x,oa.x-ob.x);assert.equal(a.y-b.y,oa.y-ob.y);}}
});
test('exact identity only: old max1 and other comparers reject large displacement; subset/mixed/condition changes rejected',()=>{
 const c=cases[2];assert.throws(()=>resolvePinAdjustment({...c,id:'unapproved'}),/limited to 1/);assert.throws(()=>resolvePinAdjustment({...cases[1],moves:[{pinId:48,dx:-1.001,dy:0}]}),/limited to 1/);
 for(const patch of[{moves:c.moves.slice(1)},{moves:c.moves.slice().reverse()},{moves:[...c.moves,{pinId:46,dx:-2,dy:0}]},{moves:c.moves.map(m=>({...m,dx:-2.001}))},{moves:c.moves.map(m=>({...m,dy:.001}))},{ballRadius:1.8},{windmillOffset:{dx:-.25,dy:0}},{windmillShapeProfile:'legacy-capsules'},{normalPower:.2},{hesoMouthWidth:12},{leftAdmissionGuides:true},{launchRailProfile:'reference-exit'},{maximumDisplacement:2}]){assert.throws(()=>resolvePinAdjustment({...c,...patch}));assert.equal(inspectAdmissionCase({...c,...patch}).valid,false);}
 assert.throws(()=>resolvePinAdjustment(c,{pinSpacingProfile:'road-support-2-3-v1'}));assert.throws(()=>resolvePinAdjustment(c,{windmillOffsetProfile:'feed-left175-v1'}));for(const inspect of[inspectShotCase,inspectWindmillCase,inspectWheelShapeCase])assert.equal(inspect(c).valid,false);
});
test('factory whole initial object differs only by declared pin positions, with unchanged fixed geometry and physics prototype',async()=>{
 const base=await prepareAdmissionCase(cases[1]),candidate=await prepareAdmissionCase(cases[2]),original=createBoardFlow({lcd:true,...base.flowOptions}).flow.physics,actual=createBoardFlow({lcd:true,...candidate.flowOptions}).flow.physics,expected=plain(original);expected.pins=candidate.pins;assert.deepEqual(plain(actual),expected);assert.equal(Object.getPrototypeOf(actual),Object.getPrototypeOf(original));assert.deepEqual(Object.getOwnPropertyNames(actual),Object.getOwnPropertyNames(original));assert.deepEqual(candidate.flowOptions,{...base.flowOptions,pinPositions:candidate.pinPositions});
});
