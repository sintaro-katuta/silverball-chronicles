import test from'node:test';import assert from'node:assert/strict';
import{musicPose,createMusicPlayer,MUSIC_CACHE_LIMIT,MUSIC_FADE_IN_SECONDS,presentationSilenceWindows}from'../src/pixi/se/music-player.js';
import{createMusicLoader}from'../src/pixi/se/music-loader.js';
import{createAudioSettings,DEFAULT_AUDIO_SETTINGS}from'../src/app/audio-settings.js';
import{createCueTracker}from'../src/pixi/se/presentation-cues.js';
import{createPresentationSound}from'../src/pixi/se/presentation-sound.js';
const game=(time,win=false,ending='standard')=>({phase:'playing',time:100+time,presentation:{drawId:7,time,longReach:true,reachVariant:'pressure',win,reachEnding:ending}});
const flush=async()=>{await new Promise(resolve=>setImmediate(resolve));};
function fixture(){const sources=[],gains=[];const param=()=>({value:0,events:[],cancelScheduledValues(){},setValueAtTime(v,t){this.events.push({type:'set',value:v,time:t});this.value=v;},linearRampToValueAtTime(v,t){this.events.push({type:'ramp',value:v,time:t});this.value=v;}}),node=()=>({connect(){},disconnect(){this.disconnected=true;}});const ctx={sampleRate:100,currentTime:0,state:'running',createBuffer:(_,length)=>({length,copyToChannel(){}}),createGain:()=>{const g={...node(),gain:param()};gains.push(g);return g;},createBufferSource:()=>{const s={...node(),start(when,offset){this.offset=offset;},stop(){this.stopped=true;}};sources.push(s);return s;}};const loads=[];const load=async name=>{loads.push(name);return {left:new Float32Array(1000),right:new Float32Array(1000),sampleRate:100,loopStart:0,loopEnd:10};};return {ctx,sources,gains,loads,player:createMusicPlayer(ctx,node(),{load})};}
test('music selection does not disclose stored win/revival; battle uses presentation clock and exact existing silence boundaries',()=>{
 for(let t=0;t<51.7;t+=.1){assert.deepEqual(musicPose(game(t)),musicPose(game(t,true)));assert.deepEqual(musicPose(game(t)),musicPose(game(t,true,'revival')));}
 for(const t of[16.2,16.7,49.65,49.9,50.19])assert.equal(musicPose(game(t)).silent,true);assert.equal(musicPose(game(50.2)).silent,false);assert.equal(musicPose(game(49.9)).time,49.9);assert.equal(musicPose(game(49.9)).absolute,true);
 assert.equal(musicPose(game(53.3,true,'revival')).silent,true);assert.equal(musicPose({phase:'playing',time:1,jackpot:{}}).name,'bonus');assert.equal(musicPose({phase:'playing',time:1,rush:{}}).name,'rush');assert.equal(musicPose({phase:'playing',time:1}).name,'normal');assert.equal(musicPose({phase:'result',time:1}).name,null);
});
test('lazy loading, game-clock pause/resume, PUSH/seek and silence resume at actual display offset without pad source',async()=>{
 const f=fixture(),p=f.player;p.sync(musicPose(game(45)));await flush();p.sync(musicPose(game(45)));assert.equal(f.sources[0].offset,5);assert.deepEqual(f.loads,['battle']);
 f.ctx.currentTime=1;p.sync(musicPose(game(46)));p.pause();const paused=p.snapshot().position;f.ctx.currentTime=100;p.sync(musicPose(game(46)),{paused:true});assert.equal(p.snapshot().position,paused);assert.equal(p.snapshot().voices,0);
 p.sync(musicPose(game(46)));assert.equal(f.sources.at(-1).offset,6);p.sync(musicPose(game(49.9)));assert.equal(p.snapshot().voices,0);p.sync(musicPose(game(50.2)));assert.ok(Math.abs(f.sources.at(-1).offset-.2)<1e-9);
 p.sync(musicPose(game(30)));assert.equal(f.sources.at(-1).offset,0);p.reset();assert.equal(p.snapshot().voices,0);assert.equal(p.snapshot().name,null);p.dispose();assert.equal(p.snapshot().cacheBytes,0);assert.ok(f.sources.every(s=>s.stopped&&s.disconnected));
});
test('independent music mute/volume never reallocates buffers, transition voices and decoded cache are bounded',async()=>{
 const f=fixture(),p=f.player;for(const name of['normal','battle','bonus','rush','normal']){p.sync({name,time:1,scope:name});await flush();p.sync({name,time:1,scope:name});assert.ok(p.snapshot().voices<=2);assert.ok(p.snapshot().cacheBytes<=MUSIC_CACHE_LIMIT);}
 const loads=f.loads.length;p.configure({musicVolume:.2});assert.equal(p.snapshot().volume,.2);assert.equal(f.loads.length,loads);p.configure({musicMuted:true});assert.equal(p.snapshot().voices,0);p.configure({musicMuted:false});p.sync({name:'normal',time:2,scope:'normal'});assert.equal(f.loads.length,loads);p.dispose();
});
test('late async generation and worker replies cannot revive disposed player/session',async()=>{
 const f=fixture();let resolve;const load=()=>new Promise(r=>{resolve=r;});const p=createMusicPlayer(f.ctx,{connect(){}},{load});p.sync({name:'normal',scope:'normal',time:0});await flush();p.dispose();resolve({left:new Float32Array(10),right:new Float32Array(10),sampleRate:100,loopStart:0,loopEnd:.1});await flush();assert.equal(p.snapshot().voices,0);assert.equal(p.snapshot().cacheBytes,0);
 const worker={postMessage(v){this.request=v;},terminate(){this.terminated=true;}},loader=createMusicLoader({workerFactory:()=>worker});const pending=loader('normal',100);loader.dispose();await assert.rejects(pending,/disposed/);assert.equal(worker.terminated,true);worker.onmessage({data:{id:worker.request.id,pcm:{}}});
});
test('audio settings independently persist through session recreation; corrupt/denied storage is safe',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)},a=createAudioSettings(storage);assert.deepEqual(a.snapshot(),DEFAULT_AUDIO_SETTINGS);a.update({musicMuted:true,musicVolume:.25,effectsVolume:.8});const b=createAudioSettings(storage);assert.deepEqual(b.snapshot(),a.snapshot());assert.equal(b.snapshot().effectsMuted,false);const c=b.snapshot();c.musicVolume=1;assert.equal(b.snapshot().musicVolume,.25);b.update({musicVolume:NaN,effectsVolume:5});assert.equal(b.snapshot().musicVolume,.5);assert.equal(b.snapshot().effectsVolume,1);assert.deepEqual(createAudioSettings({getItem(){throw Error('denied');}}).snapshot(),DEFAULT_AUDIO_SETTINGS);assert.doesNotThrow(()=>createAudioSettings({getItem:()=>null,setItem(){throw Error('denied');}}).update({musicMuted:true}));
});
test('BONUS start is a once-only first-round opening cue and mute consumes it without replay',()=>{
 const heard=[],t=createCueTracker(name=>heard.push(name),()=>{}),g={time:1,previewWinAt:0,acceptedDraws:[],jackpot:{}};const round={round:1,phase:'opening',payout:0};t.sync(g,{rounds:round});t.sync(g,{rounds:round});assert.equal(heard.filter(n=>n==='bonusStart').length,1);t.sync(g,{rounds:{round:2,phase:'opening',payout:0}});assert.equal(heard.filter(n=>n==='bonusStart').length,1);const muted=createCueTracker(name=>heard.push(name),()=>{});muted.sync(g,{rounds:round,enabled:false});muted.sync(g,{rounds:round});assert.equal(heard.filter(n=>n==='bonusStart').length,1);
});

