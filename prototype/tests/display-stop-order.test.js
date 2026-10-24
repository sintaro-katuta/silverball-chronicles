import test from 'node:test';
import assert from 'node:assert/strict';
import {SessionGame} from '../src/domain/session-game.js';
import {createBoardFlow} from '../src/pixi/board-flow.js';
import {attachNormalSpin} from '../src/pixi/normal-spin-flow.js';
import {reviewReelState,displayResultIndex} from '../src/pixi/review-reel-state.js';
import {createCueTracker} from '../src/pixi/se/presentation-cues.js';
import {specialRoutePose} from '../src/pixi/special-route-motion.js';

test('direct route final sequential landing uses the same physical left/right/centre order',()=>{
 for(const mode of ['normal','rush']){
  const p=specialRoutePose({route:'direct',mode,win:true});
  const at=p.decisionAt;
  for(const [time,expected] of [[at-.2,[true,false,false]],[at-.1,[true,false,true]],[at,[true,true,true]]]){
   assert.deepEqual(specialRoutePose({route:'direct',mode,win:true,time}).stopped,expected);
  }
 }
});

test('physical display always stops left/right/centre through a single stable stored-result mapping',()=>{
 for(const mode of ['normal','rush'])for(const reach of [false,true])for(const win of [false,true]){
  const target=reach?[3,3,win?3:4]:win?[5,5,5]:[2,4,6];
  const g={time:5,spinActive:true,drawTimer:0,drawTempo:mode==='rush'?.35:2.2,reelStopGap:.2,previewCenterPending:reach,spinResult:{drawId:5,mode,reach,win,reels:target}};
  const expected=[target[0],target[2],target[1]];
  for(const [stop,flags] of [[0,[true,false,false]],[1,[true,false,true]],[2,[true,true,true]]]){
   g.drawTimer=g.drawTempo+stop*g.reelStopGap+.001;
   const r=reviewReelState(g);assert.deepEqual(r.stopped,flags);
   flags.forEach((stopped,i)=>{if(stopped)assert.equal(r.numbers[i],expected[i]);assert.equal(target[displayResultIndex(i)],expected[i]);});
  }
  assert.deepEqual(g.spinResult.reels,target);
 }
});

test('real admissions keep the same result, clocks, accounting and visible stop order across FIFO',()=>{
 for(const mode of ['normal','rush'])for(const win of [false,true]){
  const g=new SessionGame(()=>win?0:.9),m=createBoardFlow({lcd:true,fire:()=>null});
  const spin=attachNormalSpin(m.flow,{sessionGame:g,roundModel:m,lifecycle:true,presentationPatterns:true});
  if(mode==='rush'){g.startRush();m.setMode('rush');}
  g.reviewPresentationRoute=win?'basic':undefined;
  for(let id=1;id<=3;id++)g.hit({id},mode==='rush'?'fuzu':'start');
  const results=[],heard=[],audio=createCueTracker(name=>heard.push(name),()=>{});let last=null;
  for(let i=0;i<5000&&results.length<1;i++){
   if(g.spinActive){const s=spin.snapshot().reels;assert.notDeepEqual(s.stopped,[true,true,false]);}
   audio.sync(g);m.flow.step(.005);
   if(g.lastResolvedDraw&&last!==g.lastResolvedDraw){last=g.lastResolvedDraw;results.push(last);}
  }
  audio.sync(g);assert.equal(results.length,1);assert.equal(g.lastResolvedDraw.win,win);
  assert.equal(g.accounting.reconciled,true);assert.ok(heard.indexOf('stopLeft')>=0);assert.ok(heard.indexOf('stopRight')>heard.indexOf('stopLeft'));
  m.flow.pause(true);const frozen=spin.snapshot();m.flow.step(3);assert.deepEqual(spin.snapshot(),frozen);m.flow.pause(false);
 }
});
