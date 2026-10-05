// Fixed transition fixture, excluded from natural occurrence statistics.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {SessionGame} from '../src/pixi/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {queuedHoldPrediction} from '../src/pixi/hold-prediction.js';
const dir='reference-review/parallel-distribution-2026-10-05';await mkdir(dir,{recursive:true});
const g=new SessionGame(()=>.9),m=createBoardFlow({lcd:true,fire:()=>null});
const spin=attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true,presentationPatterns:true});g.startRush();m.setMode('rush');
let ball=1,newGuaranteed=null;const admitted=[],starts=[],resolved=[],transitions=[];
function inlet(kind,roll=.9){g.w.rng=()=>roll;const old=g.w.serial;m.flow.game.hit({id:ball++,x:200,y:470,hits:0},kind,0);m.flow.physics.nextId=ball;
 if(g.w.serial!==old){const r=Object.values(g.w.active).find(r=>r?.id===g.w.serial)??Object.values(g.w.queues).flat().find(r=>r.id===g.w.serial);if(r.kind==='fuzu'){admitted.push({...r,cue:queuedHoldPrediction(r,g)});return r.id;}}
}
const start=g.startSpin.bind(g);g.startSpin=r=>{const a=admitted.find(a=>a.id===r.id);start(r);starts.push({id:r.id,win:g.spinResult.win,odds:r.odds,guaranteed:r.guaranteed,route:g.spinResult.presentationPlan.route,cue:g.spinResult.predictionPlan?.holdCue,remaining:g.w.rush?.remaining});assert.equal(g.spinResult.win,a.roll<1/a.odds);assert.equal(queuedHoldPrediction(r,g),a.cue);};
const resolve=g.resolveDraw.bind(g);g.resolveDraw=(win,reels)=>{const id=g.wRecord?.id;resolve(win,reels);resolved.push({id,win:g.lastDraw});};
inlet('fuzu',0);for(let n=0;n<4;n++)inlet('fuzu',.9);
for(let n=0;n<30000;n++){
 if(g.w.electricOpen&&m.tulip.state().progress>=1-1e-8)while(g.w.electricOpen)inlet('rush',0);
 if(g.w.pendingV&&m.attacker.state().progress>=1-1e-8)inlet('bonus');
 else if(g.jackpot&&spin.rounds?.snapshot().phase==='open'){const old=g.w.bonus;while(g.w.bonus===old&&g.w.bonus?.open)inlet('bonus');}
 if(g.w.rush?.guaranteed&&!transitions.length)transitions.push({time:g.time,remaining:g.w.rush.remaining,queue:g.w.queues.fuzu.map(r=>({...r})),active:g.w.active.fuzu});
 if(g.w.rush?.guaranteed&&!newGuaranteed&&g.w.queues.fuzu.length<4)newGuaranteed=inlet('fuzu',.9);
 m.flow.step(.05);
 if(newGuaranteed&&resolved.some(r=>r.id===newGuaranteed))break;
}
assert.equal(transitions.length,1);assert.ok(newGuaranteed);assert.deepEqual(starts.map(r=>r.id),admitted.map(r=>r.id));assert.deepEqual(starts.slice(1,5).map(r=>r.win),[false,false,false,false]);assert.equal(starts.at(-1).win,true);assert.equal(starts.at(-1).guaranteed,true);assert.equal(starts.at(-1).route,'flash');assert.equal(starts.at(-1).cue,'none');assert.equal(g.w.queues.fuzu.length,0);
await writeFile(dir+'/guaranteed-queue-fixed.json',JSON.stringify({scope:'Fixed winning/followup rolls; excluded from natural reliability statistics. Actual SessionGame + boardFlow + normalSpin, electric/V/bonus acquisition paths.',admitted,transitions,starts,resolved,time:g.time,passed:true},null,2));console.log(JSON.stringify({passed:true,starts,resolved}));
