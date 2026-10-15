import 'server-only';
import {readFile,realpath} from 'node:fs/promises';
import {isAbsolute,resolve,relative,sep} from 'node:path';
import {headers} from 'next/headers';
import {localStatisticsEnabled,scopeNotes,type Entity,type Baseline,type Definition,type Draft,type StatisticsView} from './statistics-types';

type Identity={status:string;region:string;regionalTeamId:string;regionalStatKeys:string[]};
type Snapshot={metadata:{schemaVersion:string;sourceSnapshotDate:string;publicExportAllowed:boolean};regions:Record<string,{teamsById:Record<string,Entity>;playerStatsByKey:Record<string,Entity>;bpByTeamId:Record<string,Draft>}>;worldsTeamsById:Record<string,Identity>;worldsPlayersByKey:Record<string,Identity>;regionalComparisonsByRegion:Record<string,{team:Baseline[];positional:Baseline[]}>;metricDictionary:{metrics:Definition[]};championsById:Record<string,{id:string;name:string}>};
let cached:{path:string;data:Promise<Snapshot>}|undefined;
async function localSnapshot():Promise<Snapshot|null>{
 // Fail closed before headers, filesystem access or rendering in production/builds.
 if(process.env.NODE_ENV!=='development'||process.env.TEAM_STATS_LOCAL!=='1'||process.env.VERCEL||process.env.CI)return null;
 const h=await headers();
 const host=h.get('host')??'';
 // Next itself supplies x-forwarded-* for direct requests. Accept only its
 // loopback-equivalent values; reject externally forwarded requests.
 const forwardedHost=h.get('x-forwarded-host');
 const forwardedFor=h.get('x-forwarded-for');
 const externalForwarding=h.has('forwarded')||Boolean(forwardedHost&&forwardedHost!==host)||Boolean(forwardedFor&&forwardedFor.split(',').some(ip=>!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(ip.trim())));
 if(!localStatisticsEnabled(process.env,host,externalForwarding))return null;
 const path=process.env.TEAM_STATS_SNAPSHOT;
 if(!path||!isAbsolute(path))return null;
 // Require an actual parent-directory segment, not an in-project '..name'.
 // Check both configured and canonical paths so symlinks cannot hide local files.
 const outside=(root:string,file:string)=>{const rel=relative(root,file);return rel==='..'||rel.startsWith(`..${sep}`)||isAbsolute(rel);};
 if(!outside(resolve(process.cwd()),resolve(path)))throw new Error('统计快照必须保存在网站项目之外。');
 const canonicalPath=await realpath(path);
 if(!outside(await realpath(process.cwd()),canonicalPath))throw new Error('统计快照必须保存在网站项目之外。');
 if(!cached||cached.path!==canonicalPath)cached={path:canonicalPath,data:readFile(canonicalPath,'utf8').then(text=>{
  const data=JSON.parse(text) as Snapshot;
  if(data.metadata.schemaVersion!=='six-region-profile-index-v1.0'||data.metadata.publicExportAllowed!==false||Object.keys(data.worldsTeamsById).length!==19||Object.keys(data.worldsPlayersByKey).length!==95)throw new Error('本地统计快照未通过接口校验。');
  return data;
 })};
 return cached.data;
}
function project(data:Snapshot,region:string,entity:Entity,baselines:Baseline[],kind:'team'|'player',draft?:Draft):StatisticsView{
 // Send/render only page-level aggregates. Never include source game IDs,
 // full regional bundles, hero-pool snapshots or private filesystem paths.
 const metrics=Object.fromEntries(Object.entries(entity.metrics).map(([key,m])=>[key,{value:m.value,validGames:m.validGames,eligibleGames:m.eligibleGames,excludedGames:m.excludedGames,missingGames:m.missingGames,coverageStatus:m.coverageStatus,source:m.source,definitionVersion:m.definitionVersion}]));
 const definitions=data.metricDictionary.metrics.filter(m=>m.id.startsWith(kind+'.')&&m.id.split('.')[1] in metrics);
 const needed=new Set<string>();
 if(draft){for(const name of ['mostPicked','mostBanned','mostBannedAgainst'] as const)for(const s of draft[name].stats)needed.add(s.championId);for(const section of Object.values(draft.combinations))for(const s of section.stats)for(const id of s.championIds)needed.add(id);}
 const safeDraft=draft?{
  ...Object.fromEntries((['mostPicked','mostBanned','mostBannedAgainst'] as const).map(k=>[k,{validGames:draft[k].validGames,missingGames:draft[k].missingGames,coverageStatus:draft[k].coverageStatus,stats:draft[k].stats.map(s=>({championId:s.championId,games:s.games,count:s.count,useRatePct:s.useRatePct}))}])),
  combinations:Object.fromEntries(Object.entries(draft.combinations).map(([k,s])=>[k,{roles:s.roles,validGames:s.validGames,missingGames:s.missingGames,coverageStatus:s.coverageStatus,stats:s.stats.map(x=>({championIds:x.championIds,championNames:x.championNames,games:x.games,wins:x.wins,winRate:x.winRate}))}]))
 } as Draft:undefined;
 return {region,entity:{teamId:entity.teamId,playerId:entity.displayName??entity.playerId,role:entity.role,sampleGames:entity.sampleGames,lowSample:entity.lowSample,metrics},baselines:baselines.map(b=>({metric:b.metric,role:b.role,value:b.value,coverageStatus:b.coverageStatus,regionalAverage:b.regionalAverage,regionalPositionalAverage:b.regionalPositionalAverage,distribution:b.distribution.map(p=>({teamId:p.teamId,playerId:p.playerId?.startsWith('oe-player:')?null:p.playerId,displayName:p.playerId&&b.role?data.regions[region].playerStatsByKey[`${p.teamId}|${p.playerId}|${b.role}`]?.displayName:undefined,value:p.value,validGames:p.validGames,sampleGames:p.sampleGames,lowSample:p.lowSample})),distributionSummary:b.distributionSummary})),definitions,snapshotDate:data.metadata.sourceSnapshotDate,scopeNote:scopeNotes[region],draft:safeDraft,champions:Object.fromEntries([...needed].map(id=>[id,data.championsById[id]]))};
}
export async function teamStatistics(teamId:string){
 const data=await localSnapshot();if(!data)return null;
 const identity=data.worldsTeamsById[teamId];if(identity?.status!=='MATCHED')return null;
 const region=identity.region;const record=data.regions[region].teamsById[identity.regionalTeamId];
 if(!record||record.teamId!==teamId)return null;
 return project(data,region,record,data.regionalComparisonsByRegion[region].team,'team',data.regions[region].bpByTeamId[teamId]);
}
export async function playerStatistics(teamId:string,playerId:string,role:string){
 const data=await localSnapshot();if(!data)return null;
 const identity=data.worldsPlayersByKey[`${teamId}|${playerId}|${role}`];if(identity?.status!=='MATCHED'||identity.regionalStatKeys.length!==1)return null;
 const region=identity.region;const record=data.regions[region].playerStatsByKey[identity.regionalStatKeys[0]];
 if(!record||record.teamId!==teamId||record.role!==role)return null;
 return project(data,region,record,data.regionalComparisonsByRegion[region].positional.filter(b=>b.role===role),'player');
}
