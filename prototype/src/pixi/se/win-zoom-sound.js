import {WIN_ZOOM} from '../review-reel-state.js';

// Original short metallic confirmation chord, sharing the zoom hold's clock.
export function createWinZoomSound(){
 let ctx,bus,buffer,source,recording,played=false;
 function stop(){if(source){source.stop();source.disconnect();source=null;}}
 function unlock(){
  if(!ctx){
   ctx=new AudioContext();bus=ctx.createGain();bus.gain.value=.55;bus.connect(ctx.destination);
   buffer=ctx.createBuffer(1,Math.round(ctx.sampleRate*.5),ctx.sampleRate);
   const data=buffer.getChannelData(0);
   for(let i=0;i<data.length;i++){
    const t=i/ctx.sampleRate,attack=Math.min(1,t/.004),release=Math.min(1,(.5-t)/.06);
    const chime=[523.25,659.25,783.99,1046.5].reduce((v,f,j)=>v+Math.sin(2*Math.PI*f*t)*Math.exp(-t*(3+j))*.11,0);
    const impact=Math.sin(2*Math.PI*(150*t+24*(1-Math.exp(-t*25))/25))*Math.exp(-t*28)*.24;
    data[i]=(chime+impact)*attack*release;
   }
  }
  return ctx.resume();
 }
 return {
  unlock,
  reset(){stop();played=false;},
  sync(t,paused){
   if(paused){stop();return;}
   if(t<WIN_ZOOM.holdStart)return;
   if(t>=WIN_ZOOM.holdStart+.5){stop();played=true;return;}
   if(source||played||!ctx||ctx.state!=='running')return;
   source=ctx.createBufferSource();source.buffer=buffer;source.connect(bus);
   source.start(0,t-WIN_ZOOM.holdStart);
  },
  captureStream(){if(!ctx)return null;if(!recording){recording=ctx.createMediaStreamDestination();bus.connect(recording);}return recording.stream;},
  dispose(){stop();if(ctx)void ctx.close();}
 };
}
