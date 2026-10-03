using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 public sealed class ReferencePresentation:MonoBehaviour {
  public YozoraMachine machine;
  public RectTransform[] symbolRoots; public RawImage[] portraits;public Image[] plates;
  public Text[] numbers,shadowNumbers;public Text stage,smallDigits;public Image[] crystals;
  public RectTransform cutIn,slash; public RawImage cutPortrait;public Text cutTitle;
  public CanvasGroup cutGroup; public Image rose;public Text modeRibbon;
  public Texture2D narrativeAtlas;
  public Texture2D normalAtlas,rushAtlas,academy,sequenceAtlas,directorAtlas,bonusDirectorAtlas,amayoriSymbol;
  public UpperRushSymbolSet awakeningSymbols=new UpperRushSymbolSet();
  readonly UpperRushPresentationState upperState=new UpperRushPresentationState();UpperRushPresentationView upperView;
  public UpperRushStage UpperStage=>upperState.Stage;
  // Explicit display previews, never inferred real-machine progression rules.
  public bool PreviewUpperStage(string value){upperState.Observe(machine.Rules,0);return value=="awakening"?upperState.PreviewStage(UpperRushStage.Awakening):value=="invading"&&upperState.PreviewStage(UpperRushStage.Invading);}
  public bool PreviewUpperResult(string value){upperState.Observe(machine.Rules,0);return upperState.PreviewResult(value=="result"?UpperRushResultStyle.Result:UpperRushResultStyle.Final);}
  public void DismissUpperResult()=>upperState.DismissResult();
  SpecialSymbolGraphic[] specialPlates;public SymbolOrnament[] ornaments;
  public RectTransform[] lines;public RectTransform currentCrystal;public SymbolOrnament[] crystalShapes;
  public string SceneId {get;private set;}="normal"; ReferenceSequenceView sequence;ReferenceBonusView bonusView;RushLineGraphic resultLine;SymbolResultView resultView;YozoraRules presentationOwner;
  public int SelectedLine=>symbolState.SelectedLine;
  public float clock;float modeAge;PlayMode lastMode;readonly RushSymbolState symbolState=new RushSymbolState();
  static Rect Cell(int digit){int d=(digit==7?3:Mathf.Clamp(digit,1,6))-1;return new Rect((d%3)/3f,d<3?.5f:0,1f/3f,.5f);}
  void LateUpdate(){
   var r=machine.Rules;if(r==null)return;if(presentationOwner!=r){presentationOwner=r;clock=modeAge=0;lastMode=r.Mode;}if(!machine.Paused){clock+=Time.deltaTime;modeAge+=Time.deltaTime;}
   if(r.Mode!=lastMode){lastMode=r.Mode;modeAge=0;}
   if(!narrativeAtlas)narrativeAtlas=Resources.Load<Texture2D>("yozora-sword-poses");
   if(sequence==null)sequence=new ReferenceSequenceView(this);
   if(bonusView==null)bonusView=new ReferenceBonusView(this);
   if(upperView==null)upperView=new UpperRushPresentationView(this);
   float presentationDelta=machine.Paused?0:Time.deltaTime;
   upperState.Observe(r,presentationDelta);bonusView.Render(r,presentationDelta);
   upperView.Render(upperState,bonusView.BlocksBasePresentation);
   bool presentationBlocked=bonusView.BlocksBasePresentation||upperView.BlocksBasePresentation;
   if(resultLine==null){var go=new GameObject("Resolved five-line path",typeof(RectTransform),typeof(CanvasRenderer));go.transform.SetParent(cutIn.parent,false);resultLine=go.AddComponent<RushLineGraphic>();resultLine.raycastTarget=false;resultLine.rectTransform.sizeDelta=new Vector2(1000,1520);resultLine.color=new Color(.85f,.98f,1,1);}
   if(specialPlates==null){specialPlates=new SpecialSymbolGraphic[symbolRoots.Length];for(int i=0;i<symbolRoots.Length;i++){var go=new GameObject("Episode symbol plate",typeof(RectTransform),typeof(CanvasRenderer));go.transform.SetParent(symbolRoots[i],false);var g=go.AddComponent<SpecialSymbolGraphic>();g.raycastTarget=false;g.rectTransform.sizeDelta=new Vector2(380,450);g.rectTransform.anchoredPosition=new Vector2(0,-195);go.transform.SetAsFirstSibling();specialPlates[i]=g;}}
   var a=r.Active;bool reach=a!=null&&a.reach;float t=a?.elapsed??0;bool bonus=r.Bonus!=null;bool rush=r.Mode!=PlayMode.Normal;
   bool awakening=r.Mode==PlayMode.WarOfUnderworld&&upperState.Stage==UpperRushStage.Awakening;
   int[] grid=symbolState.Observe(r,amayoriSymbol!=null&&!awakening,upperState.SymbolSetRevision);
   SceneId=bonus?"bonus":reach?ReferenceSequenceTimeline.SceneId(t,rush):rush?"rush-symbols":"normal-symbols";
   stage.rectTransform.anchoredPosition=new Vector2(170,635);stage.rectTransform.sizeDelta=new Vector2(420,55);stage.fontSize=30;stage.transform.SetAsLastSibling();smallDigits.transform.SetAsLastSibling();smallDigits.rectTransform.anchoredPosition=new Vector2(-270,660);smallDigits.rectTransform.sizeDelta=new Vector2(210,50);smallDigits.fontSize=26;
   stage.text=rush?"": "修剣学院";stage.color=new Color(.94f,.98f,1);
   smallDigits.text=reach&&t>=ReferenceSequenceTimeline.Start(rush)?a.digit+"  ·  "+a.digit:"";
   modeRibbon.text=rush?(r.Mode==PlayMode.SwordRush?"SWORD RUSH":"War of Underworld  #α"):"";
   if(r.Mode==PlayMode.WarOfUnderworld)modeRibbon.text="War of Underworld\n"+(awakening?"AWAKENING":"INVADING")+(upperState.IsStagePreview?"  · 表示試演":"");
   modeRibbon.rectTransform.sizeDelta=r.Mode==PlayMode.WarOfUnderworld?new Vector2(850,105):new Vector2(550,55);
   modeRibbon.rectTransform.anchoredPosition=r.Mode==PlayMode.WarOfUnderworld?new Vector2(0,650):new Vector2(-170,640);
   modeRibbon.fontSize=r.Mode==PlayMode.WarOfUnderworld?28:30;
   modeRibbon.color=rush?new Color(1,.82f,.34f):Color.clear;
   if(academy){machine.keyArt.texture=academy;machine.keyArt.uvRect=new Rect(.02f+Mathf.Sin(clock*.08f)*.012f,.01f,.96f,.98f);machine.keyArt.color=rush?new Color(.45f,.15f,.6f):bonus?new Color(.25f,.26f,.35f):reach&&t>=3?new Color(.12f,.19f,.35f):Color.white;}
   for(int i=0;i<symbolRoots.Length;i++){
    bool show=!presentationBlocked&&!bonus&&(rush||i<3)&&(!reach||awakening||t<ReferenceSequenceTimeline.Start(rush)||t>=ReferenceSequenceTimeline.SymbolReveal(r.Mode));symbolRoots[i].gameObject.SetActive(show);if(!show)continue;
    int col=i%3,row=i/3;float stop=a!=null?ReferenceSequenceTimeline.StopTime(a,r.Mode,col):0;
    bool spinning=a!=null&&t<stop;
    int d=rush?(spinning?1+((int)(t*9)+i*2+row)%6:grid[i]):(a!=null?(spinning?1+((int)(t*9)+col*2)%6:(a.win||col!=1?a.digit:1+(a.digit+2)%6)):r.Digits[col]);
    if(awakening&&upperState.IsStagePreview&&a==null&&i==7)d=8; // R2 17:00 observed eight; preview only.
    // R1 42:00: three vertical strips, alternating half-row offset rather than a square nine-card board.
    float stagger=col==1?0:190;
    Vector2 pos=rush?new Vector2((col-1)*310,450-row*430-stagger):new Vector2((col-1)*305,col==1?-20:30);
    float slide=spinning?180-Mathf.Repeat(t*(rush?1250:2100)+col*80,360):0;
    symbolRoots[i].anchoredPosition=pos+new Vector2(0,slide);
    float scale=rush?1f:col==1?.70f:1.08f;if(reach&&t>=ReferenceSequenceTimeline.Result(r.Mode)&&!rush)scale=1.08f;symbolRoots[i].localScale=Vector3.one*scale*(a!=null?SymbolResultView.Landing(t-stop):1);symbolRoots[i].localRotation=Quaternion.identity;
    bool special=!rush&&(d==0||d==8);specialPlates[i].gameObject.SetActive(special);if(special){specialPlates[i].digit=d;specialPlates[i].SetVerticesDirty();}
    var p=portraits[i];p.gameObject.SetActive(!special);p.texture=rush?rushAtlas:normalAtlas;p.uvRect=Cell(d);p.rectTransform.sizeDelta=rush?new Vector2(335,440):new Vector2(480,980);p.rectTransform.anchoredPosition=rush?Vector2.zero:new Vector2(0,80);
    p.color=Color.white;
    // R2 00:55 specifically shows Alice 1 on the left and Kirito 1 on the right.
    // Do not infer the full number/portrait permutations from this one shot.
    if(!rush&&reach&&d==1&&col==2&&!spinning)p.uvRect=Cell(3);
    if(rush&&d==0&&amayoriSymbol){p.texture=amayoriSymbol;p.uvRect=new Rect(0,0,1,1);}
    bool numericFallback=awakening;
    if(awakening){Texture2D portrait;Rect uv;if(awakeningSymbols!=null&&awakeningSymbols.TryGet(d,out portrait,out uv)){p.texture=portrait;p.uvRect=uv;p.gameObject.SetActive(true);numericFallback=false;}else p.gameObject.SetActive(false);}
    bool numeric=!rush||numericFallback;
    numbers[i].gameObject.SetActive(numeric);shadowNumbers[i].gameObject.SetActive(numeric);ornaments[i].gameObject.SetActive(numeric&&!special);
    numbers[i].fontSize=numericFallback?215:298;shadowNumbers[i].fontSize=numericFallback?225:310;
    numbers[i].rectTransform.anchoredPosition=numericFallback?new Vector2(-3,-60):new Vector2(-3,-193);shadowNumbers[i].rectTransform.anchoredPosition=numericFallback?new Vector2(5,-67):new Vector2(5,-203);
    ornaments[i].rectTransform.anchoredPosition=numericFallback?new Vector2(0,-65):new Vector2(0,-195);ornaments[i].rectTransform.sizeDelta=numericFallback?new Vector2(270,300):new Vector2(345,345);
    if(numeric){numbers[i].text=shadowNumbers[i].text=d.ToString();var c=awakening&&d==8?new Color(.67f,.23f,.92f):d==7?new Color(1,.78f,.15f):d%2==0?new Color(.16f,.85f,.72f):new Color(.85f,.25f,.8f);ornaments[i].color=c;numbers[i].color=Color.Lerp(c,Color.white,.5f);}
   }
   for(int i=0;i<crystalShapes.Length;i++){crystalShapes[i].gameObject.SetActive(i<r.Holds.Count&&!bonus&&!presentationBlocked);crystalShapes[i].color=new Color(.32f,.92f,.76f);}
   if(currentCrystal)currentCrystal.gameObject.SetActive(a!=null&&!bonus&&!presentationBlocked&&(!reach||t<ReferenceSequenceTimeline.Start(rush)));
   for(int i=0;i<lines.Length;i++)lines[i].gameObject.SetActive(false);
   bool showResult=!presentationBlocked&&rush&&reach&&a.win&&t>=ReferenceSequenceTimeline.SymbolReveal(r.Mode);
   resultLine.gameObject.SetActive(showResult);
   if(showResult){var winning=RushSymbolLayout.Lines[symbolState.SelectedLine];Vector2 marker=new Vector2(0,-120);resultLine.SetPoints(symbolRoots[winning[0]].anchoredPosition+marker,symbolRoots[winning[1]].anchoredPosition+marker,symbolRoots[winning[2]].anchoredPosition+marker);}
   if(reach){machine.headline.text="";machine.subtitle.text="";}
   sequence.Render(presentationBlocked||awakening?null:a,rush);
   if(resultView==null)resultView=new SymbolResultView(this);resultView.Render(a,rush,presentationBlocked||awakening);
   stage.gameObject.SetActive(!presentationBlocked&&!rush&&(!reach||t<ReferenceSequenceTimeline.Start(rush)));smallDigits.gameObject.SetActive(!presentationBlocked);modeRibbon.gameObject.SetActive(!presentationBlocked&&(!reach||t<ReferenceSequenceTimeline.Start(rush)));
   if(bonusView.SceneId!="")SceneId=bonusView.SceneId;
   else if(upperView.SceneId!="")SceneId=upperView.SceneId;
   else if(r.Mode==PlayMode.WarOfUnderworld&&(awakening||!reach))SceneId=awakening?"upper-awakening-symbols":"upper-invading-symbols";
   if(presentationBlocked){machine.headline.text="";machine.subtitle.text="";machine.payoutLabel.text="";}
   if(bonus&&!presentationBlocked){machine.subtitle.text=$"獲得 {r.BonusPaid:N0} 玉";machine.payoutLabel.text=$"進行 {r.BonusCount/10+1} R";}
   if(!reach&&!bonus)machine.subtitle.text="";
   if(rose)rose.color=bonus?new Color(.5f,.85f,1):reach&&t>4?new Color(.06f,.6f,1):new Color(.04f,.2f,.31f);
  }
 }
}
