import {ENTRY_TITLE_START} from './entry-title-schedule.js';
import {pixelSurface} from './pixel-primitives.js';
const clamp=t=>Math.max(0,Math.min(1,t));
const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
export const RESULT_SLASH_TITLE_AT=ENTRY_TITLE_START.slash;
export function resultSlashPose(t){return {cut:clamp((t-1.25)/.16),open:ease((t-1.65)/1.2),offset:Math.round(ease((t-1.65)/1.2)*210)};}
// Both pieces retain their own pixels. The diagonal cut moves with each piece.
export function createResultSlashPainter(rushScene,paintResult){
 const result=pixelSurface(210,140,()=>{});let amount;
 return (c,t,payout)=>{
  if(amount!==payout){amount=payout;paintResult(result.getContext('2d'),payout);}
  c.drawImage(rushScene.source.resource,0,0,210,140);
  const {cut,open,offset}=resultSlashPose(t);
  for(const side of [-1,1]){
   c.save();c.translate(side*offset,0);c.beginPath();
   if(side<0){c.moveTo(0,0);c.lineTo(210,0);c.lineTo(0,140);}
   else {c.moveTo(210,0);c.lineTo(210,140);c.lineTo(0,140);}
   c.closePath();c.clip();c.drawImage(result,0,0);
   if(cut>0){
    const g=c.createLinearGradient(210,0,0,140);
    for(let i=0;i<=6;i++)g.addColorStop(i/6,`hsl(${(i*60+t*130)%360},100%,65%)`);
    c.globalCompositeOperation='screen';c.strokeStyle=g;c.lineWidth=open?4:6;
    c.beginPath();c.moveTo(210,0);c.lineTo(210*(1-cut),140*cut);c.stroke();
    c.strokeStyle='#ffffff';c.lineWidth=1;c.stroke();
   }
   c.restore();
  }
  // A short moving blade glint precedes the split; no repeated flashes or zoom.
  if(cut>0&&cut<1){const x=210*(1-cut),y=140*cut;c.save();c.globalCompositeOperation='screen';c.fillStyle='#fff';c.fillRect(Math.round(x)-5,Math.round(y),11,1);c.fillRect(Math.round(x),Math.round(y)-4,1,9);c.restore();}
 };
}
