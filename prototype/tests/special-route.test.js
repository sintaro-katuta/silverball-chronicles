import test from 'node:test';
import assert from 'node:assert/strict';
import {specialRoutePose,specialReelStrip,SPECIAL_ROUTE_TIMINGS,BASIC_LOSS_PASS_SECONDS} from '../src/pixi/special-route-motion.js';
test('basic win/loss share every visible property until decision',()=>{
 for(const mode of ['normal','rush'])for(let t=0;t<SPECIAL_ROUTE_TIMINGS[mode].basic.decisionAt;t+=.017){
  assert.deepEqual(specialRoutePose({mode,time:t,win:true}),specialRoutePose({mode,time:t,win:false}));
 }
});
test('common landing reveals stored result, including replay seeks',()=>{
 for(const mode of ['normal','rush']){
  const {decisionAt,seconds}=SPECIAL_ROUTE_TIMINGS[mode].basic;
  for(const win of [true,false]){
   const p=specialRoutePose({mode,time:decisionAt,win});assert.equal(p.result,win?'win':'loss');assert.deepEqual(p.digits,[7,win?7:8,7]);assert.equal(p.stopped[1],win);
   assert.equal(specialRoutePose({mode,time:seconds,win}).finished,true);assert.equal(specialRoutePose({mode,time:seconds,win}).visible,false);
   assert.equal(specialRoutePose({mode,time:decisionAt-.01,win}).revealed,false);
  }
 }
});
test('losing 7 passes continuously before 8 lands, with no texture replacement',()=>{
 for(const mode of ['normal','rush']){
  const at=SPECIAL_ROUTE_TIMINGS[mode].basic.decisionAt;
  const before=specialRoutePose({mode,time:at-.00001}),start=specialRoutePose({mode,time:at});
  assert.ok(Math.abs(before.positions[1]-start.positions[1])<.0001);
  let previous=7;
  for(let i=1;i<=65;i++){const p=specialRoutePose({mode,time:at+BASIC_LOSS_PASS_SECONDS*i/65});assert.ok(p.positions[1]>=previous);assert.ok(p.positions[1]<=8);previous=p.positions[1];}
  const middle=specialRoutePose({mode,time:at+.3});assert.ok(middle.positions[1]>7&&middle.positions[1]<8);assert.equal(middle.stopped[1],false);
  const end=specialRoutePose({mode,time:at+BASIC_LOSS_PASS_SECONDS+.001});assert.equal(end.positions[1],8);assert.equal(end.stopped[1],true);
 }
});
test('strip advances 1 through 9 then 1 downwards, including negative/zero coordinates',()=>{
 const values=Array.from({length:11},(_,i)=>i);
 assert.deepEqual(values.map(v=>specialReelStrip(v)[1].digit),[9,1,2,3,4,5,6,7,8,9,1]);
 for(let v=-10;v<=10;v++){
  const before=specialReelStrip(v),during=specialReelStrip(v+.4),after=specialReelStrip(v+1);
  assert.equal(before[1].digit,during[1].digit);assert.ok(during[1].y>before[1].y);
  assert.equal(before[0].digit,after[1].digit);assert.equal(before[0].y,-50);assert.equal(after[1].y,0);
 }
});
test('normal/RUSH basic/direct move in the same increasing direction until each stop',()=>{
 for(const mode of ['normal','rush'])for(const route of ['basic','direct']){
  let prev=specialRoutePose({mode,route,win:true,time:0}).positions;
  for(let t=.01;t<5;t+=.01){const p=specialRoutePose({mode,route,win:true,time:t});p.positions.forEach((v,i)=>assert.ok(v>=prev[i]));prev=p.positions;}
 }
});
test('direct requires an already winning record and stays short',()=>{
 assert.throws(()=>specialRoutePose({route:'direct'}),RangeError);
 for(const mode of ['normal','rush']){const {seconds,decisionAt}=SPECIAL_ROUTE_TIMINGS[mode].direct;assert.ok(seconds<=4);assert.equal(specialRoutePose({route:'direct',mode,win:true,time:decisionAt-.001}).result,null);assert.equal(specialRoutePose({route:'direct',mode,win:true,time:decisionAt}).result,'win');}
});
test('premium overlay needs winning battle record; forming is not confirmed',()=>{
 for(const premium of ['moon','sword']){
  const input={route:'battle',premium,premiumAt:28,time:28.2};
  assert.equal(specialRoutePose({...input,win:false}).visible,false);
  assert.equal(specialRoutePose({...input,win:true}).formed,false);
  assert.equal(specialRoutePose({...input,time:30,win:true}).formed,true);
  assert.equal(specialRoutePose({...input,time:31.4,win:true}).visible,false);
  assert.equal(specialRoutePose({...input,time:27,win:true}).visible,false);
 }
});
test('reduced effects preserve timing/results and remove shake/particles',()=>{
 for(const time of [0,2,5.8,6.9]){const p=specialRoutePose({win:true,time}),r=specialRoutePose({win:true,time,reducedEffects:true});assert.equal(p.result,r.result);assert.equal(p.decisionAt,r.decisionAt);assert.equal(r.shake,0);assert.equal(r.sparkleCount,0);}
 const input=Object.freeze({route:'basic',time:3,win:true});specialRoutePose(input);assert.deepEqual(input,{route:'basic',time:3,win:true});
});
