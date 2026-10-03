import {LCD_APRON,LCD_OPENING} from './lcd-layout.js';
import {pixelSurface,painter} from './pixel-primitives.js';
// Recessed mounting plates: artwork only, never colliders or ball guides.
export function createBoardTrim(physics){return pixelSurface(1260,1680,c=>{
 const d=painter(c),x=v=>Math.round(v*3),y=v=>Math.round((v-130)*3);
 // The sculpted lower LCD housing uses the very same outline as its collision surface.
 const apron=[...LCD_OPENING.slice(2),...LCD_APRON.slice().reverse()];
 d.poly(apron.map(([a,b])=>[x(a),y(b)]),'#243d51');
 for(let i=1;i<LCD_APRON.length;i++){const a=LCD_APRON[i-1],b=LCD_APRON[i];d.line(x(a[0]),y(a[1]),x(b[0]),y(b[1]),'#8eabbb',6);}
 for(const feed of physics.colliders.filter(s=>s.role==='left-lcd-feed')){const {a,b}=feed;d.poly([[x(a.x),y(a.y)],[x(b.x),y(b.y)],[x(b.x),y(b.y+6)],[x(a.x),y(a.y+6)]],'#395569');d.line(x(a.x),y(a.y),x(b.x),y(b.y),'#c3e5e6',4);d.line(x(a.x+2),y(a.y+5),x(b.x-2),y(b.y+5),'#698ea4',3);for(const t of [.18,.82]){const px=x(a.x+(b.x-a.x)*t),py=y(a.y+(b.y-a.y)*t+4);d.diamond(px,py,4,'#ced4c4');d.line(px-2,py,px+2,py,'#233247',2);}}
 for(const p of physics.pockets.filter(p=>p.kind==='normal'||p.kind==='start')){
  const px=x(p.x),py=y(p.y);
  d.poly([[px-62,py+2],[px+62,py+2],[px+56,py+72],[px-56,py+72]],'#102239');
  d.rect(px-58,py+8,116,58,'#263951');d.rect(px-53,py+12,106,44,'#1a324b');
  d.line(px-53,py+12,px-53,py+50,'#9bb2bc',3);d.line(px+53,py+12,px+53,py+50,'#485e75',5);
  d.rect(px-50,py+60,100,5,p.kind==='start'?'#b88d49':'#52687b');
  for(const dx of [-46,46]){d.diamond(px+dx,py+48,5,'#7893ac');d.rect(px+dx-2,py+47,5,2,'#162638');}
  if(p.kind==='normal')d.line(px,py+74,px,y(643),'#203750',5);
 }
 // A single recessed mounting body joins the LCD edge, upper attacker and lower tulip.
 // This flat backplate is not a raised collision wall.
 const chassis=[[326,400],[392,400],[392,515],[381,569],[383,628],[333,628],[326,566]];
 d.poly(chassis.map(([a,b])=>[x(a),y(b)]),'#142b40');
 d.poly([[330,404],[387,404],[387,514],[375,568],[377,622],[337,622],[330,564]].map(([a,b])=>[x(a),y(b)]),'#203a50');
 d.line(x(330),y(405),x(330),y(555),'#7191a3',4);
 for(const yy of [419,479,568,620]){d.diamond(x(335),y(yy),5,'#c2a05c');d.line(x(334),y(yy),x(336),y(yy),'#273b50',2);}
 for(const yy of [487,493,499])d.line(x(346),y(yy),x(373),y(yy),'#305166',3);
 // Recess behind the OUT mouth, with broad stepped metal faces.
 const o=physics.outlet,px=x(o.x),py=y(o.y);
 d.poly([[px-119,py-18],[px+119,py-18],[px+105,py+49],[px-105,py+49]],'#304a63');
 d.rect(px-110,py-12,220,54,'#080f1b');d.rect(px-110,py-15,220,5,'#a9c2d5');
});}
