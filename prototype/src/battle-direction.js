// Original Tsukikage direction. Pure clock-derived state, never a second lottery.
const clamp=x=>Math.max(0,Math.min(1,x));
export const BUILD_STYLES=['balanced','assault','fortify','counter'];
export const buildStyle=value=>BUILD_STYLES.includes(value)?value:'balanced';
const lines={
 balanced:{warning:'機関都市を守る。目標、敵の防壁。',enemy:'まずは、攻撃を見切る。',clash:'刃が通らない……！',crisis:'接触した場所に、亀裂が。',awakening:'同じ場所へ、力を集める。',strike:'この亀裂を、斬り開く！'},
 assault:{warning:'援護機、接続。敵の防壁を狙う。',enemy:'私が引きつける。援護を！',clash:'援護射撃、同じ箇所へ！',crisis:'防壁が傾いた。正面が空く！',awakening:'援護の隙を、一撃に繋ぐ。',strike:'今だ、核心を狙う！'},
 fortify:{warning:'増幅装甲、接続。前へ出る。',enemy:'装甲で受ける。退かない！',clash:'防壁展開――ここで止める。',crisis:'受け止めた。敵の姿勢が崩れる。',awakening:'守りの力を、刃へ！',strike:'この距離で、突き抜ける！'},
 counter:{warning:'帰還機構、接続。反撃に備える。',enemy:'深く踏み込んでくる……待つ。',clash:'受け流す。まだ、打たない。',crisis:'振り抜いた今、隙ができる。',awakening:'残した力を、ここで返す。',strike:'その一撃を、返す！'}
};
export function directionLine(p,beat){
 const style=buildStyle(p.buildStyle);
 if(beat.id==='resolve')return p.win?'突破成功。アタッカー開放へ':'防壁は残った……次の一手を。';
 if(beat.id==='silence')return '刃が、届かなかった……';
 if(beat.id==='revival')return 'まだ繋がっている。もう一度！';
 if(p.pattern==='revival'&&beat.id==='strike'&&p.t>=20.3)return '残った亀裂へ、もう一度！';
 return lines[style][beat.id]??beat.line;
}
export function directionFrame(p,id,u){
 const progress=clamp(u),style=buildStyle(p.buildStyle);
 const active=['clash','crisis','awakening','strike','judgment','silence','revival'].includes(id);
 const contact=id==='clash'?clamp((progress-.25)/.55):active?1:0;
 const damaged=['crisis','awakening','strike','judgment','silence','revival'].includes(id);
 const impact=id==='strike'?clamp((progress-.52)/.25):0;
 const reveal=id==='judgment'||id==='resolve';
 return {style,active,contact,crack:damaged?1:contact,tilt:style==='assault'&&damaged?.22:0,impact,broken:reveal&&!!p.win,failed:reveal&&!p.win,
  // No success/defeat artwork is shown while a live strike remains unresolved.
  art:reveal?p.pattern:id==='silence'?'defeat':id==='revival'?'revival':'feint'};
}
function line(c,points,color,width,alpha=1){c.save();c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore();}
function shield(c,x,y,r,tilt,crack,alpha,color='#b9e9f5'){
 c.save();c.translate(x,y);c.rotate(tilt);c.globalAlpha=alpha;
 const points=[[0,-r],[r*.64,-r*.55],[r*.58,r*.37],[0,r],[-r*.58,r*.37],[-r*.64,-r*.55],[0,-r]];
 c.fillStyle='#071d30b8';c.beginPath();points.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.fill();line(c,points,'#050b19',9);line(c,points,color,3);
 if(crack>0){c.save();c.globalAlpha*=crack;line(c,[[-15,-r*.7],[4,-25],[-10,0],[17,22],[2,r*.74]],'#e9fbff',2);line(c,[[4,-25],[32,-32],[r*.51,-12]],'#9ee4ee',1.5);c.restore();}c.restore();
}
export function drawBattleDirection(c,p,id,u,reducedMotion=false){
 const f=directionFrame(p,id,u);if(!f.active)return;
 const q=clamp(u),cx=386,cy=438,clock=reducedMotion?0:p.t;
 c.save();
 // A persistent enemy plate: its earlier scar remains at the point of the final cut.
 const fade=id==='judgment'&&p.win?1-q:1;
 shield(c,cx,cy,82,f.tilt,f.crack,.68*fade,'#96a7c0');
 if(id==='clash'){
  if(f.style==='assault')for(let n=0;n<3;n++){
   const travel=reducedMotion?1:clamp((q-.08-n*.14)/.28),sx=35,sy=355+n*84,ex=cx-20,ey=cy-25+n*24;
   if(travel>0&&travel<1||reducedMotion)line(c,[[sx+(ex-sx)*Math.max(0,travel-.35),sy+(ey-sy)*Math.max(0,travel-.35)],[sx+(ex-sx)*travel,sy+(ey-sy)*travel]],'#a1e8ff',4,.85);
  }
  else if(f.style==='fortify')shield(c,236,538,97,-.18,0,.25+f.contact*.6);
  else if(f.style==='counter'){
   const k=reducedMotion?.65:clamp(q/.7);line(c,[[525,360],[330,500],[278+(1-k)*40,624]],'#f4a5b8',3,.75);
   line(c,[[225,565],[300,507],[394,537]],'#b3ecff',4,f.contact);
  }
  else line(c,[[165,655],[cx-45,cy+60],[cx,cy]],'#d6f8ff',3,f.contact*.8);
 }
 if(id==='crisis'){
  // Broken fragments descend from that same contact. No scene change erases the damage.
  for(let n=0;n<5;n++){const fall=reducedMotion?.4:q;c.save();c.translate(cx-30+n*13+fall*(n-2)*28,cy+22+fall*fall*125);c.rotate(clock*.5+n);c.fillStyle='#afc3d4';c.globalAlpha=(1-fall)*.8;c.fillRect(-2,-6,4,12);c.restore();}
 }
 if(id==='awakening'||id==='revival'){
  // The player's equipment delivers energy along a visible path to the sword tip.
  const fill=reducedMotion?.65:clamp(q/.65);
  line(c,[[80,725],[190,672],[260,577],[cx-25,cy+50]],'#779aaf',2,.55);
  const nodes=[[80,725],[190,672],[260,577],[cx-25,cy+50]];
  for(let n=0;n<4;n++)if(fill>=n/4){c.fillStyle='#cdf5ff';c.globalAlpha=.6;c.beginPath();c.arc(...nodes[n],4,0,Math.PI*2);c.fill();}
 }
 if(id==='strike'){
  const k=reducedMotion?.75:clamp((q-.38)/.22);
  if(k>0){line(c,[[145,686],[145+(cx-145)*k,686+(cy-686)*k]],'#172330',15,.9);line(c,[[145,686],[145+(cx-145)*k,686+(cy-686)*k]],'#d6f8ff',5,.9);}
  if(f.impact>0){c.globalAlpha=(1-f.impact)*.8;c.strokeStyle='#e2faff';c.lineWidth=2;c.beginPath();c.ellipse(cx,cy,8+f.impact*95,5+f.impact*42,-.6,0,Math.PI*2);c.stroke();}
 }
 c.restore();
}
