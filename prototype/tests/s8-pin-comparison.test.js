import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {Physics} from '../src/physics/physics.js';
import {resolvePinAdjustment} from '../src/dev/pin-adjustment.js';
import {S8_PLAN,s8Cases,inspectS8Cases,measureS8,validateS8Physical,rankS8,aggregateS8} from '../src/dev/s8-pin-comparison.js';
import {parseS8Args,loadS8Run} from '../tools/s8-pin-comparison.mjs';
import {preparePinAdjustment} from '../src/dev/pin-adjustment.js';
import {saveCompressedRaw} from '../tools/s6-reference-comparison.mjs';

function fixture(id,{shots=100,start=5,normal=5,returned=0,maxGap=20,phase=0,long=false}={}){
 const config=s8Cases().find(c=>c.id===id),p=createBoardFlow({lcd:true}).flow.physics,keys=['ballRadius','colliders','pockets','mechanisms','outlet','launchExit','launchSpeedOffset','gate','rightChucker','returnOutlet','separateLaunchPlane'];
 return {config,pins:resolvePinAdjustment(config).pins,fixed:{gravity:690,...Object.fromEntries(keys.map(k=>[k,structuredClone(p[k])]))},railGeometry:{profile:'legacy'},display:{ballRadius:p.ballRadius,displayBallScale:p.displayBallScale,displayBallDiameter:p.displayBallDiameter??null},phase,kind:'mechanical',conditions:{phase,kind:'mechanical',mode:'normal',power:.18,ballRadius:1.8,gravity:690,updateSeconds:1/120,launchInterval:.6,mouthWidth:20,seconds:long?300:120,drain:45},physical:{shots,reconciled:true,uniqueOutcomeIds:true,allOutcomesFromShots:true,countsMatchOutcomes:true},end:{remaining:0,counts:{start,normal,returned,out:shots-start-normal-returned}},endDiagnostics:{stalled:0},observation:{observedFiringGap:{maxGap}},lcdIntrusion:{centreBallIds:[],boundaryOnlyBallIds:[],frontCentreBallIds:[],frontBoundaryOnlyBallIds:[]},s8Observation:{rows:Array.from({length:shots},(_,i)=>({ballId:i+1,firstTurningPoint:{sourceX:200,sourceY:280,r:1.8},route:{}}))},replayFrames:[],replayFPS:30};
}
const reviewed=s8Cases().map(c=>c.id);
function longRows(opts={}){return ['baseline','road-pin2'].flatMap(id=>S8_PLAN.long.phases.map(phase=>fixture(id,{long:true,phase,start:id==='baseline'?5:6,...opts})));}

