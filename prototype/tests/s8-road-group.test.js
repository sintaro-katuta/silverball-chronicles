import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync}from'node:fs';
import{createBoardFlow}from'../src/pixi/board-flow.js';import{Physics}from'../src/physics/physics.js';
import{resolvePinAdjustment,roadGroupMoves}from'../src/dev/pin-adjustment.js';
import{inspectAdmissionCase,prepareAdmissionCase,measureAdmissionCase,validateAdmissionResult}from'../src/dev/s8-admission-comparison.js';
import{inspectShotCase}from'../src/dev/s8-shot-comparison.js';import{inspectWindmillCase}from'../src/dev/s8-windmill-comparison.js';import{inspectWheelShapeCase}from'../src/dev/s8-wheel-shape-comparison.js';
const cases=JSON.parse(readFileSync(new URL('../tools/s8-road-group-cases.json',import.meta.url))).cases,plain=x=>JSON.parse(JSON.stringify(x));
function synthetic(operation){const step=Physics.prototype.step,can=Physics.prototype.canLaunch;Physics.prototype.canLaunch=()=>true;Physics.prototype.step=function(dt,game){this.time+=dt;this.updateGate(game);for(const b of this.balls){this.recordOutcome(b,'out');game.lose(b);}this.balls=[];};try{return operation();}finally{Physics.prototype.step=step;Physics.prototype.canLaunch=can;}}
test('exact three26-pin translations preserve every internal pair, original101 attributes, other75 positions and strict spacing',()=>{
 assert.deepEqual(cases.map(c=>c.id),['legacy-control','three-base','three-road-group-left300','three-road-group-right300','three-road-group-up200']);assert.deepEqual(cases.slice(0,2),JSON.parse(readFileSync(new URL('../tools/s8-upper-feed-cases.json',import.meta.url))).cases.slice(0,2));
 const original=createBoardFlow({lcd:true}).flow.physics.pins;
 for(const[c,dx,dy]of[[cases[2],-3,0],[cases[3],3,0],[cases[4],0,-2]]){const i=inspectAdmissionCase(c);assert.equal(i.valid,true,i.skipReason);assert.deepEqual(i.resolutionOptions,{pinSpacingProfile:'strict-centre4-v1'});assert.equal(i.pinSpacingInspection,null);assert.equal(i.layout.pins.length,101);assert.deepEqual(c.moves,Array.from({length:26},(_,j)=>({pinId:j+1,dx,dy})));
  for(const p of i.layout.pins){const old=original.find(q=>q.id===p.id);assert.deepEqual(p,{...old,x:old.x+(p.id<=26?dx:0),y:old.y+(p.id<=26?dy:0)});}
  for(let a=1;a<=26;a++)for(let b=a+1;b<=26;b++){const x=i.layout.pins.find(p=>p.id===a),y=i.layout.pins.find(p=>p.id===b),ox=original.find(p=>p.id===a),oy=original.find(p=>p.id===b);assert.equal(x.x-y.x,ox.x-oy.x);assert.equal(x.y-y.y,ox.y-oy.y);}
  for(const a of i.layout.pins.filter(p=>p.id<=26))for(const b of i.layout.pins.filter(p=>p.id>26))assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=4);
 }
});
test('ordinary max1 remains; partial/mixed/reordered/amount and fixed-condition alterations cannot borrow group identity',()=>{
 const original=structuredClone(cases[2]);assert.throws(()=>resolvePinAdjustment({...original,id:'arbitrary'}),/limited to 1/);assert.throws(()=>resolvePinAdjustment({...cases[1],moves:[{pinId:2,dx:1.01,dy:0}]}),/limited to 1/);assert.throws(()=>roadGroupMoves('toString'),/Unknown/);
 for(const c of cases.slice(2)){
  for(const patch of[{moves:c.moves.slice(1)},{moves:c.moves.slice().reverse()},{moves:[...c.moves,c.moves[0]]},{moves:[...c.moves,{pinId:27,dx:0,dy:0}]},{moves:c.moves.map(m=>({...m,dx:m.dx+.01}))},{moves:c.moves.map(m=>({...m,dy:m.dy+.01}))},{ballRadius:1.8},{windmillOffset:{dx:-.25,dy:0}},{windmillShapeProfile:'legacy-capsules'},{normalPower:.2},{hesoMouthWidth:12},{leftAdmissionGuides:true},{launchRailProfile:'reference-exit'},{maximumDisplacement:3}]){assert.throws(()=>resolvePinAdjustment({...c,...patch}));assert.equal(inspectAdmissionCase({...c,...patch}).valid,false);}
  assert.throws(()=>resolvePinAdjustment(c,{pinSpacingProfile:'road-support-2-3-v1'}));assert.throws(()=>resolvePinAdjustment(c,{windmillOffsetProfile:'feed-left175-v1'}));for(const inspect of[inspectShotCase,inspectWindmillCase,inspectWheelShapeCase])assert.equal(inspect(c).valid,false);
 }
});
test('factory replay mount uses declared positions and only pins differ: walls/outlet/pockets/mechanism/coefficients exact',async()=>{
 const base=await prepareAdmissionCase(cases[1]),baseline=createBoardFlow({lcd:true,...base.flowOptions}).flow.physics;
 for(const c of cases.slice(2)){const prepared=await prepareAdmissionCase(c),actual=createBoardFlow({lcd:true,...prepared.flowOptions}).flow.physics,expected=plain(baseline);expected.pins=prepared.pins;assert.deepEqual(plain(actual),expected);assert.equal(Object.getPrototypeOf(actual),Object.getPrototypeOf(baseline));assert.deepEqual(Object.getOwnPropertyNames(actual),Object.getOwnPropertyNames(baseline));assert.equal(Object.hasOwn(prepared.flowOptions,'windmillOffsetProfile'),false);assert.equal(actual.mechanisms[0].x,64);assert.equal(actual.mechanisms[0].y,476.5);}
});
test('synthetic250 group records validate full fixed inputs and reject altered final pins/mechanisms',()=>{
 for(const c of cases.slice(2)){const r=synthetic(()=>measureAdmissionCase(c));assert.equal(validateAdmissionResult(r),true);assert.equal(r.physical.shots,250);assert.equal(r.end.remaining,0);assert.equal(r.display.ballRadius,1.8);assert.equal(r.replaySampling.endStep-r.replaySampling.stopStep,5400);for(const edit of[x=>x.pinsAtEnd.find(p=>p.id===27).x++,x=>x.pinsAtEnd.find(p=>p.id===1).x++,x=>x.replayFrames[1].mechanisms[0].x++]){const bad=structuredClone(r);edit(bad);assert.throws(()=>validateAdmissionResult(bad));}assert.throws(()=>measureAdmissionCase(c,{mode:'rush'}),/phase/);}
});
