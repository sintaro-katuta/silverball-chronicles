// 月輪パルス: a fixed recognition rhythm with four different sound arrangements.
// All source grains are original. Reverse, resample, ring-modulate and saturate
// those grains; no audio from the reference article is sampled or copied.
export const MOON_SIGNATURE=Object.freeze({
 clutchAt:0,ratchetAt:Object.freeze([.074,.124,.168,.204,.233]),releaseAt:.312,
 tailAt:Object.freeze([.48,.67,.93]),reservedFor:Object.freeze(['win','rushWin'])
});
const TAU=2*Math.PI;
const env=(t,a,d)=>t<0?0:(1-Math.exp(-t/a))*Math.exp(-t/d);
const interpolate=(a,index)=>{if(index<0||index>=a.length-1)return 0;const i=Math.floor(index),u=index-i;return a[i]*(1-u)+a[i+1]*u;};
export function synthesizeSignature({mode='win',variant=0,sampleRate=44100,duration=2.65,level=.54}={}){
 if(!['win','rushWin'].includes(mode)||!Number.isInteger(variant)||variant<0||variant>3)throw new RangeError('Invalid signature');
 const n=Math.ceil(sampleRate*duration),left=new Float32Array(n),right=new Float32Array(n),grain=new Float32Array(Math.ceil(sampleRate*.125));
 let seed=85271+variant*4129,low=0;
 for(let i=0;i<grain.length;i++){
  const t=i/sampleRate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=.14*(noise-low);
  const material=Math.sin(TAU*613*t)+.53*Math.sin(TAU*1433*t)+.26*Math.sin(TAU*2771*t);
  grain[i]=Math.tanh((material*.32+(noise-low)*.16)*3.4)*env(t,.0007,.032);
 }
 // Accent positions stay identifiable; variation changes grain direction,
 // modulation, spatial reflection and the cutting metal answer after the impact.
 let clutchPhase=0,releasePhase=0,punchLow=0,punchMid=0;
 const ratios=[1,1.17,.91,1.29],carrier=[977,1163,887,1327][variant];
 for(let i=0;i<n;i++){
  const t=i/sampleRate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/2147483648-1;
  const clutchFreq=310+1340*(1-Math.exp(-t/.012))*Math.exp(-t/.054);
  clutchPhase+=TAU*clutchFreq/sampleRate;
  const clutch=Math.tanh((Math.sin(clutchPhase+2.6*Math.sin(clutchPhase*1.87))+.18*white)*2.9)*env(t,.001,.038)*.18;
  let ratchet=0;
  for(const [j,at] of MOON_SIGNATURE.ratchetAt.entries()){
   const age=t-at;if(age<0||age>.078)continue;
   const rate=ratios[variant]*(1+j*.13),progress=age*sampleRate*rate;
   const sample=interpolate(grain,variant%2&&j%2?grain.length-1-progress:progress);
   const ring=Math.sin(TAU*(carrier+j*113)*age);
   const gated=age<.052?1:Math.max(0,1-(age-.052)/.026);
   ratchet+=Math.tanh((sample*.75+sample*ring*.80)*3.1)*gated*(.11+j*.018);
  }
  const age=t-MOON_SIGNATURE.releaseAt;
  let blast=0,answerL=0,answerR=0;
  if(age>=0){
   // The first three stages rise, bite and settle; they do not share a single
   // linear whistle. Mid harmonics keep the impact legible on small speakers.
   const lift=(1-Math.exp(-age/.014))*Math.exp(-age/.14);
   releasePhase+=TAU*(780+2490*lift+170*Math.sin(age*13)*Math.exp(-age*6))/sampleRate;
   punchLow+=TAU*(48+89*Math.exp(-age*24))/sampleRate;
   punchMid+=TAU*(153+105*Math.exp(-age*31))/sampleRate;
   const rasp=Math.sin(releasePhase+Math.sin(releasePhase*(1.83+variant*.037))*2.7*Math.exp(-age*2.2));
   const drive=Math.tanh((rasp*.54+white*.065)*2.75)*env(age,.002,.24);
   const kick=(Math.sin(punchLow)*.22+Math.sin(punchMid)*.12+Math.sin(punchMid*1.91)*.045)*env(age,.0008,.13);
   const flash=white*env(age,.0006,.015)*.13;
   blast=drive*.28+kick+flash;
   for(let j=0;j<6;j++){
    const f=[531,859,1397,2243,3559,5107][j]*(1+variant*.002*(j%2?1:-1));
    const decay=.66/(1+j*.24),weight=.046/(1+j*.62)*(j<2?.68:1);
    answerL+=Math.sin(TAU*f*age)*env(age,.0012,decay)*weight;
    answerR+=Math.sin(TAU*f*1.003*age+.12)*env(age,.0012,decay)*weight;
   }
  }
  // Three inharmonic, saturated metal answers retain the recognition rhythm.
  // No soft rounded bell attacks or major-scale mallet tones in this tail.
  // RUSH answers faster, while the initial recognition rhythm stays the same.
  for(const [j,at] of MOON_SIGNATURE.tailAt.entries()){
   const answerAge=t-(mode==='rushWin'?at*.83:at);if(answerAge<0)continue;
   const f=[1397,2243,3559][j]*(1+variant*.003);
   let edgeL=Math.sin(TAU*f*answerAge),edgeR=Math.sin(TAU*f*1.0021*answerAge+.14);
   for(const [ratio,weight] of [[1.641,.63],[2.317,.34]])if(f*ratio<sampleRate*.44){
    edgeL+=Math.sin(TAU*f*ratio*answerAge)*weight;
    edgeR+=Math.sin(TAU*f*ratio*1.0013*answerAge+.19)*weight;
   }
   const rasp=white*env(answerAge,.0004,.032)*.052;
   const weight=.078*env(answerAge,.00065,.49+j*.075);
   answerL+=Math.tanh(edgeL*2.1)*weight*(j%2?.82:1)+rasp;
   answerR+=Math.tanh(edgeR*2.1)*weight*(j%2?1:.82)+rasp;
  }
  const attack=Math.min(1,t/.0008),end=Math.min(1,(duration-t)/.12);
  left[i]=Math.tanh((clutch+ratchet+blast+answerL)*1.35)*attack*end;
  right[i]=Math.tanh((clutch+ratchet+blast+answerR)*1.35)*attack*end;
 }
 // Damped crossed reflections keep the release wide without softening its
 // dry leading edge or occupying the pre-decision silent window.
 const taps=[[.041,.11],[.077,.09],[.131,.068],[.203,.05],[.319,.035],[.463,.022]],dryL=left.slice(),dryR=right.slice();
 let peak=0,dampL=0,dampR=0;
 for(let i=0;i<n;i++){
  let a=0,b=0;for(const [delay,gain] of taps){const l=i-Math.round((delay+variant*.001)*sampleRate),r=i-Math.round((delay+.007)*sampleRate);if(l>=0)a+=dryR[l]*gain;if(r>=0)b+=dryL[r]*gain;}
  dampL+=.39*(a-dampL);dampR+=.39*(b-dampR);
  const fade=Math.min(1,(n-i)/(sampleRate*.12));left[i]=(left[i]+dampL)*fade;right[i]=(right[i]+dampR)*fade;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
 }
 const scale=level/Math.max(peak,.001);for(let i=0;i<n;i++){left[i]*=scale;right[i]*=scale;}
 return {left,right,sampleRate,duration};
}
