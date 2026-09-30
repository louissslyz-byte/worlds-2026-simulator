import {worldsTeamSnapshot} from './teamSnapshot';
import type {SimulationSession} from './types';

export const defaultSeedAssignments=Object.fromEntries(worldsTeamSnapshot.filter(t=>t.officialSeed===null).map(t=>[t.id,t.seed]));
export const seedAssumptionLabel='种子未定：赛前概率暂按 '+worldsTeamSnapshot.filter(t=>t.officialSeed===null).map(t=>`${t.shortName} #${t.seed}`).join('、')+' 模拟，可在创建模拟时调整。';
export function validateSeedAssignments(assignments:Record<string,number>){
 for(const region of ['LCS','CBLOL']){
  const list=worldsTeamSnapshot.filter(t=>t.region===region);
  const seeds=list.map(t=>assignments[t.id]??t.seed);
  if(seeds.some(n=>!Number.isInteger(n)||n<1||n>list.length)||new Set(seeds).size!==list.length)throw Error(`${region} 模拟种子必须完整且不重复`);
 }
}
export function sessionTeams(session:Pick<SimulationSession,'seedAssignments'>){
 return worldsTeamSnapshot.map(t=>{const seed=session.seedAssignments?.[t.id]??t.seed;return {...t,seed,playIn:t.region==='LCS'?seed===3:t.region==='CBLOL'?seed===2:t.playIn}});
}
