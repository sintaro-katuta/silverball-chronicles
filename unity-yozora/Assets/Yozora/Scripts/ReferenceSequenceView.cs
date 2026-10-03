using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 // Original continuous choreography: one protagonist, one obstacle, persistent damage.
 public sealed class ReferenceSequenceView {
  readonly ReferencePresentation p;readonly RawImage city,hero;readonly RectTransform heroWindow;
  readonly Image shade,flash,subtitleBed;readonly Text caption,objective;readonly SealDuelGraphic seal;
  readonly SequencePushGraphic push;readonly BonusStoryGraphic blade;readonly Image[] motes=new Image[32];
  Ticket ticket;int lastCut=-2;static readonly Color Ice=new Color(.48f,.86f,1),Gold=new Color(1,.79f,.35f);
  T Add<T>(string name,Vector2 size,Vector2 pos)where T:Graphic{var go=new GameObject(name,typeof(RectTransform),typeof(CanvasRenderer));go.transform.SetParent(p.cutIn,false);var g=go.AddComponent<T>();g.raycastTarget=false;g.rectTransform.sizeDelta=size;g.rectTransform.anchoredPosition=pos;return g;}
  Text Label(string name,Vector2 size,Vector2 pos,int font){var t=Add<Text>(name,size,pos);t.font=p.cutTitle.font;t.fontSize=font;t.alignment=TextAnchor.MiddleCenter;t.fontStyle=FontStyle.Bold;t.color=Color.white;var o=t.gameObject.AddComponent<Outline>();o.effectColor=new Color(.005f,.015f,.03f,1);o.effectDistance=new Vector2(3,-4);return t;}
  public ReferenceSequenceView(ReferencePresentation presentation){p=presentation;
   city=Add<RawImage>("Continuous cathedral road",new Vector2(1450,1850),Vector2.zero);city.texture=p.directorAtlas;city.uvRect=Cell(0);city.color=new Color(.30f,.41f,.52f);
   seal=Add<SealDuelGraphic>("Persistent crystalline road seal",new Vector2(790,1000),new Vector2(80,160));
   var window=new GameObject("Sword wielder foreground",typeof(RectTransform),typeof(RectMask2D));heroWindow=window.GetComponent<RectTransform>();heroWindow.SetParent(p.cutIn,false);heroWindow.sizeDelta=new Vector2(610,720);heroWindow.anchoredPosition=new Vector2(-155,-260);
   hero=Add<RawImage>("Continuous hero action",new Vector2(850,1000),Vector2.zero);hero.rectTransform.SetParent(heroWindow,false);
   blade=Add<BonusStoryGraphic>("Physical sweeping light blade",new Vector2(95,890),Vector2.zero);blade.kind=BonusGraphicKind.Blade;blade.color=Ice;
   for(int i=0;i<motes.Length;i++)motes[i]=Add<Image>("Converging sword light "+i,new Vector2(3,12),Vector2.zero);
   shade=Add<Image>("Dramatic exposure",new Vector2(1000,1520),Vector2.zero);
   subtitleBed=Add<Image>("Subtitle shadow",new Vector2(1000,170),new Vector2(0,-610));subtitleBed.color=new Color(.002f,.008f,.025f,.91f);
   caption=Label("Cause and response",new Vector2(880,140),new Vector2(0,-605),48);
   objective=Label("Reach objective",new Vector2(830,130),new Vector2(40,560),66);
   push=Add<SequencePushGraphic>("Final blow PUSH",new Vector2(720,500),new Vector2(0,-190));
   p.cutTitle.transform.SetAsLastSibling();flash=Add<Image>("Contact light",new Vector2(1000,1520),Vector2.zero);
  }
  static Rect Cell(int n)=>new Rect(n%3/3f,n<3?.5f:0,1f/3f,.5f);
  static float Ease(float t,float span)=>Mathf.SmoothStep(0,1,Mathf.Clamp01(t/span));
  void Hero(int cell,float age,bool action){
   int pose=action?(cell==5?2:1):0;hero.texture=p.narrativeAtlas?p.narrativeAtlas:p.normalAtlas;hero.uvRect=p.narrativeAtlas?new Rect(pose/3f,0,1f/3f,1):Cell(2);hero.color=new Color(.88f,.94f,1);hero.rectTransform.sizeDelta=new Vector2(550,1100);hero.rectTransform.anchoredPosition=Vector2.zero;heroWindow.sizeDelta=new Vector2(640,1120);heroWindow.anchoredPosition=new Vector2(-210,-180);heroWindow.localScale=Vector3.one;
  }
  public void Render(Ticket a,bool rush){
   if(a==null||!a.reach){ticket=null;lastCut=-2;p.cutGroup.alpha=0;return;}
   float t=a.elapsed;int cut=ReferenceSequenceTimeline.DirectorCut(t,rush);float age=t-ReferenceSequenceTimeline.CutStart(cut,rush);
   if(ticket!=a){ticket=a;lastCut=-2;}
   if(cut!=lastCut){if(cut>=0&&cut<11){string cue=cut==0?"gate":cut==2||cut==9?"swing":cut==3?"heavy-impact":cut==4?"fracture":cut==6?"gather":cut==7?"push":null;if(cue!=null)p.machine.soundscape?.PlayCue(cue);}lastCut=cut;}
   float resultAge=t-(rush?ReferenceSequenceTimeline.RushResult:ReferenceSequenceTimeline.NormalResult);
   p.cutGroup.alpha=cut<0?0:resultAge<.75f?1:1-Ease(resultAge-.75f,.35f);if(p.cutGroup.alpha<=0)return;
   p.cutPortrait.gameObject.SetActive(false);p.slash.gameObject.SetActive(false);p.cutIn.localRotation=Quaternion.identity;p.cutIn.localScale=Vector3.one;p.cutIn.anchoredPosition=Vector2.zero;
   p.cutTitle.text="";p.cutTitle.rectTransform.localScale=Vector3.one;p.cutTitle.fontSize=95;p.cutTitle.rectTransform.anchoredPosition=new Vector2(0,-190);p.cutTitle.color=Color.white;
   objective.text="封印を斬り裂け";objective.color=Ice;caption.text="";flash.color=Color.clear;push.gameObject.SetActive(false);blade.gameObject.SetActive(false);heroWindow.gameObject.SetActive(true);shade.color=new Color(.005f,.015f,.04f,.04f);
   float damage=cut>=4?.50f:0,charge=cut>=6?Mathf.Clamp01((t-ReferenceSequenceTimeline.CutStart(6,rush))/(rush?2:6)):0,open=0,hit=0;
   city.rectTransform.anchoredPosition=new Vector2(0,-35*Mathf.Clamp01((t-ReferenceSequenceTimeline.Start(rush))/18));city.rectTransform.localScale=Vector3.one*(1+.035f*Mathf.Clamp01(t/30));
   seal.rectTransform.anchoredPosition=new Vector2(85,170);seal.rectTransform.localScale=Vector3.one;Hero(4,age,false);
   if(cut==0){caption.text="この先へ、進むために。";hero.color=new Color(.55f,.68f,.80f);seal.rectTransform.localScale=Vector3.one*Mathf.Lerp(.88f,1,Ease(age,rush?.8f:2));}
   else if(cut==1){caption.text="道を塞ぐ、結晶の封印。";Hero(4,age,false);}
   else if(cut==2){caption.text="斬る！";Hero(5,age,true);Swing(age,rush?.30f:.42f);}
   else if(cut==3){caption.text="弾かれた……！";Hero(4,age,true);hit=Mathf.Exp(-age*5);float recoil=Mathf.Sin(age*30)*Mathf.Exp(-age*7);heroWindow.anchoredPosition+=new Vector2(-35*hit,0);seal.rectTransform.anchoredPosition+=new Vector2(recoil*14,recoil*7);flash.color=new Color(.7f,.9f,1,Mathf.Max(0,1-age/.13f)*.62f);}
   else if(cut==4){caption.text="だが、亀裂が入った。";damage=.50f*Ease(age,.6f);Hero(4,age,true);seal.rectTransform.localScale=Vector3.one*Mathf.Lerp(1,1.23f,Ease(age,.8f));seal.rectTransform.anchoredPosition=Vector2.Lerp(new Vector2(85,170),new Vector2(35,100),Ease(age,.8f));hero.color=new Color(.70f,.82f,.94f,.42f);}
   else if(cut==5){caption.text="狙うのは、あの一点。";Hero(4,age,false);heroWindow.localScale=Vector3.one*Mathf.Lerp(1,1.22f,Ease(age,.7f));heroWindow.anchoredPosition=Vector2.Lerp(new Vector2(-210,-180),new Vector2(-85,-100),Ease(age,.7f));}
   else if(cut==6){caption.text="剣に、すべての力を。";Hero(4,age,false);blade.gameObject.SetActive(true);blade.rectTransform.anchoredPosition=new Vector2(-115,-80);blade.rectTransform.localRotation=Quaternion.Euler(0,0,-20);blade.rectTransform.localScale=Vector3.one*(.5f+charge*.3f);}
   else if(cut==7){caption.text="この一撃で、道を開く。";Hero(4,age,false);push.gameObject.SetActive(true);float feedback=p.machine.PushFeedback;push.rectTransform.localScale=new Vector3(1-.08f*feedback,1-.14f*feedback,1)*Mathf.Lerp(.85f,1,Ease(age,.35f));p.cutTitle.text="PUSH";p.cutTitle.rectTransform.localScale=Vector3.one*(1-.09f*feedback);flash.color=new Color(.6f,.87f,1,feedback*.20f);}
   else if(cut==8){caption.text="";shade.color=new Color(.002f,.007f,.02f,.64f);objective.text="";charge=.18f;}
   else if(cut==9){caption.text="夜空を、切り開け！";Hero(5,age,true);float speed=rush?.32f:.55f;Swing(age,speed);float contact=Mathf.Max(0,age-speed);hit=age>=speed?Mathf.Exp(-contact*5):0;damage=.75f;if(age>=speed){seal.rectTransform.anchoredPosition+=new Vector2(10*Mathf.Sin(contact*32)*hit,5*Mathf.Sin(contact*25)*hit);flash.color=new Color(.7f,.92f,1,Mathf.Max(0,1-contact/.12f)*.75f);} }
   else if(cut==10){caption.text="";objective.text="";Hero(5,0,true);charge=.1f;damage=.75f;shade.color=new Color(.003f,.007f,.02f,.48f);}
   else if(cut==11){Hero(a.win?5:4,0,true);open=a.win?Ease(age,.75f):0;damage=a.win?1:.75f*(1-Ease(age,.6f));charge=a.win?1:0;objective.text=a.win?"封印突破":"";objective.color=Gold;caption.text=a.win?"道は、開かれた。":"まだ、届かない……";shade.color=a.win?new Color(.13f,.32f,.40f,.08f):new Color(.005f,.008f,.02f,.65f);if(a.win){hero.color=Color.Lerp(Color.white,new Color(.65f,.86f,1),open);flash.color=new Color(.7f,.94f,1,Mathf.Max(0,1-age/.14f)*.6f);}}
   if(hit>0)p.cutIn.anchoredPosition=new Vector2(Mathf.Sin(age*37)*hit*9,Mathf.Sin(age*29)*hit*5);
   bool still=cut==8||cut==10;seal.Pose(damage,charge,open,still?0:t,hit,cut==11&&a.win);
   for(int i=0;i<motes.Length;i++){bool visible=cut==6||cut==7;var g=motes[i];g.gameObject.SetActive(visible);if(!visible)continue;float u=Mathf.Repeat(t*.7f+i*.173f,1);float angle=i*2.39996f;Vector2 target=new Vector2(-115,-80);g.rectTransform.anchoredPosition=target+new Vector2(Mathf.Cos(angle)*440,Mathf.Sin(angle)*650)*(1-u);g.rectTransform.localRotation=Quaternion.Euler(0,0,angle*Mathf.Rad2Deg-90);g.color=new Color(.53f,.86f,1,Mathf.Sin(u*Mathf.PI)*charge*.8f);}
  }
  void Swing(float age,float span){blade.gameObject.SetActive(age<span+.25f);float u=Ease(age,span);blade.rectTransform.anchoredPosition=Vector2.Lerp(new Vector2(-380,-270),new Vector2(150,130),u);blade.rectTransform.localRotation=Quaternion.Euler(0,0,Mathf.Lerp(-115,35,u));blade.rectTransform.localScale=Vector3.one;heroWindow.anchoredPosition+=new Vector2(38*u,-12*u);}
 }
 // Thick button illusion: front face, rounded metallic bevel, lower return and stepped
 // radial frame are separate geometry bands. No imported footage or new shader required.
 public sealed class SequencePushGraphic:MaskableGraphic {
  protected override void OnPopulateMesh(VertexHelper vh){
   vh.Clear();var ice=new Color(.38f,.83f,1);var dark=new Color(.02f,.09f,.21f);
   Band(vh,Vector2.zero,335,218,360,238,new Color(.1f,.6f,1,.06f),new Color(.3f,.85f,1,.02f),false);
   for(int i=0;i<16;i++){
    float a=i*Mathf.PI/8;Vector2 u=new Vector2(Mathf.Cos(a),Mathf.Sin(a)*.70f),side=new Vector2(-Mathf.Sin(a),Mathf.Cos(a)*.70f);
    Quad(vh,u*302-side*5,u*370-side*14,u*370+side*14,u*302+side*5,new Color(.13f,.58f,.95f,.65f));
    Quad(vh,u*311-side*2,u*354-side*5,u*354+side*5,u*311+side*2,new Color(.79f,.95f,1,.88f));
   }
   Disk(vh,new Vector2(0,-30),288,191,new Color(.015f,.035f,.085f,.95f),new Color(.02f,.14f,.28f,.95f));
   Band(vh,new Vector2(0,-21),260,172,288,190,new Color(.10f,.24f,.40f),new Color(.03f,.10f,.23f),true);
   Band(vh,Vector2.zero,250,161,287,189,new Color(.74f,.91f,.99f),new Color(.26f,.48f,.69f),true);
   Band(vh,Vector2.zero,239,153,250,161,new Color(.13f,.76f,1),new Color(.84f,.97f,1),true);
   Disk(vh,Vector2.zero,239,153,new Color(.96f,.99f,1),new Color(.31f,.72f,.95f));
   Band(vh,Vector2.zero,229,146,235,150,new Color(.83f,.97f,1,.95f),new Color(.33f,.78f,1,.65f),false);
   // Opposed silver arrow housings read as part of the button, not text decorations.
   foreach(int sign in new[]{-1,1}){
    Quad(vh,new Vector2(sign*268,-55),new Vector2(sign*328,-30),new Vector2(sign*352,0),new Vector2(sign*285,29),dark);
    Quad(vh,new Vector2(sign*275,-21),new Vector2(sign*308,-12),new Vector2(sign*333,10),new Vector2(sign*287,36),ice);
   }
  }
  static Vector2 At(float a,float rx,float ry)=>new Vector2(Mathf.Cos(a)*rx,Mathf.Sin(a)*ry);
  void Disk(VertexHelper vh,Vector2 c,float rx,float ry,Color center,Color edge){for(int i=0;i<96;i++){float a=i*Mathf.PI/48,b=(i+1)*Mathf.PI/48;int n=vh.currentVertCount;vh.AddVert(c,center,Vector2.zero);vh.AddVert(c+At(a,rx,ry),edge,Vector2.zero);vh.AddVert(c+At(b,rx,ry),edge,Vector2.zero);vh.AddTriangle(n,n+1,n+2);}}
  void Band(VertexHelper vh,Vector2 c,float ix,float iy,float ox,float oy,Color inner,Color outer,bool metal){for(int i=0;i<96;i++){float a=i*Mathf.PI/48,b=(i+1)*Mathf.PI/48;float lighting=metal?.48f+.52f*Mathf.Clamp01(.5f+.5f*Mathf.Sin((a+b)*.5f+.5f)):1;Color ca=inner*lighting,cb=outer*lighting;ca.a=inner.a;cb.a=outer.a;int n=vh.currentVertCount;vh.AddVert(c+At(a,ix,iy),ca,Vector2.zero);vh.AddVert(c+At(b,ix,iy),ca,Vector2.zero);vh.AddVert(c+At(b,ox,oy),cb,Vector2.zero);vh.AddVert(c+At(a,ox,oy),cb,Vector2.zero);vh.AddTriangle(n,n+1,n+2);vh.AddTriangle(n,n+2,n+3);}}
  void Quad(VertexHelper vh,Vector2 a,Vector2 b,Vector2 c,Vector2 d,Color tint){int n=vh.currentVertCount;vh.AddVert(a,tint,Vector2.zero);vh.AddVert(b,tint,Vector2.zero);vh.AddVert(c,tint,Vector2.zero);vh.AddVert(d,tint,Vector2.zero);vh.AddTriangle(n,n+1,n+2);vh.AddTriangle(n,n+2,n+3);}
 }

}
