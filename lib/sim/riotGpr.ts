import {riotGprSnapshot} from './gprSnapshot';
import {ratingConfig} from './ratingConfig';
import type {Team} from './types';

export type GprEntry={rank:number;score:number};
export type GprDataStatus='CACHED'|'FALLBACK';

export class RiotGprProvider {
 constructor(private snapshot: {entries:Record<string,GprEntry>;sourceUrl:string;sourceUpdatedAt:string;strengthVersion:string}=riotGprSnapshot){}
 get(teamId:string):GprEntry|null {
  const entry=this.snapshot.entries[teamId];
  return entry&&Number.isFinite(entry.rank)&&Number.isFinite(entry.score)&&entry.rank>0?entry:null;
 }
 get status():GprDataStatus {return Object.keys(this.snapshot.entries).some(id=>this.get(id)!==null)?'CACHED':'FALLBACK'}
 get source(){return this.snapshot.sourceUrl}
 get updatedAt(){return this.snapshot.sourceUpdatedAt}
 get strengthVersion(){return this.snapshot.strengthVersion}
}

export class GprRatingAdapter {
 constructor(private provider=new RiotGprProvider()){}
 rating(team:Team):number {
  const entry=this.provider.get(team.id);
  if(!entry)return team.rating;
  const {referenceScore,referenceRating,scoreScale}=ratingConfig.gpr;
  return Math.round((referenceRating+(entry.score-referenceScore)*scoreScale)*10)/10;
 }
 source(team:Team):'RIOT_GPR'|'FALLBACK' {return this.provider.get(team.id)?'RIOT_GPR':'FALLBACK'}
}
