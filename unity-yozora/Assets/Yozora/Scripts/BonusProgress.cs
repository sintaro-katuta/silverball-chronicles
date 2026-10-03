using System;
namespace Yozora {
 /// <summary>Presentation-safe view of the currently opened maximum-10R payout unit. Does not expose future units.</summary>
 public readonly struct BonusProgress {
  public readonly int UnitIndex, UnitTargetPayout, UnitPaid, RoundInUnit, CountInRound, RevealedPayout;
  public readonly bool IsActive;
  public BonusProgress(Award award,int counts,int paid,int announcedPayout=0){
   IsActive=award!=null;
   if(award==null){UnitIndex=UnitTargetPayout=UnitPaid=RoundInUnit=CountInRound=RevealedPayout=0;return;}
   int unit=Math.Min(counts/100,(award.rounds-1)/10);
   int unitRounds=Math.Min(10,award.rounds-unit*10);
   UnitIndex=unit+1;UnitTargetPayout=unitRounds*150;UnitPaid=Math.Max(0,paid-unit*1500);
   RoundInUnit=Math.Min(unitRounds,(counts-unit*100)/10+1);CountInRound=counts%10;
   RevealedPayout=Math.Max(unit*1500+UnitTargetPayout,Math.Min(award.Payout,announcedPayout));
  }
 }
}
