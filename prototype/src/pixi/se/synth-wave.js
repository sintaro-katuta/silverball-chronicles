export const TAU=2*Math.PI;
export const synthEnvelope=(t,attack,decay)=>t<0?0:(1-Math.exp(-t/attack))*Math.exp(-t/decay);
// Periodic oscillator harmonics only. No noise, recorded grain, metal modes or
// low-frequency percussion. Omit harmonics beyond the rendering Nyquist band.
export function synthWave(phase,frequency,sampleRate,brightness=.6){
 let value=Math.sin(phase)*.72;
 for(let j=2;j<=5;j++)if(frequency*j<sampleRate*.44)value+=Math.sin(phase*j)*brightness*.38/j;
 return value;
}
export function stereoEcho(left,right,sampleRate,level){
 const a=left.slice(),b=right.slice(),taps=[[.071,.12],[.143,.075],[.229,.043]];let peak=0;
 for(let i=0;i<left.length;i++){
  for(const [delay,gain] of taps){const j=i-Math.round(delay*sampleRate);if(j>=0){left[i]+=b[j]*gain;right[i]+=a[j]*gain;}}
  const fade=Math.min(1,i/(sampleRate*.0008),(left.length-i)/(sampleRate*.10));left[i]*=fade;right[i]*=fade;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
 }
 const scale=level/Math.max(peak,.001);for(let i=0;i<left.length;i++){left[i]*=scale;right[i]*=scale;}
}
