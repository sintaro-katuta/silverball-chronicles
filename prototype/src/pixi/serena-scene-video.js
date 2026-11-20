import {Container,Graphics,Sprite,Texture,VideoSource} from 'pixi.js';
import idle from '../assets/video/serena-idle.mp4';
import warning from '../assets/video/serena-warning.mp4';
import battle from '../assets/video/serena-battle.mp4';
import defeat from '../assets/video/serena-defeat.mp4';
import revival from '../assets/video/serena-revival.mp4';
import bonus from '../assets/video/serena-bonus-extended.mp4';
import charge from '../assets/video/serena-charge.mp4';
import rushEntry from '../assets/video/serena-rush-entry.mp4';
import rushLoop from '../assets/video/serena-rush-loop.mp4';
import rushEnd from '../assets/video/serena-rush-end.mp4';
import {serenaScenePlan} from './serena-scene-plan.js';

const urls={idle,warning,battle,defeat,revival,bonus,charge,'rush-entry':rushEntry,'rush-loop':rushLoop,'rush-end':rushEnd};

// Only the active clip owns a Pixi texture; selected videos may preload. Playback is muted like the existing
// victory video; the game's sound and its mute control remain authoritative.
export function createSerenaSceneVideo(){
 const root=new Container();root.label='serena-scene-video';root.visible=false;
 root.addChild(new Graphics().rect(0,0,210,140).fill(0x030714));
 let current=null,disposed=false;
 const failed=new Set();
 const staged=new Map();
 function prepare(clip){
  if(staged.has(clip)||failed.has(clip)||disposed)return;
  const video=document.createElement('video');video.dataset.serenaScenePreload=clip;
  video.hidden=true;video.muted=true;video.playsInline=true;video.preload='auto';video.src=urls[clip];
  document.body.appendChild(video);staged.set(clip,video);
 }
 function disposeCurrent(){
  if(!current)return;
  const old=current;current=null;old.disposed=true;old.video.removeEventListener('loadedmetadata',old.beginLoad);old.video.removeEventListener('error',old.onError);old.video.pause();
  root.removeChild(old.sprite);old.video.remove();old.texture.destroy(true);
 }
 function switchTo(clip){
  disposeCurrent();root.visible=false;
  if(!clip||failed.has(clip)||disposed)return;
  // Both possible outcomes are prepared irrespective of the stored result, so
  // loading never discloses whether the player won before the decision.
  if(clip==='warning'||clip==='battle'){prepare('defeat');prepare('revival');}
  if(clip==='warning'||clip==='idle'||clip==='rush-loop')prepare('battle');
  if(clip==='idle'){prepare('warning');prepare('charge');prepare('bonus');}
  if(clip==='rush-loop'){prepare('warning');prepare('rush-end');}
  if(clip==='bonus'||clip==='charge')prepare('rush-entry');
  const prepared=staged.has(clip),video=staged.get(clip)??document.createElement('video');staged.delete(clip);
  delete video.dataset.serenaScenePreload;video.dataset.serenaSceneVideo=clip;
  video.hidden=true;video.muted=true;video.playsInline=true;if(!video.isConnected)video.preload='none';
  if(!video.getAttribute('src'))video.src=urls[clip];if(!video.isConnected)document.body.appendChild(video);
  const source=new VideoSource({resource:video,autoLoad:false,autoPlay:false});
  const texture=new Texture({source}),sprite=new Sprite(texture);sprite.y=(140-118.125)/2;sprite.visible=false;root.addChild(sprite);
  const state={clip,video,source,texture,sprite,pending:false,started:false,disposed:false,wanted:false};current=state;
  state.onError=()=>{if(!state.disposed){failed.add(clip);root.visible=false;}};
  state.beginLoad=()=>{if(!state.disposed)source.load().catch(state.onError);};
  video.addEventListener('error',state.onError);
  // Do not restart a staged request that is still fetching its metadata.
  if(prepared&&video.readyState===0&&!video.error)video.addEventListener('loadedmetadata',state.beginLoad,{once:true});
  else state.beginLoad();
 }
 const onVisibility=()=>{if(document.hidden)current?.video.pause();};
 document.addEventListener('visibilitychange',onVisibility);
 return {
  root,
  render(game,paused=false,payout=false){
   const plan=serenaScenePlan(game,{payout});
   if(plan?.clip!==current?.clip)switchTo(plan?.clip);
   const s=current;
   if(!plan||!s||failed.has(plan.clip)||disposed){root.visible=false;return null;}
   const {video,sprite}=s;
   // A neutral backing prevents the previous pixel-art scene flashing through
   // while a new movie is loading. Failed loads still fall back normally.
   if(!s.source.isReady||video.readyState<2||!Number.isFinite(video.duration)||video.duration<=0){root.visible=true;return null;}
   sprite.width=210;sprite.height=118.125;
   const age=Math.max(0,plan.age),target=plan.loop?age%video.duration:Math.min(age,Math.max(0,video.duration-.08));
   const finished=!plan.loop&&age>=Math.max(0,video.duration-.08);
   if(!video.seeking&&(Math.abs(video.currentTime-target)>(finished?.04:.3)||video.ended))video.currentTime=target;
   const wanted=!paused&&!document.hidden&&!finished;s.wanted=wanted;
   if(!wanted){
    video.pause();
    // A late-entered clip may reach its held frame without ever calling play().
    if(finished&&!video.seeking&&Math.abs(video.currentTime-target)<.1)s.started=true;
    root.visible=true;sprite.visible=s.started;return s.started?plan.clip:null;
   }
   if(video.paused&&!s.pending){s.pending=true;video.play().then(()=>{s.pending=false;if(!s.disposed&&current===s&&s.wanted&&!document.hidden)s.started=true;else video.pause();}).catch(()=>{s.pending=false;if(!s.disposed&&s.wanted){failed.add(s.clip);root.visible=false;}});}
   root.visible=true;sprite.visible=s.started&&!video.paused;return sprite.visible?plan.clip:null;
  },
  isCovering(){return root.visible;},
  pause(){if(current){current.wanted=false;current.video.pause();}},
  dispose(){disposed=true;document.removeEventListener('visibilitychange',onVisibility);disposeCurrent();for(const video of staged.values()){video.pause();video.removeAttribute('src');video.load();video.remove();}staged.clear();root.visible=false;}
 };
}
