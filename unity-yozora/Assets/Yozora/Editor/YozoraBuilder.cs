using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEditor.Build.Reporting;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.UI;
using Yozora;

public static class YozoraBuilder {
 const string Root="Assets/Yozora/";
 static Transform cabinet;static YozoraMachine machine;static Font font;static int meshIndex;
 static Material shell,black,chrome,steel,gold,ice,purple,glass,rubber,white,lcdBlack;
 static PhysicsMaterial contact;static readonly List<UnityEngine.Object> generated=new List<UnityEngine.Object>();
 [MenuItem("Yozora/Create editable machine scene")]
 public static void CreateScene(){
  if(AssetDatabase.IsValidFolder(Root+"Generated"))AssetDatabase.DeleteAsset(Root+"Generated");
  AssetDatabase.CreateFolder(Root.TrimEnd('/'),"Generated");
  EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
  meshIndex=0;generated.Clear();
  PlayerSettings.companyName="Silverball Chronicles";PlayerSettings.productName="SAO Yozora Unity Prototype";
  PlayerSettings.colorSpace=ColorSpace.Linear;PlayerSettings.defaultScreenWidth=720;PlayerSettings.defaultScreenHeight=1160;
  PlayerSettings.runInBackground=false;PlayerSettings.SetScriptingBackend(UnityEditor.Build.NamedBuildTarget.WebGL,ScriptingImplementation.IL2CPP);
  EditorUserBuildSettings.development=false;PlayerSettings.WebGL.compressionFormat=WebGLCompressionFormat.Gzip;PlayerSettings.WebGL.decompressionFallback=true;PlayerSettings.WebGL.template="PROJECT:Yozora";
  QualitySettings.antiAliasing=4;QualitySettings.shadowDistance=3;QualitySettings.shadows=ShadowQuality.All;QualitySettings.shadowResolution=ShadowResolution.High;
  Physics.defaultSolverIterations=12;Physics.defaultSolverVelocityIterations=6;Physics.defaultContactOffset=.0004f;
  var tags=new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/TagManager.asset")[0]);tags.FindProperty("layers").GetArrayElementAtIndex(8).stringValue="Balls";tags.ApplyModifiedProperties();
  var input=new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/ProjectSettings.asset")[0]);var activeInput=input.FindProperty("activeInputHandler");if(activeInput!=null){activeInput.intValue=0;input.ApplyModifiedProperties();}
  font=AssetDatabase.LoadAssetAtPath<Font>(Root+"Fonts/NotoSansCJKjp-Regular.otf");if(!font)throw new Exception("Noto font import missing");
  shell=Mat("Pearl silver",new Color(.61f,.67f,.75f),.65f,.76f);black=Mat("Black piano lacquer",new Color(.012f,.017f,.028f),.35f,.88f);
  chrome=Mat("Polished chrome",new Color(.84f,.9f,.96f),.98f,.92f);steel=Mat("Brushed steel",new Color(.15f,.22f,.29f),.85f,.6f);
  gold=Mat("Gold plating",new Color(.89f,.57f,.13f),.9f,.81f);ice=Mat("Blue crystal",new Color(.08f,.44f,.64f),.4f,.92f,new Color(.025f,.24f,.4f));
  purple=Mat("Purple rim LEDs",new Color(.3f,.035f,.63f),.45f,.8f,new Color(.3f,.035f,.63f)*1.5f);
  rubber=Mat("Speaker and gasket",new Color(.006f,.008f,.01f),0,.3f);white=Mat("Softbox emission",Color.white,.1f,.6f,Color.white*2);
  lcdBlack=Mat("LCD backplate",new Color(.006f,.01f,.025f),.1f,.5f);
  glass=Mat("Translucent resin",new Color(.45f,.7f,.85f,.2f),.25f,.92f);glass.SetFloat("_Mode",3);glass.SetInt("_SrcBlend",(int)BlendMode.SrcAlpha);glass.SetInt("_DstBlend",(int)BlendMode.OneMinusSrcAlpha);glass.SetInt("_ZWrite",0);glass.EnableKeyword("_ALPHAPREMULTIPLY_ON");glass.renderQueue=3000;
  contact=new PhysicsMaterial("Pin and rail restitution"){dynamicFriction=.075f,staticFriction=.1f,bounciness=.4f,frictionCombine=PhysicsMaterialCombine.Minimum,bounceCombine=PhysicsMaterialCombine.Maximum};Save(contact,"Contact.physicMaterial");
  Lighting();
  var root=new GameObject("YozoraMachine");machine=root.AddComponent<YozoraMachine>();machine.font=font;machine.lampMaterial=purple;machine.audioSource=root.AddComponent<AudioSource>();machine.audioSource.playOnAwake=false;
  cabinet=Group("Cabinet · editable geometry",root.transform);
  var cam=new GameObject("Main Camera");cam.tag="MainCamera";var camera=cam.AddComponent<Camera>();camera.fieldOfView=42;camera.nearClipPlane=.025f;camera.farClipPlane=8;camera.clearFlags=CameraClearFlags.SolidColor;camera.backgroundColor=new Color(.018f,.023f,.035f);camera.allowHDR=true;camera.allowMSAA=true;cam.transform.position=new Vector3(0,.60f,-1.68f);cam.transform.LookAt(new Vector3(0,.565f,0));cam.AddComponent<AudioListener>();machine.viewCamera=camera;
  BuildHousing();BuildPlayfield();BuildMechanisms();BuildScreen();BuildReferenceDetails();BuildBall();
  var all=CreateCanvas("Cabinet lettering",cabinet,new Vector3(0,.55f,-.215f),new Vector2(620,1160),.001f);
  var brand=TextAt(all,"SAO",new Vector2(45,402),new Vector2(260,84),67,Color.white,FontStyle.BoldAndItalic);Outline(brand,new Color(.25f,.14f,.5f),new Vector2(2,-3));
  TextAt(all,"SWORD ART ONLINE",new Vector2(45,361),new Vector2(260,21),12,new Color(.7f,.83f,1));
  TextAt(all,"ALICIZATION  夜空",new Vector2(45,338),new Vector2(260,24),18,new Color(.6f,.82f,1));
  machine.topStats=TextAt(all,"",new Vector2(0,486),new Vector2(510,35),17,new Color(.58f,.85f,1));
  machine.status=TextAt(all,"",new Vector2(0,-492),new Vector2(560,32),20,new Color(.73f,.87f,1));
  machine.titleLabel=TextAt(all,"",new Vector2(0,-529),new Vector2(400,25),12,new Color(.63f,.66f,.77f));
  TextAt(all,"PUSH",new Vector2(-12,-338),new Vector2(74,28),18,new Color(.04f,.06f,.10f),FontStyle.Bold);
  TextAt(all,"FAIR START",new Vector2(12,-263),new Vector2(115,18),10,new Color(.83f,.78f,.5f));
  TextAt(all,"PLUS START",new Vector2(-64,-296),new Vector2(90,18),9,new Color(.7f,.85f,1));
  // No label over the unrelated rose ornament: attacker position remains provisional.
  machine.swordBlue=Sword("Blue rose sword",new Vector3(-.035f,.849f,-.125f),ice,-88);
  machine.swordGold=Sword("Osmanthus sword",new Vector3(.035f,.861f,-.129f),steel,88);
  ReferenceCabinetBuilder.Build(cabinet,machine);
  PremiumControlsBuilder.Build(cabinet,machine);
  CabinetEmbossedText.Build(cabinet,machine);
  ReferenceLeftPlayfield.Build(cabinet,machine);
  ReferenceRightMechanism.Build(cabinet,machine);
  CabinetStructureBuilder.Build(cabinet,machine);
  AssetDatabase.SaveAssets();
  var scenePath=Root+"Scenes/Yozora.unity";EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(),scenePath);
  EditorBuildSettings.scenes=new[]{new EditorBuildSettingsScene(scenePath,true)};AssetDatabase.SaveAssets();
  Debug.Log("YOZORA_SCENE_CREATED: editable cabinet / PhysX balls / 3D contacts / screen");
 }
 static Mesh ScreenCollider(){
  // Shared with the visible LCD perimeter, so traced nails cannot overlap a stale octagonal obstacle.
  var outline=ReferenceShape.ScreenOutline;var p=new Vector2[outline.Length];for(int i=0;i<p.Length;i++)p[i]=Vector2.Scale(outline[i],new Vector2(.315f,.480f));
  int n=p.Length;var v=new List<Vector3>();var t=new List<int>();for(int i=0;i<n;i++){v.Add(new Vector3(p[i].x,p[i].y,-.022f));v.Add(new Vector3(p[i].x,p[i].y,.022f));}
  for(int i=0;i<n;i++){int j=(i+1)%n;t.AddRange(new[]{i*2,j*2,i*2+1,j*2,j*2+1,i*2+1});}for(int i=1;i<n-1;i++){t.AddRange(new[]{0,(i+1)*2,i*2,1,i*2+1,(i+1)*2+1});}
  var m=new Mesh{name="Tapered LCD collision"};m.SetVertices(v);m.SetTriangles(t,0);m.RecalculateNormals();Save(m,"ScreenCollision.asset");return m;
 }
 static Vector2 LaunchArc(float t){float u=1-t;return u*u*u*new Vector2(-.24f,.567f)+3*u*u*t*new Vector2(-.26f,1.04f)+3*u*t*t*new Vector2(.14f,1.06f)+t*t*t*new Vector2(.196f,.864f);}
 static void SmoothRail(Transform parent){
  // Upper launch arc ends at the traced right route. No legacy ellipse across the right mechanisms.
  var vertices=new List<Vector3>();var triangles=new List<int>();const int count=144;
  for(int i=0;i<=count;i++){float u=i/(float)count;Vector2 p=LaunchArc(u),d=(LaunchArc(Mathf.Min(1,u+.001f))-LaunchArc(Mathf.Max(0,u-.001f))).normalized,n=new Vector2(-d.y,d.x);
   for(int k=0;k<4;k++){var v=p+n*(k<2?-.0035f:.0035f);vertices.Add(new Vector3(v.x,v.y,k%2==0?-.075f:-.031f));}
   if(i>0){int a=(i-1)*4,b=i*4;int[] order={0,1,3,2};for(int j=0;j<4;j++){int x=order[j],y=order[(j+1)%4];triangles.AddRange(new[]{a+x,a+y,b+x,b+x,a+y,b+y});}}
  }
  var mesh=new Mesh{name="Continuous upper launch arc"};mesh.SetVertices(vertices);mesh.SetTriangles(triangles,0);mesh.RecalculateNormals();Save(mesh,"ContinuousRail.asset");var go=new GameObject("Continuous upper launch rail");go.transform.SetParent(parent,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;go.AddComponent<MeshRenderer>().sharedMaterial=chrome;
  for(int i=0;i<count;i++){Vector2 a=LaunchArc(i/(float)count),b=LaunchArc((i+1)/(float)count);var g=new GameObject("Upper rail contact segment");g.transform.SetParent(parent,false);g.transform.localPosition=new Vector3((a.x+b.x)*.5f,(a.y+b.y)*.5f,-.053f);g.transform.localRotation=Quaternion.FromToRotation(Vector3.up,b-a);var c=g.AddComponent<BoxCollider>();c.size=new Vector3(.007f,Vector2.Distance(a,b)+.0003f,.044f);c.sharedMaterial=contact;}
 }
 static void BuildHousing(){
  Plate("Rear housing",new Vector3(0,.55f,.09f),new Vector3(.59f,1.0f,.18f),.058f,black);
  Plate("Pearl front chassis",new Vector3(0,.535f,.001f),new Vector3(.57f,.955f,.065f),.025f,black);
  Plate("Inset dark bezel",new Vector3(0,.575f,-.037f),new Vector3(.526f,.819f,.035f),.069f,black);
  Plate("Playfield back",new Vector3(0,.567f,-.026f),new Vector3(.476f,.734f,.011f),.081f,steel);
  Plate("Field midnight",new Vector3(0,.565f,-.034f),new Vector3(.454f,.711f,.006f),.075f,black);
  // The outer sculpture is built as layered mouldings, not a textured photograph.
  foreach(int sign in new[]{-1,1}){
   for(int i=0;i<12;i++){
    float y=.255f+i*.056f;float x=sign*(.253f+.008f*Mathf.Sin(i*.38f));
    var p=Plate("Chrome frame moulding",new Vector3(x,y,-.083f),new Vector3(.026f,.059f,.032f),.005f,chrome);p.transform.localRotation=Quaternion.Euler(0,sign*-18,sign*2);
    Plate("Purple segmented light",new Vector3(x-sign*.008f,y,-.112f),new Vector3(.006f,.060f,.008f),.003f,purple);
    var fin=Plate("Layered resin facet",new Vector3(x-sign*.024f,y+.005f,-.089f),new Vector3(.014f,.049f,.016f),.002f,glass);fin.transform.localRotation=Quaternion.Euler(0,sign*22,sign*-18);
   }
   Cylinder("Speaker chrome bezel",new Vector3(sign*.215f,.887f,-.104f),.047f,.009f,chrome);
   Cylinder("Speaker black cone",new Vector3(sign*.215f,.887f,-.113f),.041f,.008f,rubber);
   Ring("Speaker inner ring",new Vector3(sign*.215f,.887f,-.122f),.036f,.0015f,chrome);
   for(int row=-7;row<=7;row++)for(int col=-7;col<=7;col++){if(row*row+col*col>48)continue;Cylinder("Speaker perforation",new Vector3(sign*.215f+col*.0049f,.887f+row*.0049f,-.12f),.00085f,.001f,steel);}
   for(int i=0;i<4;i++)Cylinder("Chassis screw",new Vector3(sign*.272f,.255f+i*.19f,-.089f),.002f,.001f,steel);
  }
  Plate("Crown chrome",new Vector3(0,.964f,-.052f),new Vector3(.42f,.10f,.05f),.02f,chrome);
  Plate("Crown dark face",new Vector3(0,.967f,-.095f),new Vector3(.395f,.085f,.032f),.014f,black);
  Plate("Crown light strip",new Vector3(0,.909f,-.10f),new Vector3(.332f,.007f,.014f),.003f,purple);
  Plate("Data display rim",new Vector3(0,1.065f,-.07f),new Vector3(.555f,.062f,.064f),.016f,chrome);
  Plate("Data display glass",new Vector3(0,1.067f,-.107f),new Vector3(.531f,.047f,.013f),.01f,lcdBlack);
  // Pearl lower apron and deep tray, with a physical-looking chrome control pod.
  Plate("Lower pearl apron",new Vector3(0,.146f,-.015f),new Vector3(.563f,.14f,.136f),.022f,shell);
  Plate("Tray cavity",new Vector3(0,.225f,-.09f),new Vector3(.49f,.052f,.065f),.02f,rubber);
  Plate("Tray rim",new Vector3(0,.195f,-.148f),new Vector3(.493f,.018f,.032f),.008f,chrome);
  Plate("Control island",new Vector3(-.012f,.172f,-.108f),new Vector3(.159f,.115f,.107f),.035f,black);
  Cylinder("PUSH surround",new Vector3(-.012f,.191f,-.169f),.047f,.016f,chrome);
  Cylinder("PUSH frosted button",new Vector3(-.012f,.205f,-.181f),.043f,.018f,chrome);
  Ring("PUSH purple rim",new Vector3(-.012f,.205f,-.20f),.040f,.0012f,white);
  var handle=Group("Horizontal ribbed handle",cabinet);handle.localPosition=new Vector3(.193f,.15f,-.142f);
  var drum=Cylinder("Handle black horizontal drum",Vector3.zero,.033f,.087f,black,handle);drum.transform.localRotation=Quaternion.Euler(0,0,90);
  for(int i=0;i<9;i++){var rib=Cylinder("Handle axial chrome rib",new Vector3(-.04f+i*.01f,0,0),.036f,.003f,chrome,handle);rib.transform.localRotation=Quaternion.Euler(0,0,90);}
  var endCap=Cylinder("Handle outer silver cap",new Vector3(.047f,0,0),.029f,.012f,chrome,handle);endCap.transform.localRotation=Quaternion.Euler(0,0,90);
  for(int i=0;i<10;i++)Plate("Apron grille",new Vector3(-.19f,.10f+i*.007f,-.089f),new Vector3(.092f,.002f,.003f),.0007f,steel);
 }
 static void BuildPlayfield(){
  var physics=Group("Playfield collision and pins",cabinet);
  // Glass cavity permits real Z motion. There is no FreezePositionZ constraint.
  HiddenBox("Rear glass contact",new Vector3(0,.568f,-.031f),new Vector3(.49f,.75f,.008f),physics);
  HiddenBox("Front glass contact",new Vector3(0,.568f,-.078f),new Vector3(.49f,.75f,.006f),physics);
  SmoothRail(physics);
  Rail("Launcher outer barrel",new Vector3(-.24f,.567f,-.053f),new Vector3(-.246f,.207f,-.053f),.0035f,chrome,physics);
  Rail("Launcher lower return",new Vector3(-.246f,.207f,-.053f),new Vector3(0,.203f,-.053f),.0035f,chrome,physics);
  Vector3[] inner={new Vector3(-.218f,.225f,-.053f),new Vector3(-.218f,.60f,-.053f),new Vector3(-.209f,.661f,-.053f),new Vector3(-.19f,.728f,-.053f)};
  for(int i=0;i<inner.Length-1;i++)Rail("Launcher inner curved lip",inner[i],inner[i+1],.0026f,chrome,physics);
  Rail("Upper kick reflector",new Vector3(-.174f,.877f,-.053f),new Vector3(-.097f,.903f,-.053f),.003f,steel,physics);
  // Main screen has a real surrounding obstacle: balls circulate around it.
  var screen=Plate("LCD physical surround",new Vector3(.012f,.597f,-.051f),new Vector3(.35f,.50f,.047f),.024f,chrome,physics);var sc=screen.AddComponent<MeshCollider>();sc.sharedMesh=ScreenCollider();sc.sharedMaterial=contact;screen.GetComponent<MeshFilter>().sharedMesh=sc.sharedMesh;screen.GetComponent<MeshRenderer>().enabled=false;
  var gasket=Plate("LCD bezel gasket",new Vector3(.012f,.597f,-.066f),new Vector3(.334f,.484f,.012f),.012f,rubber,physics);gasket.GetComponent<MeshFilter>().sharedMesh=sc.sharedMesh;gasket.transform.localScale=new Vector3(.96f,.97f,.3f);gasket.GetComponent<MeshRenderer>().enabled=false;
  var border=ReferenceShape.ScreenOutline;for(int k=0;k<border.Length;k++){var p=Vector2.Scale(border[k],new Vector2(.315f,.480f));var q=Vector2.Scale(border[(k+1)%border.Length],new Vector2(.315f,.480f));Line("LCD chrome perimeter",new Vector3(.012f+p.x,.597f+p.y,-.083f),new Vector3(.012f+q.x,.597f+q.y,-.083f),.003f,chrome,physics,false);}

  for(int row=0;row<3;row++)for(int col=0;col<8;col++){float x=-.14f+col*.018f+(row%2)*.006f,y=.327f-row*.020f;if(x<-.125f&&y<.429f)continue;if(x>.137f&&y<.375f)continue;if(y<.295f&&x<-.065f)Pin(x,y,physics);}
  for(int i=0;i<7;i++){Pin(-.20f+(i%2)*.004f,.647f-i*.038f,physics);}
  Pin(-.082f,.280f,physics);Pin(-.046f,.280f,physics);
  // Dedicated, visible receiving mouths. Trigger volumes lie behind the entrance.
  Mouth("PLUS",new Vector3(-.064f,.258f,-.054f),.024f,PocketKind.Plus,physics);
  Mouth("RIGHT",new Vector3(.205f,.427f,-.054f),.044f,PocketKind.Right,physics);
  Sensor("OUT",new Vector3(0,.214f,-.053f),new Vector3(.405f,.006f,.05f),PocketKind.Out,physics);
  machine.ballRoot=Group("Live balls",machine.transform);machine.launchPoint=Group("Launcher muzzle",machine.transform);machine.launchPoint.position=new Vector3(-.232f,.234f,-.052f);
 }
 static void BuildMechanisms(){
  FairMechanismBuilder.Build(cabinet,machine);
  Plate("Attacker dark chamber",new Vector3(.177f,.315f,-.027f),new Vector3(.088f,.056f,.035f),.01f,black);
  foreach(int sign in new[]{-1,1})Rail("Attacker side",new Vector3(.177f+sign*.038f,.296f,-.052f),new Vector3(.177f+sign*.038f,.343f,-.052f),.003f,chrome,cabinet);
  var hinge=Group("Attacker hinge",cabinet);hinge.position=new Vector3(.177f,.309f,-.044f);machine.door=hinge;
  var panel=Plate("Attacker moving shutter",new Vector3(0,.015f,0),new Vector3(.07f,.03f,.006f),.003f,ice,hinge);AddBox(panel,new Vector3(.07f,.03f,.006f));var gatebody=hinge.gameObject.AddComponent<Rigidbody>();gatebody.isKinematic=true;
  Sensor("Attacker receiving sensor",new Vector3(.177f,.302f,-.052f),new Vector3(.064f,.014f,.031f),PocketKind.Attacker,cabinet);
  // Right-drop channel feeds the open mouth through contacts, without teleportation.
  Rail("Right unit outer guide",new Vector3(.229f,.433f,-.052f),new Vector3(.21f,.342f,-.052f),.0025f,chrome,cabinet);
  Rail("Right unit receiving guide",new Vector3(.151f,.384f,-.052f),new Vector3(.156f,.335f,-.052f),.0025f,chrome,cabinet);
 }
 static void BuildScreen(){
  var ui=CreateCanvas("LCD · reference-informed composition",cabinet,new Vector3(.012f,.597f,-.09f),new Vector2(1000,1520),.000309f);
  ui.gameObject.AddComponent<CanvasRenderer>();ui.gameObject.AddComponent<ReferenceShape>().screen=true;ui.gameObject.AddComponent<Mask>().showMaskGraphic=false;
  ImageAt(ui,"LCD background",Vector2.zero,new Vector2(1000,1520),new Color(.015f,.045f,.09f));
  var art=RawAt(ui,"Generated key art",Vector2.zero,new Vector2(1000,1520),Root+"Art/alicization-fan-art.png");art.uvRect=new Rect(.25f,0,.5f,1);art.color=new Color(.7f,.8f,1);machine.keyArt=art;
  ImageAt(ui,"Upper shadow",new Vector2(0,650),new Vector2(1000,220),new Color(.005f,.02f,.07f,.6f));
  var pres=machine.gameObject.AddComponent<ReferencePresentation>();pres.machine=machine;
  pres.stage=TextAt(ui,"セントリア",new Vector2(265,600),new Vector2(400,55),35,Color.white,FontStyle.BoldAndItalic);Outline(pres.stage,new Color(.02f,.08f,.16f),new Vector2(3,-4));
  pres.smallDigits=TextAt(ui,"",new Vector2(-250,620),new Vector2(260,50),30,new Color(.8f,.95f,1),FontStyle.Bold);
  pres.normalAtlas=AssetDatabase.LoadAssetAtPath<Texture2D>(Root+"Art/normal-symbols-video.png");pres.rushAtlas=AssetDatabase.LoadAssetAtPath<Texture2D>(Root+"Art/rush-symbols-video.png");pres.academy=AssetDatabase.LoadAssetAtPath<Texture2D>(Root+"Art/academy-video.png");
  pres.sequenceAtlas=AssetDatabase.LoadAssetAtPath<Texture2D>(Root+"Art/reference-sequence-atlas.png");
  pres.directorAtlas=AssetDatabase.LoadAssetAtPath<Texture2D>(Root+"Art/director-cuts-2026-09-27.png");
  pres.bonusDirectorAtlas=AssetDatabase.LoadAssetAtPath<Texture2D>(Root+"Art/bonus-director-2026-09-27.png");
  pres.amayoriSymbol=AssetDatabase.LoadAssetAtPath<Texture2D>(Root+"Art/amayori-symbol.png");
  pres.ornaments=new SymbolOrnament[9];pres.symbolRoots=new RectTransform[9];pres.portraits=new RawImage[9];pres.plates=new Image[9];pres.numbers=new Text[9];pres.shadowNumbers=new Text[9];
  for(int i=0;i<9;i++){
   var slot=new GameObject("Character symbol "+i,typeof(RectTransform));slot.transform.SetParent(ui,false);var rt=slot.GetComponent<RectTransform>();rt.sizeDelta=new Vector2(400,1000);pres.symbolRoots[i]=rt;
   pres.portraits[i]=RawAt(rt,"Mode-specific character symbol",new Vector2(0,80),new Vector2(480,980),Root+"Art/normal-symbols-video.png");
   var badge=new GameObject("Faceted metallic numeral bezel",typeof(RectTransform),typeof(SymbolOrnament));badge.transform.SetParent(rt,false);var br=badge.GetComponent<RectTransform>();br.anchoredPosition=new Vector2(0,-195);br.sizeDelta=new Vector2(345,345);pres.ornaments[i]=badge.GetComponent<SymbolOrnament>();
   pres.shadowNumbers[i]=TextAt(rt,"3",new Vector2(5,-203),new Vector2(400,370),310,new Color(.025f,.07f,.065f),FontStyle.BoldAndItalic);Outline(pres.shadowNumbers[i],new Color(.91f,.99f,1),new Vector2(7,-7));
   pres.numbers[i]=TextAt(rt,"3",new Vector2(-3,-193),new Vector2(400,370),298,new Color(.7f,1,.9f),FontStyle.BoldAndItalic);Outline(pres.numbers[i],new Color(.08f,.12f,.16f),new Vector2(4,-5));
  }
  // Middle row follows the column offsets. Lines indicate a reach, not an outcome.
  pres.lines=new RectTransform[5];for(int i=0;i<5;i++){var line=ImageAt(ui,"Reach line "+i,new Vector2(0,-170),new Vector2(940,6),new Color(.45f,.94f,1,.55f));pres.lines[i]=line.rectTransform;line.gameObject.SetActive(false);}
  pres.cutIn=new GameObject("Reference cut-in sequence",typeof(RectTransform),typeof(CanvasGroup)).GetComponent<RectTransform>();pres.cutIn.SetParent(ui,false);pres.cutIn.sizeDelta=new Vector2(1000,1520);pres.cutGroup=pres.cutIn.GetComponent<CanvasGroup>();pres.cutGroup.alpha=0;
  ImageAt(pres.cutIn,"Cut-in ground",Vector2.zero,new Vector2(1000,1520),new Color(.01f,.025f,.08f));
  pres.cutPortrait=RawAt(pres.cutIn,"Cut-in portrait",new Vector2(0,140),new Vector2(950,1550),Root+"Art/symbol-portraits.png");
  pres.slash=ImageAt(pres.cutIn,"Sword streak",new Vector2(0,-160),new Vector2(1550,17),new Color(.55f,.9f,1)).rectTransform;
  pres.cutTitle=TextAt(pres.cutIn,"",new Vector2(0,-280),new Vector2(1000,300),115,Color.white,FontStyle.BoldAndItalic);Outline(pres.cutTitle,new Color(.015f,.15f,.4f),new Vector2(6,-8));
  machine.modeLabel=TextAt(ui,"",new Vector2(0,540),new Vector2(950,55),1,Color.clear);
  machine.reels=new Text[3];for(int i=0;i<3;i++)machine.reels[i]=TextAt(ui,"1",Vector2.zero,new Vector2(1,1),1,Color.clear);
  machine.headline=TextAt(ui,"",new Vector2(0,100),new Vector2(970,300),100,Color.white,FontStyle.BoldAndItalic);Outline(machine.headline,new Color(.07f,.025f,.13f),new Vector2(4,-6));
  machine.subtitle=TextAt(ui,"",new Vector2(0,-135),new Vector2(970,120),67,new Color(1,.88f,.56f),FontStyle.Bold);
  machine.payoutLabel=TextAt(ui,"",new Vector2(210,-645),new Vector2(500,60),34,new Color(.85f,.9f,1));
  pres.modeRibbon=TextAt(ui,"ALICIZATION",new Vector2(-170,640),new Vector2(550,55),30,new Color(.65f,.9f,1),FontStyle.Bold);
  machine.holds=new Image[4];pres.crystals=new Image[4];pres.crystalShapes=new SymbolOrnament[4];
  for(int i=0;i<4;i++){
   var pos=new Vector2(-285+i*82,-500);var hidden=ImageAt(ui,"Legacy hold driver "+i,pos,Vector2.one,Color.clear);hidden.gameObject.SetActive(false);machine.holds[i]=pres.crystals[i]=hidden;
   var o=new GameObject("Crystal queued hold "+i,typeof(RectTransform),typeof(SymbolOrnament));o.transform.SetParent(ui,false);var rt=o.GetComponent<RectTransform>();rt.anchoredPosition=pos;rt.sizeDelta=new Vector2(52,82);var shape=o.GetComponent<SymbolOrnament>();shape.crystal=true;pres.crystalShapes[i]=shape;
  }
  var current=new GameObject("Current active crystal",typeof(RectTransform),typeof(SymbolOrnament));current.transform.SetParent(ui,false);pres.currentCrystal=current.GetComponent<RectTransform>();pres.currentCrystal.anchoredPosition=new Vector2(65,-500);pres.currentCrystal.sizeDelta=new Vector2(100,140);current.GetComponent<SymbolOrnament>().crystal=true;current.GetComponent<SymbolOrnament>().color=new Color(.35f,.95f,.82f);
  machine.flash=ImageAt(ui,"Event flash",Vector2.zero,new Vector2(1000,1520),Color.clear);
 }
 static RawImage RawAt(RectTransform parent,string name,Vector2 pos,Vector2 size,string texture){var o=new GameObject(name,typeof(RectTransform),typeof(RawImage));o.transform.SetParent(parent,false);var r=o.GetComponent<RectTransform>();r.anchoredPosition=pos;r.sizeDelta=size;var a=o.GetComponent<RawImage>();a.texture=AssetDatabase.LoadAssetAtPath<Texture2D>(texture);a.raycastTarget=false;return a;}
 static void BuildReferenceDetails(){
  // Y4/Y5: layered clear resin along LCD; prominent top crossing blades; blue rose lower right.
  for(int sign=-1;sign<=1;sign+=2){
   for(int i=0;i<14;i++){float y=.39f+i*.033f;float x=sign*.202f;var crystal=Plate("Clear resin facets",new Vector3(x,y,-.101f),new Vector3(.033f,.043f,.025f),.006f,glass);crystal.transform.localRotation=Quaternion.Euler(sign*14,sign*16,sign*(i%2==0?15:-12));
    Plate("Resin highlight",new Vector3(x+sign*.011f,y,-.118f),new Vector3(.0014f,.029f,.004f),.0005f,white);
    if(i%2==0)Cylinder("Resin fastener",new Vector3(x,y,-.122f),.0017f,.002f,chrome);
   }
  }
  // Bright Star frame: horizontal slatted upper beam rather than an empty oval crown.
  Plate("Upper purple slatted beam",new Vector3(0,.914f,-.1f),new Vector3(.36f,.035f,.022f),.005f,black);
  for(int i=0;i<48;i++)Plate("Upper grille ridge",new Vector3(-.17f+i*.0072f,.914f,-.116f),new Vector3(.0012f,.025f,.006f),.0005f,chrome);
  // Clear transfer ramp is visibly connected to the central rotor.
  var channel=Plate("FAIR clear transfer ramp",new Vector3(-.09f,.316f,-.082f),new Vector3(.245f,.043f,.022f),.007f,glass);channel.transform.localRotation=Quaternion.Euler(0,0,-24);
  Ring("Central FAIR housing highlight",new Vector3(.012f,.250f,-.102f),.040f,.0014f,chrome);
  Plate("Left distributor resin",new Vector3(-.194f,.536f,-.086f),new Vector3(.046f,.23f,.027f),.011f,glass);
  for(int i=0;i<5;i++){Plate("Distributor silver hex panel",new Vector3(-.198f,.454f+i*.045f,-.099f),new Vector3(.026f,.039f,.005f),.01f,chrome);Cylinder("Distributor purple center",new Vector3(-.198f,.454f+i*.045f,-.104f),.009f,.003f,purple);}
  // Small chrome letters and resin labels are physically separate from the LCD.
  var labels=CreateCanvas("Reference hardware labels",cabinet,new Vector3(0,.55f,-.145f),new Vector2(620,1160),.001f);
  var emblem=TextAt(labels,"神\n器",new Vector2(200,67),new Vector2(52,122),42,new Color(1,.85f,.42f),FontStyle.Bold);Outline(emblem,Color.white,new Vector2(1,-2));
  TextAt(labels,"解放",new Vector2(201,-26),new Vector2(56,44),23,Color.white,FontStyle.Bold);
  TextAt(labels,"＋",new Vector2(-64,-277),new Vector2(32,42),38,new Color(.8f,.18f,.015f),FontStyle.Bold);
  // Sculpted blue rose lens. Petals are original meshes, not official art textures.
  var rose=Group("Blue rose lamp",cabinet);rose.localPosition=new Vector3(.179f,.28f,-.102f);
  for(int ring=0;ring<3;ring++)for(int i=0;i<7;i++){float a=(i*360f/7+ring*19)*Mathf.Deg2Rad;float r=.008f+ring*.010f;var petal=Plate("Blue rose petal",new Vector3(Mathf.Cos(a)*r,Mathf.Sin(a)*r,-ring*.002f),new Vector3(.014f+ring*.003f,.021f,.007f),.006f,ice,rose);petal.transform.localRotation=Quaternion.Euler(20,15,i*360f/7+ring*19);}
  Cylinder("Rose lens core",new Vector3(.179f,.28f,-.117f),.009f,.005f,ice);
  // A character crest and two lower illustration medallions, using newly drawn fan art.
  var crest=CreateCanvas("Generated cabinet illustration inlays",cabinet,new Vector3(0,.55f,-.145f),new Vector2(620,1160),.001f);
  var crownPortrait=RawAt(crest,"Crown Kirito fan illustration",new Vector2(-100,425),new Vector2(100,112),Root+"Art/symbol-portraits.png");crownPortrait.uvRect=new Rect(0,0,1f/3f,1);crownPortrait.rectTransform.localPosition+=Vector3.back*28; // In front of the new cut-glass crest, canvas scale .001.
  RawAt(crest,"Lower Alice fan illustration",new Vector2(-173,-254),new Vector2(100,98),Root+"Art/symbol-portraits.png").uvRect=new Rect(2f/3f,0,1f/3f,1);
 }
 static void BuildBall(){
  var b=GameObject.CreatePrimitive(PrimitiveType.Sphere);b.name="Ball · 11mm steel";b.transform.localScale=Vector3.one*.011f;b.layer=8;b.GetComponent<Renderer>().sharedMaterial=chrome;b.GetComponent<SphereCollider>().sharedMaterial=contact;
  var rb=b.AddComponent<Rigidbody>();rb.mass=.0054f;rb.linearDamping=.015f;rb.angularDamping=.015f;rb.collisionDetectionMode=CollisionDetectionMode.ContinuousDynamic;rb.interpolation=RigidbodyInterpolation.Interpolate;rb.maxAngularVelocity=150;rb.solverIterations=12;rb.solverVelocityIterations=6;b.AddComponent<BallBody>();
  machine.ballPrefab=PrefabUtility.SaveAsPrefabAsset(b,Root+"Prefabs/SteelBall.prefab");UnityEngine.Object.DestroyImmediate(b);
 }
 static void Lighting(){
  RenderSettings.ambientMode=AmbientMode.Trilight;RenderSettings.ambientSkyColor=new Color(.28f,.34f,.48f);RenderSettings.ambientEquatorColor=new Color(.15f,.19f,.28f);RenderSettings.ambientGroundColor=new Color(.035f,.045f,.075f);
  var key=new GameObject("Key · cool soft studio");var light=key.AddComponent<Light>();light.type=LightType.Directional;light.color=new Color(.86f,.92f,1);light.intensity=1.7f;light.shadows=LightShadows.Soft;light.shadowBias=.025f;light.shadowNormalBias=.005f;key.transform.rotation=Quaternion.Euler(24,-32,0);
  var fill=new GameObject("Fill · warm rim");var l=fill.AddComponent<Light>();l.type=LightType.Directional;l.color=new Color(1,.76f,.52f);l.intensity=.75f;fill.transform.rotation=Quaternion.Euler(-20,130,0);
  var cube=new Cubemap(64,TextureFormat.RGBA32,true);cube.name="Procedural studio reflection";
  for(int f=0;f<6;f++){var colors=new Color[4096];for(int y=0;y<64;y++)for(int x=0;x<64;x++){Color c=Color.Lerp(new Color(.012f,.018f,.038f),new Color(.26f,.35f,.49f),y/63f);if((x>9&&x<18&&y>6&&y<56)||(x>45&&x<49&&y>15&&y<48))c=new Color(.9f,.95f,1);colors[y*64+x]=c;}cube.SetPixels(colors,(CubemapFace)f);}cube.Apply(true);Save(cube,"StudioReflection.cubemap");RenderSettings.defaultReflectionMode=DefaultReflectionMode.Custom;RenderSettings.customReflectionTexture=cube;RenderSettings.reflectionIntensity=.85f;
 }
 static Material Mat(string name,Color color,float metallic,float gloss,Color? emission=null){var m=new Material(Shader.Find("Standard")){name=name};m.color=color;m.SetFloat("_Metallic",metallic);m.SetFloat("_Glossiness",gloss);if(emission.HasValue){m.EnableKeyword("_EMISSION");m.SetColor("_EmissionColor",emission.Value);}Save(m,name.Replace(' ','_')+".mat");return m;}
 static void Save(UnityEngine.Object obj,string name){string p=Root+"Generated/"+name;var existing=AssetDatabase.LoadAssetAtPath<UnityEngine.Object>(p);if(existing){EditorUtility.CopySerialized(obj,existing);UnityEngine.Object.DestroyImmediate(obj);throw new InvalidOperationException("Generated asset already exists; use fresh build directory or rebuild via reset assets.");}AssetDatabase.CreateAsset(obj,p);generated.Add(obj);}
 static Transform Group(string name,Transform parent){var g=new GameObject(name).transform;g.SetParent(parent,false);return g;}
 static GameObject Plate(string name,Vector3 pos,Vector3 size,float radius,Material mat,Transform parent=null){var go=new GameObject(name);go.transform.SetParent(parent?parent:cabinet,false);go.transform.localPosition=pos;var mesh=RoundedBox(size,radius);go.AddComponent<MeshFilter>().sharedMesh=mesh;go.AddComponent<MeshRenderer>().sharedMaterial=mat;return go;}
 static Mesh RoundedBox(Vector3 size,float r){
  float x=size.x/2,y=size.y/2,z=size.z/2;r=Mathf.Min(r,Mathf.Min(x,y)*.9f);float bevel=Mathf.Min(size.z*.23f,r*.48f);
  var vertices=new List<Vector3>();var tris=new List<int>();var uv=new List<Vector2>();
  Vector2[] Outline(float inset){var pts=new List<Vector2>();float rr=Mathf.Max(.0001f,r-inset);for(int corner=0;corner<4;corner++){float cx=(corner==0||corner==3?1:-1)*(x-r),cy=(corner<2?1:-1)*(y-r);for(int k=0;k<=5;k++){float a=(corner*90+k*18)*Mathf.Deg2Rad;pts.Add(new Vector2(cx+Mathf.Cos(a)*rr,cy+Mathf.Sin(a)*rr));}}return pts.ToArray();}
  var outer=Outline(0);var inner=Outline(bevel);int n=outer.Length;
  void Quad(Vector3 a,Vector3 b,Vector3 c,Vector3 d){int j=vertices.Count;vertices.AddRange(new[]{a,b,c,d});uv.AddRange(new[]{Vector2.zero,Vector2.right,Vector2.one,Vector2.up});tris.AddRange(new[]{j,j+2,j+1,j,j+3,j+2});}
  for(int i=0;i<n;i++){int j=(i+1)%n;Vector3 a=new Vector3(outer[i].x,outer[i].y,-z+bevel),b=new Vector3(outer[j].x,outer[j].y,-z+bevel),c=new Vector3(inner[j].x,inner[j].y,-z),d=new Vector3(inner[i].x,inner[i].y,-z);Quad(a,b,c,d);Quad(new Vector3(a.x,a.y,z),new Vector3(b.x,b.y,z),b,a);int v=vertices.Count;vertices.AddRange(new[]{new Vector3(0,0,-z),d,c});uv.AddRange(new[]{new Vector2(.5f,.5f),new Vector2(d.x/size.x+.5f,d.y/size.y+.5f),new Vector2(c.x/size.x+.5f,c.y/size.y+.5f)});tris.AddRange(new[]{v,v+2,v+1});}
  var mesh=new Mesh{name="Beveled moulding"};mesh.SetVertices(vertices);mesh.SetTriangles(tris,0);mesh.SetUVs(0,uv);mesh.RecalculateNormals();mesh.RecalculateBounds();AssetDatabase.CreateAsset(mesh,Root+"Generated/Moulding_"+(meshIndex++)+".asset");return mesh;
 }
 static GameObject Cylinder(string name,Vector3 pos,float radius,float depth,Material m,Transform parent=null){var o=GameObject.CreatePrimitive(PrimitiveType.Cylinder);o.name=name;o.transform.SetParent(parent?parent:cabinet,false);o.transform.localPosition=pos;o.transform.localRotation=Quaternion.Euler(90,0,0);o.transform.localScale=new Vector3(radius*2,depth/2,radius*2);UnityEngine.Object.DestroyImmediate(o.GetComponent<Collider>());o.GetComponent<Renderer>().sharedMaterial=m;return o;}
 static void Ring(string name,Vector3 pos,float radius,float thickness,Material m){for(int i=0;i<64;i++){float a=i*Mathf.PI/32,b=(i+1)*Mathf.PI/32;var p=new Vector3(pos.x+radius*Mathf.Cos(a),pos.y+radius*Mathf.Sin(a),pos.z);var q=new Vector3(pos.x+radius*Mathf.Cos(b),pos.y+radius*Mathf.Sin(b),pos.z);Line(name,p,q,thickness,m,cabinet,false);}}
 static void Rail(string name,Vector3 p,Vector3 q,float radius,Material m,Transform parent){Line(name,p,q,radius,m,parent,true);}
 static void Line(string name,Vector3 p,Vector3 q,float radius,Material m,Transform parent,bool collide){var o=GameObject.CreatePrimitive(collide?PrimitiveType.Cube:PrimitiveType.Cylinder);o.name=name;o.transform.SetParent(parent,false);o.transform.localPosition=(p+q)*.5f;o.transform.localRotation=Quaternion.FromToRotation(Vector3.up,(q-p).normalized);o.transform.localScale=collide?new Vector3(radius*2,(q-p).magnitude+radius,.044f):new Vector3(radius*2,(q-p).magnitude/2,radius*2);o.GetComponent<Renderer>().sharedMaterial=m;UnityEngine.Object.DestroyImmediate(o.GetComponent<Collider>());if(collide){var c=o.AddComponent<BoxCollider>();c.sharedMaterial=contact;}}
 static void AddBox(GameObject go,Vector3 size){var c=go.AddComponent<BoxCollider>();c.size=size;c.sharedMaterial=contact;}
 static void HiddenBox(string name,Vector3 pos,Vector3 size,Transform parent){var o=new GameObject(name);o.transform.SetParent(parent,false);o.transform.localPosition=pos;AddBox(o,size);}
 static void Pin(float x,float y,Transform parent){var g=Group("Pin",parent);g.localPosition=new Vector3(x,y,-.052f);Cylinder("Brass shaft",Vector3.zero,.0013f,.033f,gold,g);Cylinder("Polished pin head",new Vector3(0,0,-.024f),.0023f,.0015f,chrome,g);var col=g.gameObject.AddComponent<CapsuleCollider>();col.direction=2;col.radius=.0013f;col.height=.037f;col.sharedMaterial=contact;}
 static PocketSensor Sensor(string name,Vector3 pos,Vector3 size,PocketKind kind,Transform parent){var go=new GameObject(name);go.transform.SetParent(parent,false);go.transform.localPosition=pos;var c=go.AddComponent<BoxCollider>();c.size=size;c.isTrigger=true;var s=go.AddComponent<PocketSensor>();s.kind=kind;s.owner=machine;return s;}
 static void Mouth(string name,Vector3 pos,float width,PocketKind kind,Transform parent){Plate(name+" casing",pos+new Vector3(0,-.004f,.01f),new Vector3(width+.012f,.024f,.02f),.003f,chrome,parent);foreach(int sign in new[]{-1,1})Rail(name+" mouth lip",pos+new Vector3(sign*width/2,.009f,0),pos+new Vector3(sign*width/2,-.008f,0),.0015f,chrome,parent);Sensor(name+" entry",pos,new Vector3(width-.005f,.01f,.036f),kind,parent);}
 static Transform Sword(string name,Vector3 pos,Material m,float angle){var root=Group(name,cabinet);root.localPosition=pos;root.localRotation=Quaternion.Euler(0,0,angle);Plate("Faceted blade",new Vector3(0,.035f,0),new Vector3(.014f,.225f,.008f),.004f,m,root);Plate("Blade highlight",new Vector3(-.003f,.035f,-.005f),new Vector3(.002f,.206f,.002f),.0005f,chrome,root);Plate("Cross guard",new Vector3(0,-.083f,0),new Vector3(.061f,.01f,.016f),.003f,chrome,root);Plate("Wrapped grip",new Vector3(0,-.112f,0),new Vector3(.015f,.047f,.014f),.004f,black,root);return root;}
 static RectTransform CreateCanvas(string name,Transform parent,Vector3 pos,Vector2 size,float scale){var o=new GameObject(name,typeof(RectTransform),typeof(Canvas));o.transform.SetParent(parent,false);o.transform.localPosition=pos;o.transform.localScale=Vector3.one*scale;var r=o.GetComponent<RectTransform>();r.sizeDelta=size;var c=o.GetComponent<Canvas>();c.renderMode=RenderMode.WorldSpace;c.sortingOrder=2;return r;}
 static Text TextAt(RectTransform parent,string value,Vector2 pos,Vector2 size,int fontSize,Color color,FontStyle style=FontStyle.Normal){var o=new GameObject(value.Length>0?value:"Dynamic text",typeof(RectTransform),typeof(Text));o.transform.SetParent(parent,false);var r=o.GetComponent<RectTransform>();r.anchoredPosition=pos;r.sizeDelta=size;var t=o.GetComponent<Text>();t.font=font;t.text=value;t.fontSize=fontSize;t.fontStyle=style;t.alignment=TextAnchor.MiddleCenter;t.color=color;t.horizontalOverflow=HorizontalWrapMode.Wrap;t.verticalOverflow=VerticalWrapMode.Overflow;t.raycastTarget=false;return t;}
 static void Outline(Text t,Color c,Vector2 offset){var o=t.gameObject.AddComponent<UnityEngine.UI.Outline>();o.effectColor=c;o.effectDistance=offset;}
 static Image ImageAt(RectTransform parent,string name,Vector2 pos,Vector2 size,Color color){var go=new GameObject(name,typeof(RectTransform),typeof(Image));go.transform.SetParent(parent,false);var r=go.GetComponent<RectTransform>();r.anchoredPosition=pos;r.sizeDelta=size;var i=go.GetComponent<Image>();i.color=color;i.raycastTarget=false;return i;}
 public static void CreateAndAudit(){CreateScene();YozoraPhysicsAudit.Run();CabinetPhysicsAudit.Run();}
 public static void BuildWeb(){YozoraValidation.Run();CreateScene();YozoraPhysicsAudit.Run();CabinetPhysicsAudit.Run();BuildExistingWeb();}
 [MenuItem("Yozora/Build Web")]
 public static void BuildExistingWeb(){var output=Path.GetFullPath(Path.Combine(Application.dataPath,"../../prototype/public/unity-yozora"));Directory.CreateDirectory(output);var report=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{Root+"Scenes/Yozora.unity"},locationPathName=output,target=BuildTarget.WebGL,options=BuildOptions.None});if(report.summary.result!=BuildResult.Succeeded)throw new Exception("Web build failed: "+report.summary.result);Debug.Log("YOZORA_WEB_BUILD_SUCCESS "+output);}
}