test('integrated buses keep SE/music independent, mute consumes cues, and disposal is idempotent without gameplay mutations',async()=>{
 const f=fixture();f.ctx.destination={};f.ctx.createDynamicsCompressor=()=>({threshold:{value:0},knee:{value:0},ratio:{value:0},connect(){},disconnect(){}});f.ctx.resume=async()=>{};f.ctx.close=async()=>{f.ctx.state='closed';};const loader=async()=>({left:new Float32Array(1000),right:new Float32Array(1000),sampleRate:100,loopStart:0,loopEnd:10});const audio=createPresentationSound({contextFactory:()=>f.ctx,musicLoader:loader,synthesize:()=>({left:new Float32Array(10),right:new Float32Array(10)})});await audio.unlock();const g=game(30),original=structuredClone(g);audio.sync(g);await flush();audio.sync(g);assert.deepEqual(g,original);assert.equal(audio.snapshot().music.voices,1);audio.audition('pushPress');assert.equal(audio.snapshot().voices,1);audio.setPreferences({effectsMuted:true});assert.equal(audio.snapshot().voices,0);assert.equal(audio.snapshot().music.voices,1);assert.equal(audio.snapshot().enabled,false);audio.setPreferences({musicMuted:true,effectsMuted:false});assert.equal(audio.snapshot().music.voices,0);audio.audition('pushPress');assert.equal(audio.snapshot().voices,1);audio.setPreferences({musicVolume:.3,effectsVolume:.7});assert.equal(audio.snapshot().preferences.musicVolume,.3);audio.sync(g,{paused:true});assert.equal(audio.snapshot().voices,0);audio.stop();audio.dispose();audio.dispose();assert.equal(audio.snapshot().cacheBytes,0);assert.equal(f.ctx.state,'closed');
});

