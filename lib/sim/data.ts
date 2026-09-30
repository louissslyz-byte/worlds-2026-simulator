import type {Team,Match} from './types';
import {worlds2026} from './worlds2026';
import {RiotGprProvider} from './riotGpr';

import {worldsTeamSnapshot,teamSnapshotMetadata} from './teamSnapshot';
const gpr=new RiotGprProvider();
export const TEAMS_UPDATED_AT=teamSnapshotMetadata.snapshotUpdatedAt;
export const teams:Team[]=worldsTeamSnapshot.map(team=>{
 const official=team.gprKey?gpr.get(team.gprKey):null;
 return {...team,...(official?{officialGprRank:official.rank,officialGprScore:official.score,gprUpdatedAt:gpr.updatedAt,gprSource:gpr.source}:{})};
});
export interface EsportsDataProvider { getTeams():Team[]; getMatches():Match[]; getTournament():typeof worlds2026 }
export class StaticDataProvider implements EsportsDataProvider { getTeams(){return teams} getMatches(){return []} getTournament(){return worlds2026} }
export const teamById = (id:string)=>teams.find(t=>t.id===id);
