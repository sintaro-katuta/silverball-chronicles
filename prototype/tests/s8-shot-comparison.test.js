import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {Physics} from '../src/physics/physics.js';
import {measurePinAdjustment} from '../src/dev/pin-adjustment-measurement.js';
import {withS7Observation} from '../src/dev/s7-launch-observation.js';
import {inspectShotCase,measureS8ShotCase,validateShotResult,summarizeShotResult} from '../src/dev/s8-shot-comparison.js';
import {parseShotArgs,readCaseManifest} from '../tools/s8-shot-comparison.mjs';
const baseline=()=>({id:'baseline',label:'Synthetic/direct test control',normalPower:.18,launchRailProfile:'legacy',hesoMouthWidth:20,leftAdmissionGuides:true,moves:[]});
function withSyntheticDrain(operation){
 const step=Physics.prototype.step,canLaunch=Physics.prototype.canLaunch;
 // Control-flow fixture only: actual factory spawn/cadence/IDs/counts are kept,
 // while every spawned ball is deterministically drained without running contacts.
 Physics.prototype.canLaunch=()=>true;
 Physics.prototype.step=function(dt,game){this.time+=dt;this.updateGate(game);for(const b of this.balls){this.recordOutcome(b,'out');game.lose(b);}this.balls=[];};
 try{return operation();}finally{Physics.prototype.step=step;Physics.prototype.canLaunch=canLaunch;}
}
test('time mode omitted/undefined shotLimit remains byte-for-byte compatible with no new endpoint fields',()=>{
 const config=baseline(),o={seconds:2,drain:1,replaySeconds:3,replayFPS:30};
 const a=measurePinAdjustment(config,o),b=measurePinAdjustment(config,{...o,shotLimit:undefined});assert.deepEqual(a,b);assert.equal('shotLimit'in a.conditions,false);assert.equal('replayEndpoints'in a,false);assert.equal(a.replayFrames.length,91);
});
test('count stopping preserves real physical events and45second drain without a next shot; non-grid endpoints separate',()=>{
 const r=measurePinAdjustment(baseline(),{shotLimit:3,seconds:5,drain:45,replaySeconds:50,replayFPS:30}),shots=r.events.filter(e=>e.type==='shot');
 assert.equal(r.physical.shots,3);assert.equal(shots.length,3);assert.equal(r.atStop.counts.start+r.atStop.counts.normal+r.atStop.counts.out+r.atStop.counts.returned+r.atStop.remaining,3);
 assert.ok(Math.abs(r.atStop.time-shots.at(-1).time-1/120)<1e-9);assert.equal(r.conditions.actualDrainSeconds,45);assert.equal(r.end.remaining,0);assert.equal(r.physical.outcomes,3);assert.equal(r.replayEndpoints.stop.time,r.atStop.time);assert.equal(r.replayEndpoints.end.time,r.end.time);assert.deepEqual(r.replayEndpoints.end.counts,r.end.counts);
 assert.equal(r.replayFrames.length,Math.floor(r.replaySampling.endStep/4)+1);assert.ok(r.replayFrames.every((f,i)=>Math.abs(f.time-i/30)<1e-8));assert.ok(r.replayFrames.at(-1).time<=r.end.time+1e-8);assert.equal(r.replaySampling.stopOnGrid,false);assert.ok(r.replayFrames.at(-1).time<r.end.time);
});
test('same stop-limit run with observer ON/OFF retains every coordinate,event,count and fixed input',()=>{
 const config=baseline(),o={shotLimit:3,seconds:5,drain:2,replaySeconds:7,replayFPS:30},plain=measurePinAdjustment(config,o),observed=withS7Observation(()=>measurePinAdjustment(config,o)).result;
 assert.deepEqual(observed,plain);
});
test('exact250 is tested with a declared synthetic drain, not a long physical selection trial',()=>{
 const r=withSyntheticDrain(()=>measureS8ShotCase(baseline()));assert.equal(r.physical.shots,250);assert.equal(r.physical.outcomes,250);assert.equal(r.end.counts.out,250);assert.equal(r.end.remaining,0);assert.equal(r.observation.shotLimitReached,true);assert.equal(validateShotResult(r),true);assert.equal(summarizeShotResult(r).shots,250);assert.equal(summarizeShotResult(r).start,0);
 const shots=r.events.filter(e=>e.type==='shot');assert.equal(shots.at(-1).ballId,250);assert.ok(Math.abs(r.atStop.time-shots.at(-1).time-1/120)<1e-8);assert.equal(r.replayEndpoints.end.spawned,250);assert.equal(r.replaySampling.endStep-r.replaySampling.stopStep,5400);
 const oracle=createBoardFlow({lcd:true});oracle.setMode('normal');const initial=structuredClone({gate:oracle.flow.physics.gate,rightChucker:oracle.flow.physics.rightChucker});oracle.flow.step(0);assert.deepEqual(oracle.flow.physics.gate,initial.gate);oracle.flow.step(1/120);assert.notDeepEqual(oracle.flow.physics.gate,initial.gate);assert.notDeepEqual(oracle.flow.physics.rightChucker,initial.rightChucker);
 assert.deepEqual(r.fixed.gate,initial.gate);assert.deepEqual(r.fixed.rightChucker,initial.rightChucker);assert.deepEqual(r.fixedAtEnd.gate,oracle.flow.physics.gate);assert.deepEqual(r.fixedAtEnd.rightChucker,oracle.flow.physics.rightChucker);
 for(const key of ['gate','rightChucker'])for(const at of ['fixed','fixedAtEnd']){const altered=structuredClone(r),part=key==='gate'?altered[at][key]:altered[at][key].scoop;part.a.x+=.01;assert.throws(()=>validateShotResult(altered),/fixed input changed/);const typed=structuredClone(r),item=key==='gate'?typed[at][key]:typed[at][key].scoop;item.role='unexpected-type';assert.throws(()=>validateShotResult(typed),/fixed input changed/);}
 const phaseResult=withSyntheticDrain(()=>measureS8ShotCase(baseline(),{phase:.175}));assert.equal(validateShotResult(phaseResult),true);assert.deepEqual(phaseResult.fixed.gate,initial.gate);assert.deepEqual(phaseResult.fixedAtEnd.gate,oracle.flow.physics.gate);
 const malformed=structuredClone(r);malformed.conditions.power=.2;assert.throws(()=>validateShotResult(malformed),/conditions/);
 const truncated=structuredClone(r);truncated.replayFrames.pop();assert.throws(()=>validateShotResult(truncated),/replay/);
});
test('safety cap saves a full failed result, actual shots and drain; it never fabricates missing shots',()=>{
 let error;try{measurePinAdjustment(baseline(),{shotLimit:250,seconds:1,drain:1,replaySeconds:2,replayFPS:30});}catch(e){error=e;}
 assert.match(error.message,/not reached/);const r=error.result;assert.ok(r.physical.shots>0&&r.physical.shots<250);assert.equal(r.observation.shotLimitReached,false);assert.equal(r.conditions.actualFiringSeconds,1);assert.equal(r.conditions.actualDrainSeconds,1);assert.equal(r.replayFrames.length,61);assert.equal(r.replayEndpoints.end.time,r.end.time);assert.ok(r.physical.reconciled);
 for(const shotLimit of [0,-1,1.5,Infinity,NaN])assert.throws(()=>measurePinAdjustment(baseline(),{shotLimit,seconds:1}),/shot limit/);
});
test('frozen-manifest cases preserve original101, cumulative constraint and fixed production conditions',()=>{
 assert.equal(inspectShotCase(baseline()).valid,true);
 const case2={...baseline(),id:'move',moves:[{pinId:2,dx:0,dy:-.25}]};assert.equal(inspectShotCase(case2).valid,true);
 for(const change of [{normalPower:.2},{hesoMouthWidth:12},{leftAdmissionGuides:false},{ballRadius:1.8},{moves:[{pinId:2,dx:1,dy:1}]}])assert.equal(inspectShotCase({...baseline(),...change}).valid,false);
 const manifest=JSON.stringify({version:1,cases:[baseline(),case2]});assert.deepEqual(readCaseManifest(manifest,'move'),case2);assert.throws(()=>readCaseManifest(manifest,'unapproved'),/not in/);assert.throws(()=>readCaseManifest(JSON.stringify({version:1,cases:[baseline(),baseline()]}),'baseline'),/duplicate/);
});
test('runner never starts a case without explicit single-phase/stage and frozen source',()=>{
 const args=['--out','out','--plan','plan','--manifest','manifest','--case','baseline','--phase','0'];assert.equal(parseShotArgs([...args,'--stage','preflight'])['--stage'],'preflight');assert.throws(()=>parseShotArgs([...args,'--stage','run']),/source SHA/);assert.throws(()=>parseShotArgs([...args,'--stage','run','--expected-source','a'.repeat(64),'--batch','true']),/Unknown/);
});
