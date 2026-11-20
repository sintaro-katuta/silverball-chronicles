// Portrait hall: every carpet and bank uses the same isometric row slope.
export const MOBILE_HALL_SIZE={width:940,height:1672};
const PITCH=59.2, RISE=34.4, S=RISE/PITCH, SCALE=1.6;
const BANKS=[
 {x:130,y:305,dir:-1,start:1,count:5,colors:['gold','gold'],people:{2:'man'}},
 {x:535,y:350,dir:1,start:11,count:5,colors:['red','red'],people:{2:'man'}},
 {x:205,y:505,dir:1,start:21,count:5,colors:['green','green'],people:{0:'woman'}},
 {x:530,y:810,dir:-1,start:31,count:5,colors:['gold','gold'],people:{2:'man'}},
 {x:160,y:850,dir:1,start:41,count:5,colors:['red','red'],people:{2:'man'}},
 {x:495,y:1120,dir:-1,start:51,count:5,colors:['green','green'],people:{3:'woman'}},
 {x:275,y:1245,dir:1,start:61,count:5,colors:['gold','gold'],people:{1:'man'}}
];
export function drawMobileHall(ctx,images,counts={green:2,yellow:2},floorPrice=null){
 const {room,green,gold,red,man,woman,emptyStool,greenTray,yellowTray,information}=images;
 const width=940,height=1672;ctx.clearRect(0,0,width,height);if(room)ctx.drawImage(room,0,0,width,height);else{ctx.fillStyle='#073985';ctx.fillRect(0,0,width,height);}
 const poly=(points,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.fill();};
 // Draw carpets as sheared rectangles: their long edges have exactly the same
 // rise/run as the corresponding bank, not an independently estimated angle.
 for(const bank of BANKS){
  const slope=bank.dir*S, length=bank.count*PITCH+42;
  ctx.save();ctx.translate(bank.x-20,bank.y+216);ctx.transform(1,slope,-1/slope,1,0,0);
  ctx.fillStyle='#05aaf4';ctx.fillRect(0,0,length,38);ctx.beginPath();ctx.rect(0,0,length,38);ctx.clip();
  ctx.fillStyle='#0784c5';for(let y=5;y<38;y+=9)for(let x=5;x<length;x+=11){ctx.beginPath();ctx.ellipse(x+(Math.floor(y/9)%2)*5,y,2,1.5,0,0,Math.PI*2);ctx.fill();}ctx.restore();
 }
 for(const bank of BANKS){
  const slope=bank.dir*S;
  for(let j=0;j<bank.count;j++){
   const i=bank.dir<0?bank.count-1-j:j,x=bank.x+i*PITCH,y=bank.y+i*bank.dir*RISE;
   const color=bank.colors[i<5?0:1],sprite={green,gold,red}[color];
   if(sprite){ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';if(bank.dir<0){ctx.translate(2*x+PITCH,0);ctx.scale(-1,1);}ctx.translate(x,y-27.2);ctx.transform(1,-0.004,0,1,0,0);ctx.drawImage(sprite,0,0,88,192);ctx.restore();}
   const shift=bank.dir>0?-16:16,seatX=x+shift,seatY=y+slope*shift,person=bank.people[i];
   if(person){const image=person==='woman'?woman:man;if(image){ctx.save();ctx.imageSmoothingEnabled=true;if(bank.dir<0){ctx.translate(2*seatX+60.8,0);ctx.scale(-1,1);}ctx.drawImage(image,seatX+9.6,seatY+81.6,51.2,121.6);ctx.restore();}}
   else if(emptyStool){ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(emptyStool,seatX+16,seatY+168,28.8,35.2);ctx.restore();}
  }
  ctx.save();ctx.translate(bank.x,bank.y);ctx.transform(1,slope,0,1,0,0);
  const signOffset=bank.dir<0?23*SCALE:-8*SCALE,signWidth=bank.count*PITCH-11;
  ctx.fillStyle='#343942';ctx.fillRect(3,-31*SCALE+signOffset,signWidth,27*SCALE);
  ctx.fillStyle='#f9f9fa';ctx.fillRect(6,-29*SCALE+signOffset,signWidth-6,21*SCALE);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 20px sans-serif';ctx.fillStyle='#71528d';ctx.fillText(bank.start===1?'月影機関':'準備中',PITCH*bank.count/2,-18.5*SCALE+signOffset);ctx.restore();
 }
 function tray(image,x,y,count){if(!image)return;ctx.save();ctx.imageSmoothingEnabled=true;for(let i=0;i<count;i++)ctx.drawImage(image,x,y-i*6,52,34);ctx.restore();}
 tray(greenTray,347,710,counts.green);tray(yellowTray,396,738,counts.yellow);tray(yellowTray,250,1065,1);tray(greenTray,600,1220,1);tray(yellowTray,646,1246,1);
 if(information){ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(information,20,1375,330,255);ctx.restore();
  if(floorPrice!==null){ctx.save();ctx.transform(1,.54,-.145,1,78,1406);ctx.beginPath();ctx.rect(0,0,200,90);ctx.clip();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#e6f7ff';ctx.font='bold 12px sans-serif';ctx.fillText('1F プレイ料金',100,24);ctx.fillStyle='#ffe289';ctx.font='bold 22px sans-serif';ctx.fillText(`${floorPrice}枚`,100,46);ctx.fillStyle='#e6f7ff';ctx.font='bold 11px sans-serif';ctx.fillText('1プレイにつき',100,67);ctx.restore();}}
}
