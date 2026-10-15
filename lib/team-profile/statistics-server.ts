import 'server-only';
import {readFile,realpath} from 'node:fs/promises';
import {isAbsolute,resolve,relative,sep} from 'node:path';
import {headers} from 'next/headers';
import {localStatisticsEnabled} from './statistics-types';
import {project,type Snapshot} from './statistics-projection';
import {releaseView} from './statistics-release-server';

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
export async function teamStatistics(teamId:string){
 const release=await releaseView(`team:${teamId}`);if(release)return release;
 const data=await localSnapshot();if(!data)return null;
 const identity=data.worldsTeamsById[teamId];if(identity?.status!=='MATCHED')return null;
 const region=identity.region;const record=data.regions[region].teamsById[identity.regionalTeamId];
 if(!record||record.teamId!==teamId)return null;
 return project(data,region,record,data.regionalComparisonsByRegion[region].team,'team',data.regions[region].bpByTeamId[teamId]);
}
export async function playerStatistics(teamId:string,playerId:string,role:string){
 const release=await releaseView(`player:${teamId}|${playerId}|${role}`);if(release)return release;
 const data=await localSnapshot();if(!data)return null;
 const identity=data.worldsPlayersByKey[`${teamId}|${playerId}|${role}`];if(identity?.status!=='MATCHED'||identity.regionalStatKeys.length!==1)return null;
 const region=identity.region;const record=data.regions[region].playerStatsByKey[identity.regionalStatKeys[0]];
 if(!record||record.teamId!==teamId||record.role!==role)return null;
 return project(data,region,record,data.regionalComparisonsByRegion[region].positional.filter(b=>b.role===role),'player');
}