test('S8 defines only three independent original-origin moves with production0.18 and original display',()=>{
 const cases=s8Cases(),p=createBoardFlow({lcd:true}).flow.physics;
 assert.deepEqual(cases.map(c=>c.moves),[[],[{pinId:2,dx:0,dy:.25}],[{pinId:90,dx:0,dy:-.25}],[{pinId:91,dx:-.25,dy:0},{pinId:92,dx:.25,dy:0}]]);
 for(const c of cases){assert.equal(c.normalPower,.18);assert.equal(c.hesoMouthWidth,20);assert.equal(c.leftAdmissionGuides,true);assert.equal(c.launchRailProfile,'legacy');assert.equal(Object.hasOwn(c,'ballRadius'),false);if(c.id==='jump-pin90'){assert.throws(()=>resolvePinAdjustment(c),/heso-tray-0/);continue;}const pins=resolvePinAdjustment(c).pins;assert.equal(pins.length,101);for(const pin of pins){const original=p.pins.find(q=>q.id===pin.id),move=c.moves.find(m=>m.pinId===pin.id);assert.deepEqual(pin,{...original,x:original.x+(move?.dx??0),y:original.y+(move?.dy??0)});assert.ok(Math.hypot(pin.x-original.x,pin.y-original.y)<=1);}}
 const inspection=inspectS8Cases();assert.deepEqual(inspection.map(c=>c.valid),[true,true,false,true]);assert.match(inspection[2].skipReason,/heso-tray-0/);assert.equal(inspection.length,4);
});
test('preflight preserves an invalid candidate as skipped, never substitutes another move',()=>{
 const [baseline,candidate]=s8Cases(),invalid={...candidate,moves:[{pinId:2,dx:0,dy:1.01}]};
 const results=inspectS8Cases([baseline,invalid]);assert.equal(results[1].valid,false);assert.match(results[1].skipReason,/displacement/);assert.deepEqual(results[1].config,invalid);assert.equal(results.length,2);
});
test('reused actual-contact observer ON/OFF is non-acting for baseline and a changed layout',()=>{
 for(const config of s8Cases().slice(0,2)){
  const options={seconds:5,drain:2,replaySeconds:7,replayFPS:30},plain=measureS8(config,options,{observer:false}),actual=measureS8(config,options),{s8Observation,...physical}=actual;
  assert.deepEqual(physical,plain);assert.equal(validateS8Physical(actual),true);assert.equal(actual.replayFrames.length,211);assert.equal(s8Observation.rows.length,plain.physical.shots);assert.ok(s8Observation.rows.some(r=>r.firstPinContact));assert.ok(s8Observation.rows.filter(r=>r.firstPinContact).every(r=>Number.isInteger(r.firstPinContact.pinId)));
 }
});
test('observer error restores inherited Physics methods and rejects undeclared or mismatched settings',()=>{
 const before=Object.fromEntries(['advanceBall','resolvePins','step','recordRole'].map(k=>[k,Physics.prototype[k]]));
 assert.throws(()=>measureS8(s8Cases()[0],{seconds:1,drain:0,onProgress:()=>{throw new Error('test progress failure');}}),/test progress failure/);
 for(const [key,value]of Object.entries(before))assert.equal(Physics.prototype[key],value);
 assert.throws(()=>measureS8({...s8Cases()[0],normalPower:.20},{seconds:1}),/declared/);
 const invalid=fixture('road-pin2');invalid.pins[0].x+=.01;assert.throws(()=>rankS8([fixture('baseline'),invalid],{aimReviewedIds:reviewed}),/coordinates/);
 for(const mutate of [r=>r.fixed.colliders[0].r+=.01,r=>r.display.displayBallScale+=.01,r=>r.conditions.power=.2,r=>r.conditions.phase=.175]){const r=fixture('road-pin2');mutate(r);assert.throws(()=>validateS8Physical(r),/mismatch|changed/);}
});
test('short screening requires strict admission ratio and safe fresh baseline, and holds pending PM aim review',()=>{
 const b=fixture('baseline'),c=fixture('road-pin2',{start:6});assert.equal(rankS8([b,c]).selected,null);assert.equal(rankS8([b,c],{aimReviewedIds:reviewed}).selected,'road-pin2');
 assert.equal(rankS8([b,fixture('road-pin2')],{aimReviewedIds:reviewed}).selected,null);
 for(const key of ['centreBallIds','boundaryOnlyBallIds','frontCentreBallIds','frontBoundaryOnlyBallIds'])for(const which of ['baseline','candidate']){const base=structuredClone(b),candidate=structuredClone(c);(which==='baseline'?base:candidate).lcdIntrusion[key]=[1];assert.equal(rankS8([base,candidate],{aimReviewedIds:reviewed}).selected,null);}
 for(const mutate of [r=>r.physical.reconciled=false,r=>r.end.remaining=1,r=>r.endDiagnostics.stalled=1,r=>{r.end.counts.returned=1;r.end.counts.out--;}]){const r=structuredClone(c);mutate(r);assert.equal(rankS8([b,r],{aimReviewedIds:reviewed}).selected,null);}
 const missing=structuredClone(c);delete missing.end.counts.normal;assert.throws(()=>rankS8([b,missing],{aimReviewedIds:reviewed}),/normal/);
});
test('short tie prefers the valid one-pin case over the pair and preserves declared candidate order',()=>{
 const b=fixture('baseline'),road=fixture('road-pin2',{start:6}),heso=fixture('heso-pair',{start:6});
 assert.equal(rankS8([heso,b,road],{aimReviewedIds:reviewed}).selected,'road-pin2');
 assert.deepEqual(s8Cases().slice(1).map(c=>c.id),['road-pin2','jump-pin90','heso-pair']);
 assert.throws(()=>rankS8([b,road,road],{aimReviewedIds:reviewed}),/Duplicate/);
});
test('long requires all paired phases, aggregate strict gain and every phase no worse; general/gap deterioration holds',()=>{
 const opts={aimReviewedIds:reviewed};assert.equal(aggregateS8(longRows(),'road-pin2',opts).technicalThresholdsMet,true);
 const regressed=longRows();regressed.find(r=>r.config.id==='road-pin2'&&r.phase===.175).end.counts.start=4;regressed.find(r=>r.config.id==='road-pin2'&&r.phase===.175).end.counts.out=91;assert.ok(aggregateS8(regressed,'road-pin2',opts).reasons.some(s=>s.includes('start ratio worse')));
 for(const mutate of [r=>{r.end.counts.normal--;r.end.counts.out++;},r=>r.observation.observedFiringGap.maxGap++,r=>{r.end.counts.returned++;r.end.counts.out--;}]){const rows=longRows();mutate(rows.find(r=>r.config.id==='road-pin2'));assert.equal(aggregateS8(rows,'road-pin2',opts).technicalThresholdsMet,false);}
 assert.throws(()=>aggregateS8(longRows().slice(1),'road-pin2',opts),/six/);const missing=longRows();delete missing[0].end.counts.normal;assert.throws(()=>aggregateS8(missing,'road-pin2',opts),/normal/);
 assert.equal(aggregateS8(longRows({start:5}),'road-pin2',opts).technicalThresholdsMet,false);
});
test('CLI requires frozen source, baseline review and explicit screened long winner before any run',()=>{
 const base=['--out','out','--plan','plan'];assert.equal(parseS8Args([...base,'--stage','preflight'])['--stage'],'preflight');assert.throws(()=>parseS8Args([...base,'--stage','baseline']),/source SHA/);
 assert.throws(()=>parseS8Args([...base,'--stage','candidates','--expected-source','a'.repeat(64)]),/baseline/);
 assert.throws(()=>parseS8Args([...base,'--stage','long','--expected-source','a'.repeat(64),'--baseline-dir','b','--candidate-dir','c','--aim-reviewed','baseline']),/selection/);
});
test('raw loader rejects corruption/missing rows and requires successful same-source stages',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'s8-loader-'));try{const source='a'.repeat(64),r=fixture('baseline'),prepared=await preparePinAdjustment(r.config);Object.assign(r,{sourceSHA:source,configSHA:prepared.configSHA,layoutSHA:prepared.layoutSHA,replayFrames:Array.from({length:4951},(_,i)=>({time:i/30}))});const m=await saveCompressedRaw(join(dir,'baseline-phase-0.json.gz'),r),plan='Frozen PM test plan',planSHA=createHash('sha256').update(plan).digest('hex'),provenance={commit:'b'.repeat(40),endCommit:'b'.repeat(40),stage:'baseline',success:true,sourceUnchanged:true,gitUnchanged:true,source:{sha256:source,planSHA},endSourceSHA:source,completed:1};await writeFile(join(dir,'pm-plan.executed.md'),plan);await writeFile(join(dir,'provenance.json'),JSON.stringify(provenance));await writeFile(join(dir,'raw-manifest.json'),JSON.stringify([m]));assert.equal((await loadS8Run(dir,source,'baseline',['baseline/0'])).length,1);
  await assert.rejects(loadS8Run(dir,source,'baseline',['baseline/0','road-pin2/0']),/Missing/);
  await writeFile(join(dir,'provenance.json'),JSON.stringify({...provenance,endCommit:'c'.repeat(40)}));await assert.rejects(loadS8Run(dir,source,'baseline',['baseline/0']),/commits/);await writeFile(join(dir,'provenance.json'),JSON.stringify(provenance));
  await writeFile(join(dir,'pm-plan.executed.md'),plan+' modified');await assert.rejects(loadS8Run(dir,source,'baseline',['baseline/0']),/plan SHA/);await writeFile(join(dir,'pm-plan.executed.md'),plan);
 const raw=await readFile(join(dir,m.file));raw[raw.length-1]^=1;await writeFile(join(dir,m.file),raw);await assert.rejects(loadS8Run(dir,source,'baseline',['baseline/0']));
 }finally{await rm(dir,{recursive:true,force:true});}
});
