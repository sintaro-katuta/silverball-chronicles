import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {SE_CATALOG,SE_VARIANTS,createVariantPicker,synthesizeSe} from '../src/pixi/se/original-se.js';
import {reachAudioCues,createCueTracker} from '../src/pixi/se/presentation-cues.js';
import {NORMAL_PREDICTION_FAMILIES,RUSH_PREDICTION_FAMILIES} from '../src/pixi/prediction-plan.js';
const p=(win,ending='standard',variant='pressure')=>({drawId:1,longReach:true,displayRoute:'battle',presentationMode:'normal',reachVariant:variant,reachEnding:ending,win,time:0});
test('every original PCM arrangement is finite, bounded, non-silent and unique',()=>{
 const hashes=new Set();let count=0;
 for(const name of Object.keys(SE_CATALOG))for(let v=0;v<SE_VARIANTS;v++){
  const pcm=synthesizeSe(name,v,16000);let energy=0,peak=0;
  for(const channel of [pcm.left,pcm.right]){assert.ok(channel[0]===0);assert.ok(Math.abs(channel.at(-1))<.001);for(const value of channel){assert.ok(Number.isFinite(value));peak=Math.max(peak,Math.abs(value));energy+=value*value;}}
  assert.ok(peak<.7&&energy>0.01,`${name}:${v} ${peak} ${energy}`);
  const hash=createHash('sha256').update(new Uint8Array(pcm.left.buffer)).digest('hex');assert.ok(!hashes.has(hash),name+':'+v);hashes.add(hash);count++;
 }
 assert.equal(hashes.size,Object.keys(SE_CATALOG).length*4);
});
test('four-variant rotation never repeats a neighbor or consumes gameplay RNG',()=>{
 const next=createVariantPicker();for(const name of Object.keys(SE_CATALOG)){const series=Array.from({length:12},()=>next(name));for(let i=1;i<series.length;i++)assert.notEqual(series[i],series[i-1]);assert.equal(new Set(series.slice(0,4)).size,4);}
});
test('all stories, endings, prediction families and short routes reference authored sounds',()=>{
 const assertCues=cues=>{for(const c of cues)assert.ok(c.name==='silence'||SE_CATALOG[c.name],c.name);};
 for(const variant of ['pressure','initiative','exchange'])for(const win of [true,false])for(const ending of win?['standard','revival','flash']:['standard'])assertCues(reachAudioCues(p(win,ending,variant),{pushAvailable:true}));
 for(const family of [...NORMAL_PREDICTION_FAMILIES,...RUSH_PREDICTION_FAMILIES].filter(c=>!c.confirmed&&c.family!=='hold'))assert.ok(SE_CATALOG[family.family],family.family);
 for(const mode of ['normal','rush'])for(const route of ['basic','direct'])assertCues(reachAudioCues({...p(true),presentationMode:mode,displayRoute:route}));
 for(const premium of ['moon','sword'])assertCues(reachAudioCues({...p(true),premium,premiumAt:45.5}));
});
test('revival shares ordinary defeat before comeback and confirmation waits for reveal',()=>{
 const loss=reachAudioCues(p(false)),revival=reachAudioCues(p(true,'revival'));
 assert.deepEqual(loss.filter(c=>c.at<51.7),revival.filter(c=>c.at<51.7));
 assert.equal(loss.find(c=>c.at===51.7).name,'loss');assert.equal(revival.find(c=>c.at===51.7).name,'loss');
 assert.ok(!revival.some(c=>['win','revival'].includes(c.name)&&c.at<54));assert.equal(revival.find(c=>c.name==='win').at,55.7);
 assert.deepEqual(reachAudioCues(p(true)).filter(c=>c.at<51.7),loss.filter(c=>c.at<51.7));
 assert.equal(reachAudioCues(p(true,'flash')).find(c=>c.name==='win').at,9.7);
});
test('single-strike story emits one blade impact and has a silent release gap',()=>{
 const cues=reachAudioCues(p(false));assert.deepEqual(cues.filter(c=>c.id.startsWith('strike:')).map(c=>c.at),[50.2]);
 assert.ok(cues.some(c=>c.name==='silence'&&c.at===49.65));assert.ok(!cues.some(c=>c.name==='pushPrompt'));
 assert.ok(reachAudioCues(p(false),{pushAvailable:true}).some(c=>c.name==='pushPrompt'));
});
test('frame repetition, mute, pause and seeking do not replay consumed events',()=>{
 const heard=[],tracker=createCueTracker(n=>heard.push(n),()=>{}),presentation=p(false),g={time:0,presentation,acceptedDraws:[]};
 const before=structuredClone(g);tracker.sync(g);tracker.sync(g);assert.deepEqual(g,before);assert.deepEqual(heard,['reach']);
 presentation.time=24;tracker.sync(g,{paused:true});tracker.sync(g);assert.deepEqual(heard,['reach']);
 presentation.time=43;tracker.sync(g,{enabled:false});tracker.sync(g);assert.deepEqual(heard,['reach']);
 presentation.time=50.21;tracker.sync(g);tracker.sync(g);assert.deepEqual(heard,['reach','decisiveHit']);
 tracker.reset();tracker.sync(g);assert.equal(heard.at(-1),'decisiveHit');
});
test('reach confirmation is not replayed when the post-win zoom starts',()=>{
 const heard=[],tracker=createCueTracker(n=>heard.push(n),()=>{}),presentation=p(true),g={time:51.71,presentation,acceptedDraws:[]};
 presentation.time=51.71;tracker.sync(g);g.presentation=null;g.previewWinAt=54;g.time=54;tracker.sync(g);tracker.sync(g);
 assert.equal(heard.filter(n=>n==='win').length,1);
});
test('RUSH revival entry remains quiet until its authored awakening',()=>{
 const heard=[],tracker=createCueTracker(n=>heard.push(n),()=>{}),g={time:0,acceptedDraws:[],entryPrelude:{variant:'revival',startedAt:0}};
 tracker.sync(g);g.time=.13;tracker.sync(g);assert.deepEqual(heard,['loss']);g.time=4.81;tracker.sync(g);assert.deepEqual(heard,['loss','revival']);
});

