import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync}from'node:fs';
import {createBoardFlow}from'../src/pixi/board-flow.js';import {Physics}from'../src/physics/physics.js';
import {measurePinAdjustment}from'../src/dev/pin-adjustment-measurement.js';import {withS7Observation}from'../src/dev/s7-launch-observation.js';
import {inspectWheelShapeCase}from'../src/dev/s8-wheel-shape-comparison.js';
import {inspectAdmissionCase,measureAdmissionCase,validateAdmissionResult,summarizeAdmissionResult,evaluateRightSafety}from'../src/dev/s8-admission-comparison.js';
import{parseShotArgs}from'../tools/s8-admission-comparison.mjs';
const cases=JSON.parse(readFileSync(new URL('../tools/s8-admission-cases.json',import.meta.url))).cases,by=id=>structuredClone(cases.find(c=>c.id===id)),data=x=>JSON.parse(JSON.stringify(x));
function synthetic(operation,kind='out'){
 const step=Physics.prototype.step,canLaunch=Physics.prototype.canLaunch;Physics.prototype.canLaunch=()=>true;
 // Control-loop test only: real factory spawn/cadence/IDs remain; no physical selection data.
 Physics.prototype.step=function(dt,game){this.time+=dt;this.updateGate(game);for(const b of this.balls){const outcome=typeof kind==='function'?kind(b):kind;this.recordOutcome(b,outcome);outcome==='out'?game.lose(b):game.hit(b,outcome,'synthetic');}this.balls=[];};
 try{return operation();}finally{Physics.prototype.step=step;Physics.prototype.canLaunch=canLaunch;}
}
test('exact four declarations; no mixed pin/radius/profile/condition or disguised attributes',()=>{
 assert.equal(cases.length,4);for(const c of cases)assert.equal(inspectAdmissionCase(c).valid,true);
 for(const [id,change]of [['three-base',{ballRadius:1.8}],['pin90-up025',{ballRadius:2}],['ball-r20',{moves:[{pinId:90,dx:0,dy:-.25}]}],['three-base',{moves:[{pinId:2,dx:0,dy:.25}]}],['legacy-control',{windmillShapeProfile:'photo-three-vane'}],['ball-r20',{ballRadius:2.2}],['three-base',{windmillOffset:{dx:.25,dy:0}}],['three-base',{normalPower:.2}],['three-base',{leftAdmissionGuides:true}]])assert.equal(inspectAdmissionCase({...by(id),...change}).valid,false);
 assert.equal(inspectWheelShapeCase(by('pin90-up025')).valid,false);assert.equal(inspectWheelShapeCase(by('ball-r20')).valid,false);
});
test('r2.0 initial factory display/contact diameter agree, all unrelated default fields remain exact',()=>{
 const a=createBoardFlow({lcd:true,leftAdmissionGuides:false,windmillShapeProfile:'photo-three-vane'}).flow.physics,b=createBoardFlow({lcd:true,leftAdmissionGuides:false,windmillShapeProfile:'photo-three-vane',ballRadius:2}).flow.physics;
 const expected=data(a);Object.assign(expected,{ballRadius:2,displayBallScale:12/28,displayBallDiameter:4});assert.deepEqual(data(b),expected);assert.equal(28*b.displayBallScale/3,4);assert.equal(a.ballRadius,1.8);
});
test('optional final snapshots and S7 observer do not alter existing time-mode JSON/events/replay for both profiles/modes',()=>{
 for(const id of ['legacy-control','three-base'])for(const mode of ['normal','rush','bonus']){
  const c=by(id),o={mode,seconds:2,drain:1,replaySeconds:3,replayFPS:30},plain=measurePinAdjustment(c,o),recorded=measurePinAdjustment(c,{...o,recordFinalState:true}),observed=withS7Observation(()=>measurePinAdjustment(c,{...o,recordFinalState:true})).result;
  assert.deepEqual(observed,recorded);assert.equal(recorded.replayEndpoints.end.time,recorded.end.time);assert.deepEqual(recorded.replayEndpoints.end.counts,recorded.end.counts);for(const key of ['fixedAtEnd','pinsAtEnd','replayEndpoints','replaySampling'])delete recorded[key];assert.deepEqual(data(recorded),data(plain));assert.equal('replaySampling'in plain,false);
 }
 assert.throws(()=>measurePinAdjustment(by('three-base'),{recordFinalState:1,seconds:1}),/recording/);
});
test('all four exact250 declarations stop on actual spawn and validate geometry, phases and complete30Hz endpoints',()=>{
 for(const c of cases){const r=synthetic(()=>measureAdmissionCase(c));assert.equal(validateAdmissionResult(r),true);assert.equal(r.physical.shots,250);assert.equal(r.end.remaining,0);assert.equal(summarizeAdmissionResult(r).start,0);assert.equal(r.replaySampling.endStep-r.replaySampling.stopStep,5400);
  for(const edit of [x=>x.pinsAtEnd[0].x++,x=>x.fixedAtEnd.gate.a.x++,x=>x.fixedAtEnd.rightChucker.scoop.role='bad',x=>x.replayFrames[1].mechanisms[0].x++,x=>x.replayFrames.pop(),x=>x.display.displayBallScale+=.001,x=>{x.phase=.1;x.conditions.phase=.1;},x=>x.end.time=NaN]){const bad=structuredClone(r);edit(bad);assert.throws(()=>validateAdmissionResult(bad));}
 }
 const phase=synthetic(()=>measureAdmissionCase(by('three-base'),{phase:.175}));assert.equal(validateAdmissionResult(phase),true);
});
test('right is fixed30-second natural cadence plus45 drain, separate from250 mode; proper fresh mode geometry',()=>{
 for(const id of ['three-base','ball-r20'])for(const mode of ['rush','bonus']){const r=synthetic(()=>measureAdmissionCase(by(id),{mode}),mode);assert.equal(validateAdmissionResult(r),true);assert.equal(r.conditions.power,.85);assert.equal(r.conditions.shotLimit,undefined);assert.equal(r.atStop.time>29.99,true);assert.equal(r.replayFrames.length,2251);assert.equal(r.replayEndpoints.end.time>74.99,true);assert.ok(r.physical.shots>0);assert.equal(r.end.counts[mode],r.physical.shots);assert.equal(summarizeAdmissionResult(r).mode,mode);
  const wrong=structuredClone(r);wrong.conditions.power=.18;assert.throws(()=>validateAdmissionResult(wrong));const closed=structuredClone(r);closed.fixedAtEnd.gate.a.x+=.01;assert.throws(()=>validateAdmissionResult(closed),/fixed input/);
 }
 assert.throws(()=>measureAdmissionCase(by('pin90-up025'),{mode:'rush'}),/phase/);assert.throws(()=>measureAdmissionCase(by('ball-r20'),{mode:'bonus',phase:.175}),/phase/);
});
test('right safety requires all four valid records, strict baseline safety, actual denominator and no return worsening',()=>{
 const records=['three-base','ball-r20'].flatMap(id=>['rush','bonus'].map(mode=>synthetic(()=>measureAdmissionCase(by(id),{mode}),b=>b.id%3===0?mode:'out')));assert.equal(evaluateRightSafety(records).eligible,true);assert.throws(()=>evaluateRightSafety(records.slice(1)),/Four/);
 const unsafe=structuredClone(records);unsafe[0].lcdIntrusion.centreBallIds=[1];assert.equal(evaluateRightSafety(unsafe).eligible,false);
 const stalled=structuredClone(records);stalled[2].endDiagnostics.stalled=1;assert.equal(evaluateRightSafety(stalled).eligible,false);
 const returned=records.slice();returned[2]=synthetic(()=>measureAdmissionCase(by('ball-r20'),{mode:'rush'}),'returned');assert.equal(evaluateRightSafety(returned).eligible,false);
 const missing=structuredClone(records);delete missing[0].end.counts.normal;assert.throws(()=>evaluateRightSafety(missing));
});
test('runner is single case/mode/phase, requires source for execution and never accepts right holdout/undeclared case',()=>{
 const args=['--out','out','--plan','plan','--manifest','manifest','--case','ball-r20','--phase','0','--mode','normal'];assert.equal(parseShotArgs([...args,'--stage','preflight'])['--stage'],'preflight');assert.throws(()=>parseShotArgs([...args,'--stage','run']),/source SHA/);assert.throws(()=>parseShotArgs([...args,'--stage','run','--expected-source','a'.repeat(64),'--batch','true']),/Unknown/);
 const right=args.slice();right[right.indexOf('--phase')+1]='.175';right[right.indexOf('--mode')+1]='rush';assert.throws(()=>parseShotArgs([...right,'--stage','preflight']),/Right safety/);
});

