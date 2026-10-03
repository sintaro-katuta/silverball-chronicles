using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 public sealed class UpperRushPresentationView {
  readonly RectTransform root;readonly CanvasGroup group;readonly Text heading,drive,wins,total,scope,totalDepth;readonly SynthesisGraphic ring;readonly BonusStoryGraphic rays;readonly YozoraMachine machine;readonly RawImage resultActor;int soundedResult=-1;bool soundedTotal;
  public bool BlocksBasePresentation {get;private set;}
  public string SceneId {get;private set;}="";
  public UpperRushPresentationView(ReferencePresentation p){machine=p.machine;
   var go=new GameObject("Upper RUSH actual session result",typeof(RectTransform),typeof(CanvasGroup));root=go.GetComponent<RectTransform>();root.SetParent(p.cutIn.parent,false);root.sizeDelta=new Vector2(1000,1520);group=go.GetComponent<CanvasGroup>();group.blocksRaycasts=false;group.alpha=0;
   Add<Image>("Result ground",new Vector2(1000,1520),Vector2.zero).color=new Color(.012f,.025f,.055f);
   resultActor=Add<RawImage>("Result character picture",new Vector2(960,1500),new Vector2(200,65));resultActor.texture=p.normalAtlas;resultActor.uvRect=new Rect(2f/3f,.5f,1f/3f,.5f);resultActor.color=new Color(.58f,.68f,.82f,.85f);
   Add<Image>("Result upper reading wash",new Vector2(1000,830),new Vector2(0,315)).color=new Color(.008f,.018f,.043f,.56f);
   Add<Image>("TOTAL horizontal ribbon",new Vector2(1100,370),new Vector2(0,-340)).color=new Color(.018f,.028f,.059f,.9f);
   foreach(float y in new[]{-155f,-525f})Add<Image>("TOTAL ribbon gold edge",new Vector2(1000,5),new Vector2(0,y)).color=new Color(.94f,.73f,.3f,.9f);
   rays=Add<BonusStoryGraphic>("Result gold rays",new Vector2(1400,1800),new Vector2(0,-230));rays.kind=BonusGraphicKind.Burst;rays.color=new Color(.45f,.79f,1,.08f);
   ring=Add<SynthesisGraphic>("Circular RESULT frame",new Vector2(940,1250),new Vector2(0,30));ring.color=new Color(.35f,.88f,.85f,.7f);
   foreach(float y in new[]{275f,-100f})Add<Image>("Result separator",new Vector2(830,3),new Vector2(0,y)).color=new Color(.58f,.83f,.96f,.7f);
   heading=Label(p,"Result heading",new Vector2(910,230),new Vector2(0,440),77);
   drive=Label(p,"Completed DRIVE count",new Vector2(890,100),new Vector2(0,175),48);
   wins=Label(p,"Actual upper jackpot count",new Vector2(890,100),new Vector2(0,40),43);
   totalDepth=Label(p,"Total gold extrusion",new Vector2(920,330),new Vector2(8,-332),120);totalDepth.color=new Color(.3f,.12f,.018f);
   total=Label(p,"Actual upper payout",new Vector2(920,330),new Vector2(0,-320),120);
   scope=Label(p,"Result accounting scope",new Vector2(900,140),new Vector2(0,-600),27);scope.fontStyle=FontStyle.Normal;scope.color=new Color(.72f,.83f,.9f);
  }
  T Add<T>(string name,Vector2 size,Vector2 position)where T:Graphic{var g=new GameObject(name,typeof(RectTransform),typeof(CanvasRenderer));g.transform.SetParent(root,false);var item=g.AddComponent<T>();item.rectTransform.sizeDelta=size;item.rectTransform.anchoredPosition=position;item.raycastTarget=false;return item;}
  Text Label(ReferencePresentation p,string name,Vector2 size,Vector2 position,int fontSize){var t=Add<Text>(name,size,position);t.font=p.cutTitle.font;t.fontSize=fontSize;t.fontStyle=FontStyle.BoldAndItalic;t.color=Color.white;t.alignment=TextAnchor.MiddleCenter;t.resizeTextForBestFit=true;t.resizeTextMinSize=24;t.resizeTextMaxSize=fontSize;var outline=t.gameObject.AddComponent<Outline>();outline.effectDistance=new Vector2(3,-4);outline.effectColor=new Color(.005f,.01f,.025f);return t;}
  public void Render(UpperRushPresentationState state,bool higherPriority){
   BlocksBasePresentation=state.HasResult&&!higherPriority;group.alpha=BlocksBasePresentation?1:0;SceneId=BlocksBasePresentation?(state.ResultStyle==UpperRushResultStyle.Final?"upper-final":"upper-result-preview"):"";
   if(!BlocksBasePresentation)return;root.SetAsLastSibling();
   bool final=state.ResultStyle==UpperRushResultStyle.Final;
   // Enlarged R2 17:30 reads END. The unidentified category is not assigned an invented count.
   heading.text=final?"WAR OF UNDERWORLD\nEND":"RESULT";
   heading.color=final?new Color(.84f,.95f,1):new Color(.55f,1,.89f);ring.gameObject.SetActive(!final);
   drive.text=$"SWORD DRIVE  × {state.ResultCompletedDrives}";
   wins.text=$"上位中の当り  × {state.ResultJackpots}";
   total.text=totalDepth.text=$"TOTAL\n{state.ResultPayout:N0} 玉";
   scope.text="上位中の大当り払出"+(final?"":" · RESULT表示試演");
   float age=state.ResultElapsed;resultActor.rectTransform.anchoredPosition=new Vector2(Mathf.Lerp(300,200,Mathf.SmoothStep(0,1,Mathf.Clamp01(age/.7f))),65);
   if(soundedResult!=state.ResultId||age<.01f){soundedResult=state.ResultId;soundedTotal=false;}
   if(!soundedTotal&&age>=.9f){machine.soundscape?.PlayCue("reveal");soundedTotal=true;}
   float headerIn=Mathf.SmoothStep(0,1,Mathf.Clamp01(age/.4f));heading.rectTransform.localScale=Vector3.one*Mathf.Lerp(1.22f,1,headerIn);
   drive.color=new Color(.83f,.93f,1,Mathf.Clamp01((age-.25f)/.35f));wins.color=new Color(.83f,.93f,1,Mathf.Clamp01((age-.5f)/.35f));
   float show=Mathf.Clamp01((age-.9f)/.28f),settle=Mathf.Max(0,age-.9f);total.color=new Color(1,.84f,.36f,show);totalDepth.color=new Color(.31f,.13f,.02f,show);total.rectTransform.localScale=totalDepth.rectTransform.localScale=Vector3.one*(1+.3f*Mathf.Exp(-settle*7));scope.color=new Color(.72f,.83f,.9f,show);
   rays.rectTransform.localRotation=Quaternion.Euler(0,0,Mathf.Min(age,1.6f)*7);rays.color=new Color(.42f,.82f,1,.045f+show*.05f);

  }
 }
}
