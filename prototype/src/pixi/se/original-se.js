import {synthesizeSignature} from './signature-sound.js';
import {SYNTH_TUNING,TAU,synthEnvelope as envelope,synthWave,stereoEcho} from './synth-wave.js';
// Synth-only timbres. Catalog kind denotes the on-screen event role, not
// a natural material sound. No noise, impact, scrape or mallet layer.
const families={
 latch:['spin','stopLeft','stopRight','stopCenter','holdBlue','payout'],
 crystal:['holdGold','moon','story','background','identity','reflection','fullrotation','premiumMoon'],
 seal:['holdRed','serial','step','route','trail','approach','alert','search','resolve','crest','pursuit','chanceTitle','chanceDialogue','chanceResolve','reach','development','pushPrompt','rightGuide'],
 wind:['character','long','special','arrival','dodge','attention','gather','castle'],
 impact:['enemy','pressure','upperSword','counter','clash','surge','rally','vow','final','heroHit','enemyHit','decisiveHit','pushPress','slash','mechanism','premiumSword','open','close'],
 ignition:['awakening','revival','charge','rushStart','rushReset','roundReveal','breakthrough'],
 resolve:['win','rushWin','loss','rushEnd','clear']
};
const overrides={
 decisiveHit:{kind:'blade',duration:1.55,frequency:438,level:.56,priority:3,duckFor:.23},
 heroHit:{kind:'blade',duration:.74,frequency:714,level:.32},
 enemyHit:{kind:'impact',duration:.85,frequency:343,level:.34},
 slash:{kind:'blade',duration:.90,frequency:880,level:.30},
 clash:{kind:'impact',duration:1.1,frequency:640,level:.36},
 pressure:{kind:'impact',duration:1.15,frequency:217,level:.30},
 enemy:{kind:'impact',duration:1.0,frequency:183,level:.27},
 upperSword:{kind:'mechanical',duration:1.30,frequency:527,level:.34},
 mechanism:{kind:'mechanical',duration:1.20,frequency:384,level:.30},
 open:{kind:'mechanical',duration:.55,frequency:418,level:.16,priority:1},
 close:{kind:'mechanical',duration:.47,frequency:283,level:.16,priority:1},
 pushPress:{kind:'impact',duration:.32,frequency:320,level:.27,},
 gather:{kind:'wind',duration:1.35,frequency:536,level:.17,},
 final:{kind:'ignition',duration:1.0,frequency:350,level:.23},
 vow:{kind:'crystal',duration:1.35,frequency:621,level:.24},
 reach:{kind:'seal',duration:1.05,frequency:392,level:.31},
 win:{kind:'victory',duration:2.65,frequency:587.33,level:.54,priority:3,duckFor:.45},
 rushWin:{kind:'victory',duration:2.05,frequency:659.25,level:.51,priority:3,duckFor:.36},
 loss:{kind:'withdraw',duration:.90,frequency:150,level:.13,priority:1},
 rushEnd:{kind:'withdraw',duration:1.45,frequency:130,level:.18,priority:1},
 clear:{kind:'crystal',duration:1.6,frequency:784,level:.25,},
 fullrotation:{kind:'crystal',duration:2.10,frequency:698.46,level:.36,priority:3},
 premiumMoon:{kind:'crystal',duration:1.85,frequency:831,level:.33,priority:3},
 premiumSword:{kind:'blade',duration:1.70,frequency:610,level:.40,priority:3},
 awakening:{kind:'ignition',duration:1.40,frequency:370,level:.30},
 revival:{kind:'ignition',duration:1.50,frequency:463,level:.33},
 rushStart:{kind:'seal',duration:1.45,frequency:740,level:.35},
 breakthrough:{kind:'blade',duration:1.2,frequency:523,level:.38}
};
const defaults={latch:[.21,.13],crystal:[1.30,.25],seal:[.82,.26],wind:[1.05,.18],impact:[.88,.29],ignition:[1.22,.28],resolve:[1.45,.30]};
export const SE_CATALOG=Object.freeze(Object.fromEntries(Object.entries(families).flatMap(([kind,names])=>names.map((name,index)=>{
 const [duration,level]=defaults[kind];
 return [name,Object.freeze({kind,style:'synth-'+kind,index,duration,level,frequency:kind==='latch'?720+index*115:310+(index*83%520),priority:kind==='latch'?1:2,duckFor:.12,...overrides[name]})];
}))));
export const SE_VARIANTS=4;
export function createVariantPicker(){const counts=new Map();return name=>{if(!SE_CATALOG[name])throw new RangeError('Unknown SE: '+name);const n=counts.get(name)??0;counts.set(name,n+1);return [0,2,1,3][n%4];};}
export function synthesizeSe(name,variant=0,sampleRate=44100){
 const s=SE_CATALOG[name];if(!s||!Number.isInteger(variant)||variant<0||variant>3)throw new RangeError('Invalid SE');
 if(s.kind==='victory')return synthesizeSignature({mode:name,variant,sampleRate,duration:s.duration,level:s.level});
 const n=Math.ceil(s.duration*sampleRate),left=new Float32Array(n),right=new Float32Array(n);
 let phase=0;const detune=[1,.994,1.006,.998][variant]*SYNTH_TUNING.effectPitch,bright=[.62,.82,.49,.72][variant];
 const short=s.kind==='latch',rising=['ignition','wind'].includes(s.kind),descending=s.kind==='withdraw',slash=s.kind==='blade';
 const base=short?s.frequency:s.frequency+180,count=short?1:s.kind==='crystal'?3:s.kind==='mechanical'?3:s.kind==='seal'?2:1;
 const phases=new Float64Array(count);
 for(let i=0;i<n;i++){
  const t=i/sampleRate,u=t/s.duration;
  const freq=base*detune*(rising?1+u*1.35:descending?1-.28*u:slash?1+2.2*Math.exp(-t*17):1+.25*Math.exp(-t*25));
  phase+=TAU*freq/sampleRate;let a=0,b=0;
  for(let j=0;j<count;j++){
   const age=t-j*(s.kind==='crystal'?.068:.053+variant*.007);if(age<0)continue;
   const f=freq*(s.kind==='crystal'?[1,1.25,1.5][j]:1+j*.14);phases[j]+=TAU*f/sampleRate;
   const sustain=rising?Math.sin(Math.PI*u)**.8:envelope(age,short?.002:.007,short?.045:s.kind==='crystal'?.36:.20);
   const gain=(short?.29:.24)/(1+j*.28);
   a+=synthWave(phases[j],f,sampleRate,bright)*sustain*gain;
   b+=synthWave(phases[j]*1.004,f*1.004,sampleRate,bright)*sustain*gain;
  }
  if(slash||s.kind==='impact'){
   const shaped=Math.sin(phase+.65*Math.sin(phase*2))*envelope(t,.003,.20);
   a+=shaped*.18;b+=Math.sin(phase*1.003+.65*Math.sin(phase*2.006))*envelope(t,.003,.20)*.18;
  }
  left[i]=a*.85+b*.15;right[i]=a*.20+b*.80;
 }
 stereoEcho(left,right,sampleRate,s.level);return {left,right,duration:s.duration,sampleRate};
}