test('new BONUS/RUSH stings cannot evict playing win or rushWin signatures at the six-voice limit',async()=>{
 const f=fixture();f.ctx.destination={};f.ctx.createDynamicsCompressor=()=>({threshold:{value:0},knee:{value:0},ratio:{value:0},connect(){},disconnect(){}});f.ctx.resume=async()=>{};f.ctx.close=async()=>{};
 const audio=createPresentationSound({contextFactory:()=>f.ctx,synthesize:()=>({left:new Float32Array(10),right:new Float32Array(10)})});await audio.unlock();for(let i=0;i<6;i++)audio.audition(i%2?'win':'rushWin');const before=audio.snapshot().cues.length;audio.audition('bonusStart');audio.audition('rushStart');assert.equal(audio.snapshot().cues.length,before);assert.equal(audio.snapshot().voices,6);assert.ok(f.sources.every(s=>!s.stopped));audio.dispose();
});

test('shared silence windows include53.3 and preserve exact half-open runtime boundaries, without exposing pre-result differences',()=>{
 const p=game(0).presentation;assert.deepEqual(presentationSilenceWindows(p),[{start:16.2,end:17},{start:49.65,end:50.2},{start:53.3,end:54}]);assert.deepEqual(presentationSilenceWindows({...p,win:true}),[{start:16.2,end:17},{start:49.65,end:50.2}]);assert.deepEqual(presentationSilenceWindows({...p,win:true,reachEnding:'revival'}),presentationSilenceWindows(p));assert.deepEqual(presentationSilenceWindows({...p,reachEnding:'flash'}),[]);
 for(const w of presentationSilenceWindows(p)){assert.equal(musicPose(game(w.start-.0001)).silent,false);assert.equal(musicPose(game(w.start)).silent,true);assert.equal(musicPose(game(w.end-.0001)).silent,true);assert.equal(musicPose(game(w.end)).silent,false);}
});
test('BGM starts and seeks ramp from zero over6ms; mute/pause/silence remain immediate and do not change display position',async()=>{
 const f=fixture(),p=f.player;p.sync(musicPose(game(30)));await flush();p.sync(musicPose(game(30)));const first=f.gains.at(-1).gain.events;assert.deepEqual(first.slice(-2),[{type:'set',value:0,time:0},{type:'ramp',value:.5,time:MUSIC_FADE_IN_SECONDS}]);assert.equal(p.snapshot().position,30);p.pause();assert.equal(p.snapshot().voices,0);f.ctx.currentTime=10;p.sync(musicPose(game(30)));assert.deepEqual(f.gains.at(-1).gain.events.slice(-2),[{type:'set',value:0,time:10},{type:'ramp',value:.5,time:10+MUSIC_FADE_IN_SECONDS}]);p.sync(musicPose(game(49.9)));assert.equal(p.snapshot().voices,0);p.dispose();
});

