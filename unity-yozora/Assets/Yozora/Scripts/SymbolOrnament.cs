using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 // Procedural metal around the numeral. Faces remain separate alpha sprites.
 [RequireComponent(typeof(CanvasRenderer))]
 public sealed class SymbolOrnament:MaskableGraphic {
  public bool crystal;
  void Polygon(VertexHelper vh,Vector2[] p,Color tint){int b=vh.currentVertCount;var center=Vector2.zero;foreach(var q in p)center+=q;center/=p.Length;vh.AddVert(center,tint,Vector2.zero);foreach(var q in p)vh.AddVert(q,tint,Vector2.zero);for(int i=0;i<p.Length;i++)vh.AddTriangle(b,b+i+1,b+1+(i+1)%p.Length);}
  void Ring(VertexHelper vh,float radius,float inner,Color upper,Color lower){int n=crystal?6:8;float start=crystal?30:22.5f;var size=rectTransform.rect.size*.5f;for(int i=0;i<n;i++){float a=(start+i*360f/n)*Mathf.Deg2Rad,b=(start+(i+1)*360f/n)*Mathf.Deg2Rad;int k=vh.currentVertCount;foreach(var p in new[]{new Vector2(Mathf.Cos(a),Mathf.Sin(a))*radius,new Vector2(Mathf.Cos(b),Mathf.Sin(b))*radius,new Vector2(Mathf.Cos(b),Mathf.Sin(b))*inner,new Vector2(Mathf.Cos(a),Mathf.Sin(a))*inner})vh.AddVert(Vector2.Scale(p,size),Color.Lerp(lower,upper,(p.y+1)/2),Vector2.zero);vh.AddTriangle(k,k+1,k+2);vh.AddTriangle(k,k+2,k+3);}}
  protected override void OnPopulateMesh(VertexHelper vh){vh.Clear();var c=color;Ring(vh,1,.92f,new Color(.96f,1,1,c.a),new Color(.16f,.23f,.29f,c.a));Ring(vh,.92f,.83f,Color.Lerp(c,Color.white,.65f),c*.7f);Ring(vh,.83f,.77f,new Color(.05f,.09f,.13f,c.a),new Color(.7f,.83f,.9f,c.a));Ring(vh,.77f,.7f,Color.white,c);if(crystal){var s=rectTransform.rect.size;Polygon(vh,new[]{new Vector2(0,s.y*.40f),new Vector2(s.x*.21f,s.y*.19f),new Vector2(0,-s.y*.40f),new Vector2(-s.x*.21f,s.y*.19f)},new Color(c.r,c.g,c.b,c.a*.55f));return;}
   var size=rectTransform.rect.size;for(int side=-1;side<=1;side+=2){Polygon(vh,new[]{new Vector2(side*size.x*.26f,-size.y*.16f),new Vector2(side*size.x*.62f,size.y*.47f),new Vector2(side*size.x*.49f,size.y*.02f),new Vector2(side*size.x*.60f,-size.y*.12f),new Vector2(side*size.x*.30f,-size.y*.4f)},Color.Lerp(c,Color.white,.65f));}
  }
 }
}
