// Original Moonshadow reliefs. Source-image coordinates locate the mouldings;
// the helmet, gauntlet, lunar seal and sheathed sword belong to this fictional machine.
export function paintLunarReliefs({c,poly,line,plate,at,portrait=null,background=null,includeSword=true,onlySword=false}){
 const steel='#a9c2d3',bright='#e0f1f3',shade='#496d8b',dark='#142b46',gold='#d8b76d';
 const ring=(x,y,r,col)=>poly(Array.from({length:64},(_,i)=>[x+Math.cos(i*Math.PI/32)*r,y+Math.sin(i*Math.PI/32)*r]),col);
 const clipped=(path,draw)=>{c.save();c.beginPath();path.map(at).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();draw();c.restore();};
 const upper=[[189,346],[224,301],[238,253],[285,202],[279,185],[391,174],[445,158],[544,165],[621,204],[685,267],[704,363],[558,367],[444,345],[322,369]];
 if(!onlySword){
 plate(upper,dark);
 clipped(upper,()=>{
  if(background){const [x,y]=at([189,158]),[x2,y2]=at([704,369]);c.drawImage(background,x,y,x2-x,y2-y);}
  if(portrait){const [x,y]=at([221,183]),[x2,y2]=at([438,366]);c.drawImage(portrait,x,y,x2-x,y2-y);}
 });
 }
 if(includeSword||onlySword){
  // Upward blade beside the character, rotating about its gripped handle.
  const point=(u,v)=>[426+u*.866+(v-10)*.5,324+u*.5-(v-10)*.866];
  const shape=(pts,col)=>poly(pts.map(([u,v])=>point(u,v)),col);
  const edge=(a,b,col,w)=>line(point(...a),point(...b),col,w);
  shape([[-11,-22],[0,-31],[11,-22],[10,-8],[-10,-8]],gold);
  shape([[-6,-20],[0,-25],[6,-20],[5,-13],[-5,-13]],bright);
  shape([[-8,-9],[8,-9],[9,36],[-9,36]],dark);
  for(let i=0;i<6;i++)edge([-7,-5+i*7],[7,1+i*7],gold,4);
  shape([[-49,29],[-31,39],[-12,35],[0,31],[12,35],[31,39],[49,29],[40,48],[17,48],[0,43],[-17,48],[-40,48]],'#071321');
  shape([[-46,28],[-31,35],[-13,31],[0,27],[13,31],[31,35],[46,28],[38,43],[17,43],[0,38],[-17,43],[-38,43]],gold);
  shape([[-14,46],[14,46],[13,205],[0,273],[-13,205]],'#071321');
  shape([[-11,44],[11,44],[10,204],[0,267],[-10,204]],steel);
  shape([[0,44],[9,44],[8,204],[0,267]],shade);
  shape([[-8,47],[-3,47],[-3,206],[0,247],[-8,203]],bright);
  edge([0,46],[0,250],gold,3);
  shape([[-9,35],[0,28],[9,35],[0,45]],bright);
  shape([[-5,35],[0,31],[5,35],[0,41]],'#3487b5');
 }
 if(onlySword)return;
 // Left: the model name is an inscription on four linked shield plates.
 const left=[[172,367],[196,389],[171,414],[199,440],[166,468],[195,494],[163,522],[184,551],[171,593],[199,632],[173,645],[142,583],[148,417]];
 plate(left,dark);
 clipped(left,()=>{
  line([157,389],[157,611],gold,5);
  for(let i=0;i<4;i++){const y=409+i*55;plate([[145,y-17],[175,y-23],[190,y-9],[182,y+26],[165,y+36],[144,y+24]],shade);line([148,y-12],[174,y-16],bright,3);}
  const [tx,ty]=at([151,430]);c.font='bold 40px DotGothic16';c.textAlign='left';
  for(const [i,ch]of [...'月影機関'].entries()){c.fillStyle='#071321';c.fillText(ch,tx+3,ty+i*82+4);c.fillStyle=bright;c.fillText(ch,tx,ty+i*82);}
 });
 // Right: pommel, wrapped grip, crescent guard, scabbard and metal chape.
 const right=[[708,370],[748,378],[771,480],[781,541],[765,582],[770,612],[714,629]];
 plate(right,dark);
 clipped(right,()=>{
  ring(735,395,17,gold);ring(735,395,11,bright);ring(740,390,10,dark);
  plate([[724,410],[746,410],[751,452],[728,452]],'#315879');
  for(let i=0;i<5;i++)line([728,414+i*7],[748,420+i*7],gold,3);
  poly([[710,451],[727,454],[739,463],[753,452],[767,447],[764,462],[740,480],[719,471]],gold);
  poly([[730,479],[750,479],[768,574],[750,618],[733,593]],shade);
  poly([[734,481],[742,482],[756,574],[748,607],[741,588]],steel);
  line([747,487],[760,574],gold,3);
  for(let i=0;i<3;i++){const y=505+i*26;line([736+i*3,y],[753+i*3,y+4],gold,5);}
  poly([[739,586],[761,580],[750,619]],gold);poly([[743,590],[754,587],[750,608]],bright);
 });
 // Lower right: an engraved seal clasp; it shares the sword's crescent vocabulary.
 plate([[699,674],[730,650],[755,660],[739,724],[720,742],[710,791],[688,805],[697,727]],shade);
 ring(721,691,20,gold);ring(721,691,15,dark);ring(719,690,11,bright);ring(725,686,10,dark);
 for(let i=0;i<3;i++)line([710,730+i*19],[723,718+i*19],gold,4);
}