test('saved right gate verifies source/HEAD/plan/manifest and both gzip hashes; absent proof prevents B trial before a step',async()=>{
 const {mkdtemp,writeFile,readFile,mkdir,rm}=await import('node:fs/promises'),{tmpdir}=await import('node:os'),{join}=await import('node:path'),{createHash}=await import('node:crypto'),{saveCompressedRaw}=await import('../tools/s6-reference-comparison.mjs'),{preparePinAdjustment}=await import('../src/dev/pin-adjustment.js'),{loadRightSafety,runAdmissionCase,admissionInputs}=await import('../tools/s8-admission-comparison.mjs');
 const sha=b=>createHash('sha256').update(b).digest('hex'),dir=await mkdtemp(join(tmpdir(),'s8-admission-direct-'));
 try{
  const plan=Buffer.from('Synthetic plan only'),manifest=Buffer.from(JSON.stringify({version:1,cases})),source={sha256:'a'.repeat(64),planSHA:sha(plan),caseManifestSHA:sha(manifest)},commit='b'.repeat(40);
  for(const id of ['three-base','ball-r20'])for(const mode of ['rush','bonus']){
   const out=join(dir,`${id}-${mode}`);await mkdir(out);const r=synthetic(()=>measureAdmissionCase(by(id),{mode}),mode),prepared=await preparePinAdjustment(r.config);Object.assign(r,{sourceSHA:source.sha256,planSHA:source.planSHA,caseManifestSHA:source.caseManifestSHA,configSHA:prepared.configSHA,layoutSHA:prepared.layoutSHA,flowOptions:prepared.flowOptions});const m=await saveCompressedRaw(join(out,'result.json.gz'),r);
   await writeFile(join(out,'raw-manifest.json'),JSON.stringify([m]));await writeFile(join(out,'provenance.json'),JSON.stringify({success:true,sourceUnchanged:true,gitUnchanged:true,commit,endCommit:commit,source,endSourceSHA:source.sha256,mode,caseId:id,phase:0}));await writeFile(join(out,'pm-plan.executed.md'),plan);await writeFile(join(out,'cases.executed.json'),manifest);
  }
  assert.equal((await loadRightSafety(dir,source,commit)).eligible,true);await assert.rejects(loadRightSafety(dir,source,'c'.repeat(40)),/source\/HEAD/);
  const raw=join(dir,'ball-r20-bonus','result.json.gz'),bytes=await readFile(raw);bytes[bytes.length-1]^=1;await writeFile(raw,bytes);await assert.rejects(loadRightSafety(dir,source,commit));
  const planPath=join(dir,'plan.md'),manifestPath=join(dir,'cases.json');await writeFile(planPath,plan);await writeFile(manifestPath,manifest);const frozen=await admissionInputs(planPath,manifestPath),out=join(dir,'blocked-B');await assert.rejects(runAdmissionCase(['--stage','run','--out',out,'--plan',planPath,'--manifest',manifestPath,'--case','ball-r20','--phase','0','--mode','normal','--expected-source',frozen.sha256]),/right safety proof/);const p=JSON.parse(await readFile(join(out,'provenance.json')));assert.equal(p.measurementStarted,false);assert.equal(p.success,false);assert.equal(JSON.parse(await readFile(join(out,'failure.json'))).actualShots,null);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('lateral manifest has only fresh controls and isolated90-right/91-left; previous four-case manifest stays unchanged',()=>{
 const lateral=JSON.parse(readFileSync(new URL('../tools/s8-admission-lateral-cases.json',import.meta.url))).cases;assert.deepEqual(lateral.map(c=>c.id),['legacy-control','three-base','pin90-right025','pin91-left025']);assert.deepEqual(lateral.slice(0,2),cases.slice(0,2));assert.deepEqual(cases.map(c=>c.id),['legacy-control','three-base','pin90-up025','ball-r20']);
 for(const c of lateral.slice(2)){const inspected=inspectAdmissionCase(c);assert.equal(inspected.valid,true);assert.equal(inspected.layout.pins.length,101);const r=synthetic(()=>measureAdmissionCase(c));assert.equal(validateAdmissionResult(r),true);assert.equal(r.physical.shots,250);assert.equal(r.display.ballRadius,1.8);const bad=structuredClone(r);bad.pinsAtEnd.find(p=>p.id===c.moves[0].pinId).x+=.01;assert.throws(()=>validateAdmissionResult(bad));
  for(const mixed of [{...c,ballRadius:2},{...c,moves:[...c.moves,{pinId:2,dx:0,dy:.25}]},{...c,moves:[{...c.moves[0],dy:-.25}]}])assert.equal(inspectAdmissionCase(mixed).valid,false);
 }
});
