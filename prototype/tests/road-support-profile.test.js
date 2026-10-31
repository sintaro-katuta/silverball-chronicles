import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{resolvePinAdjustment,preparePinAdjustment,inspectRoadSupportPair,PIN_SPACING_STRICT,ROAD_SUPPORT_PAIR23,LCD_PIN_HEAD_FRAME_WIDTH}from'../src/dev/pin-adjustment.js';
import{measurePinAdjustment}from'../src/dev/pin-adjustment-measurement.js';import{inspectAdmissionCase,prepareAdmissionCase,measureAdmissionCase,validateAdmissionResult}from'../src/dev/s8-admission-comparison.js';
import{inspectShotCase}from'../src/dev/s8-shot-comparison.js';import{inspectWindmillCase}from'../src/dev/s8-windmill-comparison.js';import{inspectWheelShapeCase}from'../src/dev/s8-wheel-shape-comparison.js';
import{measureS6}from'../src/dev/s6-pin-comparison.js';import{measureReference}from'../src/dev/s6-reference-pin-comparison.js';import{measureS8}from'../src/dev/s8-pin-comparison.js';
import{parseShotArgs}from'../tools/s8-admission-comparison.mjs';
import{Physics}from'../src/physics/physics.js';import{withPhysicsTrace}from'../src/physics/passive-trace.js';import{withS7Observation}from'../src/dev/s7-launch-observation.js';
const cases=JSON.parse(readFileSync(new URL('../tools/s8-road-support-cases.json',import.meta.url))).cases,candidate=()=>structuredClone(cases[2]),profile={pinSpacingProfile:ROAD_SUPPORT_PAIR23},plain=x=>JSON.parse(JSON.stringify(x));
function synthetic(operation){const step=Physics.prototype.step,canLaunch=Physics.prototype.canLaunch;Physics.prototype.canLaunch=()=>true;Physics.prototype.step=function(dt,game){this.time+=dt;this.updateGate(game);for(const b of this.balls){this.recordOutcome(b,'out');game.lose(b);}this.balls=[];};try{return operation();}finally{Physics.prototype.step=step;Physics.prototype.canLaunch=canLaunch;}}
test('default and all previous comparison APIs reject the old right0.5; profile cannot enter through old config or options',async()=>{
 const c=candidate(),o={seconds:1,drain:0,replaySeconds:1,pinSpacingProfile:ROAD_SUPPORT_PAIR23};assert.throws(()=>resolvePinAdjustment(c),/below 4/);await assert.rejects(preparePinAdjustment(c),/below 4/);
 const originalMethods=[Physics.prototype.step,Physics.prototype.advanceBall,Physics.prototype.resolvePins];for(const run of [measurePinAdjustment,measureS6,measureReference,measureS8])assert.throws(()=>run(c,o),/below 4|declared independent/);assert.deepEqual([Physics.prototype.step,Physics.prototype.advanceBall,Physics.prototype.resolvePins],originalMethods);
 for(const inspect of [inspectShotCase,inspectWindmillCase,inspectWheelShapeCase])assert.equal(inspect(c).valid,false);
 for(const id of ['three-road2-right050','three-road2-right025','three-base'])assert.equal(inspectAdmissionCase({...c,id}).valid,false);
 assert.throws(()=>parseShotArgs(['--out','out','--plan','plan','--manifest','manifest','--case',c.id,'--phase','0','--mode','normal','--stage','preflight','--pin-spacing-profile',ROAD_SUPPORT_PAIR23]),/Unknown/);
 assert.throws(()=>resolvePinAdjustment({...c,pinSpacingProfile:ROAD_SUPPORT_PAIR23},profile),/configuration/);assert.throws(()=>resolvePinAdjustment(c,{pinSpacingProfile:'unknown'}),/Unknown/);
});
test('support23 exactcase requires original radii/roles, non-overlapping shafts and conservative head frames',()=>{
 const r=resolvePinAdjustment(candidate(),profile),a=r.pins.find(p=>p.id===2),b=r.pins.find(p=>p.id===3),proof=inspectRoadSupportPair(a,b);assert.ok(Math.abs(proof.centreDistance-Math.hypot(3.25,2))<1e-12);assert.ok(proof.ballGapMargin<0);assert.ok(proof.shaftGap>0);assert.equal(proof.headFramesDisjoint,true);assert.equal(LCD_PIN_HEAD_FRAME_WIDTH,14*.52/3);
 assert.throws(()=>inspectRoadSupportPair(a,{...b,role:'heso'}),/limited/);assert.throws(()=>inspectRoadSupportPair(a,{...b,id:4}),/limited/);assert.throws(()=>inspectRoadSupportPair({...a,x:0,y:0},{...b,x:.3,y:0}),/shafts/);assert.throws(()=>inspectRoadSupportPair({...a,x:0,y:0},{...b,x:1,y:0}),/head/);
 for(const change of [{moves:[{pinId:2,dx:.5,dy:0},{pinId:90,dx:0,dy:-.25}]},{id:'old-case'},{ballRadius:1.8},{windmillOffset:{dx:0,dy:-.25}},{moves:[{pinId:3,dx:-.5,dy:0}]}])assert.throws(()=>resolvePinAdjustment({...candidate(),...change},profile),/exact declared/);
 const runtime=readFileSync(new URL('../src/pixi/board-runtime.js',import.meta.url),'utf8'),texture=readFileSync(new URL('../src/pixi/pin-texture.js',import.meta.url),'utf8');assert.ok(runtime.includes('s.scale.set((lcdEnabled?LCD_PIN_TEXTURE_SCALE:1)/3)'));assert.ok(texture.includes('pixelSurface(14,14,'));
});
test('exception is onlypair2/3; original101 attributes, other pair threshold, fixed inputs and standard metadata stay unchanged',()=>{
 const c=candidate(),r=resolvePinAdjustment(c,profile),base=resolvePinAdjustment(cases[1]);for(const p of r.pins){const old=base.pins.find(q=>q.id===p.id);assert.deepEqual(p,{...old,x:old.x+(p.id===2?.5:0)});}assert.equal(r.pins.length,101);assert.equal(r.pinSpacingInspection.profile,ROAD_SUPPORT_PAIR23);assert.deepEqual({...r.flowOptions,pinPositions:base.pinPositions},base.flowOptions);
 assert.deepEqual(resolvePinAdjustment(cases[1]),resolvePinAdjustment(cases[1],{pinSpacingProfile:PIN_SPACING_STRICT}));assert.equal('pinSpacingInspection'in base,false);
 // Without the exception the neighbouring3 is rejected, and no other moved pair gains one.
 assert.throws(()=>resolvePinAdjustment({...cases[1],moves:[{pinId:3,dx:-.5,dy:0}]}),/below 4/);
});
test('real unchanged pin solver records correction and reflection separately; no hidden support wall or altered coefficient',()=>{
 const r=resolvePinAdjustment(candidate(),profile),pins=r.pins.filter(p=>[2,3].includes(p.id)),p=new Physics();p.pins=structuredClone(pins);p.separateLaunchPlane=false;
 for(const vy of [20,-20]){const b={id:1,x:pins[0].x,y:pins[0].y-1.9,r:1.8,vx:0,vy,hits:0,contactCount:0,leftLaunchPlane:true},before={...b},events=[];withPhysicsTrace(()=>p.resolvePins(b),e=>events.push(e));assert.ok(b.y<before.y);assert.ok(events.some(e=>e.type==='contact'&&e.part.kind==='pin'&&e.part.id===2));assert.equal(b.hits,vy>0?1:0);assert.equal(b.vy,vy>0?-17:-20);assert.deepEqual(p.pins,pins);}
});
test('new profile is non-acting beyond declared coordinates, and actual short output is identical with observer ON/OFF',()=>{
 const c=candidate(),o={seconds:2,drain:1,replaySeconds:3,replayFPS:30},a=measurePinAdjustment(c,o,profile),b=withS7Observation(()=>measurePinAdjustment(c,o,profile)).result;assert.deepEqual(a,b);assert.equal(a.validationProfile,ROAD_SUPPORT_PAIR23);assert.equal(a.conditions.pinSpacingProfile,ROAD_SUPPORT_PAIR23);assert.ok(a.physical.reconciled);assert.equal(a.fixed.ballRadius,1.8);assert.equal(a.pins.find(p=>p.id===2).x,76.75);
});
test('dedicated prepare and exact250 control preserve profile identity/geometry; missing or mixed policy is rejected',async()=>{
 const c=candidate(),prep=await prepareAdmissionCase(c);assert.equal(prep.pinSpacingInspection.profile,ROAD_SUPPORT_PAIR23);const r=synthetic(()=>measureAdmissionCase(c));assert.equal(validateAdmissionResult(r),true);assert.equal(r.physical.shots,250);assert.equal(r.conditions.pinSpacingProfile,ROAD_SUPPORT_PAIR23);
 for(const edit of [x=>delete x.validationProfile,x=>delete x.conditions.pinSpacingProfile,x=>x.validationProfile=PIN_SPACING_STRICT,x=>x.pinsAtEnd.find(p=>p.id===3).x+=.1]){const b=structuredClone(r);edit(b);assert.throws(()=>validateAdmissionResult(b));}
 const old=synthetic(()=>measureAdmissionCase(cases[1]));assert.equal('validationProfile'in old,false);const injected=structuredClone(old);injected.validationProfile=ROAD_SUPPORT_PAIR23;injected.conditions.pinSpacingProfile=ROAD_SUPPORT_PAIR23;assert.throws(()=>validateAdmissionResult(injected),/profile mismatch/);
});
