import {installRightRoadResidualTrial} from '../src/pixi/right-road-residual-trial.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {productionBoardFlowOptions} from '../src/app/production-board-profile.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {SessionGame} from '../src/domain/session-game.js';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out=process.argv[2];if(!out)throw Error('Output directory required');mkdirSync(out,{recursive:true});
const configs=[
 {id:'loss-continuous-p0',policy:'continuous',phase:0,random:'all-loss'},
 {id:'loss-continuous-p35',policy:'continuous',phase:.35,random:'all-loss'},
 {id:'loss-stop-p0',policy:'visible-stop',phase:0,random:'all-loss'},
 {id:'loss-stop-p35',policy:'visible-stop',phase:.35,random:'all-loss'},
 {id:'natural-101',policy:'continuous',phase:0,random:101},
 {id:'natural-202',policy:'continuous',phase:.175,random:202},
 {id:'natural-303',policy:'continuous',phase:.35,random:303},
];
const selected=process.env.S8_BALANCE_CASE;const runs=selected?configs.filter(c=>c.id===selected):configs;if(!runs.length)throw Error('Unknown case');
const files=['physics/physics.js','physics/recessed-stage.js','physics/ball-flow.js','pixi/source-stage.js','pixi/board-flow.js','pixi/source-guide-mechanics.js','pixi/source-layout.js','pixi/source-guide-trace.js','pixi/normal-spin-flow.js','pixi/presentation-distribution.js','pixi/prediction-plan.js','domain/game.js','domain/session-game.js','domain/tokyoghoul-w-machine.js','domain/tokyoghoul-w-spec.js','domain/w-runtime-policy.js','app/production-board-profile.js','pixi/source-left-residual.js','pixi/rear-electric-decoration.js','pixi/right-road-residual-trial.js'];
const hash=()=>Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(new URL('../src/'+f,import.meta.url))).digest('hex')]));
const before=hash(),toolHash=createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex'),reports=[];writeFileSync(out+'/plan.json',JSON.stringify({configs:runs,startingBalls:400,normalPower:.18,launchInterval:.6,stopRule:'stop during visible presentation or at four held draws; resume when no presentation and holds<=2; in-flight balls still arrive',end:'actual lost result, first normal bonus, or 30 seconds of idle zero-stock blocked by stationary physical balls; 1800s cap',scope:'isolated SessionGame + actual production board + presentation bridge, no wallet/save; all-loss fixtures isolate normal play and preserve the presentation selector'},null,2));
const save=()=>writeFileSync(out+'/progress.json',JSON.stringify({complete:reports.length===runs.length,planned:runs.map(c=>c.id),results:reports},null,2));save();
for(const config of runs){
 writeFileSync(out+'/running.json',JSON.stringify({id:config.id,time:0,stock:400,shots:0,heso:0,accepted:0,rejected:0,resolved:0,hold:0}));
 let seed=Number(config.random)||1;const rng=config.random==='all-loss'?()=>.9:()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const g=new SessionGame(rng);g.practice=true;
 const m=createBoardFlow({lcd:true,...productionBoardFlowOptions(),fire:()=>g.fire()}),p=m.flow.physics;installRightRoadResidualTrial(p);
 const spin=attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true,presentationPatterns:true});
 const lose=m.flow.game.lose.bind(m.flow.game),returned=m.flow.game.addStock.bind(m.flow.game);
 m.flow.game.lose=b=>{lose(b);g.lose(b);};m.flow.game.addStock=n=>{returned(n);g.addStock(n,'returned');};
 let admitted=0,accepted=0,rejected=0,started=0,resolved=0,maxHold=0,holdFullSeconds=0,reachSeconds=0,stoppedSeconds=0,lastShotAt=0,stockZeroAt=null,idle=0,firstBonus=null,endReason='time-cap',maxNoEntry=0,lastEntryAt=0;
 const events=[],timeline=[],entries=[],byDraw=new Map();
 const emit=g.w.emit.bind(g.w);g.w.emit=(type,data={})=>{
  if(type==='admission'&&data.kind==='start'){admitted++;maxNoEntry=Math.max(maxNoEntry,g.time-lastEntryAt);lastEntryAt=g.time;entries.push({time:g.time,ballId:data.ballId,accepted:data.drawAccepted,hold:g.holdCount,inPresentation:!!g.presentation,stock:g.stock});}
  if(type==='drawAccepted'&&data.kind==='tokuzu1'){accepted++;byDraw.set(data.drawId,{acceptedAt:g.time});}
  if(type==='drawRejected'&&data.kind==='tokuzu1'){rejected++;events.push({time:g.time,type,reason:data.reason,hold:g.holdCount,inPresentation:!!g.presentation});}
  if(type==='drawResolved'&&data.kind==='tokuzu1'){resolved++;const draw=byDraw.get(data.id);if(draw)draw.resolvedAt=g.time;events.push({time:g.time,type,outcome:data.outcome,drawId:data.id});}
  if(type==='bonusStart'&&!firstBonus)firstBonus={time:g.time,...data};
  return emit(type,data);
 };
 const start=g.startSpin.bind(g);g.startSpin=record=>{if(record.kind==='tokuzu1'){started++;const d=byDraw.get(record.id);if(d)d.startedAt=g.time;}return start(record);};
 const spawn=p.spawn.bind(p);p.spawn=(data,power,angle)=>{const b=spawn(data,power,angle);if(b)lastShotAt=g.time;return b;};
 for(let i=0;i<Math.round(config.phase*120);i++){g.pendingBalls=p.balls.length;m.flow.step(1/120);}m.setMode('normal');m.flow.start();
 let nextSample=0,nextProgress=30;
 for(let i=0;i<1800*120;i++){
  const h=1/120;g.pendingBalls=p.balls.length;
  if(config.policy==='visible-stop'){
   if(g.presentation||g.holdCount>=g.machine.holdLimit)m.flow.stop();
   else if(!g.presentation&&g.holdCount<=2)m.flow.start();
  }
  if(!m.flow.continuous)stoppedSeconds+=h;
  if(g.holdCount>=g.machine.holdLimit)holdFullSeconds+=h;
  if(g.presentation)reachSeconds+=h;
  m.flow.step(h);g.events.length=0;maxHold=Math.max(maxHold,g.holdCount);
  if(g.stock===0&&stockZeroAt===null)stockZeroAt=g.time;if(g.stock>0)stockZeroAt=null;
  if(g.time>=nextSample){timeline.push({time:g.time,stock:g.stock,shots:g.ledger.spent,heso:admitted,accepted,resolved,rejected,hold:g.holdCount,active:g.spinActive,presentation:g.presentation?.displayRoute??(g.presentation?'reach':null),feeding:m.flow.continuous,pendingBalls:p.balls.length});nextSample+=1;}
  if(g.time>=nextProgress){writeFileSync(out+'/running.json',JSON.stringify({id:config.id,time:g.time,stock:g.stock,shots:g.ledger.spent,heso:admitted,accepted,rejected,resolved,hold:g.holdCount}));nextProgress+=30;}
  if(firstBonus){endReason='first-normal-bonus';break;}
  if(g.phase==='result'){endReason=g.result.reason;break;}
  const drawsIdle=!g.spinActive&&!g.holdCount&&!g.presentation&&!g.jackpot&&!g.w.pendingV&&!g.w.electricOpen&&!g.w.queues.tokuzu2.length;
  if(g.stock===0&&drawsIdle&&p.balls.length&&p.balls.every(b=>Math.hypot(b.vx,b.vy)<1))idle+=h;else idle=0;
  if(idle>=30){endReason='zero-stock-idle-blocked-by-physical-residual';break;}
 }
 const waits=[...byDraw.values()].filter(d=>d.startedAt!==undefined).map(d=>d.startedAt-d.acceptedAt);
 const remaining=p.balls.map(b=>({id:b.id,x:b.x*2+28,y:(b.y-120)*2,speed:Math.hypot(b.vx,b.vy),onStage:!!b.onSourceStage}));
 const unresolved=g.w.queues.tokuzu1.length+Number(!!g.w.active.tokuzu1);
 const r={...config,startingBalls:400,time:g.time,lastShotAt,stockZeroAt,stock:g.stock,sessionPhase:g.phase,endReason,firstBonus,shots:g.ledger.spent,hesoEntries:admitted,hesoRate:admitted/g.ledger.spent,accepted,rejected,overflowRate:rejected/admitted,spinsStarted:started,spinsResolved:resolved,rawDrawCounter:g.draws,unresolved,maxHold,holdFullSeconds,reachSeconds,stoppedSeconds,maxNoEntrySeconds:maxNoEntry,maxQueueWaitSeconds:Math.max(0,...waits),meanQueueWaitSeconds:waits.reduce((a,b)=>a+b,0)/(waits.length||1),payout:g.total,accounting:g.accounting,counts:m.flow.counts,remaining,checks:{ledger:g.accounting.reconciled,physical:g.ledger.spent===p.metrics.spawned&&Object.values(m.flow.counts).reduce((a,b)=>a+b,0)+p.balls.length===p.metrics.spawned,entries:admitted===m.flow.counts.start&&admitted===accepted+rejected,draws:accepted===resolved+unresolved}};
 reports.push(r);writeFileSync(out+'/'+config.id+'.json',JSON.stringify({summary:r,entries,events,timeline,draws:[...byDraw.entries()].map(([id,d])=>({id,...d}))},null,2));save();console.log(JSON.stringify(r));
 if(Object.values(r.checks).some(v=>!v))throw Error('Balance reconciliation failed');
}
const after=hash();writeFileSync(out+'/manifest.json',JSON.stringify({before,after,unchanged:JSON.stringify(before)===JSON.stringify(after),tool:'s8-heso-session-balance.mjs',toolSha256:toolHash,note:'Right-road trial overlay is applied in memory, production positions not changed; RNG/prizes/timings retained; fixed-loss fixture is identified per case.'},null,2));if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Source changed during measurement');
