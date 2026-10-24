// Presentation regressions only: no Monte Carlo, source data writes or network updates.
import assert from 'node:assert/strict';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
register('./tests/live-ui-loader.mjs',pathToFileURL('./'));globalThis.React=React;
const render=(Component,props={})=>renderToStaticMarkup(React.createElement(Component,props));
const {DataStatus,DataDetails}=await import('../components/tournament/data-status.tsx');
const {teams}=await import('../lib/sim/data.ts');
const compact=render(DataStatus,{compact:true});
assert.match(compact,/种子已确认/);assert.match(compact,/2026-09-29/);assert.match(compact,/队回退/);
assert.ok(!compact.includes('gpr-prob-v'));assert.ok(!compact.includes('夺冠概率'));
const original=teams[0].officialSeed;
try{teams[0].officialSeed=null;assert.match(render(DataStatus,{compact:true}),/种子待定/);assert.ok(!render(DataStatus,{compact:true}).includes('种子已确认'));}finally{teams[0].officialSeed=original;}
assert.match(render(DataDetails),/worlds-2026-official-draw-v2/);assert.match(render(DataDetails),/100,000/);
const {RoundSection}=await import('../components/tournament/round-section.tsx');
const {worlds2026}=await import('../lib/sim/worlds2026.ts');
const match={id:'display-only',stage:'PLAY_IN',round:1,label:'显示测试',format:5,teamA:'GEN',teamB:'FUR',status:'COMPLETE',winner:'GEN',scoreA:3,scoreB:1,resultSource:'MANUAL',locked:true,modelProbabilityA:.6,modelProbabilityB:.4};
const props={stage:'PLAY_IN',round:1,matches:[match],current:true,open:true,strengthSource:'SYSTEM_MODEL',systemModelVersion:worlds2026.modelVersion,ratings:{GEN:2000,FUR:1575},onPick(){},onClear(){},onEdit(){},onFork(){}};
const system=render(RoundSection,props);assert.match(system,/系统模型/);assert.match(system,/GPR #/);assert.match(system,/回退模型/);assert.match(system,/我的选择/);assert.match(system,/BO5/);assert.ok(!system.includes('系统 GPR'));
const custom=render(RoundSection,{...props,strengthSource:'CUSTOM_TIER_LIST'});assert.equal((custom.match(/自定义 Tier List/g)||[]).length,1);assert.ok(!custom.includes('自定义实力'));
const history=render(RoundSection,{...props,current:false});assert.equal((history.match(/我的选择/g)||[]).length,1);
const waiting=render(RoundSection,{...props,matches:[]});assert.match(waiting,/等待生成/);assert.match(waiting,/对阵待定/);assert.ok(!waiting.includes('根据前一轮'));
// All protected libraries, formulas, archives, session schema, Worker and Methodology remain byte-identical.
for(const file of execFileSync('git',['ls-tree','-r','--name-only','d66b9d8','--','lib/','app/methodology/'],{encoding:'utf8'}).trim().split('\n').filter(file=>!['lib/live/view.ts','lib/live/view-server.ts','next.config.ts'].includes(file)))assert.deepEqual(await readFile(file),execFileSync('git',['show',`d66b9d8:${file}`]),file);
const player=await readFile('app/teams/[slug]/[player]/page.tsx','utf8');
assert.match(player,/label="统计范围与来源"/);assert.match(player,/label="选手资料来源"/);assert.match(player,/不自动同步/);assert.match(player,/pool\.reason/);assert.match(player,/pool\.sources/);assert.match(player,/scope\.includes/);
console.log('U2 text: data freshness/seed uncertainty, real GPR/fallback, manual+locked status, one round mode, placeholders, collapsed sources, protected files PASS.');
const {ProfileRoster}=await import('../components/team-profile/profile-roster.tsx');
const {QualificationPath}=await import('../components/team-profile/qualification-path.tsx');
const {profileTeams,profileRoster,regularSeasonRecord,qualificationPath}=await import('../lib/team-profile/data.ts');
for(const team of profileTeams){
 const roster=profileRoster(team.id),html=render(ProfileRoster,{teamId:team.id,teamSlug:team.slug});
 assert.ok(html.includes('阵容来源'));assert.ok(!html.includes('点击选手查看档案'));assert.ok(html.includes(roster.source.url.replaceAll('&','&amp;')));
 assert.ok(html.includes(roster.note)); // full original caveat remains available
 for(const {player,role} of roster.slots)assert.ok(html.includes(`${player.playerId} · ${role.label} · 选手档案`));
 const road=render(QualificationPath,{team}),regular=regularSeasonRecord(team.id);
 assert.ok(road.includes('真实赛果 · 北京时间'));assert.ok(road.includes('晋级记录说明'));
 for(const url of [team.sourceUrl,qualificationPath(team.id)[0]?.source.url,regular?.source.url,regular?.recordSource?.url].filter(Boolean))assert.ok(road.includes(url.replaceAll('&','&amp;')));
 if(team.region==='LCK')assert.ok(road.includes('含 R1–2 结转 · 传奇组最终排名'));
 if(team.region==='LCP')assert.ok(road.includes('不含后续种子赛'));
}
const c9=render(ProfileRoster,{teamId:'C9',teamSlug:'c9'});assert.ok(c9.includes('Loki、Tactical'));assert.ok(c9.includes('APA、Zven 列为替补'));
const {default:TeamProfiles}=await import('../app/teams/page.tsx');const list=render(TeamProfiles);
assert.ok(!list.includes('待定种子列于最后'));for(const team of profileTeams)assert.ok(list.includes(`${team.shortName} · ${team.name} · ${team.region}`));
const {LiveTournament}=await import('../components/live/live-tournament.tsx');
// Source guards complement live-ui's full actual and future-node renders.
const live=await readFile('components/live/live-tournament.tsx','utf8');assert.ok(!live.includes('较赛前'));assert.ok(live.includes('相对{nodes[0].label}变化（pp）'));assert.ok(live.includes('时间待核实'));assert.ok(live.includes('非各场开赛时间'));
assert.equal(typeof LiveTournament,'function');
console.log('U2 sources: 19 rosters/roads preserve links+scope, C9 identity caveat, accessible region context and dynamic Live baseline PASS.');
