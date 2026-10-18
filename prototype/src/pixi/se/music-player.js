import {atmospherePose} from './presentation-atmosphere.js';
export {presentationSilenceWindows} from './presentation-atmosphere.js';
export const MUSIC_FADE_IN_SECONDS=.006;
export const MUSIC_CACHE_LIMIT=32*1024*1024;
const names=new Set(['normal','battle','bonus','rush']);
// Use only the visible presentation phase, never its stored future result.
export function musicPose(game,{intro=null}={}){
 if(!game||game.phase==='result')return {name:null,time:game?.time??0,scope:'result',absolute:false,silent:true};
 // The intro camera advances while gameplay is frozen. Keep only music on
 // that display clock, retaining elapsed on skip/completion for a continuous
 // normal handoff. Authored battle clocks begin unchanged after the intro.
 const introElapsed=Number.isFinite(intro?.elapsed)?Math.max(0,intro.elapsed):0;
 if(intro?.active)return {name:'normal',time:introElapsed,scope:'normal',absolute:false,silent:false};
 const bed=atmospherePose(game);
 const battle=!!game.presentation?.longReach,name=battle?'battle':game.jackpot?'bonus':game.rush?'rush':'normal';
 // PUSH advances presentation.time, not game.time; the battle score follows that same display clock.
 return {name,time:battle?game.presentation.time:(game.time??0)+introElapsed,scope:battle?`battle:${game.presentation.drawId??game.presentation.id??'presentation'}`:name,absolute:battle,silent:!bed.active};
}
export function createMusicPlayer(context,destination,{load,cacheLimit=MUSIC_CACHE_LIMIT}={}){
 let disposed=false,current=null,anchor=0,lastTime=0,position=0,source=null,gain=null,volume=.5,muted=false,duckUntil=0,duckDepth=1,loadError=null,epoch=0,scope=null,startedAt=0,startPosition=0;
 const cache=new Map(),pending=new Map(),failed=new Map(),retiring=new Set();let bytes=0;
 const value=(param,v)=>{param.cancelScheduledValues?.(context.currentTime);param.setValueAtTime?param.setValueAtTime(v,context.currentTime):param.value=v;};
 const release=s=>{s.onended=null;s.stop();s.disconnect();};
 function stop(fade=false){if(!fade)for(const item of retiring){release(item.s);item.g.disconnect();retiring.delete(item);}if(!source)return;const s=source,g=gain;source=gain=null;
  if(fade&&g.gain.linearRampToValueAtTime){value(g.gain,g.gain.value);g.gain.linearRampToValueAtTime(0,context.currentTime+.08);retiring.add({s,g});s.onended=()=>{s.disconnect();g.disconnect();for(const item of retiring)if(item.s===s)retiring.delete(item);};s.stop(context.currentTime+.08);}else{release(s);g.disconnect();}
  while(retiring.size>1){const item=retiring.values().next().value;retiring.delete(item);release(item.s);item.g.disconnect();}
 }
 function request(name){
  if(cache.has(name)||pending.has(name)||failed.has(name)||disposed||loadError)return;
  const generation=epoch;
  const promise=Promise.resolve().then(()=>load(name,context.sampleRate)).then(pcm=>{
   if(disposed||generation!==epoch)return;
   const size=pcm.left?.byteLength+pcm.right?.byteLength;
   if(!(pcm.left instanceof Float32Array)||!(pcm.right instanceof Float32Array)||pcm.left.length!==pcm.right.length||pcm.sampleRate!==context.sampleRate||!Number.isFinite(size)||size>cacheLimit||!(pcm.loopStart>=0&&pcm.loopEnd>pcm.loopStart&&pcm.loopEnd<=pcm.left.length/context.sampleRate+1e-7))throw new Error('Invalid or oversized music PCM');
   for(const [key,b]of cache){if(bytes+size<=cacheLimit)break;if(key===current)continue;cache.delete(key);bytes-=b.bytes;}
   // Drop the previous cached track before allocating the new AudioBuffer.
   if(bytes+size>cacheLimit){for(const [key,b]of cache){cache.delete(key);bytes-=b.bytes;if(bytes+size<=cacheLimit)break;}}
   const buffer=context.createBuffer(2,pcm.left.length,context.sampleRate);buffer.copyToChannel(pcm.left,0);buffer.copyToChannel(pcm.right,1);cache.set(name,{buffer,bytes:size,loopStart:pcm.loopStart,loopEnd:pcm.loopEnd});bytes+=size;
  }).catch(error=>{if(!disposed){failed.set(name,String(error));if(name===current)loadError=String(error);}}).finally(()=>pending.delete(name));pending.set(name,promise);
 }
 function applyGain(fresh=false){if(!gain)return;const target=muted?0:volume*(context.currentTime<duckUntil?duckDepth:1),param=gain.gain;
  if(param.linearRampToValueAtTime){value(param,fresh?0:param.value);param.linearRampToValueAtTime(target,context.currentTime+(fresh?MUSIC_FADE_IN_SECONDS:.004));}
  else value(param,target);
 }
 return {
  sync(pose,{paused=false,enabled=true}={}){
   if(disposed)return;if(!Number.isFinite(pose.time))throw new Error('Invalid music clock');
   if(pose.name!==null&&!names.has(pose.name))throw new Error('Unknown music track');
   if(pose.name!==current||pose.scope!==scope||pose.time<lastTime){stop(pose.name!==current&&!pose.silent);current=pose.name;scope=pose.scope;anchor=pose.time;position=0;loadError=failed.get(current)??null;}
   lastTime=pose.time;position=Math.max(0,pose.absolute?pose.time:pose.time-anchor);
   if(!current){stop();return;}
   if(paused||!enabled||muted||pose.silent||context.state!=='running'){stop();return;}request(current);
   const entry=cache.get(current);if(!entry)return;
   if(source&&Math.abs(position-(startPosition+context.currentTime-startedAt))>.12)stop();
   let fresh=false;
   if(!source){fresh=true;source=context.createBufferSource();gain=context.createGain();gain.gain.value=0;source.buffer=entry.buffer;source.loop=true;source.loopStart=entry.loopStart;source.loopEnd=entry.loopEnd;source.connect(gain);gain.connect(destination);const offset=entry.loopStart+position%(entry.loopEnd-entry.loopStart);source.start(0,offset);startedAt=context.currentTime;startPosition=position;}
   applyGain(fresh);
   // Warm only the next battle while normal music actually plays, never all four tracks.
   if(current==='normal'&&volume>0)request('battle');
  },
  configure({musicVolume=volume,musicMuted=muted}){volume=musicVolume;muted=musicMuted;if(muted)stop();applyGain();},
  duck(seconds,depth){duckDepth=context.currentTime<duckUntil?Math.min(duckDepth,depth):depth;duckUntil=Math.max(duckUntil,context.currentTime+seconds);applyGain();},
  pause(){stop();},
  reset(){stop();for(const item of retiring){release(item.s);item.g.disconnect();}retiring.clear();current=null;scope=null;anchor=lastTime=position=0;duckUntil=0;failed.clear();},
  snapshot:()=>({name:current,position,fadeInSeconds:MUSIC_FADE_IN_SECONDS,voices:(source?1:0)+retiring.size,activeVoices:source?1:0,cachedTracks:[...cache.keys()],pendingTracks:[...pending.keys()],cacheBytes:bytes,pending:pending.size,muted,volume,loadError}),
  dispose(){if(disposed)return;this.reset();disposed=true;epoch++;cache.clear();bytes=0;pending.clear();load.dispose?.();}
 };
}
