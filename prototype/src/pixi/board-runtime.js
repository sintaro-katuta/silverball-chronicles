import {hesoTrayShapes} from './heso-guide.js';
import {createAdmissionFeedback} from './admission-feedback.js';
import {loadBoardAssets} from './board-asset-loader.js';
import {presentationResolution,smoothTexture} from './presentation-quality.js';
import {createRushDirectionGuide} from './rush-direction-guide.js';
import {attentionCamera} from './long-reach-timeline.js';
import {createRushPreludeView} from './rush-prelude-view.js';
import {createEclipseMechanism} from './eclipse-mechanism.js';
import {RUSH_END_SECONDS,rushEndPose} from './rush-end-motion.js';
import {createDirectionCutin} from './direction-cutin.js';
import {paintRightResinRoute,paintRightRouteFront,projectRightRoute} from './right-resin-route.js';
import {createPresentationSound} from './se/presentation-sound.js';
import {createBonusRoundView} from './bonus-round-view.js';
import {attachNormalSpin} from './normal-spin-flow.js';
import {createNormalSpinView} from './normal-spin-view.js';
import {createDecisionPushOverlay} from './decision-push-overlay.js';
import {FUZU_START_SOURCE,sourcePoint} from './source-layout.js';
import {Application,Container,Sprite,Texture,Rectangle,Graphics} from 'pixi.js';
import {createCabinetLightView} from './cabinet-light-view.js';
import {createCabinetDecor} from './cabinet-decor.js';
import {createBoardTrim} from './board-trim.js';
import {traceBoardSilhouette} from './board-silhouette.js';
import {PLAYFIELD_APERTURE,OUTER_ARC,LAUNCH_RAIL_CORE_WIDTH} from './board-rails.js';
import {LCD_BEVEL_Y,LCD_OPENING} from './lcd-layout.js';
import {createLcdView,LCD_LAYOUT} from './lcd-view.js';
import {createBoardFlow} from './board-flow.js';
import {AttackerView} from './attacker-view.js';
import {RightStartView} from './right-start-view.js';
import {createSilverBallTexture} from './silver-ball.js';
import {createPinTexture} from './pin-texture.js';
import {paintResinGuide} from './resin-guide-art.js';
import {pixelSurface,painter} from './pixel-primitives.js';
import {startFrameLoop} from '../runtime/frame-loop.js';
import {ORDINARY_POCKET_SIZE,POCKET_ANCHOR_Y,POCKET_FRONT_CUT} from './ordinary-pocket-geometry.js';
import {createIntroCamera,createViewCameras,FRAME_PLACEMENT} from './intro-camera.js';
import '@fontsource/dotgothic16/japanese-400.css';
import '@fontsource/dotgothic16/latin-400.css';

