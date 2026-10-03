using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 // Display-only punctuation. It reads the settled Ticket and never changes it.
 public sealed class SymbolResultView {
  readonly RectTransform root;readonly Image flash;readonly Text reach;readonly SynthesisGraphic rays;readonly Image[] edges=new Image[4];
  readonly ReferencePresentation p;Ticket last;bool sounded;
  T Add<T>(string name,Vector2 size,Vector2 pos)where T:Graphic{var go=new GameObject(name,typeof(RectTransform),typeof(CanvasRenderer));go.transform.SetParent(root,false);var g=go.AddComponent<T>();g.raycastTarget=false;g.rectTransform.sizeDelta=size;g.rectTransform.anchoredPosition=pos;return g;}
  public SymbolResultView(ReferencePresentation presentation){p=presentation;root=new GameObject("Symbol settlement punctuation",typeof(RectTransform)).GetComponent<RectTransform>();root.SetParent(p.cutIn.parent,false);root.sizeDelta=new Vector2(1000,1520);
   rays=Add<SynthesisGraphic>("Result perimeter rays",new Vector2(1750,1750),Vector2.zero);rays.rays=true;
   edges[0]=Add<Image>("Result upper edge",new Vector2(1000,8),new Vector2(0,600));edges[1]=Add<Image>("Result lower edge",new Vector2(1000,8),new Vector2(0,-610));edges[2]=Add<Image>("Result left edge",new Vector2(8,1220),new Vector2(-440,0));edges[3]=Add<Image>("Result right edge",new Vector2(8,1220),new Vector2(440,0));
   reach=Add<Text>("Reach arrival",new Vector2(880,200),new Vector2(0,-395));reach.font=p.cutTitle.font;reach.fontSize=124;reach.fontStyle=FontStyle.BoldAndItalic;reach.alignment=TextAnchor.MiddleCenter;reach.text="REACH";var outline=reach.gameObject.AddComponent<Outline>();outline.effectColor=new Color(.08f,.01f,.18f);outline.effectDistance=new Vector2(5,-5);
   flash=Add<Image>("Result brief flash",new Vector2(1000,1520),Vector2.zero);
  }
  public void Render(Ticket a,bool rush,bool blocked){
   bool active=a!=null&&a.reach&&!blocked;root.gameObject.SetActive(active);if(!active){last=null;sounded=false;return;}
   if(last!=a){last=a;sounded=false;}
   float t=a.elapsed,age=t-ReferenceSequenceTimeline.Result(p.machine.Rules.Mode);bool result=age>=0;float revealAge=t-ReferenceSequenceTimeline.SymbolReveal(p.machine.Rules.Mode);
   float intro=t-2.1f;bool showReach=!rush&&intro>=0&&intro<2.4f;reach.gameObject.SetActive(showReach);if(showReach){float enter=Mathf.Clamp01(intro/.25f);reach.rectTransform.localScale=Vector3.one*Mathf.Lerp(1.45f,1,1-Mathf.Pow(1-enter,3));reach.color=new Color(.75f,.86f,1,Mathf.Clamp01((2.4f-intro)/.3f));}
   bool win=revealAge>=0&&a.win;rays.gameObject.SetActive(win);foreach(var edge in edges){edge.gameObject.SetActive(win);if(win)edge.color=new Color(1,.79f,.28f,Mathf.Clamp01(age*5)*.85f);}
   if(win){rays.color=new Color(1,.78f,.35f,.28f*Mathf.Clamp01(age*5));rays.rectTransform.localRotation=Quaternion.Euler(0,0,age*7);rays.rectTransform.localScale=Vector3.one*(1+Mathf.Exp(-age*5)*.2f);}
   flash.color=win?new Color(.8f,.9f,1,Mathf.Max(0,1-revealAge/.2f)*.40f):Color.clear;
   if(result&&!sounded){sounded=true;p.machine.soundscape?.PlayCue(a.win?"shatter":"miss");}
  }
  public static float Landing(float age){return age<0?1:1+.14f*Mathf.Exp(-age*9)*Mathf.Sin(age*22);}
 }
}
