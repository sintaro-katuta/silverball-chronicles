import {SYNTH_TUNING,TAU,synthEnvelope as env,synthWave,stereoEcho} from './synth-wave.js';
// Recognition rhythm retained, timbre now synth-only per the latest request.
export const MOON_SIGNATURE=Object.freeze({clutchAt:0,ratchetAt:Object.freeze([.074,.124,.168,.204,.233]),releaseAt:.312,tailAt:Object.freeze([.48,.67,.93]),reservedFor:Object.freeze(['win','rushWin'])});
export function synthesizeSignature({mode='win',variant=0,sampleRate=44100,duration=2.65,level=.54}={}){
 if(!['win','rushWin'].includes(mode)||!Number.isInteger(variant)||variant<0||variant>3)throw new RangeError('Invalid signature');
 const n=Math.ceil(sampleRate*duration),left=new Float32Array(n),right=new Float32Array(n),ratchetPhases=new Float64Array(5);
 let clutchPhase=0,releasePhase=0;const colour=[.62,.82,.49,.72][variant],detune=[1,.997,1.005,.993][variant]*SYNTH_TUNING.signaturePitch;
 for(let i=0;i<n;i++){
  const t=i/sampleRate,clutchFreq=(620+1510*(1-Math.exp(-t/.011))*Math.exp(-t/.058))*detune;
  clutchPhase+=TAU*clutchFreq/sampleRate;
  let centre=synthWave(clutchPhase,clutchFreq,sampleRate,colour)*env(t,.002,.052)*.25;
  let spread=0;
  for(const [j,at] of MOON_SIGNATURE.ratchetAt.entries()){
   const age=t-at;if(age<0||age>.10)continue;
   const f=(510+j*168)*(1+1.45*(1-Math.exp(-age/.007)))*detune;
   ratchetPhases[j]+=TAU*f/sampleRate;
   const p=ratchetPhases[j],fm=Math.sin(p+.82*Math.sin(p*2));
   centre+=(synthWave(p,f,sampleRate,colour)*.68+fm*.32)*env(age,.0016,.031)*(.20+j*.013);
  }
  const age=t-MOON_SIGNATURE.releaseAt;
  if(age>=0){
   const lift=(1-Math.exp(-age/.018))*Math.exp(-age/.21),f=(840+2080*lift)*detune;releasePhase+=TAU*f/sampleRate;
   const envelope=env(age,.007,.42);
   // A bright bent unison lead. No kick, scrape, distorted grain or steel ring.
   centre+=synthWave(releasePhase,f,sampleRate,colour)*envelope*.30;
   spread+=synthWave(releasePhase*1.004,f*1.004,sampleRate,colour)*envelope*.19;
  }
  for(const [j,at] of MOON_SIGNATURE.tailAt.entries()){
   const a=t-(mode==='rushWin'?at*.83:at);if(a<0)continue;
   // Restore the previous bright pitches, with a held synth envelope rather
   // than a mallet strike. Variation changes harmonic colour and stereo detune.
   const f=[1174.66,1567.98,2349.32][j]*detune;
   const hold=Math.min(1,a/.016)*Math.exp(-Math.max(0,a-.085)/(.39+j*.05));
   const p=TAU*f*a,vibrato=.055*Math.sin(TAU*(5+variant*.3)*a);
   centre+=synthWave(p+vibrato,f,sampleRate,colour)*hold*.11;
   spread+=synthWave(p*1.003-vibrato,f*1.003,sampleRate,colour)*hold*.085;
  }
  left[i]=centre+spread*.65;right[i]=centre*.83+spread;
 }
 stereoEcho(left,right,sampleRate,level);return {left,right,sampleRate,duration};
}
