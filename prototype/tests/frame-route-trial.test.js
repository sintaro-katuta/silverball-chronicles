import test from 'node:test';import assert from 'node:assert/strict';
import{createFrameRouteTrial,FRAME_DECORATIVE_IDS,runFrameRouteTrial}from'../src/dev/frame-route-trial-model.js';
import{createBoardFlow}from'../src/pixi/board-flow.js';import{productionBoardFlowOptions}from'../src/app/production-board-profile.js';
import{SCREEN_SOURCE,sourcePath}from'../src/pixi/source-layout.js';
const plain=x=>JSON.parse(JSON.stringify(x));const reports=[];
test('historical comparison retains its saved baseline; geometry trial disables only declared frame contacts and adds the exact LCD opening',()=>{
 const current=createFrameRouteTrial(),trial=createFrameRouteTrial('lcd-only'),production=createBoardFlow({lcd:true,...productionBoardFlowOptions(),guideMechanicsProfile:'legacy'});production.setMode('normal');
 assert.deepEqual(plain(current.physics),plain(production.flow.physics));
 for(const key of ['pins','pockets','mechanisms','sourceGuidePaths','railVisibleShape','ballRadius','launchSpeedOffset'])assert.deepEqual(plain(trial.physics[key]),plain(current.physics[key]));
 const added=trial.physics.colliders.filter(c=>c.trialLcdEdge),points=sourcePath(SCREEN_SOURCE).map(([x,y])=>({x,y}));assert.equal(added.length,points.length);
 added.forEach((c,i)=>{assert.deepEqual(c.a,points[i]);assert.deepEqual(c.b,points[(i+1)%points.length]);});
 const restored=plain(trial.physics.colliders.filter(c=>!c.trialLcdEdge));for(const c of restored)if(FRAME_DECORATIVE_IDS.includes(c.sourceGuideId))delete c.active;
 assert.deepEqual(restored,plain(current.physics.colliders));
});
test('calibration control declares real size and launch changes and keeps pin centres, saved geometry, pockets and front art',()=>{
 const current=createFrameRouteTrial(),trial=createFrameRouteTrial('calibrated');
 assert.equal(trial.physics.ballRadius,1.8);assert.equal(trial.physics.displayBallDiameter,3.6);assert.equal(trial.physics.launchSpeedOffset,55);
 for(const key of ['pins','pockets','sourceGuidePaths','railVisibleShape'])assert.deepEqual(plain(trial.physics[key]),plain(current.physics[key]));
 assert.deepEqual(productionBoardFlowOptions().ballRadius,3);
});
for(const phase of [0,.175,.35])test(`calibrated dev-only control clears 30 naturally launched balls at phase ${phase}`,()=>{
 const result=runFrameRouteTrial('calibrated',{phase});reports.push(result);
 assert.equal(result.spawned,30);assert.equal(result.entered,30);assert.equal(result.remaining.length,0);assert.deepEqual(result.lcdIntrusions,[]);assert.ok(result.roadContacts>0);assert.equal(result.counts.returned,0);assert.equal(result.reconciled,true);
});
test.after(()=>{if(process.env.FRAME_TRIAL_REPORT)console.log('FRAME_TRIAL_RESULTS '+JSON.stringify(reports));});
