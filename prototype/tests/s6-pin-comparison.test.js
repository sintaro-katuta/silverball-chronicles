import test from 'node:test';
import assert from 'node:assert/strict';
import {S6_PLAN,s6Cases,validateS6Cases,measureS6,rankS6} from '../src/dev/s6-pin-comparison.js';
import {measurePinAdjustment} from '../src/dev/pin-adjustment-measurement.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {resolvePinAdjustment} from '../src/dev/pin-adjustment.js';
import {Physics} from '../src/physics/physics.js';

const result=(id,start,shots=200,extra={})=>({config:{id,moves:s6Cases().find(c=>c.id===id).moves},physical:{shots,reconciled:true,uniqueOutcomeIds:true,allOutcomesFromShots:true,countsMatchOutcomes:true},end:{counts:{start,returned:0},remaining:0},endDiagnostics:{stalled:0},lcdIntrusion:{centreBallIds:[],boundaryOnlyBallIds:[],frontCentreBallIds:[],frontBoundaryOnlyBallIds:[]},observation:{observedFiringGap:{maxGap:100}},...extra});
test('S6 contains only approved separate moves under the experimental aim control; product defaults unchanged',()=>{
 const configs=validateS6Cases();assert.deepEqual(configs.map(c=>c.moves),[[],[{pinId:2,dx:0,dy:.25}],[{pinId:91,dx:-.25,dy:0},{pinId:92,dx:.25,dy:0}]]);
 const original=createBoardFlow({lcd:true}).flow.physics;
 for(const c of configs){assert.equal(c.normalPower,.14);assert.equal(c.ballRadius,1.8);assert.equal(c.hesoMouthWidth,12);assert.equal(c.launchRailProfile,'reference-exit');const r=resolvePinAdjustment(c);assert.equal(r.pins.length,101);for(const p of r.pins){const old=original.pins.find(q=>q.id===p.id);assert.ok(Math.hypot(p.x-old.x,p.y-old.y)<=1);assert.equal(p.r,old.r);assert.equal(p.restitution,old.restitution);}}
 const product=createBoardFlow({lcd:true});product.setMode('normal');product.flow.start();product.flow.step(1/120);assert.equal(product.flow.physics.balls[0].power,.20);assert.equal(product.flow.physics.pockets.find(p=>p.kind==='start').w,20);
 assert.deepEqual(S6_PLAN.long.phases,[.175,.35,.525]);
});
test('screening uses real-shot ratios and excludes unsafe, unreviewed, unchanged and failed-count cases',()=>{
 const reviewed={aimReviewedIds:['baseline','road-pin2','heso-pair']};
 assert.equal(rankS6([result('baseline',2),result('road-pin2',2,100),result('heso-pair',3)],reviewed).selected,'road-pin2');
 assert.equal(rankS6([result('baseline',2),result('road-pin2',2)],reviewed).selected,null);
 assert.equal(rankS6([result('baseline',2),result('road-pin2',3)]).selected,null);
 for(const extra of [{end:{counts:{start:9,returned:1},remaining:0}},{end:{counts:{start:9,returned:0},remaining:1}},{endDiagnostics:{stalled:1}},{physical:{shots:200,reconciled:false}},{lcdIntrusion:{centreBallIds:[],boundaryOnlyBallIds:[5],frontCentreBallIds:[],frontBoundaryOnlyBallIds:[5]}}])assert.equal(rankS6([result('baseline',2),result('road-pin2',9,200,extra)],reviewed).selected,null);
});
test('equal start ratios choose fewer moved pins, never combine candidates',()=>{
 assert.equal(rankS6([result('baseline',1),result('heso-pair',2),result('road-pin2',2)],{aimReviewedIds:['baseline','heso-pair','road-pin2']}).selected,'road-pin2');
});
test('integration observations preserve every physical frame, outcome and fixed shape; restore methods after errors',()=>{
 const config=s6Cases()[0],options={seconds:3,drain:1,replaySeconds:2},plain=measurePinAdjustment(config,options),oldAdvance=Physics.prototype.advanceBall,oldPins=Physics.prototype.resolvePins;
 const observed=measureS6(config,options);for(const key of ['events','frames','replayFrames','fixed','physical','end','routeMetrics'])assert.deepEqual(observed[key],plain[key],key);
 assert.equal(observed.aimObservation.rows.length,plain.physical.shots);assert.ok(observed.aimObservation.rows.every(r=>r.ballId>0));
 assert.equal(Physics.prototype.advanceBall,oldAdvance);assert.equal(Physics.prototype.resolvePins,oldPins);
 assert.throws(()=>measureS6(config,{seconds:-1}));assert.equal(Physics.prototype.advanceBall,oldAdvance);assert.equal(Physics.prototype.resolvePins,oldPins);
});

test('LCD overlap makes the fresh baseline unsafe even if a candidate has the same or fewer overlaps',()=>{
 const dirty={centreBallIds:[3],boundaryOnlyBallIds:[],frontCentreBallIds:[],frontBoundaryOnlyBallIds:[]},base=result('baseline',2,200,{lcdIntrusion:dirty});
 for(const candidate of [result('road-pin2',9),result('road-pin2',9,200,{lcdIntrusion:dirty})]){
  const ranked=rankS6([base,candidate],{aimReviewedIds:['baseline','road-pin2']});assert.equal(ranked.baselineSafe,false);assert.equal(ranked.selected,null);
 }
 const boundary={centreBallIds:[],boundaryOnlyBallIds:[4],frontCentreBallIds:[],frontBoundaryOnlyBallIds:[]};assert.equal(rankS6([result('baseline',2),result('road-pin2',9,200,{lcdIntrusion:boundary})],{aimReviewedIds:['baseline','road-pin2']}).selected,null);
});
