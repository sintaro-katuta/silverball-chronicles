using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 // Displays only started units and actual counted payouts. No Award.Payout,
 // full round count, future mode or future DRIVE unit count is consulted.
 public sealed class ReferenceBonusView {
  readonly DriveAtmosphereGraphic driveAtmosphere;readonly ReferencePresentation p;readonly RectTransform root;readonly CanvasGroup group;readonly RawImage art,actor;readonly Text title,total,progress,reveal,roundHeader,unitCounter,driveAmount;readonly Image fill,impactFlash;readonly BonusStoryGraphic halo,perimeter,decisionRing,attackBlade,answerBlade,driveGround,driveSword;readonly Image[] countLamps=new Image[10];readonly BonusStoryView story;Award previous;YozoraRules owner;PlayMode mode;float age,unitAge;int lastUnit,completedUnitPaid,lastPaid,lastRound;float countAge,roundAge,shotAge;int payoutShot=-1;
  public string SceneId{get;private set;}="";
  public bool BlocksBasePresentation{get;private set;}
  T Add<T>(string name,Vector2 size,Vector2 pos)where T:Graphic{var g=new GameObject(name,typeof(RectTransform),typeof(CanvasRenderer));g.transform.SetParent(root,false);var v=g.AddComponent<T>();v.raycastTarget=false;v.rectTransform.sizeDelta=size;v.rectTransform.anchoredPosition=pos;return v;}
  Text Label(string name,Vector2 size,Vector2 pos,int fontSize){var t=Add<Text>(name,size,pos);t.font=p.cutTitle.font;t.fontSize=fontSize;t.fontStyle=FontStyle.BoldAndItalic;t.alignment=TextAnchor.MiddleCenter;t.color=Color.white;var o=t.gameObject.AddComponent<Outline>();o.effectColor=new Color(.03f,.015f,.08f,1);o.effectDistance=new Vector2(4,-5);return t;}
  BonusStoryGraphic Shape(string n,BonusGraphicKind kind,Vector2 size,Vector2 pos,Color color){var g=Add<BonusStoryGraphic>(n,size,pos);g.kind=kind;g.color=color;return g;}
  public ReferenceBonusView(ReferencePresentation presentation){p=presentation;var go=new GameObject("Bonus unit and RUSH entrance",typeof(RectTransform),typeof(CanvasGroup));root=go.GetComponent<RectTransform>();root.SetParent(p.cutIn.parent,false);root.sizeDelta=new Vector2(1000,1520);group=go.GetComponent<CanvasGroup>();group.alpha=0;group.blocksRaycasts=false;
   Add<Image>("Bonus ground",new Vector2(1000,1520),Vector2.zero).color=new Color(.008f,.015f,.04f,1);
   art=Add<RawImage>("Bonus scene",new Vector2(1500,1520),new Vector2(0,50));
   driveAtmosphere=Add<DriveAtmosphereGraphic>("DRIVE aurora stage",new Vector2(1000,1520),Vector2.zero);
   actor=Add<RawImage>("Payout story character",new Vector2(1050,1530),new Vector2(0,20));
   decisionRing=Shape("Decision payout gold circle",BonusGraphicKind.GoldCircle,new Vector2(960,1120),new Vector2(0,60),new Color(1,.78f,.25f,.94f));
   attackBlade=Shape("Payout story attack",BonusGraphicKind.Blade,new Vector2(150,1400),new Vector2(-230,80),new Color(.6f,.89f,1,.95f));
   answerBlade=Shape("Payout story guard",BonusGraphicKind.Blade,new Vector2(130,1250),new Vector2(190,-30),new Color(.5f,.4f,1,.9f));
   driveGround=Shape("DRIVE perspective floor",BonusGraphicKind.Ground,new Vector2(1100,730),new Vector2(0,-365),new Color(.72f,.49f,.19f,.35f));
   driveSword=Shape("DRIVE foreground sword",BonusGraphicKind.Blade,new Vector2(190,1250),new Vector2(250,30),new Color(.33f,.48f,.60f,.30f));driveSword.rectTransform.localRotation=Quaternion.Euler(0,0,-28);
   halo=Shape("Unit reveal radial light",BonusGraphicKind.Burst,new Vector2(1500,1850),new Vector2(0,70),new Color(1,.77f,.28f,.1f));
   perimeter=Shape("Bonus cinematic perimeter",BonusGraphicKind.Frame,new Vector2(970,1410),new Vector2(0,0),new Color(.92f,.76f,.4f,.85f));
   Add<Image>("Counter backdrop",new Vector2(1000,115),new Vector2(0,-640)).color=new Color(.008f,.013f,.035f,.50f);
   roundHeader=Label("Round header",new Vector2(450,85),new Vector2(-240,650),52);unitCounter=Label("Current announced unit payout",new Vector2(420,85),new Vector2(265,650),42);
   title=Label("Bonus title",new Vector2(920,340),new Vector2(0,420),90);title.resizeTextForBestFit=true;title.resizeTextMinSize=38;title.resizeTextMaxSize=90;title.lineSpacing=.9f;title.horizontalOverflow=HorizontalWrapMode.Wrap;title.verticalOverflow=VerticalWrapMode.Truncate;total=Label("Actual counted payout",new Vector2(530,65),new Vector2(-200,-600),33);progress=Label("Current unit progress",new Vector2(930,70),new Vector2(0,-660),26);progress.resizeTextForBestFit=true;progress.resizeTextMinSize=24;progress.resizeTextMaxSize=40;progress.lineSpacing=.9f;reveal=Label("Completed unit reveal",new Vector2(900,250),new Vector2(0,50),116);
   Add<Image>("Unit bar track",new Vector2(750,15),new Vector2(0,-700)).color=new Color(.13f,.2f,.3f);
   fill=Add<Image>("Unit counted progress",new Vector2(0,15),new Vector2(-375,-700));fill.rectTransform.pivot=new Vector2(0,.5f);fill.color=new Color(.3f,.85f,1);
   for(int i=0;i<10;i++){var lamp=Add<Image>("Actual round ball "+(i+1),new Vector2(18,8),new Vector2(90+i*26,-601));countLamps[i]=lamp;}
   driveAmount=Label("DRIVE actual running amount",new Vector2(940,270),new Vector2(0,-50),165);driveAmount.color=new Color(1,.83f,.36f);
   impactFlash=Add<Image>("Unit reveal flash",new Vector2(1000,1520),Vector2.zero);impactFlash.color=Color.clear;
   story=new BonusStoryView(p,root);
  }
  public void Render(YozoraRules rules,float dt){
   if(!object.ReferenceEquals(owner,rules)){owner=rules;story.ResetHistory();previous=null;mode=rules.Mode;age=unitAge=0;lastUnit=0;completedUnitPaid=0;lastPaid=lastRound=0;countAge=roundAge=10;shotAge=0;payoutShot=-1;}
   if(rules.IsBonusPresentationPending){group.alpha=1;BlocksBasePresentation=true;story.Render(rules.BonusPresentation);SceneId=story.SceneId;return;}
   story.SetVisible(false);BlocksBasePresentation=false;
   var bonus=rules.Bonus;driveAtmosphere.gameObject.SetActive(bonus!=null&&bonus.drive);driveAtmosphere.SetClock(age);driveGround.gameObject.SetActive(false);driveSword.gameObject.SetActive(false);driveAmount.gameObject.SetActive(bonus!=null&&bonus.drive);bool enteredRush=rules.Mode!=mode&&rules.Mode!=PlayMode.Normal;mode=rules.Mode;
   if(!object.ReferenceEquals(previous,bonus)||enteredRush){age=0;lastUnit=0;unitAge=0;payoutShot=-1;shotAge=0;}else age+=dt;
   previous=bonus;unitAge+=dt;countAge+=dt;roundAge+=dt;shotAge+=dt;impactFlash.color=Color.clear;
   if(bonus==null){
    bool entrance=rules.Mode!=PlayMode.Normal&&age<3&&rules.Active==null&&rules.BonusPresentation==null;
    group.alpha=entrance?Mathf.Clamp01((3-age)*2):0;BlocksBasePresentation=entrance;SceneId=entrance?"rush-entrance":"";
    if(!entrance)return;
    actor.gameObject.SetActive(false);decisionRing.gameObject.SetActive(false);attackBlade.gameObject.SetActive(false);answerBlade.gameObject.SetActive(false);
    foreach(var lamp in countLamps)lamp.color=Color.clear;title.rectTransform.localScale=Vector3.one*(1+Mathf.Exp(-age*6)*.2f);title.rectTransform.anchoredPosition=new Vector2(0,350);reveal.rectTransform.localScale=Vector3.one;reveal.rectTransform.anchoredPosition=new Vector2(0,35);halo.color=new Color(.33f,.8f,1,.16f);halo.rectTransform.localRotation=Quaternion.Euler(0,0,age*12);art.rectTransform.localScale=Vector3.one;total.rectTransform.localScale=Vector3.one;
    roundHeader.text=unitCounter.text="";title.text=rules.Mode==PlayMode.SwordRush?"SWORD\nRUSH":"War of\nUnderworld";title.color=new Color(1,.83f,.4f);total.text=rules.BonusPaid>0?$"獲得 {rules.BonusPaid:N0} 玉":"";progress.text="右打ち";reveal.text=rules.Remaining.ToString()+"回";fill.rectTransform.sizeDelta=new Vector2(750,15);SetArt(4,new Color(.55f,.4f,.72f));return;
   }
   var unit=rules.BonusProgress;
   if(lastUnit!=unit.UnitIndex){if(lastUnit>0)completedUnitPaid=unit.UnitTargetPayout;lastUnit=unit.UnitIndex;unitAge=0;}
   if(rules.BonusPaid!=lastPaid){lastPaid=rules.BonusPaid;countAge=0;}
   if(unit.RoundInUnit!=lastRound){lastRound=unit.RoundInUnit;roundAge=0;}
   group.alpha=1;BlocksBasePresentation=true;SceneId=unitAge<1.6f&&unit.UnitIndex>1?"drive-unit-reveal":"bonus-counting";
   title.text=bonus.drive?"SWORD\nDRIVE":bonus.title=="LAST FLOOR BONUS"?"LAST FLOOR\nBONUS":bonus.title;title.color=bonus.drive?new Color(1,.79f,.28f):new Color(.86f,.92f,1);
   roundHeader.text=$"ROUND {unit.RoundInUnit}";unitCounter.text=$"{unit.UnitPaid:N0} / {unit.UnitTargetPayout:N0}";
   total.text=$"獲得 {rules.BonusPaid:N0} 玉";progress.text=$"告知 {unit.RevealedPayout:N0} 玉　　　{unit.CountInRound} / 10 COUNT";
   bool unitReveal=unitAge<1.6f&&unit.UnitIndex>1;
   reveal.text=unitReveal?$"+{completedUnitPaid:N0}":"";
   float settled=Mathf.SmoothStep(0,1,Mathf.Clamp01((age-.65f)/.75f));title.rectTransform.localScale=Vector3.one*Mathf.Lerp(1.25f,.38f,settled);title.rectTransform.anchoredPosition=new Vector2(0,Mathf.Lerp(330,557,settled));
   // One finite impact for a newly opened unit, followed by a readable counting composition.
   float stamp=unitReveal?1+Mathf.Exp(-unitAge*6.5f)*.45f:1;reveal.rectTransform.localScale=Vector3.one*stamp;reveal.rectTransform.anchoredPosition=new Vector2(0,Mathf.Lerp(-200,50,Mathf.SmoothStep(0,1,Mathf.Clamp01(unitAge/.45f))));
   if(unitReveal&&unitAge<.22f)impactFlash.color=new Color(1,.93f,.72f,(1-unitAge/.22f)*.38f);
   total.rectTransform.localScale=Vector3.one*(1+.065f*Mathf.Exp(-countAge*11));roundHeader.rectTransform.localScale=Vector3.one*(1+.09f*Mathf.Exp(-roundAge*7));
   halo.color=new Color(1,.73f,.23f,unitReveal?.28f:bonus.drive?.06f:.025f);halo.rectTransform.localRotation=Quaternion.Euler(0,0,unitReveal?unitAge*22:age*1.5f);
   perimeter.color=bonus.drive?new Color(1,.78f,.25f,.85f):new Color(.44f,.80f,.95f,.68f);
   for(int i=0;i<10;i++)countLamps[i].color=i<unit.CountInRound?new Color(1,.87f,.45f):new Color(.16f,.24f,.32f,.8f);
   art.rectTransform.localScale=Vector3.one*(1+.035f*Mathf.Clamp01(unitAge/8));art.rectTransform.anchoredPosition=new Vector2(Mathf.Sin(age*.13f)*25,50+Mathf.Sin(age*.17f)*15);
   reveal.color=new Color(1,.9f,.45f,unitAge<1.6f&&unit.UnitIndex>1?Mathf.Clamp01((1.6f-unitAge)*2):.8f);
   fill.rectTransform.sizeDelta=new Vector2(750*Mathf.Clamp01(unit.UnitPaid/(float)unit.UnitTargetPayout),15);
   RenderPayoutStory(bonus,unit,dt);
   driveAmount.text=unitReveal?"":rules.BonusPaid.ToString("N0");driveAmount.rectTransform.localScale=Vector3.one*(1+.045f*Mathf.Exp(-countAge*12));driveGround.rectTransform.anchoredPosition=new Vector2(0,-365+Mathf.Sin(age*.32f)*8);
   SetArt(bonus.drive?(unit.UnitIndex-1)%2==0?3:4:4,bonus.drive?new Color(.82f,.68f,.49f):new Color(.61f,.68f,.82f));if(bonus.drive){art.color=Color.clear;halo.color=new Color(1,.75f,.30f,unitReveal?.018f+.20f*Mathf.Exp(-unitAge*10):.012f);}
  }
  void RenderPayoutStory(Award award,BonusProgress unit,float dt){
   // A victory tableau continues the same protagonist; payout never starts a different battle.
   actor.gameObject.SetActive(!award.drive);decisionRing.gameObject.SetActive(false);attackBlade.gameObject.SetActive(false);answerBlade.gameObject.SetActive(false);
   actor.texture=p.narrativeAtlas;actor.uvRect=new Rect(0,0,1f/3f,1);actor.rectTransform.sizeDelta=new Vector2(620,1240);actor.rectTransform.anchoredPosition=new Vector2(-100,-45);actor.rectTransform.localScale=Vector3.one*.83f;actor.color=new Color(.82f,.94f,1);
   if(!award.drive){title.text="封印突破\nBONUS";title.rectTransform.anchoredPosition=new Vector2(0,490);title.rectTransform.localScale=Vector3.one*.6f;}
  }
  void SetArt(int cell,Color tint){art.gameObject.SetActive(true);art.texture=p.directorAtlas;art.uvRect=new Rect(0,.5f,1f/3f,.5f);art.color=p.directorAtlas?new Color(.25f,.40f,.53f):Color.clear;}
 }
}
