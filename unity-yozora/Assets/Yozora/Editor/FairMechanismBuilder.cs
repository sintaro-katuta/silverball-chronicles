using UnityEngine;
using UnityEditor;
using Yozora;
/// <summary>R1 04:30: central horizontal six-hole bowl and inclined transparent transfer channel.</summary>
public static class FairMechanismBuilder {
 public static void Build(Transform cabinet,YozoraMachine machine){
  machine.distributor=null;
  // Layer 11 belongs solely to constrained FAIR balls and pocket triggers.
  for(int i=0;i<32;i++)Physics.IgnoreLayerCollision(11,i,i!=11);
  var root=new GameObject("FAIR · counted transfer and horizontal bowl").transform;root.SetParent(cabinet,false);
  var clear=Material("FAIR clear resin",new Color(.66f,.83f,.94f,.12f),.25f,.9f,true);
  var chrome=Material("FAIR chrome",new Color(.75f,.8f,.87f),.88f,.9f);
  var orange=Material("FAIR orange winning pockets",new Color(1,.38f,.035f),.6f,.76f);
  var white=Material("FAIR ivory losing pockets",new Color(.8f,.83f,.9f),.3f,.8f);
  var black=Material("FAIR pocket recess",new Color(.015f,.022f,.028f),.2f,.4f);
  var purple=Material("FAIR selector purple",new Color(.39f,.06f,.7f),.5f,.85f);
  var selector=new GameObject("Five-arrival selector");selector.transform.SetParent(root,false);selector.transform.localPosition=new Vector3(-.18f,.366f,-.052f);
  var detection=selector.AddComponent<BoxCollider>();detection.isTrigger=true;detection.size=new Vector3(.09f,.014f,.035f);
  var distributor=selector.AddComponent<FairDistributor>();distributor.owner=machine;
  distributor.blade=Box(root,"Selector visible flap",new Vector3(-.18f,.345f,-.088f),new Vector3(.033f,.003f,.02f),chrome).transform;
  Box(root,"Selector resin cover",new Vector3(-.18f,.377f,-.083f),new Vector3(.055f,.081f,.012f),clear);
  for(int i=0;i<5;i++)Cylinder(root,"Five-count marker",new Vector3(-.18f,.35f+i*.012f,-.092f),.004f,.002f,purple,Quaternion.Euler(90,0,0));
  Vector3 center=new Vector3(.012f,.288f,-.112f);
  FairProductionGeometry.Build(root,center,chrome);
  Cylinder(root,"Horizontal bowl base",center-Vector3.up*.011f,.041f,.006f,chrome,Quaternion.identity);
  var rotor=new GameObject("Horizontal six-pocket rotor");rotor.transform.SetParent(root,false);rotor.transform.localPosition=center;
  var rb=rotor.AddComponent<Rigidbody>();rb.isKinematic=true;rb.interpolation=RigidbodyInterpolation.Interpolate;
  rotor.AddComponent<RotorDrive>().localAxis=Vector3.up;

  for(int i=0;i<6;i++){
   float t=i*Mathf.PI/3;var p=new Vector3(Mathf.Cos(t)*.03f,0,Mathf.Sin(t)*.03f);


   var hole=new GameObject("Actual rotating pocket trigger "+i);hole.layer=11;hole.transform.SetParent(rotor.transform,false);hole.transform.localPosition=p+Vector3.up*.005f;
   var trigger=hole.AddComponent<SphereCollider>();trigger.isTrigger=true;trigger.radius=.0075f;
   var sensor=hole.AddComponent<PocketSensor>();sensor.owner=machine;sensor.kind=PocketKind.Fair;sensor.winningSlot=i%3==0;

  }
  FairRouletteGeometry.Build(rotor.transform,chrome);
 }
 static Material Material(string name,Color color,float metal,float gloss,bool transparent=false){var m=new Material(Shader.Find("Standard")){name=name,color=color};m.SetFloat("_Metallic",metal);m.SetFloat("_Glossiness",gloss);if(transparent){m.SetFloat("_Mode",3);m.SetInt("_SrcBlend",(int)UnityEngine.Rendering.BlendMode.SrcAlpha);m.SetInt("_DstBlend",(int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);m.SetInt("_ZWrite",0);m.EnableKeyword("_ALPHABLEND_ON");m.renderQueue=3000;}AssetDatabase.CreateAsset(m,"Assets/Yozora/Generated/"+name+".mat");return m;}
 static GameObject Primitive(Transform parent,string name,PrimitiveType type,Vector3 p,Vector3 scale,Material material){var g=GameObject.CreatePrimitive(type);g.name=name;g.transform.SetParent(parent,false);g.transform.localPosition=p;g.transform.localScale=scale;Object.DestroyImmediate(g.GetComponent<Collider>());g.GetComponent<Renderer>().sharedMaterial=material;return g;}
 static GameObject Box(Transform parent,string name,Vector3 p,Vector3 scale,Material m)=>Primitive(parent,name,PrimitiveType.Cube,p,scale,m);
 static GameObject Cylinder(Transform parent,string name,Vector3 p,float radius,float height,Material m,Quaternion rotation){var g=Primitive(parent,name,PrimitiveType.Cylinder,p,new Vector3(radius*2,height/2,radius*2),m);g.transform.localRotation=rotation;return g;}
 static void Beam(Transform parent,string name,Vector3 a,Vector3 b,float width,float thickness,Material m){var g=Box(parent,name,(a+b)*.5f,new Vector3((b-a).magnitude,thickness,width),m);g.transform.localRotation=Quaternion.FromToRotation(Vector3.right,(b-a).normalized);}
}
