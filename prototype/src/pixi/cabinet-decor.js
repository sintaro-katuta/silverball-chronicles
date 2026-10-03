import {pixelSurface,painter} from './pixel-primitives.js';
import {PLAYFIELD_APERTURE} from './board-rails.js';
export function createCabinetDecor(){return pixelSurface(1260,1680,c=>{
 const d=painter(c),pts=PLAYFIELD_APERTURE.map(([x,y])=>[Math.round(x*3),Math.round((y-130)*3)]);
 d.rect(0,0,1260,1680,'#091523');d.poly(pts,'#182e44');
 c.save();c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
 for(let i=0;i<16;i++)d.line(640,1410,30+i*80,75,'#1b334c',1);
 for(const [x,y,h] of [[80,1130,170],[950,1020,220],[840,1230,100]]){d.rect(x,y,45,h,'#203a50');d.poly([[x-4,y],[x+22,y-32],[x+49,y]],'#203a50');}
 c.restore();
 for(let i=1;i<pts.length;i++)d.line(...pts[i-1],...pts[i],'#48627a',3);
 d.rect(9,9,3,1418,'#6e879a');d.rect(1247,9,3,1418,'#6e879a');d.rect(9,1425,1241,3,'#8e7956');
});}
