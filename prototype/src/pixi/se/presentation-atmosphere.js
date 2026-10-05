import {reachSchedule} from '../reach-ending.js';
const clamp=x=>Math.max(0,Math.min(1,x));
// Result-independent bed until the visual reveal. Its envelope uses display
// time, so pressing PUSH, pause/resume and seeking cannot leave a stale rise.
export function atmospherePose(game){
 const p=game?.presentation,t=p?.time??0,variant=((Number(p?.drawId)||0)%4+4)%4;
 const pose={active:game?.phase!=='result',mode:'idle',level:.027,pitch:135,charge:0,variant};
 if(!game)return {...pose,active:false};
 if(!p?.longReach){
  if(game.previewWinAt!==undefined)return {...pose,mode:'afterglow',level:.052,pitch:220};
  if(game.jackpot)return {...pose,mode:'bonus',level:.039,pitch:175};
  return {...pose,mode:game.spinActive?'spin':'idle',level:game.spinActive?.036:.027};
 }
 if(p.reachEnding==='flash'){
  if(t>=reachSchedule(p).decisionAt)return {...pose,mode:'afterglow',level:.052,pitch:220};
  const charge=clamp((t-4)/4.4);return {...pose,mode:'charge',level:.052+.04*charge,pitch:160+570*charge,charge};
 }
 if(t>=16.2&&t<17||t>=49.65&&t<50.2||t>=53.3&&t<54&&(p.reachEnding==='revival'||p.win===false))return {...pose,active:false,mode:'silence',level:0};
 if(t>=51.7){
  if(p.reachEnding==='revival'&&t<54)return {...pose,mode:'defeat',level:.019,pitch:100};
  if(p.reachEnding==='revival'&&t<55.7){const charge=clamp((t-54)/1.7);return {...pose,mode:'rekindle',level:.045+.045*charge,pitch:180+500*charge,charge};}
  return {...pose,mode:p.win?'afterglow':'defeat',level:p.win?.052:.019,pitch:p.win?220:100};
 }
 const charge=clamp((t-24)/25.65),pressure=(p.reachVariant??'pressure')==='pressure';
 // A moving filtered-air layer under battle; the single-strike story builds
 // continuously from gathering moonlight to the close-up of the final resolve.
 return {...pose,mode:t>=24?'charge':'battle',level:t>=24?.047+.047*charge:.047,
  pitch:pressure?140+590*charge:170+350*charge,charge:t>=24?(pressure?charge:charge*.65):0};
}

export function synthesizeAtmosphere(variant=0,sampleRate=44100,{charge=false}={}){
 const seconds=3,n=Math.round(sampleRate*seconds),left=new Float32Array(n),right=new Float32Array(n);
 let seed=93491+variant*1979,low=0,slow=0,grain=0;
 const frequencies=charge?[183,293,451,719,1123,1709]:[63,147,233];
 for(let i=0;i<n;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;
  low+=.12*(noise-low);slow+=.012*(noise-slow);grain+=.35*(noise-grain);const t=i/sampleRate;
  const breath=.72+.12*Math.sin(2*Math.PI*t/seconds)+.08*Math.sin(4*Math.PI*t/seconds+variant);
  let resonance=0,spread=0;
  for(let j=0;j<frequencies.length;j++){
   const f=frequencies[j]+variant*(j+1)*1.33,w=(charge?.053:.073)/(1+j*.42);
   const shimmer=.7+.3*Math.sin(2*Math.PI*(1+j*.667)*t+variant);
   resonance+=Math.sin(2*Math.PI*f*t)*w*shimmer;
   spread+=Math.sin(2*Math.PI*(f+1.7)*t+.4)*w*shimmer;
  }
  const friction=charge?((grain-low)*.75+(low-slow)*.38):((low-slow)*.85+slow*.40);
  left[i]=(friction+resonance)*breath;
  right[i]=(friction*.89+spread)*breath;
 }
 const edge=Math.round(sampleRate*.04);
 for(const data of [left,right])for(let i=0;i<edge;i++){const u=i/edge;data[n-edge+i]=data[n-edge+i]*(1-u)+data[i]*u;}
 return {left,right,sampleRate};
}

export function createAtmosphere(context,destination){
 let noise,tone,airGain,toneGain,filter,toneFilter,variant=null,buffer,chargeBuffer,pose=null,duckUntil=0,duckDepth=1;
 const stop=()=>{for(const source of [noise,tone])if(source){source.stop();source.disconnect();}airGain?.disconnect();toneGain?.disconnect();filter?.disconnect();toneFilter?.disconnect();noise=tone=airGain=toneGain=filter=toneFilter=null;pose=null;duckUntil=0;};
 function createBuffer(charge){const pcm=synthesizeAtmosphere(variant,context.sampleRate,{charge}),b=context.createBuffer(2,pcm.left.length,context.sampleRate);b.copyToChannel(pcm.left,0);b.copyToChannel(pcm.right,1);return b;}
 function start(next){
  if(!buffer||variant!==next.variant){variant=next.variant;buffer=createBuffer(false);chargeBuffer=createBuffer(true);}
  noise=context.createBufferSource();noise.buffer=buffer;noise.loop=true;noise.loopStart=.04;airGain=context.createGain();airGain.gain.value=0;
  filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1600;filter.Q.value=.45;
  noise.connect(filter);filter.connect(airGain);airGain.connect(destination);noise.start(0,.04);
  tone=context.createBufferSource();tone.buffer=chargeBuffer;tone.loop=true;tone.loopStart=.04;
  toneFilter=context.createBiquadFilter();toneFilter.type='lowpass';toneFilter.Q.value=.6;toneGain=context.createGain();toneGain.gain.value=0;
  tone.connect(toneFilter);toneFilter.connect(toneGain);toneGain.connect(destination);tone.start(0,.04);
 }
 const target=(param,value,seconds)=>{param.cancelScheduledValues(context.currentTime);param.setTargetAtTime(value,context.currentTime,seconds);};
 return {
  sync(next){
   pose=next;
   if(!next.active){if(noise){target(airGain.gain,0,.002);target(toneGain.gain,0,.002);}return;}
   if(noise&&variant!==next.variant){const until=duckUntil,depth=duckDepth;stop();duckUntil=until;duckDepth=depth;}if(!noise)start(next);pose=next;
   const duck=context.currentTime<duckUntil?duckDepth:1;
   target(airGain.gain,next.level*duck,.045);target(toneGain.gain,next.charge*.057*duck,.045);
   // Opening the texture and tightening its grain replaces the exposed siren.
   target(tone.playbackRate,.72+.48*next.charge,.07);
   target(toneFilter.frequency,480+next.charge**1.7*3800,.07);
   target(filter.frequency,1000+next.charge*1400,.06);
  },
  duck(seconds,depth=.3){duckDepth=context.currentTime<duckUntil?Math.min(duckDepth,depth):depth;duckUntil=Math.max(duckUntil,context.currentTime+seconds);if(airGain){target(airGain.gain,(pose?.level??0)*duckDepth,.006);target(toneGain.gain,(pose?.charge??0)*.057*duckDepth,.006);}},
  stop,
  snapshot:()=>({mode:pose?.mode??'stopped',level:pose?.level??0,charge:pose?.charge??0,pitch:pose?.pitch??0,ducked:context.currentTime<duckUntil,voices:noise?2:0,bufferBytes:buffer?buffer.length*16:0}),
  dispose(){stop();buffer=chargeBuffer=null;}
 };
}
