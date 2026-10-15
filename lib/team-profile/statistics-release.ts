// Pure schema/packing code; contains no statistics or filesystem paths.
import {z} from 'zod';
import type {StatisticsView} from './statistics-types';
const n=z.number().finite().nullable(),count=z.number().int().nonnegative();
const coverage=z.enum(['COMPLETE','PARTIAL','UNAVAILABLE']);
const metric=z.object({value:n,validGames:count,eligibleGames:count,excludedGames:count,missingGames:count,numerator:n.optional(),denominator:n.optional(),coverageStatus:coverage,source:z.array(z.string().url()),definitionVersion:z.string()}).strict();
const entity=z.object({teamId:z.string(),playerId:z.string().optional(),role:z.string().optional(),sampleGames:count,lowSample:z.boolean().optional(),metrics:z.record(metric)}).strict();
const definition=z.object({id:z.string(),chineseName:z.string(),englishName:z.string(),unit:z.string(),formula:z.string(),explanationZh:z.string(),validSampleRule:z.string(),direction:z.string(),scopeId:z.string(),scopeZh:z.string(),aggregation:z.string(),roles:z.array(z.string()).nullable(),definitionVersion:z.string(),missingValue:z.null()}).strict();
const point=z.object({teamId:z.string(),playerId:z.string().nullable().optional(),displayName:z.string().optional(),value:z.number().finite(),validGames:count,sampleGames:count,lowSample:z.boolean()}).strict();
const baseline=z.object({metric:z.string(),role:z.string().nullable(),value:n,coverageStatus:coverage,regionalAverage:n,regionalPositionalAverage:n,distribution:z.array(point),distributionSummary:z.object({count:count,min:n,median:n,max:n,p10:n,p25:n,p75:n,p90:n}).strict()}).strict();
const draftSection=z.object({validGames:count,missingGames:count,coverageStatus:coverage,stats:z.array(z.object({championId:z.string(),games:count,count:count,useRatePct:z.number().finite()}).strict())}).strict();
const pair=z.object({roles:z.array(z.string()).length(2),validGames:count,missingGames:count,coverageStatus:coverage,stats:z.array(z.object({championIds:z.array(z.string()).length(2),championNames:z.array(z.string()).length(2),games:count,wins:count,winRate:z.number().finite()}).strict())}).strict();
const draft=z.object({mostPicked:draftSection,mostBanned:draftSection,mostBannedAgainst:draftSection,combinations:z.object({MID_JUNGLE:pair,BOT_SUPPORT:pair,TOP_JUNGLE:pair}).strict()}).strict();
const page=z.object({kind:z.enum(['team','player']),region:z.enum(['LCK','LPL','LEC','LCS','LCP','CBLOL']),entity,baselineKey:z.string(),scopeNote:z.string(),draft:draft.optional()}).strict();
export const releaseSchema=z.object({
 metadata:z.object({schemaVersion:z.literal('team-profile-release-v1'),games:z.literal(797),sourceSnapshotDate:z.string(),sourceSha256:z.string().regex(/^[a-f0-9]{64}$/),definitionVersion:z.string(),authorization:z.literal('user-confirmed-web-display'),publicRepositoryDistributionApproved:z.literal(false),rawRedistributionAllowed:z.literal(false)}).strict(),
 pages:z.record(page),baselines:z.record(z.array(baseline)),definitions:z.object({team:z.array(definition),player:z.array(definition)}).strict(),champions:z.record(z.object({id:z.string(),name:z.string()}).strict())
}).strict();
export type ReleaseData=z.infer<typeof releaseSchema>;
export function validateRelease(input:unknown):ReleaseData{
 const data=releaseSchema.parse(input);const entries=Object.entries(data.pages);
 if(entries.filter(([,p])=>p.kind==='team').length!==19||entries.filter(([,p])=>p.kind==='player').length!==95)throw Error('Release must contain 19 teams and 95 player profiles');
 for(const [key,p] of entries){
  const expected=p.kind==='team'?`team:${p.entity.teamId}`:`player:${p.entity.teamId}|${p.entity.playerId}|${p.entity.role}`;
  if(key!==expected||p.baselineKey!==`${p.region}:${p.kind==='team'?'team':p.entity.role}`||!data.baselines[p.baselineKey])throw Error('Invalid release identity/baseline reference');
  for(const metric of Object.keys(p.entity.metrics))if(!data.definitions[p.kind].some(d=>d.id===`${p.kind}.${metric}`))throw Error('Missing metric definition');
  if(p.draft)for(const s of [p.draft.mostPicked,p.draft.mostBanned,p.draft.mostBannedAgainst])for(const x of s.stats)if(!data.champions[x.championId])throw Error('Missing champion identity');
 }
 return data;
}
export function unpackRelease(data:ReleaseData,key:string):StatisticsView|null{
 const p=data.pages[key];if(!p)return null;
 const needed=new Set<string>();
 if(p.draft){for(const s of [p.draft.mostPicked,p.draft.mostBanned,p.draft.mostBannedAgainst])for(const x of s.stats)needed.add(x.championId);for(const s of Object.values(p.draft.combinations))for(const x of s.stats)for(const id of x.championIds)needed.add(id);}
 return {mode:'release',region:p.region,entity:p.entity,baselines:data.baselines[p.baselineKey],definitions:data.definitions[p.kind].filter(d=>d.id.split('.')[1] in p.entity.metrics),snapshotDate:data.metadata.sourceSnapshotDate,scopeNote:p.scopeNote,draft:p.draft,champions:Object.fromEntries([...needed].map(id=>[id,data.champions[id]]))};
}
export function releaseEnabled(env:Record<string,string|undefined>){
 return env.NODE_ENV==='production'&&env.TEAM_STATS_RELEASE_ENABLED==='true'&&(!env.VERCEL||env.VERCEL_ENV==='production')&&(!env.VERCEL_ENV||env.VERCEL_ENV==='production');
}