test('normal playback warms only battle and enters a ready battle immediately at its first display offset',async()=>{
 const f=fixture(),p=f.player;p.sync({name:'normal',scope:'normal',time:0});await flush();p.sync({name:'normal',scope:'normal',time:.01});await flush();assert.deepEqual(f.loads,['normal','battle']);assert.deepEqual(p.snapshot().cachedTracks,['normal','battle']);assert.equal(p.snapshot().pending,0);const count=f.sources.length;p.sync(musicPose(game(.02)));assert.equal(p.snapshot().pending,0);assert.equal(p.snapshot().activeVoices,1);assert.equal(f.sources.length,count+1);assert.equal(f.sources.at(-1).offset,.02);assert.equal(p.snapshot().position,.02);assert.ok(p.snapshot().cacheBytes<=MUSIC_CACHE_LIMIT);p.dispose();
});
test('muted/paused normal music never prefetches; disposal during battle warm-up discards the late PCM',async()=>{
 const f=fixture(),p=f.player;p.configure({musicMuted:true});p.sync({name:'normal',scope:'normal',time:0});await flush();assert.deepEqual(f.loads,[]);p.configure({musicMuted:false});p.sync({name:'normal',scope:'normal',time:0},{paused:true});await flush();assert.deepEqual(f.loads,[]);p.configure({musicVolume:0});p.sync({name:'normal',scope:'normal',time:0});await flush();p.sync({name:'normal',scope:'normal',time:.01});await flush();assert.deepEqual(f.loads,['normal']);p.dispose();
 let finishBattle;const loads=[];const player=createMusicPlayer(f.ctx,{connect(){}},{load:async name=>{loads.push(name);if(name==='battle')return new Promise(resolve=>{finishBattle=resolve;});return {left:new Float32Array(1000),right:new Float32Array(1000),sampleRate:100,loopStart:0,loopEnd:10};}});player.sync({name:'normal',scope:'normal',time:0});await flush();player.sync({name:'normal',scope:'normal',time:.01});await flush();assert.deepEqual(loads,['normal','battle']);assert.deepEqual(player.snapshot().pendingTracks,['battle']);player.dispose();finishBattle({left:new Float32Array(1000),right:new Float32Array(1000),sampleRate:100,loopStart:0,loopEnd:10});await flush();assert.equal(player.snapshot().cacheBytes,0);assert.equal(player.snapshot().voices,0);
});

