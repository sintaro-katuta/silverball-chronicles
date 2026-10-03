import {pixelSurface,painter} from './pixel-primitives.js';
import {sourcePoint} from './source-layout.js';
import {paintLunarReliefs} from './lunar-relief-art.js';
import {LCD_OPENING} from './lcd-layout.js';
export function createCabinetForeground(physics,{portrait=null,background=null,includeSword=true,onlySword=false,onlyGrip=false}={}){return pixelSurface(1260,1680,c=>{
 const d=painter(c),at=p=>{const [x,y]=sourcePoint(p);return [Math.round(x*3),Math.round((y-130)*3)];},poly=(p,col)=>d.poly(p.map(at),col),line=(a,b,col,w=3)=>d.line(...at(a),...at(b),col,w);
 const plate=(ps,col)=>{poly(ps.map(([x,y])=>[x+6,y+9]),'#071321');poly(ps,'#9bb3c4');const cx=ps.reduce((s,p)=>s+p[0],0)/ps.length,cy=ps.reduce((s,p)=>s+p[1],0)/ps.length;poly(ps.map(([x,y])=>[cx+(x-cx)*.96,cy+(y-cy)*.94]),col);};
 paintLunarReliefs({c,poly,line,plate,at,portrait,background,includeSword,onlySword,onlyGrip});
 if(onlySword||onlyGrip)return;
 plate([[190,648],[209,661],[213,679],[210,689],[194,688],[188,677]],'#a1b3bf');
 poly([[193,670],[208,670],[208,684],[194,684]],'#030912');
 c.save();c.globalCompositeOperation='destination-out';d.poly(LCD_OPENING.map(([x,y])=>[x*3,(y-130)*3]),'#000');
 for(const p of physics.pockets){const size=p.kind==='bonus'?44:p.kind==='rush'?26:16;d.rect((p.x-size/2)*3,(p.y-20-130)*3,size*3,48*3,'#000');}c.restore();
});}
