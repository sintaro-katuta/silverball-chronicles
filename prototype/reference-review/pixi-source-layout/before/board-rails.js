// One physical launch channel, with a rounded outer rail shared by both powers.
const arc=(rx,ry,end,steps)=>Array.from({length:steps+1},(_,i)=>{const a=Math.PI+(end-Math.PI)*i/steps;return {x:210+rx*Math.sign(Math.cos(a))*Math.sqrt(Math.abs(Math.cos(a))),y:415+ry*Math.sin(a)};});
export const OUTER_ARC=arc(188,265,Math.PI*11/6,60);
export const INNER_ARC=arc(174,251,Math.PI*215/180,20);
export const PLAYFIELD_APERTURE=[...OUTER_ARC.map(p=>[p.x-3,p.y-3]),[382,310],[382,400],[406,400],[406,510],[381,555],[381,612],[382,635],[365,663],[244,683],[176,683],[55,650],[16,630],[16,415]];
export function installBoardRails(physics){
 physics.pins=physics.pins.filter(p=>p.y>=415||p.x>210-174*Math.sqrt(Math.max(0,1-((p.y-415)/251)**2))+12);
 physics.colliders=physics.colliders.filter(c=>!c.role.startsWith('launch-')&&!['upper-reflector','board-top'].includes(c.role));
 const add=(a,b,role)=>physics.colliders.push({a:{...a},b:{...b},r:1.3,material:'rail',role,restitution:.05});
 add({x:22,y:680},OUTER_ARC[0],'launch-outer');add({x:36,y:680},INNER_ARC[0],'launch-inner');
 for(const [points,role]of [[OUTER_ARC,'launch-outer-arc'],[INNER_ARC,'launch-inner-arc']])for(let i=1;i<points.length;i++)add(points[i-1],points[i],role);
 add(OUTER_ARC.at(-1),{x:379,y:310},'right-outer-return');
 physics.colliders.find(c=>c.role==='right-inner-upper').a.y=340;
 const outer=physics.colliders.find(c=>c.role==='right-outer');outer.a.y=310;outer.b.y=510;
 add({x:379,y:510},{x:370,y:555},'right-outer-funnel');
 add({x:370,y:555},{x:370,y:612},'right-outer-funnel');
 add({x:370,y:612},{x:379,y:635},'right-outer-funnel');
}
