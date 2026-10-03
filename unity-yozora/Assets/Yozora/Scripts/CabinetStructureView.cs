using UnityEngine;
namespace Yozora {
 // Display-only inspection. Never disables a collider, rigidbody or mechanism script.
 public class CabinetStructureView:MonoBehaviour {
  public Renderer[] decoration; public Canvas[] labels;
  public bool structureOnly=true;
  bool[] rendererState,canvasState;
  void Awake(){Initialize();Apply();}
  void Initialize(){if(rendererState!=null)return;rendererState=new bool[decoration.Length];for(int i=0;i<decoration.Length;i++)rendererState[i]=decoration[i]&&decoration[i].enabled;canvasState=new bool[labels.Length];for(int i=0;i<labels.Length;i++)canvasState[i]=labels[i]&&labels[i].enabled;}
  public void Toggle(){SetStructureOnly(!structureOnly);}
  public void SetStructureOnly(bool value){Initialize();structureOnly=value;Apply();}
  void Apply(){for(int i=0;i<decoration.Length;i++)if(decoration[i])decoration[i].enabled=!structureOnly&&rendererState[i];for(int i=0;i<labels.Length;i++)if(labels[i])labels[i].enabled=!structureOnly&&canvasState[i];}
 }
}
