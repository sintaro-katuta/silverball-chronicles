using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEngine.UI;
using UnityEngine.Rendering;
using Yozora;

// Front-elevation modelling from R1 02:00 / 07:15 and the product cabinet photograph.
// All meshes here are decorative. They never own contacts, sensors, or game outcomes.
public static class ReferenceCabinetBuilder {
 const string Folder="Assets/Yozora/Generated/";
 static Material chrome, dark, pearl, resin, blue, purple, bright, gold, red;
 static readonly Dictionary<Material,List<CombineInstance>> batches=new Dictionary<Material,List<CombineInstance>>();
 static int meshId;
 public static void Build(Transform cabinet,YozoraMachine machine) {
  batches.Clear();meshId=0;
  string[] replace={"Chrome frame moulding","Purple segmented light","Layered resin facet","Speaker chrome bezel","Speaker black cone","Speaker inner ring","Speaker perforation","Clear resin facets","Resin highlight","Resin fastener","Blue rose lamp","Rose lens core","Lower pearl apron","Apron grille","Control island","PUSH surround","PUSH frosted button","PUSH purple rim","Upper purple slatted beam","Upper grille ridge","FAIR clear transfer ramp","Central FAIR housing highlight","Left distributor resin","Distributor silver hex panel","Distributor purple center","＋","PLUS START","Crown chrome","Crown dark face","Crown light strip"};
  foreach(var t in cabinet.GetComponentsInChildren<Transform>(true)) {
   if(!t || t==cabinet)continue;
   foreach(string name in replace)if(t.name==name){UnityEngine.Object.DestroyImmediate(t.gameObject);break;}
  }
  chrome=Mat("Cut chrome",new Color(.82f,.89f,.94f),1,.94f);
  dark=Mat("Piano black",new Color(.009f,.013f,.021f),.45f,.93f);
  pearl=Mat("White pearl apron",new Color(.87f,.9f,.92f),.22f,.7f);
  resin=Mat("Moulded clear lens",new Color(.79f,.83f,.87f,.035f),.015f,.97f);
  resin.SetFloat("_Mode",3);resin.SetInt("_SrcBlend",(int)BlendMode.One);resin.SetInt("_DstBlend",(int)BlendMode.OneMinusSrcAlpha);resin.SetInt("_ZWrite",0);resin.EnableKeyword("_ALPHAPREMULTIPLY_ON");resin.renderQueue=3000;
  blue=Mat("Rose azure",new Color(.018f,.31f,.66f),.65f,.9f,new Color(0,.13f,.28f));
  purple=Mat("Frame violet diffuser",new Color(.28f,.025f,.63f),.45f,.8f,new Color(.35f,.015f,.65f));
  bright=Mat("Lens specular ridges",new Color(.55f,.59f,.63f),.95f,.94f);
  gold=Mat("Divine armament brass",new Color(.83f,.59f,.2f),.92f,.84f);
  red=Mat("PLUS red lens",new Color(.68f,.008f,.033f),.55f,.86f,new Color(.12f,0,.004f));
  var root=new GameObject("Reference cabinet · sculpted decorative assembly").transform;root.SetParent(cabinet,false);
  PremiumMainCabinetGeometry.Build(root,machine,chrome,dark,resin,purple,blue,gold);
  PlusBadge();
  Flush(root,"Static cabinet");
  HardwareLettering(root,machine.font);
  SculptSword(machine.swordBlue,true);SculptSword(machine.swordGold,false);
  StudioReflection();
  Debug.Log("YOZORA_REFERENCE_CABINET: decorative meshes only; LCD and physics preserved");
 }
 static Material Mat(string name,Color color,float metal,float gloss,Color? emission=null){
  var m=new Material(Shader.Find("Standard")){name="Reference "+name,color=color};m.SetFloat("_Metallic",metal);m.SetFloat("_Glossiness",gloss);
  if(emission.HasValue){m.EnableKeyword("_EMISSION");m.SetColor("_EmissionColor",emission.Value);}
  AssetDatabase.CreateAsset(m,Folder+"RefCabinet-"+name.Replace(' ','-')+".mat");return m;
 }
 static void Frame(){
  for(int sign=-1;sign<=1;sign+=2){
   // One continuous edge, with an inset diffuser and thin polished return lip.
   var path=new[]{new Vector3(sign*.262f,.208f,-.108f),new Vector3(sign*.268f,.43f,-.108f),new Vector3(sign*.269f,.79f,-.108f),new Vector3(sign*.254f,.985f,-.108f),new Vector3(sign*.208f,1.013f,-.108f)};
   for(int i=1;i<path.Length;i++){Tube(path[i-1],path[i],.007f,chrome);Tube(path[i-1]+Vector3.back*.009f,path[i]+Vector3.back*.009f,.0028f,purple);}
   for(int j=0;j<5;j++){float x=sign*(.178f+j*.017f);Box(new Vector3(x,.962f,-.115f),new Vector3(.006f,.041f,.015f),Quaternion.Euler(0,0,sign*-15),chrome);}
   Speaker(new Vector3(sign*.214f,.887f,-.135f));
  }
  Box(new Vector3(0,.917f,-.116f),new Vector3(.346f,.037f,.022f),Quaternion.identity,dark);
  for(int i=0;i<66;i++)Box(new Vector3(-.17f+i*.0052f,.919f,-.131f),new Vector3(.0011f,.024f,.004f),Quaternion.identity,chrome);
  for(int i=0;i<9;i++){
   float x=-.16f+i*.04f;Tube(new Vector3(x,.893f,-.12f),new Vector3(x+.008f,.885f,-.133f),.002f,chrome);
   Tube(new Vector3(x+.008f,.885f,-.133f),new Vector3(x+.018f,.893f,-.12f),.002f,chrome);
  }
  // R1 front photograph: shallow rounded lenses behind the SAO crest, not a row of spikes.
  for(int i=0;i<4;i++){
   float x=-.13f+i*.085f;RoundedLens(new Vector3(x,1.006f,-.123f),new Vector2(.091f,.036f),.011f,.012f,purple);
   Tube(new Vector3(x-.028f,1.023f,-.136f),new Vector3(x+.028f,1.023f,-.136f),.0009f,chrome);
  }
 }
 static void Speaker(Vector3 c){
  Disc(c+Vector3.forward*.004f,.047f,.006f,chrome);Disc(c,.0445f,.003f,dark);Ring(c+Vector3.back*.003f,.043f,.001f,chrome);
  // Real perforated cloth reads dark, not bright polka dots.
  for(int y=-12;y<=12;y++)for(int x=-12;x<=12;x++)if(x*x+y*y<145)
   Disc(c+new Vector3(x*.00335f+(y%2)*.001675f,y*.00335f,-.002f),.00044f,.0003f,chrome,6);
 }
 static void Lens(){
  var outline=ReferenceShape.ScreenOutline;Vector3 center=new Vector3(.012f,.597f,-.109f);
  // The transparent moulding follows the asymmetric window instead of repeated boxes.
  var inner=new List<Vector3>();var outer=new List<Vector3>();
  foreach(var p in outline){Vector3 q=center+new Vector3(p.x*.309f,p.y*.46968f,0);inner.Add(q);Vector3 d=(q-center).normalized;outer.Add(q+d*.022f+Vector3.forward*.009f);}
  for(int i=0;i<inner.Count;i++){
   int j=(i+1)%inner.Count;Quad(inner[i],inner[j],outer[j],outer[i],resin);
   Tube(inner[i],inner[j],.0012f,chrome);Tube(outer[i],outer[j],.0021f,bright);
   int count=Mathf.Max(1,Mathf.CeilToInt(Vector3.Distance(inner[i],inner[j])/.028f));
   for(int k=0;k<count;k++){
    float t=(k+.5f)/count;Vector3 a=Vector3.Lerp(inner[i],inner[j],t),b=Vector3.Lerp(outer[i],outer[j],t);
    Tube(a+Vector3.forward*.004f,b,.00065f,bright);
   }
  }
  // Continuous stepped resin returns. The reference shows moulded channels, not repeated saw teeth.
  for(int side=-1;side<=1;side+=2){
   var path=side<0?new[]{new Vector3(-.161f,.405f,-.125f),new Vector3(-.192f,.449f,-.125f),new Vector3(-.203f,.51f,-.125f),new Vector3(-.202f,.687f,-.125f),new Vector3(-.185f,.764f,-.125f),new Vector3(-.15f,.804f,-.125f)}:
    new[]{new Vector3(.187f,.397f,-.125f),new Vector3(.203f,.44f,-.125f),new Vector3(.211f,.505f,-.125f),new Vector3(.215f,.731f,-.125f),new Vector3(.195f,.79f,-.125f),new Vector3(.167f,.824f,-.125f)};
   for(int i=1;i<path.Length;i++){
    Vector3 a=path[i-1],b=path[i],offset=new Vector3(side*.02f,0,.008f);
    Quad(a,b,b+offset,a+offset,resin);
    for(int lane=0;lane<3;lane++){Vector3 shift=new Vector3(side*(.004f+lane*.005f),0,-lane*.0014f);Tube(a+shift,b+shift,lane==0?.0013f:.00065f,lane==0?resin:bright);}
   }
   for(int i=0;i<5;i++){
    float y=.438f+i*.076f,x=side<0?-.204f:.219f;
    RoundedLens(new Vector3(x,y,-.136f),new Vector2(.022f,.039f),.004f,.006f,resin);
    Disc(new Vector3(x,y,-.143f),.0023f,.001f,chrome,12);
    Tube(new Vector3(x-.0015f,y,-.144f),new Vector3(x+.0015f,y,-.144f),.0003f,dark);
   }
  }
  // Right-side divine-armament pedestal: recessed black plate and curled chrome edges.
  Prism(new[]{new Vector2(.17f,.51f),new Vector2(.224f,.525f),new Vector2(.223f,.691f),new Vector2(.174f,.681f)},-.135f,.017f,chrome);
  Prism(new[]{new Vector2(.176f,.519f),new Vector2(.216f,.53f),new Vector2(.216f,.679f),new Vector2(.177f,.674f)},-.143f,.008f,dark);
  for(int i=0;i<7;i++){float y=.523f+i*.025f;Tube(new Vector3(.215f,y,-.152f),new Vector3(.231f,y+.009f,-.139f),.0013f,chrome);}
  // Broad curved crystal relief under the parked blades, with a shallow central jewel.
  for(int i=0;i<5;i++){float x=-.112f+i*.055f;RoundedLens(new Vector3(x,.839f+Mathf.Abs(i-2)*.002f,-.141f),new Vector2(.063f,.037f),.010f,.018f,i==2?blue:resin);}
  Ring(new Vector3(0,.838f,-.161f),.018f,.0012f,bright);
 }
 static void LowerApron(){
  Prism(new[]{new Vector2(-.283f,.071f),new Vector2(.267f,.071f),new Vector2(.283f,.096f),new Vector2(.283f,.13f),new Vector2(.065f,.116f),new Vector2(-.071f,.159f),new Vector2(-.145f,.213f),new Vector2(-.275f,.23f)},-.116f,.095f,pearl);
  Tube(new Vector3(-.277f,.228f,-.122f),new Vector3(-.151f,.211f,-.127f),.002f,chrome);Tube(new Vector3(-.151f,.211f,-.127f),new Vector3(-.07f,.157f,-.155f),.002f,chrome);
  for(int row=0;row<15;row++)for(int col=0;col<8;col++){
   float x=-.262f+col*.012f,y=.099f+row*.0061f;
   if(Mathf.Pow((x+.216f)/.055f,2)+Mathf.Pow((y-.144f)/.058f,2)<1)Box(new Vector3(x,y,-.118f),new Vector3(.0085f,.0018f,.001f),Quaternion.identity,dark);
  }
  // Push pod: tapered deep body and concentric milled lens, standing forward of the tray.
  Prism(new[]{new Vector2(-.094f,.171f),new Vector2(-.07f,.126f),new Vector2(.043f,.126f),new Vector2(.072f,.165f),new Vector2(.048f,.226f),new Vector2(-.068f,.226f)},-.157f,.064f,dark);
  Vector3 c=new Vector3(-.012f,.205f,-.19f);Disc(c,.047f,.015f,chrome);Disc(c+Vector3.back*.01f,.042f,.008f,pearl);Ring(c+Vector3.back*.015f,.039f,.0012f,chrome);
  for(int i=0;i<32;i++){float a=i*Mathf.PI/16;Vector3 d=new Vector3(Mathf.Cos(a),Mathf.Sin(a),0);Tube(c+d*.035f+Vector3.back*.016f,c+d*.039f+Vector3.back*.016f,.00065f,chrome);}
  Tube(new Vector3(-.065f,.145f,-.17f),new Vector3(.04f,.145f,-.17f),.0016f,purple);
 }
 static void PlusBadge(){
  // R2 00:40: red quatrefoil with a pointed foot, mounted on a clear moulded label.
  Vector3 c=new Vector3(-.064f,.274f,-.15f);
  RoundedLens(c+Vector3.forward*.009f,new Vector2(.041f,.068f),.009f,.009f,resin);
  Vector2[] shape={new Vector2(-.005f,-.004f),new Vector2(-.006f,.003f),new Vector2(-.012f,.002f),new Vector2(-.016f,.007f),new Vector2(-.013f,.012f),new Vector2(-.006f,.01f),new Vector2(-.005f,.016f),new Vector2(-.009f,.02f),new Vector2(0,.024f),new Vector2(.009f,.02f),new Vector2(.005f,.016f),new Vector2(.006f,.01f),new Vector2(.013f,.012f),new Vector2(.016f,.007f),new Vector2(.012f,.002f),new Vector2(.006f,.003f),new Vector2(.005f,-.004f),new Vector2(0,-.015f)};
  var border=new Vector2[shape.Length];var fill=new Vector2[shape.Length];
  for(int i=0;i<shape.Length;i++){border[i]=new Vector2(c.x+shape[i].x*1.12f,c.y+shape[i].y*1.12f);fill[i]=new Vector2(c.x+shape[i].x,c.y+shape[i].y);}
  Prism(border,c.z,.003f,dark);Prism(fill,c.z-.002f,.002f,red);
  // The long title plate sits above the rose, separate from the LCD.
  Prism(new[]{new Vector2(.075f,.314f),new Vector2(.247f,.323f),new Vector2(.249f,.342f),new Vector2(.076f,.332f)},-.149f,.007f,dark);
  Tube(new Vector3(.075f,.314f,-.151f),new Vector3(.247f,.323f,-.151f),.001f,chrome);
 }
 static void HardwareLettering(Transform parent,Font font){
  Label(parent,font,"PLUS\nSTART",new Vector3(-.064f,.265f,-.16f),new Vector2(100,55),22,.00033f,FontStyle.Bold,Color.white);
  Label(parent,font,"Project Alicization",new Vector3(.163f,.329f,-.16f),new Vector2(255,40),23,.00062f,FontStyle.Italic,new Color(.68f,.91f,.94f));
 }
 static void Label(Transform parent,Font font,string value,Vector3 position,Vector2 size,int fontSize,float scale,FontStyle style,Color color){
  var go=new GameObject(value,typeof(RectTransform),typeof(Canvas));go.transform.SetParent(parent,false);go.transform.localPosition=position;go.transform.localScale=Vector3.one*scale;var rect=go.GetComponent<RectTransform>();rect.sizeDelta=size;go.GetComponent<Canvas>().renderMode=RenderMode.WorldSpace;
  var child=new GameObject("Raised printing",typeof(RectTransform),typeof(Text),typeof(Outline));child.transform.SetParent(go.transform,false);var text=child.GetComponent<Text>();text.rectTransform.sizeDelta=size;text.font=font;text.fontSize=fontSize;text.fontStyle=style;text.text=value;text.color=color;text.alignment=TextAnchor.MiddleCenter;text.raycastTarget=false;child.GetComponent<Outline>().effectColor=new Color(.015f,.025f,.034f);child.GetComponent<Outline>().effectDistance=new Vector2(1.2f,-1.2f);
 }
 static void Rose(Vector3 center){
  Disc(center+Vector3.forward*.016f,.041f,.008f,chrome);Ring(center,.04f,.002f,blue);
  for(int layer=0;layer<4;layer++)for(int i=0;i<6+layer*2;i++){
   int count=6+layer*2;float a=i*Mathf.PI*2/count+layer*.39f,r=.005f+layer*.009f;
   Vector3 c=center+new Vector3(Mathf.Cos(a)*r,Mathf.Sin(a)*r,-.012f+layer*.003f);
   var local=new[]{new Vector2(-.01f,-.006f),new Vector2(-.012f,.004f),new Vector2(-.005f,.013f),new Vector2(.005f,.013f),new Vector2(.012f,.005f),new Vector2(.006f,-.006f)};
   var points=new Vector2[local.Length];for(int k=0;k<points.Length;k++){Vector3 v=Quaternion.Euler(0,0,a*Mathf.Rad2Deg-90)*new Vector3(local[k].x,local[k].y,0);points[k]=new Vector2(c.x+v.x,c.y+v.y);}
   Prism(points,c.z,.005f,blue);for(int k=1;k<4;k++)Tube(new Vector3(points[k].x,points[k].y,c.z-.0005f),new Vector3(points[k+1].x,points[k+1].y,c.z-.0005f),.0006f,bright);
  }
 }
 static void SculptSword(Transform root,bool azure){
  if(!root)return;while(root.childCount>0)UnityEngine.Object.DestroyImmediate(root.GetChild(0).gameObject);
  Material blade=Mat(azure?"Blue steel blade":"Golden steel blade",azure?new Color(.09f,.32f,.43f):new Color(.75f,.61f,.36f),.92f,.95f);Material trim=azure?chrome:gold;
  // Actual tapered tip and raised median ridge, with a separate hilt.
  Vector3 a=new Vector3(-.009f,-.075f,0),b=new Vector3(.009f,-.075f,0),tip=new Vector3(0,.155f,0),ridge=new Vector3(0,-.054f,-.007f);
  Triangle(a,tip,ridge,blade);Triangle(ridge,tip,b,trim);Triangle(a,ridge,b,blade);
  Vector3 back=new Vector3(0,-.054f,.007f);Triangle(a,back,tip,trim);Triangle(back,b,tip,blade);Triangle(a,b,back,blade);
  // The raised center and edge bevel form a closed diamond cross-section, not a flat triangle.
  Tube(a,tip,.00048f,chrome);Tube(b,tip,.00048f,chrome);
  Tube(new Vector3(0,-.072f,-.0072f),new Vector3(0,.139f,-.001f),.0006f,bright);
  Prism(new[]{new Vector2(-.037f,-.09f),new Vector2(-.034f,-.078f),new Vector2(-.015f,-.08f),new Vector2(0,-.068f),new Vector2(.015f,-.08f),new Vector2(.034f,-.078f),new Vector2(.037f,-.09f),new Vector2(.013f,-.088f),new Vector2(0,-.082f),new Vector2(-.013f,-.088f)},-.008f,.015f,trim);
  Box(new Vector3(0,-.112f,0),new Vector3(.011f,.045f,.01f),Quaternion.identity,dark);
  for(int i=0;i<8;i++)Tube(new Vector3(-.006f,-.093f-i*.005f,-.006f),new Vector3(.006f,-.097f-i*.005f,-.006f),.0008f,trim);
  Disc(new Vector3(0,-.081f,-.014f),.008f,.004f,azure?blue:gold);Disc(new Vector3(0,-.137f,0),.008f,.009f,trim);
  Flush(root,"Sculpted sword");
 }
 static void Box(Vector3 c,Vector3 s,Quaternion r,Material m){
  Vector3[] v=new Vector3[8];for(int i=0;i<8;i++)v[i]=c+r*new Vector3(((i&1)==0?-.5f:.5f)*s.x,((i&2)==0?-.5f:.5f)*s.y,((i&4)==0?-.5f:.5f)*s.z);
  Quad(v[0],v[2],v[3],v[1],m);Quad(v[4],v[5],v[7],v[6],m);Quad(v[0],v[1],v[5],v[4],m);Quad(v[2],v[6],v[7],v[3],m);Quad(v[0],v[4],v[6],v[2],m);Quad(v[1],v[3],v[7],v[5],m);
 }
 static void Prism(Vector2[] points,float front,float depth,Material m){
  Vector2 mid=Vector2.zero;foreach(var p in points)mid+=p;mid/=points.Length;
  for(int i=0;i<points.Length;i++){var p=points[i];var q=points[(i+1)%points.Length];Vector3 a=new Vector3(p.x,p.y,front),b=new Vector3(q.x,q.y,front);Triangle(new Vector3(mid.x,mid.y,front),b,a,m);Quad(a,b,b+Vector3.forward*depth,a+Vector3.forward*depth,m);}
 }
 static void RoundedLens(Vector3 c,Vector2 size,float radius,float depth,Material m){
  var points=new List<Vector2>();float rx=size.x*.5f-radius,ry=size.y*.5f-radius;
  for(int corner=0;corner<4;corner++)for(int i=0;i<=5;i++){
   float angle=(corner*90+i*18)*Mathf.Deg2Rad;
   float x=corner==0||corner==3?rx:-rx,y=corner<2?ry:-ry;
   points.Add(new Vector2(c.x+x+Mathf.Cos(angle)*radius,c.y+y+Mathf.Sin(angle)*radius));
  }
  Prism(points.ToArray(),c.z,depth,m);
 }
 static void Disc(Vector3 c,float radius,float depth,Material m,int sides=48){var p=new Vector2[sides];for(int i=0;i<sides;i++){float a=i*Mathf.PI*2/sides;p[i]=new Vector2(c.x+Mathf.Cos(a)*radius,c.y+Mathf.Sin(a)*radius);}Prism(p,c.z,depth,m);}
 static void Ring(Vector3 c,float radius,float thickness,Material m){for(int i=0;i<64;i++){float a=i*Mathf.PI/32,b=(i+1)*Mathf.PI/32;Tube(c+new Vector3(Mathf.Cos(a),Mathf.Sin(a),0)*radius,c+new Vector3(Mathf.Cos(b),Mathf.Sin(b),0)*radius,thickness,m);}}
 static void Tube(Vector3 a,Vector3 b,float radius,Material m){
  Vector3 direction=(b-a).normalized,u=Vector3.Cross(direction,Vector3.forward).normalized;if(u.sqrMagnitude<.5f)u=Vector3.right;Vector3 w=Vector3.Cross(direction,u);
  const int count=24;var v=new Vector3[(count+1)*2];var normals=new Vector3[v.Length];var indices=new int[count*6];
  for(int i=0;i<=count;i++){float t=i*Mathf.PI*2/count;Vector3 normal=u*Mathf.Cos(t)+w*Mathf.Sin(t);v[i*2]=a+normal*radius;v[i*2+1]=b+normal*radius;normals[i*2]=normals[i*2+1]=normal;if(i<count){int n=i*2,k=i*6;indices[k]=n;indices[k+1]=n+2;indices[k+2]=n+1;indices[k+3]=n+2;indices[k+4]=n+3;indices[k+5]=n+1;}}
  var mesh=new Mesh();mesh.vertices=v;mesh.normals=normals;mesh.triangles=indices;Add(mesh,m);
 }
 static void Triangle(Vector3 a,Vector3 b,Vector3 c,Material m){var mesh=new Mesh();mesh.vertices=new[]{a,b,c,c,b,a};mesh.triangles=new[]{0,1,2,3,4,5};mesh.RecalculateNormals();Add(mesh,m);}
 static void Quad(Vector3 a,Vector3 b,Vector3 c,Vector3 d,Material m){var mesh=new Mesh();mesh.vertices=new[]{a,b,c,d};mesh.triangles=new[]{0,1,2,0,2,3};mesh.RecalculateNormals();Add(mesh,m);}
 static void Add(Mesh mesh,Material m){if(!batches.ContainsKey(m))batches[m]=new List<CombineInstance>();batches[m].Add(new CombineInstance{mesh=mesh,transform=Matrix4x4.identity});}
 static void Flush(Transform parent,string name){
  foreach(var pair in batches){var mesh=new Mesh{name=name+" "+pair.Key.name,indexFormat=IndexFormat.UInt32};mesh.CombineMeshes(pair.Value.ToArray(),true,true);mesh.RecalculateBounds();AssetDatabase.CreateAsset(mesh,Folder+"RefCabinet-Mesh-"+(meshId++)+".asset");var go=new GameObject(mesh.name);go.transform.SetParent(parent,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;var renderer=go.AddComponent<MeshRenderer>();renderer.sharedMaterial=pair.Key;renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;foreach(var source in pair.Value)UnityEngine.Object.DestroyImmediate(source.mesh);}
  batches.Clear();
 }
 static void StudioReflection(){
  // A local procedural reflection environment makes chrome reflect broad studio lights.
  // It is not a photograph of a hall or a claim about the reference's illumination.
  const int size=64;var cube=new Cubemap(size,TextureFormat.RGBA32,true){name="Cabinet neutral studio reflection"};
  for(int face=0;face<6;face++){var colors=new Color[size*size];for(int y=0;y<size;y++)for(int x=0;x<size;x++){
   float u=2*(x+.5f)/size-1,v=2*(y+.5f)/size-1;Vector3 d;
   switch(face){case 0:d=new Vector3(1,-v,-u);break;case 1:d=new Vector3(-1,-v,u);break;case 2:d=new Vector3(u,1,v);break;case 3:d=new Vector3(u,-1,-v);break;case 4:d=new Vector3(u,-v,1);break;default:d=new Vector3(-u,-v,-1);break;}d.Normalize();
   float strip=Mathf.Pow(Mathf.Clamp01(1-Mathf.Abs(d.x-.48f)*9),3)*Mathf.Clamp01((d.y+.65f)*2);float strip2=Mathf.Pow(Mathf.Clamp01(1-Mathf.Abs(d.x+.65f)*12),3);float ceiling=Mathf.Pow(Mathf.Max(0,d.y),7);
   colors[y*size+x]=new Color(.07f,.09f,.13f)+new Color(.83f,.86f,.87f)*Mathf.Clamp01(strip+strip2*.7f+ceiling*.75f);
  }cube.SetPixels(colors,(CubemapFace)face);}cube.Apply(true,false);AssetDatabase.CreateAsset(cube,Folder+"RefCabinet-Reflection.cubemap");RenderSettings.defaultReflectionMode=DefaultReflectionMode.Custom;RenderSettings.customReflectionTexture=cube;RenderSettings.reflectionIntensity=.8f;
 }
}
