import test from 'node:test';
import assert from 'node:assert/strict';
import {presentationDistribution,selectPresentation,battleAntiRepeatKernel,createPresentationSelector} from '../src/pixi/presentation-distribution.js';
import {MOON_CUES} from '../src/pixi/moon-cue.js';
import {TOKYOGHOUL_W,W_NORMAL_MODEL,wNormalSymbolProbability} from '../src/domain/tokyoghoul-w-spec.js';
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const near=(a,b,e=1e-10)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
const config=mode=>({mode,baseWinProbability:1/(mode==='rush'?95.3:399.9),lossReachRate:.055});

test('conditional masses conserve lottery and every adopted reliability exactly',()=>{
 for(const mode of ['normal','rush']){
  const d=presentationDistribution(config(mode)),p=d.baseWinProbability;
  near(sum(d.win),1);near(sum(d.loss),1);near(sum(d.loss.slice(0,4)),.055);
  d.targets.forEach((r,i)=>near(p*d.win[i+1]/(p*d.win[i+1]+(1-p)*d.loss[i+1]),r));
  if(mode==='normal')assert.ok(d.basicReliability<.01);else near(d.basicReliability,.1);
  MOON_CUES.forEach((cue,i)=>{
   const w=p*d.eligibleWin*d.moon.win[i],l=(1-p)*d.eligibleLoss*d.moon.loss[i];
   near(w/(w+l),cue.expectation/100);
  });
  near(sum(d.moon.win)+d.moon.winNone,1);near(sum(d.moon.loss)+d.moon.lossNone,1);
  near(sum(d.win.slice(1,4))*d.premiumProbability,.02);
  near((sum(d.win.slice(1,4))-.02)*d.revivalProbability,mode==='normal'?.08:0);
 }
});

test('display-only selection is idempotent, never emits a guarantee on losses, and preserves input',()=>{
 for(const mode of ['normal','rush']){
  const distribution=presentationDistribution(config(mode));
  for(let drawId=1;drawId<=10000;drawId++){
   const input=Object.freeze({win:false,drawId,mode,distribution});
   const result=selectPresentation(input);
   assert.deepEqual(result,selectPresentation(input));
   assert.ok(['ordinary','basic','battle'].includes(result.route));
   assert.equal(result.ending,'standard');assert.equal(result.premium,null);
   if(result.moonCue)assert.equal(result.route,'battle');
  }
 }
});

test('domain-separated channels reproduce route, premium, revival and all 12 moon targets statistically',()=>{
 // Stratify on a fixed recorded outcome; this test never simulates/re-rolls a hit.
 const samples=2000000;
 for(const mode of ['normal','rush']){
  const d=presentationDistribution(config(mode)),rows=[];
  for(const win of [true,false]){
   const row={keys:Array(7).fill(0),moon:Array(12).fill(0),revival:0,premium:0};
   for(let drawId=1;drawId<=samples;drawId++){
    const r=selectPresentation({win,drawId,mode,distribution:d});
    const key=r.route==='battle'?r.variant:r.route;row.keys[d.keys.indexOf(key)]++;
    if(r.moonCue)row.moon[MOON_CUES.indexOf(r.moonCue)]++;
    if(r.ending==='revival')row.revival++;if(r.premium)row.premium++;
    assert.ok(!(r.premium&&r.ending==='revival'));
   }
   const expected=win?d.win:d.loss;
   row.keys.forEach((n,i)=>near(n/samples,expected[i],.004));
   const cueExpected=win?d.moon.win.map(w=>d.eligibleWin*w):d.moon.loss.map(l=>d.eligibleLoss*l);
   row.moon.forEach((n,i)=>near(n/samples,cueExpected[i],6*Math.sqrt(cueExpected[i]*(1-cueExpected[i])/samples)+1/samples));
   rows.push(row);
  }
  near(rows[0].revival/samples,d.revivalWinShare,.004);
  near(rows[0].premium/samples,.02,.002);
  const p=d.baseWinProbability;
  for(let i=0;i<12;i++){
   const w=p*rows[0].moon[i],l=(1-p)*rows[1].moon[i];
   const a=d.eligibleWin*d.moon.win[i],b=d.eligibleLoss*d.moon.loss[i];
   const total=p*a+(1-p)*b;
   const dw=p*(1-p)*b/total**2,dl=(1-p)*p*a/total**2;
   const sigma=Math.sqrt((dw**2*a*(1-a)+dl**2*b*(1-b))/samples);
   near(w/(w+l),MOON_CUES[i].expectation/100,6*sigma);
  }
 }
});

