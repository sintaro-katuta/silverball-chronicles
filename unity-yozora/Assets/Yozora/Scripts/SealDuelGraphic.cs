using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 // Persistent, faceted barrier. Damage, recoil and fracture share one spatial object.
 public sealed class SealDuelGraphic:MaskableGraphic {
  float damage,charge,opening,clock,impact;bool victory;
  public void Pose(float d,float c,float o,float t,float hit,bool win){damage=d;charge=c;opening=o;clock=t;impact=hit;victory=win;SetVerticesDirty();}
  static Color C(float r,float g,float b,float a=1)=>new Color(r,g,b,a);
  void Quad(VertexHelper v,Vector2 a,Vector2 b,Vector2 c,Vector2 d,Color x,Color y){int k=v.currentVertCount;v.AddVert(a,x,Vector2.zero);v.AddVert(b,x,Vector2.zero);v.AddVert(c,y,Vector2.zero);v.AddVert(d,y,Vector2.zero);v.AddTriangle(k,k+1,k+2);v.AddTriangle(k,k+2,k+3);}
  void Line(VertexHelper v,Vector2 a,Vector2 b,float width,Color c){Vector2 n=(b-a).normalized;n=new Vector2(-n.y,n.x)*width*.5f;Quad(v,a-n,b-n,b+n,a+n,c,c);}
  void Ring(VertexHelper v,float radius,float width,Color a,Color b,float angle=0){for(int i=0;i<96;i++){float p=i*Mathf.PI/48+angle,q=(i+1)*Mathf.PI/48+angle;var x=new Vector2(Mathf.Cos(p),Mathf.Sin(p)*1.22f);var y=new Vector2(Mathf.Cos(q),Mathf.Sin(q)*1.22f);Quad(v,x*(radius-width),y*(radius-width),y*radius,x*radius,a,b);}}
  protected override void OnPopulateMesh(VertexHelper v){v.Clear();float scale=rectTransform.rect.width/760;var before=v.currentVertCount;
   float fade=1-opening;float breath=.75f+.25f*Mathf.Sin(clock*.65f);Color rim=Color.Lerp(C(.24f,.53f,.67f),C(.55f,.95f,1),charge);
   Ring(v,340,22,C(.025f,.045f,.07f,fade),C(.13f,.25f,.32f,fade));Ring(v,326,3,C(.7f,.9f,1,fade),rim*new Color(1,1,1,fade));Ring(v,297,6,C(.10f,.20f,.27f,fade),C(.27f,.5f,.62f,fade));
   // The six heavy crystal leaves open from their common fracture only on a settled win.
   for(int i=0;i<6;i++){float a=(i*60+30)*Mathf.Deg2Rad,b=(i*60+90)*Mathf.Deg2Rad;var p=new Vector2(Mathf.Cos(a)*286,Mathf.Sin(a)*350);var q=new Vector2(Mathf.Cos(b)*286,Mathf.Sin(b)*350);var mid=(p+q)*.5f;Vector2 shift=mid.normalized*opening*460;var center=shift;var depth=new Vector2(12,-20)*(1+opening);
    Quad(v,p+shift,q+shift,q+shift+depth,p+shift+depth,C(.10f,.22f,.31f,fade),C(.01f,.03f,.06f,fade));
    int k=v.currentVertCount;v.AddVert(center,C(.12f+.13f*charge,.2f+.19f*charge,.3f+.24f*charge,fade),Vector2.zero);v.AddVert(p+shift,C(.035f,.08f,.15f,fade),Vector2.zero);v.AddVert(q+shift,C(.19f,.33f,.45f,fade),Vector2.zero);v.AddTriangle(k,k+1,k+2);
    Line(v,p+shift,q+shift,4,C(.53f,.72f,.85f,fade*.8f));Line(v,center,p+shift,2,C(.28f,.56f,.72f,fade*.6f));
    if(damage>0){Vector2 bend=mid*.37f+new Vector2(17,-12);Color crack=C(.55f,.88f,1,fade*damage);Line(v,shift,bend+shift,3+charge*4,crack);Line(v,bend+shift,mid*.88f+shift,2+charge*2,crack);Line(v,bend+shift,mid*.5f+new Vector2(30,30)+shift,2,crack);}
   }
   // Engraved central four-point seal and small metal locks remain in place between attacks.
   for(int i=0;i<4;i++){float a=i*Mathf.PI/2;Vector2 p=new Vector2(Mathf.Cos(a),Mathf.Sin(a));Vector2 n=new Vector2(-p.y,p.x);Quad(v,p*105,p*20+n*20,-p*10,p*20-n*20,C(.69f,.85f,.93f,fade),C(.20f,.42f,.56f,fade));}
   Ring(v,61,8,C(.20f,.42f,.52f,fade),C(.65f,.86f,.93f,fade));
   for(int i=0;i<12;i++){float a=i*Mathf.PI/6;var p=new Vector2(Mathf.Cos(a)*312,Mathf.Sin(a)*382);Line(v,p,p*1.035f,5,C(.7f,.87f,.92f,fade*.7f));}
   if(charge>0)for(int i=0;i<32;i++){float a=i*2.39996f;float r=70+Mathf.Repeat(i*31-clock*65,310);var p=new Vector2(Mathf.Cos(a)*r,Mathf.Sin(a)*r*1.22f);Line(v,p,p+p.normalized*12,2,C(.42f,.83f,1,charge*.6f*breath*fade));}
   if(impact>0){Ring(v,75+(1-impact)*270,4,C(.5f,.84f,1,impact*.5f),C(.9f,.99f,1,impact));}
   if(victory&&opening>0)for(int i=0;i<36;i++){float a=i*2.39996f;var p=new Vector2(Mathf.Cos(a),Mathf.Sin(a));float r=50+opening*(140+i%5*80);Line(v,p*r,p*(r+12+i%4*9),4,C(.7f,.93f,1,(1-opening)*.9f));}
   UIVertex vert=new UIVertex();for(int i=before;i<v.currentVertCount;i++){v.PopulateUIVertex(ref vert,i);vert.position*=scale;v.SetUIVertex(vert,i);}
  }
 }
}
