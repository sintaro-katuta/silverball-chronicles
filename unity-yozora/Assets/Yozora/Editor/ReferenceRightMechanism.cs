using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using Yozora;
// R3 00:05 overall and 01:30 / 08:00 playfield. Coordinates are video-calibrated estimates.
public static class ReferenceRightMechanism {
 const string Dir="Assets/Yozora/Generated/";static Transform root;static Material clear,edge,steel,brass,red,dark;static PhysicsMaterial contact;
 public static void Build(Transform cabinet,YozoraMachine machine){
  foreach(var t in cabinet.GetComponentsInChildren<Transform>(true))if(t&& (t.name.StartsWith("Attacker ")||t.name.StartsWith("Right unit ")||t.name.StartsWith("RIGHT ")||t.name=="RIGHT"||t.name=="RIGHT pocket"||t.name=="RIGHT left"||t.name=="RIGHT right"||t.name=="RIGHT lip"))Object.DestroyImmediate(t.gameObject);
  foreach(var s in cabinet.GetComponentsInChildren<PocketSensor>(true))if(s.kind==PocketKind.Right||s.kind==PocketKind.Attacker)Object.DestroyImmediate(s.gameObject);
  root=Group("Reference right playfield · R3 traced structure",cabinet);
  clear=Mat("Right clear moulding",new Color(.9f,.97f,1,.115f),.05f,.88f,true);edge=Mat("Right moulding edges",new Color(.71f,.8f,.84f,.38f),.1f,.9f,true);steel=Mat("Right polished fittings",new Color(.68f,.72f,.73f),.86f,.8f);brass=Mat("Right brass nails",new Color(.71f,.51f,.20f),.78f,.73f);red=Mat("Right red shutter insert",new Color(.32f,.008f,.026f),.25f,.77f);dark=Mat("Right recessed black",new Color(.018f,.022f,.022f),.22f,.48f);
  contact=AssetDatabase.LoadAssetAtPath<PhysicsMaterial>(Dir+"Contact.physicMaterial");
  // Upper outer lane and moulded inner border: no arbitrary nails behind the gold ornament.
  Vector2[] outer={new Vector2(.196f,.864f),new Vector2(.233f,.825f),new Vector2(.245f,.77f),new Vector2(.246f,.696f),new Vector2(.244f,.623f),new Vector2(.245f,.535f),new Vector2(.247f,.452f),new Vector2(.247f,.336f)};
  Vector2[] inner={new Vector2(.173f,.837f),new Vector2(.184f,.799f),new Vector2(.184f,.768f),new Vector2(.184f,.714f),new Vector2(.184f,.666f),new Vector2(.178f,.64f),new Vector2(.18f,.535f),new Vector2(.179f,.453f),new Vector2(.168f,.414f),new Vector2(.168f,.36f),new Vector2(.194f,.334f)};
  Channel("Outer formed rail",outer);Channel("Inner formed rail",inner);
  // Backing flange follows the inset profile; it sits behind nails, not in front of them.
  Backing("Upper moulded pocket backing",new[]{new Vector2(.181f,.797f),new Vector2(.233f,.797f),new Vector2(.245f,.775f),new Vector2(.245f,.697f),new Vector2(.236f,.68f),new Vector2(.182f,.683f)},-.026f);
  Backing("Middle long moulded backing",new[]{new Vector2(.181f,.674f),new Vector2(.235f,.674f),new Vector2(.245f,.645f),new Vector2(.245f,.49f),new Vector2(.235f,.479f),new Vector2(.18f,.479f)},-.025f);
  Backing("Lower chamber moulded backing",new[]{new Vector2(.177f,.479f),new Vector2(.245f,.479f),new Vector2(.247f,.356f),new Vector2(.237f,.324f),new Vector2(.196f,.324f),new Vector2(.174f,.351f)},-.024f);
  for(int k=0;k<3;k++){
   float x=.232f+k*.003f;
   Groove("Outer stepped mould seam",new[]{new Vector2(x,.795f),new Vector2(x,.767f),new Vector2(x-.008f,.764f),new Vector2(x-.008f,.752f)},-.027f);
   Groove("Upper inlet mould seam",new[]{new Vector2(x-.032f,.819f),new Vector2(x-.032f,.78f),new Vector2(x-.024f,.777f),new Vector2(x-.024f,.762f)},-.027f);
  }
  for(int k=0;k<2;k++){
   float x=.184f+k*.003f;Groove("Long inner return flange",new[]{new Vector2(x,.664f),new Vector2(x,.607f),new Vector2(x+.006f,.6f),new Vector2(x+.006f,.546f),new Vector2(x,.54f),new Vector2(x,.483f)},-.028f);
  }
  // Structural moulding ribs around the two mechanism windows, not opaque cover plates.
  foreach(float y in new[]{.478f,.424f,.414f,.4f,.349f})for(int j=0;j<3;j++)Box("Moulded cross rib",new Vector3(.207f,y+j*.002f,-.029f),new Vector3(.059f,.00075f,.003f),edge);
  // Small right upper pocket is visibly studded in R3 01:30, four staggered nail pairs.
  for(int i=0;i<4;i++){Pin(.199f+i*.003f,.746f-i*.010f);Pin(.223f+i*.002f,.748f-i*.010f);}
  Pin(.187f,.409f);Pin(.203f,.410f);Pin(.188f,.394f);
  // Clear moulding has shallow steps and separate ribs, keeping the ball lane readable.
  for(int i=0;i<7;i++){
   float y=.817f-i*.024f;Box("Return moulding step",new Vector3(.237f,y,-.041f),new Vector3(.011f,.003f,.012f),edge);
  }
  Path("Upper staggered deflector",new[]{new Vector2(.224f,.708f),new Vector2(.208f,.697f),new Vector2(.232f,.682f)},.0018f,edge,true);
  Path("Middle channel boundary",new[]{new Vector2(.216f,.664f),new Vector2(.222f,.634f),new Vector2(.221f,.582f),new Vector2(.214f,.543f)},.0016f,edge,true);
  // Narrow downstream column seen below 神器. CHANCE is an illuminated window, not the rose.
  Chamber("CHANCE clear receiving unit",new Vector3(.207f,.449f,-.061f),.058f,.041f);
  Box("CHANCE dark inset",new Vector3(.207f,.449f,-.033f),new Vector3(.048f,.023f,.003f),dark);

  Box("Upper red insert",new Vector3(.207f,.47f,-.061f),new Vector3(.052f,.0035f,.012f),red);
  Chamber("Lower red opening surround",new Vector3(.206f,.369f,-.06f),.062f,.043f);
  Box("Lower mouth recessed throat",new Vector3(.205f,.37f,-.025f),new Vector3(.056f,.026f,.009f),dark);
  foreach(float y in new[]{.35f,.39f})Box("Attacker red rim",new Vector3(.206f,y,-.077f),new Vector3(.057f,.0025f,.009f),red);
  var drive=Group("Right attacker angle input",root);machine.door=drive;
  var gate=Group("Right sliding attacker gate",root);gate.localPosition=new Vector3(.201f,.371f,-.052f);
  var plate=Box("Red sliding metal shutter",Vector3.zero,new Vector3(.064f,.003f,.040f),steel,gate);plate.transform.localRotation=Quaternion.Euler(0,0,-13);
  var col=plate.AddComponent<BoxCollider>();col.sharedMaterial=contact;
  Box("Red front shutter edge",new Vector3(0,-.001f,-.022f),new Vector3(.064f,.006f,.003f),red,gate);
  gate.gameObject.AddComponent<Rigidbody>().isKinematic=true;
  Sensor("Right attacker receiving aperture",new Vector3(.203f,.353f,-.052f),new Vector3(.052f,.012f,.039f),PocketKind.Attacker,machine);
  // Closed shutter spills to the narrow outer bypass, then to the existing right-start role.
  Path("Lower bypass exit",new[]{new Vector2(.247f,.351f),new Vector2(.237f,.327f),new Vector2(.212f,.323f)},.0018f,edge,true);
  Sensor("Right downstream start",new Vector3(.225f,.334f,-.052f),new Vector3(.042f,.014f,.039f),PocketKind.Right,machine);
  Chamber("Downstream intake",new Vector3(.224f,.328f,-.054f),.046f,.018f);
  for(int i=0;i<8;i++){float y=.802f-i*.061f;Screw(.179f,y);Screw(.243f,y);}
  var runtime=machine.gameObject.AddComponent<RightMechanismDrive>();runtime.angleInput=drive;runtime.slidingGate=gate;runtime.closedPosition=gate.localPosition;runtime.travel=new Vector3(0,0,.05f);
 }
 static void Groove(string n,Vector2[] p,float z){for(int i=1;i<p.Length;i++)Segment(n,new Vector3(p[i-1].x,p[i-1].y,z),new Vector3(p[i].x,p[i].y,z),.00065f,edge);}
 static void Backing(string n,Vector2[] p,float z){
  var v=new List<Vector3>();var tr=new List<int>();for(int i=0;i<p.Length;i++)v.Add(new Vector3(p[i].x,p[i].y,z));for(int i=0;i<p.Length;i++)v.Add(new Vector3(p[i].x,p[i].y,z+.004f));
  for(int i=1;i<p.Length-1;i++){tr.AddRange(new[]{0,i,i+1,p.Length,p.Length+i+1,p.Length+i});}
  for(int i=0;i<p.Length;i++){int j=(i+1)%p.Length;tr.AddRange(new[]{i,j,j+p.Length,i,j+p.Length,i+p.Length});}
  var m=new Mesh(){name=n};m.SetVertices(v);m.SetTriangles(tr,0);m.RecalculateNormals();m.RecalculateBounds();string path=Dir+n.Replace(" ","_")+".asset";AssetDatabase.DeleteAsset(path);AssetDatabase.CreateAsset(m,path);var g=Group(n,root);g.gameObject.AddComponent<MeshFilter>().sharedMesh=m;g.gameObject.AddComponent<MeshRenderer>().sharedMaterial=clear;
 }
 static Transform Group(string n,Transform p){var t=new GameObject(n).transform;t.SetParent(p,false);return t;}
 static Material Mat(string n,Color c,float metal,float smooth,bool transparent=false){var m=new Material(Shader.Find("Standard")){name=n,color=c};m.SetFloat("_Metallic",metal);m.SetFloat("_Glossiness",smooth);if(transparent){m.SetFloat("_Mode",3);m.SetInt("_SrcBlend",1);m.SetInt("_DstBlend",10);m.SetInt("_ZWrite",0);m.EnableKeyword("_ALPHAPREMULTIPLY_ON");m.renderQueue=3000;}string path=Dir+n.Replace(" ","_")+".mat";AssetDatabase.DeleteAsset(path);AssetDatabase.CreateAsset(m,path);return m;}
 static GameObject Box(string n,Vector3 p,Vector3 size,Material mat,Transform parent=null){var g=GameObject.CreatePrimitive(PrimitiveType.Cube);g.name=n;g.transform.SetParent(parent?parent:root,false);g.transform.localPosition=p;g.transform.localScale=size;Object.DestroyImmediate(g.GetComponent<Collider>());g.GetComponent<Renderer>().sharedMaterial=mat;return g;}
 static void Segment(string n,Vector3 a,Vector3 b,float radius,Material mat,bool collision=false){var g=GameObject.CreatePrimitive(PrimitiveType.Cylinder);g.name=n;g.transform.SetParent(root,false);g.transform.localPosition=(a+b)*.5f;g.transform.localRotation=Quaternion.FromToRotation(Vector3.up,b-a);g.transform.localScale=new Vector3(radius*2,(b-a).magnitude*.5f,radius*2);Object.DestroyImmediate(g.GetComponent<Collider>());g.GetComponent<Renderer>().sharedMaterial=mat;if(collision){var c=g.AddComponent<CapsuleCollider>();c.radius=.5f;c.height=2;c.direction=1;c.sharedMaterial=contact;}}
 static void Path(string n,Vector2[] p,float radius,Material mat,bool collide){for(int i=1;i<p.Length;i++){
  Vector3 a=new Vector3(p[i-1].x,p[i-1].y,-.052f),b=new Vector3(p[i].x,p[i].y,-.052f);Segment(n,a,b,radius,mat,collide);
  if(collide&&!n.EndsWith("formed rail")){var web=Box(n+" depth wall",(a+b)*.5f,new Vector3(radius*2,(b-a).magnitude,.041f),clear);web.transform.localRotation=Quaternion.FromToRotation(Vector3.up,b-a);web.AddComponent<BoxCollider>().sharedMaterial=contact;}
 }}
 static void Channel(string n,Vector2[] p){Path(n,p,.0017f,edge,true);for(int i=1;i<p.Length;i++){Vector3 a=new Vector3(p[i-1].x,p[i-1].y,-.059f),b=new Vector3(p[i].x,p[i].y,-.059f);var q=Box(n+" clear web",(a+b)/2,new Vector3(.0016f,(b-a).magnitude,.033f),clear);q.transform.localRotation=Quaternion.FromToRotation(Vector3.up,b-a);q.AddComponent<BoxCollider>().sharedMaterial=contact;}}
 static void Pin(float x,float y){Segment("Right brass nail shaft",new Vector3(x,y,-.03f),new Vector3(x,y,-.072f),.0013f,brass,true);Segment("Right polished nail head",new Vector3(x,y,-.074f),new Vector3(x,y,-.076f),.0024f,brass);}
 static void Screw(float x,float y){Segment("Right moulding fixing boss",new Vector3(x,y,-.028f),new Vector3(x,y,-.079f),.0038f,clear);Segment("Right moulding fixing screw",new Vector3(x,y,-.078f),new Vector3(x,y,-.08f),.0023f,steel);Box("Screw slot",new Vector3(x,y,-.081f),new Vector3(.0028f,.0005f,.0003f),dark);}
 static void Chamber(string n,Vector3 p,float w,float h){Box(n+" rear",new Vector3(p.x,p.y,-.028f),new Vector3(w,h,.002f),clear);foreach(int s in new[]{-1,1})Box(n+" side",p+new Vector3(s*w*.5f,0,0),new Vector3(.002f,h,.033f),edge);Box(n+" front lip",p+new Vector3(0,-h*.5f,-.019f),new Vector3(w,.002f,.003f),edge);}
 static void Sensor(string n,Vector3 p,Vector3 size,PocketKind kind,YozoraMachine machine){var t=Group(n,root);t.localPosition=p;var c=t.gameObject.AddComponent<BoxCollider>();c.size=size;c.isTrigger=true;var s=t.gameObject.AddComponent<PocketSensor>();s.kind=kind;s.owner=machine;}
}
