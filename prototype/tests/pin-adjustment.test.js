import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow,LEFT_ADMISSION_GUIDE_ROLES,LCD_LOWER_APRON_ROLES} from '../src/pixi/board-flow.js';
import {initialTrialCases,microTrialCases,resolvePinAdjustment,samePinAttributes,preparePinAdjustment} from '../src/dev/pin-adjustment.js';
import {measurePinAdjustment,classifyLCDContact,isFrontPlaneBall} from '../src/dev/pin-adjustment-measurement.js';
import {pocketCrossing} from '../src/physics/pocket-sensor.js';
import {sourcePoint,HESO_PINS_SOURCE,POCKETS_SOURCE} from '../src/pixi/source-layout.js';
test('source reproduction keeps all diagram walls and inlet contacts, only added tray removed',()=>{
 const current=createBoardFlow({lcd:true}).flow.physics,source=createBoardFlow({lcd:true,leftAdmissionGuides:false,hesoMouthWidth:12}).flow.physics;
 assert.deepEqual(LEFT_ADMISSION_GUIDE_ROLES,['heso-guide']);assert.equal(current.colliders.filter(c=>c.role==='heso-guide').length,8);assert.equal(source.colliders.filter(c=>c.role==='heso-guide').length,0);
 assert.equal(source.colliders.filter(c=>c.role==='left-inlet-guide').length,6);assert.equal(source.colliders.filter(c=>c.role.startsWith('lcd-boundary-')).length,28);
 assert.equal(LCD_LOWER_APRON_ROLES.length,5);assert.equal(source.colliders.filter(c=>LCD_LOWER_APRON_ROLES.includes(c.role)).length,5);
 assert.deepEqual(source.colliders.filter(c=>c.role!=='start-rim'),current.colliders.filter(c=>!['heso-guide','start-rim'].includes(c.role)));
 for(const k of ['pins','mechanisms','ballRadius','launchSpeedOffset','outlet','gate','rightChucker','launchExit'])assert.deepEqual(source[k],current[k],k);
});
test('source-inferred mouth12 shares sensor aperture and both rim positions, not heso pin gap',()=>{
 const current=createBoardFlow({lcd:true}).flow.physics,source=createBoardFlow({lcd:true,leftAdmissionGuides:false,hesoMouthWidth:12}).flow.physics,q=source.pockets.find(p=>p.kind==='start'),old=current.pockets.find(p=>p.kind==='start');
 assert.equal(q.w,POCKETS_SOURCE.find(p=>p.kind==='start').w*.5);assert.equal(old.w,20);
 const rim=source.colliders.filter(c=>c.role==='start-rim');assert.deepEqual(rim.map(c=>c.a.x).sort((a,b)=>a-b),[q.x-6,q.x+6]);assert.ok(rim.every(c=>c.a.y===q.y));
 const before={x:q.x+5,y:q.y-1},ball={x:q.x+5,y:q.y+1,vy:20,r:1.8};assert.equal(pocketCrossing(before,ball,q),null);assert.ok(pocketCrossing(before,ball,old));
 assert.deepEqual(source.pins.filter(p=>p.role==='heso').map(p=>[p.x,p.y]),HESO_PINS_SOURCE.map(sourcePoint));
});
test('position override refuses malformed IDs, contact attribute overrides and duplicates',()=>{
 for(const pinPositions of [[{id:999,x:1,y:1}],[{id:1,x:1,y:1,r:3}],[{id:1,x:NaN,y:1}],[{id:1,x:1,y:1},{id:1,x:2,y:2}]])assert.throws(()=>createBoardFlow({lcd:true,pinPositions}));assert.throws(()=>createBoardFlow({lcd:true,hesoMouthWidth:13}));
});
test('both reproduction cases preserve all 101 original pin coordinates and attributes',async()=>{
 const all=initialTrialCases(),base=resolvePinAdjustment(all[0]);for(const c of all){const r=await preparePinAdjustment(c);assert.equal(r.pins.length,101);assert.ok(samePinAttributes(base.pins,r.pins));assert.deepEqual(r.pins,base.pins);const actual=createBoardFlow({lcd:true,...r.flowOptions}).flow.physics.pins;assert.deepEqual(actual,r.pins);assert.match(r.layoutSHA,/^[a-f0-9]{64}$/);}
});
test('invalid adjustment is rejected without changing baseline',()=>{
 const c=initialTrialCases()[1],before=resolvePinAdjustment(c);for(const moves of [[{pinId:1,dx:2,dy:0}],[{pinId:1,dx:0,dy:Infinity}],[{pinId:1,dx:.5,dy:0},{pinId:1,dx:.5,dy:0}],[{pinId:999,dx:0,dy:0}]])assert.throws(()=>resolvePinAdjustment({...c,moves}));assert.deepEqual(resolvePinAdjustment(c),before);
});
test('short reproduction trial reconciles outcomes and its replay follows actual fixed physics time',()=>{
 const r=measurePinAdjustment(initialTrialCases()[1],{seconds:3,drain:1,replaySeconds:2});assert.ok(r.physical.reconciled);assert.ok(r.physical.countsMatchOutcomes);assert.equal(r.replayFrames.length,121);assert.equal(r.replayFrames[0].time,0);assert.ok(Math.abs(r.replayFrames.at(-1).time-2)<1e-9);for(const f of r.replayFrames)assert.equal(f.spawned,Object.values(f.counts).reduce((a,b)=>a+b,0)+f.inFlight);assert.equal(r.conditions.mouthWidth,12);assert.equal(r.conditions.guide,'source-walls-retained-no-added-heso-tray');
});
test('LCD observer distinguishes centre entry from radius-only overlap without changing ball',()=>{
 const centre={id:1,x:200,y:400,r:1.8,vx:1,vy:2},edge={id:2,x:83.5,y:303,r:1.8,vx:2,vy:3},outside={id:3,x:40,y:200,r:1.8},before=structuredClone([centre,edge,outside]);
 assert.equal(classifyLCDContact(centre),'centre');assert.equal(classifyLCDContact(edge),'boundary-only');assert.equal(classifyLCDContact(outside),'none');assert.deepEqual([centre,edge,outside],before);
});

