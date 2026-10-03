using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 // Original curved light field inspired by R2 15:50; no source video pixels.
 public sealed class DriveAtmosphereGraphic:MaskableGraphic {
  float clock;
  public void SetClock(float value){clock=value;SetVerticesDirty();}
  protected override void OnPopulateMesh(VertexHelper vh){
   vh.Clear();float w=rectTransform.rect.width*.5f,h=rectTransform.rect.height*.5f;
   Quad(vh,new Vector2(-w,-h),new Vector2(w,-h),new Vector2(w,h),new Vector2(-w,h),new Color(.002f,.012f,.065f,1));
   for(int layer=0;layer<5;layer++)for(int i=0;i<72;i++){
    float u=i/72f,v=(i+1)/72f,x=Mathf.Lerp(-w*1.1f,w*1.1f,u),nx=Mathf.Lerp(-w*1.1f,w*1.1f,v);
    float y=Wave(u,layer,h),ny=Wave(v,layer,h);float height=h*(.19f+layer*.035f);
    Color core=new Color(.01f,.4f+layer*.06f,.68f,.055f),edge=new Color(.005f,.07f,.4f,0);
    Gradient(vh,new Vector2(x,y-height),new Vector2(nx,ny-height),new Vector2(nx,ny),new Vector2(x,y),edge,core);
    Gradient(vh,new Vector2(x,y),new Vector2(nx,ny),new Vector2(nx,ny+height*.5f),new Vector2(x,y+height*.5f),core,edge);
   }
   for(int beam=0;beam<2;beam++)for(int i=0;i<50;i++){
    float x=Mathf.Lerp(-w,w,i/50f),nx=Mathf.Lerp(-w,w,(i+1)/50f),y=h*(.70f-beam*.30f)-x*.12f+Mathf.Sin(clock*.25f+beam)*18;
    Color c=beam==0?new Color(.64f,.2f,1,.38f):new Color(.08f,.72f,1,.48f);
    for(int glow=3;glow>0;glow--){Color gc=c;gc.a*=.2f/glow;Quad(vh,new Vector2(x,y-glow*6),new Vector2(nx,y-(nx-x)*.12f-glow*6),new Vector2(nx,y-(nx-x)*.12f+glow*6),new Vector2(x,y+glow*6),gc);}
   }
   for(int i=0;i<16;i++){float x=Mathf.Sin(i*12.19f)*w*.88f,y=Mathf.Repeat(i*113+clock*(9+i%3*4)+h,2*h)-h;Diamond(vh,new Vector2(x,y),i%5==0?4:2,new Color(.46f,.7f,1,.22f));}
   Vector2 orb=new Vector2(-w*.60f+Mathf.Sin(clock*.3f)*14,h*.40f+Mathf.Sin(clock*.4f)*12);
   for(int k=4;k>0;k--)Diamond(vh,orb,14+k*7,new Color(1,.8f,.2f,.04f));Diamond(vh,orb,13,new Color(1,.91f,.52f,.9f));
   for(int i=0;i<5;i++){float a=i*1.2566f+clock*.22f;Vector2 p=orb+new Vector2(Mathf.Cos(a)*25,Mathf.Sin(a)*13);Diamond(vh,p,6,new Color(1,.65f,.18f,.8f));}
  }
  float Wave(float u,int layer,float h)=>h*(-.10f+layer*.065f+Mathf.Sin(u*4.2f+clock*.22f+layer*.3f)*.17f+Mathf.Sin(u*10-clock*.16f)*.045f);
  static void Diamond(VertexHelper vh,Vector2 p,float r,Color c){Quad(vh,p+new Vector2(-r,0),p+new Vector2(0,-r*1.8f),p+new Vector2(r,0),p+new Vector2(0,r*1.8f),c);}
  static void Quad(VertexHelper vh,Vector2 a,Vector2 b,Vector2 c,Vector2 d,Color tint)=>Gradient(vh,a,b,c,d,tint,tint);
  static void Gradient(VertexHelper vh,Vector2 a,Vector2 b,Vector2 c,Vector2 d,Color bottom,Color top){int n=vh.currentVertCount;vh.AddVert(a,bottom,Vector2.zero);vh.AddVert(b,bottom,Vector2.zero);vh.AddVert(c,top,Vector2.zero);vh.AddVert(d,top,Vector2.zero);vh.AddTriangle(n,n+1,n+2);vh.AddTriangle(n,n+2,n+3);}
 }
}