test('invalid and mathematically unsupported configurations fail explicitly',()=>{
 for(const p of [0,1,NaN,-.1,1.1])assert.throws(()=>presentationDistribution({...config('normal'),baseWinProbability:p}),RangeError);
 assert.throws(()=>presentationDistribution({...config('rush'),lossReachRate:.001}),RangeError);
 assert.throws(()=>selectPresentation({win:1,drawId:1,...config('normal')}),TypeError);
 assert.throws(()=>selectPresentation({win:true,drawId:-1,...config('normal')}),RangeError);
 assert.throws(()=>selectPresentation({win:true,drawId:1,mode:'rush',distribution:presentationDistribution(config('normal'))}),RangeError);
});

test('anti-repeat kernels preserve stationary masses and achieve the feasible self-transition lower bound',()=>{
 for(const mode of ['normal','rush']){
  const d=presentationDistribution(config(mode));
  for(const masses of [d.battleWin,d.battleLoss]){
   const k=battleAntiRepeatKernel(masses);
   k.transition.forEach(row=>near(sum(row),1));
   for(let j=0;j<3;j++){
    near(sum(k.weights.map((w,i)=>w*k.transition[i][j])),k.weights[j]);
    for(let i=0;i<3;i++)near(k.weights[i]*k.transition[i][j],k.weights[j]*k.transition[j][i]);
   }
   near(sum(k.weights.map((w,i)=>w*k.transition[i][i])),k.repeatProbability);
   assert.ok(k.repeatProbability<sum(k.weights.map(w=>w*w)));
  }
 }
});

test('excluding the charge population requires the conditioned normal symbol prior, not a hit reroll',()=>{
 const symbol=wNormalSymbolProbability();
 const charge=W_NORMAL_MODEL.branches.filter(b=>b.outcome==='charge').reduce((n,b)=>n+b.share,0)/W_NORMAL_MODEL.combinedOdds;
 const eligiblePrior=symbol/(1-charge),d=presentationDistribution({mode:'normal',baseWinProbability:eligiblePrior,lossReachRate:.055});
 near(eligiblePrior,1/(TOKYOGHOUL_W.normal.symbolOdds-1));
 near((1-charge)*eligiblePrior,symbol);
 d.targets.forEach((r,i)=>near(symbol*d.win[i+1]/(symbol*d.win[i+1]+(1-symbol-charge)*d.loss[i+1]),r));
 assert.ok(d.basicReliability<.01);
});

test('stateful decisions are cached, outcomes immutable, modes independent and retired IDs rejected',()=>{
 const control=createPresentationSelector(),mixed=createPresentationSelector({cacheLimit:4});
 const normal=presentationDistribution(config('normal')),rush=presentationDistribution(config('rush'));
 for(let drawId=1;drawId<=100;drawId++){
  const input={win:drawId%3===0,drawId,mode:'normal',distribution:normal};
  assert.deepEqual(control.select(input),mixed.select(input));
  assert.strictEqual(mixed.select(input),mixed.select(input));
  mixed.select({win:drawId%7===0,drawId,mode:'rush',distribution:rush});
 }
 assert.throws(()=>mixed.select({win:false,drawId:1,mode:'normal',distribution:normal}),/Retired/);
 assert.throws(()=>mixed.select({win:false,drawId:99,mode:'normal',distribution:normal}),/changed/);
 assert.throws(()=>mixed.select({win:false,drawId:101,...config('normal'),lossReachRate:.056}),/Distribution changed/);
 mixed.reset('normal');
 assert.deepEqual(mixed.select({win:false,drawId:1,mode:'normal',distribution:normal}),selectPresentation({win:false,drawId:1,mode:'normal',distribution:normal}));
});

test('stateful stratified selections retain calibrated routes and reduce battle repeats on both outcome lanes',()=>{
 const samples=1000000;
 for(const mode of ['normal','rush']){
  const d=presentationDistribution(config(mode));
  for(const win of [true,false]){
   const selector=createPresentationSelector(),masses=win?d.win:d.loss;
   const counts=Array(7).fill(0);let battles=0,repeats=0,last=null,baseRepeats=0,baseLast=null;
   for(let drawId=1;drawId<=samples;drawId++){
    const input={win,drawId,mode,distribution:d},r=selector.select(input),base=selectPresentation(input);
    counts[d.keys.indexOf(r.route==='battle'?r.variant:r.route)]++;
    assert.deepEqual({...r,variant:null},{...base,variant:null});
    if(r.route==='battle'){
     battles++;if(r.variant===last)repeats++;last=r.variant;
     if(base.variant===baseLast)baseRepeats++;baseLast=base.variant;
    }
   }
   counts.forEach((n,i)=>near(n/samples,masses[i],8*Math.sqrt(masses[i]*(1-masses[i])/samples)+1/samples));
   const k=battleAntiRepeatKernel(win?d.battleWin:d.battleLoss);
   near(repeats/(battles-1),k.repeatProbability,.025);
   assert.ok(repeats<baseRepeats,`${mode}/${win}: ${repeats} >= ${baseRepeats}`);
   if(win)assert.equal(repeats,0);
  }
 }
});
