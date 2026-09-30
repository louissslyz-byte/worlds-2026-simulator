import {ratingConfig} from './ratingConfig';

/** Same logistic used by the existing engine, with GPR as the input. */
export class GprProbabilityModel {
 constructor(readonly k:number=ratingConfig.gpr.scoreScale){
  if(!Number.isFinite(k)||k<=0)throw Error('GPR scale must be positive');
 }
 toInternalStrength(score:number){
  if(!Number.isFinite(score)||score<=0)throw Error('Invalid GPR score');
  return ratingConfig.gpr.referenceRating+(score-ratingConfig.gpr.referenceScore)*this.k;
 }
 probability(scoreA:number,scoreB:number){
  const delta=this.toInternalStrength(scoreA)-this.toInternalStrength(scoreB);
  return 1/(1+10**(-delta/ratingConfig.eloDivisor));
 }
}
