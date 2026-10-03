import {pixelSurface,painter} from './pixel-primitives.js';
import {sourcePoint,sourcePath} from './source-layout.js';
import {LCD_OPENING} from './lcd-layout.js';
export function createCabinetForeground(physics){return pixelSurface(1260,1680,c=>{
 const d=painter(c),at=p=>{const [x,y]=sourcePoint(p);return [Math.round(x*3),Math.round((y-130)*3)];},poly=(p,col)=>d.poly(p.map(at),col),line=(a,b,col,w=3)=>d.line(...at(a),...at(b),col,w);
 const plate=(ps,col)=>{poly(ps.map(([x,y])=>[x+6,y+9]),'#071321');poly(ps,'#9bb3c4');const cx=ps.reduce((s,p)=>s+p[0],0)/ps.length,cy=ps.reduce((s,p)=>s+p[1],0)/ps.length;poly(ps.map(([x,y])=>[cx+(x-cx)*.96,cy+(y-cy)*.94]),col);};
 // The source's upper sculpture footprint is retained, with original lunar armour.
 plate([[195,349],[201,284],[238,214],[280,185],[391,174],[445,158],[544,165],[621,204],[685,267],[704,363],[558,367],[444,345],[322,369]],'#1c3856');
 for(const side of [-1,1])for(let i=0;i<5;i++){const x=444+side*(51+i*33),y=244+i*14;plate([[x,y-42],[x+side*39,y-35],[x+side*46,y+22],[x+side*13,y+56],[x-side*8,y+12]],i%2?'#7594b1':'#abc0ce');line([x,y-20],[x+side*20,y+25],'#d4b86e',5);}
 const ring=(cx,cy,r,col)=>poly(Array.from({length:48},(_,i)=>[cx+Math.cos(i*Math.PI/24)*r,cy+Math.sin(i*Math.PI/24)*r]),col);
 ring(444,250,71,'#d2b773');ring(444,250,63,'#4b6b8e');ring(444,250,54,'#c6e6ed');ring(461,239,45,'#193653');
 // Long relief strips occupy the same left/right decorative footprints as the diagram.
 plate([[172,367],[196,389],[171,414],[199,440],[166,468],[195,494],[163,522],[184,551],[171,593],[199,632],[173,645],[142,583],[148,417]],'#315676');
 const [tx,ty]=at([155,416]);c.fillStyle='#d2e4e7';c.font='bold 40px DotGothic16';for(const [i,ch] of [...'月影機関'].entries())c.fillText(ch,tx,ty+i*68);
 plate([[708,370],[748,378],[771,480],[781,541],[765,582],[770,612],[714,629]],'#163850');
 for(let i=0;i<5;i++){const y=402+i*40,x=738+(i>1?12:0);plate([[x-18,y],[x,y-13],[x+18,y+8],[x+3,y+24]],'#829eaf');line([x-9,y],[x+5,y+12],'#d6b967',4);}
 plate([[699,674],[730,650],[755,660],[739,724],[720,742],[710,791],[688,805],[697,727]],'#345b78');
 for(let i=0;i<4;i++)line([711,690+i*23],[725,679+i*23],'#97d2e4',4);
 plate([[190,648],[209,661],[213,679],[210,689],[194,688],[188,677]],'#a1b3bf');
 poly([[193,670],[208,670],[208,684],[194,684]],'#030912');
 c.save();c.globalCompositeOperation='destination-out';d.poly(LCD_OPENING.map(([x,y])=>[x*3,(y-130)*3]),'#000');
 for(const p of physics.pockets){const size=p.kind==='bonus'?44:p.kind==='rush'?26:16;d.rect((p.x-size/2)*3,(p.y-20-130)*3,size*3,48*3,'#000');}c.restore();
});}
