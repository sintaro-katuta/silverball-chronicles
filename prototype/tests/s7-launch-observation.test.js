import test from 'node:test';import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {Physics} from '../src/physics/physics.js';
import {s7Config,s7Cases,measureS7,withS7Observation,classifyS7Aim,rankS7,validateS7Physical} from '../src/dev/s7-launch-observation.js';
import {parseS7Args} from '../tools/s7-launch-comparison.mjs';

test('S7 baseline keeps actual production factory pins, geometry and default sprite scale; settings only change power',()=>{
 const original=createBoardFlow({lcd:true}).flow.physics;
 for(const c of s7Cases()){
  assert.equal(c.launchRailProfile,'legacy');assert.equal(c.hesoMouthWidth,20);assert.equal(c.leftAdmissionGuides,true);assert.deepEqual(c.moves,[]);assert.equal(Object.hasOwn(c,'ballRadius'),false);
  const m=createBoardFlow({lcd:true,normalPower:c.normalPower,leftAdmissionGuides:true,hesoMouthWidth:20,launchRailProfile:'legacy'}).flow.physics;
  for(const key of ['pins','colliders','pockets','ballRadius','displayBallScale','launchExit','mechanisms'])assert.deepEqual(m[key],original[key]);
 }
});
test('observer ON/OFF keeps every replay coordinate, event, count and fixed physical input identical',()=>{
 const config=s7Config('baseline'),options={seconds:6,drain:3,replaySeconds:9,replayFPS:30};
 const plain=measureS7(config,options,{observer:false}),observed=measureS7(config,options);assert.equal(validateS7Physical(observed),true);const {s7Observation,...actual}=observed;
 assert.deepEqual(actual,plain);assert.equal(s7Observation.rows.length,plain.physical.shots);assert.ok(s7Observation.rows.some(r=>r.firstPinContact));
 assert.ok(s7Observation.rows.filter(r=>r.firstPinContact).every(r=>Number.isInteger(r.firstPinContact.pinId)));
});
test('exact pin observer reports the actual collision, not another geometrically nearby pin; prediction ignored',()=>{
 const p=createBoardFlow({lcd:true}).flow.physics;p.pins=[{id:701,x:100,y:400,r:.2,role:'prize',restitution:.8},{id:702,x:106,y:400,r:.2,role:'prize',restitution:.8}];
 const b=p.spawn({},.20);Object.assign(b,{x:98.1,y:400,vx:50,vy:0,leftLaunchPlane:true});const original=p.pins;
 const {rows}=withS7Observation(()=>p.resolvePins(b));assert.equal(p.pins,original);assert.equal(rows.get(b.id).firstPinContact.pinId,701);assert.equal(b.hits,1);
 const {rows:prediction}=withS7Observation(()=>p.resolvePins({...b,x:98.1},{predict:true}));assert.equal(prediction.size,0);
});
test('observation failure restores prototype methods and temporary pin iteration',()=>{
 const methods=Object.fromEntries(['advanceBall','resolvePins','step','recordRole'].map(k=>[k,Physics.prototype[k]]));
 const p=createBoardFlow({lcd:true}).flow.physics,original=p.pins;let read=0;const broken={get x(){read++;throw new Error('synthetic contact failure');},y:400,r:.2};p.pins=[broken];const pins=p.pins;const b=p.spawn({},.20);b.leftLaunchPlane=true;
 assert.throws(()=>withS7Observation(()=>p.resolvePins(b)),/synthetic contact failure/);assert.ok(read>0);assert.equal(p.pins,pins);p.pins=original;
 for(const [k,value]of Object.entries(methods))assert.equal(Physics.prototype[k],value);
 assert.throws(()=>withS7Observation(()=>{throw new Error('synthetic operation failure');}),/synthetic operation failure/);
});
test('aim classes use actual radius and keep overlap separate; missing events are explicit',()=>{
 assert.equal(classifyS7Aim(null).category,'unobserved');assert.deepEqual(classifyS7Aim({sourceX:200,sourceY:280,r:1.8}),{category:'A',A:'inside',B:'outside',distanceToA:0});
 assert.equal(classifyS7Aim({sourceX:172,sourceY:280,r:1.8}).A,'boundary');assert.equal(classifyS7Aim({sourceX:171,sourceY:280,r:1.8}).A,'outside');assert.equal(classifyS7Aim({sourceX:230,sourceY:250,r:1.8}).category,'overlap');
});
test('staged runner refuses measurement without frozen source, fresh baseline review or explicit long selection',()=>{
 assert.throws(()=>parseS7Args(['--stage','baseline','--out','out','--plan','plan']),/source SHA/);
 assert.throws(()=>parseS7Args(['--stage','candidates','--out','out','--plan','plan','--expected-source','a'.repeat(64)]),/baseline/);
 assert.throws(()=>parseS7Args(['--stage','long','--out','out','--plan','plan','--expected-source','a'.repeat(64),'--baseline-dir','base','--aim-reviewed','baseline']),/selection|setting/);
 assert.equal(parseS7Args(['--stage','preflight','--out','out','--plan','plan'])['--stage'],'preflight');
});
function rankingFixture(id,power,positions){
 const p=createBoardFlow({lcd:true}).flow.physics,keys=['ballRadius','colliders','pockets','mechanisms','outlet','launchExit','launchSpeedOffset','gate','rightChucker','returnOutlet','separateLaunchPlane'];
 return {config:s7Config(id,power),pins:structuredClone(p.pins),fixed:Object.fromEntries(keys.map(k=>[k,structuredClone(p[k])])),display:{ballRadius:p.ballRadius,displayBallScale:p.displayBallScale,displayBallDiameter:p.displayBallDiameter??null},conditions:{gravity:690,updateSeconds:1/120,launchInterval:.6,mouthWidth:20,mode:'normal'},kind:'mechanical',physical:{shots:positions.length,reconciled:true,uniqueOutcomeIds:true,allOutcomesFromShots:true,countsMatchOutcomes:true},end:{remaining:0,counts:{start:1,normal:0,returned:0,out:positions.length-1}},endDiagnostics:{stalled:0},observation:{observedFiringGap:{maxGap:10}},lcdIntrusion:{centreBallIds:[],boundaryOnlyBallIds:[],frontCentreBallIds:[],frontBoundaryOnlyBallIds:[]},s7Observation:{rows:positions.map(([sourceX,sourceY],i)=>({ballId:i+1,aimEvent:{sourceX,sourceY,r:1.8},route:{}}))}};
}
test('A-only candidate can qualify without B samples when a stronger control establishes the B relation',()=>{
 const baseline=rankingFixture('baseline',.20,[[260,220],[260,220],[260,220],[260,220]]),candidate=rankingFixture('power-0-18',.18,[[200,280],[200,280],[200,280],[200,280]]),strongest=rankingFixture('power-0-22',.22,[[200,280],[200,280],[200,280],[200,280]]);
 const ranked=rankS7([baseline,candidate,strongest],['baseline','power-0-18','power-0-22']);assert.equal(ranked.selected,candidate.config.id);assert.equal(ranked.rows[1].B,0);assert.deepEqual(ranked.rows[1].strongerBReferences,['baseline']);assert.ok(ranked.rows[2].reasons.some(s=>s.includes('B relation')));
 const missingRelation=structuredClone(baseline);missingRelation.s7Observation.rows=candidate.s7Observation.rows;assert.equal(rankS7([missingRelation,candidate],['baseline',candidate.config.id]).selected,null);
});
test('unsafe counts, LCD, returns or changed physical inputs cannot become a launch selection',()=>{
 const baseline=rankingFixture('baseline',.20,[[260,220],[260,220]]),candidate=rankingFixture('power-0-18',.18,[[200,280],[200,280]]);
 for(const mutate of [r=>r.physical.reconciled=false,r=>r.end.remaining=1,r=>r.endDiagnostics.stalled=1,r=>r.end.counts.returned=1,r=>r.lcdIntrusion.centreBallIds=[1]]){
  const changed=structuredClone(candidate);mutate(changed);assert.equal(rankS7([baseline,changed],['baseline',candidate.config.id]).selected,null);
 }
 const changed=structuredClone(candidate);changed.pins[0].x+=.01;assert.throws(()=>rankS7([baseline,changed],['baseline',candidate.config.id]),/pin layout/);
 const radius=structuredClone(candidate);radius.display.displayBallScale+=.001;assert.throws(()=>rankS7([baseline,radius],['baseline',candidate.config.id]),/display/);
});
