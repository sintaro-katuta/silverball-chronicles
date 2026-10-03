import {LCD_OUTLINE,LCD_OPENING} from './lcd-layout.js';
import {sourcePath} from './source-layout.js';
import {pixelSurface,painter} from './pixel-primitives.js';
export function createBoardTrim(physics){return pixelSurface(1260,1680,c=>{
 const d=painter(c),at=([x,y])=>[Math.round(x*3),Math.round((y-130)*3)],poly=(ps,col)=>d.poly(sourcePath(ps).map(at),col);
 poly([[189,689],[397,795],[503,792],[638,765],[641,738],[665,716],[665,761],[641,792],[515,826],[444,846],[393,833],[189,736]],'#2b4257');
 for(const ps of [ [[189,710],[395,813],[439,822],[497,812],[634,780]],[[197,718],[398,820],[439,830],[501,819],[636,787]] ]){const a=sourcePath(ps).map(at);for(let i=1;i<a.length;i++)d.line(...a[i-1],...a[i],'#9bb2bf',3);}
 poly([[718,626],[785,618],[780,713],[760,730],[742,784],[704,807],[672,831],[650,863],[644,901],[625,925],[580,927],[578,880],[533,879],[530,839],[581,818],[638,799],[682,773],[692,721],[701,667]],'#263e54');
 poly([[728,650],[768,644],[755,708],[736,721],[720,774],[695,787],[705,712]],'#183953');
 for(const p of physics.pockets.filter(p=>p.kind==='normal'||p.kind==='start')){const [x,y]=at([p.x,p.y]);d.rect(x-18,y-6,36,36,'#1c3349');d.line(x-18,y+30,x+18,y+30,'#8296a7',2);}
});}
