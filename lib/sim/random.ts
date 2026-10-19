import type {SimulationSession} from './types';

// Keep the existing 32-bit LCG. Draw selection uses equal-width high-bit buckets.
export function randomNext(session:SimulationSession):number {
  session.rngState=(Math.imul(session.rngState,1664525)+1013904223)>>>0;
  return session.rngState/4294967296;
}
export function randomIndex(session:SimulationSession,length:number):number {
  if(!Number.isInteger(length)||length<1||length>4294967296)throw Error('随机抽签范围无效');
  const bucket=Math.floor(4294967296/length),limit=bucket*length;
  // Rejection removes finite-integer bucket bias; this never retries a tournament.
  for(let i=0;i<128;i++){
    const value=randomNext(session)*4294967296;
    if(value<limit)return Math.floor(value/bucket);
  }
  throw Error('随机数分桶失败');
}
export function shuffle<T>(items:readonly T[],session:SimulationSession):T[] {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=randomIndex(session,i+1);[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
