import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {inspectWindmillOffset,WINDMILL_ARM_CONTACT_RADIUS} from '../src/pixi/windmill-offset.js';
import {Physics} from '../src/physics/physics.js';
import {measurePinAdjustment} from '../src/dev/pin-adjustment-measurement.js';
import {resolvePinAdjustment} from '../src/dev/pin-adjustment.js';
import {withS7Observation} from '../src/dev/s7-launch-observation.js';
import {inspectShotCase,validateShotResult} from '../src/dev/s8-shot-comparison.js';
import {inspectWindmillCase,measureS8WindmillCase,validateWindmillResult,summarizeWindmillResult} from '../src/dev/s8-windmill-comparison.js';
import {parseShotArgs,readCaseManifest} from '../tools/s8-windmill-comparison.mjs';
const data=value=>JSON.parse(JSON.stringify(value));
const base=()=>({id:'baseline',label:'Direct test only',normalPower:.18,launchRailProfile:'legacy',hesoMouthWidth:20,leftAdmissionGuides:true,moves:[],windmillOffset:{dx:0,dy:0}});
const shifted=()=>({...base(),id:'left',windmillOffset:{dx:-.25,dy:0}});
function synthetic(operation){const step=Physics.prototype.step,canLaunch=Physics.prototype.canLaunch;Physics.prototype.canLaunch=()=>true;Physics.prototype.step=function(dt,game){this.time+=dt;this.updateGate(game);for(const b of this.balls){this.recordOutcome(b,'out');game.lose(b);}this.balls=[];};try{return operation();}finally{Physics.prototype.step=step;Physics.prototype.canLaunch=canLaunch;}}
test('default and explicit null factory are exactly equal; offset moves only original mechanism centre at construction',()=>{
 const original=createBoardFlow({lcd:true}).flow.physics;assert.deepEqual(data(createBoardFlow({lcd:true,windmillOffset:null}).flow.physics),data(original));
 for(const windmillOffset of [{dx:0,dy:0},{dx:-.25,dy:0},{dx:.25,dy:0},{dx:0,dy:-.25},{dx:0,dy:.25}]){const p=createBoardFlow({lcd:true,windmillOffset}).flow.physics,expected=createBoardFlow({lcd:true}).flow.physics;expected.mechanisms[0].x+=windmillOffset.dx;expected.mechanisms[0].y+=windmillOffset.dy;assert.deepEqual(data(p),data(expected));const proof=inspectWindmillOffset(original,windmillOffset);assert.ok(proof.margins.every(v=>v.gap>0));assert.equal(proof.sweptRadius,11.3);assert.ok(proof.margins.find(v=>v.kind==='pin'&&v.id===1).gap<3.6);}
});
test('bounded finite offset and material interference fail atomically, without a ball-clearance requirement',()=>{
 for(const offset of [{dx:NaN,dy:0},{dx:.251,dy:0},{dx:.25,dy:.25},{dx:0,dy:0,z:1},[],{}])assert.throws(()=>createBoardFlow({lcd:true,windmillOffset:offset}),/offset/);
 assert.throws(()=>createBoardFlow({windmillOffset:{dx:0,dy:0}}),/LCD/);
 for(const type of ['pin','wall','pocket','polygon']){const p=createBoardFlow({lcd:true}).flow.physics,before=structuredClone(p.mechanisms);if(type==='pin')p.pins.push({id:999,x:64,y:476.5,r:.2});if(type==='wall')p.colliders.push({role:'synthetic',a:{x:64,y:476},b:{x:64,y:477},r:0});if(type==='pocket')p.pockets.push({id:999,x:64,y:476.5,w:2});if(type==='polygon')p.colliders.push({role:'synthetic',shape:'solid-polygon',points:[{x:63,y:475},{x:65,y:475},{x:65,y:478},{x:63,y:478}]});assert.throws(()=>inspectWindmillOffset(p,{dx:0,dy:0}),/interference/);assert.deepEqual(p.mechanisms,before);}
});
test('windmill arm material radius is the solver contact1.3, not the layout metadata0.8',()=>{
 const p=new Physics();p.pins=[];p.colliders=[];p.mechanisms=[{kind:'windmill',x:100,y:100,radius:10,angle:0,omega:0}];p.gate.active=false;p.rightChucker.scoop.active=false;p.rightChucker.cover.active=false;
 const ball={id:1,x:105,y:103,r:1.8,vx:0,vy:-10,contactCount:0};p.advanceBall(ball,0);assert.equal(WINDMILL_ARM_CONTACT_RADIUS,1.3);assert.ok(ball.y>=103.099999);assert.ok(ball.vy>0);
});
test('only declared windmill cases, no pin moves or changes to fixed production conditions; old pin-only explicitly rejects even zero/null offsets',()=>{
 assert.equal(inspectWindmillCase(base()).valid,true);assert.equal(inspectWindmillCase(shifted()).valid,true);
 for(const change of [{moves:[{pinId:2,dx:0,dy:.25}]},{normalPower:.2},{ballRadius:1.8},{hesoMouthWidth:12},{leftAdmissionGuides:false},{launchRailProfile:'reference-exit'},{windmillOffset:{dx:.125,dy:0}}])assert.equal(inspectWindmillCase({...base(),...change}).valid,false);
 for(const windmillOffset of [null,{dx:0,dy:0},{dx:-.25,dy:0}])assert.equal(inspectShotCase({...base(),windmillOffset}).valid,false);
 const resolved=resolvePinAdjustment(shifted()),actual=createBoardFlow({lcd:true,...resolved.flowOptions}).flow.physics;assert.deepEqual(resolved.flowOptions.windmillOffset,{dx:-.25,dy:0});assert.equal(actual.mechanisms[0].x,63.75);assert.deepEqual(actual.pins,createBoardFlow({lcd:true}).flow.physics.pins);
});
test('short physical observer ON/OFF keeps full events, positions, counts, fixed inputs; unspecified old time output has no offset key',()=>{
 const o={seconds:1,drain:1,replaySeconds:2,replayFPS:30},plain=measurePinAdjustment(shifted(),o),observed=withS7Observation(()=>measurePinAdjustment(shifted(),o)).result;assert.deepEqual(plain,observed);assert.equal(plain.fixed.mechanisms[0].x,63.75);assert.ok(plain.replayFrames.every(f=>f.mechanisms[0].x===63.75));const {windmillOffset,...legacy}=base(),r=measurePinAdjustment(legacy,o);assert.equal('windmillOffset'in r.config,false);assert.equal('shotLimit'in r.conditions,false);
});
test('synthetic250 control validates declared geometry at both factory and normalized end, rejects changed centres/attributes/gates/pins',()=>{
 const r=synthetic(()=>measureS8WindmillCase(shifted()));assert.equal(r.physical.shots,250);assert.equal(r.end.counts.out,250);assert.equal(validateWindmillResult(r),true);assert.equal(summarizeWindmillResult(r).shots,250);assert.equal(r.replaySampling.endStep-r.replaySampling.stopStep,5400);assert.throws(()=>validateShotResult(r));
 for(const at of ['fixed','fixedAtEnd'])for(const key of ['x','y','radius','armRadius','kind']){const bad=structuredClone(r);bad[at].mechanisms[0][key]=key==='kind'?'changed':bad[at].mechanisms[0][key]+.001;assert.throws(()=>validateWindmillResult(bad),/mechanism/);}
 for(const location of ['regular','stop','end'])for(const key of ['x','radius','kind','angle','omega']){const bad=structuredClone(r),frame=location==='regular'?bad.replayFrames[1]:bad.replayEndpoints[location];frame.mechanisms[0][key]=key==='kind'?'changed':key==='angle'||key==='omega'?NaN:frame.mechanisms[0][key]+.01;assert.throws(()=>validateWindmillResult(bad),/Replay mechanism/);}
 const dynamic=structuredClone(r);Object.assign(dynamic.fixedAtEnd.mechanisms[0],{angle:1.2,omega:-2,lastHit:3});assert.equal(validateWindmillResult(dynamic),true);
 const changed=structuredClone(r);changed.fixedAtEnd.gate.a.x+=.1;assert.throws(()=>validateWindmillResult(changed),/fixed input/);const pin=structuredClone(r);pin.pinsAtEnd[0].x+=.1;assert.throws(()=>validateWindmillResult(pin),/pin layout/);const truncated=structuredClone(r);truncated.replayFrames.pop();assert.throws(()=>validateWindmillResult(truncated),/replay/);
 const phase=synthetic(()=>measureS8WindmillCase(base(),{phase:.175}));assert.equal(validateWindmillResult(phase),true);
});
test('runner retains explicit one-case/phase and frozen source requirement, no automatic batch',async()=>{
 const args=['--out','out','--plan','plan','--manifest','manifest','--case','baseline','--phase','0'];assert.equal(parseShotArgs([...args,'--stage','preflight'])['--stage'],'preflight');assert.throws(()=>parseShotArgs([...args,'--stage','run']),/source SHA/);assert.throws(()=>parseShotArgs([...args,'--stage','run','--expected-source','a'.repeat(64),'--batch','true']),/Unknown/);
 const manifest=await readFile(new URL('../tools/s8-windmill-cases.json',import.meta.url),'utf8');for(const c of JSON.parse(manifest).cases)assert.equal(inspectWindmillCase(readCaseManifest(manifest,c.id)).valid,true);
});
