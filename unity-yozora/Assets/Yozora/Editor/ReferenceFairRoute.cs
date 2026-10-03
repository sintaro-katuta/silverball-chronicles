using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using Yozora;
/// <summary>Repositions the actual counted admission and draws its complete shared path.
/// Preserves the six-hole rotor and fifth-arrival rule. R3 01:30 / DMM8 two-stage receiver.</summary>
public static class ReferenceFairRoute {
 const string Folder="Assets/Yozora/Generated/";
 static Material clear,rim,metal,yellow;static int serial;
 public static void Build(Transform cabinet,YozoraMachine machine){
  serial=0;FairDistributor selector=null;foreach(var candidate in cabinet.GetComponentsInChildren<FairDistributor>(true))selector=candidate;
  if(!selector)throw new Exception("Reference FAIR route requires existing physical FAIR assembly");
  foreach(var t in cabinet.GetComponentsInChildren<Transform>(true))if(t&&(t.name=="Five-count marker"||t.name=="Selector resin cover"||t.name=="C Continuous moulded optical channel"||t.name=="C Continuous channel rolled return"||t.name=="C Channel recessed tool line"||t.name=="C Integral short wall rib"))UnityEngine.Object.DestroyImmediate(t.gameObject);
  // The rotor centre aligns with the LCD bottom in the R3 00:05 full-front reference.
  // Move the complete housing, bearings, six sensors and rotating Rigidbody together.
  foreach(Transform t in selector.transform.parent)if(t.name=="FAIR R3 · decorative production parts"||t.name=="Horizontal bowl base"||t.name=="Horizontal six-pocket rotor")t.localPosition+=new Vector3(0,FairRouteGeometry.RotorLift,FairRouteGeometry.RotorForward);
  selector.rotorEntry=FairRouteGeometry.RotorEntry;
  // The old upper shoulder fastener belonged to the removed short chute; removing its
  // land/boss/head together prevents an isolated silver screw floating over the LCD.
  foreach(var t in cabinet.GetComponentsInChildren<Transform>(true)){
   if(!t||!t.name.StartsWith("E "))continue;var mf=t.GetComponent<MeshFilter>();
   if(t.name=="E Upper shoulder screw land"||(mf&&Vector3.Distance(mf.sharedMesh.bounds.center+t.localPosition,new Vector3(-.050f,.027f,.011f))<.014f))UnityEngine.Object.DestroyImmediate(t.gameObject);
  }
  // Trim only the obsolete low tail of the decorative crescent. It used to end at the
  // original low selector and now misleadingly resembles a disconnected second chute.
  foreach(var mf in cabinet.GetComponentsInChildren<MeshFilter>(true))if(mf.name=="Left single moulded crescent"||mf.name=="Left external moulded return"||mf.name.StartsWith("Left parallel sunk optical groove"))TrimOldCrescent(mf,.465f);
  selector.transform.localPosition=FairRouteGeometry.Selector;
  var sensor=selector.GetComponent<BoxCollider>();sensor.size=new Vector3(FairRouteGeometry.AdmissionWidth,.014f,.035f);sensor.center=Vector3.zero;
  clear=Mat("FAIR traced route clear",new Color(.96f,.98f,1,.045f),.02f,.97f,true);
  rim=Mat("FAIR traced route polished return",new Color(.82f,.88f,.93f,.19f),.14f,.92f,true);
  metal=Mat("FAIR traced mechanism alloy",new Color(.63f,.65f,.67f),.83f,.79f);
  yellow=Mat("FAIR traced yellow branch marking",new Color(1,.66f,.018f),.23f,.63f);
  if(selector.blade){selector.blade.localPosition=FairRouteGeometry.Selector+new Vector3(0,-.010f,-.010f);selector.blade.localScale=new Vector3(.018f,.003f,.012f);selector.blade.GetComponent<Renderer>().sharedMaterial=metal;}
  var root=new GameObject("FAIR traced vertical receiver and complete transfer path").transform;root.SetParent(cabinet,false);
  var route=FairRouteGeometry.Route(FairRouteGeometry.Selector,selector.rotorEntry);
  Tube(root,route,.0078f,.001f);
  // A rear mounting face and two edge returns show the actual tall receiver envelope.
  // The centre is optically clear; there is no opaque panel concealing the falling ball.
  Box(root,"Vertical receiver back plate",new Vector3(-.190f,.510f,-.034f),new Vector3(.041f,.130f,.002f),clear);
  foreach(int sign in new[]{-1,1}){
   Box(root,"Vertical receiver edge rib",new Vector3(-.190f+sign*.021f,.510f,-.061f),new Vector3(.0014f,.130f,.047f),rim);
   foreach(float y in new[]{.567f,.452f})Screw(root,new Vector3(-.190f+sign*.020f,y,-.086f));
  }
  // The reference has yellow bars / direction triangles, not five purple count lamps.
  for(int i=0;i<3;i++)Box(root,"Upper yellow receiver bar",new Vector3(-.190f,.570f-i*.0065f,-.087f),new Vector3(.012f,.0043f,.0012f),yellow);
  Triangle(root,"Upper yellow downward arrow",new Vector3(-.190f,.545f,-.088f),false);
  for(int i=0;i<2;i++)Box(root,"Lower yellow side outlet bar",FairRouteGeometry.LowerBranch+new Vector3(-.008f+i*.005f,.002f,-.010f),new Vector3(.0032f,.009f,.001f),yellow);
  Triangle(root,"Lower yellow right outlet arrow",FairRouteGeometry.LowerBranch+new Vector3(.004f,.002f,-.0105f),true);
  Screw(root,new Vector3(-.187f,.490f,-.105f));
  // World-space LCD UI uses transparent sorting order 2. The relocated resin is
  // entirely in front of that display, and must be composited after its pixels.
  foreach(var r in selector.transform.parent.GetComponentsInChildren<Renderer>())if(r.sharedMaterial&&r.sharedMaterial.renderQueue>=3000)r.sortingOrder=3;
  foreach(var r in root.GetComponentsInChildren<Renderer>())if(r.sharedMaterial&&r.sharedMaterial.renderQueue>=3000)r.sortingOrder=3;
  float distance=0;for(int i=1;i<route.Length;i++)distance+=Vector3.Distance(route[i-1],route[i]);
  Debug.Log($"FAIR_REFERENCE_ROUTE selectorY={selector.transform.position.y:F3} lowerBranchY={FairRouteGeometry.LowerBranch.y:F3} length={distance:F3}m travel={distance/FairGuidedBall.TravelSpeed:F3}s. Common data for admission/visible tube/guided ball.");
 }
 static void Tube(Transform parent,Vector3[] path,float half,float thickness){
  var vertices=new List<Vector3>();var triangles=new List<int>();var frames=new Vector3[path.Length];var widths=new float[path.Length];
  for(int i=0;i<path.Length;i++){Vector3 d=path[Mathf.Min(path.Length-1,i+1)]-path[Mathf.Max(0,i-1)];frames[i]=new Vector3(-d.y,d.x,0).normalized;
   widths[i]=i==0?FairRouteGeometry.InletHalfWidth:i==1?.011f:half;
   foreach(float r in new[]{widths[i],widths[i]+thickness})foreach(var corner in new[]{new Vector2(-1,-1),new Vector2(1,-1),new Vector2(1,1),new Vector2(-1,1)})vertices.Add(path[i]+frames[i]*corner.x*r+Vector3.forward*corner.y*r);
  }
  for(int i=0;i<path.Length-1;i++)for(int k=0;k<4;k++){int n=(k+1)%4,a=i*8+k,b=i*8+n,c=(i+1)*8+k,d=(i+1)*8+n;Quad(triangles,a,c,d,b);Quad(triangles,a+4,b+4,d+4,c+4);}
  foreach(int i in new[]{0,path.Length-1})for(int k=0;k<4;k++){int n=(k+1)%4,a=i*8+k,b=i*8+n;Quad(triangles,a,b,b+4,a+4);}
  var mesh=new Mesh{name="Continuous FAIR tube from common path"};mesh.SetVertices(vertices);mesh.SetTriangles(triangles,0);mesh.RecalculateNormals();mesh.RecalculateBounds();SaveMesh(parent,mesh,"Continuous moulded FAIR transfer tube",clear);
  // Thin mould seam follows both front corners using the same data, no detached railing.
  foreach(int sign in new[]{-1,1})for(int i=0;i<path.Length-1;i++){
   var a=path[i]+frames[i]*widths[i]*sign-Vector3.forward*widths[i];var b=path[i+1]+frames[i+1]*widths[i+1]*sign-Vector3.forward*widths[i+1];
   var edge=Box(parent,"Integral transfer tube front seam",(a+b)/2,new Vector3(.0008f,Vector3.Distance(a,b),.0008f),rim);edge.transform.localRotation=Quaternion.FromToRotation(Vector3.up,b-a);
  }
 }
 struct ClipVertex {public Vector3 p,n;public ClipVertex(Vector3 point,Vector3 normal){p=point;n=normal;}}
 static void TrimOldCrescent(MeshFilter filter,float height){
  var old=filter.sharedMesh;var positions=old.vertices;var normals=old.normals;var indices=old.triangles;var output=new List<Vector3>();var outNormals=new List<Vector3>();var triangles=new List<int>();
  for(int k=0;k<indices.Length;k+=3){
   var polygon=new List<ClipVertex>();for(int j=0;j<3;j++){int index=indices[k+j];polygon.Add(new ClipVertex(filter.transform.TransformPoint(positions[index]),normals.Length==positions.Length?filter.transform.TransformDirection(normals[index]):Vector3.forward));}
   var clipped=new List<ClipVertex>();for(int j=0;j<polygon.Count;j++){
    var a=polygon[j];var b=polygon[(j+1)%polygon.Count];bool aIn=a.p.y>=height,bIn=b.p.y>=height;
    if(aIn)clipped.Add(a);if(aIn!=bIn){float t=(height-a.p.y)/(b.p.y-a.p.y);clipped.Add(new ClipVertex(Vector3.Lerp(a.p,b.p,t),Vector3.Lerp(a.n,b.n,t).normalized));}
   }
   if(clipped.Count<3)continue;int first=output.Count;foreach(var v in clipped){output.Add(filter.transform.InverseTransformPoint(v.p));outNormals.Add(filter.transform.InverseTransformDirection(v.n).normalized);}for(int j=1;j<clipped.Count-1;j++)triangles.AddRange(new[]{first,first+j,first+j+1});
  }
  var mesh=new Mesh{name=old.name+" trimmed to relocated receiver"};mesh.SetVertices(output);mesh.SetNormals(outNormals);mesh.SetTriangles(triangles,0);mesh.RecalculateBounds();AssetDatabase.CreateAsset(mesh,Folder+"FairTraceTrim"+(serial++)+".asset");filter.sharedMesh=mesh;
 }
 static void Triangle(Transform parent,string name,Vector3 p,bool right){var v=right?new[]{new Vector3(-.004f,-.006f,0),new Vector3(.005f,0,0),new Vector3(-.004f,.006f,0)}:new[]{new Vector3(-.006f,.004f,0),new Vector3(0,-.005f,0),new Vector3(.006f,.004f,0)};var mesh=new Mesh{name=name};mesh.vertices=v;mesh.triangles=new[]{0,2,1,0,1,2};mesh.RecalculateNormals();var g=SaveMesh(parent,mesh,name,yellow);g.transform.localPosition=p;}
 static void Screw(Transform parent,Vector3 p){var g=GameObject.CreatePrimitive(PrimitiveType.Cylinder);g.name="Receiver recessed mounting screw";g.transform.SetParent(parent,false);g.transform.localPosition=p;g.transform.localRotation=Quaternion.Euler(90,0,0);g.transform.localScale=new Vector3(.0033f,.0006f,.0033f);UnityEngine.Object.DestroyImmediate(g.GetComponent<Collider>());g.GetComponent<Renderer>().sharedMaterial=metal;}
 static void Quad(List<int> t,int a,int b,int c,int d){t.AddRange(new[]{a,b,c,a,c,d});}
 static GameObject SaveMesh(Transform p,Mesh mesh,string n,Material mat){AssetDatabase.CreateAsset(mesh,Folder+"FairTraceMesh"+(serial++)+".asset");var g=new GameObject(n);g.transform.SetParent(p,false);g.AddComponent<MeshFilter>().sharedMesh=mesh;g.AddComponent<MeshRenderer>().sharedMaterial=mat;return g;}
 static GameObject Box(Transform p,string n,Vector3 at,Vector3 scale,Material mat){var g=GameObject.CreatePrimitive(PrimitiveType.Cube);g.name=n;g.transform.SetParent(p,false);g.transform.localPosition=at;g.transform.localScale=scale;UnityEngine.Object.DestroyImmediate(g.GetComponent<Collider>());g.GetComponent<Renderer>().sharedMaterial=mat;return g;}
 static Material Mat(string n,Color color,float metallic,float smooth,bool transparent=false){var m=new Material(Shader.Find("Standard")){name=n,color=color};m.SetFloat("_Metallic",metallic);m.SetFloat("_Glossiness",smooth);if(transparent){m.SetFloat("_Mode",3);m.SetInt("_SrcBlend",5);m.SetInt("_DstBlend",10);m.SetInt("_ZWrite",0);m.EnableKeyword("_ALPHABLEND_ON");m.renderQueue=3000;}AssetDatabase.CreateAsset(m,Folder+n+".mat");return m;}
}
