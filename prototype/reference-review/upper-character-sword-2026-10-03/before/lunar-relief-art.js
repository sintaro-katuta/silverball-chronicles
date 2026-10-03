// Original Moonshadow reliefs. Source-image coordinates locate the mouldings;
// the helmet, gauntlet, lunar seal and sheathed sword belong to this fictional machine.
export function paintLunarReliefs({c,poly,line,plate,at}){
 const steel='#a9c2d3',bright='#e0f1f3',shade='#496d8b',dark='#142b46',gold='#d8b76d';
 const ring=(x,y,r,col)=>poly(Array.from({length:64},(_,i)=>[x+Math.cos(i*Math.PI/32)*r,y+Math.sin(i*Math.PI/32)*r]),col);
 const clipped=(path,draw)=>{c.save();c.beginPath();path.map(at).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();draw();c.restore();};
 const upper=[[189,346],[224,301],[238,253],[285,202],[279,185],[391,174],[445,158],[544,165],[621,204],[685,267],[704,363],[558,367],[444,345],[322,369]];
 plate(upper,dark);
 clipped(upper,()=>{
  // A fan of engraved moon-phase arcs is the recessed architectural backing.
  for(let i=0;i<6;i++)line([397+i*18,184],[414+i*29,341],i%2?'#28445f':'#35526b',3);
  // Left: a knight's helmet in three-quarter profile, crescent crest and dark visor.
  plate([[220,328],[243,253],[271,213],[321,186],[363,194],[399,230],[407,277],[384,322],[351,355],[287,360]],shade);
  poly([[243,267],[275,222],[324,201],[352,207],[326,267],[289,288]],bright);
  poly([[352,207],[382,236],[391,272],[363,280],[326,267]],steel);
  poly([[251,281],[324,267],[365,280],[393,273],[383,299],[348,319],[268,322]],'#07121f');
  line([259,284],[325,275],gold,5);line([327,275],[362,286],gold,5);
  poly([[267,326],[347,324],[374,310],[350,347],[293,350]],steel);
  poly([[325,280],[338,291],[331,337],[315,344],[309,298]],bright);
  for(let i=0;i<4;i++)line([278+i*9,329],[283+i*9,343],dark,4);
  poly([[303,202],[319,178],[349,168],[373,178],[349,183],[329,205]],gold);
  poly([[310,202],[329,185],[349,181],[336,190],[323,210]],'#fff0b4');
  line([250,270],[274,233],'#ffffff',3);
  // Right: a foreshortened armoured hand holding the lunar seal.
  plate([[525,214],[573,190],[624,218],[677,274],[695,332],[662,359],[577,355],[530,316]],shade);
  poly([[586,209],[625,231],[666,276],[650,323],[605,336],[568,310]],steel);
  poly([[655,279],[681,302],[687,331],[659,345],[639,327]],dark);
  for(const [x,y] of [[532,212],[568,216],[604,231],[639,255]]){
   plate([[x-13,y+8],[x-10,y-12],[x+7,y-21],[x+22,y-10],[x+25,y+27],[x+15,y+52],[x-10,y+45]],steel);
   poly([[x-6,y-7],[x+5,y-13],[x+15,y-6],[x+13,y+15],[x-4,y+17]],bright);
   line([x-6,y+24],[x+17,y+28],dark,4);line([x-5,y+36],[x+14,y+40],shade,3);
  }
  // The ring is held, rather than floating between unrelated armour plates.
  ring(471,282,62,'#071321');ring(469,278,60,gold);ring(469,278,53,shade);ring(469,278,46,dark);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;line([469+Math.cos(a)*49,278+Math.sin(a)*49],[469+Math.cos(a)*54,278+Math.sin(a)*54],'#fff0b4',3);}
  ring(467,277,35,bright);ring(479,265,30,dark);
  poly([[430,326],[458,317],[483,331],[514,319],[527,336],[500,350],[467,343],[439,347]],steel);
  plate([[515,279],[539,273],[556,290],[549,307],[524,319],[503,311],[499,297]],shade);
  poly([[516,285],[537,281],[545,291],[525,302],[508,301]],bright);
 });
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