test('launch backing-plane balls are excluded from front LCD intrusion while raw overlaps remain available',()=>{
 assert.equal(isFrontPlaneBall({separateLaunchPlane:true},{leftLaunchPlane:false}),false);
 assert.equal(isFrontPlaneBall({separateLaunchPlane:true},{}),false);
 assert.equal(isFrontPlaneBall({separateLaunchPlane:true},{leftLaunchPlane:true}),true);
 assert.equal(isFrontPlaneBall({separateLaunchPlane:false},{leftLaunchPlane:false}),true);
});

test('micro movement is cumulative from original centres and diagonal norm cannot exceed one',()=>{
 const base=initialTrialCases()[1],a=resolvePinAdjustment({...base,moves:[{pinId:91,dx:.6,dy:.8}]});assert.equal(a.pins.find(p=>p.id===91).x,203.85);assert.equal(a.pins.find(p=>p.id===91).y,544.55);
 assert.throws(()=>resolvePinAdjustment({...base,moves:[{pinId:91,dx:.8,dy:.8}]}));
 for(const c of microTrialCases()){const r=resolvePinAdjustment(c);for(const p of r.pins){const old=resolvePinAdjustment(base).pins.find(x=>x.id===p.id);assert.ok(Math.hypot(p.x-old.x,p.y-old.y)<=1+1e-12);}assert.equal(r.flowOptions.hesoMouthWidth,12);}
});

