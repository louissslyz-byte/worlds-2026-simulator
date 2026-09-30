import {riotGprSnapshot} from './gprSnapshot';
import {GprProbabilityModel} from './gprProbability';
import type {Team} from './types';

export type GprEntry={rank:number;score:number};
export type GprDataStatus='CACHED'|'FALLBACK';

export class RiotGprProvider {
 constructor(private snapshot: {entries:Record<string,GprEntry>;sourceUrl:string;sourceUpdatedAt:string;strengthVersion:string}=riotGprSnapshot){}
 get(teamId:string):GprEntry|null {
  const entry=this.snapshot.entries[teamId];
  return entry&&Number.isFinite(entry.rank)&&Number.isFinite(entry.score)&&Number.isInteger(entry.rank)&&entry.rank>0&&entry.score>0?entry:null;
 }
 get status():GprDataStatus {return Object.keys(this.snapshot.entries).some(id=>this.get(id)!==null)?'CACHED':'FALLBACK'}
 get source(){return this.snapshot.sourceUrl}
 get updatedAt(){return this.snapshot.sourceUpdatedAt}
 get strengthVersion(){return this.snapshot.strengthVersion}
}

export class GprRatingAdapter {
 constructor(private provider=new RiotGprProvider()){}
 rating(team:Team):number {
  const entry=team.gprKey?this.provider.get(team.gprKey):null;
  if(!entry)return team.rating;
  return new GprProbabilityModel().toInternalStrength(entry.score);
 }
 source(team:Team):'RIOT_GPR'|'FALLBACK' {return (team.gprKey?this.provider.get(team.gprKey):null)?'RIOT_GPR':'FALLBACK'}
}
