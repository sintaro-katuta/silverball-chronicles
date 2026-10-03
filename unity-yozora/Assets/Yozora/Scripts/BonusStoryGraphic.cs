using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 public enum BonusGraphicKind { GoldCircle, Frame, Blade, Burst, Ground, EllipseMask }
 [RequireComponent(typeof(CanvasRenderer))]
 public sealed class BonusStoryGraphic:MaskableGraphic {
  public BonusGraphicKind kind;
  protected override void OnPopulateMesh(VertexHelper vh){
   vh.Clear();Vector2 s=rectTransform.rect.size*.5f;
   if(kind==BonusGraphicKind.EllipseMask){for(int i=0;i<96;i++){int n=vh.currentVertCount;vh.AddVert(Vector2.zero,color,Vector2.zero);vh.AddVert(At(i*Mathf.PI/48,s),color,Vector2.zero);vh.AddVert(At((i+1)*Mathf.PI/48,s),color,Vector2.zero);vh.AddTriangle(n,n+1,n+2);}return;}
   if(kind==BonusGraphicKind.GoldCircle){Ring(vh,s,.99f,.965f,new Color(.3f,.13f,.02f,color.a));Ring(vh,s,.958f,.925f,new Color(1,.87f,.42f,color.a));Ring(vh,s,.90f,.886f,color);Ring(vh,s,.86f,.853f,new Color(.98f,.85f,.38f,color.a));for(int i=0;i<48;i++){float a=i*Mathf.PI/24;Line(vh,At(a,s*.90f),At(a+.028f,s*.944f),2,color);}return;}
   if(kind==BonusGraphicKind.Frame){Vector2[] v={new Vector2(-s.x*.85f,-s.y),new Vector2(s.x*.85f,-s.y),new Vector2(s.x,-s.y*.88f),new Vector2(s.x,s.y*.88f),new Vector2(s.x*.85f,s.y),new Vector2(-s.x*.85f,s.y),new Vector2(-s.x,s.y*.88f),new Vector2(-s.x,-s.y*.88f)};for(int i=0;i<8;i++){Line(vh,v[i],v[(i+1)%8],3,color);Line(vh,v[i]*.96f,v[(i+1)%8]*.96f,1,color);}return;}
   if(kind==BonusGraphicKind.Blade){Quad(vh,new Vector2(-s.x*.16f,-s.y),new Vector2(s.x*.16f,-s.y),new Vector2(s.x*.10f,s.y*.7f),new Vector2(0,s.y),color);Quad(vh,new Vector2(-s.x*.7f,-s.y*.65f),new Vector2(s.x*.7f,-s.y*.65f),new Vector2(s.x*.7f,-s.y*.59f),new Vector2(-s.x*.7f,-s.y*.59f),new Color(1,.9f,.65f,color.a));return;}
   if(kind==BonusGraphicKind.Ground){for(int i=0;i<19;i++){float x=(i-9)*s.x/9;Line(vh,new Vector2(x,-s.y),new Vector2(x*.18f,s.y),2,color);}for(int i=0;i<7;i++){float y=-s.y+Mathf.Pow(i/6f,.65f)*2*s.y;Line(vh,new Vector2(-s.x,y),new Vector2(s.x,y),2,color);}return;}
   for(int i=0;i<36;i++){float a=i*Mathf.PI/18;Quad(vh,At(a,s*.22f),At(a+.012f,s*.22f),At(a+.02f,s),At(a-.02f,s),color);}
  }
  static void Ring(VertexHelper vh,Vector2 size,float outer,float inner,Color tint){for(int i=0;i<128;i++){float a=i*Mathf.PI/64,b=(i+1)*Mathf.PI/64;Quad(vh,At(a,size*outer),At(b,size*outer),At(b,size*inner),At(a,size*inner),tint);}}
  static Vector2 At(float a,Vector2 s)=>new Vector2(Mathf.Cos(a)*s.x,Mathf.Sin(a)*s.y);
  static void Line(VertexHelper vh,Vector2 a,Vector2 b,float w,Color c){Vector2 n=new Vector2(-(b-a).y,(b-a).x).normalized*w;Quad(vh,a-n,b-n,b+n,a+n,c);}
  static void Quad(VertexHelper vh,Vector2 a,Vector2 b,Vector2 c,Vector2 d,Color color){int n=vh.currentVertCount;vh.AddVert(a,color,Vector2.zero);vh.AddVert(b,color,Vector2.zero);vh.AddVert(c,color,Vector2.zero);vh.AddVert(d,color,Vector2.zero);vh.AddTriangle(n,n+1,n+2);vh.AddTriangle(n,n+2,n+3);}
 }
}
