import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardFlow} from '../src/pixi/board-flow.js';
test('near arrivals reconcile and cohorts retain launch power after switching',()=>{
 const m=createBoardFlow({lcd:true});m.setMode('normal');m.flow.start();
 for(const power of [.23,.24,.25]){m.setNormalPower(power);for(let i=0;i<18*120;i++)m.flow.step(1/120);const s=m.leftMetrics.snapshot();assert.equal(s.nearHeso,s.nearAdmitted+s.deflectedAtHeso+s.nearMiss+s.nearPending);}
 m.flow.stop();for(let i=0;i<20*120;i++)m.flow.step(1/120);
 const s=m.leftMetrics.snapshot();assert.equal(m.flow.physics.balls.length,0);assert.equal(s.admitted,m.flow.counts.start);
 assert.equal(Object.values(s.byPower).reduce((a,b)=>a+b.tracked,0),m.flow.physics.metrics.spawned);
 for(const c of Object.values(s.byPower)){assert.equal(c.nearHeso,c.nearAdmitted+c.deflectedAtHeso+c.nearMiss);assert.equal(Object.values(c.nearMissOutcomes).reduce((a,b)=>a+b,0),c.nearMiss);}
});