test('explicit trial radius1.8 matches sprite frame and keeps every original pin while product default stays unchanged',()=>{
 const old=createBoardFlow({lcd:true}).flow.physics;assert.equal(old.ballRadius,1.8);assert.equal(old.displayBallScale,1.8/4.6);
 const c={...initialTrialCases()[1],ballRadius:1.8},r=resolvePinAdjustment(c),m=createBoardFlow({lcd:true,...r.flowOptions}),p=m.flow.physics;
 assert.equal(p.ballRadius,1.8);assert.ok(Math.abs(28*p.displayBallScale/3-3.6)<1e-12);assert.deepEqual(p.pins,old.pins);assert.ok(samePinAttributes(old.pins,p.pins));
 m.setMode('normal');m.flow.start();m.flow.step(1/120);assert.equal(p.balls[0].r,1.8);
 assert.throws(()=>createBoardFlow({lcd:true,ballRadius:0}));assert.throws(()=>createBoardFlow({lcd:true,ballRadius:NaN}));assert.throws(()=>createBoardFlow({ballRadius:1.4}));
});
test('sphere diagnostic observers preserve fixed-radius mechanics and count actual solver subdivisions',()=>{
 const base=initialTrialCases()[1],r=measurePinAdjustment({...base,ballRadius:1.8},{seconds:3,drain:1});
 const model=createBoardFlow({lcd:true,...resolvePinAdjustment({...base,ballRadius:1.8}).flowOptions}),f=model.flow;model.setMode('normal');f.start();for(let i=0;i<360;i++)f.step(1/120);f.stop();for(let i=0;i<120;i++)f.step(1/120);
 assert.deepEqual(r.end.counts,f.counts);assert.deepEqual(r.frames.at(-1).balls,f.physics.balls.map(({id,x,y,r})=>({id,x,y,r})));assert.equal(r.physical.shots,f.physics.metrics.spawned);assert.equal(r.launchDiagnostics.physicsCalls,480);assert.ok(r.launchDiagnostics.minSubsteps>=5);assert.ok(r.launchDiagnostics.integrationSteps>=480*5);assert.equal(r.display.spriteBoundingDiameter,3.6);
});

test('normal launch power trial changes initial launch only; right power and default retained',()=>{
 const config={id:'power-contract',label:'通常強度契約',leftAdmissionGuides:false,hesoMouthWidth:12,ballRadius:1.8,launchRailProfile:'reference-exit',moves:[]};
 for(const power of [NaN,Infinity,-.1,1.1])assert.throws(()=>measurePinAdjustment(config,{seconds:1,drain:0,normalPower:power}),/Invalid trial normal power/);
 const a=measurePinAdjustment(config,{seconds:1,drain:0,replaySeconds:1}),b=measurePinAdjustment(config,{seconds:1,drain:0,replaySeconds:1,normalPower:.3});
 assert.equal(a.conditions.power,.2);assert.equal(b.conditions.power,.3);assert.deepEqual(a.fixed,b.fixed);assert.deepEqual(a.pins,b.pins);assert.notDeepEqual(a.replayFrames,b.replayFrames);
 const c=measurePinAdjustment(config,{mode:'rush',seconds:1,drain:0,replaySeconds:1}),d=measurePinAdjustment(config,{mode:'rush',seconds:1,drain:0,replaySeconds:1,normalPower:.3});assert.deepEqual(c.replayFrames,d.replayFrames);assert.equal(d.conditions.power,.85);
});

test('explicit rejected-strength comparison flows to trial only without changing product default',async()=>{
 const {normalStrengthComparisonCases}=await import('../src/dev/pin-adjustment.js'),config=normalStrengthComparisonCases().find(c=>c.normalPower===.14),resolved=resolvePinAdjustment(config);assert.equal(config.normalPower,.14);assert.equal(resolved.flowOptions.normalPower,.14);
 const stored=measurePinAdjustment(config,{seconds:1,drain:0,replaySeconds:1});assert.equal(stored.conditions.power,.14);
 const explicit=measurePinAdjustment({...config,normalPower:undefined},{seconds:1,drain:0,replaySeconds:1,normalPower:.14});assert.deepEqual(stored.replayFrames,explicit.replayFrames);
 assert.throws(()=>measurePinAdjustment(config,{seconds:1,drain:0,normalPower:.2}),/disagrees/);for(const power of [NaN,Infinity,-1,2])assert.throws(()=>resolvePinAdjustment({...config,normalPower:power}),/Invalid configured/);
 const product=createBoardFlow({lcd:true});product.setMode('normal');product.flow.start();product.flow.step(1/120);assert.equal(product.flow.physics.balls[0].power,.2);
});
