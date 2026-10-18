import {POCKETS_SOURCE} from '../source-layout.js';
import {SE_CATALOG,createVariantPicker,synthesizeSe} from './original-se.js';
import {createMusicPlayer,musicPose} from './music-player.js';
import {createMusicLoader} from './music-loader.js';
import {createCueTracker} from './presentation-cues.js';

export function createPresentationSound({contextFactory=()=>new AudioContext(),musicLoader=null,settings={},synthesize=synthesizeSe}={}){
 let ctx,bus,effectsBus,compressor,recording,disposed=false,enabled=true,music;
 let preferences={musicVolume:.5,effectsVolume:1,musicMuted:false,effectsMuted:false,...settings};
 const hesoPocketIds=new Set(POCKETS_SOURCE.filter(p=>p.kind==='start').map(p=>p.id));let admittedBalls=new WeakMap();
 const voices=new Set(),priorities=new Map(),voiceNames=new Map(),cache=new Map(),history=[],pick=createVariantPicker();let bytes=0;
 const stopEffects=()=>{for(const source of voices){source.onended=null;source.stop();source.disconnect();}voices.clear();priorities.clear();voiceNames.clear();};
 const stop=()=>{stopEffects();music?.pause();};
 function getBuffer(name,variant){
  const key=name+':'+variant;let buffer=cache.get(key);if(buffer)return buffer;
  const pcm=synthesize(name,variant,ctx.sampleRate);buffer=ctx.createBuffer(2,pcm.left.length,ctx.sampleRate);buffer.copyToChannel(pcm.left,0);buffer.copyToChannel(pcm.right,1);
  const size=pcm.left.byteLength*2,pinned=new Set(['win:0','rushWin:0','decisiveHit:0']);
  while(bytes+size>9*1024*1024&&cache.size){const pair=[...cache.entries()].find(([k])=>!pinned.has(k))??cache.entries().next().value;bytes-=pair[1].length*8;cache.delete(pair[0]);}
  cache.set(key,buffer);bytes+=size;return buffer;
 }
 function play(name){
  if(disposed||!enabled||preferences.effectsMuted||!ctx||ctx.state!=='running'||!SE_CATALOG[name])return;
  const spec=SE_CATALOG[name];
  if(voices.size>=6){const replaceable=[...voices].filter(s=>!['win','rushWin'].includes(voiceNames.get(s)));if(!replaceable.length)return;const first=replaceable.reduce((a,b)=>(priorities.get(a)??1)<=(priorities.get(b)??1)?a:b);
   if(spec.priority<(priorities.get(first)??1))return;first.onended=null;first.stop();first.disconnect();voices.delete(first);priorities.delete(first);voiceNames.delete(first);
  }
  const variant=pick(name),buffer=getBuffer(name,variant),source=ctx.createBufferSource();
  if(spec.priority>=2)music?.duck(spec.duckFor,spec.priority===3?.22:.58);
  source.buffer=buffer;source.connect(effectsBus);voices.add(source);priorities.set(source,spec.priority);voiceNames.set(source,name);
  source.onended=()=>{voices.delete(source);priorities.delete(source);voiceNames.delete(source);source.disconnect();};source.start();
  history.push({name,variant,time:ctx.currentTime});if(history.length>160)history.shift();
 }
 function warmCritical(){
  const jobs=['decisiveHit','win','rushWin'];
  const next=()=>{if(disposed||!ctx||!jobs.length)return;getBuffer(jobs.shift(),0);setTimeout(next,20);};setTimeout(next,0);
 }
 const tracker=createCueTracker(play,stopEffects);
 return {
  async unlock(){if(disposed)return;try{if(!ctx){ctx=contextFactory();bus=ctx.createGain();bus.gain.value=.65;compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-12;compressor.knee.value=12;compressor.ratio.value=6;bus.connect(compressor);compressor.connect(ctx.destination);effectsBus=ctx.createGain();effectsBus.gain.value=preferences.effectsVolume;effectsBus.connect(bus);music=createMusicPlayer(ctx,bus,{load:musicLoader??createMusicLoader()});music.configure(preferences);warmCritical();}if(enabled)await ctx.resume();}catch{/* Unsupported/blocked audio must not interrupt play. */}},
  sync(game,options){const active=enabled&&ctx?.state==='running'&&!options?.paused;tracker.sync(game,{...options,enabled:active&&!preferences.effectsMuted});music?.sync(musicPose(game),{paused:!!options?.paused,enabled:active});},
  setEnabled(value){enabled=!!value;if(!enabled)stop();else void this.unlock();},
  setPreferences(patch){const next={...preferences};for(const key of ['musicVolume','effectsVolume'])if(Number.isFinite(patch[key])&&patch[key]>=0&&patch[key]<=1)next[key]=patch[key];for(const key of ['musicMuted','effectsMuted'])if(typeof patch[key]==='boolean')next[key]=patch[key];preferences=next;if(effectsBus)effectsBus.gain.value=preferences.effectsVolume;if(preferences.effectsMuted)stopEffects();music?.configure(preferences);},
  // Consume the physical fact even while audio is unavailable; never queue it
  // behind unlock/resume or use draw acceptance (a full hold queue still admits).
  admission({ball,kind,pocketId,paused=false}={}){
   if(disposed||kind!=='start'||!hesoPocketIds.has(pocketId)||!ball||typeof ball!=='object'||!Number.isInteger(ball.id)||admittedBalls.get(ball)===ball.id)return;
   admittedBalls.set(ball,ball.id);if(!paused)play('admission');
  },
  audition:play,stop,reset(){admittedBalls=new WeakMap();stop();music?.reset();tracker.reset();history.length=0;},
  captureStream(){if(!ctx)return null;if(!recording){recording=ctx.createMediaStreamDestination();compressor.connect(recording);}return recording.stream;},
  snapshot:()=>({enabled:enabled&&!preferences.effectsMuted,state:ctx?.state??'locked',voices:voices.size,cacheBytes:bytes+(music?.snapshot().cacheBytes??0),music:music?.snapshot(),preferences:{...preferences},cues:[...history]}),
  dispose(){if(disposed)return;disposed=true;stop();music?.dispose();cache.clear();bytes=0;recording?.disconnect();effectsBus?.disconnect();bus?.disconnect();compressor?.disconnect();if(ctx)void ctx.close();}
 };
}
