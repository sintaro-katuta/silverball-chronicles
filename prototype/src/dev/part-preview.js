import {Machine} from '../legacy/scene.js';
import {createPartFlow} from '../physics/ball-flow.js';
const host=document.querySelector('#partCanvas'),find=id=>document.querySelector('#'+id);
let flow=createPartFlow(find('state').value),disposed=false;
host.textContent='PlayCanvasで部品を読み込んでいます…';
try{
 const machine=await Machine.create(document.createElement('div'),flow.physics);host.textContent='';machine.mount(host);
 function focus(){machine.focus(find('part').value,find('angle').value);
  if(find('part').value==='right'){
   // Widen the part-only view to include the upper inlet and lower discharge.
   const x=140,y=-68,oblique=find('angle').value!=='front',aspect=host.clientWidth/host.clientHeight;
   machine.camera.setPosition(x+(oblique?430:0),y+(oblique?130:0),900);machine.camera.lookAt(x,y,0);
   machine.camera.camera.orthoHeight=Math.max(285,115/aspect);machine.camera.camera.aspectRatio=aspect;
  }
  machine.app.renderNextFrame=true;
 }
 function readout(){const m=flow.physics.metrics,c=flow.counts;
  find('flowCounts').textContent=`発射 ${m.spawned} · 盤面 ${flow.physics.balls.length} · 右始動 ${c.rush} · アタッカー ${c.bonus} · ヘソ ${c.start} · 一般 ${c.normal} · OUT ${c.out} · 戻り ${c.returned}`;
  find('flowStatus').textContent=flow.paused?'一時停止中':flow.continuous?'連続発射中（最大10発/秒）':flow.pending?'発射口の空きを待機中':flow.physics.balls.length?'発射停止・残りの玉を観察中':'待機中';
  find('pauseFlow').textContent=flow.paused?'再開':'一時停止';
 }
 function render(){machine.render(flow.game);readout();}
 function reset(){flow=createPartFlow(find('state').value);machine.physics=flow.physics;render();focus();}
 const handlers={part:focus,angle:focus,state:reset,singleFlow:()=>flow.single(),continuousFlow:()=>flow.start(),stopFlow:()=>flow.stop(),resetFlow:reset,pauseFlow:()=>{flow.pause(!flow.paused);readout();}};
 for(const [id,callback]of Object.entries(handlers))find(id).addEventListener(['part','angle','state'].includes(id)?'change':'click',callback);
 const update=dt=>{if(disposed||document.hidden)return;flow.step(dt);render();};machine.app.on('update',update);
 const visibility=()=>{if(document.hidden)flow.pause(true);readout();};document.addEventListener('visibilitychange',visibility);
 const observer=new ResizeObserver(focus);observer.observe(host);render();focus();
 function dispose(){if(disposed)return;disposed=true;machine.app.off('update',update);observer.disconnect();document.removeEventListener('visibilitychange',visibility);for(const[id,callback]of Object.entries(handlers))find(id).removeEventListener(['part','angle','state'].includes(id)?'change':'click',callback);machine.dispose();}
 window.addEventListener('pagehide',dispose,{once:true});window.__partsReady=true;
 // Read-only diagnostics; all shots use the visible controls and Physics.spawn.
 window.__partsFlow=()=>({state:find('state').value,paused:flow.paused,continuous:flow.continuous,pending:flow.pending,time:flow.game.time,counts:{...flow.counts},metrics:{...flow.physics.metrics},balls:flow.physics.balls.map(({id,x,y,vx,vy})=>({id,x,y,vx,vy}))});
}catch(error){host.textContent='読み込みに失敗しました。ページを再読み込みしてください。';console.error(error);}
