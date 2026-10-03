using System;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.UI;
using Yozora;

// R1/product front elevation: white asymmetric speaker apron, deep dark tray,
// raised PUSH island and transverse ribbed grip. Decorative meshes only.
public static class PremiumControlsBuilder {
 const string Folder="Assets/Yozora/Generated/";
 static Transform root;static Material pearl,black,rubber,chrome,gunmetal,lens,violet,ink;static int id,vertices,triangles;
 public static void Build(Transform cabinet,YozoraMachine machine){
  id=vertices=triangles=0;
  string[] old={"Premium lower controls","Lower pearl apron","Tray cavity","Tray rim","Control island","PUSH surround","PUSH frosted button","PUSH purple rim","Horizontal ribbed handle","Apron grille"};
  foreach(var t in cabinet.GetComponentsInChildren<Transform>(true)){if(!t||t==cabinet)continue;foreach(string name in old)if(t.name==name){if(t.GetComponentInChildren<Collider>(true)){Debug.LogWarning("Preserved collider-owned legacy control: "+t.name);}else UnityEngine.Object.DestroyImmediate(t.gameObject);break;}}
  foreach(var label in cabinet.GetComponentsInChildren<Text>(true))if(label&&label.text=="PUSH")label.enabled=false;
  root=new GameObject("Premium lower controls").transform;root.SetParent(cabinet,false);
  pearl=Material("Ceramic white pearl",new Color(.40f,.42f,.44f),.045f,.49f);
  black=Material("Deep piano enamel",new Color(.008f,.011f,.015f),.52f,.93f);
  rubber=Material("Satin black elastomer",new Color(.013f,.015f,.019f),.08f,.42f);
  chrome=Material("Polished milled nickel",new Color(.73f,.78f,.82f),1,.91f);
  gunmetal=Material("Brushed graphite alloy",new Color(.115f,.14f,.16f),.92f,.65f);
  ink=Material("Recess and etched ink",new Color(.003f,.005f,.007f),.05f,.38f);
  violet=Material("Purple control diffuser",new Color(.22f,.025f,.55f),.30f,.82f);violet.EnableKeyword("_EMISSION");violet.SetColor("_EmissionColor",new Color(.16f,.008f,.36f));
  lens=Material("PUSH moulded optical lens",new Color(.43f,.56f,.69f,.23f),.08f,.91f);lens.SetFloat("_Mode",3);lens.SetInt("_SrcBlend",(int)BlendMode.One);lens.SetInt("_DstBlend",(int)BlendMode.OneMinusSrcAlpha);lens.SetInt("_ZWrite",0);lens.EnableKeyword("_ALPHAPREMULTIPLY_ON");lens.renderQueue=3000;
  Apron();Tray();Push(machine.font);Handle();
  Debug.Log("YOZORA_PREMIUM_CONTROLS: decorative only; "+id+" meshes / "+vertices+" vertices / "+triangles+" triangles; no colliders or lights created");
 }
 static Material Material(string name,Color c,float metallic,float smooth){var m=new Material(Shader.Find("Standard")){name="Controls · "+name};m.color=c;m.SetFloat("_Metallic",metallic);m.SetFloat("_Glossiness",smooth);Save(m,"Mat-"+name.Replace(' ','-')+".mat");return m;}
 static void Save(UnityEngine.Object asset,string name){string path=Folder+"PremiumControls-"+name;if(AssetDatabase.LoadAssetAtPath<UnityEngine.Object>(path))AssetDatabase.DeleteAsset(path);AssetDatabase.CreateAsset(asset,path);}
 static GameObject MeshObject(string name,List<Vector3> points,List<int> indices,Material material){var mesh=new Mesh{name=name,indexFormat=IndexFormat.UInt32};mesh.SetVertices(points);mesh.SetTriangles(indices,0);mesh.RecalculateNormals();mesh.RecalculateBounds();vertices+=points.Count;triangles+=indices.Count/3;Save(mesh,"Mesh-"+(id++)+".asset");var go=new GameObject(name,typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(root,false);go.GetComponent<MeshFilter>().sharedMesh=mesh;var r=go.GetComponent<MeshRenderer>();r.sharedMaterial=material;r.shadowCastingMode=ShadowCastingMode.On;r.receiveShadows=true;return go;}
 static void Quad(List<int> t,int a,int b,int c,int d,bool flip=false){if(!flip){t.Add(a);t.Add(b);t.Add(c);t.Add(a);t.Add(c);t.Add(d);}else{t.Add(a);t.Add(c);t.Add(b);t.Add(a);t.Add(d);t.Add(c);}}
 static float Pow(float x,float p)=>Mathf.Sign(x)*Mathf.Pow(Mathf.Abs(x),p);
 static Vector3 BowlPoint(float angle,float x,float z,float y,float backLift=0){float ca=Mathf.Cos(angle),sa=Mathf.Sin(angle);return new Vector3(.005f+Pow(ca,.48f)*x,y+backLift*Mathf.Max(0,sa),-.178f+Pow(sa,.48f)*z);}
 static void Loops(string name,List<Vector3[]> loops,Material m,bool flip=false,bool closeBottom=false){var v=new List<Vector3>();var t=new List<int>();int n=loops[0].Length;foreach(var loop in loops)v.AddRange(loop);for(int ring=0;ring<loops.Count-1;ring++)for(int j=0;j<n;j++){int k=(j+1)%n;Quad(t,ring*n+j,(ring+1)*n+j,(ring+1)*n+k,ring*n+k,flip);}if(closeBottom){Vector3 center=Vector3.zero;foreach(var p in loops[loops.Count-1])center+=p;center/=n;int c=v.Count;v.Add(center);int start=(loops.Count-1)*n;for(int j=0;j<n;j++){if(!flip){t.Add(start+j);t.Add(c);t.Add(start+(j+1)%n);}else{t.Add(start+j);t.Add(start+(j+1)%n);t.Add(c);}}}MeshObject(name,v,t,m);}
 static Vector3[] BowlRing(float x,float z,float y,float lift=0){var ring=new Vector3[128];for(int j=0;j<ring.Length;j++)ring[j]=BowlPoint(j*Mathf.PI*2/ring.Length,x,z,y,lift);return ring;}
 static void Tray(){
  // One closed section runs from the outside belly over the rounded lip and
  // down the concave inside wall into a real floor; the opening is not a box.
  Loops("Deep tray continuous outer and inner bowl",new List<Vector3[]>{BowlRing(.248f,.067f,.086f),BowlRing(.267f,.085f,.100f),BowlRing(.276f,.090f,.124f),BowlRing(.276f,.090f,.139f,.022f),BowlRing(.270f,.085f,.149f,.025f),BowlRing(.258f,.073f,.148f,.025f),BowlRing(.249f,.065f,.134f,.018f),BowlRing(.242f,.057f,.110f,.005f),BowlRing(.222f,.044f,.101f)},black,false,true);
  Tube("Rolled dark armrest front lip",TrayArc(.274f,.088f,.146f,Mathf.PI,Mathf.PI*2,96),.0105f,rubber,14);
  Tube("Hairline nickel tray rim",TrayArc(.274f,.089f,.147f,Mathf.PI+.08f,Mathf.PI*2-.08f,96),.00125f,chrome,10);
  // Fine ribs in the bottom make its depth and direction visible in an oblique view.
  for(int k=-8;k<=8;k++){float x=.005f+k*.023f;Tube("Moulded basin floor drainage bead",new[]{new Vector3(x,.103f,-.215f),new Vector3(x,.103f,-.145f)},.00065f,rubber,8);}
 }
 static Vector3[] TrayArc(float x,float z,float y,float from,float to,int count){var points=new Vector3[count];for(int i=0;i<count;i++)points[i]=BowlPoint(Mathf.Lerp(from,to,i/(float)(count-1)),x,z,y);return points;}
 static void Apron(){
  const int nx=72,ny=30;var v=new List<Vector3>();var t=new List<int>();
  for(int j=0;j<=ny;j++)for(int i=0;i<=nx;i++){float u=i/(float)nx,w=j/(float)ny,x=Mathf.Lerp(-.282f,.282f,u);float top=.113f+.096f*(1-Mathf.SmoothStep(0,1,Mathf.InverseLerp(-.16f,.018f,x)));float bottom=.056f+.01f*Mathf.Pow(Mathf.Abs(u*2-1),8);float y=Mathf.Lerp(bottom,top,w);float z=-.188f-.025f*Mathf.Sin(w*Mathf.PI)+.047f*Mathf.Pow(Mathf.Abs(u*2-1),10);v.Add(new Vector3(x,y,z));}
  var darkVertices=new List<Vector3>();var darkTriangles=new List<int>();
  for(int j=0;j<ny;j++)for(int i=0;i<nx;i++){
   int a=j*(nx+1)+i;Vector3 p0=v[a],p1=v[a+nx+1],p2=v[a+nx+2],p3=v[a+1];Vector3 mid=(p0+p1+p2+p3)*.25f;
   bool slot=Mathf.Pow((mid.x+.219f)/.043f,2)+Mathf.Pow((mid.y-.132f)/.050f,2)<1;
   if(!slot){Quad(t,a,a+nx+1,a+nx+2,a+1);continue;}
   // The opening is cut into the apron itself, not a bright mesh laid in front.
   int n=v.Count;Vector3 horiz=(p3-p0)*.5f,vert=(p1-p0)*.5f;
   for(int k=0;k<16;k++){float angle=k*Mathf.PI/8,ca=Mathf.Cos(angle),sa=Mathf.Sin(angle);float ext=1/Mathf.Max(Mathf.Abs(ca),Mathf.Abs(sa));v.Add(mid+(horiz*ca+vert*sa)*ext);}
   for(int k=0;k<16;k++){float angle=k*Mathf.PI/8;v.Add(mid+horiz*Pow(Mathf.Cos(angle),.5f)*.74f+vert*Mathf.Sin(angle)*.36f);}
   for(int k=0;k<16;k++)v.Add(v[n+16+k]+Vector3.forward*.0035f);
   for(int k=0;k<16;k++){int next=(k+1)%16;Quad(t,n+k,n+16+k,n+16+next,n+next);int wall=darkVertices.Count;darkVertices.Add(v[n+16+k]);darkVertices.Add(v[n+32+k]);darkVertices.Add(v[n+32+next]);darkVertices.Add(v[n+16+next]);Quad(darkTriangles,wall,wall+1,wall+2,wall+3);}
   int b=darkVertices.Count;darkVertices.Add(p0+Vector3.forward*.004f);darkVertices.Add(p1+Vector3.forward*.004f);darkVertices.Add(p2+Vector3.forward*.004f);darkVertices.Add(p3+Vector3.forward*.004f);Quad(darkTriangles,b,b+1,b+2,b+3);
  }
  MeshObject("Recessed darkness behind pierced apron slots",darkVertices,darkTriangles,ink);
  // Side return with thickness; the front is a smoothly bent moulding.
  var boundary=new List<int>();for(int i=0;i<=nx;i++)boundary.Add(i);for(int j=1;j<=ny;j++)boundary.Add(j*(nx+1)+nx);for(int i=nx-1;i>=0;i--)boundary.Add(ny*(nx+1)+i);for(int j=ny-1;j>0;j--)boundary.Add(j*(nx+1));
  for(int i=0;i<boundary.Count;i++){int a=boundary[i],b=boundary[(i+1)%boundary.Count];int c=v.Count;v.Add(v[a]+Vector3.forward*.03f);v.Add(v[b]+Vector3.forward*.03f);Quad(t,a,b,c+1,c);}
  MeshObject("Swept pearl asymmetric lower apron",v,t,pearl);
  var upper=new Vector3[nx+1];for(int i=0;i<=nx;i++)upper[i]=v[ny*(nx+1)+i]+Vector3.back*.001f;Tube("Pearl apron upper nickel reveal",upper,.0016f,chrome,12);
  var lower=new Vector3[nx+1];for(int i=0;i<=nx;i++)lower[i]=v[i]+new Vector3(0,.007f,-.001f);Tube("Apron lower rolled seam",lower,.0012f,pearl,10);
 }
 // A surface of revolution with smooth shared normals. profile=(axis distance,radius).
 static void Lathe(string name,Vector3 center,Vector3 axis,Vector2[] profile,Material m,int sides=96){axis.Normalize();Vector3 u=Vector3.Cross(axis,Vector3.up);if(u.sqrMagnitude<.1f)u=Vector3.right;u.Normalize();Vector3 v=Vector3.Cross(axis,u);var loops=new List<Vector3[]>();foreach(var pr in profile){var ring=new Vector3[sides];for(int i=0;i<sides;i++){float a=i*Mathf.PI*2/sides;ring[i]=center+axis*pr.x+(u*Mathf.Cos(a)+v*Mathf.Sin(a))*pr.y;}loops.Add(ring);}Loops(name,loops,m,true);}
 static void Push(Font font){
  var pod=new List<Vector3[]>();float[] ys={.100f,.107f,.127f,.162f,.185f,.205f,.211f};float[] xs={.057f,.077f,.084f,.083f,.071f,.054f,.047f};float[] zs={.035f,.046f,.062f,.065f,.055f,.040f,.029f};
  for(int k=0;k<ys.Length;k++){var ring=new Vector3[96];for(int j=0;j<ring.Length;j++){float a=j*Mathf.PI*2/ring.Length;ring[j]=new Vector3(-.012f+Pow(Mathf.Cos(a),.76f)*xs[k],ys[k],-.148f+Pow(Mathf.Sin(a),.76f)*zs[k]);}pod.Add(ring);}Loops("PUSH sculpted flowing control pod",pod,black,false,true);
  var seam=new Vector3[96];for(int j=0;j<96;j++){float a=j*Mathf.PI*2/96;seam[j]=new Vector3(-.012f+Mathf.Cos(a)*.077f,.119f,-.148f+Mathf.Sin(a)*.052f);}Tube("Pod lower graphite seam",seam,.002f,gunmetal,12,true);
  Vector3 axis=new Vector3(0,.63f,-.777f).normalized,c=new Vector3(-.012f,.205f,-.183f);
  Lathe("PUSH rising polished crown",c,axis,new[]{new Vector2(-.017f,.036f),new Vector2(-.012f,.046f),new Vector2(-.003f,.048f),new Vector2(.001f,.0465f),new Vector2(.003f,.0425f),new Vector2(-.004f,.0405f)},chrome);
  Lathe("PUSH violet annular diffuser",c,axis,new[]{new Vector2(.0005f,.0418f),new Vector2(.003f,.0412f),new Vector2(.004f,.039f),new Vector2(.001f,.0387f)},violet);
  Lathe("PUSH clear domed optical lens",c,axis,new[]{new Vector2(.002f,.0385f),new Vector2(.008f,.0378f),new Vector2(.012f,.032f),new Vector2(.014f,.020f),new Vector2(.0147f,0)},lens);
  Lathe("PUSH inset satin actuator face",c,axis,new[]{new Vector2(.003f,.036f),new Vector2(.005f,.0355f),new Vector2(.006f,.029f),new Vector2(.0064f,0)},pearl);
  Vector3 u=Vector3.right,v=Vector3.Cross(axis,u);for(int i=0;i<48;i++){float a=i*Mathf.PI/24;Vector3 radial=u*Mathf.Cos(a)+v*Mathf.Sin(a);Tube("Crown knurled tooth",new[]{c+axis*(-.008f)+radial*.0471f,c+axis*(-.002f)+radial*.0471f},.00048f,gunmetal,6);}
  Label("PUSH",font,c+axis*.0155f,axis,.00035f,92,40,27,ink.color);
  Label("KYORAKU",font,new Vector3(-.012f,.141f,-.215f),Vector3.back,.00018f,240,30,20,new Color(.4f,.44f,.46f));
 }
 static void Handle(){
  Vector3 c=new Vector3(.177f,.160f,-.190f);Vector3 axis=Vector3.right;
  // Variable-radius silhouette: tapered palm ends and a broad, slightly waisted drum.
  Lathe("Handle transverse shaft",c,axis,new[]{new Vector2(-.072f,0),new Vector2(-.072f,.017f),new Vector2(.070f,.017f),new Vector2(.074f,0)},gunmetal,64);
  Lathe("Handle contoured rubber palm grip",c,axis,new[]{new Vector2(-.060f,.022f),new Vector2(-.052f,.031f),new Vector2(-.040f,.036f),new Vector2(-.020f,.0375f),new Vector2(.013f,.0345f),new Vector2(.032f,.034f),new Vector2(.045f,.031f),new Vector2(.052f,.021f)},rubber,128);
  // Raised flutes follow the curved body, not a pile of identical silver discs.
  for(int rib=0;rib<20;rib++){float a=rib*Mathf.PI/10;var path=new Vector3[17];for(int j=0;j<path.Length;j++){float x=Mathf.Lerp(-.048f,.041f,j/16f),r=.0345f+.003f*Mathf.Exp(-Mathf.Pow((x+.018f)/.022f,2));path[j]=c+new Vector3(x,Mathf.Cos(a)*r,Mathf.Sin(a)*r);}Tube("Grip longitudinal sculpted rubber flute",path,.0016f,rubber,8);}
  foreach(float x in new[]{-.054f,.047f})Lathe("Handle polished retaining collar",c,axis,new[]{new Vector2(x-.004f,.019f),new Vector2(x-.004f,.031f),new Vector2(x-.001f,.035f),new Vector2(x+.002f,.034f),new Vector2(x+.004f,.029f),new Vector2(x+.004f,.019f)},chrome,96);
  Lathe("Handle sculpted outer end cap",c,axis,new[]{new Vector2(.052f,.019f),new Vector2(.055f,.030f),new Vector2(.060f,.0315f),new Vector2(.067f,.026f),new Vector2(.070f,.012f),new Vector2(.071f,0)},pearl,96);
  Lathe("Handle end inset medallion",c,axis,new[]{new Vector2(.0708f,.011f),new Vector2(.072f,.010f),new Vector2(.0725f,0)},chrome,64);
  // Curved saddle below the drum; does not carry physical ball contacts.
  Lathe("Handle inner socket moulding",new Vector3(.104f,.154f,-.158f),Vector3.right,new[]{new Vector2(-.012f,0),new Vector2(-.010f,.027f),new Vector2(0,.033f),new Vector2(.011f,.028f),new Vector2(.013f,.017f)},black,96);
 }
 static void Tube(string name,Vector3[] path,float radius,Material m,int sides=10,bool closed=false){var points=new List<Vector3>();var t=new List<int>();for(int i=0;i<path.Length;i++){Vector3 dir=path[Mathf.Min(i+1,path.Length-1)]-path[Mathf.Max(0,i-1)];if(closed)dir=path[(i+1)%path.Length]-path[(i+path.Length-1)%path.Length];dir.Normalize();Vector3 u=Vector3.up-Vector3.Dot(Vector3.up,dir)*dir;if(u.sqrMagnitude<.01f)u=Vector3.right;u.Normalize();Vector3 w=Vector3.Cross(dir,u);for(int j=0;j<sides;j++){float a=j*Mathf.PI*2/sides;points.Add(path[i]+radius*(u*Mathf.Cos(a)+w*Mathf.Sin(a)));}}int spans=closed?path.Length:path.Length-1;for(int i=0;i<spans;i++)for(int j=0;j<sides;j++){int k=(j+1)%sides,next=(i+1)%path.Length;Quad(t,i*sides+j,i*sides+k,next*sides+k,next*sides+j);}MeshObject(name,points,t,m);}
 static void Label(string value,Font font,Vector3 position,Vector3 normal,float scale,float width,float height,int size,Color color){var go=new GameObject("Premium control engraving "+value,typeof(RectTransform),typeof(Canvas));go.transform.SetParent(root,false);go.transform.localPosition=position;go.transform.localRotation=Quaternion.LookRotation(-normal,Vector3.up);go.transform.localScale=Vector3.one*scale;go.GetComponent<Canvas>().renderMode=RenderMode.WorldSpace;go.GetComponent<RectTransform>().sizeDelta=new Vector2(width,height);var child=new GameObject("Etched lettering",typeof(RectTransform),typeof(CanvasRenderer),typeof(Text));child.transform.SetParent(go.transform,false);var text=child.GetComponent<Text>();text.rectTransform.sizeDelta=new Vector2(width,height);text.font=font;text.text=value;text.fontSize=size;text.resizeTextForBestFit=true;text.resizeTextMinSize=10;text.resizeTextMaxSize=size;text.alignment=TextAnchor.MiddleCenter;text.color=color;text.raycastTarget=false;}
}