export async function mountBoard(host,{production=false,sound=null,sessionGame=null,unit=null,onUpdate=()=>{},reviewHook=null,onLoadProgress=()=>{},isCancelled=()=>false,intro=false,onIntroState=()=>{},launchInterval=.6}={}){
const settings=production?{lcd:'true',spin:'true',reach:'true',rounds:'true',lifecycle:'true',se:'true'}:document.body.dataset;
const lcdEnabled=settings.lcd==='true',spinEnabled=settings.spin==='true';
const [art]=await Promise.all([
 loadBoardAssets({lcd:lcdEnabled,spin:spinEnabled,production},onLoadProgress),
 document.fonts.load('24px DotGothic16')
]);
if(isCancelled())return {dispose(){sound?.dispose();}};
const {central,normal,tulipAtlas,frameTexture=null,lcdTexture=null,entrySheets,storySheets,rushScene=null,reachAtlas=null,reachMotionAtlas=null,reachLandscape=null,cloudSky=null,hairAtlas=null,hairUnderlay=null}=art;
const cabinetPortrait=art.cabinetPortrait?.source.resource??null,cabinetBackground=art.cabinetBackground?.source.resource??null;
for(const t of [central,normal,tulipAtlas,frameTexture])if(t)t.source.scaleMode='nearest';
for(const t of [lcdTexture,rushScene,reachAtlas,reachMotionAtlas,reachLandscape,cloudSky,hairAtlas,hairUnderlay,...Object.values(storySheets??{})])if(t)smoothTexture(t);
const detached=new Map();const el=id=>host.querySelector('#'+id)??(detached.has(id)?detached.get(id):(detached.set(id,document.createElement('span')),detached.get(id))),app=new Application();await app.init({width:production?396:420,height:production?436:lcdEnabled?480:560,resolution:production?presentationResolution(396,436,el('canvas').clientWidth,window.devicePixelRatio):1,autoDensity:true,antialias:production,roundPixels:false,autoStart:false,background:0x060d1a,preference:'webgl'});if(isCancelled()){app.destroy(true,{children:true});sound?.dispose();return {dispose(){}};}el('canvas').append(app.canvas);app.canvas.style.width='100%';app.canvas.style.height='100%';if(production)app.canvas.style.imageRendering='auto';
// Keep logical coordinates fixed; autoDensity resize overwrites canvas CSS dimensions.
const qualityObserver=production?new ResizeObserver(()=>{const resolution=presentationResolution(396,436,el('canvas').clientWidth,window.devicePixelRatio);if(Math.abs(resolution-app.renderer.resolution)>.01){app.renderer.resize(396,436,resolution);app.canvas.style.width='100%';app.canvas.style.height='100%';}}):null;qualityObserver?.observe(el('canvas'));
if(lcdEnabled)el('canvas').style.setProperty('aspect-ratio',production?'396 / 436':'420 / 480','important');
let admissionFeedback,cabinetLights,rushDirectionGuide,preludeView,eclipseMechanism,lcdAnimation,model,scene,content,spinModel,spinView,bonusView,directionView,attackerView,tulipView,ballTexture,pinTexture,textures=[],frames=[],balls=new Map(),ballTrails=new Map(),ghosts=new Map(),receipts=[],wheels=[],previous=performance.now(),demo=true,mode='normal';
const decisionOverlay=createDecisionPushOverlay({host:el('canvas'),app,getView:()=>spinView?.root,getGame:()=>spinModel?.game,isPaused:()=>model?.flow.paused??true,press:()=>spinModel?.pressDecision()??false,onPress:()=>render()});
const presentationSound=spinEnabled&&settings.se==='true'?(sound??createPresentationSound()):null;
const unlockSound=()=>{void presentationSound?.unlock();};if(presentationSound)for(const event of ['pointerdown','keydown'])document.addEventListener(event,unlockSound);
const owned=c=>{const t=Texture.from(c);t.source.scaleMode='nearest';textures.push(t);return t;};
function setMode(next){mode=next;model.setMode(next);}
function reset(){presentationSound?.reset();spinView?.dispose();if(scene){attackerView.dispose();tulipView.dispose();scene.destroy({children:true});for(const t of textures)t.destroy(true);for(const t of frames)t.destroy(false);}textures=[];frames=[];balls=new Map();ballTrails=new Map();ghosts=new Map();receipts=[];wheels=[];model=createBoardFlow({lcd:lcdEnabled,launchInterval,pegSeed:unit?.pegSeed??0,fire:sessionGame?()=>sessionGame.fire():null});const {flow}=model;spinModel=spinEnabled?attachNormalSpin(flow,{sessionGame,presentationPatterns:!!sessionGame,reach:settings.reach==='true',win:settings.win==='true',roundModel:settings.rounds==='true'?model:null,lifecycle:settings.lifecycle==='true',rushWin:settings.rushWin==='true'}):null;spinView=null;bonusView=null;directionView=null;eclipseMechanism=null;preludeView=null;rushDirectionGuide=createRushDirectionGuide();
 scene=new Container();scene.position.set(production?-12:0,production?-166:-130);app.stage.addChild(scene);if(lcdEnabled){const shell=new Sprite(owned(createCabinetDecor()));shell.scale.set(1/3);shell.y=130;scene.addChild(shell);}content=new Container();scene.addChild(content);
 const aperture=lcdEnabled?PLAYFIELD_APERTURE.flat():[78,157,395,157,395,680,45,680,45,210];
 const mask=lcdEnabled?traceBoardSilhouette(new Graphics()).fill(0xffffff):new Graphics().poly(aperture).fill(0xffffff);scene.addChild(mask);content.mask=mask;
 // A shared visible rail channel; the actual launch mechanism stays behind the bottom frame.
 // The right resin rim is the visible boundary; the clipping mask is not a second wall.
 const edge=lcdEnabled?traceBoardSilhouette(new Graphics()).stroke({color:0x08111d,width:7,join:'round'}):new Graphics().poly(aperture).stroke({color:0x70552f,width:3});
 if(lcdEnabled){traceBoardSilhouette(edge).stroke({color:0x536b7d,width:4,join:'round'});traceBoardSilhouette(edge).stroke({color:0xb49b61,width:1.4,join:'round'});}
 // Broad cabinet support sits behind balls; the exposed launch contact edge is r .7.
 scene.addChildAt(edge,scene.getChildIndex(content));
 const edgeFront=new Graphics();
 if(lcdEnabled){
  edgeFront.moveTo(OUTER_ARC[0].x,OUTER_ARC[0].y);
  for(const p of OUTER_ARC.slice(1))edgeFront.lineTo(p.x,p.y);
  edgeFront.stroke({color:0x70552f,width:LAUNCH_RAIL_CORE_WIDTH,cap:'round',join:'round'});
 }else edgeFront.poly(aperture).stroke({color:0x70552f,width:3});
 scene.addChild(edgeFront);
 ballTexture=createSilverBallTexture();pinTexture=createPinTexture({highlight:lcdEnabled});textures.push(ballTexture,pinTexture);
 let lcdRoot;
 if(lcdTexture){const lcd=createLcdView(lcdTexture,cloudSky,hairAtlas,hairUnderlay,rushScene);lcdAnimation=lcd;lcdRoot=lcd.content;content.addChild(lcd.root);textures.push(lcd.texture);if(lcd.idleTexture)textures.push(lcd.idleTexture);if(spinEnabled){spinView=createNormalSpinView(rushScene,reachAtlas,reachLandscape,reachMotionAtlas,hairUnderlay,storySheets);lcd.content.addChild(spinView.root);textures.push(...spinView.textures);frames.push(...spinView.frames);if(spinModel.rounds){bonusView=createBonusRoundView();lcd.content.addChild(bonusView.root);textures.push(bonusView.texture);preludeView=createRushPreludeView(entrySheets,rushScene);lcd.content.addChild(preludeView.root);textures.push(...preludeView.textures);}}}
 if(lcdEnabled){const trim=new Sprite(owned(createBoardTrim(flow.physics)));trim.scale.set(1/3);trim.y=130;content.addChild(trim);}
 if(lcdEnabled){directionView=createDirectionCutin();lcdRoot.addChild(directionView.root);textures.push(...directionView.textures);}
 const launchRailBack=new Graphics(),launchRailFront=new Graphics(),launchBallsLayer=new Container(),rearLayer=new Container(),insideLayer=new Container(),frontLayer=new Container(),mechanisms=new Container(),ballsLayer=new Container();content.addChild(launchRailBack,launchBallsLayer,launchRailFront,rearLayer,insideLayer,frontLayer,mechanisms,ballsLayer);content.launchBallsLayer=launchBallsLayer;content.ballsLayer=ballsLayer;content.insideLayer=insideLayer;
 for(const p of flow.physics.pockets.filter(p=>p.kind==='normal'||p.kind==='start')){const t=p.kind==='start'?central:normal,size=lcdEnabled?(p.kind==='start'?15:ORDINARY_POCKET_SIZE):32,width=lcdEnabled&&p.kind==='start'?p.w*1.25:size,s=new Sprite(t);s.position.set(p.x-width/2,p.y-size*POCKET_ANCHOR_Y);s.width=width;s.height=size;if(p.kind==='normal')s.tint=0x8297ac;rearLayer.addChild(s);const cut=Math.round(t.height*POCKET_FRONT_CUT),f=new Texture({source:t.source,frame:new Rectangle(0,cut,t.width,t.height-cut)});frames.push(f);const fg=new Sprite(f);fg.position.set(p.x-width/2,p.y-size*POCKET_ANCHOR_Y+size*cut/t.height);fg.width=width;fg.height=size*(t.height-cut)/t.height;if(p.kind==='normal')fg.tint=0x8297ac;frontLayer.addChild(fg);}

 const out=flow.physics.outlet,ox=(out.x-out.w/2)*3,oy=(out.y-130)*3,ow=out.w*3;
 const back=owned(pixelSurface(1260,1680,c=>{const d=painter(c);d.rect(ox-8,oy-7,ow+16,55,'#152134');d.rect(ox-5,oy-4,ow+10,49,'#52687b');d.rect(ox,oy,ow,35,'#02050c');d.rect(ox+5,oy+5,ow-10,27,'#080e19');d.rect(ox+9,oy+10,ow-18,20,'#02050c');}));const bs=new Sprite(back);bs.scale.set(1/3);bs.y=130;rearLayer.addChild(bs);
 const front=owned(pixelSurface(1260,1680,c=>{const d=painter(c);d.rect(ox-8,oy+25,ow+16,18,'#17263b');d.rect(ox-8,oy+25,ow+16,5,'#9fb6ca');d.rect(ox-4,oy+30,ow+8,5,'#456079');for(const x of [ox-7,ox+ow+2]){d.rect(x,oy-5,5,30,'#9fb6ca');d.rect(x+2,oy,3,25,'#355675');}}));const fs=new Sprite(front);fs.scale.set(1/3);fs.y=130;frontLayer.addChild(fs);
 const railArt=owned(pixelSurface(1260,1680,c=>{const d=painter(c),pt=p=>({x:Math.round(p.x*3),y:Math.round((p.y-130)*3)});if(lcdEnabled)paintRightResinRoute(d,pt);for(const s of flow.physics.colliders.filter(s=>!s.role.startsWith('right-channel-')&&(!lcdEnabled||s.role!=='right-inner-lower')).filter(s=>s.role==='lcd-feed'||s.role.startsWith('right-')||s.role==='out-left'||s.role==='out-right'))paintResinGuide(d,pt(s.a),pt(s.b),{mountSide:s.role.includes('outer')?-1:undefined,depth:lcdEnabled&&s.role.startsWith('right-')?18:0});if(lcdEnabled)for(const s of flow.physics.colliders.filter(s=>s.role==='left-inlet-guide')){const a=pt(s.a),b=pt(s.b);d.line(a.x,a.y,b.x,b.y,'#17263b',6);d.line(a.x,a.y,b.x,b.y,'#7893ac',3);d.line(a.x-1,a.y,b.x-1,b.y,'#dcecf5',1);}}));const rails=new Sprite(railArt);rails.scale.set(1/3);rails.y=130;rearLayer.addChild(rails);
 if(lcdEnabled)for(const c of flow.physics.colliders.filter(c=>c.role.startsWith('launch-'))){
  launchRailBack.moveTo(c.a.x,c.a.y).lineTo(c.b.x,c.b.y).stroke({color:0x17263b,width:10/3});
  launchRailBack.moveTo(c.a.x,c.a.y).lineTo(c.b.x,c.b.y).stroke({color:0x7893ac,width:2});
  launchRailFront.moveTo(c.a.x,c.a.y).lineTo(c.b.x,c.b.y).stroke({color:0x7893ac,width:LAUNCH_RAIL_CORE_WIDTH,cap:'round',join:'round'});
  launchRailFront.moveTo(c.a.x,c.a.y).lineTo(c.b.x,c.b.y).stroke({color:0xdcecf5,width:.4,cap:'round',join:'round'});
 }
 if(lcdEnabled){const p=flow.physics.pockets.find(p=>p.kind==='start');
  // The calibrated opening width is shared with the sensor and rim, not a measured W dimension.
  const mouth=new Graphics().rect(p.x-p.w/2,p.y-3,p.w,3).fill(0x020711).rect(p.x-p.w/2+1,p.y-2,p.w-2,1).fill(0x102437);rearLayer.addChild(mouth);
  const lip=new Graphics().rect(p.x-p.w/2,p.y+1,p.w,1).fill(0xf1cf79).rect(p.x-p.w/2+1,p.y+2,p.w-2,1).fill(0x78562e);frontLayer.addChild(lip);
 }
 for(const p of flow.physics.pins){if(lcdEnabled&&p.role==='heso'){const backing=new Graphics().rect(p.x-3,p.y-3,6,6).fill(0x101b29);rearLayer.addChild(backing);}const s=new Sprite(pinTexture);s.anchor.set(.5);s.scale.set((lcdEnabled?.52:1)/3);s.position.set(p.x,p.y);rearLayer.addChild(s);}
 for(const m of flow.physics.mechanisms){const c=pixelSurface(116,116,()=>{}),t=owned(c),s=new Sprite(t);s.anchor.set(.5);s.scale.set(1/3);s.position.set(m.x,m.y);mechanisms.addChild(s);wheels.push({m,c,t});}
 if(lcdEnabled)for(const shape of hesoTrayShapes(flow.physics.pockets.find(p=>p.kind==='start'))){
  // Recessed mount sits behind the ball plane; the raised tray is contact geometry.
  const outer=shape[0],mouth=flow.physics.pockets.find(p=>p.kind==='start'),side=Math.sign(outer.x-mouth.x);
  const mount=new Graphics().poly([outer.x,outer.y,outer.x+side*4,outer.y+6,outer.x+side*4,510,outer.x-side*8,515]).fill(0x1c3044);
  rearLayer.addChild(mount);
  const tray=new Graphics().poly(shape.flatMap(p=>[p.x,p.y])).fill(0x304b62)
   .stroke({color:0x8ea7b6,width:1.2,join:'round'});
  const [a,b,c,d]=shape;
  tray.moveTo(a.x,a.y+2).lineTo(b.x,b.y+2).stroke({color:0x0b1b2c,width:2});
  tray.moveTo(d.x,d.y-1).lineTo(c.x,c.y-1).stroke({color:0xb99b61,width:.7});
  rearLayer.addChild(tray);
 }
 // Reuse finished component renderers. Their local trial balls/rails are replaced by shared layers.
 const proxy=Object.create(flow.physics);Object.defineProperty(proxy,'balls',{value:[]});attackerView=new AttackerView(proxy,{transparentBackground:true});tulipView=new RightStartView(proxy,tulipAtlas);
 for(const view of [attackerView,tulipView]){view.root.scale.set(.5);view.root.position.set(view.origin.x,view.origin.y);view.rails.visible=false;mechanisms.addChild(view.root);}
 content.addChild(fs);
 if(lcdEnabled){const t=owned(pixelSurface(1260,1680,c=>paintRightRouteFront(painter(c),p=>({x:Math.round(p.x*3),y:Math.round((p.y-130)*3)}))));const fascia=new Sprite(t);fascia.scale.set(1/3);fascia.y=130;content.addChild(fascia);}
 if(lcdEnabled){
  // Ordinary-symbol starter below the electric starter. A real receiving mouth,
  // not the former invented non-capturing sensor across the upper-right lane.
  const [x,y]=sourcePoint([FUZU_START_SOURCE.x,FUZU_START_SOURCE.y]);
  const w=FUZU_START_SOURCE.w*.5;
  const body=new Graphics()
   .rect(x-w/2-1,y-1,w+2,8).fill(0x35516a)
   .rect(x-w/2,y,w,6).fill(0x020711)
   .rect(x-w/2+1,y+2,w-2,4).fill(0x0b1826);
  rearLayer.addChild(body);
  const lip=new Graphics()
   .rect(x-w/2-1,y+5,w+2,2).fill(0xa3bdc9)
   .rect(x-w/2,y+7,w,1).fill(0x35516a);
  frontLayer.addChild(lip);

 }

 if(lcdEnabled){cabinetLights=createCabinetLightView(flow.physics,cabinetPortrait,cabinetBackground);cabinetLights.root.y=130;scene.addChild(cabinetLights.root);textures.push(...cabinetLights.textures);frames.push(...cabinetLights.frames);}
 if(spinEnabled){eclipseMechanism=createEclipseMechanism({height:LCD_LAYOUT.height*210/LCD_LAYOUT.width,leftHeight:(LCD_BEVEL_Y-LCD_LAYOUT.y)*210/LCD_LAYOUT.width,opening:LCD_OPENING.map(([x,y])=>[(x-LCD_LAYOUT.x)*210/LCD_LAYOUT.width,(y-LCD_LAYOUT.y)*210/LCD_LAYOUT.width])});eclipseMechanism.root.scale.set(LCD_LAYOUT.width/210);eclipseMechanism.root.position.set(LCD_LAYOUT.x,LCD_LAYOUT.y);scene.addChild(eclipseMechanism.root);textures.push(...eclipseMechanism.textures);}
 admissionFeedback=createAdmissionFeedback();content.addChild(admissionFeedback.root);
 if(sessionGame){const lose=flow.game.lose.bind(flow.game),returned=flow.game.addStock.bind(flow.game);flow.game.lose=b=>{lose(b);sessionGame.lose(b);};flow.game.addStock=n=>{returned(n);sessionGame.addStock(n,'returned');};}
 const hit=flow.game.hit.bind(flow.game);flow.game.hit=(b,kind,id)=>{const before=spinModel?.game.drawSerial??0;if(kind==='normal'||kind==='start'||kind==='fuzu'){const p=flow.physics.pockets.find(p=>p.id===id);receipts.push({id:b.id,kind,x:b.x,y:b.y,targetX:p.x,targetY:p.y,time:flow.physics.time});}hit(b,kind,id);if(kind==='start'){const p=flow.physics.pockets.find(p=>p.id===id);admissionFeedback.admit({x:p.x,y:p.y,time:flow.physics.time,accepted:(spinModel?.game.drawSerial??0)>before});}};const lose=flow.game.lose.bind(flow.game);flow.game.lose=b=>{receipts.push({id:b.id,kind:'out',x:b.x,y:b.y,time:flow.physics.time});lose(b);};
 if(lcdEnabled){el('normal-power').value='.20';el('power-value').textContent='0.20';}
 setMode('normal');
 // Explicit review page only: select an already-won payout for side-by-side visual checks.
 if(settings.payoutReview==='true'&&spinModel&&!spinModel.game.isWMachine){const amount=Number(new URLSearchParams(location.search).get('amount'));const normal=new URLSearchParams(location.search).get('mode')==='normal';if(normal&&amount===900||!normal&&[500,1500,3000].includes(amount)){const g=spinModel.game;if(normal)g.pendingGrade=6;else{g.startRush();g.pendingPayout=amount;}g.startJackpot();g.previewWinAt=g.time;g.previewRushWin=!normal;setMode('right-closed');}}
 if(settings.rushEndReview==='true'&&spinModel&&!spinModel.game.isWMachine){const g=spinModel.game;g.startRush();g.rush.remaining=3;g.rush.consumed=97;g.rush.total=2500;g.rush.chain=2;g.enqueueDraw(3,'rush','rush');g.enqueueDraw(1,'start','normal');setMode('rush');}
 if(settings.entryReview==='true'&&spinModel&&!spinModel.game.isWMachine){const g=spinModel.game;g.reviewEntryVariant=new URLSearchParams(location.search).get('variant')||'moon';g.pendingGrade=6;g.startJackpot();g.jackpot.round=6;g.jackpot.count=9;g.jackpot.payout=885;g.award(885);g.previewWinAt=-6;g.previewRushWin=false;setMode('right-closed');}
 flow.start();demo=!spinEnabled;previous=performance.now();}
function paintWheel({m,c,t}){const ctx=c.getContext('2d');ctx.clearRect(0,0,116,116);const d=painter(ctx),r=m.radius*3;for(let i=0;i<4;i++){const a=m.angle+i*Math.PI/2,cs=Math.cos(a),sn=Math.sin(a),at=(u,v)=>[58+cs*u-sn*v,58+sn*u+cs*v],shape=(pts,color)=>d.poly(pts.map(([u,v])=>at(u,v)),color);shape([[0,-4],[r-4,-4],[r,0],[r-4,4],[0,4]],'#80591e');shape([[5,-3],[r-4,-3],[r-1,0],[r-4,3],[5,3]],'#f5d783');shape([[18,-1],[r-7,-1],[r-4,0],[r-7,2],[18,2]],'#276dd3');d.line(...at(8,-2),...at(r-6,-2),'#fff1bd',2);}d.diamond(58,58,8,'#80591e');d.diamond(58,58,6,'#f5d783');d.diamond(58,58,3,'#96bad1');d.rect(56,55,3,3,'#f3f8ff');t.source.update();}
function render(){const {flow}=model;receipts=receipts.filter(r=>flow.physics.time-r.time<.7);admissionFeedback?.render(flow.physics.time,spinModel?.game.reducedEffects);if(production&&!introCamera?.snapshot().active){const q=attentionCamera(spinModel?.game.presentation),a=viewCameras[selectedView],b=viewCameras.board;applyIntroPose({x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q,scale:a.scale+(b.scale-a.scale)*q,frameAlpha:a.frameAlpha*(1-q)});}decisionOverlay.update();cabinetLights?.render(spinModel?.game??flow.game);if(eclipseMechanism)eclipseMechanism.render(spinModel.game,spinModel.game.entryPrelude?.variant==='mechanism'?spinModel.game.time-spinModel.game.entryPrelude.startedAt-2.4:undefined);lcdAnimation?.render(flow.game.time,spinModel?.game);if(directionView){const guide=rushDirectionGuide.update(spinModel?.game??{});if(guide)directionView.announce(guide.direction,flow.game.time,guide.delay);const winGuide=spinModel&&!spinModel.rounds&&spinModel.game.previewWinAt!==undefined&&spinModel.game.time-spinModel.game.previewWinAt>=5.8;directionView.render(winGuide||model.getMode()!=='normal'?'right':'left',flow.game.time,spinModel&&rushEndPose(spinModel.game.time,spinModel.game.lastRush?.endedAt,!!spinModel.game.rush||!!spinModel.game.jackpot).visible?RUSH_END_SECONDS:spinModel?.game.entryGuideAt!==undefined&&flow.game.time-spinModel.game.entryGuideAt<.1?2.4-(spinModel.game.entryTitleOffset||0):0);}if(spinView){spinView.render(spinModel.game,!spinModel.game.entryPrelude&&!!bonusView&&spinModel.game.previewWinAt!==undefined&&spinModel.rounds.snapshot().phase!=='celebration'&&(spinModel.rounds.snapshot().phase!=='guide'||spinModel.rounds.snapshot().fromRush));presentationSound?.sync(spinModel.game,{paused:flow.paused,rounds:spinModel.rounds?.snapshot(),pushAvailable:typeof spinModel.pressDecision==='function'});if(bonusView){const r=spinModel.rounds.snapshot();bonusView.render(r);if(settings.lifecycle==='true'&&spinModel.game.previewWinAt===undefined){bonusView.root.visible=false;mode=model.getMode();}else if(!['celebration','guide'].includes(r.phase)){mode='bonus';}}el('spin-state').textContent=spinModel.game.previewWinAt!==undefined?(spinModel.game.time-spinModel.game.previewWinAt<5.8?'大当り':'右打ち案内'):spinModel.game.presentation?.basicReach?'リーチ・中央図柄待ち':spinModel.game.spinActive?'図柄変動中':spinModel.game.stopTimer>0?'ハズレ停止':'入賞待ち';if(bonusView&&spinModel.rounds.snapshot().phase!=='celebration'){const r=spinModel.rounds.snapshot();el('spin-state').textContent=`ラウンド ${r.round}：${r.count}/${r.limit}玉・払出 ${r.payout}玉`;}el('spin-holds').textContent=spinModel.game.holdCount;el('spin-draws').textContent=spinModel.game.draws;}attackerView.render();tulipView.render();for(const w of wheels)paintWheel(w);const alive=new Set();for(const b of flow.physics.balls){alive.add(b.id);let s=balls.get(b.id);if(!s){s=new Sprite(ballTexture);s.tint=0xffffff;s.anchor.set(.5);s.scale.set((flow.physics.displayBallScale??1)/3);const trail=new Graphics().rect(-.45,0,.9,1).fill({color:0xd7edff,alpha:.5});content.ballsLayer.addChild(trail,s);ballTrails.set(b.id,trail);balls.set(b.id,s);}const ballLayer=lcdEnabled&&flow.physics.separateLaunchPlane&&!b.leftLaunchPlane?content.launchBallsLayer:content.ballsLayer;if(s.parent!==ballLayer)ballLayer.addChild(s);const visual=b.onRightSurface?projectRightRoute(b):b;s.position.set(visual.x,visual.y);const trail=ballTrails.get(b.id);if(trail.parent!==ballLayer)ballLayer.addChildAt(trail,0);trail.position.set(visual.x,visual.y);trail.rotation=Math.atan2(b.vy,b.vx)+Math.PI/2;trail.scale.y=Math.min(7,Math.hypot(b.vx,b.vy)*.018);trail.visible=!spinModel?.game.reducedEffects&&trail.scale.y>2;s.visible=lcdEnabled||b.x>40&&b.y>145;}
 for(const [id,s]of balls)if(!alive.has(id)){s.destroy();ballTrails.get(id)?.destroy();ballTrails.delete(id);balls.delete(id);}const seen=new Set();for(const r of receipts){const out=r.kind==='out',t=(flow.physics.time-r.time)/(out?.18:.26);if(t<0||t>=1)continue;seen.add(r.id);let s=ghosts.get(r.id);if(!s){s=new Sprite(ballTexture);s.tint=0xffffff;s.anchor.set(.5);content.insideLayer.addChild(s);ghosts.set(r.id,s);}s.position.set(out?r.x:r.x+(r.targetX-r.x)*.3*t,out?r.y+12*t:r.targetY+3*t);s.scale.set((flow.physics.displayBallScale??1)*(1-(out?.3:.7)*t)/3);s.alpha=1-t*t;}for(const [id,s]of ghosts)if(!seen.has(id)){s.destroy();ghosts.delete(id);}
 if(lcdEnabled){const gate=model.gate.snapshot();el('gate-count').textContent=gate.count;const m=model.leftMetrics.snapshot();for(const [id,key]of [['near','nearHeso'],['deflected','deflectedAtHeso'],['spill','earlySpill'],['miss','nearMiss']])el('route-'+id).textContent=m[key];el('power-results').textContent=Object.entries(m.byPower).filter(([p])=>Number(p)<.3).map(([p,s])=>`${Number(p).toFixed(2)}：到達${s.nearHeso}／入賞${s.admitted}／命釘接触・非入賞${s.deflectedAtHeso}／接触なし・非入賞${s.nearMiss}`).join('\n');}
 el('phase').textContent=mode==='normal'?'通常打ち':mode==='rush'?'右打ち・電チュー開放':mode==='bonus'?'右打ち・アタッカー開放':'右打ち・両方閉鎖';if(bonusView){const r=spinModel.rounds.snapshot(),labels={guide:'右打ちへ切替',opening:'右打ち・アタッカー開放動作',open:'右打ち・アタッカー開放',closing:'右打ち・アタッカー閉鎖動作',gap:'右打ち・次ラウンド待機',finished:'ラウンド終了'};if(labels[r.phase])el('phase').textContent=labels[r.phase];}for(const key of ['start','normal','rush','bonus','out'])el(key).textContent=flow.counts[key];if(preludeView){preludeView.render(spinModel.game);if(spinModel.game.entryPrelude){bonusView.root.visible=false;if(directionView)directionView.root.visible=false;}}el('shots').textContent=flow.physics.metrics.spawned;el('pause').textContent=flow.paused?'再開':'一時停止';app.render();}
el('demo').onclick=reset;if(spinEnabled)el('lcd-detail').onclick=()=>{scene.scale.set(1.75);scene.position.set(-170,-375);};
if(lcdEnabled){el('normal-power').oninput=e=>{model.setNormalPower(Number(e.target.value));el('power-value').textContent=Number(e.target.value).toFixed(2);};el('right-detail').onclick=()=>{scene.scale.set(1.4);scene.position.set(-300,-330);};el('mode-right-closed').onclick=()=>{demo=false;setMode('right-closed');};el('detail').onclick=()=>{scene.scale.set(1.6);scene.position.set(-30,-408);};el('overview').onclick=()=>{scene.scale.set(1);scene.position.set(0,-130);};}
for(const name of ['normal','rush','bonus'])el('mode-'+name).onclick=()=>{demo=false;setMode(name);};el('pause').onclick=()=>model.flow.pause(!model.flow.paused);el('feed').onclick=()=>{const {flow}=model;demo=false;flow.continuous?flow.stop():flow.start();};
reset();
const frameView=frameTexture?new Sprite(frameTexture):null;if(frameView)app.stage.addChild(frameView);
let selectedView='board';const viewCameras=createViewCameras(LCD_LAYOUT);
const introCamera=production&&intro?createIntroCamera({lcd:LCD_LAYOUT,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,onState:onIntroState}):null;
function applyIntroPose(pose){scene.scale.set(pose.scale);scene.position.set(pose.x,pose.y);if(frameView){const f=FRAME_PLACEMENT;frameView.scale.set(f.scale*pose.scale);frameView.position.set(f.x*pose.scale+pose.x,f.y*pose.scale+pose.y);frameView.alpha=pose.frameAlpha;frameView.visible=pose.frameAlpha>0;}}
if(production)applyIntroPose(introCamera?.pose()??viewCameras.board);
reviewHook?.({game:spinModel?.game,model});const stop=startFrameLoop(now=>{const dt=(now-previous)/1000;previous=now;if(document.hidden)return;const {flow}=model;if(demo){const phaseLength=lcdEnabled?24:12,next=flow.game.time<phaseLength?'normal':flow.game.time<phaseLength*2?'rush':flow.game.time<phaseLength*3?'bonus':'normal';if(next!==mode)setMode(next);if(flow.game.time>=phaseLength*3)flow.stop();}if(sessionGame?.phase==='result'){flow.pause(true);}if(introCamera?.snapshot().active){if(!flow.paused&&sessionGame?.phase!=='result'){const pose=introCamera.step(dt);applyIntroPose(introCamera.snapshot().active?pose:viewCameras[selectedView]);}}else flow.step(dt);render();onUpdate(api.snapshot());});const onVisibility=()=>{if(document.hidden){model.flow.pause(true);presentationSound?.stop();}};document.addEventListener('visibilitychange',onVisibility);let disposed=false;
const api={setView(view){if(disposed||!production||!Object.hasOwn(viewCameras,view))return false;selectedView=view;if(!introCamera?.snapshot().active)applyIntroPose(viewCameras[view]);render();return true;},skipIntro(){if(disposed)return;selectedView='board';if(introCamera)introCamera.skip();if(production)applyIntroPose(viewCameras.board);render();onUpdate(api.snapshot());},audioStream:()=>presentationSound?.captureStream(),setSound:value=>presentationSound?.setEnabled(value),audio:()=>presentationSound?.snapshot(),pause:value=>{model.flow.pause(value);if(value)presentationSound?.stop();},feed:value=>value?model.flow.start():model.flow.stop(),power:value=>model.setNormalPower(value),canvas:app.canvas,dispose(){if(disposed)return;disposed=true;stop();qualityObserver?.disconnect();document.removeEventListener('visibilitychange',onVisibility);for(const event of ['pointerdown','keydown'])document.removeEventListener(event,unlockSound);presentationSound?.dispose();decisionOverlay.destroy();spinView?.dispose();attackerView.dispose();tulipView.dispose();app.destroy(true,{children:true});for(const t of textures)t.destroy(true);for(const t of frames)t.destroy(false);},snapshot:()=>({view:selectedView,intro:introCamera?.snapshot()??{active:false,phase:'complete'},w:sessionGame?.w?{model:sessionGame.w.snapshotModel??'e東京喰種W',rush:sessionGame.w.rush?{...sessionGame.w.rush}:null,bonus:sessionGame.w.bonus?{...sessionGame.w.bonus}:null,pendingV:!!sessionGame.w.pendingV,electricOpen:sessionGame.w.electricOpen,payout:sessionGame.w.payout,holds:Object.fromEntries(Object.entries(sessionGame.w.queues).map(([k,v])=>[k,v.length])),eventCount:sessionGame.w.events.length}:null,direction:directionView?.snapshot(),cabinet: cabinetLights?.snapshot(),session:sessionGame?{stock:sessionGame.stock,total:sessionGame.total,phase:sessionGame.phase,accounting:sessionGame.accounting,jackpots:sessionGame.jackpots}:null,spin:spinModel?.snapshot(),lcd:lcdEnabled?LCD_LAYOUT:null,gate:model.gate?.snapshot(),leftRoutes:model.leftMetrics?.snapshot(),time:model.flow.game.time,feeding:model.flow.continuous,paused:model.flow.paused,mode,counts:{...model.flow.counts},spawned:model.flow.physics.metrics.spawned,pockets:structuredClone(model.flow.physics.pockets),guide:structuredClone(model.flow.physics.colliders.find(c=>c.role==='right-inner-lower')),attacker:model.attacker.state(),tulip:model.tulip.state(),routeBalls:model.flow.physics.balls.filter(b=>b.onRightSurface).map(b=>({id:b.id,x:b.x,y:b.y,depth:b.routeDepth,visual:projectRightRoute(b)})),inFlight:model.flow.physics.balls.length})};render();return api;
}
