import {MoonMechanism} from './moon-mechanism.mjs';
import {Entity,Mesh,MeshInstance,StandardMaterial,Color,Texture,calculateNormals,BLEND_NORMAL,FILTER_NEAREST} from 'playcanvas';

// Native Engine cabinet. Coordinates share the playfield's existing x/y/z basis.
// All mouldings are decorative; ball contacts remain owned by Physics.
const rounded=(x,y,w,h,r,steps=8)=>{
 const points=[];
 for(const [cx,cy,start] of [[x+w/2-r,y+h/2-r,0],[x-w/2+r,y+h/2-r,90],[x-w/2+r,y-h/2+r,180],[x+w/2-r,y-h/2+r,270]])
  for(let i=0;i<=steps;i++){const a=(start+i*90/steps)*Math.PI/180;points.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}
 return points;
};
const scaled=(points,inset)=>{
 const cx=points.reduce((s,p)=>s+p[0],0)/points.length,cy=points.reduce((s,p)=>s+p[1],0)/points.length;
 const radius=Math.max(...points.map(p=>Math.hypot(p[0]-cx,p[1]-cy)));
 return points.map(([x,y])=>[cx+(x-cx)*(1-inset/radius),cy+(y-cy)*(1-inset/radius)]);
};

export class Cabinet {
 constructor(app,parent){
  this.app=app;this.root=new Entity('tsukikage-cabinet-v2',app);parent.addChild(this.root);
  this.meshes=[];this.materials=[];this.textures=[];this.serial=0;
  this.m={
   shell:this.material('midnight-enamel','#23425e',.18,.35),
   chrome:this.material('satin-silver','#b8d1e2',.55,.48),
   steel:this.material('blue-steel','#385b78',.4,.35),
   black:this.material('midnight-lacquer','#08131f',.32,.8),
   rubber:this.material('recess-gasket','#03070b',.02,.15),
   gold:this.material('brass-inlay','#b69a62',.45,.4),
   lens:this.material('cut-blue-resin','#0d4164',.25,.87),
   lamp:this.material('segmented-light-guide','#9ce9f9',.18,.62),
   warm:this.material('crest-light-guide','#ffe2a2',.3,.65),
  };
  for(const key of ['shell','black','lens']){this.m[key].clearCoat=.2;this.m[key].clearCoatGloss=.4;this.m[key].update();}
  this.m.lamp.emissive.fromString('#50bcdf');this.m.lamp.emissiveIntensity=.35;this.m.lamp.update();
  this.m.warm.emissive.fromString('#e7bc6b');this.m.warm.emissiveIntensity=.22;this.m.warm.update();
  this.build();this.moon=new MoonMechanism(this);
 }
 material(name,color,metalness,gloss){const m=new StandardMaterial();m.name=name;m.diffuse=new Color().fromString(color);m.useMetalness=true;m.metalness=metalness;m.gloss=gloss;m.update();this.materials.push(m);return m;}
 group(name){const e=new Entity(name,this.app);this.root.addChild(e);return e;}
 geometry(name,positions,indices,material,parent=this.root,uvs){
  const mesh=new Mesh(this.app.graphicsDevice);mesh.setPositions(positions);mesh.setNormals(calculateNormals(positions,indices));mesh.setIndices(indices);
  mesh.setUvs(0,uvs??positions.flatMap((_,i)=>i%3===0?[(positions[i]+210)/420,(positions[i+1]+340)/680]:[]));mesh.update();this.meshes.push(mesh);
  const e=new Entity(`${name}-${this.serial++}`,this.app);parent.addChild(e);e.addComponent('render',{meshInstances:[new MeshInstance(mesh,material)],castShadows:false,receiveShadows:false});return e;
 }
 loft(name,loops,zs,material,parent=this.root,cap=false,closed=true){
  const positions=[],indices=[],n=loops[0].length;
  // Split profile seams: a flat front must not inherit rounded side-wall normals.
  for(let j=0;j<loops.length-1;j++){
   const k=positions.length/3;
   for(const t of [j,j+1])loops[t].forEach(([x,y])=>positions.push(x,y,zs[t]));
   for(let i=0;i<(closed?n:n-1);i++){const a=k+i,b=k+(i+1)%n,c=b+n,d=a+n;indices.push(a,b,c,a,c,d);}
  }
  if(cap)for(const j of [0,loops.length-1]){
   const k=positions.length/3;loops[j].forEach(([x,y])=>positions.push(x,y,zs[j]));
   for(let i=1;i<n-1;i++)indices.push(...(j===0?[k,k+i+1,k+i]:[k,k+i,k+i+1]));
  }
  return this.geometry(name,positions,indices,material,parent);
 }
 plate(name,points,z,depth,material,bevel=2,parent=this.root){return this.loft(name,[scaled(points,bevel),points,points,scaled(points,bevel)],[z,z+bevel,z+depth-bevel,z+depth],material,parent,true);}
 box(name,x,y,w,h,z,d,mat,r=5,parent=this.root){return this.plate(name,rounded(x,y,w,h,r),z,d,mat,Math.min(5,d/3,r*.6),parent);}
 ring(name,outer,inner,z,depth,mat,parent=this.root){return this.loft(name,[outer,outer,inner,inner,outer],[z,z+depth,z+depth,z,z],mat,parent);}
 frame(name,x,y,w,h,border,r,z,depth,mat,parent=this.root){
  const bevel=Math.min(4,border/3,depth/3),outer=rounded(x,y,w,h,r),inner=rounded(x,y,w-border*2,h-border*2,Math.max(1,r-border));
  return this.loft(name,[outer,outer,rounded(x,y,w-bevel*2,h-bevel*2,r-bevel),rounded(x,y,w-border*2+bevel*2,h-border*2+bevel*2,Math.max(1,r-border+bevel)),inner,inner,outer],[z,z+depth-bevel,z+depth,z+depth,z+depth-bevel,z,z],mat,parent);
 }
 crystal(name,points,z,rise,parent=this.root){
  const x=points.reduce((a,p)=>a+p[0],0)/points.length,y=points.reduce((a,p)=>a+p[1],0)/points.length;
  const positions=[],indices=[];
  for(let i=0;i<points.length;i++){
   const a=points[i],b=points[(i+1)%points.length],k=positions.length/3;
   positions.push(...a,z,...b,z,x,y,z+rise);indices.push(k,k+1,k+2);
  }
  return this.geometry(name,positions,indices,this.m.lens,parent);
 }
 sphere(name,x,y,z,w,h,d,mat,parent=this.root){const e=new Entity(name,this.app);parent.addChild(e);e.addComponent('render',{type:'sphere',material:mat,castShadows:false});e.setLocalPosition(x,y,z);e.setLocalScale(w,h,d);return e;}
 arc(name,x,y,rx,ry,start,end,width,z,depth,mat,parent=this.root){
  const outer=[],inner=[],n=64;
  for(let i=0;i<=n;i++){const a=(start+(end-start)*i/n)*Math.PI/180;outer.push([x+rx*Math.cos(a),y+ry*Math.sin(a)]);inner.push([x+(rx-width)*Math.cos(a),y+(ry-width)*Math.sin(a)]);}
  // A strip with actual edge depth, including end caps for partial arcs.
  return this.loft(name,[outer,outer,inner,inner,outer],[z,z+depth,z+depth,z,z],mat,parent,false,false);
 }
 line(name,points,width,z,mat,parent=this.root){
  const left=[],right=[];
  points.forEach(([x,y],i)=>{const p=points[Math.max(0,i-1)],q=points[Math.min(points.length-1,i+1)],l=Math.hypot(q[0]-p[0],q[1]-p[1]),nx=-(q[1]-p[1])/l*width/2,ny=(q[0]-p[0])/l*width/2;left.push([x+nx,y+ny]);right.push([x-nx,y-ny]);});
  return this.plate(name,[...right,...left.reverse()],z,3,mat,.4,parent);
 }
 texture(name,w,h,paint){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;paint(canvas.getContext('2d'),w,h);const texture=new Texture(this.app.graphicsDevice,{name,mipmaps:false,srgb:true,minFilter:FILTER_NEAREST,magFilter:FILTER_NEAREST});texture.setSource(canvas);this.textures.push(texture);return texture;}
 label(name,text,x,y,w,h,z,{size=70,color='#e5edf2',small=false}={}){
  const texture=this.texture(name,Math.round(w*2),Math.round(h*2),(c,W,H)=>{
   c.textAlign='center';c.textBaseline='middle';c.font=`${Math.round(small?H*.62:H*.72)}px "DotGothic16", monospace`;
   c.fillStyle='#06101a';c.fillText(text,W/2+2,H/2+3,W-8);
   c.fillStyle=color;c.fillText(text,W/2,H/2,W-8);
  });
  const mat=this.material(name+'-ink','#ffffff',.05,.4);mat.diffuseMap=texture;mat.emissiveMap=texture;mat.emissive=new Color(.5,.5,.5);mat.opacityMap=texture;mat.opacityMapChannel='a';mat.blendType=BLEND_NORMAL;mat.depthWrite=false;mat.update();
  return this.geometry(name,[x-w/2,y-h/2,z,x+w/2,y-h/2,z,x+w/2,y+h/2,z,x-w/2,y+h/2,z],[0,1,2,0,2,3],mat,this.root,[0,1,1,1,1,0,0,0]);
 }
 build(){
  const m=this.m,body=this.group('enclosure'),crown=this.group('crescent-crown'),wings=this.group('segmented-side-lenses'),deck=this.group('lower-control-deck');
  // Wide shoulders, rounded door, separate raised glass retaining frame.
  this.frame('rear-housing',0,0,524,850,49,66,-46,27,m.rubber,body);
  this.frame('outer-enamel',0,0,516,840,43,62,-22,30,m.shell,body);
  this.frame('outer-chrome-seam',0,0,510,834,3,60,9,4,m.chrome,body);
  this.frame('shadow-reveal',0,0,462,748,14,52,11,8,m.rubber,body);
  this.frame('inner-door',0,0,449,733,10,47,20,13,m.steel,body);
  this.frame('glass-retainer',0,0,431,711,3.2,39,33,4,m.chrome,body);
  // A dark printed foil sits behind the pins; the centre is a real aperture.
  const foil=this.material('printed-midnight-foil','#ffffff',0,.08);
  foil.useMetalness=false;foil.specular=new Color(0,0,0);
  foil.diffuseMap=this.texture('pixel-city-playfield',210,344,(c,w,h)=>{
   c.fillStyle='#0a192d';c.fillRect(0,0,w,h);
   for(let side=0;side<2;side++)for(let i=0;i<8;i++){
    const x=side?w-8-i*5:i*5+3,top=32+(i*31)%86;
    c.fillStyle=i%2?'#152e48':'#1c3c56';c.fillRect(x,top,4,h-top-22);
    c.fillStyle='#4b7183';for(let y=top+8;y<h-30;y+=16)c.fillRect(x+1,y,1,3);
   }
   for(let side=0;side<2;side++)for(let i=0;i<3;i++){
    const x=side?w-22-i*6:22+i*6;
    c.fillStyle=i===0?'#8b794c':'#2d5770';
    c.fillRect(x,200,1,82-i*5);c.fillRect(side?x-18:x,281-i*5,19,1);
   }
   c.fillStyle='#35516a';for(let i=0;i<38;i++)c.fillRect(5+(i*47)%200,12+(i*71)%315,1,1);
   c.fillStyle='#213c54';c.fillRect(42,294,126,2);c.fillRect(48,298,114,1);
  });foil.update();
  this.ring('printed-playfield',rounded(0,0,416,688,28),rounded(.5,64,317,408,14),-5,1,foil,body);
  this.frame('lcd-rubber-seat',.5,64,338,429,10.5,22,-1,4,m.rubber);
  this.frame('lcd-beveled-casting',.5,64,331,422,7,19,3,7,m.steel);
  this.frame('lcd-silver-inner-edge',.5,64,320,411,1.5,15,11,2,m.chrome);
  // Layered swept side armour. Front facets have independent normal directions.
  for(const side of [-1,1]){
   const mirror=points=>{const p=points.map(([x,y])=>[side*x,y]);return side<0?p.reverse():p;};
   this.plate('shoulder-casting',mirror([[168,292],[212,295],[253,358],[234,404],[164,410],[110,370]]),8,39,m.black,4,crown);
   this.plate('shoulder-chrome',mirror([[178,309],[204,309],[243,360],[226,389],[166,392],[130,369]]),46,8,m.chrome,2,crown);
   this.crystal('shoulder-lens',mirror([[184,319],[201,320],[233,360],[220,381],[168,382],[147,369]]),55,17,crown);
   for(let i=0;i<4;i++)this.line('shoulder-prism',mirror([[161+i*13,373-i*3],[193+i*8,350-i*4]]),2,75,m.lamp,crown);
   this.plate('side-sculpture',mirror([[219,-293],[247,-230],[254,266],[237,330],[216,294],[229,240],[228,-215],[210,-275]]),9,22,m.black,3,wings);
   this.line('side-chrome-spine',mirror([[233,-274],[247,-214],[247,261],[233,309]]),6,36,m.chrome,wings);
   for(let i=0;i<9;i++){
    const y=238-i*54;
    this.crystal('lens-cell',mirror([[232,y-40],[241,y-33],[241,y+10],[231,y+22]]),38,9,wings);
    this.line('lens-cell-light',mirror([[235,y-30],[238,y+6]]),2.6,48,m.lamp,wings);
   }
   this.plate('lower-buttress',mirror([[200,-286],[246,-249],[245,-363],[202,-400],[179,-352]]),19,30,m.shell,3,deck);
   this.line('buttress-inlay',mirror([[217,-290],[231,-321],[221,-357],[199,-375]]),4,51,m.gold,deck);
   // Speaker inserts are inset in the shoulders, away from the glass.
   this.box('speaker-seat',side*107,333,69,26,24,10,m.rubber,10,crown);
   for(let i=0;i<7;i++)this.box('speaker-slot',side*107-24+i*8,333,2.4,15,35,2,m.steel,1,crown);
  }
  // Discrete raised enamel pixels bridge the LCD art and the physical housing.
  for(const side of [-1,1])for(let i=0;i<6;i++){
   const x=side*(169+i*11),y=400-Math.floor(i/2)*10;
   this.box('stepped-crown-inlay',x,y,8,7,51,3,i%3===0?m.gold:m.lamp,.5,crown);
  }
  for(const side of [-1,1])for(let i=0;i<5;i++){
   this.box('pixel-deck-inlay',side*(88+i*17),-395,10,4,77,2,i%2?m.steel:m.lamp,.4,deck);
  }
  // Crescent emblem and a physically separate raised title marquee.
  this.box('title-casting',0,376,238,70,21,27,m.black,22,crown);
  this.frame('title-silver-lip',0,376,238,70,2,22,49,4,m.chrome,crown);
  this.arc('crescent-shadow',0,393,81,41,8,172,12,49,6,m.black,crown);
  this.arc('crescent-metal',0,393,77,38,8,172,7,55,5,m.chrome,crown);
  this.arc('crescent-light',0,393,72,33,12,168,2,61,2,m.warm,crown);
  this.crystal('moon-keystone',[[-9,419],[0,413],[9,419],[0,431]],64,7,crown);
  this.label('tsukikage-title','月影機関',0,372,218,57,58,{size:76});
  this.label('model-name','T S U K I K A G E',0,336,110,18,39,{size:37,small:true,color:'#a7b9c8'});
  // Raised ornamental wings under the LCD, behind the live ball plane.
  for(const side of [-1,1]){
   const p=[[side*21,-151],[side*106,-151],[side*155,-131],[side*123,-165],[side*57,-177]];if(side>0)p.reverse();
   this.plate('lcd-wing',p,0,9,m.chrome,1);
   this.line('lcd-wing-inlay',[[side*37,-157],[side*99,-156],[side*135,-142]],2,11,m.gold);
  }
  // Upper receiving tray: deep black basin, fluted floor and projecting enamel lip.
  this.box('tray-support',-19,-365,385,90,10,29,m.black,24,deck);
  this.box('tray-basin',-25,-351,342,39,40,5,m.rubber,16,deck);
  this.frame('tray-rear-rim',-25,-351,353,45,4,18,44,5,m.chrome,deck);
  for(let i=0;i<24;i++)this.box('tray-floor-rib',-177+i*13,-351,1.3,22,46,1.5,m.steel,.6,deck);
  this.box('tray-projecting-lip',-25,-377,359,27,51,24,m.shell,12,deck);
  this.line('tray-light',[[ -173,-374],[-137,-384],[89,-384],[135,-374]],2.2,78,m.lamp,deck);
  this.box('lower-service-panel',-45,-409,305,20,19,18,m.black,7,deck);
  this.label('manufacturer-mark','月 影 機 関',-47,-409,102,18,39,{size:40,small:true,color:'#a9b6bf'});
  // Right rotary grip: concentric metal, rubber and a relieved crescent grip.
  this.arc('handle-socket',194,-369,43,43,0,360,12,34,13,m.black,deck);
  this.arc('handle-chrome',194,-369,36,36,0,360,5,49,9,m.chrome,deck);
  this.sphere('handle-hub',194,-369,64,57,57,28,m.black,deck);
  this.arc('handle-grip',194,-369,28,28,-65,200,6,70,8,m.gold,deck);
  this.arc('handle-status',194,-369,19,19,25,150,1.4,79,2,m.lamp,deck);
  for(let i=0;i<5;i++){const a=(i*23+170)*Math.PI/180;this.box('grip-ridge',194+25*Math.cos(a),-369+25*Math.sin(a),3,6,79,2,m.steel,1,deck);}
  // Fasteners and latch make the enclosing door read as an assembled object.
  for(const side of [-1,1])for(const y of [-309,280]){
   this.box('door-fastener',side*214,y,7,7,39,2,m.chrome,3);
   this.box('fastener-slot',side*214,y,4,.8,42,1,m.black,.2);
  }
  this.box('door-lock',249,-188,12,28,36,5,m.chrome,5);
  this.box('door-keyway',249,-188,2,9,42,1,m.rubber,1);
 }
 update(game,p,beat,beatInfo){
  this.moon.update(game,p,beatInfo);
  const bonus=!!game.jackpot,rush=!!game.rush,red=!!p&&game.presentation.reachColor==='red';
  const resolved=!!p&&p.win&&beat==='resolve';
  const color=bonus?'#ffbf67':resolved?'#e9faff':red?'#ed4555':rush?'#63d6ed':'#57bbd7';
  const intensity=bonus?1.05:resolved?1.3:p?.65:rush?.65:.24;
  // State changes only; no perpetual uniform updates or unannounced-result lighting.
  const key=color+intensity;if(key===this.lightKey)return;this.lightKey=key;
  this.m.lamp.emissive.fromString(color);this.m.lamp.emissiveIntensity=intensity;this.m.lamp.update();
  this.m.warm.emissiveIntensity=bonus?.8:.22;this.m.warm.update();
 }
 dispose(){this.root.destroy();this.meshes.forEach(mesh=>mesh.destroy());this.materials.forEach(m=>m.destroy());this.textures.forEach(t=>t.destroy());}
}
