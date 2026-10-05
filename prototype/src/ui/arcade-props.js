// All props use the room's native pixel grid, shallow elevated view and upper-left light.
export function paintArcadeProps(c,w){
 const r=(x,y,a,b,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),a,b);};
 const ink='#756b8c',cream='#fff2d9',shadow='#a4c2cb';
 const bear=(x,y,col,bunny=false)=>{
  r(x+1,y,3,bunny?5:3,ink);r(x+7,y,3,bunny?5:3,ink);r(x+2,y,1,bunny?4:2,col);r(x+8,y,1,bunny?4:2,col);
  y+=bunny?3:1;r(x+1,y+2,9,7,ink);r(x,y+3,11,4,ink);r(x+1,y+3,9,4,col);r(x+2,y+2,7,1,cream);
  r(x+2,y+4,1,1,ink);r(x+8,y+4,1,1,ink);r(x+4,y+5,3,2,cream);r(x+5,y+5,1,1,ink);
  r(x+2,y+8,7,6,ink);r(x+2,y+8,6,5,col);r(x+4,y+9,3,3,cream);r(x,y+9,2,3,col);r(x+9,y+9,2,3,col);r(x+1,y+13,4,2,col);r(x+7,y+13,4,2,col);
 };
 const sx=8,cx=Math.round(w/2-16),gx=w-34,y=7;
 // Prize rack: top, backboard, shelf surface, front fascia, and grounded feet.
 r(sx+2,y+31,28,3,shadow);r(sx,y+2,28,29,ink);r(sx+2,y,24,3,'#f2bad0');r(sx+1,y+3,26,25,'#e8c5c3');r(sx+2,y+3,24,1,cream);
 bear(sx+3,y+7,'#e8b86e');bear(sx+15,y+4,'#d7b6df',true);r(sx,y+24,28,3,'#bd86aa');r(sx+1,y+24,26,1,cream);
 r(sx+2,y+28,24,3,'#dca4bd');r(sx+3,y+31,3,2,ink);r(sx+23,y+31,3,2,ink);
 // Claw cabinet with a visible roof, glass enclosure and a sloping control deck.
 r(cx+3,y+34,31,3,shadow);r(cx,y+3,32,31,ink);r(cx+2,y,28,4,'#f9d3da');r(cx+3,y,26,1,cream);r(cx+1,y+4,30,4,'#e892b4');r(cx+3,y+8,26,17,'#a9d9db');
 r(cx+3,y+8,3,16,'#8db9ce');r(cx+6,y+21,23,4,'#d7e8d8');bear(cx+7,y+12,'#f0c876');bear(cx+18,y+12,'#b8a5d3');
 r(cx+2,y+24,28,4,'#ffe5c9');r(cx+1,y+28,30,6,'#e7a5c1');r(cx+5,y+29,12,4,ink);r(cx+7,y+30,8,2,'#4e5878');r(cx+24,y+26,3,1,'#df849d');r(cx+22,y+25,1,2,ink);
 r(cx+16,y+8,1,5,ink);r(cx+13,y+13,7,1,cream);r(cx+12,y+14,1,3,ink);r(cx+20,y+14,1,3,ink);r(cx+4,y+9,1,12,'#f0ffed');r(cx+6,y+9,2,3,'#f0ffed');r(cx+29,y+9,1,14,'#7db2c6');
 // Capsule machines: roof, recessed clear bin and a projecting turning handle.
 for(let i=0;i<2;i++){const x=gx+i*13,col=i?'#74bbca':'#e895b4';r(x+2,y+32,12,3,shadow);r(x,y+13,12,19,ink);r(x+2,y+11,8,2,cream);r(x+1,y+13,10,18,col);r(x+2,y+14,8,8,'#e9f3e8');r(x+2,y+14,8,1,'#fff');for(const [dx,dy,co]of [[3,17,'#edba68'],[6,16,'#b298d0'],[7,19,'#75b9c7'],[3,20,'#e39ab4']])r(x+dx,y+dy,2,2,co);r(x+4,y+24,5,3,cream);r(x+6,y+24,1,3,ink);r(x+3,y+29,6,2,ink);}
}
