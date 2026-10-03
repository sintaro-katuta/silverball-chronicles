using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 public sealed class BonusStoryView {
  readonly SealDuelGraphic passage;readonly DriveAtmosphereGraphic driveAtmosphere;readonly Image decisionPlate;readonly ReferencePresentation p;readonly RectTransform root;readonly RawImage portrait,second;readonly Image wash,flash;readonly SequencePushGraphic pushFace;
  readonly BonusStoryGraphic circle,frame,burst,ground,leftBlade,rightBlade;readonly Text title,caption,pushLabel,number,numberDepth,paidLabel;
  readonly Mask portraitMask;readonly BonusStoryGraphic maskGraphic;readonly BonusStoryArt art;int lastId=-1,lastStep=-1,lastAmount=-1;string lastScene="";
  public string SceneId{get;private set;}="";
  T Add<T>(string name,Vector2 size,Vector2 pos)where T:Graphic{var go=new GameObject(name,typeof(RectTransform),typeof(CanvasRenderer));go.transform.SetParent(root,false);var v=go.AddComponent<T>();v.rectTransform.sizeDelta=size;v.rectTransform.anchoredPosition=pos;v.raycastTarget=false;return v;}
  Text Text(string name,Vector2 size,Vector2 pos,int font){var t=Add<Text>(name,size,pos);t.font=p.cutTitle.font;t.fontSize=font;t.resizeTextForBestFit=true;t.resizeTextMinSize=28;t.resizeTextMaxSize=font;t.lineSpacing=.88f;t.alignment=TextAnchor.MiddleCenter;t.fontStyle=FontStyle.BoldAndItalic;t.color=Color.white;var o=t.gameObject.AddComponent<Outline>();o.effectColor=new Color(.02f,.01f,.05f,1);o.effectDistance=new Vector2(4,-5);return t;}
  BonusStoryGraphic Shape(string name,BonusGraphicKind kind,Vector2 size,Vector2 pos,Color c){var g=Add<BonusStoryGraphic>(name,size,pos);g.kind=kind;g.color=c;return g;}
  public BonusStoryView(ReferencePresentation presentation,RectTransform parent){p=presentation;art=p.machine.GetComponent<BonusStoryArt>();var go=new GameObject("Post-payout story",typeof(RectTransform));root=go.GetComponent<RectTransform>();root.SetParent(parent,false);root.sizeDelta=new Vector2(1000,1520);
   wash=Add<Image>("Story ground",new Vector2(1000,1520),Vector2.zero);wash.color=new Color(.006f,.014f,.045f);
   driveAtmosphere=Add<DriveAtmosphereGraphic>("DRIVE story aurora",new Vector2(1000,1520),Vector2.zero);
   passage=Add<SealDuelGraphic>("Next passage",new Vector2(730,970),new Vector2(60,180));
   maskGraphic=Shape("Circular portrait aperture",BonusGraphicKind.EllipseMask,new Vector2(835,1020),new Vector2(0,70),Color.white);portraitMask=maskGraphic.gameObject.AddComponent<Mask>();portraitMask.showMaskGraphic=false;
   portrait=Add<RawImage>("Story protagonist",new Vector2(1100,1500),Vector2.zero);second=Add<RawImage>("Dedicated opponent art",new Vector2(920,1300),Vector2.zero);portrait.rectTransform.SetParent(maskGraphic.rectTransform,false);
   ground=Shape("Drive perspective floor",BonusGraphicKind.Ground,new Vector2(1000,480),new Vector2(0,-500),new Color(.65f,.35f,.08f,.5f));
   burst=Shape("Result radiance",BonusGraphicKind.Burst,new Vector2(1600,1800),new Vector2(0,10),new Color(1,.7f,.22f,.18f));
   frame=Shape("Last floor gold perimeter",BonusGraphicKind.Frame,new Vector2(930,1400),Vector2.zero,new Color(.92f,.68f,.23f));
   circle=Shape("Decision blade gold circle",BonusGraphicKind.GoldCircle,new Vector2(960,1120),new Vector2(0,70),new Color(1,.72f,.23f));
   leftBlade=Shape("Resolution blue blade left",BonusGraphicKind.Blade,new Vector2(170,1150),new Vector2(-160,30),new Color(.35f,.82f,1,.94f));rightBlade=Shape("Resolution blue blade right",BonusGraphicKind.Blade,new Vector2(170,1150),new Vector2(160,30),new Color(.73f,.92f,1,.94f));
   decisionPlate=Add<Image>("Decision title plaque",new Vector2(620,85),new Vector2(0,-545));decisionPlate.color=new Color(.03f,.018f,.05f,.9f);
   title=Text("Story title",new Vector2(850,250),new Vector2(0,510),85);caption=Text("Story result caption",new Vector2(840,180),new Vector2(0,-480),57);
   numberDepth=Text("Giant number bronze extrusion",new Vector2(980,390),new Vector2(13,-160),245);numberDepth.color=new Color(.35f,.13f,.018f);number=Text("Giant announced number",new Vector2(980,390),new Vector2(0,-145),245);number.color=new Color(1,.84f,.35f);
   pushFace=Add<SequencePushGraphic>("Push device face",new Vector2(720,500),new Vector2(0,-200));pushLabel=Text("Push device legend",new Vector2(380,130),new Vector2(0,-200),82);pushLabel.color=Color.white;
   paidLabel=Text("Actual completed payout",new Vector2(850,90),new Vector2(0,-635),39);
   flash=Add<Image>("Story transition light",new Vector2(1000,1520),Vector2.zero);flash.color=Color.clear;SetVisible(false);
  }
  public void ResetHistory(){lastId=-1;lastStep=lastAmount=-1;lastScene="";SetVisible(false);}
  public void SetVisible(bool visible){root.gameObject.SetActive(visible);if(!visible)SceneId="";}
  static Rect Cell(int digit){int d=digit-1;return new Rect(d%3/3f,d<3?.5f:0,1f/3f,.5f);}
  void Portrait(int digit,float shot,float zoom=1){portrait.texture=p.normalAtlas;portrait.uvRect=Cell(digit);portrait.gameObject.SetActive(true);portrait.color=Color.white;portrait.rectTransform.sizeDelta=new Vector2(880,1470)*zoom;portrait.rectTransform.anchoredPosition=new Vector2(Mathf.Lerp(100,0,Mathf.SmoothStep(0,1,Mathf.Clamp01(shot/.45f))),20);}
  void Dedicated(Texture2D texture){second.gameObject.SetActive(texture!=null);if(!texture)return;second.texture=texture;second.uvRect=new Rect(0,0,1,1);second.color=Color.white;second.rectTransform.anchoredPosition=Vector2.zero;}
  void Director(int cell){if(!p.bonusDirectorAtlas)return;second.gameObject.SetActive(true);second.texture=p.bonusDirectorAtlas;second.uvRect=new Rect(cell*.5f,0,.5f,1);second.color=Color.white;second.rectTransform.anchoredPosition=Vector2.zero;portrait.gameObject.SetActive(false);}
  void ActionPortrait(int cell){if(!p.directorAtlas)return;second.gameObject.SetActive(true);second.texture=p.directorAtlas;second.uvRect=new Rect(cell%3/3f,cell<3?.5f:0,1f/3f,.5f);second.color=Color.white;second.rectTransform.anchoredPosition=Vector2.zero;portrait.gameObject.SetActive(false);}
  void Strike(float t){leftBlade.gameObject.SetActive(true);rightBlade.gameObject.SetActive(true);float u=Mathf.Clamp01(t/.65f);leftBlade.rectTransform.localRotation=Quaternion.Euler(0,0,Mathf.Lerp(-85,-36,u));rightBlade.rectTransform.localRotation=Quaternion.Euler(0,0,Mathf.Lerp(85,36,u));if(t<.32f)flash.color=new Color(.65f,.85f,1,Mathf.Sin(t/.32f*Mathf.PI)*.75f);}
  void Push(float t){pushFace.gameObject.SetActive(true);pushLabel.gameObject.SetActive(true);pushLabel.text="PUSH";float appear=Mathf.SmoothStep(0,1,Mathf.Clamp01(t/.35f));float press=p.machine.PushFeedback;pushFace.rectTransform.localScale=new Vector3(1-.08f*press,1-.14f*press,1)*Mathf.Lerp(.85f,1,appear);pushLabel.rectTransform.localScale=Vector3.one*(1-.09f*press);if(press>0)flash.color=new Color(.72f,.9f,1,press*.20f);}
  void Amount(int amount,float shot,bool total){number.text=numberDepth.text=amount.ToString("N0");number.gameObject.SetActive(amount>0);numberDepth.gameObject.SetActive(amount>0);float enter=Mathf.SmoothStep(0,1,Mathf.Clamp01(shot/.55f));float y=Mathf.Lerp(-610,-150,enter);number.rectTransform.anchoredPosition=new Vector2(0,y);numberDepth.rectTransform.anchoredPosition=new Vector2(13,y-15);float scale=Mathf.Lerp(1.55f,1,enter);number.rectTransform.localScale=numberDepth.rectTransform.localScale=new Vector3(scale,scale,1);caption.text=total?"Total":"獲得玉";number.color=Color.Lerp(new Color(1,.98f,.83f),new Color(1,.78f,.21f),Mathf.Clamp01(shot/.6f));}
  public void Render(BonusPresentationState state){
   SetVisible(state!=null&&state.IsActive);if(state==null||!state.IsActive)return;
   var award=state.CompletedAward;var route=BonusStoryTimeline.Route(state.SourceMode,award.drive,award.title);
   var f=state.Phase==BonusPresentationPhase.Story?BonusStoryTimeline.Story(route,state.Elapsed,state.PhaseDuration,state.Paid):state.Phase==BonusPresentationPhase.Result?BonusStoryTimeline.Result(route,state.Elapsed,state.Paid):BonusStoryTimeline.Entrance(state.Elapsed,state.Paid);
   SceneId=f.SceneId;
   if(lastId!=state.Id||lastScene!=f.SceneId||lastStep!=f.Step||lastAmount!=f.Amount){
    string cue=f.Push?"push":state.Phase==BonusPresentationPhase.Result?(state.Destination==PlayMode.Normal?"end":"shatter"):route==BonusStoryRoute.Drive&&f.Amount>0?(lastAmount!=f.Amount?"unit":null):f.Step==0?"gate":null;
    if(cue!=null)p.machine.soundscape?.PlayCue(cue);lastId=state.Id;lastScene=f.SceneId;lastStep=f.Step;lastAmount=f.Amount;
   }
   portrait.gameObject.SetActive(false);second.gameObject.SetActive(false);circle.gameObject.SetActive(false);frame.gameObject.SetActive(false);ground.gameObject.SetActive(false);burst.gameObject.SetActive(false);leftBlade.gameObject.SetActive(false);rightBlade.gameObject.SetActive(false);pushFace.gameObject.SetActive(false);pushLabel.gameObject.SetActive(false);number.gameObject.SetActive(false);numberDepth.gameObject.SetActive(false);decisionPlate.gameObject.SetActive(false);portraitMask.enabled=false;maskGraphic.enabled=false;
   flash.color=Color.clear;wash.color=new Color(.006f,.018f,.04f);title.text=caption.text="";title.color=new Color(.66f,.87f,1);title.rectTransform.anchoredPosition=new Vector2(0,560);title.rectTransform.localScale=Vector3.one*.78f;caption.rectTransform.anchoredPosition=new Vector2(0,-480);caption.rectTransform.localScale=Vector3.one;paidLabel.text=$"獲得 {state.Paid:N0} 玉";paidLabel.color=new Color(.84f,.92f,1);
   driveAtmosphere.gameObject.SetActive(true);driveAtmosphere.SetClock(state.TotalElapsed);passage.gameObject.SetActive(route!=BonusStoryRoute.Drive);passage.Pose(.35f,.3f,0,state.TotalElapsed,0,false);
   bool story=state.Phase==BonusPresentationPhase.Story;
   if(route==BonusStoryRoute.Drive){title.text="SWORD DRIVE";title.color=new Color(1,.82f,.35f);if(story){if(f.Amount>0)Amount(f.Amount,f.ShotTime,false);else caption.text="切り開いた先に、さらなる力。";}else{Amount(state.Paid,state.Elapsed,true);caption.text=state.Phase==BonusPresentationPhase.Result?"獲得玉":state.Destination==PlayMode.Normal?"左打ちに戻してください":"右打ち";}return;}
   // The current reward has already been paid. This doorway asks about the next mode only.
   portrait.gameObject.SetActive(true);portrait.texture=p.narrativeAtlas;portrait.uvRect=new Rect(0,0,1f/3f,1);portrait.rectTransform.sizeDelta=new Vector2(520,1040);portrait.rectTransform.anchoredPosition=new Vector2(-210,-300);portrait.color=new Color(.68f,.81f,.93f);
   if(story){title.text=state.SourceMode==PlayMode.Normal?"RUSHへの扉":"次の戦いへ";caption.text=f.Step<2?"勝利の先に、新たな道。":f.Push?"その先を、確かめろ。":"扉の向こうで、光が待つ。";passage.Pose(.35f,.25f+.5f*Mathf.Clamp01(state.Elapsed/state.PhaseDuration),0,state.TotalElapsed,0,false);if(f.Push)Push(f.ShotTime);return;}
   // Only the rules-owned Result/Entrance phases can disclose the destination.
   bool onward=state.Destination!=PlayMode.Normal;float open=onward?Mathf.SmoothStep(0,1,Mathf.Clamp01(state.Elapsed/.85f)):0;passage.Pose(0,onward?1:0,open,state.TotalElapsed,0,onward);
   if(onward){title.text=state.Destination==PlayMode.WarOfUnderworld?"War of Underworld":"SWORD RUSH";title.color=new Color(1,.82f,.35f);caption.text=state.Phase==BonusPresentationPhase.Entrance?"右打ちで、次の戦いへ。":"道は、続いている。";if(state.Phase==BonusPresentationPhase.Entrance)passage.gameObject.SetActive(false);}
   else {title.text="";caption.text="左打ちに戻してください";portrait.color=new Color(.4f,.50f,.63f);}
  }
 }
}
