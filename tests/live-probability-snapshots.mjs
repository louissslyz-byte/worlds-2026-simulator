// Real archived 100k counts. Tests mutate temporary copies only.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm,cp,symlink,mkdir,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {validateProbabilityHistory,archiveDirectory,saveCandidate} from '../lib/live/probability/archive.ts';
import {validateProbabilitySnapshot,countsFromSnapshot} from '../lib/live/probability/snapshot.ts';
import {verifiedA1} from '../lib/live/probability/adapter.ts';
import {generatorSourceSHA256,sha256,semanticSHA256} from '../lib/live/probability/model.ts';
import {EVENTS,LIVE_ODDS,GENERATOR_FILES} from '../lib/live/probability/config.ts';
import {assertEventCounts} from '../lib/sim/validation.ts';
const history=await validateProbabilityHistory(),official=await verifiedA1(),sourceSHA=await generatorSourceSHA256();
const {pre,post,model,index}=history;
assert.equal(pre.simulationCount,100000);assert.equal(post.simulationCount,100000);assert.equal(pre.failedCount,0);assert.equal(post.failedCount,0);
assert.equal(pre.calculation.method,'REUSED_R1_VERIFIED');assert.equal(post.calculation.method,'SHARED_ENGINE_RUN');
assertEventCounts(countsFromSnapshot(pre),100000);assertEventCounts(countsFromSnapshot(post),100000);
for(const snapshot of [pre,post]){
 assert.equal(snapshot.teams.length,19);
 for(const team of snapshot.teams)for(const event of EVENTS)assert.equal(team[`${event}Probability`],team[`${event}Count`]/100000);
}
for(const team of post.teams){const qualified=official.state.swissParticipants.includes(team.teamId);assert.equal(team.swissCount,qualified?100000:0);if(!qualified)for(const event of EVENTS)assert.equal(team[`${event}Count`],0);}
for(const row of history.comparison.teams)for(const event of EVENTS){const m=row.events[event];assert.equal(m.deltaPercentagePoints,(m.postCount-m.preCount)*100/100000);}
assert.equal(pre.frozenModelSHA256,post.frozenModelSHA256);assert.equal(pre.ratingInputSHA256,LIVE_ODDS.ratingInputSHA256);assert.equal(pre.ratingInputSHA256,post.ratingInputSHA256);
for(const file of GENERATOR_FILES)assert.equal(sha256(execFileSync('git',['show',`${post.generatorCommit}:${file}`])),sha256(await readFile(file)),'Generator commit must match executed source');
let rejects=0;
for(const change of [
 s=>s.simulationCount=99999,s=>s.completedCount=99999,s=>s.failedCount=1,s=>s.teams.pop(),s=>s.teams[0].teamId=s.teams[1].teamId,
 s=>s.rulesVersion='legacy',s=>s.stateVersion='old',s=>s.ratingInputSHA256='0'.repeat(64),s=>s.strengthVersion='latest-gpr',s=>s.modelVersion='another-model',
 s=>s.factsInputSHA256='0'.repeat(64),s=>s.factsSnapshotId='another-facts-version',s=>s.knownDrawIds=[],
 s=>s.teams.find(t=>t.teamId==='KC').swissCount=99999,s=>s.teams.find(t=>t.teamId==='C9').swissCount=1,
 s=>s.teams[0].championProbability+=0.001,s=>s.teams[0].championCount++,s=>s.teams[0].championCount=100001,
 s=>s.teams[0].swissCount=null,s=>s.simulationInputSHA256='0'.repeat(64),s=>s.countSHA256='0'.repeat(64),s=>s.randomSeed=1,
 s=>s.generatedAt='2026-10-18T00:00:00.000Z',s=>s.rawGames=[],
]){const copy=structuredClone(post);change(copy);assert.throws(()=>validateProbabilitySnapshot(copy,model,official,sourceSHA));rejects++;}
const factsChanged=structuredClone(official);factsChanged.data.matches.playIn[0].scoreB=1;assert.throws(()=>validateProbabilitySnapshot(post,model,factsChanged,sourceSHA));rejects++;
const temp=await mkdtemp(join(tmpdir(),'live-probability-archive-test-'));
const archivedBefore=await readFile(new URL('index.json',archiveDirectory));
async function copyArchive(name){const path=join(temp,name);await cp(archiveDirectory,path,{recursive:true});return path;}
try{
 let path=await copyArchive('checksum');const target=join(path,'post-play-in-v1.json');await writeFile(target,(await readFile(target,'utf8'))+' ');await assert.rejects(()=>validateProbabilityHistory(path));rejects++;
 path=await copyArchive('index');let manifest=JSON.parse(await readFile(join(path,'index.json'),'utf8'));manifest.snapshots.reverse();await writeFile(join(path,'index.json'),JSON.stringify(manifest));await assert.rejects(()=>validateProbabilityHistory(path));rejects++;
 path=await copyArchive('extras');await writeFile(join(path,'research-fixture.json'),'{}');await assert.rejects(()=>validateProbabilityHistory(path),/seven approved/);rejects++;
 path=await copyArchive('symlink');await rm(join(path,'comparison-v1.csv'));await symlink(fileURLToPath(new URL('comparison-v1.csv',archiveDirectory)),join(path,'comparison-v1.csv'));await assert.rejects(()=>validateProbabilityHistory(path),/seven approved/);rejects++;
 path=await copyArchive('model');const modelFile=join(path,'frozen-system-v1.json'),badModel=JSON.parse(await readFile(modelFile,'utf8'));badModel.ratings.KC++;const bytes=JSON.stringify(badModel);await writeFile(modelFile,bytes);manifest=JSON.parse(await readFile(join(path,'index.json'),'utf8'));manifest.frozenModel.sha256=sha256(bytes);await writeFile(join(path,'index.json'),JSON.stringify(manifest));await assert.rejects(()=>validateProbabilityHistory(path));rejects++;
 path=await copyArchive('comparison');await writeFile(join(path,'comparison-v1.csv'),'wrong CSV');await assert.rejects(()=>validateProbabilityHistory(path));rejects++;
 path=await copyArchive('path');manifest=JSON.parse(await readFile(join(path,'index.json'),'utf8'));manifest.snapshots[0].file='../private.json';await writeFile(join(path,'index.json'),JSON.stringify(manifest));await assert.rejects(()=>validateProbabilityHistory(path));rejects++;
 await assert.rejects(()=>saveCandidate(fileURLToPath(archiveDirectory)),/already exists/);rejects++;
 assert.deepEqual(await readFile(new URL('index.json',archiveDirectory)),archivedBefore);
 // A pre-existing unrelated staging path must never be deleted on save refusal.
 const legacyStage=new URL('../lib/live/probability/.archive-staging/',import.meta.url);let created=false;
 try{try{await access(legacyStage);}catch{await mkdir(legacyStage);created=true;await writeFile(new URL('sentinel',legacyStage),'test-owned');}
  await assert.rejects(()=>saveCandidate(fileURLToPath(archiveDirectory)),/already exists/);await access(legacyStage);
 }finally{if(created)await rm(legacyStage,{recursive:true,force:true});}
}finally{await rm(temp,{recursive:true,force:true});}
assert.equal(semanticSHA256(countsFromSnapshot(pre)),index.snapshots[0].countSHA256);
console.log(`Live正式快照通过：两节点各100,000有效样本、19队五事件整数总和/嵌套、PRE与R1精确相同、POST确定性晋级/淘汰、${rejects}组归档/模型反例和历史拒绝覆盖。`);
