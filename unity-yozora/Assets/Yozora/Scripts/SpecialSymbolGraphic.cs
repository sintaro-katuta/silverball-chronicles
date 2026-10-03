using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 // Dedicated non-character plate for the episode-only normal 0 / 8 symbols.
 // Numbers remain Text so the glyph is readable; this does not pick a ticket.
 [RequireComponent(typeof(CanvasRenderer))]
 public sealed class SpecialSymbolGraphic:MaskableGraphic {
  public int digit;
  protected override void OnPopulateMesh(VertexHelper vh){
   vh.Clear();float w=rectTransform.rect.width*.5f,h=rectTransform.rect.height*.5f;
   Color light=digit==0?new Color(.85f,.69f,1,color.a):new Color(1,.85f,.48f,color.a);
   Color dark=digit==0?new Color(.25f,.045f,.42f,color.a):new Color(.38f,.065f,.18f,color.a);
   int count=digit==0?12:8;
   for(int j=0;j<count;j++){float a=(j+.5f)*Mathf.PI*2/count,b=(j+1.5f)*Mathf.PI*2/count;Vector2 p=new Vector2(Mathf.Cos(a)*w,Mathf.Sin(a)*h),q=new Vector2(Mathf.Cos(b)*w,Mathf.Sin(b)*h);Band(vh,p,q,.95f,.87f,light);Band(vh,p,q,.87f,.70f,dark);Band(vh,p,q,.70f,.66f,light);}
  }
  void Band(VertexHelper vh,Vector2 p,Vector2 q,float outer,float inner,Color tint){int k=vh.currentVertCount;vh.AddVert(p*outer,tint,Vector2.zero);vh.AddVert(q*outer,tint,Vector2.zero);vh.AddVert(q*inner,tint,Vector2.zero);vh.AddVert(p*inner,tint,Vector2.zero);vh.AddTriangle(k,k+1,k+2);vh.AddTriangle(k,k+2,k+3);}
 }
}
