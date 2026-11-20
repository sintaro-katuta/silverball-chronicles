import {test} from 'node:test';
import assert from 'node:assert/strict';
import {serenaScenePlan} from '../src/pixi/serena-scene-plan.js';

const scene=(overrides={})=>({time:100,spinActive:false,previewWinAt:undefined,...overrides});
const reach=(win,time,reachEnding='standard')=>({basicReach:true,longReach:true,win,time,reachEnding});

test('long battle uses the same pre-decision video for wins and losses',()=>{
 for(const t of [0,4.9,5,20,51.69]){
  assert.deepEqual(serenaScenePlan(scene({presentation:reach(true,t)})),serenaScenePlan(scene({presentation:reach(false,t)})));
 }
 assert.equal(serenaScenePlan(scene({presentation:reach(true,0)})).clip,'warning');
 assert.equal(serenaScenePlan(scene({presentation:reach(true,5)})).clip,'battle');
 const loss=serenaScenePlan(scene({presentation:reach(false,51.7)}));
 assert.equal(loss.clip,'defeat');assert.ok(Math.abs(loss.age-2.7)<1e-9);
 assert.equal(serenaScenePlan(scene({presentation:reach(true,51.7)})).clip,'battle');
});

test('revival shows the same defeat at the shared decision boundary',()=>{
 const loss=serenaScenePlan(scene({presentation:reach(false,52)}));
 const revival=serenaScenePlan(scene({presentation:reach(true,52,'revival')}));
 assert.deepEqual(revival,loss);
 assert.equal(serenaScenePlan(scene({presentation:reach(true,54,'revival')})).clip,'revival');
});

test('short reaches and unresolved bonus do not claim a result video',()=>{
 assert.equal(serenaScenePlan(scene({presentation:{basicReach:true,longReach:false}})),null);
 assert.equal(serenaScenePlan(scene({jackpot:{charge:false},previewWinAt:100})),null);
 assert.equal(serenaScenePlan(scene({jackpot:{charge:true},previewWinAt:100})).clip,'charge');
 assert.equal(serenaScenePlan(scene({jackpot:{charge:false},previewWinAt:100}),{payout:true}).clip,'bonus');
 assert.notEqual(serenaScenePlan(scene(),{payout:true})?.clip,'bonus');
});

test('entry, active RUSH and RUSH end respect existing game state',()=>{
 assert.deepEqual(serenaScenePlan(scene({entryPrelude:{startedAt:98}})),{clip:'rush-entry',age:2,loop:false});
 assert.equal(serenaScenePlan(scene({entryPrelude:{startedAt:101}})),null);
 assert.equal(serenaScenePlan(scene({entryPrelude:{startedAt:97}})).clip,'rush-entry');
 assert.equal(serenaScenePlan(scene({rush:{remaining:8}})).clip,'rush-loop');
 assert.equal(serenaScenePlan(scene({lastRush:{endedAt:99,total:123}})).clip,'rush-end');
 assert.equal(serenaScenePlan(scene({lastRush:{endedAt:90,total:123}})).clip,'idle');
});

test('warning is restricted to its already scheduled prediction window',()=>{
 const cue={start:.42,end:1.85};
 assert.equal(serenaScenePlan(scene({spinActive:true,drawTimer:.5,spinResult:{predictionPlan:{beforeCue:cue}}})).clip,'warning');
 assert.equal(serenaScenePlan(scene({spinActive:true,drawTimer:2,spinResult:{predictionPlan:{beforeCue:cue}}})).clip,'idle');
});
