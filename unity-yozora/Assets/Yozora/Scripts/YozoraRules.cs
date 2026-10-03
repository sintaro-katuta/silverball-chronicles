using System;
using System.Collections.Generic;
namespace Yozora {
 public enum PlayMode { Normal, SwordRush, WarOfUnderworld }
 [Serializable] public class Award { public int rounds; public PlayMode next; public string title; public bool drive; public int Payout => rounds*150; }
 public class Ticket { public PlayMode enteredMode; public bool win, reach; public Award award; public int digit; public float elapsed, duration; }
 public sealed class YozoraRules {
  readonly Random lottery, presentation;
  int presentationId, upperSessionId;bool upperSessionActive;
  public bool IsPaused {get;private set;}
  public void SetPaused(bool paused){IsPaused=paused;}
  public BonusPresentationState BonusPresentation {get;private set;}
  public bool IsBonusPresentationPending => BonusPresentation!=null&&BonusPresentation.IsActive;
  public int CompletedDriveCount {get;private set;}
  public int SessionJackpots {get;private set;}
  public int SessionPayout {get;private set;}
  public UpperRushResult LastUpperRushResult {get;private set;}
  public const double NormalDenominator=199.9, RightDenominator=51.6;
  public const int HoldCapacity=4, RoundCount=10, AttackerPrize=15;
  public int AcceptedEntries {get;private set;}
  public int DiscardedHolds {get;private set;}
  public int SuppliedBalls {get;private set;}
  public int StartPrizePaid {get;private set;}
  public int TotalBonusPaid {get;private set;}
  int announcedBonusPayout;
  public BonusProgress BonusProgress => new BonusProgress(Bonus,BonusCount,BonusPaid,announcedBonusPayout);
  public bool AnnounceBonusUnits(int cumulativeUnits){if(Bonus==null||cumulativeUnits<1)return false;announcedBonusPayout=Math.Max(announcedBonusPayout,(int)Math.Min(Bonus.Payout,(long)cumulativeUnits*1500));return true;}
  public PlayMode Mode { get; private set; }
  public int Stock { get; private set; } = 2500;
  public int Payout { get; private set; }
  public int Shots { get; private set; }
  public int Starts { get; private set; }
  public int Jackpots { get; private set; }
  public int Remaining { get; private set; }
  public int BonusCount { get; private set; }
  public int BonusPaid { get; private set; }
  public Award Bonus { get; private set; }
  public Ticket Active { get; private set; }
  public readonly Queue<Ticket> Holds = new Queue<Ticket>();
  public int[] Digits = {6,2,5};
  public string Message = "左打ちでスタート";
  public event Action<string> Event;
  public YozoraRules(int seed=0) : this(seed==0?Environment.TickCount:seed,seed==0?Environment.TickCount^0x713:seed+71) {}
  public YozoraRules(int lotterySeed,int presentationSeed) {lottery=new Random(lotterySeed);presentation=new Random(presentationSeed);}
  public static int Drive(Func<double> random) {
   int units=0;
   for(int i=0;i<1000;i++) { double n=random();
    if(n<.082)return units+1;if(n<.363)return units+2;if(n<.724)return units+3;if(n<.931)return units+4;if(n<.975)return units+5;if(n<.99)return units+6;units+=5;
   } throw new InvalidOperationException("Nonterminating DRIVE random source");
  }
  public static Award DrawAward(PlayMode mode, Func<double> random) {
   double n=random();
   if(mode==PlayMode.Normal) {
    if(n<.5)return new Award{rounds=2,next=PlayMode.Normal,title="LAST FLOOR BONUS"};
    if(n<.985)return new Award{rounds=2,next=PlayMode.SwordRush,title="LAST FLOOR BONUS"};
    return new Award{rounds=10*(1+Drive(random)),next=PlayMode.WarOfUnderworld,title="ぼくの英雄",drive=true};
   }
   if(mode==PlayMode.SwordRush) {
    if(n<.45)return new Award{rounds=10,next=mode,title="BONUS"};
    if(n<.78)return new Award{rounds=10,next=mode,title="決意の刃"};
    if(n<.89)return new Award{rounds=10,next=PlayMode.WarOfUnderworld,title="決意の刃"};
    return new Award{rounds=10*(1+Drive(random)),next=PlayMode.WarOfUnderworld,title="咲け、花たち",drive=true};
   }
   return new Award{rounds=n<.6?10:10*Drive(random),next=mode,title=n<.6?"BONUS":"SWORD DRIVE",drive=n>=.6};
  }
  public bool Shoot(){if(IsPaused||Stock<=0)return false;Stock--;Shots++;return true;}
  public void Supply(){Stock+=250;SuppliedBalls+=250;}
  public bool Enter(bool right=false, bool? force=null) {
   if(IsPaused||Bonus!=null||IsBonusPresentationPending || right!=(Mode!=PlayMode.Normal))return false;
   if(Holds.Count>=HoldCapacity || (Mode!=PlayMode.Normal && Holds.Count+(Active!=null?1:0)>=Remaining))return false;
   bool win=force ?? lottery.NextDouble()<1/(Mode==PlayMode.Normal?NormalDenominator:RightDenominator);
   bool reach=win||presentation.NextDouble()<.075;
   var award=win?DrawAward(Mode,lottery.NextDouble):null;
   int digit=presentation.Next(1,7);
   if(Mode==PlayMode.Normal&&win){if(award.drive)digit=7;else if(award.next==PlayMode.Normal){int[] ordinary={1,2,4,5,6};digit=ordinary[presentation.Next(ordinary.Length)];}}
   AcceptedEntries++;Holds.Enqueue(new Ticket{enteredMode=Mode,win=win,reach=reach,award=award,digit=digit,duration=reach?ReferenceSequenceTimeline.Duration(Mode):Mode==PlayMode.Normal?3.2f:1.1f});
   Event?.Invoke("entry");return true;
  }
  public void ReceiveStart(bool right=false){if(IsPaused)return;Stock++;Payout++;StartPrizePaid++;Enter(right);}
  public void Tick(float dt) {
   if(float.IsNaN(dt)||float.IsInfinity(dt)||dt<0)throw new ArgumentOutOfRangeException(nameof(dt));
   if(IsPaused)return;
   if(IsBonusPresentationPending){BonusPresentation.Advance(dt);if(!BonusPresentation.IsActive)CommitBonusPresentation();return;}
   if(Bonus!=null)return;
   if(Active==null&&Holds.Count>0) {Active=Holds.Dequeue();Event?.Invoke("spin");}
   if(Active==null)return;Active.elapsed+=dt;
   if(Active.elapsed<Active.duration)return;
   Ticket t=Active;Active=null;Starts++;if(Mode!=PlayMode.Normal)Remaining--;
   Digits=new[]{t.digit,t.win?t.digit:1+(t.digit+2)%6,t.digit};
   if(t.win){Bonus=t.award;BonusCount=BonusPaid=announcedBonusPayout=0;Jackpots++;if(upperSessionActive)SessionJackpots++;Message=Bonus.title;Event?.Invoke("win");}
   else if(Mode!=PlayMode.Normal&&Remaining==0){EndUpperSession();Mode=PlayMode.Normal;DiscardHolds();Message="左打ちに戻してください";Event?.Invoke("end");}
   else Event?.Invoke("miss");
  }
  public bool CountBonus(){
   if(IsPaused||Bonus==null)return false;
   Stock+=AttackerPrize;Payout+=AttackerPrize;BonusPaid+=AttackerPrize;TotalBonusPaid+=AttackerPrize;BonusCount++;if(upperSessionActive)SessionPayout+=AttackerPrize;Event?.Invoke("payout");
   if(BonusCount>=Bonus.rounds*10){if(upperSessionActive&&Bonus.drive)CompletedDriveCount++;BonusPresentation=new BonusPresentationState(++presentationId,Bonus,BonusPaid,Mode);Bonus=null;Message="結果告知待機";Event?.Invoke("bonus-paid");}
   return true;
  }
  void CommitBonusPresentation(){
   var old=Mode;Mode=BonusPresentation.Destination;Remaining=Mode==PlayMode.Normal?0:Mode==PlayMode.SwordRush?53:70;if(old!=Mode)DiscardHolds();
   if(old==PlayMode.WarOfUnderworld&&Mode!=old)EndUpperSession();if(Mode==PlayMode.WarOfUnderworld&&old!=Mode)BeginUpperSession();
   Message=Mode==PlayMode.Normal?"左打ちに戻してください":Mode==PlayMode.SwordRush?"SWORD RUSH":"War of Underworld";Event?.Invoke("bonus-presentation-complete");Event?.Invoke("mode");
  }
  void BeginUpperSession(){upperSessionActive=true;upperSessionId++;CompletedDriveCount=SessionJackpots=SessionPayout=0;LastUpperRushResult=null;}
  void EndUpperSession(){if(!upperSessionActive)return;upperSessionActive=false;LastUpperRushResult=new UpperRushResult(upperSessionId,SessionJackpots,CompletedDriveCount,SessionPayout);}
  void DiscardHolds(){DiscardedHolds+=Holds.Count;Holds.Clear();}
  public void SetDemo(string mode) {
   if(mode=="rush"||mode=="wou"){Mode=mode=="rush"?PlayMode.SwordRush:PlayMode.WarOfUnderworld;Remaining=mode=="rush"?53:70;if(Mode==PlayMode.WarOfUnderworld)BeginUpperSession();}
   else if(mode=="bonus"||mode=="drive"){Bonus=new Award{rounds=mode=="drive"?30:2,next=mode=="drive"?PlayMode.WarOfUnderworld:PlayMode.SwordRush,title=mode=="drive"?"SWORD DRIVE":"LAST FLOOR BONUS",drive=mode=="drive"};Jackpots=1;}
   else {Enter(false,mode!="miss");var t=Holds.Peek();if(mode=="zero"||mode=="eight")t.digit=mode=="zero"?0:8;t.reach=true;t.duration=ReferenceSequenceTimeline.Duration(Mode);}
  }
 }
}
