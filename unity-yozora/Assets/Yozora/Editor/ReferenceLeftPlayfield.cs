using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using Yozora;
/// <summary>Structural tracing from R3 01:30 / 01:00. Units are estimated cabinet metres,
/// anchored to the existing LCD and FAIR; never an assertion of surveyed factory dimensions.</summary>
public static class ReferenceLeftPlayfield {
 static Material brass,steel,clear,edge,black; static PhysicsMaterial contact;
 public static void Build(Transform cabinet,YozoraMachine machine){
  var old=cabinet.GetComponentsInChildren<Transform>(true);
  foreach(var t in old)if(t && (t.name=="Pin"||t.name=="PLUS casing"||t.name=="PLUS mouth lip"||t.name=="Launcher inner curved lip"))Object.DestroyImmediate(t.gameObject);
  var root=new GameObject("Reference left playfield · pins and structural guides").transform;root.SetParent(cabinet,false);
  contact=AssetDatabase.LoadAssetAtPath<PhysicsMaterial>("Assets/Yozora/Generated/Contact.physicMaterial");
  brass=Mat("Reference nail brass",new Color(.67f,.48f,.20f),.86f,.87f);
  steel=Mat("Reference nail head",new Color(.83f,.80f,.69f),.94f,.92f);
  clear=Mat("Reference clear guide walls",new Color(.94f,.97f,1,.095f),.04f,.91f,true);
  edge=Mat("Reference resin edge",new Color(.82f,.87f,.92f,.30f),.13f,.91f,true);
  black=Mat("Reference receiving cavity",new Color(.018f,.020f,.025f),.12f,.37f);
  // R3 01:30 left upper gold heads: staggered angled double bank, not seven evenly spaced dots.
  // Pixel landmarks and the exact affine mapping are recorded in LEFT_PIN_TRACE.csv.
  // Upper — individually traced visible gold heads, not an evenly spaced grid.
  Pin(root,new Vector2(-0.160007f,0.749440f),"U01 Upper nail");
  Pin(root,new Vector2(-0.162079f,0.737308f),"U02 Upper nail");
  Pin(root,new Vector2(-0.163322f,0.728868f),"U03 Upper nail");
  Pin(root,new Vector2(-0.166224f,0.723066f),"U04 Upper nail");
  Pin(root,new Vector2(-0.170368f,0.718846f),"U05 Upper nail");
  Pin(root,new Vector2(-0.174513f,0.714626f),"U06 Upper nail");
  Pin(root,new Vector2(-0.184046f,0.695637f),"U07 Upper nail");
  Pin(root,new Vector2(-0.180316f,0.688780f),"U08 Upper nail");
  Pin(root,new Vector2(-0.175757f,0.680868f),"U09 Upper nail");
  Pin(root,new Vector2(-0.168711f,0.677176f),"U10 Upper nail");
  Pin(root,new Vector2(-0.160421f,0.683505f),"U11 Upper nail");
  Pin(root,new Vector2(-0.158763f,0.707242f),"U12 Upper nail");
  Pin(root,new Vector2(-0.146743f,0.720956f),"U13 Upper nail");
  Pin(root,new Vector2(-0.145914f,0.690890f),"U14 Upper nail");
  // LowerBoard — individually traced visible gold heads, not an evenly spaced grid.
  Pin(root,new Vector2(-0.183632f,0.385484f),"L01 LowerBoard nail");
  Pin(root,new Vector2(-0.179487f,0.381791f),"L02 LowerBoard nail");
  Pin(root,new Vector2(-0.168296f,0.366495f),"L03 LowerBoard nail");
  Pin(root,new Vector2(-0.163737f,0.361220f),"L04 LowerBoard nail");
  Pin(root,new Vector2(-0.158763f,0.358582f),"L05 LowerBoard nail");
  Pin(root,new Vector2(-0.155447f,0.355418f),"L06 LowerBoard nail");
  Pin(root,new Vector2(-0.150474f,0.352780f),"L07 LowerBoard nail");
  // L08/P03 overlap after cross-view registration; the close-view P03 owns this head.
  // Keep P03 from the closer image; L08 remains a source evidence ID in the trace table.
  Pin(root,new Vector2(-0.135967f,0.336956f),"L09 LowerBoard nail");
  Pin(root,new Vector2(-0.126434f,0.353835f),"L11 LowerBoard nail");
  Pin(root,new Vector2(-0.103224f,0.338538f),"L12 LowerBoard nail");
  Pin(root,new Vector2(-0.045197f,0.301615f),"L14 LowerBoard nail");
  // Plus — individually traced visible gold heads, not an evenly spaced grid.
  Pin(root,new Vector2(-0.164419f,0.302286f),"P01 Plus nail");
  Pin(root,new Vector2(-0.153837f,0.318238f),"P02 Plus nail");
  Pin(root,new Vector2(-0.142593f,0.314905f),"P03 Plus nail");
  Pin(root,new Vector2(-0.130909f,0.311810f),"P04 Plus nail");
  Pin(root,new Vector2(-0.131791f,0.333476f),"P05 Plus nail");
  Pin(root,new Vector2(-0.096738f,0.297048f),"P06 Plus nail");
  Pin(root,new Vector2(-0.077779f,0.277524f),"P07 Plus nail");
  Pin(root,new Vector2(-0.065213f,0.294429f),"P08 Plus nail");
  Pin(root,new Vector2(-0.065213f,0.303476f),"P09 Plus nail");
  Pin(root,new Vector2(-0.066094f,0.311571f),"P10 Plus nail");
  Pin(root,new Vector2(-0.050001f,0.277762f),"P11 Plus nail");
  // DMM8: the vertical left route has two stepped ribs around its mechanical receiver.
  // Front/rear thickness spans the same cavity as the nails. No opaque decorative skin.
  Guide(root,"Left channel outer wall",new[]{new Vector2(-.207f,.736f),new Vector2(-.210f,.687f),new Vector2(-.210f,.607f),new Vector2(-.203f,.589f),new Vector2(-.202f,.446f),new Vector2(-.211f,.422f),new Vector2(-.209f,.374f)},.0024f);
  Guide(root,"Left channel upper inner return",new[]{new Vector2(-.163f,.738f),new Vector2(-.166f,.680f),new Vector2(-.168f,.635f)},.0024f);
  // DMM8's inward stepped entrance must catch the actual LCD-edge falling lane as well
  // as the outer lane. This visible/contact-matched diagonal feed replaces the old
  // continuous divider which isolated the selector from all ordinary launched balls.
  Guide(root,"Left channel LCD side wall and selector funnel",new[]{new Vector2(-.146f,.625f),new Vector2(-.146f,.607f),new Vector2(-.170f,.572f),new Vector2(-.176f,.550f),new Vector2(-.176f,.469f),new Vector2(-.165f,.454f),new Vector2(-.165f,.438f)},.0024f);
  // The previous independent selector shoulder pinched L01 to a < 11 mm throat.
  // DMM8 shows the return in the continuous outer wall, not an additional free-standing baffle.
  // Join the lower launcher divider directly into that wall. The legacy inclined inner lip
  // crossed the new wall at y=.696 and formed a sealed V pocket, so it is replaced above.
  Guide(root,"Launcher divider inherited by left wall",new[]{new Vector2(-.218f,.225f),new Vector2(-.218f,.600f),new Vector2(-.210f,.607f)},.0024f);
  for(int i=0;i<6;i++)Boss(root,new Vector3(-.214f,.425f+i*.046f,-.041f));
  // PLUS is a real open mouth: two cheeks and back, no front plate across its aperture.
  var plus=new GameObject("PLUS open receiving assembly").transform;plus.SetParent(root,false);
  Box(plus,"PLUS dark throat behind aperture",new Vector3(-.064f,.250f,-.029f),new Vector3(.026f,.022f,.004f),black,false);
  Guide(plus,"PLUS left cheek",new[]{new Vector2(-.081f,.271f),new Vector2(-.0785f,.251f)},.002f);
  Guide(plus,"PLUS right cheek",new[]{new Vector2(-.047f,.271f),new Vector2(-.0495f,.251f)},.002f);
  Box(plus,"PLUS lower open mouth sill",new Vector3(-.064f,.246f,-.073f),new Vector3(.033f,.003f,.004f),steel,false);
  Box(plus,"PLUS clear front return",new Vector3(-.064f,.244f,-.075f),new Vector3(.034f,.011f,.002f),clear,false);
  plus.localPosition=Vector3.up*FairRouteGeometry.PlusLift;
  foreach(var t in cabinet.GetComponentsInChildren<Transform>(true))if(t.name=="PLUS entry"||t.name=="PLUS\nSTART")t.localPosition+=Vector3.up*FairRouteGeometry.PlusLift;
  // The previous red badge was generated directly under the decorative root, without its
  // own group. Move only the compact PLUS badge pieces by their measured bounds.
  var decor=GameObject.Find("Reference cabinet · sculpted decorative assembly");
  if(decor)foreach(var renderer in decor.GetComponentsInChildren<MeshRenderer>(true)){
   var b=renderer.bounds;if(Mathf.Abs(b.center.x+.064f)<.020f&&b.center.y>.235f&&b.center.y<.313f&&b.size.x<.058f&&b.size.y<.090f)renderer.transform.localPosition+=Vector3.up*FairRouteGeometry.PlusLift;
  }
  ReferenceFairRoute.Build(cabinet,machine);
 }
 static Material Mat(string n,Color c,float metal,float gloss,bool transparent=false){var m=new Material(Shader.Find("Standard")){name=n,color=c};m.SetFloat("_Metallic",metal);m.SetFloat("_Glossiness",gloss);if(transparent){m.SetFloat("_Mode",3);m.SetInt("_SrcBlend",5);m.SetInt("_DstBlend",10);m.SetInt("_ZWrite",0);m.EnableKeyword("_ALPHABLEND_ON");m.renderQueue=3000;}AssetDatabase.CreateAsset(m,"Assets/Yozora/Generated/"+n+".mat");return m;}
 static void Pin(Transform parent,Vector2 p,string label){
  // Separate camera mappings compress this shallow row; uncorrected free gaps were only
  // 9.1/9.5 mm and wedged an 11 mm ball. Preserve source pixels in the trace table and
  // explicitly record these small reconstruction offsets instead of altering evidence.
  // R3 00:05 anchors the lower wide-shot row at 85–103% LCD height. The close-up
  // PLUS row travels with its admission sensor. Source pixel anchors remain unmodified.
  if(label.StartsWith("L"))p.y+=FairRouteGeometry.LowerWideNailLift;
  if(label.StartsWith("P"))p.y+=FairRouteGeometry.PlusLift;
  if(label.StartsWith("P08 ")||label.StartsWith("P09 ")||label.StartsWith("P10 "))p.x-=.010f;
  if(label.StartsWith("P02 "))p.x-=.0032f;
  if(label.StartsWith("P03 "))p.x+=.0007f;
  if(label.StartsWith("P04 "))p.x+=.0041f;
  var g=new GameObject(label);g.transform.SetParent(parent,false);g.transform.localPosition=new Vector3(p.x,p.y,-.052f);
  Cylinder(g.transform,"Brass nail shaft",Vector3.zero,.0013f,.033f,brass);
  Cylinder(g.transform,"Domed polished head",new Vector3(0,0,-.0172f),.0021f,.0015f,steel);
  var cap=GameObject.CreatePrimitive(PrimitiveType.Sphere);cap.name="Rounded nail crown";cap.transform.SetParent(g.transform,false);cap.transform.localPosition=new Vector3(0,0,-.018f);cap.transform.localScale=new Vector3(.0042f,.0042f,.0011f);Object.DestroyImmediate(cap.GetComponent<Collider>());cap.GetComponent<Renderer>().sharedMaterial=steel;
  var collider=g.AddComponent<CapsuleCollider>();collider.direction=2;collider.radius=.0013f;collider.height=.033f;collider.sharedMaterial=contact;
 }
 static void Guide(Transform root,string n,Vector2[] p,float width){var g=new GameObject(n).transform;g.SetParent(root,false);for(int i=0;i<p.Length-1;i++){Vector3 a=new Vector3(p[i].x,p[i].y,-.052f),b=new Vector3(p[i+1].x,p[i+1].y,-.052f);var wall=Box(g,"Resin wall and contact",(a+b)/2,new Vector3(width,(b-a).magnitude+width,.037f),clear,true);wall.transform.localRotation=Quaternion.FromToRotation(Vector3.up,(b-a).normalized);
   var rim=Box(g,"Polished front wall return",(a+b)/2+new Vector3(0,0,-.0195f),new Vector3(width*1.18f,(b-a).magnitude+width,.0018f),edge,false);rim.transform.localRotation=wall.transform.localRotation;
  }}
 static void Boss(Transform p,Vector3 at){Cylinder(p,"Clear mounting boss",at,.0042f,.006f,clear);Cylinder(p,"Recessed screw",at-new Vector3(0,0,.004f),.0016f,.001f,steel);}
 static void Cylinder(Transform p,string n,Vector3 at,float r,float length,Material m){var g=GameObject.CreatePrimitive(PrimitiveType.Cylinder);g.name=n;g.transform.SetParent(p,false);g.transform.localPosition=at;g.transform.localRotation=Quaternion.Euler(90,0,0);g.transform.localScale=new Vector3(2*r,length/2,2*r);Object.DestroyImmediate(g.GetComponent<Collider>());g.GetComponent<Renderer>().sharedMaterial=m;}
 static GameObject Box(Transform p,string n,Vector3 at,Vector3 size,Material m,bool collide){var g=GameObject.CreatePrimitive(PrimitiveType.Cube);g.name=n;g.transform.SetParent(p,false);g.transform.localPosition=at;g.transform.localScale=size;g.GetComponent<Renderer>().sharedMaterial=m;if(collide)g.GetComponent<BoxCollider>().sharedMaterial=contact;else Object.DestroyImmediate(g.GetComponent<Collider>());return g;}
}
