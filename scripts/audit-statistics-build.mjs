// Read-only production artifact audit. Does not export the source snapshot or matched values.
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,relative,isAbsolute} from 'node:path';
const snapshot=process.env.TEAM_STATS_SNAPSHOT;
if(!snapshot||!isAbsolute(snapshot))throw new Error('Set the real external TEAM_STATS_SNAPSHOT for canary checks');
const root=process.cwd();const rel=relative(root,resolve(snapshot));
if(rel!== '..'&&!rel.startsWith('../'))throw new Error('Input must be outside the website');
const data=JSON.parse(await readFile(snapshot,'utf8'));
const canaries=new Set(['worlds-six-regions-2026-10-14-v1',snapshot]);
const releaseAudit=process.env.STATISTICS_AUDIT_RELEASE==='1';
if(releaseAudit){
 const {validateRelease}=await import('../lib/team-profile/statistics-release.ts');
 const {createHash}=await import('node:crypto');
 const bytes=await readFile('.team-stats-release/data.json');
 if(createHash('sha256').update(bytes).digest('hex')!==process.env.TEAM_STATS_RELEASE_SHA256)throw new Error('Verified release input required for release audit');
 validateRelease(JSON.parse(bytes));
}
// Approved display values intentionally appear in a release; private identifiers,
// paths, credentials and original research remain forbidden in both audit modes.
if(!releaseAudit)for(const region of Object.values(data.regions))for(const entity of Object.values(region.teamsById))for(const metric of Object.values(entity.metrics)){
 const value=String(metric.value);if(/\d\.\d{8,}/.test(value)&&canaries.size<15)canaries.add(value);
}
async function files(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())out.push(...await files(p));else if(e.isFile())out.push(p);}return out;}
const build=await files(resolve('.next'));
assert.ok(build.some(p=>p.endsWith('/BUILD_ID')),'Run a completed production build first');
assert.ok(!build.some(p=>p.includes('/.next/dev/')),'Do not audit mixed development output as production');
const hits=[];const traceHits=[];const publicHits=[];const absoluteClientPaths=[];
const secrets=[];
try{for(const line of (await readFile('.env.local','utf8')).split('\n')){if(/^\s*#/.test(line)||!line.includes('='))continue;const value=line.slice(line.indexOf('=')+1).trim().replace(/^['"]|['"]$/g,'');if(value.length>30)secrets.push(value);}}catch(error){if(error.code!=='ENOENT')throw error;}
for(const path of build){
 const raw=await readFile(path);
 if([...canaries,...secrets].some(value=>raw.includes(Buffer.from(value))))hits.push(relative(root,path));
 if(path.endsWith('.nft.json')&&/offline-worlds-stats|OraclesElixir|team-profile-data\.json/.test(raw.toString()))traceHits.push(relative(root,path));
 if(path.includes('/.next/static/')&&raw.includes(Buffer.from('/Users/')))absoluteClientPaths.push(relative(root,path));
}
for(const path of await files(resolve('public')))if(/(?:\.csv$|team-profile-data\.json$|OraclesElixir|p3[ab].*review)/i.test(path))publicHits.push(relative(root,path));
const result={releaseAudit,filesScanned:build.length,canariesChecked:canaries.size,privateOrSecretHits:hits,traceHits,publicHits,absoluteClientPaths,sourceMapsScanned:build.filter(p=>p.endsWith('.map')).length,productionBuildPresent:(await stat('.next/BUILD_ID')).isFile()};
console.log(JSON.stringify(result,null,2));
assert.ok(!hits.length&&!traceHits.length&&!publicHits.length&&!absoluteClientPaths.length,'Production privacy audit failed');
