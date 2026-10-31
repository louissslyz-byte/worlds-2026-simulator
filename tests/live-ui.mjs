import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,copyFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {ENGINE_FILES,STRENGTH_FILES,GENERATOR_FILES} from '../lib/live/probability/config.ts';
import {validateProbabilityHistory} from '../lib/live/probability/archive.ts';
import {loadOfficialSnapshot} from '../lib/live/load.ts';
import {loadLiveView,readLiveView} from '../lib/live/view-server.ts';
import {projectLiveView,projectUpdatedLiveView,projectRound2LiveView,projectRound3LiveView,projectRound4LiveView,curveEvents,probabilityText,deltaText,visibleTeams,regions} from '../lib/live/view.ts';
const history=await validateProbabilityHistory(),official=await loadOfficialSnapshot();
const legacy=projectLiveView(official,history.index,[history.pre,history.post]);
const {loadUpdateHistory,UPDATE_FILES}=await import('../lib/live/updates/probability.ts');
const extension=await loadUpdateHistory(history.model);
const {loadRound2History,ROUND2_FILES}=await import('../lib/live/updates/round2.ts');const round2=await loadRound2History(history.model);
const {loadRound3History,ROUND3_FILES}=await import('../lib/live/updates/round3.ts');const round3=await loadRound3History(history.model);
const {loadRound4History,ROUND4_FILES}=await import('../lib/live/updates/round4.ts');const round4=await loadRound4History(history.model);
const view=projectRound4LiveView(projectRound3LiveView(projectRound2LiveView(projectUpdatedLiveView(official,{snapshots:[...history.index.snapshots,...extension.index.snapshots,round2.index.snapshot,round3.index.snapshot,round4.index.snapshot]},[history.pre,history.post,...extension.snapshots,round2.snapshot,round3.snapshot,round4.snapshot],extension.update,extension.records),round2.update,round2.records),round3.update,round3.records),round4.update,round4.records);
assert.deepEqual(await loadLiveView(),view);
assert.equal(view.teams.length,19);assert.equal(view.nodes.length,6);
for(const team of view.teams)for(let i=0;i<6;i++)for(const event of curveEvents){const raw=[history.pre,history.post,...extension.snapshots,round2.snapshot,round3.snapshot,round4.snapshot][i].teams.find(t=>t.teamId===team.id);assert.equal(team.points[i].values[event].count,raw[event+'Count']);assert.equal(team.points[i].values[event].probability,raw[event+'Probability']);}
assert.equal(view.matches.filter(m=>m.stage==='PLAY_IN').length,6);
assert.equal(view.matches.filter(m=>m.stage==='SWISS'&&m.round===1&&m.status==='COMPLETED').length,8);
assert.equal(view.matches.filter(m=>m.stage==='SWISS'&&m.round===3&&m.status==='COMPLETED').length,8);
for(const id of ['GEN','DK'])assert.equal(view.teams.find(t=>t.id===id).points.at(-1).values.knockout.count,100000);
for(const id of ['AL','TSW']){const t=view.teams.find(t=>t.id===id);assert.equal(t.eliminationNodeIndex,4);assert.equal(t.points.at(-1).values.knockout.count,0);assert.equal(t.points.at(-1).values.swiss.count,100000);}
assert.equal(view.matches.filter(m=>m.stage==='SWISS'&&m.round===5&&m.scoreA===null&&m.winner===null).length,3);
for(const r of regions)assert.equal(visibleTeams(view.teams,r).length,view.teams.filter(t=>r==='ALL'||t.region===r).length);
assert.equal(visibleTeams(view.teams,'ALL').length,19);
assert.equal(view.teams.filter(t=>t.status==='已淘汰').length,8);
assert.equal(probabilityText(0),'0%');assert.equal(probabilityText(.00001),'<0.1%');assert.equal(probabilityText(1),'100.0%');
assert.equal(deltaText(-.001),'−0.001 pp');assert.equal(deltaText(.045),'+0.045 pp');assert.equal(deltaText(0),'0 pp');
const source=await readFile('components/live/live-tournament.tsx','utf8');assert.ok(source.includes('nodes.map('));assert.ok(source.includes('curveEvents.map('));assert.ok(source.includes('100%'));
const serialized=JSON.stringify(view);for(const forbidden of ['ratingInput','sourceFiles','randomSeed','/Users/','GPRScore','tournamentState'])assert.ok(!serialized.includes(forbidden));
const client=await readFile('components/live/live-tournament.tsx','utf8');for(const forbidden of ['localStorage','runMonteCarlo','fetch(','statistics-server'])assert.ok(!client.includes(forbidden));
assert.ok((await readFile('components/site-navigation.tsx','utf8')).includes("['/live','LIVE TOURNAMENT']"));
console.log('Live UI: 19 teams / 57 curves / 6 real nodes / synthetic future node / all counts / tiny probabilities / pp / region filters / isolation PASS');

