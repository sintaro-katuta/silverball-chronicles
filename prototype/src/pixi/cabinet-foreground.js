import {sourceBoardSurfaces,paintSourceBoardEdges,sourceBoardTexturePoint} from './source-board-surfaces.js';
import {pixelSurface,painter} from './pixel-primitives.js';
import {sourcePoint} from './source-layout.js';
import {paintLunarReliefs} from './lunar-relief-art.js';
import {LCD_OPENING} from './lcd-layout.js';
import {paintLcdGuard} from './lcd-guard-tiles.js';
export function createCabinetForeground(physics,{portrait=null,background=null,includeSword=true,onlySword=false}={}){return pixelSurface(1260,1680,c=>{
 const sourceBoard=sourceBoardSurfaces(physics),d=painter(c),at=p=>{const [x,y]=sourcePoint(p);return [Math.round(x*3),Math.round((y-130)*3)];},poly=(p,col)=>d.poly(p.map(at),col),line=(a,b,col,w=3)=>d.line(...at(a),...at(b),col,w);
 const plate=(ps,col)=>{if(!sourceBoard)poly(ps.map(([x,y])=>[x+6,y+9]),'#071321');poly(ps,'#9bb3c4');const cx=ps.reduce((s,p)=>s+p[0],0)/ps.length,cy=ps.reduce((s,p)=>s+p[1],0)/ps.length;poly(ps.map(([x,y])=>[cx+(x-cx)*.96,cy+(y-cy)*.94]),col);};
 paintLunarReliefs({c,poly,line,plate,at,portrait,background,includeSword,onlySword,protectedTitle:!!physics.leftTitleGuard,sourceBoard,hideLeftTitle:['open-title','diagram'].includes(physics.leftInletRoute)});
 if(onlySword)return;
 if(!sourceBoard){
 plate([[190,648],[209,661],[213,679],[210,689],[194,688],[188,677]],'#a1b3bf');
 poly([[193,670],[208,670],[208,684],[194,684]],'#030912');
 }
 if(sourceBoard)paintSourceBoardEdges(d,sourceBoardTexturePoint,sourceBoard);
 // The projecting metal face must remain visible over the apron artwork.
 if(physics.colliders.some(part=>part.pixelGuard))paintLcdGuard(d,([x,y])=>[Math.round(x*3),Math.round((y-130)*3)],physics);
 // Visible closed face of the authored one-way flap; rear launch balls pass behind it.
 if(physics.launchRailProfile==='guarded-exit'){
  const v=physics.nonReturnValve,pt=p=>[Math.round(p.x*3),Math.round((p.y-130)*3)],a=pt(v.a),b=pt(v.b);
  d.line(...a,...b,'#142b40',8);d.line(...a,...b,'#839eaf',Math.round(v.radius*6));d.line(a[0],a[1]-1,b[0],b[1]-1,'#c8d6d6',1);d.rect(a[0]-3,a[1]-3,6,6,'#c5ae67');d.rect(a[0]-1,a[1]-1,2,2,'#142b40');
 }
 c.save();c.globalCompositeOperation='destination-out';d.poly(LCD_OPENING.map(([x,y])=>[x*3,(y-130)*3]),'#000');
 for(const p of physics.pockets){const size=p.kind==='bonus'?44:p.kind==='rush'?26:16;d.rect((p.x-size/2)*3,(p.y-20-130)*3,size*3,48*3,'#000');}c.restore();
});}
