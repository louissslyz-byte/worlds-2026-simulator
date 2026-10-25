import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,copyFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {ENGINE_FILES,STRENGTH_FILES,GENERATOR_FILES} from '../lib/live/probability/config.ts';
import {validateProbabilityHistory} from '../lib/live/probability/archive.ts';
import {loadOfficialSnapshot} from '../lib/live/load.ts';
import {loadLiveView,readLiveView} from '../lib/live/view-server.ts';
import {projectLiveView,projectUpdatedLiveView,projectRound2LiveView,curveEvents,probabilityText,deltaText,visibleTeams,regions} from '../lib/live/view.ts';
const history=await validateProbabilityHistory(),official=await loadOfficialSnapshot();
const legacy=projectLiveView(official,history.index,[history.pre,history.post]);
const {loadUpdateHistory,UPDATE_FILES}=await import('../lib/live/updates/probability.ts');
const extension=await loadUpdateHistory(history.model);
const {loadRound2History,ROUND2_FILES}=await import('../lib/live/updates/round2.ts');const round2=await loadRound2History(history.model);
const view=projectRound2LiveView(projectUpdatedLiveView(official,{snapshots:[...history.index.snapshots,...extension.index.snapshots,round2.index.snapshot]},[history.pre,history.post,...extension.snapshots,round2.snapshot],extension.update,extension.records),round2.update,round2.records);
assert.deepEqual(await loadLiveView(),view);
assert.equal(view.teams.length,19);assert.equal(view.nodes.length,4);
for(const team of view.teams)for(let i=0;i<4;i++)for(const event of curveEvents){const raw=[history.pre,history.post,...extension.snapshots,round2.snapshot][i].teams.find(t=>t.teamId===team.id);assert.equal(team.points[i].values[event].count,raw[event+'Count']);assert.equal(team.points[i].values[event].probability,raw[event+'Probability']);}
assert.equal(view.matches.filter(m=>m.stage==='PLAY_IN').length,6);
assert.equal(view.matches.filter(m=>m.stage==='SWISS'&&m.round===1&&m.status==='COMPLETED').length,8);
assert.equal(view.matches.filter(m=>m.stage==='SWISS'&&m.round===3&&m.scoreA===null&&m.winner===null).length,8);
for(const r of regions)assert.equal(visibleTeams(view.teams,r).length,view.teams.filter(t=>r==='ALL'||t.region===r).length);
assert.equal(visibleTeams(view.teams,'ALL').length,19);
assert.equal(view.teams.filter(t=>t.status==='已淘汰').length,3);
assert.equal(probabilityText(0),'0%');assert.equal(probabilityText(.00001),'<0.1%');assert.equal(probabilityText(1),'100.0%');
assert.equal(deltaText(-.001),'−0.001 pp');assert.equal(deltaText(.045),'+0.045 pp');assert.equal(deltaText(0),'0 pp');
const source=await readFile('components/live/live-tournament.tsx','utf8');assert.ok(source.includes('nodes.map('));assert.ok(source.includes('curveEvents.map('));assert.ok(source.includes('100%'));
const serialized=JSON.stringify(view);for(const forbidden of ['ratingInput','sourceFiles','randomSeed','/Users/','GPRScore','tournamentState'])assert.ok(!serialized.includes(forbidden));
const client=await readFile('components/live/live-tournament.tsx','utf8');for(const forbidden of ['localStorage','runMonteCarlo','fetch(','statistics-server'])assert.ok(!client.includes(forbidden));
assert.ok((await readFile('components/site-navigation.tsx','utf8')).includes("['/live','LIVE TOURNAMENT']"));
console.log('Live UI: 19 teams / 57 curves / 4 real nodes / synthetic future node / all counts / tiny probabilities / pp / region filters / isolation PASS');

const fixture=await mkdtemp(join(tmpdir(),'live-ui-'));
try{
 const files=[...ENGINE_FILES,...STRENGTH_FILES].map(f=>'lib/sim/'+f);
 files.push(...ROUND2_FILES,...['facts.json','probability.json','generation-source.json','index.json'].map(f=>'lib/live/updates/round2/'+f),...GENERATOR_FILES,...UPDATE_FILES,'lib/live/updates/facts/index.json','lib/live/updates/facts/swiss-r1-v1.json','lib/live/updates/generation-source-v1.json','lib/live/updates/snapshots/index.json','lib/live/updates/snapshots/swiss-r1-v1.json','lib/sim/precomputedOdds.json','lib/live/snapshots/index.json','lib/live/snapshots/post-play-in-v1.json',...['index.json','pre-tournament-v1.json','post-play-in-v1.json','frozen-system-v1.json'].map(f=>'lib/live/probability/snapshots/'+f));
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
