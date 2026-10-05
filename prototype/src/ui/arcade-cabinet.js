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
 // Finishing pass: segmented enamel and metal, all lit from the upper left.
 r(7,22,1,12,'#fffef0');r(8,25,1,13,'#9dbfc7');r(39,23,1,17,'#7897b0');
 r(8,39,2,4,'#94b4c2');r(10,43,3,2,white);r(13,45,4,1,'#7194ae');
 r(35,42,3,3,'#91aabe');r(37,38,2,3,'#e9efd9');r(37,44,2,2,deep);
 // Shoulder crescents wrap inward; no separate floating ornament.
 shape([[10,12],[15,10],[16,12],[13,14],[11,18],[9,19],[9,15]],gold);
 r(11,12,3,1,white);r(10,15,1,3,'#ffe7a7');r(13,14,1,2,'#af8959');
 shape([[32,10],[37,12],[39,15],[39,19],[37,18],[35,14],[32,12]],gold);
 r(33,11,2,1,white);r(37,14,1,3,'#b28a57');
 // Tiny moon medallion: darker cutout makes the crescent unmistakable.
 r(21,9,5,4,active?'#fff1b6':'#bcc3be');r(20,10,1,2,active?'#fff1b6':'#bcc3be');
 r(24,8,3,5,active?deep:'#7f90a3');r(23,9,1,3,active?deep:'#7f90a3');
 // Bowl opening recedes behind the raised rim; silver balls sit inside it.
 r(10,48,23,1,'#d7e8df');r(11,49,20,1,'#273b59');
 for(const [x,y]of [[12,50],[15,49],[18,50],[22,49],[26,50]]){r(x,y,2,2,'#7895ad');r(x,y,1,1,'#f0ffff');}
 r(8,52,26,1,'#fffce7');r(9,53,25,1,'#c4d5d4');r(11,55,20,1,deep);
 r(12,57,17,1,'#31465e');r(12,58,17,1,'#91acba');r(14,58,6,1,'#d0e3df');
 // Knob has a rim, recessed centre and a lit upper-left quadrant.
 r(35,50,4,1,'#ffedb9');r(33,52,1,3,'#ffe2a0');r(39,53,1,3,'#a87c4e');
 r(35,52,3,3,deep);r(35,52,2,1,light);r(37,54,1,2,ink);
 r(41,39,1,5,ink);r(41,39,1,1,white);r(41,45,1,1,gold);

 if(!active){
 // Wooden maintenance plaque fixed in front of the cabinet, not across the chair.
 const wood=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 wood(6,32,37,18,'#625775');wood(5,30,37,18,'#8c624e');
 wood(6,31,35,15,'#dfb579');wood(6,31,35,1,'#ffe0a1');wood(6,45,35,2,'#b68157');
 wood(8,33,8,1,'#eac58c');wood(29,43,9,1,'#c69560');wood(7,39,3,1,'#c69560');
 for(const x of [7,39]){wood(x,32,1,1,'#775843');wood(x,44,1,1,'#775843');}
 // Compact 9×11 hand-set glyphs keep crisp edges and a wooden margin.
 const glyphs=[
  ['010111111','111100001','000101101','111100101','000101101','111100001','000101101','111101101','101100001','111100101','000100011'],
  ['001000100','111110111','101010101','111110010','001000101','010101000','000000000','111111111','000010000','010011100','111111111'],
  ['000010000','000010000','111111111','100010001','100010001','100010001','111111111','000010000','000010000','000010000','000010000']
 ];
 wood(6,32,35,13,'#dfb579');
 glyphs.forEach((glyph,i)=>glyph.forEach((row,y)=>[...row].forEach((bit,x)=>{if(bit==='1')wood(9+i*10+x,33+y,1,1,'#5c423b');})));

 }
 const t=Texture.from(canvas);t.source.scaleMode='nearest';cache.set(key,t);return t;
}
