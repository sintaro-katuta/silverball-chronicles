// Deterministic oscillator-only audio authoring. No gameplay state, RNG, samples or services.
const TAU=2*Math.PI;
export const noteHz=midi=>440*2**((midi-69)/12);
export function buffer(seconds,rate){if(!Number.isInteger(rate)||rate<8000||rate>96000||!Number.isFinite(seconds)||seconds<=0)throw new RangeError('Invalid PCM format');return {left:new Float32Array(Math.ceil(seconds*rate)),right:new Float32Array(Math.ceil(seconds*rate)),sampleRate:rate,duration:seconds};}
const wave=(phase,f,rate,bright)=>{let v=Math.sin(phase)*.76;for(let h=2;h<=5;h++)if(h*f<rate*.43)v+=Math.sin(phase*h)*bright*.9*.26/h;return v;};
export function tone(pcm,{at=0,seconds=.3,hz,endHz=hz,gain=.1,pan=0,attack=.006,release=.08,decay=1,bright=.45,vibrato=0,shape='tone',wrap=false}){
 const rate=pcm.sampleRate,n=pcm.left.length,start=Math.round(at*rate),length=Math.ceil(seconds*rate);let phase=0;
 const lp=Math.sqrt((1-pan)/2),rp=Math.sqrt((1+pan)/2);
 for(let j=0;j<length;j++){const t=j/rate,u=t/seconds,idx=start+j;if(!wrap&&(idx<0||idx>=n))continue;const i=((idx%n)+n)%n;
  let f=hz*Math.exp(Math.log(endHz/hz)*Math.min(1,t/Math.min(seconds,.12)));if(vibrato)f*=1+vibrato*Math.sin(TAU*5.4*t);
  phase+=TAU*f/rate;const edge=Math.min(1,t/Math.max(attack,1/rate),(seconds-t)/Math.max(release,1/rate));const env=Math.max(0,edge)*Math.exp(-decay*u);let v;
  if(shape==='kick')v=Math.sin(phase)*.9+.12*Math.sin(phase*2);else if(shape==='tick')v=Math.sin(phase)*.65+Math.sin(phase*2)*.25;else v=wave(phase,f,rate,bright);
  pcm.left[i]+=v*gain*env*lp;pcm.right[i]+=v*gain*env*rp;
 }
}
export function finish(pcm,peak=.32,{loop=false,echo=true}={}){
 const {left:l,right:r,sampleRate:rate}=pcm,n=l.length;
 if(echo){const a=l.slice(),b=r.slice();for(const[seconds,g]of [[.113,.13],[.227,.075]]){const d=Math.round(seconds*rate);for(let i=0;i<n;i++){const j=i-d;if(j>=0){l[i]+=b[j]*g;r[i]+=a[j]*g;}else if(loop){l[i]+=b[n+j]*g;r[i]+=a[n+j]*g;}}}}
 let max=0,ml=0,mr=0;for(let i=0;i<n;i++){ml+=l[i];mr+=r[i];}ml/=n;mr/=n;for(let i=0;i<n;i++){l[i]-=ml;r[i]-=mr;max=Math.max(max,Math.abs(l[i]),Math.abs(r[i]));}
 const gain=peak/Math.max(max,.0001);for(let i=0;i<n;i++){const fade=loop?1:Math.min(1,i/(rate*.0015),(n-1-i)/(rate*.025));l[i]*=gain*fade;r[i]*=gain*fade;}
 if(loop){ // A 2ms zero crossing join; tails are authored circularly, not discarded.
  const edge=Math.min(Math.round(rate*.002),n/2);for(let i=0;i<edge;i++){const g=.5-.5*Math.cos(Math.PI*i/edge);l[i]*=g;r[i]*=g;l[n-1-i]*=g;r[n-1-i]*=g;}
 }
 return pcm;
}
