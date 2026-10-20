import assert from 'node:assert/strict';
import {readFile,readdir,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {liveTournamentSchema} from '../lib/live/schema.ts';
import {validateOfficialTournament,formatBeijingTime,publicationUpperBound} from '../lib/live/validate.ts';
import {buildA2FactsInput,canonicalStringify} from '../lib/live/input.ts';
import {loadOfficialSnapshot} from '../lib/live/load.ts';
import {resolveOfficialTeamId,liveTeams} from '../lib/live/identity.ts';

const raw=JSON.parse(await readFile(new URL('../lib/live/snapshots/post-play-in-v1.json',import.meta.url),'utf8'));
const original=JSON.stringify(raw),{data,state,inputSHA256}=await loadOfficialSnapshot();
assert.equal(inputSHA256,'e71bb7d0d9828b5b6a1b2f7f2323fe72043c8d057289f7fc64698c867591748b');
assert.equal(data.metadata.rulesVersion,'worlds-2026-official-draw-v2');
assert.equal(state.completedMatchIds.length,6);assert.deepEqual(state.qualifiedToSwiss,['KC']);
assert.deepEqual(state.eliminatedTeams,['C9','FUR','MVK']);assert.equal(state.directToSwiss.length,15);assert.equal(state.swissParticipants.length,16);
assert.ok(state.swissParticipants.includes('KC'));assert.ok(state.eliminatedTeams.every(id=>!state.swissParticipants.includes(id)));
assert.equal(state.upcomingMatchIds.length,8);assert.equal(Object.keys(state.swissRecords).length,16);
assert.ok(Object.values(state.swissRecords).every(r=>r.wins===0&&r.losses===0));assert.equal(state.currentStage,'SWISS');
assert.deepEqual(data.matches.playIn.map(m=>[m.teamA,m.scoreA,m.scoreB,m.teamB]),[['KC',3,2,'C9'],['MVK',3,0,'FUR'],['KC',3,0,'MVK'],['FUR',3,1,'C9'],['MVK',3,1,'FUR'],['KC',3,0,'MVK']]);
assert.ok(data.matches.swiss.every(m=>m.scoreA===null&&m.scoreB===null&&m.winnerId===null&&m.loserId===null&&m.schedule.scheduledAt===null));
assert.equal(formatBeijingTime(null),null);assert.ok(formatBeijingTime('2026-10-15T18:00:00.000Z').includes('2026/10/16 02:00'));
assert.ok(formatBeijingTime('2026-10-23T17:00:00.000Z').includes('2026/10/24 01:00'));
assert.equal(publicationUpperBound(data.sources.find(s=>s.sourceId==='dot-draw')),Date.parse('2026-10-19T12:00:00.000Z'));
assert.equal(publicationUpperBound(data.sources.find(s=>s.sourceId==='riot-schedule')),null);
assert.equal(publicationUpperBound(data.sources.find(s=>s.sourceId==='4gamers-draw')),Date.parse('2026-10-19T02:00:10.000Z'));
for(const alias of ['TL','TLAW','Team Liquid Alienware','team liquid'])assert.equal(resolveOfficialTeamId(alias),'TLAW');
assert.equal(resolveOfficialTeamId('BILIBILI GAMING'),'BLG');assert.equal(resolveOfficialTeamId('Gen.G Esports'),'GEN');assert.equal(resolveOfficialTeamId('Shanghai Invictus Gaming Meituan'),'IG');
assert.throws(()=>resolveOfficialTeamId('TBD'));assert.throws(()=>resolveOfficialTeamId('TLAW2'));
for(const t of liveTeams){assert.equal(resolveOfficialTeamId(t.id),t.id);assert.ok((await readFile(new URL(`../public${t.logo}`,import.meta.url))).length>0);}
assert.equal(liveTeams.length,19);assert.equal(new Set(liveTeams.map(t=>t.id)).size,19);
let cases=0;
function reject(change){const copy=structuredClone(raw);change(copy);assert.throws(()=>validateOfficialTournament(copy),`mutation ${cases}: ${change}`);cases++;}
for(const change of [
 x=>x.teamIds[0]='TL',x=>x.teamIds[0]='HLE',x=>x.teamIds.pop(),
 x=>x.matches.playIn[0].teamA='TL',x=>x.matches.playIn[0].teamB='KC',x=>x.matches.playIn[0].scoreB=3,
 x=>x.matches.playIn[0].scoreB=-1,x=>x.matches.playIn[0].scoreB=1.5,x=>x.matches.playIn[0].scoreA=null,
 x=>x.matches.playIn[0].winnerId='C9',x=>x.matches.playIn[0].loserId='KC',x=>x.matches.playIn[0].bestOf=3,
 x=>x.matches.playIn[0].status='SCHEDULED',x=>x.matches.playIn[0].evidence.sourceIds=[],x=>x.matches.playIn[0].evidence.verificationStatus='UNVERIFIED',
 x=>x.matches.playIn[1].matchId=x.matches.playIn[0].matchId,
 x=>{x.matches.playIn[0].officialMatchId='one';x.matches.playIn[1].officialMatchId='one';},
 x=>x.matches.playIn.pop(),x=>x.matches.playIn[3].teamAFrom.outcome='WINNER',x=>x.matches.playIn[4].teamBFrom.matchId='w26-pi-lb-final',
 x=>x.matches.playIn[2].teamB='FUR',x=>x.matches.playIn[5].bracketPosition='LOWER_FINAL',x=>x.matches.playIn[4].round=2,
 x=>x.officialQualification.qualifiedToSwiss=['MVK'],x=>x.matches.playIn[5].competitionDate='2026-10-24',
 x=>x.matches.swiss[0].teamB='MVK',x=>x.matches.swiss[0].teamB='DK',
 x=>x.matches.swiss[0].teamB='TES',x=>x.matches.swiss[0].status='COMPLETED',x=>x.matches.swiss[0].scoreA=0,
 x=>x.matches.swiss[0].winnerId='GEN',x=>x.matches.swiss[0].stage='OTHER',x=>x.matches.swiss[0].round=2,x=>x.matches.swiss[0].bestOf=3,
 x=>x.matches.swiss[0].teamAFrom={matchId:'w26-pi-final',outcome:'WINNER'},
 x=>x.matches.swiss[1].teamA='GEN',x=>x.matches.swiss.pop(),
 x=>x.officialDraws[0].pools[3][3]='MVK',x=>x.officialDraws[0].pools[0][0]='HLE',
 x=>x.officialDraws[0].matchIds[0]='unknown',x=>x.officialDraws[0].orderStatus='MATCH_ORDER',
 x=>x.officialDraws[0].publishedAt='2026-10-20T00:00:00.000Z',
 x=>x.officialDraws[0].evidence.knownBy='2026-10-20T00:00:00.000Z',
 x=>x.officialDraws[0].evidence.temporalSourceIds=['riot-swiss-bracket'],
 x=>x.officialDraws[0].evidence.temporalSourceIds=['riot-primer'],
 x=>x.officialDraws[0].evidence.sourceIds=['dot-draw'],
 x=>x.sources.push(structuredClone(x.sources[0])),x=>x.sources[1].accessStatus='UNREADABLE',
 x=>x.sources[1].verificationStatus='UNVERIFIED',x=>x.sources[3].publishedDate='2026-10-20',
 x=>x.metadata.asOf='2026-10-19',x=>x.metadata.asOf='2026-10-19T00:00:00.000Z',
 x=>x.metadata.asOf='2026-10-23T18:00:00.000Z',x=>x.metadata.sourceCheckedAt='2026-10-18T12:00:00.000Z',
 x=>x.metadata.rulesVersion='legacy',x=>x.metadata.ratingSnapshot={},x=>x.randomSeed=2026,
 x=>x.matches.swiss[0].schedule.scheduledAt='2026-10-23T17:00:00.000Z',
 x=>x.matches.playIn[0].schedule.originalLocalTime='2026-10-15T18:00',
 x=>x.matches.playIn[0].schedule.scheduledAt='2026-10-15T18:00:00',
 x=>x.matches.playIn[0].schedule.scheduledAt='2026-02-30T18:00:00.000Z',
 x=>x.matches.playIn[0].schedule.evidence=null,
 x=>x.matches.playIn[0].schedule.scheduledAt='2026-10-25T18:00:00.000Z',
 x=>x.matches.playIn[0].completedAt='2026-10-25T18:00:00.000Z',
 x=>x.matches.swiss[0].startedAt='2026-10-23T17:00:00.000Z',
 x=>x.matches.swiss[0].competitionDate='2026-10-24',
 x=>x.stageSchedule.originalLocalTime='2026-10-23T17:00',
 x=>x.matches.swiss[0].evidence.temporalSourceIds=['missing'],
 x=>x.matches.playIn[0].updatedAt='2026-10-25T18:00:00.000Z',
 x=>x.matches.playIn[1].competitionDate='2025-10-15',x=>x.matches.playIn[1].competitionTimeZone='America/Chicago',
 x=>x.matches.swiss[0].competitionTimeZone='America/Los_Angeles',x=>x.metadata.revisionOf=x.metadata.snapshotId,
])reject(change);
// Canonical facts are independent of JSON layout, source checks and collection ordering.
const reversed=value=>Array.isArray(value)?value.map(reversed):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).reverse().map(([k,v])=>[k,reversed(v)])):value;
assert.equal(buildA2FactsInput(reversed(raw)).inputSHA256,inputSHA256);
const reordered=structuredClone(raw);reordered.teamIds.reverse();reordered.matches.playIn.reverse();reordered.matches.swiss.reverse();reordered.sources.reverse();reordered.officialDraws[0].matchIds.reverse();reordered.officialDraws[0].pools.forEach(p=>p.reverse());
assert.equal(buildA2FactsInput(reordered).inputSHA256,inputSHA256);
const rechecked=structuredClone(raw);rechecked.metadata.sourceCheckedAt='2026-10-21T00:00:00.000Z';rechecked.sources.forEach(s=>s.checkedAt='2026-10-21T00:00:00.000Z');rechecked.matches.playIn.forEach(m=>m.updatedAt='2026-10-21T00:00:00.000Z');
assert.equal(buildA2FactsInput(rechecked).inputSHA256,inputSHA256);
const changed=structuredClone(raw);changed.matches.playIn[0].scoreB=1;assert.notEqual(buildA2FactsInput(changed).inputSHA256,inputSHA256);
assert.equal(canonicalStringify({b:1,a:0}),'\u007b"a":0,"b":1\u007d');assert.throws(()=>canonicalStringify(NaN));
await assert.rejects(()=>loadOfficialSnapshot('../private'));await assert.rejects(()=>loadOfficialSnapshot('__proto__'));
// Caller mutation cannot mutate the file or subsequent read.
const loaded=await loadOfficialSnapshot();loaded.state.qualifiedToSwiss[0]='MVK';assert.deepEqual((await loadOfficialSnapshot()).state.qualifiedToSwiss,['KC']);assert.equal(JSON.stringify(raw),original);
assert.equal(liveTournamentSchema.safeParse({...raw,derivedTournamentState:{}}).success,false);
// Inspect the transitive Live boundary: only existing identities + rules constants,
// no simulator execution, sessions, browser storage, route or remote data fetch.
for(const name of await readdir(new URL('../lib/live/',import.meta.url))){
 if(!name.endsWith('.ts'))continue;const text=await readFile(new URL(`../lib/live/${name}`,import.meta.url),'utf8');
 assert.ok(!/from ['"][^'"]*(?:\/engine|\/monteCarlo|\/ratings|\/precomputed|\/sessionCompatibility)['"]/.test(text),name);
 assert.ok(!/localStorage|sessionStorage|\bfetch\s*\(|writeFile|appendFile|createWriteStream/.test(text),name);
}
const protectedFiles=['lib/sim/precomputedOdds.json','lib/sim/worlds2026.ts','lib/sim/engine.ts','lib/sim/draws.ts','lib/sim/monteCarlo.ts','lib/sim/types.ts','lib/sim/ratingConfig.ts','lib/sim/gprSnapshot.ts','lib/sim/teamSnapshot.ts','lib/team-profile/champion-pools.json'];
for(const file of protectedFiles){const old=execFileSync('git',['show',`51a0268:${file}`]);assert.equal(createHash('sha256').update(await readFile(new URL(`../${file}`,import.meta.url))).digest('hex'),createHash('sha256').update(old).digest('hex'),`${file} changed`);}
const cli=spawnSync(process.execPath,['--import','tsx','scripts/validate-live.mjs'],{encoding:'utf8'});assert.equal(cli.status,0,cli.stderr);assert.ok(cli.stdout.includes(inputSHA256));
const invalidCli=spawnSync(process.execPath,['--import','tsx','scripts/validate-live.mjs','--invalid'],{encoding:'utf8'});assert.equal(invalidCli.status,1);
const temp=await mkdtemp(join(tmpdir(),'worlds-live-facts-test-'));
try{
 const candidate=join(temp,'candidate.json');
 for(const [mutate,expected] of [
  [x=>{x.matches.playIn[0].scoreA=1;},1],
  [x=>{x.matches.playIn[0].scoreB=1;},1],
  [x=>{x.metadata.sourceCheckedAt='2026-10-21T00:00:00.000Z';},1],
  [x=>{x.metadata.snapshotId='worlds-2026-post-play-in-v2';x.metadata.revisionOf='worlds-2026-post-play-in-v1';x.matches.playIn[0].scoreB=1;},0],
  [x=>{x.metadata.snapshotId='worlds-2026-post-play-in-v2';x.metadata.revisionOf='unknown';},1],
 ]){
  const copy=structuredClone(raw);mutate(copy);await writeFile(candidate,JSON.stringify(copy));
  const run=spawnSync(process.execPath,['--import','tsx','scripts/validate-live.mjs','--candidate',candidate],{encoding:'utf8'});assert.equal(run.status,expected,run.stderr);
 }
}finally{await rm(temp,{recursive:true,force:true});}
assert.equal(JSON.stringify(JSON.parse(await readFile(new URL('../lib/live/snapshots/post-play-in-v1.json',import.meta.url),'utf8'))),original,'CLI cannot overwrite snapshots');
console.log(`Live facts通过：19队、6场双败、8场官方抽签、UTC/CST、${cases}组坏数据拒绝、事实SHA复现、只读CLI与模拟器隔离。未运行新的正式Monte Carlo。`);
