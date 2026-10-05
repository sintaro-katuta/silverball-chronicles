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

export function synthesizeAtmosphere(variant=0,sampleRate=44100){
 const seconds=3,n=Math.round(sampleRate*seconds),left=new Float32Array(n),right=new Float32Array(n);
 let seed=93491+variant*1979,low=0,slow=0;
 for(let i=0;i<n;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;
  low+=.16*(noise-low);slow+=.016*(noise-slow);const t=i/sampleRate;
  const breath=.72+.15*Math.sin(2*Math.PI*t/seconds)+.10*Math.sin(4*Math.PI*t/seconds+variant);
  const resonance=.11*Math.sin(2*Math.PI*(63+variant*3)*t)+.06*Math.sin(2*Math.PI*(147+variant*6)*t);
  left[i]=((low-slow)*1.2+slow*.5+resonance)*breath;
  right[i]=((low-slow)*1.0+slow*.7+resonance)*breath;
 }
 // Crossfade the last 40ms into the first; neither edge drops to zero.
 const edge=Math.round(sampleRate*.04);
 for(const data of [left,right])for(let i=0;i<edge;i++){const u=i/edge;data[n-edge+i]=data[n-edge+i]*(1-u)+data[i]*u;}
 return {left,right,sampleRate};
}

export function createAtmosphere(context,destination){
 let noise,tone,airGain,toneGain,filter,variant=null,buffer,pose=null;
 const stop=()=>{for(const source of [noise,tone])if(source){source.stop();source.disconnect();}airGain?.disconnect();toneGain?.disconnect();filter?.disconnect();noise=tone=airGain=toneGain=filter=null;pose=null;};
 function start(next){
  if(!buffer||variant!==next.variant){const pcm=synthesizeAtmosphere(next.variant,context.sampleRate);buffer=context.createBuffer(2,pcm.left.length,context.sampleRate);buffer.copyToChannel(pcm.left,0);buffer.copyToChannel(pcm.right,1);variant=next.variant;}
  noise=context.createBufferSource();noise.buffer=buffer;noise.loop=true;noise.loopStart=.04;airGain=context.createGain();airGain.gain.value=0;
  filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1600;filter.Q.value=.45;
  noise.connect(filter);filter.connect(airGain);airGain.connect(destination);noise.start(0,.04);
  tone=context.createOscillator();tone.type='triangle';toneGain=context.createGain();toneGain.gain.value=0;tone.connect(toneGain);toneGain.connect(destination);tone.start();
 }
 const target=(param,value,seconds)=>{param.cancelScheduledValues(context.currentTime);param.setTargetAtTime(value,context.currentTime,seconds);};
 return {
  sync(next){
   pose=next;
   if(!next.active){if(noise){target(airGain.gain,0,.002);target(toneGain.gain,0,.002);}return;}
   if(noise&&variant!==next.variant)stop();if(!noise)start(next);pose=next;
   target(airGain.gain,next.level,.035);target(toneGain.gain,next.charge*.068,.035);
   target(tone.frequency,next.pitch,.045);target(filter.frequency,1100+next.charge*2100,.06);
  },
  stop,
  snapshot:()=>({mode:pose?.mode??'stopped',level:pose?.level??0,charge:pose?.charge??0,pitch:pose?.pitch??0,voices:noise?2:0,bufferBytes:buffer?buffer.length*8:0}),
  dispose(){stop();buffer=null;}
 };
}
