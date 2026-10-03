using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

// R3 01:00 / 01:30. Decorative, collideless parts in the existing mechanism's coordinate system.
// The chosen thicknesses are modelling estimates, not measured mould dimensions.
public static class FairProductionGeometry {
 const string Folder="Assets/Yozora/Generated/";
 static int serial;static Material face,edge,groove,teal,glow,ink;
 public static void Build(Transform parent,Vector3 center,Material chrome){
  serial=0;
  face=Material("Optical broad faces",new Color(.97f,.98f,1,.018f),.015f,.98f,true);
  edge=Material("Thick optical returns",new Color(.95f,.98f,1,.11f),.025f,.99f,true);
  groove=Material("Optical groove shadow",new Color(.12f,.15f,.18f,.15f),.02f,.9f,true);
  teal=Material("Sculpted teal clear branch",new Color(.13f,.62f,.56f,.22f),.04f,.96f,true);
  glow=Material("Separate lower diffuser",new Color(.18f,.55f,.8f),.1f,.65f,false);glow.EnableKeyword("_EMISSION");glow.SetColor("_EmissionColor",new Color(.12f,.37f,.64f)*.65f);
  ink=Material("FAIR printed direction",new Color(.62f,.43f,.10f),.2f,.6f,false);
  var assembly=new GameObject("FAIR R3 · decorative production parts").transform;assembly.SetParent(parent,false);assembly.localPosition=center;
  Case(assembly);Opening(assembly);Chute(assembly,center);Support(assembly,chrome);Branch(assembly);Fasteners(assembly,chrome);
 }
 public static void DecorateRotor(Transform rotor,Material chrome,Material white,Material orange){
  // Raised lips follow existing pocket centres; no sensing/contact shape is moved.
  for(int i=0;i<6;i++){
   float a=i*Mathf.PI/3;Vector3 c=new Vector3(Mathf.Cos(a)*.03f,.0035f,Mathf.Sin(a)*.03f);
   HollowLathe(rotor,"Milled pocket lip "+i,c,new[]{new Vector2(.0119f,-.004f),new Vector2(.0124f,-.002f),new Vector2(.0124f,.0015f),new Vector2(.0112f,.003f)},.002f,i%3==0?orange:white,48);
  }
 }
 // Continuous loft merges the lower bowl, convex shoulder and offset upper opening.
 static readonly float[] ShellY={-.029f,-.027f,-.024f,-.010f,.003f,.012f,.022f,.030f,.037f,.044f,.047f};
 static readonly float[] ShellR={.043f,.045f,.0454f,.0454f,.0454f,.0451f,.0438f,.042f,.04f,.038f,.0385f};
 static Vector3 ShellPoint(int row,float angle,float inset=0){
  float y=ShellY[row],blend=Mathf.SmoothStep(0,1,Mathf.InverseLerp(.012f,.044f,y));
  Vector3 circle=R(ShellR[row]-inset,y,angle);
  float co=Mathf.Cos(angle),si=Mathf.Sin(angle),power=.57f;
  Vector3 opening=new Vector3(-.018f+Mathf.Sign(co)*Mathf.Pow(Mathf.Abs(co),power)*(.0385f-inset),y,.008f+Mathf.Sign(si)*Mathf.Pow(Mathf.Abs(si),power)*(.024f-inset));
  return Vector3.Lerp(circle,opening,blend);
 }
 static bool ShellVoid(int row,float angle){
  float y=(ShellY[row]+ShellY[row+1])*.5f;
  // Side opening receives the unchanged ball route; front skirt window leaves the outlet readable.
  return (y>.003f&&y<.030f&&Mathf.Cos(angle)<-.86f)||(y<-.020f&&Mathf.Sin(angle)<-.955f);
 }
 static void Case(Transform p){
  const int n=128;const float thickness=.00115f;var data=new MeshData();
  for(int row=0;row<ShellY.Length-1;row++)for(int i=0;i<n;i++){
   float a=i*Mathf.PI*2/n,b=(i+1)*Mathf.PI*2/n;if(ShellVoid(row,(a+b)*.5f))continue;
   data.Quad(ShellPoint(row,a),ShellPoint(row+1,a),ShellPoint(row+1,b),ShellPoint(row,b));
   data.Quad(ShellPoint(row,b,thickness),ShellPoint(row+1,b,thickness),ShellPoint(row+1,a,thickness),ShellPoint(row,a,thickness));
   if(ShellVoid(row,a-Mathf.PI/n))data.Quad(ShellPoint(row,a),ShellPoint(row,a,thickness),ShellPoint(row+1,a,thickness),ShellPoint(row+1,a));
   if(ShellVoid(row,b+Mathf.PI/n))data.Quad(ShellPoint(row+1,b),ShellPoint(row+1,b,thickness),ShellPoint(row,b,thickness),ShellPoint(row,b));
   if(row==0||ShellVoid(row-1,(a+b)*.5f))data.Quad(ShellPoint(row,b),ShellPoint(row,b,thickness),ShellPoint(row,a,thickness),ShellPoint(row,a));
   if(row==ShellY.Length-2||ShellVoid(row+1,(a+b)*.5f))data.Quad(ShellPoint(row+1,a),ShellPoint(row+1,a,thickness),ShellPoint(row+1,b,thickness),ShellPoint(row+1,b));
  }
  Emit(p,"A Continuous case shoulder and upper reservoir",Vector3.zero,data,face);
  // Thin mould joint, not a separate thick toroidal shoulder.
  var seam=new Vector3[129];for(int i=0;i<129;i++)seam[i]=ShellPoint(2,i*Mathf.PI/64)+Vector3.down*.0004f;
  Tube(p,"A Lower mould seam",seam,.00048f,edge);
  for(int i=0;i<12;i++){float a=(202+i*12)*Mathf.Deg2Rad;if(Mathf.Sin(a)<-.955f)continue;Vector3 d=new Vector3(Mathf.Cos(a),0,Mathf.Sin(a));Tube(p,"A Integral shallow lower flute",new[]{d*.0453f+Vector3.down*.023f,d*.0458f+Vector3.down*.018f,d*.0455f+Vector3.down*.008f},.00028f,edge);}
 }
 static void Opening(Transform p){
  var lip=new Vector3[129];var grooveLine=new Vector3[129];
  for(int i=0;i<=128;i++){float a=i*Mathf.PI/64;lip[i]=ShellPoint(ShellY.Length-1,a);grooveLine[i]=ShellPoint(ShellY.Length-2,a,.0014f)+Vector3.down*.0003f;}
  Tube(p,"B Integrated rounded opening lip",lip,.00085f,edge);
  Tube(p,"B Fine internal seating seam",grooveLine,.00022f,groove);
 }
 static void Chute(Transform p,Vector3 center){
  // Visual floor is below the fixed route's ball centre, not across the sphere.
  var controls=new[]{new Vector3(-.174f,.338f,-.094f),new Vector3(-.16f,.3315f,-.092f),new Vector3(-.10f,.319f,-.102f),new Vector3(-.045f,.3075f,-.112f),new Vector3(-.026f,.296f,-.112f)};
  var route=Curve(controls,12);for(int i=0;i<route.Length;i++)route[i]-=center;
  SweepChannel(p,route,.014f,.023f,.0012f);
  foreach(int sign in new[]{-1,1}){
   var rim=new Vector3[route.Length];var fine=new Vector3[route.Length];
   for(int i=0;i<route.Length;i++){rim[i]=route[i]+new Vector3(0,.023f,sign*.014f);fine[i]=route[i]+new Vector3(0,.005f,sign*.0148f);}
   Tube(p,"C Continuous channel rolled return",rim,.00065f,edge);
   Tube(p,"C Channel recessed tool line",fine,.0002f,groove);
  }
  // Sparse small integral webs terminate below the top lip, avoiding railing-like bars.
  for(int i=5;i<route.Length-5;i+=9)foreach(int sign in new[]{-1,1}){
   Vector3 c=route[i]+new Vector3(0,0,sign*.0151f);
   Tube(p,"C Integral short wall rib",new[]{c,c+new Vector3(.001f,.012f,0),c+new Vector3(.002f,.019f,0)},.00035f,edge);
  }
  // U collar is attached to the actual shell aperture; it does not create another floating ring.
  float a0=Mathf.Acos(-.86f),a1=2*Mathf.PI-a0;var collar=new List<Vector3>();
  collar.Add(ShellPoint(4,a0));collar.Add(ShellPoint(5,a0));collar.Add(ShellPoint(6,a0));collar.Add(ShellPoint(7,a0));
  for(int i=1;i<=30;i++)collar.Add(ShellPoint(7,Mathf.Lerp(a0,a1,i/30f)));
  collar.Add(ShellPoint(6,a1));collar.Add(ShellPoint(5,a1));collar.Add(ShellPoint(4,a1));
  Tube(p,"C Moulded side-entry aperture return",collar.ToArray(),.00072f,edge);
 }
 static void SweepChannel(Transform p,Vector3[] path,float halfWidth,float height,float thickness){
  var d=new MeshData();
  for(int i=0;i<path.Length-1;i++){
   Vector3 a=path[i],b=path[i+1],z=Vector3.forward*halfWidth,h=Vector3.up*height,t=Vector3.up*thickness;
   d.Quad(a+z,b+z,b-z,a-z);d.Quad(a-z-t,b-z-t,b+z-t,a+z-t);
   foreach(int sign in new[]{-1,1}){Vector3 side=z*sign,outer=Vector3.forward*(halfWidth+thickness)*sign;
    if(sign>0){d.Quad(a+side,a+side+h,b+side+h,b+side);d.Quad(b+outer,b+outer+h,a+outer+h,a+outer);}
    else {d.Quad(b+side,b+side+h,a+side+h,a+side);d.Quad(a+outer,a+outer+h,b+outer+h,b+outer);}
    if(sign>0)d.Quad(a+side+h,a+outer+h,b+outer+h,b+side+h);else d.Quad(b+side+h,b+outer+h,a+outer+h,a+side+h);
   }
  }
  Emit(p,"C Continuous moulded optical channel",Vector3.zero,d,face);
 }
 static void Support(Transform p,Material chrome){
  // An open structural frame replaces the full slab. The centre remains empty beneath the rotor.
  AnnularExtrusion(p,"D Open support perimeter",new Vector3(.001f,-.040f,.002f),Rounded(.098f,.080f,.011f,12),Rounded(.084f,.064f,.009f,12),.0025f,face);
  RoundedRim(p,"D Thin forward moulded return",new Vector3(.001f,-.041f,.002f),.098f,.080f,.011f,.00048f,edge);
  // Continuous bearing skirt bridges the case to the base; broad front/rear windows remain open.
  var skirt=new MeshData();const int skirtSides=96;
  System.Func<float,float,Vector3> skirtPoint=(t,a)=>{
   float co=Mathf.Cos(a),si=Mathf.Sin(a);Vector3 upper=new Vector3(co*.0448f,-.0245f,si*.0448f);
   Vector3 lower=new Vector3(.001f+Mathf.Sign(co)*Mathf.Pow(Mathf.Abs(co),.56f)*.047f,-.039f,.002f+Mathf.Sign(si)*Mathf.Pow(Mathf.Abs(si),.56f)*.037f);
   return Vector3.Lerp(upper,lower,t);
  };
  for(int i=0;i<skirtSides;i++){
   float a=i*Mathf.PI*2/skirtSides,b=(i+1)*Mathf.PI*2/skirtSides,mid=(a+b)*.5f;
   if(Mathf.Sin(mid)<-.92f||Mathf.Sin(mid)>.77f)continue;
   Vector3 u=skirtPoint(0,a),v=skirtPoint(0,b),q=skirtPoint(1,a),r=skirtPoint(1,b);
   skirt.Quad(q,u,v,r);Vector3 inset=new Vector3(Mathf.Cos(mid),0,Mathf.Sin(mid))*.001f;skirt.Quad(r-inset,v-inset,u-inset,q-inset);
  }
  Emit(p,"D Integral windowed load-bearing skirt",Vector3.zero,skirt,face);
  foreach(int sign in new[]{-1,1}){
   var front=new[]{new Vector3(sign*.033f,-.039f,-.029f),new Vector3(sign*.036f,-.033f,-.030f),new Vector3(sign*.038f,-.025f,-.026f)};
   Tube(p,"D Curved load-bearing front foot",front,.002f,face);
   Beam(p,"D Rear open support web",new Vector3(sign*.036f,-.039f,.029f),new Vector3(sign*.039f,-.020f,.025f),.004f,.002f,face);
   Tube(p,"D Front outlet jamb",new[]{new Vector3(sign*.013f,-.039f,-.037f),new Vector3(sign*.014f,-.026f,-.043f),new Vector3(sign*.012f,-.021f,-.043f)},.00062f,edge);
  }
  Tube(p,"D Arched outlet window roof",Curve(new[]{new Vector3(-.013f,-.021f,-.043f),new Vector3(0,-.019f,-.044f),new Vector3(.013f,-.021f,-.043f)},12),.00065f,edge);
  // Only a recessed back shadow, with air around it rather than an opaque front panel.
  Quad(p,"D Recessed outlet interior",new Vector3(-.007f,-.039f,-.033f),new Vector3(.007f,-.039f,-.033f),new Vector3(.007f,-.025f,-.033f),new Vector3(-.007f,-.025f,-.033f),groove);
  for(int sign=-1;sign<=1;sign+=2)Tube(p,"H Concealed lower diffuser",new[]{new Vector3(sign*.018f,-.029f,.028f),new Vector3(sign*.030f,-.025f,.026f)},.0006f,glow);
  Tube(p,"D Printed down arrow",new[]{new Vector3(-.003f,-.037f,-.044f),new Vector3(0,-.039f,-.044f),new Vector3(.003f,-.037f,-.044f)},.00035f,ink);
 }
 static void Fasteners(Transform p,Material chrome){
  Beam(p,"E Integral right mounting ear",new Vector3(.039f,-.029f,.006f),new Vector3(.059f,-.029f,.006f),.011f,.0017f,face);
  Beam(p,"E Integral left front mounting ear",new Vector3(-.037f,-.030f,-.020f),new Vector3(-.048f,-.030f,-.024f),.010f,.0017f,face);
  Beam(p,"E Upper shoulder screw land",new Vector3(-.039f,.025f,.009f),new Vector3(-.050f,.025f,.011f),.010f,.0017f,face);
  Screw(p,new Vector3(-.050f,.027f,.011f),chrome);
  Screw(p,new Vector3(-.048f,-.028f,-.024f),chrome);
  Screw(p,new Vector3(.059f,-.027f,.006f),chrome);
 }
 static void Screw(Transform p,Vector3 c,Material chrome){
  HollowLathe(p,"E Transparent screw boss",c,new[]{new Vector2(.006f,-.005f),new Vector2(.006f,.0008f),new Vector2(.0049f,.002f)},.0024f,edge,32);
  Torus(p,"E Retaining washer",c+Vector3.up*.0018f,.0037f,.00055f,chrome);
  // Shallow countersunk head and two dark crossed recesses are distinct from the clear boss.
  SolidLathe(p,"E Countersunk screw head",c,new[]{new Vector2(.0024f,-.001f),new Vector2(.0033f,.002f),new Vector2(.0026f,.0027f)},chrome,32);
  Beam(p,"E Cross slot",c+new Vector3(-.0017f,.0028f,0),c+new Vector3(.0017f,.0028f,0),.0005f,.0003f,groove);
  Beam(p,"E Cross slot",c+new Vector3(0,.0028f,-.0017f),c+new Vector3(0,.0028f,.0017f),.0005f,.0003f,groove);
 }
 static void Branch(Transform p){
  Vector3[] control={new Vector3(.020f,.056f,.024f),new Vector3(.040f,.047f,.025f),new Vector3(.053f,.027f,.022f),new Vector3(.058f,.006f,.008f),new Vector3(.073f,-.016f,-.011f),new Vector3(.099f,-.021f,-.007f)};
  var stem=Curve(control,12);Tube(p,"I Curved translucent botanical stem",stem,.00105f,teal);
  for(int i=0;i<5;i++){
   Vector3 c=stem[12+i*8];Vector3 tip=c+new Vector3(.009f+i*.001f,.015f-i*.001f,-.006f);Leaf(p,c,tip,.004f,teal);
  }
  var twig=Curve(new[]{control[4],new Vector3(.083f,-.005f,-.013f),new Vector3(.102f,.002f,-.012f)},10);Tube(p,"I Swept lower twig",twig,.00065f,teal);
  Leaf(p,twig[8],twig[8]+new Vector3(.009f,.009f,-.003f),.003f,teal);
 }
 static void Leaf(Transform p,Vector3 start,Vector3 end,float width,Material m){
  var d=new MeshData();Vector3 dir=(end-start).normalized,side=Vector3.Cross(dir,Vector3.forward).normalized;
  const int rows=14,columns=8;
  System.Func<float,float,float,Vector3> point=(t,u,thickness)=>Vector3.Lerp(start,end,t)+side*(Mathf.Sin(Mathf.PI*t)*width*u)+Vector3.forward*(Mathf.Sin(Mathf.PI*t)*(.0022f*(1-u*u))+.00035f*u*u+thickness);
  for(int i=0;i<rows;i++)for(int j=0;j<columns;j++){float a=i/(float)rows,b=(i+1)/(float)rows,u=-1+j*2f/columns,v=-1+(j+1)*2f/columns;d.Quad(point(a,u,0),point(b,u,0),point(b,v,0),point(a,v,0));d.Quad(point(a,v,.00028f),point(b,v,.00028f),point(b,u,.00028f),point(a,u,.00028f));}
  Emit(p,"I Thin curved veined leaf",Vector3.zero,d,m);
  var vein=new Vector3[18];for(int i=0;i<vein.Length;i++){float t=i/(float)(vein.Length-1);vein[i]=point(t,0,-.00012f);}Tube(p,"I Fine leaf midrib",vein,.00017f,edge);
 }
 static Vector3[] Curve(Vector3[] control,int steps){var path=new List<Vector3>();for(int k=0;k<control.Length-1;k++){Vector3 a=control[Mathf.Max(0,k-1)],b=control[k],c=control[k+1],e=control[Mathf.Min(control.Length-1,k+2)];for(int i=0;i<steps;i++){float t=i/(float)steps;path.Add(.5f*((2*b)+(-a+c)*t+(2*a-5*b+4*c-e)*t*t+(-a+3*b-3*c+e)*t*t*t));}}path.Add(control[control.Length-1]);return path.ToArray();}
 static Material Material(string name,Color color,float metal,float gloss,bool transparent){
  var m=new Material(Shader.Find("Standard")){name="FAIR R3 "+name,color=color};m.SetFloat("_Metallic",metal);m.SetFloat("_Glossiness",gloss);
  if(transparent){m.SetFloat("_Mode",3);m.SetInt("_SrcBlend",(int)BlendMode.One);m.SetInt("_DstBlend",(int)BlendMode.OneMinusSrcAlpha);m.SetInt("_ZWrite",0);m.EnableKeyword("_ALPHAPREMULTIPLY_ON");m.renderQueue=3000;}
  if(transparent&&name=="Optical broad faces"){m.SetFloat("_Mode",2);m.SetInt("_SrcBlend",(int)BlendMode.SrcAlpha);m.DisableKeyword("_ALPHAPREMULTIPLY_ON");m.EnableKeyword("_ALPHABLEND_ON");}
  AssetDatabase.CreateAsset(m,Folder+"FairR3-"+name.Replace(' ','-')+".mat");return m;
 }
 sealed class MeshData {
  public readonly List<Vector3> v=new List<Vector3>();public readonly List<int> t=new List<int>();
  public void Tri(Vector3 a,Vector3 b,Vector3 c){int n=v.Count;v.Add(a);v.Add(b);v.Add(c);t.Add(n);t.Add(n+1);t.Add(n+2);}
  public void Quad(Vector3 a,Vector3 b,Vector3 c,Vector3 d){Tri(a,b,c);Tri(a,c,d);}
 }
 static void Emit(Transform parent,string name,Vector3 pos,MeshData data,Material material){
  var mesh=new Mesh{name=name};var shared=new List<Vector3>();var indices=new List<int>();var keys=new Dictionary<Vector3Int,int>();foreach(int index in data.t){var v=data.v[index];var key=new Vector3Int(Mathf.RoundToInt(v.x*1000000),Mathf.RoundToInt(v.y*1000000),Mathf.RoundToInt(v.z*1000000));if(!keys.TryGetValue(key,out int target)){target=shared.Count;keys.Add(key,target);shared.Add(v);}indices.Add(target);}mesh.SetVertices(shared);mesh.SetTriangles(indices,0);mesh.RecalculateNormals();mesh.RecalculateBounds();AssetDatabase.CreateAsset(mesh,Folder+"FairR3-"+(serial++)+".asset");
  var g=new GameObject(name);g.transform.SetParent(parent,false);g.transform.localPosition=pos;g.AddComponent<MeshFilter>().sharedMesh=mesh;var renderer=g.AddComponent<MeshRenderer>();renderer.sharedMaterial=material;renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;
 }
 static Vector3 R(float radius,float y,float angle)=>new Vector3(Mathf.Cos(angle)*radius,y,Mathf.Sin(angle)*radius);
 static void HollowLathe(Transform p,string name,Vector3 c,Vector2[] profile,float thickness,Material m,int sides){
  var data=new MeshData();
  for(int row=0;row<profile.Length-1;row++)for(int i=0;i<sides;i++){
   float a=i*Mathf.PI*2/sides,b=(i+1)*Mathf.PI*2/sides;var u=profile[row];var v=profile[row+1];
   data.Quad(R(u.x,u.y,a),R(v.x,v.y,a),R(v.x,v.y,b),R(u.x,u.y,b));
   data.Quad(R(u.x-thickness,u.y,b),R(v.x-thickness,v.y,b),R(v.x-thickness,v.y,a),R(u.x-thickness,u.y,a));
  }
  foreach(int row in new[]{0,profile.Length-1})for(int i=0;i<sides;i++){float a=i*Mathf.PI*2/sides,b=(i+1)*Mathf.PI*2/sides;var q=profile[row];if(row==0)data.Quad(R(q.x,q.y,b),R(q.x-thickness,q.y,b),R(q.x-thickness,q.y,a),R(q.x,q.y,a));else data.Quad(R(q.x,q.y,a),R(q.x-thickness,q.y,a),R(q.x-thickness,q.y,b),R(q.x,q.y,b));}
  Emit(p,name,c,data,m);
 }
 static void SolidLathe(Transform p,string name,Vector3 c,Vector2[] profile,Material m,int sides){
  var data=new MeshData();for(int row=0;row<profile.Length-1;row++)for(int i=0;i<sides;i++){float a=i*Mathf.PI*2/sides,b=(i+1)*Mathf.PI*2/sides;var u=profile[row];var v=profile[row+1];data.Quad(R(u.x,u.y,a),R(v.x,v.y,a),R(v.x,v.y,b),R(u.x,u.y,b));}
  var last=profile[profile.Length-1];for(int i=0;i<sides;i++){float a=i*Mathf.PI*2/sides,b=(i+1)*Mathf.PI*2/sides;data.Tri(new Vector3(0,last.y,0),R(last.x,last.y,b),R(last.x,last.y,a));}Emit(p,name,c,data,m);
 }
 static Vector2[] Rounded(float width,float depth,float r,int quality){var list=new List<Vector2>();for(int corner=0;corner<4;corner++)for(int i=0;i<=quality;i++){float a=(corner*90+i*90f/quality)*Mathf.Deg2Rad;float x=corner==0||corner==3?width*.5f-r:-width*.5f+r,z=corner<2?depth*.5f-r:-depth*.5f+r;list.Add(new Vector2(x+Mathf.Cos(a)*r,z+Mathf.Sin(a)*r));}return list.ToArray();}
 static void AnnularExtrusion(Transform p,string name,Vector3 c,Vector2[] outside,Vector2[] inside,float height,Material m){
  var d=new MeshData();float y=height*.5f;
  for(int i=0;i<outside.Length;i++){int j=(i+1)%outside.Length;Vector3 a=new Vector3(outside[i].x,-y,outside[i].y),b=new Vector3(outside[j].x,-y,outside[j].y),u=new Vector3(inside[i].x,-y,inside[i].y),v=new Vector3(inside[j].x,-y,inside[j].y),up=Vector3.up*height;d.Quad(a,a+up,b+up,b);d.Quad(v,v+up,u+up,u);d.Quad(a+up,u+up,v+up,b+up);d.Quad(b,v,u,a);}Emit(p,name,c,d,m);
 }
 static void SolidExtrusion(Transform p,string name,Vector3 c,Vector2[] outline,float height,Material m){
  var d=new MeshData();float y=height*.5f;for(int i=0;i<outline.Length;i++){int j=(i+1)%outline.Length;Vector3 a=new Vector3(outline[i].x,-y,outline[i].y),b=new Vector3(outline[j].x,-y,outline[j].y),up=Vector3.up*height;d.Quad(a,a+up,b+up,b);d.Tri(Vector3.up*y,b+up,a+up);d.Tri(Vector3.down*y,a,b);}Emit(p,name,c,d,m);
 }
 static void RoundedRim(Transform p,string name,Vector3 c,float w,float d,float r,float tube,Material m){var outline=Rounded(w,d,r,10);var points=new Vector3[outline.Length+1];for(int i=0;i<outline.Length;i++)points[i]=c+new Vector3(outline[i].x,0,outline[i].y);points[outline.Length]=points[0];Tube(p,name,points,tube,m);}
 static void Torus(Transform p,string name,Vector3 c,float radius,float tube,Material m){var points=new Vector3[97];for(int i=0;i<=96;i++)points[i]=c+R(radius,0,i*Mathf.PI/48);Tube(p,name,points,tube,m);}
 static void Tube(Transform p,string name,Vector3[] path,float radius,Material material){
  if(path.Length<2)return;const int sides=16;var d=new MeshData();bool closed=(path[0]-path[path.Length-1]).sqrMagnitude<1e-12f;
  var rings=new Vector3[path.Length,sides];
  for(int k=0;k<path.Length;k++){
   int previous=k==0?(closed?path.Length-2:0):k-1,next=k==path.Length-1?(closed?1:k):k+1;
   Vector3 direction=(path[next]-path[previous]).normalized,u=Vector3.Cross(direction,Vector3.up).normalized;if(u.sqrMagnitude<.5f)u=Vector3.right;Vector3 v=Vector3.Cross(direction,u).normalized;
   for(int i=0;i<sides;i++){float a=i*Mathf.PI*2/sides;rings[k,i]=path[k]+(u*Mathf.Cos(a)+v*Mathf.Sin(a))*radius;}
  }
  for(int k=0;k<path.Length-1;k++)for(int i=0;i<sides;i++){int j=(i+1)%sides;d.Quad(rings[k,j],rings[k+1,j],rings[k+1,i],rings[k,i]);}
  if(!closed)for(int i=0;i<sides;i++){int j=(i+1)%sides;d.Tri(path[0],rings[0,j],rings[0,i]);d.Tri(path[path.Length-1],rings[path.Length-1,i],rings[path.Length-1,j]);}
  Emit(p,name,Vector3.zero,d,material);
 }
 static void Beam(Transform p,string name,Vector3 a,Vector3 b,float width,float height,Material m){
  Vector3 direction=(b-a).normalized,z=Vector3.Cross(direction,Vector3.up).normalized;if(z.sqrMagnitude<.1f)z=Vector3.forward;Vector3 y=Vector3.Cross(z,direction).normalized;var d=new MeshData();Vector3 p0=a-z*width*.5f-y*height*.5f,p1=a+z*width*.5f-y*height*.5f,p2=a+z*width*.5f+y*height*.5f,p3=a-z*width*.5f+y*height*.5f,delta=b-a;
  d.Quad(p0,p1,p2,p3);d.Quad(p3+delta,p2+delta,p1+delta,p0+delta);d.Quad(p0,p0+delta,p1+delta,p1);d.Quad(p1,p1+delta,p2+delta,p2);d.Quad(p2,p2+delta,p3+delta,p3);d.Quad(p3,p3+delta,p0+delta,p0);Emit(p,name,Vector3.zero,d,m);
 }
 static void Quad(Transform p,string name,Vector3 a,Vector3 b,Vector3 c,Vector3 d,Material m){var data=new MeshData();data.Quad(a,b,c,d);data.Quad(d,c,b,a);Emit(p,name,Vector3.zero,data,m);}
}
