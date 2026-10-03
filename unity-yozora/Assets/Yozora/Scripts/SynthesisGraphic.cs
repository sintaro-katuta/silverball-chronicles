using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 // Resolution-independent layered ritual geometry. Rebuilt only when phase changes;
 // transforms animate it without per-frame mesh allocation.
 [RequireComponent(typeof(CanvasRenderer))]
 public sealed class SynthesisGraphic:MaskableGraphic {
  public bool rays;
  protected override void OnPopulateMesh(VertexHelper vh){
   vh.Clear();float r=Mathf.Min(rectTransform.rect.width,rectTransform.rect.height)*.48f;
   if(rays){for(int i=0;i<36;i++){float a=i*Mathf.PI*2/36;Quad(vh,At(a,r*.57f),At(a+.003f,r*.57f),At(a+.009f,r),At(a-.009f,r));}return;}
   Ring(vh,r,2);Ring(vh,r*.92f,5);Ring(vh,r*.68f,2);Ring(vh,r*.52f,3);
   for(int i=0;i<24;i++){float a=i*Mathf.PI*2/24;Line(vh,At(a,r*.75f),At(a,r*.86f),3);Line(vh,At(a,r*.86f),At(a+.035f,r*.82f),3);}
   for(int i=0;i<6;i++){float a=i*Mathf.PI/3;Line(vh,At(a,r*.65f),At(a+Mathf.PI*2/3,r*.65f),2);}
  }
  static Vector2 At(float a,float r)=>new Vector2(Mathf.Cos(a)*r,Mathf.Sin(a)*r);
  void Ring(VertexHelper v,float r,float w){for(int i=0;i<128;i++){float a=i*Mathf.PI/64,b=(i+1)*Mathf.PI/64;Quad(v,At(a,r-w),At(b,r-w),At(b,r),At(a,r));}}
  void Line(VertexHelper v,Vector2 a,Vector2 b,float w){Vector2 n=new Vector2(-(b-a).y,(b-a).x).normalized*w;Quad(v,a-n,b-n,b+n,a+n);}
  void Quad(VertexHelper v,Vector2 a,Vector2 b,Vector2 c,Vector2 d){int n=v.currentVertCount;v.AddVert(a,color,Vector2.zero);v.AddVert(b,color,Vector2.zero);v.AddVert(c,color,Vector2.zero);v.AddVert(d,color,Vector2.zero);v.AddTriangle(n,n+1,n+2);v.AddTriangle(n,n+2,n+3);}
 }
}
