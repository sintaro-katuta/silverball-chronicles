using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 [RequireComponent(typeof(CanvasRenderer))]
 public sealed class RushLineGraphic:MaskableGraphic {
  public Vector2 first,middle,last;
  public void SetPoints(Vector2 a,Vector2 b,Vector2 c){if(first==a&&middle==b&&last==c)return;first=a;middle=b;last=c;SetVerticesDirty();}
  protected override void OnPopulateMesh(VertexHelper vh){vh.Clear();Segment(vh,first,middle,15,new Color(.3f,.6f,1,.3f));Segment(vh,middle,last,15,new Color(.3f,.6f,1,.3f));Segment(vh,first,middle,3,color);Segment(vh,middle,last,3,color);}
  void Segment(VertexHelper vh,Vector2 a,Vector2 b,float width,Color tint){Vector2 n=new Vector2(-(b-a).y,(b-a).x).normalized*width;int k=vh.currentVertCount;vh.AddVert(a-n,tint,Vector2.zero);vh.AddVert(b-n,tint,Vector2.zero);vh.AddVert(b+n,tint,Vector2.zero);vh.AddVert(a+n,tint,Vector2.zero);vh.AddTriangle(k,k+1,k+2);vh.AddTriangle(k,k+2,k+3);}
 }
}
