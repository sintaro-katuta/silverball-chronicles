import test from 'node:test';
import assert from 'node:assert/strict';
import {SessionGame} from '../src/pixi/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {holdPredictionCue,predictionPose} from '../src/pixi/prediction-plan.js';
import {reachSchedule} from '../src/pixi/reach-ending.js';
import {queuedHoldPrediction} from '../src/pixi/hold-prediction.js';

const ball=id=>({id,x:200,y:470,hits:0});
function session({mode='normal',roll=.9,patterns=true,route,ending}={}){
 let calls=0;const game=new SessionGame(()=>{calls++;return roll;});
 const model=createBoardFlow({lcd:true,fire:()=>game.fire()});
 attachNormalSpin(model.flow,{sessionGame:game,roundModel:model,lifecycle:true,presentationPatterns:patterns});
 if(mode==='rush')game.startRush();
 if(route)game.reviewPresentationRoute=route;
 if(ending)game.reviewReachEnding=ending;
 return {game,model,calls:()=>calls,admit(id){game.hit(ball(id),mode==='rush'?'fuzu':'start');},step(dt=.05){model.flow.step(dt);}};
}
function until(s,predicate,limit=1500){for(let n=0;n<limit&&!predicate();n++)s.step();assert.ok(predicate(),'progression did not reach expected state');}

test('prediction attachment preserves admitted records, resolved outcomes and gameplay RNG consumption',()=>{
 for(const mode of ['normal','rush'])for(const roll of [0,.9]){
  const base=session({mode,roll,patterns:false}),next=session({mode,roll});
  base.admit('one');next.admit('one');
  const kind=mode==='rush'?'fuzu':'tokuzu1';
  assert.deepEqual(next.game.w.active[kind],base.game.w.active[kind]);
  until(base,()=>!!base.game.jackpot||base.game.w.electricOpen||base.game.draws===1&&!base.game.presentation);
  until(next,()=>!!next.game.jackpot||next.game.w.electricOpen||next.game.draws===1&&!next.game.presentation);
  assert.equal(next.calls(),base.calls(),`${mode}/${roll}: cosmetic plan consumed game RNG`);
  assert.equal(next.game.lastDraw,base.game.lastDraw);
  assert.equal(next.game.w.electricOpen,base.game.w.electricOpen);
  assert.equal(next.game.jackpot?.rounds,base.game.jackpot?.rounds);
  assert.equal(next.game.accounting.reconciled,true);
 }
});

test('queued holds remain FIFO and their cue agrees with the eventual active draw',()=>{
 for(const mode of ['normal','rush']){
  const s=session({mode,route:'basic'});for(let id=1;id<=4;id++)s.admit(id);
  const kind=mode==='rush'?'fuzu':'tokuzu1';
  const records=[s.game.w.active[kind],...s.game.w.queues[kind]].map(r=>({...r}));
  const started=[];
  for(const record of records){
   until(s,()=>s.game.spinResult?.drawId===record.id);
   const result=s.game.spinResult;started.push(result.drawId);
   assert.equal(result.win,false);
   assert.equal(result.predictionPlan.holdCue,queuedHoldPrediction(record,s.game));
   assert.equal(result.predictionPlan.holdCue,holdPredictionCue({drawId:record.id,mode,win:false}));
   assert.equal(s.game.w.active[kind].roll,record.roll);
   until(s,()=>!s.game.spinResult||s.game.spinResult.drawId!==record.id);
  }
  assert.deepEqual(started,records.map(r=>r.id));
 }
});

test('queued cues agree on winning records, while charge and guaranteed followups remain excluded',()=>{
 for(const mode of ['normal','rush']){
  const s=session({mode,roll:0});s.admit('winning');
  const kind=mode==='rush'?'fuzu':'tokuzu1',record=s.game.w.active[kind],cue=queuedHoldPrediction(record,s.game);
  s.step();assert.equal(s.game.spinResult.predictionPlan.holdCue,cue);
 }
 const charge=session({roll:.75/199.9});charge.admit('charge-cue');
 assert.equal(queuedHoldPrediction(charge.game.w.active.tokuzu1,charge.game),'none');
 charge.step();assert.equal(charge.game.spinResult.predictionPlan,null);
 const guaranteed=session({mode:'rush',roll:0});
 guaranteed.game.w.rush.odds=1;guaranteed.game.w.rush.guaranteed=true;guaranteed.admit('guaranteed');
 assert.equal(queuedHoldPrediction(guaranteed.game.w.active.fuzu,guaranteed.game),'none');
 guaranteed.step();assert.equal(guaranteed.game.spinResult.predictionPlan?.holdCue??'none','none');
});

