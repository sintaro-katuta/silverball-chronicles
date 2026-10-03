using System;
using UnityEngine;
using Yozora;
using PlayMode=Yozora.PlayMode;
public static class YozoraLongRunValidation {
 static void Require(bool condition,string message){if(!condition)throw new Exception("RULE AUDIT: "+message);}
 public static void Run(){
  PayoutUnits();AwardBoundaries();PresentationIndependence();LongRun();DistributionSmoke();
  Debug.Log("YOZORA_LONG_RUN_PASS: payout units / award boundaries / presentation isolation / 20000 completed spins / seeded distribution samples");
 }
 static void PayoutUnits(){
  var r=new YozoraRules(121);r.SetDemo("drive");
  Require(r.BonusProgress.UnitTargetPayout==1500&&r.BonusProgress.RevealedPayout==1500,"first DRIVE unit leaks total");
  for(int i=0;i<99;i++)r.CountBonus();
  Require(r.BonusProgress.UnitIndex==1&&r.BonusProgress.UnitPaid==1485&&r.BonusProgress.RoundInUnit==10&&r.BonusProgress.CountInRound==9,"unit one final count");
  r.CountBonus();Require(r.BonusProgress.UnitIndex==2&&r.BonusProgress.UnitPaid==0&&r.BonusProgress.RevealedPayout==3000,"unit boundary");
  Require(r.AnnounceBonusUnits(3)&&r.BonusProgress.RevealedPayout==4500,"explicit observed announcement");
  r.AnnounceBonusUnits(int.MaxValue);Require(r.BonusProgress.RevealedPayout==4500,"announcement cannot exceed selected award");
  for(int i=100;i<300;i++)r.CountBonus();
  Require(r.Bonus==null&&r.BonusPaid==4500&&r.TotalBonusPaid==4500&&r.IsBonusPresentationPending&&r.Remaining==0,"all three units paid before deferred mode entry");
  Require(!r.CountBonus()&&!r.AnnounceBonusUnits(1),"closed bonus is immutable");
  var small=new YozoraRules(122);small.SetDemo("bonus");Require(small.BonusProgress.UnitTargetPayout==300&&small.BonusProgress.RevealedPayout==300,"2R unit must be 300");
 }
 static void AwardBoundaries(){
  double[] normal={0,.499999,.5,.984999,.985,.999999};
  foreach(double n in normal){int calls=0;var a=YozoraRules.DrawAward(PlayMode.Normal,()=>calls++==0?n:0);Require(a.next==(n<.5?PlayMode.Normal:n<.985?PlayMode.SwordRush:PlayMode.WarOfUnderworld),"initial mode threshold");Require(a.Payout==(n<.985?300:3000),"initial minimum payout threshold");}
  var a45=YozoraRules.DrawAward(PlayMode.SwordRush,()=>.45);Require(a45.next==PlayMode.SwordRush&&a45.title=="決意の刃","decision failure boundary");
  var a78=YozoraRules.DrawAward(PlayMode.SwordRush,()=>.78);Require(a78.next==PlayMode.WarOfUnderworld&&!a78.drive,"decision upgrade boundary");
  int index=0;var a89=YozoraRules.DrawAward(PlayMode.SwordRush,()=>index++==0?.89:0);Require(a89.drive&&a89.Payout==3000,"base 1500 plus DRIVE minimum");
  index=0;var a60=YozoraRules.DrawAward(PlayMode.WarOfUnderworld,()=>index++==0?.6:0);Require(a60.drive&&a60.Payout==1500,"WoU DRIVE has no extra opening unit");
  double[] cuts={.081999,.082,.362999,.363,.723999,.724,.930999,.931,.974999,.975,.989999};int[] expected={1,2,2,3,3,4,4,5,5,6,6};
  for(int i=0;i<cuts.Length;i++){double value=cuts[i];Require(YozoraRules.Drive(()=>value)==expected[i],"DRIVE cumulative boundary "+value);}
 }
 static void PresentationIndependence(){
  var a=new YozoraRules(27182,11);var b=new YozoraRules(27182,928);
  for(int i=0;i<15000;i++){
   if(a.Bonus!=null){Require(b.Bonus!=null&&a.Bonus.Payout==b.Bonus.Payout&&a.Bonus.next==b.Bonus.next,"presentation RNG changes award");while(a.Bonus!=null){a.CountBonus();b.CountBonus();}}
   if(a.IsBonusPresentationPending){a.Tick(10000);b.Tick(10000);}
   bool right=a.Mode!=PlayMode.Normal;Require(a.Enter(right)==b.Enter(right),"presentation changes admission");
   var ta=a.Holds.Peek();var tb=b.Holds.Peek();Require(ta.win==tb.win&&ta.enteredMode==tb.enteredMode,"presentation RNG changes lottery");
   a.Tick(10000);b.Tick(10000);Require(a.Mode==b.Mode&&a.Remaining==b.Remaining&&a.Payout==b.Payout,"presentation changes game state");
  }
 }
 static void LongRun(){
  var input=new System.Random(20260926);var r=new YozoraRules(314159,161803);int loops=0,bonuses=0;
  while(r.Starts<20000){
   Require(++loops<1000000,"simulation did not converge");
   if(r.Stock<64)r.Supply();
   int shots=input.Next(1,4);for(int i=0;i<shots;i++)r.Shoot();
   if(r.Bonus!=null){int counts=input.Next(1,11);for(int i=0;i<counts;i++){bool active=r.Bonus!=null;bool paid=r.CountBonus();Require(paid==active,"bonus count accepted after closure");if(active&&r.Bonus==null)bonuses++;}}
   else if(r.IsBonusPresentationPending){r.Tick(10000);}
   else {int arrivals=input.Next(1,7);for(int i=0;i<arrivals;i++)r.ReceiveStart(input.NextDouble()<.05?r.Mode==PlayMode.Normal:r.Mode!=PlayMode.Normal);r.Tick(10000);}
   Require(r.Stock==2500+r.SuppliedBalls+r.Payout-r.Shots,"stock conservation");
   Require(r.Payout==r.StartPrizePaid+r.TotalBonusPaid,"payout ledger conservation");
   Require(r.TotalBonusPaid%15==0&&r.BonusPaid==r.BonusCount*15,"15 balls per attacker count");
   Require(r.AcceptedEntries==r.Starts+r.Holds.Count+(r.Active==null?0:1)+r.DiscardedHolds,"accepted ticket conservation across modes");
   Require(r.Holds.Count<=YozoraRules.HoldCapacity&&r.Remaining>=0,"queue/ST range");
   if(r.Mode!=PlayMode.Normal&&r.Bonus==null)Require(r.Holds.Count+(r.Active==null?0:1)<=r.Remaining,"admitted more tickets than ST remaining");
  }
  Debug.Log($"YOZORA_LONG_RUN_METRICS starts={r.Starts} jackpots={r.Jackpots} completedBonuses={bonuses} shots={r.Shots} paid={r.Payout} accepted={r.AcceptedEntries} discardedOnModeChange={r.DiscardedHolds}");
 }
 static void DistributionSmoke(){
  var rng=new System.Random(8675309);const int n=100000;int normal=0,rush=0,direct=0;long units=0;
  for(int i=0;i<n;i++){var award=YozoraRules.DrawAward(PlayMode.Normal,rng.NextDouble);if(award.next==PlayMode.Normal)normal++;else if(award.next==PlayMode.SwordRush)rush++;else direct++;units+=YozoraRules.Drive(rng.NextDouble);}
  Require(Math.Abs(normal/(double)n-.5)<.012&&Math.Abs(rush/(double)n-.485)<.012&&Math.Abs(direct/(double)n-.015)<.003,"seeded initial award distribution");
  double expected=(.082+2*.281+3*.361+4*.207+5*.044+6*.015+5*.01)/.99;
  Require(Math.Abs(units/(double)n-expected)<.035,"DRIVE mean including recursive tail");
  Debug.Log($"YOZORA_DISTRIBUTION_SAMPLE n={n} normal={normal} rush={rush} direct={direct} driveMean={units/(double)n:F5} expected={expected:F5}");
 }
}
