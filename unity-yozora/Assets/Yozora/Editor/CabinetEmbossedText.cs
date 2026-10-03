using System;
using UnityEngine;
using UnityEditor;
using Yozora;
public static class CabinetEmbossedText {
 [Serializable]class Library {public Glyph[] meshes;}
 [Serializable]class Glyph {public string name;public Vector3[] vertices,normals;public int[] triangles;}
 public static void Build(Transform cabinet,YozoraMachine machine){
  var data=AssetDatabase.LoadAssetAtPath<TextAsset>("Assets/Yozora/Art/Models/cabinet-type.json");if(!data)throw new Exception("Blender cabinet lettering missing");
  var library=JsonUtility.FromJson<Library>(data.text);
  foreach(var text in cabinet.GetComponentsInChildren<UnityEngine.UI.Text>(true))if(text.text=="神\n器"||text.text=="SAO"||text.text=="FAIR START")text.gameObject.SetActive(false);
  var root=new GameObject("Blender embossed cabinet emblems").transform;root.SetParent(cabinet,false);
  var gold=Mat("Emblem polished gold",new Color(.9f,.63f,.15f),.88f,.9f);var silver=Mat("Emblem silver face",new Color(.87f,.92f,.99f),.84f,.9f);var black=Mat("Emblem recessed black edge",new Color(.009f,.012f,.025f),.5f,.75f);
  foreach(var glyph in library.meshes){
   var mesh=new Mesh{name="Blender bevelled "+glyph.name};mesh.vertices=glyph.vertices;mesh.normals=glyph.normals;mesh.triangles=glyph.triangles;mesh.RecalculateBounds();AssetDatabase.CreateAsset(mesh,"Assets/Yozora/Generated/Embossed-"+glyph.name+".asset");
   float size=glyph.name=="Divine"?.128f:.057f;var pos=glyph.name=="Divine"?new Vector3(.200f,.610f,-.166f):new Vector3(.052f,.965f,-.160f);
   Place(root,glyph.name+" recessed outline",mesh,black,pos+Vector3.forward*.002f,size*1.065f);
   Place(root,glyph.name+" bevelled raised face",mesh,glyph.name=="Divine"?gold:silver,pos,size);
  }
 }
 static void Place(Transform root,string name,Mesh mesh,Material material,Vector3 pos,float size){var go=new GameObject(name);go.transform.SetParent(root,false);go.transform.localPosition=pos;go.transform.localScale=Vector3.one*size;go.AddComponent<MeshFilter>().sharedMesh=mesh;go.AddComponent<MeshRenderer>().sharedMaterial=material;}
 static Material Mat(string name,Color c,float metallic,float smooth){var m=new Material(Shader.Find("Standard")){name=name,color=c};m.SetFloat("_Metallic",metallic);m.SetFloat("_Glossiness",smooth);AssetDatabase.CreateAsset(m,"Assets/Yozora/Generated/"+name+".mat");return m;}
}