test('physical heso admission sounds once per ball even with full holds; other inlets and unavailable audio never backlog',async()=>{
 const f=fixture();f.ctx.destination={};f.ctx.createDynamicsCompressor=()=>({threshold:{value:0},knee:{value:0},ratio:{value:0},connect(){},disconnect(){}});f.ctx.resume=async()=>{};f.ctx.close=async()=>{};
 const audio=createPresentationSound({contextFactory:()=>f.ctx,synthesize:()=>({left:new Float32Array(10),right:new Float32Array(10)})});
 const balls=new Map(),admit=(ballId,extra={})=>{if(!balls.has(ballId))balls.set(ballId,{id:ballId});audio.admission({ball:balls.get(ballId),kind:'start',pocketId:4,...extra});};
 admit(1);await audio.unlock();admit(1);assert.equal(audio.snapshot().cues.length,0,'locked admission is consumed');
 const g={time:0,acceptedDraws:Array.from({length:4},(_,i)=>({id:i})),holdCount:4},before=structuredClone(g);
 admit(2);admit(2);admit(3);assert.deepEqual(audio.snapshot().cues.map(c=>c.name),['admission','admission']);assert.deepEqual(g,before);
 for(const kind of['rush','fuzu','normal','bonus'])admit(10,{kind});admit(10,{pocketId:8});assert.equal(audio.snapshot().cues.length,2);
 audio.setPreferences({effectsMuted:true});admit(4);audio.setPreferences({effectsMuted:false});admit(4);admit(5,{paused:true});admit(5);assert.equal(audio.snapshot().cues.length,2);
 audio.setEnabled(false);admit(6);audio.setEnabled(true);admit(6);assert.equal(audio.snapshot().cues.length,2);
 for(let id=20;id<35;id++)admit(id);assert.ok(audio.snapshot().voices<=6);
 audio.reset();admit(2);const spinning={time:0,spinActive:true,spinResult:{drawId:99},drawTimer:0,drawTempo:1,reelStopGap:.2,acceptedDraws:[]};audio.sync(spinning);audio.sync(spinning);admit(2);assert.deepEqual(audio.snapshot().cues.map(c=>c.name),['admission','spin'],'same-frame admission and spin are each emitted once');audio.dispose();admit(99);assert.equal(audio.snapshot().cues.length,2);
});

test('reel lifecycle emits each stop once and direct presentation cannot duplicate the same draw spin',()=>{
 const heard=[],t=createCueTracker(n=>heard.push(n),()=>{}),g={time:0,spinActive:true,spinResult:{drawId:12},drawTimer:0,drawTempo:1,reelStopGap:.2,acceptedDraws:[]};
 t.sync(g);t.sync(g);g.drawTimer=1;t.sync(g);g.drawTimer=1.2;t.sync(g);t.sync(g);g.spinActive=false;g.presentation={drawId:12,displayRoute:'direct',time:0,win:false};t.sync(g);t.sync(g);g.presentation=null;g.lastResolvedDraw={drawId:12};g.lastDraw=false;t.sync(g);t.sync(g);
 assert.deepEqual(heard,['spin','stopLeft','stopRight','stopCenter']);
 const muted=createCueTracker(n=>heard.push(n),()=>{});g.spinActive=true;g.spinResult={drawId:13};g.drawTimer=1.2;g.lastResolvedDraw=null;muted.sync(g,{enabled:false});muted.sync(g);assert.equal(heard.length,4);
});

