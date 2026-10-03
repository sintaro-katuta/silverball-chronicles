using System;
namespace Yozora {
 public enum BonusPresentationPhase { Story, Result, Entrance, Complete }
 // Provisional editing durations, not measurements of uninterrupted machine footage.
 public sealed class BonusPresentationState {
  public int Id {get;}
  public Award CompletedAward {get;}
  public int Paid {get;}
  public PlayMode SourceMode {get;}
  public PlayMode Destination {get;}
  public BonusPresentationPhase Phase {get;private set;}=BonusPresentationPhase.Story;
  public float Elapsed {get;private set;}
  public float TotalElapsed {get;private set;}
  public bool PushAvailable => Phase==BonusPresentationPhase.Story&&Elapsed>=Math.Max(0,StoryDuration-3);
  public bool IsActive => Phase!=BonusPresentationPhase.Complete;
  public float StoryDuration {get;}
  public float PhaseDuration => Phase==BonusPresentationPhase.Story?StoryDuration:Phase==BonusPresentationPhase.Result?4:Phase==BonusPresentationPhase.Entrance?(Destination==PlayMode.Normal?2:4):0;
  public float Duration => StoryDuration+4+(Destination==PlayMode.Normal?2:4);
  internal BonusPresentationState(int id,Award award,int paid,PlayMode source){Id=id;Destination=award.next;StoryDuration=award.title=="LAST FLOOR BONUS"?8:award.title=="決意の刃"?8:award.drive?6:3;CompletedAward=new Award{rounds=award.rounds,next=award.next,title=award.title,drive=award.drive};Paid=paid;SourceMode=source;}
  internal void Advance(float dt){
   if(!IsActive||dt<=0)return;
   float remaining=dt;
   while(IsActive&&remaining>0){float step=Math.Min(remaining,PhaseDuration-Elapsed);Elapsed+=step;TotalElapsed+=step;remaining-=step;if(Elapsed>=PhaseDuration){Phase=(BonusPresentationPhase)((int)Phase+1);Elapsed=0;}}
  }
 }
 public sealed class UpperRushResult {
  public int Id {get;} public int Jackpots {get;} public int CompletedDrives {get;} public int Payout {get;}
  internal UpperRushResult(int id,int jackpots,int drives,int payout){Id=id;Jackpots=jackpots;CompletedDrives=drives;Payout=payout;}
 }
}
