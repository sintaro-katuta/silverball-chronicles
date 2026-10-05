import test from 'node:test';
import assert from 'node:assert/strict';
import {atmospherePose,synthesizeAtmosphere,createAtmosphere} from '../src/pixi/se/presentation-atmosphere.js';
const game=(time,win=false,ending='standard')=>({phase:'playing',presentation:{drawId:12,time,longReach:true,reachVariant:'pressure',win,reachEnding:ending}});
test('battle and gather remain audible; pitch and energy rise throughout the long single-strike hold',()=>{
 for(const time of [0,5,10,13,17,19,24,30,33,36,40,43,46,49])assert.equal(atmospherePose(game(time)).active,true,time);
 const a=atmospherePose(game(24)),b=atmospherePose(game(36)),c=atmospherePose(game(49.5));assert.ok(a.pitch<b.pitch&&b.pitch<c.pitch);assert.ok(a.level<b.level&&b.level<c.level);assert.ok(a.charge<b.charge&&b.charge<c.charge);
});
test('win, loss and revival share the bed before their reveal; ordinary defeat is preserved',()=>{
 for(let time=0;time<51.7;time+=.1){assert.deepEqual(atmospherePose(game(time,false)),atmospherePose(game(time,true)));assert.deepEqual(atmospherePose(game(time,false)),atmospherePose(game(time,true,'revival')));}
 for(const time of [51.7,52,53,53.5])assert.deepEqual(atmospherePose(game(time,false)),atmospherePose(game(time,true,'revival')));
 assert.equal(atmospherePose(game(54,true,'revival')).mode,'rekindle');assert.equal(atmospherePose(game(55.7,true,'revival')).mode,'afterglow');assert.equal(atmospherePose(game(53.5,true)).active,true);
});
test('the final release stays silent, while ordinary play and post-win guide have a quiet bed',()=>{
 for(const time of [16.2,16.7,49.65,49.9,50.19])assert.equal(atmospherePose(game(time)).active,false,time);
 assert.equal(atmospherePose(game(50.2)).active,true);assert.equal(atmospherePose({phase:'result'}).active,false);assert.ok(atmospherePose({phase:'playing'}).level>0);assert.ok(atmospherePose({phase:'playing',previewWinAt:0}).level>0);
});
test('atmosphere PCM has no dropouts and remains within its support-layer budget',()=>{
 for(let variant=0;variant<4;variant++){const pcm=synthesizeAtmosphere(variant,16000);assert.ok(pcm.left.byteLength*2<1024*1024);for(const data of [pcm.left,pcm.right]){for(let start=0;start<data.length;start+=1600){let energy=0;for(const x of data.slice(start,start+1600)){assert.ok(Number.isFinite(x)&&Math.abs(x)<1);energy+=x*x;}assert.ok(energy>.2);}}}
});
test('only two bed sources exist; silence mutes them and pause/dispose stops and disconnects',()=>{
 const sources=[],params=[];const param=()=>{const p={value:0,target:null,cancelScheduledValues(){},setTargetAtTime(v){p.target=v;}};params.push(p);return p;};
 const node=()=>({connect(){},disconnect(){this.disconnected=true;}});
 const source=()=>{const s={...node(),start(){},stop(){this.stopped=true;}};sources.push(s);return s;};
 const context={currentTime:0,sampleRate:16000,createBuffer:(n,length)=>({length,copyToChannel(){}}),createBufferSource:source,createGain:()=>({...node(),gain:param()}),createBiquadFilter:()=>({...node(),frequency:param(),Q:{value:0}}),createOscillator:()=>{const s=source();s.frequency=param();return s;}};
 const bed=createAtmosphere(context,node());bed.sync(atmospherePose(game(30)));assert.equal(sources.length,2);for(let i=0;i<100;i++)bed.sync(atmospherePose(game(30+i*.01)));assert.equal(sources.length,2);
 bed.sync(atmospherePose(game(49.9)));assert.equal(params[0].target,0);assert.equal(params[3].target,0);
 bed.stop();assert.equal(bed.snapshot().voices,0);assert.ok(sources.every(s=>s.stopped&&s.disconnected));bed.sync(atmospherePose(game(50.2)));assert.equal(sources.length,4);bed.dispose();assert.equal(bed.snapshot().voices,0);assert.equal(bed.snapshot().bufferBytes,0);
});