test('all supported routes transfer the same prediction plan without permitting a false confirmed outcome',()=>{
 for(const mode of ['normal','rush'])for(const win of [false,true])for(const route of ['basic','battle','direct','flash']){
  const s=session({mode,roll:win?0:.9,route});s.admit('route');s.step();
  const result=s.game.spinResult,plan=result.predictionPlan;
  assert.equal(result.win,win);
  if(!win){assert.notEqual(result.presentationPlan.route,'direct');assert.notEqual(result.presentationPlan.route,'flash');assert.equal(plan.resultFamily,null);}
  if(result.presentationPlan.route==='ordinary'){until(s,()=>s.game.draws===1&&!s.game.presentation);continue;}
  until(s,()=>!!s.game.presentation);
  assert.strictEqual(s.game.presentation.predictionPlan,plan);
  assert.equal(s.game.presentation.win,win);
  assert.equal(s.game.presentation.drawId,result.drawId);
  const a=predictionPose(plan,1,{phase:'reach'});assert.deepEqual(predictionPose(plan,1,{phase:'reach'}),a);
 }
});

test('standard, revival and flash clocks retain duration and upper windows through prediction overlays',()=>{
 for(const [mode,ending,duration,upperAt,upperEnd] of [['normal','standard',54,19,24],['normal','revival',58,19,24],['rush','standard',54,19,24],['rush','flash',12,4,9]]){
  const s=session({mode,roll:0,route:'battle',ending});s.admit('clock');until(s,()=>!!s.game.presentation);
  const p=s.game.presentation,schedule=reachSchedule(p);
  assert.equal(schedule.seconds,duration);assert.equal(schedule.upperAt,upperAt);assert.equal(schedule.upperEnd,upperEnd);
  const cue=p.predictionPlan,before=s.calls();
  for(let age=0;age<duration;age+=.1)predictionPose(cue,age,{phase:'reach'});
  assert.equal(s.calls(),before);assert.strictEqual(s.game.presentation,p);
  while(p.time<duration-.1)s.step(.05);
  assert.strictEqual(s.game.presentation,p);until(s,()=>s.game.presentation===null,10);
  assert.ok(p.time>=duration&&p.time<duration+.06);
 }
});

test('pause freezes prediction and physics clocks; active choreography does not extend electric deadlines',()=>{
 const s=session({roll:0,route:'battle'});s.admit('pause');until(s,()=>!!s.game.presentation);s.step(1);
 s.game.pause();const age=s.game.presentation.time,time=s.game.time,physical=s.model.flow.physics.time;
 s.step(2);assert.equal(s.game.presentation.time,age);assert.equal(s.game.time,time);assert.equal(s.model.flow.physics.time,physical);
 s.game.resume();s.step(.05);assert.ok(s.game.presentation.time>age);
 const electric=session({mode:'rush',roll:0,route:'flash'});electric.admit('fuzu');until(electric,()=>electric.game.w.electricOpen);
 const openedAt=electric.game.time,initialAge=electric.game.electricTime;until(electric,()=>!electric.game.w.electricOpen,180);
 const electricAge=electric.game.time-openedAt+initialAge;
 assert.ok(electricAge>=8-1e-9&&electricAge<8.06,`prediction did not preserve the 8-second mechanical deadline (${electricAge})`);
});

test('charge bypasses prediction and symbol reach even under an explicit review override',()=>{
 const s=session({roll:.75/199.9,route:'battle',ending:'revival'});s.admit('charge');s.step();
 assert.equal(s.game.spinResult.predictionPlan,null);assert.equal(s.game.spinResult.presentationPlan.route,'ordinary');
 until(s,()=>!!s.game.jackpot);assert.equal(s.game.jackpot.charge,true);assert.equal(s.game.jackpot.rounds,2);assert.equal(s.game.presentation,null);
});
