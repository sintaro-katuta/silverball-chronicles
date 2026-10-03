using System;
namespace Yozora {
 public enum UpperRushStage { None, Invading, Awakening }
 public enum UpperRushResultStyle { Final, Result }
 // View-only progression. R2 establishes distinct stages but not a general transition rule.
 public sealed class UpperRushPresentationState {
  YozoraRules owner;PlayMode previousMode;int seenResultId;float resultAge;
  public UpperRushStage Stage {get;private set;}
  public bool IsStagePreview {get;private set;}
  public bool HasResult {get;private set;}
  public UpperRushResultStyle ResultStyle {get;private set;}
  public int ResultId {get;private set;}
  public int ResultJackpots {get;private set;}
  public int ResultCompletedDrives {get;private set;}
  public int ResultPayout {get;private set;}
  public float ResultElapsed => resultAge;
  public int SymbolSetRevision {get;private set;}
  public void Observe(YozoraRules rules,float dt){
   if(rules==null)throw new ArgumentNullException(nameof(rules));
   if(float.IsNaN(dt)||float.IsInfinity(dt)||dt<0)throw new ArgumentOutOfRangeException(nameof(dt));
   if(rules.IsPaused)dt=0;
   if(!ReferenceEquals(owner,rules)){
    owner=rules;previousMode=rules.Mode;seenResultId=0;resultAge=0;HasResult=false;IsStagePreview=false;
    ResultId=ResultJackpots=ResultCompletedDrives=ResultPayout=0;Stage=rules.Mode==PlayMode.WarOfUnderworld?UpperRushStage.Invading:UpperRushStage.None;SymbolSetRevision++;
   }
   if(previousMode!=rules.Mode){
    previousMode=rules.Mode;Stage=rules.Mode==PlayMode.WarOfUnderworld?UpperRushStage.Invading:UpperRushStage.None;IsStagePreview=false;SymbolSetRevision++;
   }
   var result=rules.LastUpperRushResult;
   if(result!=null&&result.Id!=seenResultId){
    seenResultId=result.Id;ResultId=result.Id;ResultJackpots=result.Jackpots;ResultCompletedDrives=result.CompletedDrives;ResultPayout=result.Payout;
    resultAge=0;ResultStyle=UpperRushResultStyle.Final;HasResult=true;
   }
   if(HasResult){
    // Never cover a newly started normal spin, a bonus, or the bonus-owned transition.
    if(rules.Mode!=PlayMode.Normal||rules.Active!=null||rules.Bonus!=null||rules.IsBonusPresentationPending){HasResult=false;}
    else {resultAge+=dt;if(resultAge>=10){HasResult=false;}}
   }
  }
  public bool PreviewStage(UpperRushStage stage){
   if(owner==null||owner.Mode!=PlayMode.WarOfUnderworld||owner.Bonus!=null||owner.IsBonusPresentationPending||(stage!=UpperRushStage.Invading&&stage!=UpperRushStage.Awakening))return false;
   if(Stage!=stage)SymbolSetRevision++;Stage=stage;IsStagePreview=true;HasResult=false;return true;
  }
  public bool PreviewResult(UpperRushResultStyle style){
   if(owner==null||ResultId==0||owner.Mode!=PlayMode.Normal||owner.Active!=null||owner.Bonus!=null||owner.IsBonusPresentationPending)return false;
   ResultStyle=style;resultAge=0;HasResult=true;return true;
  }
  public void DismissResult(){HasResult=false;}
 }
}
