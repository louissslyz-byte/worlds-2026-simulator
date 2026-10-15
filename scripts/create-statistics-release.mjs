// Explicit local conversion. Never recomputes statistics or edits the source.
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {relative,isAbsolute,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {project} from '../lib/team-profile/statistics-projection.ts';
import {validateRelease,unpackRelease} from '../lib/team-profile/statistics-release.ts';
import {profileTeams,profileRoster} from '../lib/team-profile/data.ts';
const [input,output]=process.argv.slice(2);if(!input||!output||!isAbsolute(input)||!isAbsolute(output))throw Error('Explicit external input and output paths required');
const root=await realpath('.'),outside=p=>{const r=relative(root,p);return r==='..'||r.startsWith('../')||isAbsolute(r);};
assert.ok(outside(await realpath(input)));await mkdir(dirname(output),{recursive:true});assert.ok(outside(await realpath(dirname(output))));
const bytes=await readFile(input),source=JSON.parse(bytes);assert.equal(source.metadata.schemaVersion,'six-region-profile-index-v1.0');assert.equal(source.metadata.games,797);
const data={metadata:{schemaVersion:'team-profile-release-v1',games:797,sourceSnapshotDate:source.metadata.sourceSnapshotDate,sourceSha256:createHash('sha256').update(bytes).digest('hex'),definitionVersion:source.metadata.definitionVersion,authorization:'user-confirmed-web-display',publicRepositoryDistributionApproved:false,rawRedistributionAllowed:false},pages:{},baselines:{},definitions:{team:[],player:[]},champions:{}};
const originals=new Map();
function add(key,kind,view){
 const baselineKey=`${view.region}:${kind==='team'?'team':view.entity.role}`;
 if(data.baselines[baselineKey])assert.deepEqual(data.baselines[baselineKey],view.baselines);else data.baselines[baselineKey]=view.baselines;
 data.pages[key]={kind,region:view.region,entity:view.entity,baselineKey,scopeNote:view.scopeNote,...(view.draft?{draft:view.draft}:{})};
 for(const definition of view.definitions)if(!data.definitions[kind].some(d=>d.id===definition.id))data.definitions[kind].push(definition);
 Object.assign(data.champions,view.champions);originals.set(key,JSON.parse(JSON.stringify(view)));
}
for(const team of profileTeams){
 const identity=source.worldsTeamsById[team.id];assert.equal(identity.status,'MATCHED');assert.equal(identity.region,team.region);
 const region=source.regions[team.region];add(`team:${team.id}`,'team',project(source,team.region,region.teamsById[identity.regionalTeamId],source.regionalComparisonsByRegion[team.region].team,'team',region.bpByTeamId[team.id]));
 for(const {player} of profileRoster(team.id).slots){
  const key=`${team.id}|${player.playerId}|${player.role}`,id=source.worldsPlayersByKey[key];assert.equal(id.status,'MATCHED');assert.equal(id.regionalStatKeys.length,1);
  const record=region.playerStatsByKey[id.regionalStatKeys[0]];assert.equal(record.teamId,team.id);assert.equal(record.role,player.role);assert.equal(record.displayName,player.playerId);
  add(`player:${key}`,'player',project(source,team.region,record,source.regionalComparisonsByRegion[team.region].positional.filter(b=>b.role===player.role),'player'));
 }
}
for(const kind of ['team','player'])data.definitions[kind]=source.metricDictionary.metrics.filter(d=>data.definitions[kind].some(existing=>existing.id===d.id));
validateRelease(data);
for(const [key,view] of originals){const actual=unpackRelease(data,key);delete actual.mode;assert.deepEqual(JSON.parse(JSON.stringify(actual)),view);}
// Preserve the fixed source/identity traversal and all display array ordering.
const text=JSON.stringify(data)+'\n';
if(/sourceGameId|missingGameIds|excludedGameIds|oe-player:|oe:player:|\/Users\/|OraclesElixir\.csv/.test(text))throw Error('Unexpected private source fields in release');
try{await writeFile(output,text,{flag:'wx',mode:0o600});}catch(error){if(error.code!=='EEXIST'||await readFile(output,'utf8')!==text)throw error;}
const manifest={schemaVersion:data.metadata.schemaVersion,sourceSha256:data.metadata.sourceSha256,sha256:createHash('sha256').update(text).digest('hex'),bytes:Buffer.byteLength(text),teams:19,players:95,viewsCompared:originals.size,games:797,publicRepositoryDistributionApproved:false};
await writeFile(output+'.manifest.json',JSON.stringify(manifest,null,2)+'\n',{mode:0o600});console.log(JSON.stringify(manifest,null,2));
