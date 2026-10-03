import {Texture} from 'pixi.js';
const cache=new Map();
const COLORS=[['#46afc9','#9eebed','#287b9e'],['#df7ea6','#ffd7e1','#a95387'],['#a494d1','#e0dafa','#72659d'],['#e2b752','#fff1ac','#aa7d43'],['#68b49c','#c1efda','#468673']];
// Native 48×64 sprite; every shape is authored at the floor's pixel scale.
export function arcadeCabinetTexture(variant=0,active=true){
 const v=variant%COLORS.length,key=`${v}:${active}`;if(cache.has(key))return cache.get(key);
 const canvas=document.createElement('canvas');canvas.width=48;canvas.height=64;const c=canvas.getContext('2d');
 const [color,light,deep]=COLORS[v],ink='#4f5274',white='#fff7df',shade='#adb9c8',gold='#dcb866';
 const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const shape=(pts,col)=>{c.fillStyle=col;for(let y=0;y<64;y++){const hits=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))hits.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2)r(Math.ceil(hits[i]),y,Math.ceil(hits[i+1])-Math.ceil(hits[i]),1,col);}};
 // Rounded cabinet shoulder and cool right side. The roof is visible above the fascia.
 shape([[13,2],[32,2],[39,6],[44,14],[44,56],[40,62],[9,62],[4,57],[4,14],[8,6]],ink);
 shape([[13,3],[31,3],[37,6],[40,10],[8,10],[10,6]],shade);
 r(14,3,16,1,white);r(12,5,20,2,'#dce5dc');r(16,5,14,1,'#8498ad');
 shape([[10,9],[35,9],[40,14],[40,55],[36,59],[9,59],[6,54],[6,16]],white);
 r(40,15,3,39,'#7d91ad');r(41,18,1,30,'#a7bccb');
 // Central medallion replaces the generic rectangular marquee.
 shape([[20,6],[27,6],[30,9],[30,13],[27,16],[20,16],[17,13],[17,9]],ink);
 shape([[21,7],[26,7],[29,10],[29,12],[26,15],[21,15],[18,12],[18,10]],gold);
 r(21,9,5,4,active?light:shade);r(23,8,3,5,active?deep:'#858da2');r(21,9,1,1,white);
 // Paired luminous wings wrap the round playfield rather than outlining a box.
 for(const flip of [false,true]){const x=n=>flip?47-n:n;
 for(const [xx,yy,ww,hh]of [[10,10,5,3],[7,14,4,5],[6,20,3,15],[8,36,3,8],[11,44,5,3]]){r(flip?x(xx)-ww+1:xx,yy,ww,hh,deep);r(flip?x(xx)-ww+1:xx,yy,ww-1,1,active?light:shade);}
 }
 // Broad circular glass, with an inner rail and a dark inset behind it.
 shape([[17,15],[30,15],[35,19],[38,25],[38,36],[34,43],[29,47],[18,47],[12,43],[9,36],[9,25],[12,19]],ink);
 shape([[17,16],[30,16],[34,20],[36,25],[36,36],[32,42],[28,45],[18,45],[13,41],[11,35],[11,25],[14,20]],shade);
 shape([[18,18],[29,18],[33,21],[35,26],[35,35],[31,41],[27,43],[19,43],[14,39],[13,34],[13,26],[15,22]],'#bcd9d8');
 r(18,16,12,1,white);r(12,26,1,9,white);r(15,20,2,1,white);
 // A shaped LCD bezel fills the field while leaving a readable left ball lane.
 r(16,23,19,15,ink);r(17,22,16,1,gold);r(17,23,17,1,white);r(16,24,1,12,gold);r(34,24,1,12,gold);
 r(17,24,17,12,active?'#34486f':'#738399');r(18,25,15,7,active?'#526f9c':'#8795a4');
 if(active){
  // Miniature moon/castle background and three separated reel windows.
  r(28,25,4,4,'#fff2be');r(30,25,2,3,'#526f9c');
  r(19,28,2,3,'#394c78');r(22,27,2,4,'#394c78');r(26,29,2,2,'#394c78');r(18,31,15,1,'#86b7c8');
  for(const x of [18,23,28]){r(x,32,4,3,white);r(x,32,3,1,'#db8ca0');r(x+2,33,1,2,'#c66785');}
 }else{r(18,25,1,6,'#a7b7be');r(19,25,4,1,'#a7b7be');}
 r(19,37,12,1,deep);r(22,38,6,1,gold);r(23,39,4,2,ink);r(23,41,4,1,white);
 // Paired metal rails and a dotted left lane stay outside the LCD.
 r(12,26,1,9,'#6f8ba5');r(13,23,1,3,white);r(14,21,2,1,white);
 for(const [x,y]of [[14,25],[14,29],[14,33],[16,37],[18,39],[20,40],[30,38],[32,40]]){r(x,y+1,1,1,'#8096ab');r(x,y,1,1,white);}
 r(14,36,2,1,gold);r(15,35,1,3,gold);r(29,41,4,2,deep);r(29,41,4,1,light);
 // Short glints expose glass without masking the picture.
 r(17,20,2,1,'#effff0');r(16,21,1,2,'#effff0');r(31,43,2,1,'#effff0');
 // Projecting upper tray: visible basin, rolled rim, fascia and round handle.
 shape([[10,46],[34,46],[38,49],[36,54],[9,54],[6,51]],ink);
 r(10,47,23,2,shade);r(9,49,26,3,deep);r(11,49,20,2,'#354f70');r(8,52,27,2,white);r(10,54,24,2,color);
 for(const x of [13,17,21,25]){r(x,49,2,2,'#b4cbd2');r(x,49,1,1,white);}
 shape([[35,49],[39,49],[42,52],[42,56],[39,59],[35,59],[32,56],[32,52]],ink);
 shape([[35,50],[39,50],[41,52],[41,55],[38,58],[35,58],[33,55],[33,53]],gold);
 r(35,52,4,4,deep);r(35,51,3,1,white);r(36,52,1,2,light);
 r(11,57,19,2,ink);r(13,57,15,1,shade);r(10,60,28,1,'#8293aa');
 // DETAIL_PASS
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
