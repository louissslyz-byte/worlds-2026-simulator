import {gameProbability,seriesProbability} from '../sim/ratings';
/** Presentation-only series probabilities; scores and winners never affect the forecast. */
export function matchPrediction(match:{stage:string;a:string;b:string;bestOf:number},preseason:Record<string,number>,knockout:Record<string,number>,knockoutDate:string){
 const ratings=match.stage==='KNOCKOUT'?knockout:preseason;
 if(![1,3,5].includes(match.bestOf))throw Error('Unsupported match format');
 if(!Number.isFinite(ratings[match.a])||!Number.isFinite(ratings[match.b]))throw Error('Missing match prediction rating');
 const a=seriesProbability(gameProbability(ratings[match.a],ratings[match.b]),match.bestOf as 1|3|5);
 return {a,b:1-a,basis:match.stage==='KNOCKOUT'?`${knockoutDate} GPR`:'赛前 GPR'};
}