const fixture=await mkdtemp(join(tmpdir(),'live-ui-'));
try{
 const files=[...ENGINE_FILES,...STRENGTH_FILES].map(f=>'lib/sim/'+f);
 files.push(...ROUND4_FILES,...['facts.json','probability.json','generation-source.json','index.json'].map(f=>'lib/live/updates/round4/'+f),...ROUND3_FILES,...['facts.json','probability.json','generation-source.json','index.json'].map(f=>'lib/live/updates/round3/'+f),...ROUND2_FILES,...['facts.json','probability.json','generation-source.json','index.json'].map(f=>'lib/live/updates/round2/'+f),...GENERATOR_FILES,...UPDATE_FILES,'lib/live/updates/facts/index.json','lib/live/updates/facts/swiss-r1-v1.json','lib/live/updates/generation-source-v1.json','lib/live/updates/snapshots/index.json','lib/live/updates/snapshots/swiss-r1-v1.json','lib/sim/precomputedOdds.json','lib/live/snapshots/index.json','lib/live/snapshots/post-play-in-v1.json',...['index.json','pre-tournament-v1.json','post-play-in-v1.json','frozen-system-v1.json'].map(f=>'lib/live/probability/snapshots/'+f));
 for(const file of new Set(files)){await mkdir(dirname(join(fixture,file)),{recursive:true});await copyFile(file,join(fixture,file));}
 assert.deepEqual(await readLiveView(fixture),view);
 const target=join(fixture,'lib/live/probability/snapshots/post-play-in-v1.json');await writeFile(target,'{}');await assert.rejects(readLiveView(fixture),/checksum/);
 await rm(target);await assert.rejects(readLiveView(fixture),/ENOENT/);
 console.log('Next read adapter rejects corrupt/missing snapshots; protected archive untouched.');
}finally{await rm(fixture,{recursive:true,force:true});}
// Synthetic future node verifies presentation extensibility, never saved as fact data.
const {register}=await import('node:module');const {pathToFileURL}=await import('node:url');
register('./tests/live-ui-loader.mjs',pathToFileURL('./'));
const React=(await import('react')).default;globalThis.React=React;
const {renderToStaticMarkup}=await import('react-dom/server');
const {LiveTournament}=await import('../components/live/live-tournament.tsx');
const html=renderToStaticMarkup(React.createElement(LiveTournament,{data:view}));
assert.equal((html.match(/data-live-team=/g)||[]).length,19);assert.equal((html.match(/data-curve=/g)||[]).length,57);
const future=structuredClone(legacy);future.nodes.push({...view.nodes[1],id:'test-future',kind:'TEST-FUTURE',label:'测试未来节点'});for(const t of future.teams)t.points.push({...t.points[1],snapshotId:'test-future'});
const expanded=renderToStaticMarkup(React.createElement(LiveTournament,{data:future}));assert.equal((expanded.match(/测试未来节点<\/text>/g)||[]).length,19);
console.log('Actual component SSR: 19 cards, 57 lines, third synthetic node rendered on all 19 charts.');

// Swiss match cards stay in their actual round, even if data arrive out of order.
const {SwissRounds}=await import('../components/live/live-tournament.tsx');
const reordered={...view,matches:[...view.matches].reverse()};
const grouped=renderToStaticMarkup(React.createElement(SwissRounds,{data:reordered}));
const groups=[...grouped.matchAll(/<section[^>]*aria-labelledby="swiss-round-(\d+)"[^>]*>(.*?)<\/section>/gs)];
assert.deepEqual(groups.map(g=>Number(g[1])),[1,2,3,4,5]);
for(const [,number,html] of groups){
 const expected=view.matches.filter(m=>m.stage==='SWISS'&&m.round===Number(number));
 const actual=[...html.matchAll(/data-match="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(actual.toSorted(),expected.map(m=>m.id).toSorted());
 assert.ok(html.includes(`SWISS ROUND ${number}`));
}
console.log('Swiss schedule: official matches grouped once by round, even for unordered input.');

// Historical records are counted by series and only from completed earlier rounds.
const {swissRecordBeforeMatch}=await import('../components/live/live-tournament.tsx');
for(const [team,round,record] of [['GEN',1,'0–0'],['GEN',2,'1–0'],['HLE',2,'1–0'],['GEN',3,'2–0'],['DK',4,'3–0'],['CFO',4,'1–2'],['KC',4,'1–2']])assert.equal(swissRecordBeforeMatch(view.matches,team,round),record);
const incomplete=structuredClone(view.matches);const prior=incomplete.find(m=>m.stage==='SWISS'&&m.round===2&&(m.a==='GEN'||m.b==='GEN'));prior.status='SCHEDULED';prior.winner=null;
assert.equal(swissRecordBeforeMatch(incomplete,'GEN',3),null);
assert.ok(grouped.includes('2–0'));assert.ok(grouped.includes('1–2'));assert.ok(!grouped.includes('赛前 2–0'));
console.log('Swiss pre-match series records: historical rounds and incomplete data PASS.');

const {sortMatchesByTime}=await import('../components/live/live-tournament.tsx');
const ordered=sortMatchesByTime(view.matches.filter(m=>m.stage==='SWISS'&&m.round===1).toReversed());
assert.deepEqual(ordered.map(m=>m.time),ordered.map(m=>m.time).toSorted());
const unknown=[{...ordered[0],id:'unknown-a',time:null,date:null},{...ordered[1],id:'unknown-b',time:null,date:null}];
assert.deepEqual(sortMatchesByTime([unknown[0],ordered[1],unknown[1],ordered[0]]).map(m=>m.id),[ordered[0].id,ordered[1].id,'unknown-a','unknown-b']);
assert.ok(!grouped.includes('✓ 已结束'));assert.ok(!grouped.includes('待开赛'));
console.log('Match times sort within each section; unknown times remain last; status text removed PASS.');
const partial=[{...ordered[0],id:'date-only',time:null,date:'2026-10-15'}, {...ordered[1],id:'later',date:'2026-10-16'}];assert.deepEqual(sortMatchesByTime(partial.toReversed()).map(m=>m.id),['date-only','later']);
