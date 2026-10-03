import {entryTitleAt} from './entry-title-schedule.js';
import {REVIVAL_ENTRY,revivalPhase} from './revival-entry-motion.js';
import {createRushEntryView} from './rush-entry-view.js';
import {createResultSlashPainter,resultSlashPose} from './result-slash-view.js';
import {createContinuousEntryPainters} from './entry-continuous-view.js';
import {createCastleEntryPainter} from './castle-entry-view.js';
import {Container,Sprite,Texture,Graphics} from 'pixi.js';
import {pixelSurface} from './pixel-primitives.js';
import {preludePose,preludeArtPose} from './rush-prelude-motion.js';
import {createDirectionCutin} from './direction-cutin.js';

// Each variant owns six newly illustrated shots. No background extraction or tinting.
export function createRushPreludeView(sheets,rushScene){
 const root=new Container(),canvas=pixelSurface(210,140,()=>{}),texture=Texture.from(canvas);
 texture.source.scaleMode='nearest';root.addChild(new Sprite(texture));
 const castle=createCastleEntryPainter(sheets.castle),continuous=createContinuousEntryPainters(sheets);
 const left=createDirectionCutin();root.addChild(left.root);
 const sceneTitle=createRushEntryView(),gapMask=new Graphics();root.addChild(sceneTitle.root,gapMask);sceneTitle.root.mask=gapMask;
 let previous='',sequence=null;
 function resultArt(c,payout){
  c.fillStyle='#080e20';c.fillRect(0,0,210,140);c.textAlign='center';c.textBaseline='middle';
  for(const [s,y,size,col]of [['RESULT',35,30,'#d9e8f0'],['合計払出',73,14,'#9fb5c4'],[String(payout),104,32,'#f0d394']]){c.font=`${size}px "DotGothic16"`;c.fillStyle=col;c.fillText(s,105,y);}
 }
 const slash=createResultSlashPainter(rushScene,resultArt);
 return {root,textures:[texture,...left.textures,...sceneTitle.textures],render(game){
  const p=preludePose(game.time,game.entryPrelude);root.visible=p.visible;if(!p.visible){sceneTitle.render(game.time,false);return;}
  const key=`${game.entryPrelude.startedAt}:${Math.floor(p.age*60)}`;if(previous===key)return;previous=key;
  if(sequence!==game.entryPrelude){sequence=game.entryPrelude;left.announce('left',sequence.startedAt+REVIVAL_ENTRY.leftAt);}
  left.root.visible=false;const titleAt=entryTitleAt(p.variant);sceneTitle.render(game.time,titleAt!==null&&p.age>=titleAt);gapMask.clear();
  if(p.variant==='slash'){const {offset}=resultSlashPose(p.age);gapMask.poly([210-offset,0,210+offset,0,offset,140,-offset,140]).fill(0xffffff);}else if(titleAt!==null){gapMask.rect(0,0,210,140).fill(0xffffff);}
  const c=canvas.getContext('2d');c.clearRect(0,0,210,140);c.imageSmoothingEnabled=false;
  const black=()=>{c.fillStyle='#000';c.fillRect(0,0,210,140);};
  const shot=preludeArtPose(p.age,p.variant);
  if(p.variant==='castle'){castle(c,p.age);}
  else if(p.variant==='slash'){slash(c,p.age,p.payout);}
  else if(shot.age<0){
   if(revivalPhase(p.age)==='blackout')black();
   else if(revivalPhase(p.age)==='result')resultArt(c,p.payout);
   else left.render('left',game.time);
  }else{continuous[p.variant](c,shot.age);
  }
  if(p.variant!=='slash'&&titleAt!==null&&p.age>=titleAt){c.fillStyle=`rgba(2,5,20,${Math.min(.26,(p.age-titleAt)*1.3)})`;c.fillRect(0,0,210,140);}
  texture.source.update();
 }};
}
