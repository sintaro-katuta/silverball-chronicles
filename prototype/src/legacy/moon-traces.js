// Admission provenance is a display-only identity. It never examines a draw's outcome.
export const ORIGIN_LABELS={start:'始動入賞',rush:'右始動入賞',normal:'一般入賞からの追加保留',opening:'開幕保留',debug:'試演'};
export function originSymbol(origin){return origin?.mark==='echo'?'⋈':origin?.mark==='gold'?'◇':origin?.mark==='large'?'⬡':'☾';}
export function tracePoint(a,b,u){const t=Math.max(0,Math.min(1,u)),control={x:(a.x+b.x)/2+(b.y<a.y?-34:34),y:Math.min(a.y,b.y)-38};return {x:(1-t)**2*a.x+2*(1-t)*t*control.x+t*t*b.x,y:(1-t)**2*a.y+2*(1-t)*t*control.y+t*t*b.y};}
export function mountMoonTraces(board,lcd,physics,view){
 const doc=board.ownerDocument,canvas=doc.createElement('canvas'),badge=doc.createElement('span');
 canvas.className='moon-trace-canvas';canvas.setAttribute('aria-hidden','true');canvas.width=view.width*2;canvas.height=view.height*2;board.append(canvas);
 badge.className='moon-origin';badge.hidden=true;lcd.append(badge);
 const c=canvas.getContext('2d'),holds=lcd.querySelector('#holds');let owner=null,traces=[],seenDraw=null,seenPresentation=null,previousHolds=[];
 function point(element){const a=element.getBoundingClientRect(),b=board.getBoundingClientRect();return {x:(a.left+a.width/2-b.left)/b.width*view.width,y:(a.top+a.height/2-b.top)/b.height*view.height};}
 function originPoint(origin){const pocket=physics.pockets.find(p=>p.kind===origin?.kind&&(origin.pocketId==null||p.id===origin.pocketId))||physics.pockets.find(p=>p.kind===origin?.kind);if(Number.isFinite(origin?.x)&&Number.isFinite(origin?.y))return {x:origin.x+view.boardOffset.x,y:origin.y+view.boardOffset.y};if(pocket)return {x:pocket.x+view.boardOffset.x,y:pocket.y+view.boardOffset.y};return null;}
 function observe(game){if(owner!==game){owner=game;traces=[];seenDraw=seenPresentation=null;previousHolds=[];}}
 function receive(event,game){observe(game);if(event.type!=='drawQueued')return;const start=originPoint(event.origin);if(!start)return;traces.push({id:event.drawId,origin:event.origin,start,at:game.time,kind:'arrival'});if(traces.length>12)traces.shift();}
 function update(game){observe(game);c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,view.width,view.height);
  const current=game.presentation||(game.spinActive?game.activeDraw:null);const currentId=game.presentation?game.presentation.drawId:current?.id;
  const records=game.acceptedDraws||[];
  [...holds.children].forEach((dot,index)=>{const r=records[index];dot.dataset.origin=r?.origin?.mark||'';dot.dataset.source=r?.source||'';dot.title=r?`${ORIGIN_LABELS[r.origin?.kind]||'保留'}${r.origin?.mark==='echo'?'・追加玉':''}`:'';});
  badge.hidden=!current||!!game.jackpot||game.phase==='result';if(current){badge.textContent=originSymbol(current.origin);badge.dataset.drawId=currentId??'';badge.title=ORIGIN_LABELS[current.origin?.kind]||'今回の変動';badge.setAttribute('aria-label',badge.title);}
  if(currentId!=null&&currentId!==seenDraw){const index=previousHolds.indexOf(currentId),dot=holds.children[index];if(dot)traces.push({start:point(dot),at:game.time,kind:'consume',id:currentId});seenDraw=currentId;}
  previousHolds=records.map(r=>r.id);
  if(game.phase==='result'){traces=[];return;}
  if(game.presentation&&game.presentation.id!==seenPresentation){seenPresentation=game.presentation.id;if(!game.presentation.demo)traces.push({start:point(badge),at:game.time,kind:'weapon',id:currentId});}
  traces=traces.filter(t=>game.time-t.at<1.25);
  for(const trace of traces){const age=game.time-trace.at;let end;
   if(trace.kind==='weapon'){const b=board.getBoundingClientRect(),r=lcd.getBoundingClientRect();end={x:(r.left+r.width*.46-b.left)/b.width*view.width,y:(r.top+r.height*.60-b.top)/b.height*view.height};}
   else if(currentId===trace.id&&!badge.hidden)end=point(badge);
   else {const i=records.findIndex(r=>r.id===trace.id);if(i<0)continue;end=point(holds.children[i]);}
   const u=Math.min(1,age/.8),head=tracePoint(trace.start,end,u),fade=Math.min(1,age/.06)*Math.max(0,1-(age-.8)/.45);
   c.save();c.strokeStyle=`rgba(160,226,255,${fade*.55})`;c.lineWidth=1.4;c.shadowColor='#64cfff';c.shadowBlur=9;c.beginPath();
   for(let i=0;i<13;i++){const v=Math.max(0,u-.20+i*.20/12),p=tracePoint(trace.start,end,v);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.stroke();
   c.fillStyle=`rgba(236,252,255,${fade})`;c.beginPath();c.arc(head.x,head.y,2.8,0,Math.PI*2);c.fill();
   if(age>.8){c.lineWidth=1;c.beginPath();c.arc(end.x,end.y,4+(age-.8)*28,0,Math.PI*2);c.stroke();}c.restore();
  }
 }
 return {receive,update,dispose(){traces=[];canvas.remove();badge.remove();},diagnostics(){return {active:traces.length,current:seenDraw,segments:traces.map(t=>({id:t.id,kind:t.kind})),origins:[...holds.children].map(x=>x.dataset.source)};}};
}
