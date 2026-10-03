using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

// Visual-only six-sector wheel. Sensor positions and rotation remain owned by FairMechanismBuilder.
public static class FairRouletteGeometry {
 const float Radius=.043f,Orbit=.03f,Hole=.0077f;
 const string Folder="Assets/Yozora/Generated/";
 public static void Build(Transform rotor,Material chrome){
  var ivory=Material("Ivory sectors",new Color(.84f,.81f,.69f),.18f,.72f);
  var gold=Material("Gold winning sectors",new Color(.91f,.64f,.18f),.82f,.87f);
  var dark=Material("Pocket interior",new Color(.026f,.025f,.021f),.12f,.36f);
  for(int i=0;i<6;i++)Sector(rotor,i,i%3==0?gold:ivory,dark);
  Ring(rotor,"Continuous outer wheel rim",Radius-.001f,Radius,.003f,.0055f,chrome);
  Ring(rotor,"Low centre hub",0,.0085f,.008f,.011f,chrome);
  for(int i=0;i<6;i++){
   float angle=(i*60+30)*Mathf.Deg2Rad;var mesh=new Data();
   var axis=new Vector3(Mathf.Cos(angle),0,Mathf.Sin(angle));var side=new Vector3(-axis.z,0,axis.x)*.0006f;
   Vector3 a=axis*.008f+Vector3.up*.011f,b=axis*(Radius-.001f)+Vector3.up*.006f;
   mesh.Quad(a+side,b+side,b-side,a-side);
   Emit(rotor,"Radial divider "+i,mesh,chrome);
  }
 }
 static float Height(Vector2 p)=>Mathf.Lerp(.010f,.004f,Mathf.Clamp01(p.magnitude/Radius));
 static Vector3 V(Vector2 p,float y)=>new Vector3(p.x,y,p.y);
 static void Sector(Transform parent,int index,Material surface,Material dark){
  float angle=index*Mathf.PI/3;Vector2 center=new Vector2(Mathf.Cos(angle),Mathf.Sin(angle))*Orbit;
  Vector2 lo=new Vector2(Mathf.Cos(angle-Mathf.PI/6),Mathf.Sin(angle-Mathf.PI/6));
  Vector2 hi=new Vector2(Mathf.Cos(angle+Mathf.PI/6),Mathf.Sin(angle+Mathf.PI/6));
  var top=new Data();var walls=new Data();const int count=128;
  for(int k=0;k<count;k++){
   float a=k*Mathf.PI*2/count,b=(k+1)*Mathf.PI*2/count;
   Vector2 da=new Vector2(Mathf.Cos(a),Mathf.Sin(a)),db=new Vector2(Mathf.Cos(b),Mathf.Sin(b));
   Vector2 ia=center+da*Hole,ib=center+db*Hole,oa=center+da*Boundary(center,da,lo,hi),ob=center+db*Boundary(center,db,lo,hi);
   top.Quad(V(ia,Height(ia)),V(ib,Height(ib)),V(ob,Height(ob)),V(oa,Height(oa)));
   walls.Quad(V(ib,Height(ib)),V(ia,Height(ia)),V(ia,-.004f),V(ib,-.004f));
   walls.Quad(V(oa,Height(oa)),V(ob,Height(ob)),V(ob,-.004f),V(oa,-.004f));
  }
  Emit(parent,"Continuous sloped sector "+index,top,surface);Emit(parent,"Recessed hole wall "+index,walls,dark);
 }
 static float Cross(Vector2 a,Vector2 b)=>a.x*b.y-a.y*b.x;
 static float Boundary(Vector2 c,Vector2 d,Vector2 lo,Vector2 hi){
  float dot=Vector2.Dot(c,d);float t=-dot+Mathf.Sqrt(dot*dot+Radius*Radius-c.sqrMagnitude);
  float den=Cross(lo,d);if(den<-.000001f)t=Mathf.Min(t,-Cross(lo,c)/den);
  den=Cross(d,hi);if(den<-.000001f)t=Mathf.Min(t,-Cross(c,hi)/den);
  return Mathf.Max(Hole,t);
 }
 static void Ring(Transform p,string name,float inner,float outer,float bottom,float top,Material m){
  var d=new Data();for(int i=0;i<128;i++){
   float a=i*Mathf.PI/64,b=(i+1)*Mathf.PI/64;Vector2 x=new Vector2(Mathf.Cos(a),Mathf.Sin(a)),y=new Vector2(Mathf.Cos(b),Mathf.Sin(b));
   d.Quad(V(x*inner,top),V(y*inner,top),V(y*outer,top),V(x*outer,top));
   d.Quad(V(x*outer,top),V(y*outer,top),V(y*outer,bottom),V(x*outer,bottom));
  }Emit(p,name,d,m);
 }
 sealed class Data {public List<Vector3> vertices=new List<Vector3>();public List<int> triangles=new List<int>();public void Quad(Vector3 a,Vector3 b,Vector3 c,Vector3 d){int n=vertices.Count;vertices.AddRange(new[]{a,b,c,d});triangles.AddRange(new[]{n,n+1,n+2,n,n+2,n+3});}}
 static void Emit(Transform p,string name,Data d,Material m){var mesh=new Mesh{name=name};mesh.SetVertices(d.vertices);mesh.SetTriangles(d.triangles,0);mesh.RecalculateNormals();mesh.RecalculateBounds();AssetDatabase.CreateAsset(mesh,Folder+"Roulette-"+name+".asset");var g=new GameObject(name);g.transform.SetParent(p,false);g.AddComponent<MeshFilter>().sharedMesh=mesh;var r=g.AddComponent<MeshRenderer>();r.sharedMaterial=m;r.shadowCastingMode=ShadowCastingMode.Off;}
 static Material Material(string name,Color color,float metal,float smooth){var m=new Material(Shader.Find("Standard")){name="FAIR roulette "+name,color=color};m.SetFloat("_Metallic",metal);m.SetFloat("_Glossiness",smooth);AssetDatabase.CreateAsset(m,Folder+"Roulette-"+name+".mat");return m;}
}
