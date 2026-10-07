import {decisionPushPose} from './decision-push.js';
import './decision-push.css';

// A native button projected onto the actual LCD, across all three camera views.
// Native click includes touch and Enter/Space; no duplicate pointer handlers.
export function createDecisionPushOverlay({host,app,getView,getGame,isPaused,press,onPress=()=>{}}){
 host.classList.add('decision-push-host');
 const button=document.createElement('button');button.type='button';button.className='decision-push-button';button.hidden=true;
 button.setAttribute('aria-label','押せ：演出の結果を見る');button.innerHTML='<span>押せ</span><small aria-hidden="true"></small>';
 const countdown=button.querySelector('small');host.append(button);
 const click=()=>{if(press()){button.hidden=true;onPress();}};button.addEventListener('click',click);
 return {update(){
  const game=getGame(),pose=decisionPushPose(game,{paused:isPaused()}),view=getView();
  button.hidden=!pose.visible||!view;if(button.hidden)return;
  button.disabled=!pose.enabled;button.classList.toggle('reduced',!!game.reducedEffects);
  countdown.textContent=`残り ${pose.remaining.toFixed(1)} 秒`;
  // A render-time game clock drives the lens; CSS animation cannot run on pause.
  button.style.setProperty('--push-light',game.reducedEffects?'.7':String(.45+.45*(.5+.5*Math.cos((game.presentation.time-46.5)*Math.PI*4))));
  const p=view.toGlobal({x:105,y:105}),edge=view.toGlobal({x:143,y:105}),canvas=app.canvas.getBoundingClientRect(),box=host.getBoundingClientRect();
  const width=Math.max(64,Math.min(130,Math.abs(edge.x-p.x)*2*canvas.width/app.screen.width));
  button.style.left=`${canvas.left-box.left+p.x*canvas.width/app.screen.width}px`;button.style.top=`${canvas.top-box.top+p.y*canvas.height/app.screen.height}px`;
  button.style.width=`${width}px`;button.style.fontSize=`${Math.max(18,Math.min(28,width/4.5))}px`;
 },destroy(){button.removeEventListener('click',click);button.remove();host.classList.remove('decision-push-host');}};
}
