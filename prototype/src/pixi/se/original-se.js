// Original PCM synthesis: no samples, network requests or gameplay random state.
// Each cue has its own rhythm, resonances and noise envelope; four arrangements
// alternate grain density, FM ratio, stereo motion and attack spacing.
const groups={
 tick:['spin','stopLeft','stopRight','stopCenter','holdBlue','payout'],
 glass:['holdGold','moon','story','background','identity','reflection','fullrotation','premiumMoon'],
 signal:['holdRed','serial','step','route','trail','approach','alert','search','resolve','crest','pursuit','chanceTitle','chanceDialogue','chanceResolve','reach','development','pushPrompt','rightGuide'],
 air:['character','long','special','arrival','dodge','attention','gather','castle'],
 metal:['enemy','pressure','upperSword','counter','clash','surge','rally','vow','final','heroHit','enemyHit','decisiveHit','pushPress','slash','mechanism','premiumSword','open','close'],
 rise:['awakening','revival','charge','rushStart','rushReset','roundReveal','breakthrough'],
 result:['win','rushWin','loss','rushEnd','clear'],
};
export const SE_CATALOG=Object.freeze(Object.fromEntries(Object.entries(groups).flatMap(([style,names])=>names.map((name,index)=>[name,Object.freeze({style,index,duration:style==='tick'?.12:style==='result'?(name==='loss'?.48:1.35):style==='rise'?1.05:style==='air'?.65:.42+index%3*.14,level:style==='tick'?.10:style==='result'?.42:.27})]))));
export const SE_VARIANTS=4;
export function createVariantPicker(){
 const counts=new Map();
 return name=>{if(!SE_CATALOG[name])throw new RangeError('Unknown SE: '+name);const n=counts.get(name)??0;counts.set(name,n+1);return [0,2,1,3][n%SE_VARIANTS];};
}
export function synthesizeSe(name,variant=0,sampleRate=44100){
 const spec=SE_CATALOG[name];if(!spec||!Number.isInteger(variant)||variant<0||variant>=SE_VARIANTS)throw new RangeError('Invalid SE');
 const {style,index,duration}=spec,length=Math.ceil(duration*sampleRate),left=new Float32Array(length),right=new Float32Array(length);
 let seed=2166136261;for(const c of name)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;seed^=variant*7919;
 let smooth=0,phase=0;const base=120+(index*137%820),ratio=[2.013,3.17,1.414,2.71][variant],spacing=[.061,.093,.047,.077][variant];
 for(let i=0;i<length;i++){
  const t=i/sampleRate,u=t/duration;seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const white=seed/2147483648-1;smooth+=.12*(white-smooth);const hiss=white-smooth;
  const attack=Math.min(1,t/.004),release=Math.min(1,(duration-t)/.045);
  const gate=.3+.7*(Math.sin(2*Math.PI*(11+variant*7+index%5)*t)>0?1:0);
  const pulse=Math.exp(-((t+index*.003)%spacing)*48);
  const falling=name==='loss'||name==='rushEnd';
  const freq=style==='rise'?base*(1+3*u):falling?base*(1-.65*u):base*(1+.6*Math.exp(-t*22));
  phase+=2*Math.PI*freq/sampleRate;
  const fm=Math.sin(phase+Math.sin(phase*ratio)*(2.2+variant*.6)*(1-u));
  let value;
  if(style==='tick')value=(fm*.33+hiss*.55)*Math.exp(-t*38);
  if(style==='glass')value=(Math.sin(phase)+.4*Math.sin(phase*ratio))*.22*Math.exp(-t*3)+hiss*.16*pulse*(1-u);
  if(style==='signal')value=(fm*.32*gate+hiss*.34*pulse)*Math.exp(-t*4);
  if(style==='air')value=(smooth*1.3+hiss*.22*gate+fm*.07)*Math.sin(Math.PI*u)**1.4;
  if(style==='metal')value=(fm*.30*Math.exp(-t*7)+hiss*.48*Math.exp(-t*19)+Math.sin(phase*.23)*.18*Math.exp(-t*10));
  if(style==='rise')value=(fm*.23*gate+hiss*.28*(1-u)+smooth*.5)*Math.sin(Math.PI*u)**.7;
  if(style==='result'){
   const chord=falling?[1,1.189,1.414]:[1,1.25,1.5,2];
   value=chord.reduce((s,f,j)=>s+Math.sin(phase*f+Math.sin(phase*ratio)*.25)*.13*Math.exp(-t*(1.8+j*.4)),0)+hiss*.36*Math.exp(-t*27)+fm*.14*gate*Math.exp(-t*7);
  }
  const pan=Math.sin(t*(5+variant*2)+index)*.18;
  left[i]=Math.tanh(value*1.5)*attack*release*(1-pan)*spec.level;
  right[i]=Math.tanh((value+hiss*.035*Math.sin(t*37))*1.5)*attack*release*(1+pan)*spec.level;
 }
 return {left,right,duration,sampleRate};
}
