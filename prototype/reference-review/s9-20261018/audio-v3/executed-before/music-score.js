import {buffer,tone,finish,noteHz} from './s9-synth.js';
// Original score: D minor / Dorian colour. New music, not a reused SE melody.
export const MUSIC_CATALOG=Object.freeze({
 normal:Object.freeze({title:'月下の歩み',bpm:80,bars:8,duration:24,loopStart:0,loopEnd:24,level:.15}),
 battle:Object.freeze({title:'一閃への決意',bpm:120,bars:27,duration:54,loopStart:0,loopEnd:54,level:.18}),
 bonus:Object.freeze({title:'暁の祝祭',bpm:120,bars:8,duration:16,loopStart:0,loopEnd:16,level:.18}),
 rush:Object.freeze({title:'月影疾走',bpm:144,bars:8,duration:40/3,loopStart:0,loopEnd:40/3,level:.19})
});
const harmony={minor:[[50,57,60,64],[46,53,57,60],[48,55,58,62],[45,52,57,61]],bright:[[50,57,62,66],[55,59,62,66],[47,54,59,62],[45,52,57,61]]};
const motif=[[0,74,1],[1.5,77,.5],[2,76,1],[3,69,.75],[4,72,1.5],[6,74,1],[7,69,.7]];
const battleMelody=[[0,62,.75],[1,69,.5],[2,65,.75],[3.5,67,.4],[4,69,1.4],[6,72,.7],[7,69,.7]];
const rushMelody=[[0,74,.45],[.5,77,.45],[1,81,.8],[2,79,.45],[2.5,77,.45],[3,76,.8],[4,74,.8],[5,72,.8],[6,69,1.6]];
export function musicScore(name){
 const spec=MUSIC_CATALOG[name];if(!spec)throw new RangeError('Unknown music '+name);const beat=60/spec.bpm,bar=beat*4,events=[],add=(at,seconds,midi,gain,part,pan=0)=>events.push({at,seconds,hz:noteHz(midi),gain,part,pan});
 const chords=name==='bonus'?harmony.bright:harmony.minor;
 for(let b=0;b<spec.bars;b++){
  const at=b*bar,ch=chords[b%4],build=name==='battle'?b<8?.55:b<16?.72:b<23?.9:1:1;
  for(let j=0;j<ch.length;j++)add(at,bar+.36,ch[j]+12,.024*build,'pad',[-.55,.3,-.25,.55][j]);
  if(name==='normal'){
   add(at,beat*1.8,ch[0]-12,.10,'bass');add(at+beat*2.5,beat*.8,ch[0]-12,.065,'bass');
   for(const k of [0,2])add(at+k*beat,.10,42,.033,'kick');
   for(let k=0;k<4;k++)add(at+(k+.5)*beat,.06,90,.017,'tick',k%2?.3:-.3);
   if(b%2===0)for(const[t,m,d]of motif)add(at+t*beat,d*beat,m+(b>=4?-12:0),.071,'lead',.12);
   for(const k of [0,1.5,2.5,3.5])add(at+k*beat,.24,ch[(Math.round(k*2)+b)%4]+12,.038,'pluck',-.25);
  }else{
   const active=name!=='battle'||at<49.65; // result-independent music; runtime owns exact silence/result clocks.
   if(active){for(let k=0;k<4;k++)add(at+k*beat,beat*.65,ch[0]-12,.11*build,'bass');for(const k of [0,2])add(at+k*beat,.17,45,.075*build,'kick');for(const k of [1,3])add(at+k*beat,.12,69,.052*build,'tick');for(let k=0;k<8;k++)add(at+k*beat/2,.05,94,.018*build,'tick',k%2?.4:-.4);}
   const fast=name==='rush',arpSteps=fast?16:8;
   if(active)for(let k=0;k<arpSteps;k++)add(at+k*bar/arpSteps,bar/arpSteps*.7,ch[k%4]+(k%8>=4?24:12),.032*build,'pluck',k%2?.4:-.4);
   if(b%2===0&&active){const phrase=fast?rushMelody:name==='bonus'?motif:battleMelody;for(const[t,m,d]of phrase)if(at+t*beat<spec.duration-.08)add(at+t*beat,Math.min(d*beat,spec.duration-at-t*beat),m+(name==='battle'&&b>=16?12:0),.078*build,'lead',.08);}
  }
 }
 return {version:'s9-score-v1',name,...spec,key:name==='bonus'?'D major / B minor':'D minor with A-major dominant',events};
}
export function synthesizeMusic(name,sampleRate=44100){
 const score=musicScore(name),pcm=buffer(score.duration,sampleRate),loop=name!=='battle';
 for(const e of score.events){const part=e.part;tone(pcm,{...e,shape:part==='kick'?'kick':part==='tick'?'tick':'tone',endHz:part==='kick'?48:e.hz,attack:part==='pad'?.16:part==='lead'?.018:.003,release:part==='pad'?.35:part==='lead'?.12:.04,decay:part==='pad'?.15:part==='bass'?1.1:part==='lead'?.4:3,bright:part==='lead'?.35:part==='pad'?.12:.22,vibrato:part==='lead'?.0013:0,wrap:loop});}
 finish(pcm,.30,{loop});return {...pcm,loopStart:0,loopEnd:score.duration};
}