test('actual physical heso crossing with a full queue notifies once without changing admission, FIFO or prize accounting',async()=>{
 const {createBoardFlow}=await import('../src/pixi/board-flow.js'),{productionBoardFlowOptions}=await import('../src/app/production-board-profile.js'),{attachNormalSpin}=await import('../src/pixi/normal-spin-flow.js'),{SessionGame}=await import('../src/domain/session-game.js');
 function run(observe){
  const game=new SessionGame(()=>.9),model=createBoardFlow({lcd:true,...productionBoardFlowOptions()}),flow=model.flow;attachNormalSpin(flow,{sessionGame:game,roundModel:model,lifecycle:true});
  for(let id=1000;id<1008;id++)game.hit({id},'start',4);
  const serial=game.drawSerial,queue=structuredClone(game.acceptedDraws),heard=[],hit=flow.game.hit.bind(flow.game);
  if(observe)flow.game.hit=(ball,kind,id)=>{hit(ball,kind,id);heard.push({ballId:ball.id,kind,pocketId:id,accepted:game.drawSerial-serial});};
  const p=flow.physics,mouth=p.pockets.find(q=>q.kind==='start'),ball=p.spawn({extra:true},.18);Object.assign(ball,{x:mouth.x,y:mouth.y-4,vx:0,vy:40,leftLaunchPlane:true});
  for(let i=0;i<24;i++)p.step(1/120,flow.game);
  assert.equal(game.drawSerial,serial,'full queue cannot accept a further draw');assert.deepEqual(game.acceptedDraws,queue);assert.equal(flow.counts.start,1);assert.equal(p.balls.length,0);
  return {heard,state:JSON.parse(JSON.stringify({counts:flow.counts,metrics:p.metrics,events:game.events,serial:game.drawSerial,queue:game.acceptedDraws,total:game.total,stock:game.stock,accounting:game.accounting}))};
 }
 const off=run(false),on=run(true);assert.deepEqual(on.state,off.state);assert.equal(on.heard.length,1);assert.deepEqual(on.heard[0],{ballId:1,kind:'start',pocketId:4,accepted:0});
});


test('intro music follows camera elapsed without advancing gameplay; natural/skip handoff and pause never reset the opening note',async()=>{
 const f=fixture(),p=f.player,g={phase:'playing',time:0},original=structuredClone(g);p.sync(musicPose(g,{intro:{active:true,elapsed:0}}));await flush();p.sync(musicPose(g,{intro:{active:true,elapsed:0}}));
 for(let i=1;i<=38;i++){f.ctx.currentTime=i/10;p.sync(musicPose(g,{intro:{active:i<38,elapsed:i/10}}));}
 assert.deepEqual(g,original);assert.equal(f.sources.length,1);assert.equal(p.snapshot().position,3.8);g.time=.1;f.ctx.currentTime=3.9;p.sync(musicPose(g,{intro:{active:false,elapsed:3.8}}));assert.equal(f.sources.length,1);assert.ok(Math.abs(p.snapshot().position-3.9)<1e-8);
 p.pause();f.ctx.currentTime=10;p.sync(musicPose(g,{intro:{active:false,elapsed:3.8}}),{paused:true});assert.equal(p.snapshot().voices,0);p.sync(musicPose(g,{intro:{active:false,elapsed:3.8}}));assert.equal(f.sources.length,2);assert.ok(Math.abs(f.sources.at(-1).offset-3.9)<1e-8);p.dispose();
 const q=fixture();q.player.sync(musicPose({phase:'playing',time:0},{intro:{active:true,elapsed:0}}));await flush();q.player.sync(musicPose({phase:'playing',time:0},{intro:{active:true,elapsed:0}}));q.ctx.currentTime=.9;q.player.sync(musicPose({phase:'playing',time:0},{intro:{active:true,elapsed:.9}}));q.player.sync(musicPose({phase:'playing',time:0},{intro:{active:false,elapsed:.9}}));assert.equal(q.sources.length,1);assert.equal(q.player.snapshot().position,.9);q.player.dispose();
});
test('all experience intros use the same normal bed; battle keeps its actual absolute clock after intro and reduced motion adds no offset',()=>{
 for(const g of[game(0,true),{phase:'playing',time:0,jackpot:{}},{phase:'playing',time:0,rush:{}}]){const saved=structuredClone(g);assert.deepEqual(musicPose(g,{intro:{active:true,elapsed:1}}),{name:'normal',scope:'normal',time:1,absolute:false,silent:false});assert.deepEqual(g,saved);}
 assert.equal(musicPose(game(0,true),{intro:{active:false,elapsed:3.8}}).time,0);assert.equal(musicPose(game(49.9,true),{intro:{active:false,elapsed:3.8}}).silent,true);assert.deepEqual(musicPose({phase:'playing',time:2},{intro:{active:false,elapsed:0}}),musicPose({phase:'playing',time:2}));
});
