import {Container,Graphics,Sprite,Texture,VideoSource} from 'pixi.js';
import videoUrl from '../assets/video/serena-victory-01.mp4';

// The clip ends in victory: only show it after a long-reach win is revealed.
// It is silent so that the existing presentation sound remains authoritative.
export function createSerenaVictoryVideo(){
 const root=new Container();root.label='serena-victory-video';root.visible=false;
 const background=new Graphics().rect(0,0,210,140).fill(0x030714);root.addChild(background);
 const video=document.createElement('video');
 video.dataset.serenaVictoryVideo='';video.hidden=true;video.muted=true;video.playsInline=true;
 video.preload='auto';
 const source=new VideoSource({resource:video,autoLoad:false,autoPlay:false});
 const texture=new Texture({source});const sprite=new Sprite(texture);sprite.visible=false;
 sprite.y=(140-118.125)/2;root.addChild(sprite);
 let failed=false,pending=false,disposed=false,started=false,wanted=false;
 const onError=()=>{if(!disposed){failed=true;root.visible=false;}};
 const beginLoad=()=>{if(!disposed)source.load().catch(onError);};
 video.addEventListener('error',onError);video.addEventListener('loadedmetadata',beginLoad,{once:true});
 video.src=videoUrl;document.body.appendChild(video);
 const onVisibility=()=>{if(document.hidden)video.pause();};
 document.addEventListener('visibilitychange',onVisibility);
 function stop(){wanted=false;video.pause();started=false;root.visible=false;}
 return {root,render(game,paused=false,payout=false){
  const age=game?.previewWinAt===undefined?-1:game.time-game.previewWinAt;
  const active=game?.lastReachWasLong===true&&!game?.previewRushWin&&!game?.jackpot?.charge&&!game?.entryPrelude&&!payout&&age>=0&&age<5.05;
  if(!active||failed||disposed){stop();return false;}
  wanted=!paused&&!document.hidden;
  if(!source.isReady||video.readyState<2){root.visible=true;return false;}
  // The texture starts without metadata; sizing before the video dimensions
  // arrive magnifies the eventual frame far beyond the LCD.
  sprite.width=210;sprite.height=118.125;
  if(Math.abs(video.currentTime-age)>.25&&!video.seeking)video.currentTime=Math.max(0,Math.min(age,5));
  if(!wanted){video.pause();root.visible=true;sprite.visible=started;return started;}
  if(video.paused&&!pending){pending=true;video.play().then(()=>{pending=false;if(!disposed&&wanted)started=true;else video.pause();}).catch(()=>{pending=false;if(wanted&&!disposed){failed=true;root.visible=false;}});}
  root.visible=true;sprite.visible=started&&!video.paused;return sprite.visible;
 },isCovering(){return root.visible;},pause(){wanted=false;video.pause();},dispose(){disposed=true;stop();document.removeEventListener('visibilitychange',onVisibility);video.removeEventListener('error',onError);video.removeEventListener('loadedmetadata',beginLoad);video.remove();texture.destroy(true);}};
}
