using UnityEngine;
using UnityEngine.UI;
namespace Yozora {
 [RequireComponent(typeof(CanvasRenderer))]
 public sealed class ReferenceShape:MaskableGraphic {
  public bool screen;
  // R1 02:00 / 07:15: almost straight right edge, rounded left shoulder and lower-left sweep.
  // Normalized front elevation; the oblique video is not a dimensional survey.
  public static readonly Vector2[] ScreenOutline={
   new Vector2(-.16f,-.5f),new Vector2(.46f,-.5f),new Vector2(.5f,-.46f),
   new Vector2(.5f,.42f),new Vector2(.42f,.5f),new Vector2(-.22f,.5f),
   new Vector2(-.43f,.43f),new Vector2(-.5f,.30f),new Vector2(-.5f,-.22f),
   new Vector2(-.44f,-.32f),new Vector2(-.32f,-.41f)};
  protected override void OnPopulateMesh(VertexHelper vh){
   vh.Clear();var r=rectTransform.rect;
   Vector2[] p=screen?ScreenOutline:new[]{new Vector2(0,-.5f),new Vector2(.46f,-.38f),new Vector2(.5f,.36f),new Vector2(.28f,.5f),new Vector2(-.28f,.5f),new Vector2(-.5f,.36f),new Vector2(-.46f,-.38f)};
   vh.AddVert(new Vector3(r.center.x,r.center.y),color,new Vector2(.5f,.5f));
   foreach(var q in p)vh.AddVert(new Vector3(r.center.x+q.x*r.width,r.center.y+q.y*r.height),color,q+Vector2.one*.5f);
   for(int i=0;i<p.Length;i++)vh.AddTriangle(0,i+1,1+(i+1)%p.Length);
  }
 }
}