import {createPresentationSound} from '../src/pixi/se/presentation-sound.js';
test('audio voices and buffer memory remain bounded; pause, mute and disposal release sources',async()=>{
 const sources=[];const node=()=>({connect(){},disconnect(){},gain:{value:0},threshold:{value:0},knee:{value:0},ratio:{value:0}});
 const ctx={state:'running',sampleRate:44100,currentTime:0,destination:node(),resume:async()=>{},close:async()=>{ctx.state='closed';},createGain:node,createDynamicsCompressor:node,
  createBuffer:(channels,length)=>({length,copyToChannel(){}}),createBufferSource:()=>{const s={...node(),start(){},stop(){s.stopped=true;}};sources.push(s);return s;}};
 const audio=createPresentationSound({contextFactory:()=>ctx});await audio.unlock();
 for(const name of Object.keys(SE_CATALOG))for(let i=0;i<4;i++)audio.audition(name);
 assert.ok(audio.snapshot().voices<=6);assert.ok(audio.snapshot().cacheBytes<=12*1024*1024);
 audio.setEnabled(false);assert.equal(audio.snapshot().voices,0);assert.ok(sources.every(s=>s.stopped));
 const count=audio.snapshot().cues.length;audio.audition('win');assert.equal(audio.snapshot().cues.length,count);
 audio.setEnabled(true);audio.audition('win');audio.sync({time:0},{paused:true});assert.equal(audio.snapshot().voices,0);
 audio.dispose();assert.equal(ctx.state,'closed');assert.equal(audio.snapshot().cacheBytes,0);
});

test('actual RUSH replenishment has a separate cue and reset cannot replay holds',()=>{
 const heard=[],tracker=createCueTracker(n=>heard.push(n),()=>{}),g={time:0,acceptedDraws:[],rush:{remaining:12}};
 tracker.sync(g);g.rush.remaining=130;tracker.sync(g);tracker.sync(g);assert.deepEqual(heard,['rushReset']);
 tracker.reset();tracker.sync(g);assert.deepEqual(heard,['rushReset']);
});

test('PUSH prompt and actual press are separate once-only cues with no early confirmation',()=>{
 const heard=[],tracker=createCueTracker(n=>heard.push(n),()=>{}),presentation=p(false),g={time:46.5,presentation,acceptedDraws:[]};
 presentation.time=46.51;tracker.sync(g,{pushAvailable:true});assert.ok(heard.includes('pushPrompt'));
 presentation.pushInput={pressedAt:46.51};presentation.time=49.92;tracker.sync(g,{pushAvailable:true});tracker.sync(g,{pushAvailable:true});
 assert.equal(heard.filter(n=>n==='pushPress').length,1);assert.ok(!heard.includes('win'));
 presentation.time=50.21;tracker.sync(g,{pushAvailable:true});assert.equal(heard.at(-1),'decisiveHit');
});
