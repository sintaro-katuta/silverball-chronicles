import test from 'node:test';import assert from 'node:assert/strict';
import{createApronComparisonModel,APRON_DROP_POINTS,apronClearance}from'../src/dev/apron-comparison-model.js';
import{createBoardFlow}from'../src/pixi/board-flow.js';import{productionBoardFlowOptions}from'../src/app/production-board-profile.js';
const plain=p=>JSON.parse(JSON.stringify(p));
test('comparison changes only one diagonal collider active flag and does not change the submitted paths or historical baseline',()=>{
 const current=createApronComparisonModel(),trial=createApronComparisonModel({decorative:true}),production=createBoardFlow({lcd:true,...productionBoardFlowOptions(),guideMechanicsProfile:'legacy'}).flow.physics;
 assert.deepEqual(plain(current.physics),plain(production));assert.equal(trial.edge.active,false);
 const trialData=plain(trial.physics);delete trialData.colliders.find(c=>c.sourceGuideId==='apron-outer'&&c.sourceGuideSegment===2).active;
 assert.deepEqual(trialData,plain(production));assert.deepEqual(trial.physics.sourceGuidePaths,current.physics.sourceGuidePaths);
});
test('same stationary drop uses unchanged ball size and time; its path differs at the diagonal contact',()=>{
 const a=createApronComparisonModel(),b=createApronComparisonModel({decorative:true}),x=a.drop(APRON_DROP_POINTS[1]),y=b.drop(APRON_DROP_POINTS[1]);assert.deepEqual(x,y);assert.equal(x.r,3);
 let contactA=false,contactB=false;for(let i=0;i<60;i++){a.step(1/120);b.step(1/120);contactA||=x.lastContact==='lcd-boundary-20';contactB||=y.lastContact==='lcd-boundary-20';}
 assert.equal(contactA,true);assert.equal(contactB,false);assert.notEqual(x.y,y.y);assert.equal(a.physics.time,b.physics.time);
});
test('reported clearance compares physical pin shafts and wall surface with the unchanged ball diameter',()=>{
 const g=apronClearance(createApronComparisonModel().physics);assert.ok(g.min>2.6&&g.min<2.8);assert.ok(g.max>3.3&&g.max<3.4);assert.equal(g.diameter,6);
});
