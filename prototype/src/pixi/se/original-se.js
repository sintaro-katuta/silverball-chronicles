// Authored material models, original synthesis only. No borrowed samples.
// Percussion uses independent body, inharmonic metal, friction and room layers.
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
 decisiveHit:{kind:'blade',duration:1.55,frequency:438,body:.66,metal:.48,air:.37,level:.56,room:.31,priority:3,duckFor:.23},
 heroHit:{kind:'blade',duration:.74,frequency:714,body:.27,metal:.40,air:.33,level:.32},
 enemyHit:{kind:'impact',duration:.85,frequency:343,body:.50,metal:.24,air:.24,level:.34},
 slash:{kind:'blade',duration:.90,frequency:880,body:.13,metal:.23,air:.56,level:.30},
 clash:{kind:'impact',duration:1.1,frequency:640,body:.36,metal:.55,air:.30,level:.36},
 pressure:{kind:'impact',duration:1.15,frequency:217,body:.57,metal:.19,air:.18,level:.30},
 enemy:{kind:'impact',duration:1.0,frequency:183,body:.49,metal:.16,air:.26,level:.27},
 upperSword:{kind:'mechanical',duration:1.30,frequency:527,body:.30,metal:.38,air:.14,level:.34},
 mechanism:{kind:'mechanical',duration:1.20,frequency:384,body:.35,metal:.27,air:.16,level:.30},
 open:{kind:'mechanical',duration:.55,frequency:418,body:.16,metal:.19,air:.10,level:.16,room:.08,priority:1},
 close:{kind:'mechanical',duration:.47,frequency:283,body:.22,metal:.15,air:.10,level:.16,room:.08,priority:1},
 pushPress:{kind:'impact',duration:.32,frequency:320,body:.35,metal:.13,air:.15,level:.27,room:.03},
 gather:{kind:'wind',duration:1.35,frequency:536,body:0,metal:.13,air:.28,level:.17,room:.23},
 final:{kind:'ignition',duration:1.0,frequency:350,body:.13,metal:.18,air:.28,level:.23},
 vow:{kind:'crystal',duration:1.35,frequency:621,body:.07,metal:.34,air:.09,level:.24},
 reach:{kind:'seal',duration:1.05,frequency:392,body:.29,metal:.28,air:.17,level:.31},
 win:{kind:'victory',duration:2.65,frequency:587.33,body:.48,metal:.44,air:.24,level:.54,room:.35,priority:3,duckFor:.45},
 rushWin:{kind:'victory',duration:2.05,frequency:659.25,body:.41,metal:.43,air:.30,level:.51,room:.27,priority:3,duckFor:.36},
 loss:{kind:'withdraw',duration:.90,frequency:150,body:.16,metal:.06,air:.22,level:.13,room:.12,priority:1},
 rushEnd:{kind:'withdraw',duration:1.45,frequency:130,body:.17,metal:.11,air:.24,level:.18,room:.18,priority:1},
 clear:{kind:'crystal',duration:1.6,frequency:784,body:.10,metal:.35,air:.12,level:.25,room:.25},
 fullrotation:{kind:'crystal',duration:2.10,frequency:698.46,body:.12,metal:.48,air:.13,level:.36,room:.32,priority:3},
 premiumMoon:{kind:'crystal',duration:1.85,frequency:831,body:.10,metal:.45,air:.12,level:.33,room:.30,priority:3},
 premiumSword:{kind:'blade',duration:1.70,frequency:610,body:.43,metal:.50,air:.24,level:.40,room:.29,priority:3},
 awakening:{kind:'ignition',duration:1.40,frequency:370,body:.22,metal:.28,air:.33,level:.30},
 revival:{kind:'ignition',duration:1.50,frequency:463,body:.25,metal:.33,air:.26,level:.33},
 rushStart:{kind:'seal',duration:1.45,frequency:740,body:.25,metal:.38,air:.22,level:.35},
 breakthrough:{kind:'blade',duration:1.2,frequency:523,body:.42,metal:.36,air:.31,level:.38}
};
const defaults={latch:[.21,.035,.17,.13,.13],crystal:[1.30,.08,.40,.10,.25],seal:[.82,.20,.28,.17,.26],wind:[1.05,0,.09,.34,.18],impact:[.88,.34,.33,.22,.29],ignition:[1.22,.18,.25,.29,.28],resolve:[1.45,.20,.32,.20,.30]};
export const SE_CATALOG=Object.freeze(Object.fromEntries(Object.entries(families).flatMap(([kind,names])=>names.map((name,index)=>{
 const [duration,body,metal,air,level]=defaults[kind];
 return [name,Object.freeze({kind,style:kind,index,duration,body,metal,air,level,frequency:kind==='latch'?720+index*115:310+(index*83%520),room:kind==='latch'?.045:.20,width:kind==='wind'?.8:.36,priority:kind==='latch'?1:2,duckFor:.12,...overrides[name]})];
}))));
export const SE_VARIANTS=4;
export function createVariantPicker(){const counts=new Map();return name=>{if(!SE_CATALOG[name])throw new RangeError('Unknown SE: '+name);const n=counts.get(name)??0;counts.set(name,n+1);return [0,2,1,3][n%4];};}
const TAU=Math.PI*2;
const envelope=(t,attack,decay)=>t<0?0:(1-Math.exp(-t/attack))*Math.exp(-t/decay);
// Decays and amplitudes differ per mode: a struck blade is not an FM siren.
const modes=[1,1.571,2.193,3.107,4.731,6.817];
export function synthesizeSe(name,variant=0,sampleRate=44100){
 const s=SE_CATALOG[name];if(!s||!Number.isInteger(variant)||variant<0||variant>3)throw new RangeError('Invalid SE');
 const n=Math.ceil(s.duration*sampleRate),dryL=new Float32Array(n),dryR=new Float32Array(n);
 let seed=2166136261;for(const c of name)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;seed^=variant*7919;
 let low=0,mid=0,slow=0;const detune=[.993,1.004,1.013,.986][variant],f=s.frequency*detune;
 const bodyFrequency=[72,84,63,91][variant],contact=[0,.004,.009,.002][variant],vel=[1,.94,1.06,.97][variant];
 const metal=(t,scale=1)=>{let value=0;for(let j=0;j<modes.length;j++){
  const freq=f*modes[j]*(1+(j%2?1:-1)*variant*.0012),decay=(.43+variant*.035)/(1+j*.31);
  value+=Math.sin(TAU*freq*t+.015*Math.sin(TAU*(7+j)*t))*envelope(t,.0016,decay)*(1/(1+j*.85));
 }return value*.28*scale;};
 const body=t=>t<0?0:(Math.sin(TAU*(bodyFrequency*t+1.8*(1-Math.exp(-t*35))))*.61+Math.sin(TAU*(bodyFrequency*2.03*t+1.1*(1-Math.exp(-t*25))))*.29+Math.sin(TAU*bodyFrequency*3.91*t)*.10)*envelope(t,.0012,.16);
 for(let i=0;i<n;i++){
  const t=i/sampleRate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/2147483648-1;
  low+=.045*(white-low);mid+=.24*(white-mid);slow+=.009*(white-slow);const grain=mid-low,edge=white-mid;
  let centre=0,side=0;const u=t/s.duration;
  if(['impact','blade','mechanical','latch'].includes(s.kind)){
   const cut=s.kind==='blade',latched=s.kind==='latch';
   const contactAge=t-contact;
   const friction=cut?envelope(t,.006,.115)*(grain*.9+edge*.24):envelope(t,.0007,latched?.009:.022)*(grain*.7+edge*.21);
   centre=s.body*body(contactAge)+s.metal*metal(contactAge,latched?.5:1)+s.air*friction;
   if(s.kind==='mechanical'){for(const at of [.035,.083,.145])centre+=s.body*.24*body(t-at)+s.metal*.20*metal(t-at);}
   if(cut)centre+=s.metal*.24*metal(t-.024)+s.air*.20*grain*envelope(t-.031,.008,.23);
   side=s.metal*.10*metal(t-.009)*(variant%2?1:-1);
  }else if(s.kind==='crystal'){
   const intervals=[1,1.498,2.003,2.509],spacing=[.052,.073,.041,.064][variant];
   for(let j=0;j<4;j++){const age=t-j*spacing;if(age<0)continue;
    const strike=(Math.sin(TAU*f*intervals[j]*age)+.25*Math.sin(TAU*f*intervals[j]*2.756*age))*envelope(age,.0025,.45-j*.045);
    centre+=s.metal*strike*.22;side+=strike*s.metal*.075*(j%2?1:-1);
   }centre+=s.body*body(t)*.45+s.air*edge*envelope(t,.003,.045);
  }else if(s.kind==='seal'){
   const beats=name==='step'?[0,.15,.32]:name==='serial'?[0,.22,.37]:[0,.055+variant*.015];
   for(const at of beats){const age=t-at;if(age<0)continue;
    centre+=s.body*.5*body(age)+s.metal*.75*metal(age)+s.air*grain*envelope(age,.003,.11);
   }centre+=Math.sin(TAU*f*.5*t)*envelope(t,.015,.17)*s.metal*.13;
  }else if(s.kind==='wind'||s.kind==='withdraw'){
   const exhale=s.kind==='withdraw',shape=exhale?envelope(t,.023,.25):Math.sin(Math.PI*u)**1.7;
   centre=(grain*.86+slow*.64)*s.air*shape+s.metal*metal(t)*.21+s.body*body(t)*.4;
   side=(low-slow)*s.air*.20*shape;
  }else if(s.kind==='ignition'){
   const growth=Math.sin(Math.PI*u)**1.2,release=Math.max(0,t-s.duration*.66);
   // Friction densifies into a material snap, without a four-octave beep.
   centre=s.air*(grain*.8+edge*.13)*( .45+.55*u)*growth;
   for(let j=0;j<4;j++)centre+=Math.sin(TAU*f*modes[j]*t+.10*Math.sin(TAU*(9+j)*t))*s.metal*.045*growth*(.25+.75*u);
   if(release>0)centre+=s.body*body(release)*.5+s.metal*metal(release)*.4;
   side=grain*s.air*.15*Math.sin(TAU*(.7+variant*.1)*t)*growth;
  }else if(s.kind==='victory'){
   centre=s.body*body(t)+s.air*edge*envelope(t,.001,.026)+s.metal*metal(t)*.62;
   const notes=name==='rushWin'?[1,1.5,2,2.5]:[1,1.25,1.5,2];
   for(let j=0;j<notes.length;j++){
    const age=t-(.095+j*(name==='rushWin'?.064:.092));if(age<0)continue;
    const bell=(Math.sin(TAU*f*notes[j]*age)+.18*Math.sin(TAU*f*notes[j]*2.017*age)+.06*Math.sin(TAU*f*notes[j]*3.12*age))*envelope(age,.012,.62-j*.045);
    centre+=bell*.095;side+=bell*.030*(j%2?1:-1);
   }
   // A distinct second reveal brightens and widens the tail, after the impact.
   const age=t-.45;if(age>0)for(let j=0;j<3;j++)centre+=Math.sin(TAU*f*[2,2.5,3][j]*age)*envelope(age,.045,.5)*.026;
  }
  const attack=Math.min(1,t/.0008),end=Math.min(1,(s.duration-t)/.10);
  dryL[i]=Math.tanh((centre-side*s.width)*1.16)*attack*end*vel;
  dryR[i]=Math.tanh((centre+side*s.width)*1.16)*attack*end*vel;
 }
 // Damped, asymmetrical early reflections and a diffuse tail. Generated per
 // sound, so the entire tail is stopped by pause/mute, and silence stays clean.
 const left=new Float32Array(n),right=new Float32Array(n);
 const taps=[[.027,.24],[.043,.20],[.071,.17],[.113,.14],[.167,.11],[.229,.09],[.317,.065],[.431,.043],[.563,.027]];
 let dampL=0,dampR=0,peak=0;
 for(let i=0;i<n;i++){
  let roomL=0,roomR=0;
  for(let j=0;j<taps.length;j++){const [delay,gain]=taps[j],a=i-Math.round((delay+variant*.0011)*sampleRate),b=i-Math.round((delay+.006+j*.0013)*sampleRate);if(a>=0)roomL+=dryR[a]*gain;if(b>=0)roomR+=dryL[b]*gain;}
  dampL+=.23*(roomL-dampL);dampR+=.23*(roomR-dampR);
  const end=Math.min(1,(n-i)/(sampleRate*.10));left[i]=(dryL[i]+dampL*s.room)*end;right[i]=(dryR[i]+dampR*s.room)*end;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
 }
 const scale=s.level/Math.max(peak,.25);for(let i=0;i<n;i++){left[i]*=scale;right[i]*=scale;}
 return {left,right,duration:s.duration,sampleRate};
}
