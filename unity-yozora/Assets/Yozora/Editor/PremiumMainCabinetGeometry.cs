using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEngine.Rendering;
using Yozora;

// R1 full-cabinet photograph and R3 01:30: continuous polished shoulders, asymmetric mouldings.
// Every object is a named decorative part. No colliders or illumination settings are created here.
public static class PremiumMainCabinetGeometry {
 const string Folder="Assets/Yozora/Generated/";static int id;static Transform root;
 static Material metal,black,clear,violet,azure,gold,meshDark,edge;
 public static void Build(Transform parent,YozoraMachine machine,Material chrome,Material dark,Material resin,Material purple,Material blue,Material brass){
  id=0;metal=chrome;black=dark;clear=resin;violet=purple;azure=blue;gold=brass;
  meshDark=Mat("Woven graphite",new Color(.014f,.018f,.023f),.25f,.53f);
  edge=Mat("Clear polished lip",new Color(.7f,.75f,.8f,.075f),.05f,.98f,true);
  root=new GameObject("Premium main cabinet · editable parts").transform;root.SetParent(parent,false);
  Exterior();Speaker(-1);Speaker(1);Crest();LeftLens();RightLens();WindowLip();DivinePedestal(machine);BoardInlays();Rose(new Vector3(.19f,.287f,-.14f));
 }
 static Material Mat(string name,Color c,float metallic,float gloss,bool transparent=false){var m=new Material(Shader.Find("Standard")){name=name,color=c};m.SetFloat("_Metallic",metallic);m.SetFloat("_Glossiness",gloss);if(transparent){m.SetFloat("_Mode",3);m.SetInt("_SrcBlend",(int)BlendMode.One);m.SetInt("_DstBlend",(int)BlendMode.OneMinusSrcAlpha);m.SetInt("_ZWrite",0);m.EnableKeyword("_ALPHAPREMULTIPLY_ON");m.renderQueue=3000;}AssetDatabase.CreateAsset(m,Folder+"PremiumMain-"+name.Replace(' ','-')+".mat");return m;}
 static void Exterior(){
  for(int side=-1;side<=1;side+=2){
   var spine=new[]{new Vector3(side*.27f,.215f,-.086f),new Vector3(side*.275f,.37f,-.087f),new Vector3(side*.273f,.70f,-.087f),new Vector3(side*.269f,.887f,-.083f),new Vector3(side*.26f,.972f,-.08f),new Vector3(side*.234f,1.009f,-.071f),new Vector3(side*.18f,1.012f,-.064f)};
   Ribbon("Continuous black shoulder "+side,spine,.024f,.024f,black);
   var polished=Shift(spine,new Vector3(-side*.007f,0,-.018f));Ribbon("Rolled chrome outer shoulder "+side,polished,.008f,.010f,metal);
   Tube("Violet inset optical edge "+side,Shift(spine,new Vector3(-side*.014f,0,-.020f)),.0018f,violet);
   Tube("Inner chrome hairline "+side,Shift(spine,new Vector3(-side*.019f,0,-.021f)),.00085f,metal);
   // Deliberate recessed shoulder vents behind the circular speakers.
   for(int i=0;i<6;i++){
    float x=side*(.176f+i*.012f);var p=Rounded(new Vector2(x,.962f),new Vector2(.008f,.044f),.003f,8);
    Plate("Shoulder recessed vent "+side+" "+i,p,-.112f,.005f,.0015f,black);
    Tube("Shoulder vent polished return",new[]{new Vector3(x-side*.003f,.948f,-.118f),new Vector3(x-side*.003f,.975f,-.118f)},.00065f,metal);
   }
  }
 }
 static void Speaker(int side){
  Vector3 center=new Vector3(side*.216f,.884f,-.124f);
  LatheZ("Speaker die-cast bezel "+side,center,new[]{new Vector2(.0425f,-.005f),new Vector2(.047f,-.004f),new Vector2(.049f,-.001f),new Vector2(.049f,.004f),new Vector2(.046f,.008f)},metal);
  LatheZ("Speaker recessed acoustic cone "+side,center,new[]{new Vector2(0,.002f),new Vector2(.018f,.001f),new Vector2(.036f,-.0005f),new Vector2(.042f,-.003f)},meshDark);
  // Fine dark woven strands, not an array of shiny white dots.
  var weave=new MeshData();float radius=.0415f;
  for(int row=-30;row<=30;row++){
   float y=row*.00135f;float h=Mathf.Sqrt(Mathf.Max(0,radius*radius-y*y));
   AppendTube(weave,new[]{center+new Vector3(-h,y,-.005f),center+new Vector3(h,y,-.005f)},.00018f,6);
   AppendTube(weave,new[]{center+new Vector3(y,-h,-.0047f),center+new Vector3(y,h,-.0047f)},.00016f,6);
  }
  Emit("Woven speaker grille "+side,weave,black);
  Circle("Speaker polished inner lip "+side,center+Vector3.back*.005f,.043f,.00065f,metal);
 }
 static void Crest(){
  Plate("Upper sculpted logo plinth",new[]{new Vector2(-.183f,.935f),new Vector2(-.192f,.967f),new Vector2(-.157f,1.013f),new Vector2(-.102f,1.041f),new Vector2(-.054f,1.047f),new Vector2(.003f,1.018f),new Vector2(.086f,1.028f),new Vector2(.155f,1.001f),new Vector2(.185f,.962f),new Vector2(.166f,.938f)},-.123f,.026f,.004f,black);
  var jewel=Mat("Crown amethyst cut glass",new Color(.14f,.014f,.29f),.68f,.93f);
  // Purple optical medallions and sharply beveled metal returns back the existing character/SAO crest.
  for(int i=0;i<5;i++){
   Vector2 c=new Vector2(-.118f+i*.058f,1.000f+(i==0?.019f:i==1?.023f:0));
   Plate("Crown cut crystal "+i,Regular(c,new Vector2(.043f,.038f),6,30),-.132f,.014f,.005f,jewel);
   CutStone("Crown optical cut facets "+i,c,new Vector2(.040f,.035f),-.14f,.014f,jewel);
   Plate("Crown mirrored edge "+i,Regular(c,new Vector2(.047f,.042f),6,30),-.126f,.009f,.002f,metal);
  }
  var beam=new[]{new Vector3(-.179f,.917f,-.119f),new Vector3(-.11f,.91f,-.135f),new Vector3(0,.914f,-.146f),new Vector3(.11f,.916f,-.133f),new Vector3(.178f,.925f,-.118f)};
  Ribbon("Curved upper grille bed",beam,.031f,.015f,black);
  var slats=new MeshData();
  for(int i=0;i<76;i++){float x=-.17f+i*.0045f,z=-.145f+.025f*Mathf.Pow(x/.17f,2);AppendTube(slats,new[]{new Vector3(x,.903f,z),new Vector3(x,.922f,z)},.00043f,8);}
  Emit("Fine chrome upper grille",slats,metal);
  for(int i=0;i<8;i++){float x=-.148f+i*.042f;Tube("Hanging curved crest filigree "+i,new[]{new Vector3(x,.897f,-.128f),new Vector3(x+.008f,.884f,-.136f),new Vector3(x+.018f,.886f,-.141f),new Vector3(x+.027f,.899f,-.135f)},.0013f,metal);}
  for(int i=0;i<4;i++){float x=-.092f+i*.062f;Plate("Upper blue compound lens "+i,Rounded(new Vector2(x,.837f),new Vector2(.078f,.040f),.018f,12),-.139f,.017f,.004f,clear);Circle("Lens etched swirl "+i,new Vector3(x,.837f,-.16f),.012f,.00048f,azure);}
 }
 static void WindowLip(){
  var points=new List<Vector3>();foreach(var q in ReferenceShape.ScreenOutline)points.Add(new Vector3(.012f+q.x*.309f,.597f+q.y*.46968f,-.106f));points.Add(points[0]);
  // Keep the LCD opening: only its perimeter and the narrow outer return are modelled here.
  Tube("Continuous LCD polished seat",points.ToArray(),.00125f,metal,false);
  Tube("Continuous LCD clear return",Shift(points.ToArray(),new Vector3(0,0,.004f)),.0032f,edge,false);
 }
 static void LeftLens(){
  var path=new[]{new Vector3(-.109f,.833f,-.095f),new Vector3(-.170f,.787f,-.10f),new Vector3(-.202f,.70f,-.10f),new Vector3(-.215f,.599f,-.105f),new Vector3(-.216f,.483f,-.105f),new Vector3(-.197f,.40f,-.105f),new Vector3(-.158f,.352f,-.103f)};
  Ribbon("Left single moulded crescent",path,.037f,.014f,clear);
  Tube("Left external moulded return",Shift(path,new Vector3(-.016f,0,-.005f)),.0021f,edge);
  for(int lane=0;lane<4;lane++)Tube("Left parallel sunk optical groove "+lane,Shift(path,new Vector3(-.011f+lane*.006f,0,-.01f-lane*.0003f)),.00043f,lane%2==0?metal:edge);
  // The lower left side has a honeycomb printed layer under the clear face.
  for(int row=0;row<8;row++)for(int col=0;col<2;col++){
   Vector2 c=new Vector2(-.212f+col*.017f+(row%2)*.0085f,.425f+row*.037f);var hex=Regular(c,new Vector2(.008f,.008f),6,30);
   if((row+col)%3==0)Plate("Inset violet hexagon",hex,-.112f,.0007f,.0002f,violet);
   else Polyline("Etched hexagon cell",hex,-.119f,.00038f,metal);
  }
  foreach(float y in new[]{.443f,.577f,.729f})Boss("Left lens screw seat",new Vector3(-.224f,y,-.123f));
 }
 static void RightLens(){
  var path=new[]{new Vector3(.140f,.842f,-.09f),new Vector3(.188f,.799f,-.10f),new Vector3(.219f,.742f,-.104f),new Vector3(.218f,.661f,-.106f),new Vector3(.224f,.533f,-.105f),new Vector3(.216f,.432f,-.106f),new Vector3(.193f,.376f,-.104f)};
  Ribbon("Right irregular resin spine",path,.037f,.019f,clear);
  Tube("Right thick mould lip",Shift(path,new Vector3(.017f,0,-.006f)),.0023f,edge);
  for(int i=0;i<5;i++){
   float y=.452f+i*.069f;
   var panel=new[]{new Vector2(.184f,y-.025f),new Vector2(.220f,y-.020f),new Vector2(.232f,y+.003f),new Vector2(.22f,y+.029f),new Vector2(.19f,y+.024f),new Vector2(.182f,y+.012f)};
   Plate("Right stepped clear lens "+i,panel,-.126f-i%2*.003f,.014f,.003f,clear);
   var decorative=new[]{new Vector3(.187f,y-.016f,-.145f),new Vector3(.203f,y-.004f,-.148f),new Vector3(.226f,y+.014f,-.138f)};
   Tube("Right curved relief "+i,decorative,.00075f,metal);
   Tube("Right paired curved relief "+i,Shift(decorative,new Vector3(0,.007f,.001f)),.0004f,metal);
  }
  foreach(float y in new[]{.428f,.723f,.801f})Boss("Right lens screw seat",new Vector3(.227f,y,-.134f));
 }
 static void DivinePedestal(YozoraMachine machine){
  var outline=new[]{new Vector2(.175f,.514f),new Vector2(.228f,.518f),new Vector2(.239f,.548f),new Vector2(.232f,.665f),new Vector2(.208f,.695f),new Vector2(.173f,.674f),new Vector2(.171f,.55f)};
  Plate("Divine armament scalloped chrome back",outline,-.146f,.016f,.003f,metal);
  var inset=new[]{new Vector2(.18f,.523f),new Vector2(.219f,.527f),new Vector2(.227f,.550f),new Vector2(.223f,.66f),new Vector2(.207f,.678f),new Vector2(.18f,.66f)};
  Plate("Divine armament charcoal enamel inset",inset,-.151f,.006f,.002f,black);
  for(int side=-1;side<=1;side+=2)for(int i=0;i<3;i++){
   Vector3 c=new Vector3(.20f+side*.022f,.541f+i*.050f,-.161f);var curve=new List<Vector3>();for(int k=0;k<38;k++){float a=k/37f*Mathf.PI*1.6f,r=.013f*(1-k/48f);curve.Add(c+new Vector3(Mathf.Cos(a)*r*side,Mathf.Sin(a)*r,0));}Tube("Engraved armament scroll",curve.ToArray(),.00085f,gold,false);
  }
  Plate("Lower rose-red indicator lens",Rounded(new Vector2(.204f,.492f),new Vector2(.051f,.014f),.006f,10),-.139f,.009f,.002f,violet);
  // Gold glyphs are supplied independently by root-owned CabinetEmbossedText.

 }
 static void BoardInlays(){
  // DMM left selector photograph: restrained silver/black tessellation behind the clear route.
  // Printed layers sit behind the ball/glass depth and do not change the collision board.
  var silver=Mat("Printed satin silver",new Color(.53f,.56f,.61f),.72f,.73f);
  var mauve=Mat("Printed violet",new Color(.085f,.018f,.14f),.15f,.4f);
  var outlines=new MeshData();var crosses=new MeshData();
  for(int side=-1;side<=1;side+=2)for(int row=0;row<16;row++)for(int column=0;column<3;column++){
   float y=.30f+row*.034f,x=side*(.166f+column*.027f+(row%2)*.0135f);
   if(Mathf.Abs(x)>.244f)continue;
   var hex=Regular(new Vector2(x,y),new Vector2(.0148f,.0163f),6,30);var path=new Vector3[7];for(int i=0;i<6;i++)path[i]=new Vector3(hex[i].x,hex[i].y,-.064f);path[6]=path[0];AppendTube(outlines,path,.00032f,6);
   if((row+column)%4==0){var small=Regular(new Vector2(x,y),new Vector2(.007f,.008f),6,30);var mark=new Vector3[7];for(int i=0;i<6;i++)mark[i]=new Vector3(small[i].x,small[i].y,-.0647f);mark[6]=mark[0];AppendTube(crosses,mark,.0024f,8);}
   if((row+column)%3==0){AppendTube(outlines,new[]{new Vector3(x-.007f,y,-.065f),new Vector3(x+.007f,y,-.065f)},.00025f,6);}
  }
  // Larger staggered silver fields visible in DMM closeup, leaving black negative-space cells.
  for(int row=0;row<10;row++){
   Vector2 c=new Vector2(-.218f+(row%2)*.021f,.403f+row*.038f);
   Plate("Silver negative-space hex panel "+row,Regular(c,new Vector2(.018f,.021f),6,30),-.075f,.0012f,.0004f,silver);
   if(row%3!=1)Plate("Purple printed hex field "+row,Regular(c+new Vector2(.014f,.018f),new Vector2(.010f,.011f),6,30),-.077f,.0012f,.0004f,mauve);
  }
  for(int side=-1;side<=1;side+=2)for(int i=0;i<14;i++){
   float y=.356f+i*.033f;Vector2 c=new Vector2(side*(.239f-.010f*Mathf.Sin(i*.52f)),y);
   CutStone("Internal chrome refractor "+side+" "+i,c,new Vector2(.009f,.017f),-.101f,.007f,metal);
   Plate("Clear compound refractor "+side+" "+i,Regular(c+new Vector2(-side*.006f,.009f),new Vector2(.012f,.023f),5,23+i*7),-.108f,.012f,.004f,clear);
  }
  Emit("Printed geometric silver board layer",outlines,silver);Emit("Printed violet hexagon inlays",crosses,mauve);
 }
 static void CutStone(string name,Vector2 c,Vector2 extent,float z,float relief,Material m){
  var d=new MeshData();int n=8;
  for(int i=0;i<n;i++){float a=i*Mathf.PI*2/n,b=(i+1)*Mathf.PI*2/n;Vector3 p=new Vector3(c.x+Mathf.Cos(a)*extent.x,c.y+Mathf.Sin(a)*extent.y,z),q=new Vector3(c.x+Mathf.Cos(b)*extent.x,c.y+Mathf.Sin(b)*extent.y,z),tip=new Vector3(c.x,c.y,z-relief);Face(d,tip,q,p);}
  Emit(name,d,m);
 }
 static void Face(MeshData d,Vector3 a,Vector3 b,Vector3 c){int i=d.v.Count;Vector3 n=Vector3.Cross(b-a,c-a).normalized;d.v.AddRange(new[]{a,b,c});d.n.AddRange(new[]{n,n,n});d.t.AddRange(new[]{i,i+1,i+2});}
 static void Rose(Vector3 center){
  var petal=Mat("Rose curved cobalt crystal",new Color(.015f,.22f,.39f),.74f,.96f);
  var inner=Mat("Rose internal pale blue reflector",new Color(.09f,.48f,.66f),.88f,.95f);
  LatheZ("Blue rose polished receptacle",center,new[]{new Vector2(.025f,.012f),new Vector2(.043f,.01f),new Vector2(.045f,.004f),new Vector2(.041f,0)},metal);
  for(int layer=0;layer<5;layer++){
   int count=5+layer*2;float radius=.006f+layer*.0073f;
   for(int k=0;k<count;k++){
    float angle=k*Mathf.PI*2/count+layer*.45f;var d=new MeshData();var lip=new List<Vector3>();
    const int across=16,along=10;
    for(int j=0;j<=along;j++)for(int i=0;i<=across;i++){
     float u=i/(float)across*2-1,v=j/(float)along;
     float width=(.0035f+layer*.0013f)*(.45f+.7f*Mathf.Sin(v*Mathf.PI*.72f));
     float radial=radius-.007f+v*.014f;
     float zz=-.017f+layer*.003f- .010f*Mathf.Sin(v*Mathf.PI*.8f)+u*u*.006f;
     Vector3 q=center+new Vector3(Mathf.Cos(angle)*radial-Mathf.Sin(angle)*u*width,Mathf.Sin(angle)*radial+Mathf.Cos(angle)*u*width,zz);
     d.v.Add(q);d.n.Add(Vector3.back);if(j==along)lip.Add(q);
     if(j<along&&i<across){int p=j*(across+1)+i;d.t.AddRange(new[]{p,p+across+1,p+1,p+1,p+across+1,p+across+2});}
    }
    // Duplicate back surface so folded thin petals remain visible at oblique angles.
    int original=d.v.Count;d.v.AddRange(d.v.ToArray());d.n.AddRange(d.n.ToArray());int[] front=d.t.ToArray();for(int t=0;t<front.Length;t+=3)d.t.AddRange(new[]{front[t]+original,front[t+2]+original,front[t+1]+original});
    EmitSmooth("Curled crystal rose petal "+layer+" "+k,d,layer%2==0?petal:inner);
    Tube("Rose petal polished rolled rim",lip.ToArray(),.0003f,inner,false);
   }
  }
 }
 static void EmitSmooth(string name,MeshData d,Material m){
  var mesh=new Mesh{name=name,indexFormat=IndexFormat.UInt32};mesh.SetVertices(d.v);mesh.SetTriangles(d.t,0);mesh.RecalculateNormals();mesh.RecalculateBounds();SaveMesh(name,mesh,m);
 }
 static void SaveMesh(string name,Mesh mesh,Material m){AssetDatabase.CreateAsset(mesh,Folder+"PremiumMain-"+(id++)+".asset");var g=new GameObject(name);g.transform.SetParent(root,false);g.AddComponent<MeshFilter>().sharedMesh=mesh;var r=g.AddComponent<MeshRenderer>();r.sharedMaterial=m;r.shadowCastingMode=ShadowCastingMode.Off;r.receiveShadows=false;}
 static void Boss(string name,Vector3 c){LatheZ(name,c,new[]{new Vector2(.005f,.003f),new Vector2(.005f,0),new Vector2(.0038f,-.002f),new Vector2(.002f,-.002f)},clear);LatheZ(name+" screw",c+Vector3.back*.002f,new[]{new Vector2(0,0),new Vector2(.0024f,0),new Vector2(.0028f,.001f)},metal);Tube(name+" recess",new[]{c+new Vector3(-.0016f,0,-.0025f),c+new Vector3(.0016f,0,-.0025f)},.0003f,black,false);}
 static Vector3[] Shift(Vector3[] p,Vector3 d){var q=new Vector3[p.Length];for(int i=0;i<p.Length;i++)q[i]=p[i]+d;return q;}
 static Vector2[] Regular(Vector2 c,Vector2 r,int n,float degrees){var p=new Vector2[n];for(int i=0;i<n;i++){float a=(degrees+i*360f/n)*Mathf.Deg2Rad;p[i]=c+new Vector2(Mathf.Cos(a)*r.x,Mathf.Sin(a)*r.y);}return p;}
 static Vector2[] Rounded(Vector2 c,Vector2 size,float radius,int n){var p=new List<Vector2>();for(int corner=0;corner<4;corner++)for(int i=0;i<=n;i++){float a=(corner*90+i*90f/n)*Mathf.Deg2Rad;p.Add(c+new Vector2((corner==0||corner==3?1:-1)*(size.x*.5f-radius)+Mathf.Cos(a)*radius,(corner<2?1:-1)*(size.y*.5f-radius)+Mathf.Sin(a)*radius));}return p.ToArray();}
 static void Polyline(string name,Vector2[] p,float z,float radius,Material m){var v=new Vector3[p.Length+1];for(int i=0;i<p.Length;i++)v[i]=new Vector3(p[i].x,p[i].y,z);v[p.Length]=v[0];Tube(name,v,radius,m,false);}
 static Vector3[] Smooth(Vector3[] p,int steps=7){var output=new List<Vector3>();for(int i=0;i<p.Length-1;i++){var a=p[Mathf.Max(0,i-1)];var b=p[i];var c=p[i+1];var d=p[Mathf.Min(p.Length-1,i+2)];for(int j=0;j<steps;j++){float t=j/(float)steps;output.Add(.5f*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t));}}output.Add(p[p.Length-1]);return output.ToArray();}
 static void Ribbon(string name,Vector3[] path,float width,float depth,Material material){var p=Smooth(path);var mesh=new MeshData();const int sides=20;for(int k=0;k<p.Length;k++){Vector3 tangent=(p[Mathf.Min(k+1,p.Length-1)]-p[Mathf.Max(k-1,0)]).normalized,across=Vector3.Cross(tangent,Vector3.forward).normalized;for(int i=0;i<=sides;i++){float a=i*Mathf.PI*2/sides;Vector3 n=across*Mathf.Cos(a)+Vector3.forward*Mathf.Sin(a);mesh.v.Add(p[k]+across*Mathf.Cos(a)*width*.5f+Vector3.forward*Mathf.Sin(a)*depth*.5f);mesh.n.Add(n.normalized);if(k<p.Length-1&&i<sides){int q=k*(sides+1)+i;mesh.t.AddRange(new[]{q,q+sides+1,q+1,q+1,q+sides+1,q+sides+2});}}}Emit(name,mesh,material);}
 static void Tube(string name,Vector3[] path,float radius,Material material,bool smooth=true){var data=new MeshData();AppendTube(data,smooth?Smooth(path):path,radius,16);Emit(name,data,material);}
 static void AppendTube(MeshData data,Vector3[] path,float radius,int sides){int start=data.v.Count;for(int k=0;k<path.Length;k++){Vector3 tangent=(path[Mathf.Min(k+1,path.Length-1)]-path[Mathf.Max(0,k-1)]).normalized,u=Vector3.Cross(tangent,Vector3.forward).normalized;if(u.sqrMagnitude<.5f)u=Vector3.right;Vector3 v=Vector3.Cross(tangent,u);for(int i=0;i<=sides;i++){float a=i*Mathf.PI*2/sides;Vector3 n=u*Mathf.Cos(a)+v*Mathf.Sin(a);data.v.Add(path[k]+n*radius);data.n.Add(n);if(k<path.Length-1&&i<sides){int q=start+k*(sides+1)+i;data.t.AddRange(new[]{q,q+1,q+sides+1,q+1,q+sides+2,q+sides+1});}}}}
 static void Circle(string name,Vector3 c,float radius,float thickness,Material m){var points=new Vector3[97];for(int i=0;i<=96;i++){float a=i*Mathf.PI/48;points[i]=c+new Vector3(Mathf.Cos(a)*radius,Mathf.Sin(a)*radius,0);}Tube(name,points,thickness,m,false);}
 static void LatheZ(string name,Vector3 c,Vector2[] profile,Material material){var mesh=new MeshData();const int segments=96;for(int row=0;row<profile.Length;row++)for(int i=0;i<=segments;i++){float a=i*Mathf.PI*2/segments;Vector2 q=profile[row],diff=profile[Mathf.Min(row+1,profile.Length-1)]-profile[Mathf.Max(0,row-1)];Vector3 n=new Vector3(diff.y*Mathf.Cos(a),diff.y*Mathf.Sin(a),-diff.x).normalized;mesh.v.Add(c+new Vector3(q.x*Mathf.Cos(a),q.x*Mathf.Sin(a),q.y));mesh.n.Add(n);if(row<profile.Length-1&&i<segments){int b=row*(segments+1)+i;mesh.t.AddRange(new[]{b,b+1,b+segments+1,b+1,b+segments+2,b+segments+1});}}Emit(name,mesh,material);}
 static void Plate(string name,Vector2[] points,float z,float depth,float bevel,Material m){
  float signed=0;for(int k=0;k<points.Length;k++){var a=points[k];var b=points[(k+1)%points.Length];signed+=a.x*b.y-b.x*a.y;}if(signed<0){points=(Vector2[])points.Clone();System.Array.Reverse(points);}
  Vector2 center=Vector2.zero;foreach(var v in points)center+=v;center/=points.Length;var data=new MeshData();
  for(int ring=0;ring<3;ring++)for(int i=0;i<points.Length;i++){var p=points[i];Vector2 inward=(center-p).normalized;Vector2 xy=ring==0?p+inward*bevel:p;float zz=ring==0?z:ring==1?z+bevel:z+depth;Vector3 n=ring==0?Vector3.back:new Vector3(-inward.x,-inward.y,ring==1?-.55f:0).normalized;data.v.Add(new Vector3(xy.x,xy.y,zz));data.n.Add(n);}
  int nPoints=points.Length;for(int r=0;r<2;r++)for(int i=0;i<nPoints;i++){int j=(i+1)%nPoints,a=r*nPoints+i,b=r*nPoints+j;data.t.AddRange(new[]{a,b,a+nPoints,b,b+nPoints,a+nPoints});}
  int middle=data.v.Count;data.v.Add(new Vector3(center.x,center.y,z));data.n.Add(Vector3.back);for(int i=0;i<nPoints;i++)data.t.AddRange(new[]{middle,(i+1)%nPoints,i});Emit(name,data,m);
 }
 sealed class MeshData {public readonly List<Vector3> v=new List<Vector3>(),n=new List<Vector3>();public readonly List<int> t=new List<int>();}
 static void Emit(string name,MeshData data,Material m){var mesh=new Mesh{name=name,indexFormat=IndexFormat.UInt32};mesh.SetVertices(data.v);mesh.SetNormals(data.n);mesh.SetTriangles(data.t,0);mesh.RecalculateBounds();AssetDatabase.CreateAsset(mesh,Folder+"PremiumMain-"+(id++)+".asset");var g=new GameObject(name);g.transform.SetParent(root,false);g.AddComponent<MeshFilter>().sharedMesh=mesh;var r=g.AddComponent<MeshRenderer>();r.sharedMaterial=m;r.shadowCastingMode=ShadowCastingMode.Off;r.receiveShadows=false;}
}
