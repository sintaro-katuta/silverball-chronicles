import {SE_CATALOG,createVariantPicker,synthesizeSe} from './original-se.js';
import {createCueTracker} from './presentation-cues.js';

export function createPresentationSound({contextFactory=()=>new AudioContext()}={}){
 let ctx,bus,compressor,recording,disposed=false,enabled=true;
 const voices=new Set(),cache=new Map(),history=[],pick=createVariantPicker();let bytes=0;
 const stop=()=>{for(const source of voices){source.onended=null;source.stop();source.disconnect();}voices.clear();};
 function play(name){
  if(disposed||!enabled||!ctx||ctx.state!=='running'||!SE_CATALOG[name])return;
  const variant=pick(name),key=name+':'+variant;let buffer=cache.get(key);
  if(!buffer){const pcm=synthesizeSe(name,variant,ctx.sampleRate);buffer=ctx.createBuffer(2,pcm.left.length,ctx.sampleRate);buffer.copyToChannel(pcm.left,0);buffer.copyToChannel(pcm.right,1);
   const size=pcm.left.byteLength*2;while(bytes+size>12*1024*1024&&cache.size){const [k,b]=cache.entries().next().value;bytes-=b.length*8;cache.delete(k);}cache.set(key,buffer);bytes+=size;
  }
  if(voices.size>=6){const first=voices.values().next().value;first.stop();first.disconnect();voices.delete(first);}
  const source=ctx.createBufferSource();source.buffer=buffer;source.connect(bus);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();};source.start();
  history.push({name,variant,time:ctx.currentTime});if(history.length>160)history.shift();
 }
 const tracker=createCueTracker(play,stop);
 return {
  async unlock(){if(disposed)return;try{if(!ctx){ctx=contextFactory();bus=ctx.createGain();bus.gain.value=.65;compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-12;compressor.knee.value=12;compressor.ratio.value=6;bus.connect(compressor);compressor.connect(ctx.destination);}if(enabled)await ctx.resume();}catch{/* Unsupported/blocked audio must not interrupt play. */}},
  sync(game,options){tracker.sync(game,{...options,enabled:enabled&&ctx?.state==='running'});},
  setEnabled(value){enabled=!!value;if(!enabled)stop();else void this.unlock();},
  audition:play,stop,reset(){tracker.reset();history.length=0;},
  captureStream(){if(!ctx)return null;if(!recording){recording=ctx.createMediaStreamDestination();compressor.connect(recording);}return recording.stream;},
  snapshot:()=>({enabled,state:ctx?.state??'locked',voices:voices.size,cacheBytes:bytes,cues:[...history]}),
  dispose(){if(disposed)return;disposed=true;stop();cache.clear();bytes=0;recording?.disconnect();bus?.disconnect();compressor?.disconnect();if(ctx)void ctx.close();}
 };
}
