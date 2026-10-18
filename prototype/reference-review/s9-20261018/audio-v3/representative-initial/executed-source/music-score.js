import {buffer,finish,noteHz,vividTone,rhythmHit} from './s9-synth.js';
// V3 original high-energy score. Timings describe music, not the outcome clock.
export const MUSIC_CATALOG=Object.freeze({
 normal:Object.freeze({title:'月下疾走',bpm:160,bars:16,duration:24,loopStart:0,loopEnd:24,level:.15}),
 battle:Object.freeze({title:'一閃の鼓動',bpm:160,bars:36,duration:54,loopStart:0,loopEnd:54,level:.18}),
 bonus:Object.freeze({title:'暁の凱歌',bpm:180,bars:12,duration:16,loopStart:0,loopEnd:16,level:.18}),
 rush:Object.freeze({title:'月影オーバードライブ',bpm:192,bars:10,duration:12.5,loopStart:0,loopEnd:12.5,level:.19})
});
const harmony={minor:[[50,57,60,65],[46,53,57,62],[48,55,58,64],[45,52,57,61]],bright:[[50,57,62,66],[55,59,62,67],[47,54,59,66],[45,52,57,64]]};
const phrases={
 normal:[[0,74,.45],[.5,77,.45],[1,81,.7],[2,79,.45],[2.5,77,.4],[3,76,.6],[4,74,.45],[4.5,72,.45],[5,69,.7],[6,72,.45],[6.5,76,.45],[7,77,.42],[7.5,81,.42]],
 battle:[[0,62,.35],[.5,69,.35],[1,74,.7],[2,72,.4],[2.5,69,.4],[3,65,.7],[4,67,.4],[4.5,69,.4],[5,72,.7],[6,74,.4],[6.5,77,.4],[7,76,.4],[7.5,73,.4]],
 bonus:[[0,74,.4],[.5,78,.4],[1,81,.8],[2,83,.4],[2.5,81,.4],[3,78,.7],[4,79,.4],[4.5,83,.4],[5,86,.7],[6,85,.4],[6.5,81,.4],[7,78,.8]],
 rush:[[0,74,.22],[.25,77,.22],[.5,81,.4],[1,86,.7],[2,84,.4],[2.5,81,.4],[3,79,.4],[3.5,77,.4],[4,76,.4],[4.5,79,.4],[5,81,.7],[6,77,.4],[6.5,76,.4],[7,73,.4],[7.5,81,.4]]
};
export function musicScore(name){
 const spec=MUSIC_CATALOG[name];if(!spec)throw new RangeError('Unknown music '+name);
 const beat=60/spec.bpm,bar=beat*4,events=[],chords=name==='bonus'?harmony.bright:harmony.minor;
 const note=(at,d,m,g,part,pan=0)=>events.push({at,seconds:d,hz:noteHz(m),gain:g,part,pan});
 const drum=(at,d,g,part,pan,seed)=>events.push({at,seconds:d,gain:g,part,pan,seed});
 for(let b=0;b<spec.bars;b++){
  const at=b*bar,ch=chords[b%4],section=Math.floor(b/4),build=name==='battle'?(b<8?.8:b<16?.9:1):1;
  // Four-on-floor kick, snare backbeat, offbeat hat, and small phrase fills.
  for(let k=0;k<4;k++)drum(at+k*beat,.16,.18*build,'kick',0,b*31+k+7);
  for(const k of [1,3])drum(at+k*beat,.14,.13*build,'snare',0,b*31+k+71);
  for(let k=0;k<8;k++)drum(at+k*beat/2,k%2?.10:.045,(k%2?.055:.025)*build,k%2?'openHat':'hat',k%2?.25:-.25,b*53+k+101);
  if(b%4===3)for(const k of [3,3.25,3.5,3.75])drum(at+k*beat,.065,.065,'snare',0,b*97+Math.round(k*4));
  // Short bass notes with offbeat octave answers; no sustained background pad.
  for(let k=0;k<8;k++)note(at+k*beat/2,beat*.32,ch[0]-12+(k%4===3?12:0),.105*build,'bass');
  // Chord stabs and alternating sixteenth-note arpeggio give an audible grid.
  for(const k of [.5,1.5,2.5,3.5])for(let j=1;j<4;j++)note(at+k*beat,beat*.23,ch[j]+12,.034*build,'stab',j%2?.3:-.3);
  for(let k=0;k<16;k++)note(at+k*beat/4,beat*.16,ch[(k+b)%4]+(k%8>=4?24:12),.029*build,'arp',k%2?.42:-.42);
  if(b%2===0)for(const[t,m,d]of phrases[name]){
   const transpose=name==='battle'&&section>=4?12:0;
   note(at+t*beat,d*beat,m+transpose,.10*build,'lead',.05);
   if(name==='bonus'||(name==='rush'&&section%2))note(at+t*beat,d*beat,m-12,.024,'lead',-.14);
  }
 }
 // Runtime alone owns 16.2/49.65/etc silence and the result boundary.
 return {version:'s9-score-v3',name,...spec,key:name==='bonus'?'D major / B minor':'D minor',arrangement:'four-on-floor + backbeat + offbeat hats / gated bass / stabs / 16th arpeggio / original lead',outcomeIndependent:true,events};
}
export function synthesizeMusic(name,sampleRate=44100){
 const score=musicScore(name),pcm=buffer(score.duration,sampleRate);
 for(const e of score.events){
  if(['kick','snare','hat','openHat'].includes(e.part))rhythmHit(pcm,{...e,voice:e.part,wrap:true});
  else vividTone(pcm,{...e,voice:e.part==='bass'?'bass':e.part==='arp'?'pluck':'lead',attack:.0015,release:e.part==='lead'?.025:.012,decay:e.part==='lead'?.65:1.6,wrap:true});
 }
 finish(pcm,.34,{loop:true,echo:false});return {...pcm,loopStart:0,loopEnd:score.duration};
}
