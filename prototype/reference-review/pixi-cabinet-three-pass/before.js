import {Texture} from 'pixi.js';
const cache=new Map();
const COLORS=[['#46afc9','#9eebed','#287b9e'],['#df7ea6','#ffd7e1','#a95387'],['#a494d1','#e0dafa','#72659d'],['#e2b752','#fff1ac','#aa7d43'],['#68b49c','#c1efda','#468673']];
// 48 × 64 hand-authored pixels: enough room for glass, pins and moulded depth.
export function arcadeCabinetTexture(variant=0,active=true){
 const v=variant%COLORS.length,key=`${v}:${active}`;if(cache.has(key))return cache.get(key);
 const canvas=document.createElement('canvas');canvas.width=48;canvas.height=64;const c=canvas.getContext('2d');
 const [color,light,deep]=COLORS[v],ink='#625d79',white='#fff8e8',shade='#b1b4c9';
 const r=(x,y,w,h,col)=>{c.fillStyle=col;const yy=10+Math.round(y*.82);c.fillRect(x,yy,w,Math.max(1,Math.round((y+h)*.82)-Math.round(y*.82)));};
 // Rasterize silhouettes on the same pixel grid; no antialiased polygon edges.
 const poly=(pts,col)=>{const points=pts.map(([x,y])=>[x,10+Math.round(y*.82)]);c.fillStyle=col;for(let y=0;y<64;y++){const hits=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))hits.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2)c.fillRect(Math.ceil(hits[i]),y,Math.ceil(hits[i+1])-Math.ceil(hits[i]),1);}};
 // Visible top plane: a shallow, front-facing elevated view shared with the room.
 c.fillStyle=ink;c.fillRect(8,2,32,10);c.fillRect(6,5,36,7);
 c.fillStyle=shade;c.fillRect(9,3,30,6);c.fillRect(7,6,34,5);
 c.fillStyle=white;c.fillRect(10,3,28,1);c.fillRect(8,6,32,3);
 c.fillStyle=light;c.fillRect(11,5,26,3);
 c.fillStyle=deep;c.fillRect(17,5,15,1);c.fillRect(17,7,15,1);
 
 // Enamel shell with rounded shoulders, a cool side plane and two grounded feet.
 poly([[8,0],[37,0],[37,2],[41,2],[41,5],[44,5],[44,59],[40,59],[40,63],[8,63],[8,61],[4,61],[4,7],[6,7],[6,2],[8,2]],ink);
 r(8,3,31,55,white);r(6,8,35,47,white);r(40,8,3,49,'#8992ae');r(39,4,2,52,shade);r(7,59,33,2,'#8b91aa');r(9,61,6,2,ink);r(33,61,6,2,ink);
 r(10,1,26,1,'#e0e4e4');r(8,3,2,8,'#ffffff');r(6,11,1,39,'#ffffff');
 // Broad header and individual indicator bulbs.
 r(10,4,27,8,deep);r(11,4,25,6,color);r(12,4,23,1,light);r(14,7,17,2,active?'#fff5b6':'#b5b2be');
 for(const x of [10,17,24,31]){r(x,2,4,2,active?'#fff5ab':'#c5c2cb');r(x+1,2,2,1,active?'#ffffff':'#dedbe1');}
 for(const x of [7,36]){r(x,14,3,33,deep);r(x,15,2,30,color);for(let y=17;y<44;y+=7)r(x,y,2,3,active?light:'#b8bac9');}
 // Oval ball rail, inset playfield and the coin unit at the side.
 poly([[15,13],[31,13],[34,16],[35,21],[35,42],[32,47],[14,47],[11,44],[10,21],[12,16]],ink);
 poly([[15,15],[30,15],[33,18],[33,41],[30,45],[15,45],[12,42],[12,21]],'#d7eae7');
 r(15,14,15,1,'#ffffff');r(12,18,1,23,'#ffffff');r(13,21,1,16,'#9db7c0');r(32,21,1,19,'#9bb1bc');
 // LCD has a moon and skyline, with three readable miniature reel faces.
 r(15,20,16,15,'#6f7e9a');r(16,21,14,13,active?'#455b91':'#8a90a4');
 if(active){r(17,22,12,6,'#719ec2');r(24,22,4,4,'#ffedb0');r(23,25,3,1,'#719ec2');for(const [x,y,h]of [[17,26,2],[20,25,3],[27,26,2]])r(x,y,2,h,'#4d6391');
 for(const x of [17,21,25]){r(x,29,3,4,white);r(x,29,3,1,'#f4d16e');r(x+1,30,1,2,'#dc8296');}}
 else{r(17,22,12,1,'#a5adba');r(17,23,1,9,'#9fa6b7');}
 for(const [x,y]of [[14,19],[30,18],[14,25],[31,26],[14,33],[31,34],[16,37],[19,39],[27,37],[29,40],[21,42]]){r(x,y,1,2,'#7d8eac');r(x,y,1,1,'#fffbed');}
 r(21,41,5,2,color);r(22,43,3,1,deep);r(29,42,3,2,'#e3bd77');
 // A restrained staircase of reflections reads as glass, not a translucent wash.
 for(let i=0;i<5;i++)r(14+i,17+i,1,2,'#f3ffef');r(28,36,2,1,'#eff9eb');r(27,37,2,1,'#eff9eb');
 r(40,18,2,9,'#65748f');r(40,19,1,3,'#e1e9e7');r(40,31,2,2,'#f5d384');
 // Recessed ball tray, a few silver balls and a chunky rotary handle.
 r(9,49,27,2,shade);r(10,51,22,7,ink);r(11,51,20,1,'#829bac');r(12,53,18,3,'#384c6b');r(12,57,19,1,'#d7e5e2');
 for(const x of [14,18,22,26]){r(x,54,2,2,'#a5bdc9');r(x,54,1,1,'#ffffff');}
 poly([[35,51],[39,51],[41,53],[41,57],[39,59],[35,59],[33,57],[33,53]],ink);r(35,52,4,1,'#fff3cd');r(34,54,6,3,color);r(36,53,3,4,'#e9c876');r(36,54,1,1,'#fff');
 r(12,59,18,1,color);r(15,60,12,1,light);
 if(!active){
 // Wooden maintenance plaque fixed in front of the cabinet, not across the chair.
 const wood=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 wood(6,32,37,18,'#625775');wood(5,30,37,18,'#8c624e');
 wood(6,31,35,15,'#dfb579');wood(6,31,35,1,'#ffe0a1');wood(6,45,35,2,'#b68157');
 wood(8,33,8,1,'#eac58c');wood(29,43,9,1,'#c69560');wood(7,39,3,1,'#c69560');
 for(const x of [7,39]){wood(x,32,1,1,'#775843');wood(x,44,1,1,'#775843');}
 c.font='10px DotGothic16';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#5c423b';c.fillText('調整中',24,38);
 }
 const t=Texture.from(canvas);t.source.scaleMode='nearest';cache.set(key,t);return t;
}
