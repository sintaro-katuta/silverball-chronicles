// Independently drawn pixel-art hall. Reference image is not used as a texture.
const W=1010,H=828;
// Shared with the PC hit areas: the five selectable faces in the first bank.
export const DESKTOP_PLAYABLE_BANK=Object.freeze({x:36,y:232,width:37,step:-21.5,frontLeft:.75,frontWidth:36.25,frontTop:-5.5,frontHeight:108.25});
// One reference chair: a blue round cushion above a broad metallic base.
// Coordinates are shared by the in-game drawing and the inspection page.
export function drawRoundSeat(ctx,x,y){
 const oval=(cx,cy,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();};
 const rect=(x0,y0,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x0,y0,w,h);};
 oval(x,y+15,12,4,'#092a61');
 // Cylindrical chrome base with its front and lower rim visible.
 rect(x-8,y+5,16,9,'#59646f');oval(x,y+13,8,3,'#59646f');
 rect(x-6,y+7,4,6,'#7d8990');rect(x+2,y+6,3,6,'#b1bdc4');
 rect(x+5,y+7,2,5,'#89969c');oval(x,y+13,7,1.5,'#87979f');
 // The cushion follows the seated figure's hip angle; the metal base stays vertical.
 ctx.save();ctx.translate(x,y);ctx.rotate(-0.27);
 oval(0,3,10.5,4.7,'#102c52');
 rect(-10,-1,20,4,'#164a8d');oval(0,2,10,4,'#17477d');
 oval(0,-2,10,5,'#236ec0');oval(-1,-3,8,3.4,'#337ed2');
 oval(-3,-4,4.5,1.3,'#5a9cea');ctx.restore();
}
export function drawHall(ctx,customerImage=null,womanImage=null,traysImage=null,yellowTraysImage=null,singleTraysImage=null,cabinetImages=null,roomImage=null,informationImage=null,binImage=null,singleColors=null,stackCounts={green:2,yellow:2},ticketCount=null){
 ctx.imageSmoothingEnabled=false;
 const box=(x,y,w,h,col)=>{ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const poly=(points,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.fill()};
 const txt=(s,x,y,size=15,col='#fff',align='center')=>{ctx.font=`bold ${size}px sans-serif`;ctx.textAlign=align;ctx.lineWidth=3;ctx.strokeStyle='#09112a';ctx.strokeText(s,x,y);ctx.fillStyle=col;ctx.fillText(s,x,y)};
 function plant(x,y){box(x-7,y+7,14,19,'#8f542d');poly([[x-13,y+7],[x+13,y+7],[x+8,y+17],[x-8,y+17]],'#b66a37');for(const [dx,dy] of [[-13,-12],[0,-20],[13,-12],[-7,-3],[8,-3]]){box(x+dx-6,y+dy,12,10,'#2e772d');box(x+dx-3,y+dy-4,7,5,'#68aa3d')}}
 if(roomImage)ctx.drawImage(roomImage,0,0,W,H);
 else{
 box(0,0,W,H,'#063c94');
 // Isometric checkerboard: two floor axes meet at each diamond corner.
 for(let u=-18;u<28;u++)for(let v=-18;v<28;v++){
  const x=505+(u-v)*45,y=(u+v)*23;
  if(x < -100 || x > W+100 || y < -50 || y > H+50)continue;
  poly([[x,y-23],[x+45,y],[x,y+23],[x-45,y]],(u+v)%2?'#0549b2':'#003381');
 }
 // Red walls, golden moulding and illuminated architectural signs.
 poly([[0,0],[270,0],[0,137]],'#84170e');poly([[740,0],[1010,0],[1010,137]],'#84170e');
 for(let i=0;i<8;i++){poly([[i*38,0],[i*38+13,0],[0,146-i*19],[0,137-i*19]],'#a62917');poly([[1010-i*38,0],[997-i*38,0],[1010,146-i*19],[1010,137-i*19]],'#a62917')}
 poly([[0,119],[261,0],[291,0],[0,145]],'#efcb6f');poly([[1010,119],[749,0],[719,0],[1010,145]],'#efcb6f');
 poly([[20,101],[242,0],[255,0],[20,119]],'#20120e');poly([[990,101],[768,0],[755,0],[990,119]],'#20120e');
 txt('PREMIUM',121,62,19,'#e4b952');txt('PREMIUM',889,62,19,'#e4b952');
 // Wall fixtures and stepped gold lights frame the entrance.
 for(const [x,y,flip] of [[16,135,false],[962,135,true],[71,95,false],[908,95,true]]){
  poly([[x,y],[x+35,y-16],[x+35,y-4],[x,y+12]],'#3c2d1e');
  for(let j=0;j<3;j++)poly([[x+3,y+j*3],[x+29,y-12+j*3],[x+29,y-10+j*3],[x+3,y+2+j*3]],'#ffeaa2');
 }

 // Small central terminal and edge greenery.
 poly([[471,0],[553,0],[560,8],[557,80],[546,92],[482,92],[472,82]],'#b48b38');box(478,0,72,78,'#d7ba69');box(487,9,53,47,'#bbf1f3');box(493,18,41,30,'#27b6d4');txt('DATA',514,12,12,'#fff4ba');txt('Click',514,38,13,'#fff');
 plant(19,130);plant(989,130);plant(287,14);plant(725,14);
 // Bright, dotted aisles behind the rows.
 function aisle(x,y,dx,dy,n){const len=n*38;poly([[x-8,y],[x+len,y+dy*n],[x+len+36,y+dy*n+24],[x+28,y+24]],'#087ac5');for(let i=0;i<n*3;i++){const px=x+i*12,py=y+i*dy/3;box(px,py+7,3,3,'#4dadd2');box(px+11,py+15,3,3,'#2794c8')}}
 aisle(40,337,38,-19,10);aisle(250,436,38,19,10);aisle(65,537,38,19,10);aisle(540,766,38,-19,10);
 }
 // Each bank is constructed from cabinet polygons, labels and separate seats.
 const rows=[{...DESKTOP_PLAYABLE_BANK,start:1,colors:['gold','gold']},{x:598,y:103,step:21.5,start:11,count:10,colors:['gold','red']},{x:423,y:209,step:21.5,start:21,count:10,colors:['red','red']},{x:245,y:306,step:21.5,start:31,count:10,colors:['green','green']},{x:68,y:406,step:21.5,start:41,count:10,colors:['green','gold']},{x:550,y:676,step:-21.5,start:51,count:10,colors:['gold','gold']}];
 const pal={gold:['#f4ad05','#ffe36a','#bc6a06'],red:['#d21d12','#ff8566','#760f10'],green:['#20a64c','#aaf773','#075f30']};
 const occupied=new Map([[1,new Map([[3,'man']])],[11,new Map([[1,'man'],[8,'woman']])],[21,new Map([[3,'man'],[7,'man']])],[31,new Map([[0,'woman'],[6,'man']])],[41,new Map([[1,'man'],[6,'man']])],[51,new Map([[3,'man'],[8,'woman']])]]);
 const visitors=[];
 function bank(r){
  const width=37,n=r.count??10,dy=r.step,sy=dy/width;const y2=r.y+dy*n;
  const hasCuboid=Boolean(((r.start===1||r.start===51)&&cabinetImages?.goldCuboid)||(r.start===11&&cabinetImages?.goldCuboid&&cabinetImages?.redCuboid)||(r.start===21&&cabinetImages?.redCuboid)||(cabinetImages?.cuboid&&(r.start===31||r.start===41)));
  const usesCuboid=(i)=>hasCuboid&&(r.start!==41||i<5||Boolean(cabinetImages?.goldCuboid));
  const fullCuboid=hasCuboid&&(r.start!==41||Boolean(cabinetImages?.goldCuboid));
  if(fullCuboid){
   poly([[r.x,r.y-21],[r.x+n*width,y2-21],[r.x+n*width,y2+84],[r.x,r.y+103]],'#11121a');
  }else poly([[r.x,r.y-21],[r.x+n*width,y2-21],[r.x+n*width,y2+78],[r.x,r.y+78]],'#11121a');
  function drawRowSign(){
   // Separate five-machine signs, projected with the same slope as the row.
   ctx.save();ctx.translate(r.x,r.y);ctx.transform(1,sy,0,1,0,0);
   for(let start=0;start<n;start+=5){
    const left=start*width+3,signWidth=Math.min(5,n-start)*width-7;
    ctx.fillStyle='#343942';ctx.fillRect(left-2,-31,signWidth+4,27);
    ctx.fillStyle='#f9f9fa';ctx.fillRect(left,-29,signWidth,21);
    ctx.fillStyle='#d4d9e2';ctx.fillRect(left,-10,signWidth,2);
    const label=r.start===1&&start===0?'月影機関':'準備中';
    ctx.fillStyle='#71528d';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='bold 12px sans-serif';ctx.fillText(label,left+signWidth/2,-18.5);
   }
   ctx.restore();
  }
  if(!hasCuboid)drawRowSign();
  for(let j=0;j<n;j++){
   // Mirrored cuboids must be painted from the far end so their side
   // faces sit behind the adjacent cabinet instead of covering its front.
   const i=dy<0&&hasCuboid?n-1-j:j;
   const x=r.x+i*width,y=r.y+i*dy,category=pal[r.colors[i<5?0:1]];
   if(cabinetImages?.[r.colors[i<5?0:1]]){
    ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    if(dy<0){ctx.translate(2*x+37,0);ctx.scale(-1,1);}
    if(usesCuboid(i)){
     // Match the face's sloped top/bottom edges to the row pitch.
     ctx.translate(x,y-17);ctx.transform(1,-0.004,0,1,0,0);
     const color=r.colors[i<5?0:1];
     const image=color==='red'?cabinetImages.redCuboid:color==='gold'?cabinetImages.goldCuboid:cabinetImages.cuboid;
     ctx.drawImage(image,0,0,55,120);
    }
    else{ctx.translate(x,y);ctx.transform(1,2.5/37,0,1,0,0);ctx.drawImage(cabinetImages[r.colors[i<5?0:1]],0,-6,37,84);}
    ctx.restore();
   }else{
   poly([[x,y],[x+34,y+dy*.92],[x+34,y+dy*.92+75],[x,y+75]],'#121621');
   poly([[x+3,y+5],[x+31,y+dy*.84+5],[x+31,y+dy*.84+66],[x+3,y+66]],'#d49a34');
   poly([[x+6,y+11],[x+28,y+dy*.65+11],[x+28,y+dy*.65+58],[x+6,y+58]],category[2]);
   poly([[x+8,y+14],[x+26,y+dy*.55+14],[x+26,y+dy*.55+52],[x+8,y+52]],category[0]);
   // Reconstruct the cabinet silhouette: straight black outer frame, raised
   // rectangular upper fascia and a deep, gold-rimmed opening below it.
   ctx.save();ctx.translate(x,y);ctx.transform(1,sy,0,1,0,0);ctx.scale(37/34,1);
   box(0,0,34,75,'#08090d');
   box(2,3,30,69,'#2b190e');box(3,4,28,67,category[2]);
   // The fascia is brightest at the centre and darker at both ends.
   const fascia=ctx.createLinearGradient(3,0,31,0);
   fascia.addColorStop(0,'#bd5c08');fascia.addColorStop(.22,'#f4b628');
   fascia.addColorStop(.5,'#fff4be');fascia.addColorStop(.78,'#f4b628');fascia.addColorStop(1,'#bd5c08');
   ctx.fillStyle=fascia;ctx.fillRect(3,4,28,12);
   box(8,6,18,6,'#f9eab6');box(10,7,14,4,'#101019');
   box(3,16,28,3,'#100d0b');
   // Face corners sit underneath the circular bezel.
   box(3,19,28,48,category[1]);
   // The rounded bezel is authored in the cabinet plane. The bank shear projects
   // it, the centre square, and the round markers together onto the same face.
   const centerY=42;
   const circleCenter=({gold:'#ffca29',red:'#ed3d25',green:'#3cbe5b'})[r.colors[i<5?0:1]];
   ctx.fillStyle=circleCenter;ctx.beginPath();ctx.ellipse(17,centerY,13,18,0,0,Math.PI*2);ctx.fill();
   ctx.save();ctx.beginPath();ctx.ellipse(17,centerY,13,18,0,0,Math.PI*2);ctx.clip();
   box(4,centerY-18,4,36,category[2]);box(26,centerY-18,4,36,category[2]);
   ctx.restore();
   // The square consists only of a grey field and a white triangle, with no outline.
   box(11,centerY-7.5,12,15,'#aeb5b3');
   poly([[11,centerY-7.5],[23,centerY-7.5],[23,centerY-2.5]],'#f8f8ec');
   ctx.fillStyle='#17130f';
   for(const [mx,my] of [[7,23],[27,23]]){ctx.beginPath();ctx.ellipse(mx,my,3.2,4,0,0,Math.PI*2);ctx.fill();}
   // The upper edge of the dark lower recess is longer than its lower edge.
   box(7,60,20,5,'#f6d265');
   poly([[9,60],[27,60],[24,64],[12,64]],'#130e09');
   const triangleColor=({gold:'#e4a72c',red:'#c93925',green:'#2c9c48'})[r.colors[i<5?0:1]];
   poly([[4,57],[4,65],[11,65]],triangleColor);
   poly([[30,57],[30,65],[23,65]],triangleColor);
   box(3,67,28,4,'#9b5519');box(4,67,26,1,'#ffe49b');
   ctx.restore();
   }
   const visitor=occupied.get(r.start)?.get(i);
   const floorOffset=usesCuboid(i)?25:0;
   // Move every seat along the row together, placing the seated face
   // opposite the center of its cabinet while keeping the seat line intact.
   const seatShift=dy>0?-10:10,seatX=x+seatShift,seatY=y+sy*seatShift;
   if(visitor){if(!(visitor==='woman'?womanImage:customerImage))drawRoundSeat(ctx,seatX+19,seatY+87+floorOffset);visitors.push({x:seatX,y:seatY+floorOffset,visitor,number:r.start+i,mirrored:dy<0});}
   else if(cabinetImages?.emptyStool){ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(cabinetImages.emptyStool,seatX+10,seatY+80+floorOffset,18,22);ctx.restore();}
   else drawRoundSeat(ctx,seatX+19,seatY+87+floorOffset);
  }
  // The mirrored banks' top face projects toward the opposite side; bring
  // their signs forward so they sit above the fronts instead of behind them.
  if(hasCuboid){ctx.save();ctx.translate(0,dy<0?8:-8);drawRowSign();ctx.restore();}
  // Cuboid sprites already provide their side face. The still-flat rows need
  // a plain dark side with the same depth, without a separate attachment.
  if(!fullCuboid){
   if(dy>0){const ex=r.x+n*width;poly([[ex,y2-6],[ex+18,y2-16],[ex+18,y2+68],[ex,y2+78]],'#201925');}
   else{const ex=r.x;poly([[ex,r.y-6],[ex-18,r.y-16],[ex-18,r.y+68],[ex,r.y+78]],'#201925');}
  }
 }
 // Back-to-front draw order keeps rows legible.
 for(const r of rows)bank(r);
 // Loose trays and a bin sit in the aisles, separate from machine artwork.
 function tray(x,y,color){
  poly([[x-10,y],[x+2,y-6],[x+13,y-1],[x+1,y+5]],'#275a79');
  poly([[x-10,y-5],[x+2,y-11],[x+13,y-6],[x+1,y]],color);
  poly([[x-10,y-5],[x+1,y],[x+1,y+6],[x-10,y+1]],'#719a46');
  poly([[x+1,y],[x+13,y-6],[x+13,y],[x+1,y+6]],'#5e8a42');
  poly([[x-5,y-5],[x+2,y-8],[x+8,y-5],[x+1,y-2]],'#e6ea8b');
 }
 function singleTrayPair(x,y){if(singleTraysImage){ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(singleTraysImage,x-22,y-18,44,22);ctx.restore();}else tray(x,y,'#c8e429');}
 function trayStack(image,x,y,count){ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';for(let i=0;i<count;i++)ctx.drawImage(image,x,y-i*4,47,31);ctx.restore();}
 if(singleColors?.green&&singleColors?.yellow){
  trayStack(singleColors.yellow,187,416,1);
  trayStack(singleColors.green,460,365,2);trayStack(singleColors.yellow,492,381,2);
  trayStack(singleColors.green,395,520,stackCounts.green);trayStack(singleColors.yellow,427,536,stackCounts.yellow);
  trayStack(singleColors.yellow,261,665,1);
 }
 else if(traysImage&&yellowTraysImage){ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(traysImage,395,520,47,31);ctx.drawImage(yellowTraysImage,427,536,47,31);ctx.restore();}
 else tray(432,568,'#bfdd29');
 if(!singleColors?.yellow)singleTrayPair(211,441);
 singleTrayPair(842,709);singleTrayPair(689,792);

 // Use the reviewed illustrations at occupied seats; never cover their hips.
 for(const {x,y,visitor,number,mirrored} of visitors){
  const image=visitor==='woman'?womanImage:customerImage;
  // Align the integrated stool's seat with the empty-stool center (x+19).
  if(image){ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';if(mirrored){ctx.translate(2*x+38,0);ctx.scale(-1,1);}ctx.drawImage(image,x+6,y+26,32,76);ctx.restore();}
 }
 // Informational sign is drawn as separate room furniture.
 if(informationImage){ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(informationImage,0,580,295,230);ctx.restore();}
 else{poly([[40,599],[265,707],[250,813],[25,708]],'#1a1b23');poly([[45,611],[252,710],[240,797],[37,700]],'#6c737a');poly([[49,616],[247,711],[236,786],[42,697]],'#172433');}
 if(ticketCount!==null){
  // Draw on the screen plane, using its actual parallelogram rather than a
  // rotated rectangular panel that crosses the display's frame.
  ctx.save();ctx.transform(1,0.54,-0.145,1,52,608);
  ctx.beginPath();ctx.rect(0,0,179,80);ctx.clip();ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle='#e6f7ff';ctx.font='bold 11px sans-serif';ctx.fillText('1F プレイ料金',89.5,22);
  ctx.fillStyle='#ffe289';ctx.font='bold 19px sans-serif';ctx.fillText(`${ticketCount}枚`,89.5,41);
  ctx.fillStyle='#e6f7ff';ctx.font='bold 10px sans-serif';ctx.fillText('1プレイにつき',89.5,60);
  ctx.restore();
 }
 if(!roomImage){plant(55,803);plant(956,801);}
}
export const HALL_SIZE={width:W,height:H};
