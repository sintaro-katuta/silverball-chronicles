import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{createBoardFlow}from'../src/pixi/board-flow.js';import{Physics}from'../src/physics/physics.js';
import{resolvePinAdjustment,roadTransitionMoves}from'../src/dev/pin-adjustment.js';
import{inspectAdmissionCase,prepareAdmissionCase,measureAdmissionCase,validateAdmissionResult}from'../src/dev/s8-admission-comparison.js';
import{inspectShotCase}from'../src/dev/s8-shot-comparison.js';import{inspectWindmillCase}from'../src/dev/s8-windmill-comparison.js';import{inspectWheelShapeCase}from'../src/dev/s8-wheel-shape-comparison.js';
const cases=JSON.parse(readFileSync(new URL('../tools/s8-road-transition-cases.json',import.meta.url))).cases,plain=x=>JSON.parse(JSON.stringify(x));
function synthetic(operation){const step=Physics.prototype.step,can=Physics.prototype.canLaunch;Physics.prototype.canLaunch=()=>true;Physics.prototype.step=function(dt,game){this.time+=dt;this.updateGate(game);for(const b of this.balls){this.recordOutcome(b,'out');game.lose(b);}this.balls=[];};try{return operation();}finally{Physics.prototype.step=step;Physics.prototype.canLaunch=can;}}
test('transition manifest retains controls/reference and exactly22-flat/25-linear declared original-pin displacements',()=>{
 assert.deepEqual(cases.map(c=>c.id),['legacy-control','three-base','three-road-group-up200','three-road-entry22-up200','three-road-taper25-up200']);const old=JSON.parse(readFileSync(new URL('../tools/s8-road-group-cases.json',import.meta.url))).cases;assert.deepEqual(cases.slice(0,3),[...old.slice(0,2),old[4]]);
 const original=createBoardFlow({lcd:true}).flow.physics.pins;
 for(const[c,n]of[[cases[3],22],[cases[4],25]]){const i=inspectAdmissionCase(c);assert.equal(i.valid,true,i.skipReason);assert.deepEqual(i.resolutionOptions,{pinSpacingProfile:'strict-centre4-v1'});assert.equal(i.layout.pins.length,101);assert.deepEqual(c.moves,Array.from({length:n},(_,j)=>({pinId:j+1,dx:0,dy:n===22?-2:-2*(26-(j+1))/25})));
  for(const p of i.layout.pins){const old=original.find(q=>q.id===p.id),dy=p.id<=n?(n===22?-2:-2*(26-p.id)/25):0;assert.deepEqual(p,{...old,y:old.y+dy});}
  for(let a=0;a<i.layout.pins.length;a++)for(let b=a+1;b<i.layout.pins.length;b++){const p=i.layout.pins[a],q=i.layout.pins[b];if(p.id<=n||q.id<=n)assert.ok(Math.hypot(p.x-q.x,p.y-q.y)>=4-1e-9);}
  assert.deepEqual(i.layout.pins.find(p=>p.id===26),original.find(p=>p.id===26));
 }
});
test('default max1 and historical groups unchanged; transition identity rejects partial/mixed/quantity/condition overrides',()=>{
 assert.throws(()=>roadTransitionMoves('toString'),/Unknown/);assert.throws(()=>resolvePinAdjustment({...cases[3],id:'other'}),/limited to 1/);assert.throws(()=>resolvePinAdjustment({...cases[1],moves:[{pinId:2,dx:1.01,dy:0}]}),/limited to 1/);
 for(const c of cases.slice(3)){
  for(const patch of[{moves:c.moves.slice(1)},{moves:c.moves.slice().reverse()},{moves:[...c.moves,c.moves[0]]},{moves:[...c.moves,{pinId:26,dx:0,dy:0}]},{moves:c.moves.map(m=>({...m,dy:m.dy-.001}))},{moves:c.moves.map(m=>({...m,dx:.1}))},{ballRadius:1.8},{windmillOffset:{dx:-.25,dy:0}},{windmillShapeProfile:'legacy-capsules'},{normalPower:.2},{hesoMouthWidth:12},{leftAdmissionGuides:true},{launchRailProfile:'reference-exit'},{maximumDisplacement:2}]){assert.throws(()=>resolvePinAdjustment({...c,...patch}));assert.equal(inspectAdmissionCase({...c,...patch}).valid,false);}
  assert.throws(()=>resolvePinAdjustment(c,{pinSpacingProfile:'road-support-2-3-v1'}));assert.throws(()=>resolvePinAdjustment(c,{windmillOffsetProfile:'feed-left175-v1'}));for(const inspect of[inspectShotCase,inspectWindmillCase,inspectWheelShapeCase])assert.equal(inspect(c).valid,false);
 }
});
test('factory receives only declared pin-position differences; all fixed parts/physics/display and original prototypes match',async()=>{
 const base=await prepareAdmissionCase(cases[1]),model=createBoardFlow({lcd:true,...base.flowOptions}).flow.physics;
 for(const c of cases.slice(3)){const p=await prepareAdmissionCase(c),actual=createBoardFlow({lcd:true,...p.flowOptions}).flow.physics,expected=plain(model);expected.pins=p.pins;assert.deepEqual(plain(actual),expected);assert.equal(Object.getPrototypeOf(actual),Object.getPrototypeOf(model));assert.deepEqual(Object.getOwnPropertyNames(actual),Object.getOwnPropertyNames(model));assert.equal(Object.hasOwn(p.flowOptions,'windmillOffsetProfile'),false);}
});
test('synthetic250 transition records stop/drain and original attrs, rejecting terminal/frame corruption',()=>{
 for(const c of cases.slice(3)){const r=synthetic(()=>measureAdmissionCase(c));assert.equal(validateAdmissionResult(r),true);assert.equal(r.physical.shots,250);assert.equal(r.end.remaining,0);assert.equal(r.replaySampling.endStep-r.replaySampling.stopStep,5400);for(const edit of[x=>x.pinsAtEnd.find(p=>p.id===26).y++,x=>x.pinsAtEnd.find(p=>p.id===1).y++,x=>x.replayFrames[1].mechanisms[0].x++]){const bad=structuredClone(r);edit(bad);assert.throws(()=>validateAdmissionResult(bad));}assert.throws(()=>measureAdmissionCase(c,{mode:'rush'}),/phase/);}
});
