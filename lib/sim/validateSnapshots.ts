import {worldsTeamSnapshot,teamSnapshotMetadata} from './teamSnapshot';
import {riotGprSnapshot} from './gprSnapshot';
import type {Team} from './types';
import type {GprEntry} from './riotGpr';
import {validateSeedAssignments,defaultSeedAssignments} from './seedAssignments';

export function validateSnapshots(roster:Team[]=worldsTeamSnapshot,entries:Record<string,GprEntry>=riotGprSnapshot.entries){
 if(roster.length!==19)throw Error('Worlds snapshot must contain 19 teams/seats');
 for(const field of ['id','slug','gprKey'] as const){
  const values=roster.map(t=>t[field]).filter((x):x is string=>Boolean(x));
  if(new Set(values).size!==values.length)throw Error(`Duplicate ${field}`);
 }
 for(const t of roster){
  if(!t.id||!t.name||!t.shortName||!t.slug||!['LCK','LPL','LEC','LCP','LCS','CBLOL'].includes(t.region))throw Error(`Invalid team ${t.id}`);
  if(!Number.isFinite(t.rating)||!t.sourceUrl||!t.snapshotUpdatedAt)throw Error(`Missing strength/provenance ${t.id}`);
  if(t.confirmed&&(!t.gprKey||!t.logo||t.qualificationStatus!=='CONFIRMED'))throw Error(`Missing confirmed team mapping/logo ${t.id}`);
  if(!t.confirmed&&t.gprKey!==null)throw Error(`TBD cannot have official GPR ${t.id}`);
 }
 for(const [key,e] of Object.entries(entries)){
  if(!Number.isInteger(e.rank)||e.rank<=0||!Number.isFinite(e.score)||e.score<=0)throw Error(`Invalid GPR ${key}`);
 }
 validateSeedAssignments(defaultSeedAssignments);
 const confirmed=roster.filter(t=>t.confirmed).length;
 const matched=roster.filter(t=>t.gprKey&&entries[t.gprKey]).length;
 return {confirmed,matched,fallback:roster.length-matched,tbd:roster.length-confirmed,teamSnapshotDate:teamSnapshotMetadata.snapshotUpdatedAt,gprSnapshotDate:riotGprSnapshot.sourceUpdatedAt};
}
