const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{const u=clamp(x);return u*u*(3-2*u);};
// Dedicated artwork for the existing pressure face shots, on the same clock.
// No win/revival input: this common pre-result shot cannot disclose the result.
export function resolvePortraitPose(t,{variant='pressure',ending='standard',reducedEffects=false}={}){
 const visible=variant==='pressure'&&ending!=='flash'&&t>=39&&t<46;
 if(!visible)return {visible:false,alpha:0,x:105,y:78,width:300};
 const close=t>=43,u=close?(t-43)/3:(t-39)/4;
 return {visible:true,alpha:smooth((t-39)/.16)*smooth((46-t)/.16),x:105,y:78,width:(close?380:300)+(reducedEffects?0:6*smooth(u))};
}
