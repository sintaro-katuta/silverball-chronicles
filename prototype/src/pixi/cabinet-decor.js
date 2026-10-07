import {pixelSurface,painter} from './pixel-primitives.js';
import {traceBoardSilhouette} from './board-silhouette.js';
export function createCabinetDecor(){return pixelSurface(1260,1680,c=>{
 const d=painter(c);
 c.save();c.scale(3,3);c.translate(0,-130);
 c.beginPath();traceBoardSilhouette(c);
 const face=c.createLinearGradient(22,180,394,600);
 face.addColorStop(0,'#1c354b');face.addColorStop(.55,'#162b3f');face.addColorStop(1,'#102335');
 c.fillStyle=face;c.fill();c.restore();
 c.save();c.scale(3,3);c.translate(0,-130);c.beginPath();traceBoardSilhouette(c);c.clip();c.translate(0,130);c.scale(1/3,1/3);
 for(let i=0;i<16;i++)d.line(640,1410,30+i*80,75,'#1b334c',1);
 for(const [x,y,h] of [[80,1130,170],[950,1020,220],[840,1230,100]]){d.rect(x,y,45,h,'#203a50');d.poly([[x-4,y],[x+22,y-32],[x+49,y]],'#203a50');}
 c.restore();
 // Moulded blue-steel trim and gold inlays follow the rounded exterior.
 // This is rear decoration: it adds no contact surface to the ball routes.
 c.save();c.scale(3,3);c.translate(0,-130);
 c.translate(208,389);c.scale(.975,.978);c.translate(-208,-389);
 for(const [width,color] of [[8,'#071321'],[6,'#829aaa'],[4.5,'#254b72'],[1,'#d6bd7b']]){
  c.beginPath();traceBoardSilhouette(c);c.lineWidth=width;c.strokeStyle=color;c.stroke();
 }
 c.restore();
 // Small metallic crests are deliberately separate from pins and pockets.
 c.save();c.scale(3,3);c.translate(0,-130);
 const crest=(x,y,angle=0)=>{
  c.save();c.translate(x,y);c.rotate(angle);
  const diamond=(w,h,color)=>{c.beginPath();c.moveTo(0,-h);c.lineTo(w,0);c.lineTo(0,h);c.lineTo(-w,0);c.closePath();c.fillStyle=color;c.fill();};
  diamond(4,7,'#071321');diamond(3,6,'#c9ad68');diamond(1.8,4,'#326a96');diamond(.6,2,'#d7ecf4');
  c.restore();
 };
 crest(208,185,Math.PI/2);crest(28,388);crest(388,388);
 crest(104,575,-.9);crest(312,576,.9);crest(208,592,Math.PI/2);
 // Crescent engraving at the foot of the bezel.
 for(const x of [185,231]){
  c.beginPath();c.arc(x,591,3,0,Math.PI*2);c.fillStyle='#c9ad68';c.fill();
  c.beginPath();c.arc(x+1.4,590,2.7,0,Math.PI*2);c.fillStyle='#254b72';c.fill();
 }
 c.restore();
});}
