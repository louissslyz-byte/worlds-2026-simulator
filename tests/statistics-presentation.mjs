// Display-only regression tests. Fixtures below are synthetic, not source data.
import assert from 'node:assert/strict';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {baselineDifference,draftSampleRows,draftCoverageStatus} from '../components/team-profile/statistics-presentation.ts';

assert.equal(baselineDifference('gd15',586,0,'PARTIAL'),'高于已收录样本均值 586 金币');
assert.equal(baselineDifference('firstTowerPct',62.1,50,'COMPLETE'),'高于赛区均值 12.1 个百分点');
assert.equal(baselineDifference('dragonControlPct',37.9,50,'PARTIAL'),'低于已收录样本均值 12.1 个百分点');
assert.equal(baselineDifference('gpm',1900,1840,'COMPLETE'),'高于赛区均值 60 金币/分钟');
assert.equal(baselineDifference('durationSeconds',1900,1859,'PARTIAL'),'高于已收录样本均值 41 秒');
assert.equal(baselineDifference('durationSeconds',1800,1861,'PARTIAL'),'低于已收录样本均值 1 分 1 秒');
assert.equal(baselineDifference('durationSeconds',1860,1800,'COMPLETE'),'高于赛区均值 1 分');
assert.equal(baselineDifference('gd15',0,0,'COMPLETE'),'与赛区均值相同');
assert.equal(baselineDifference('gd15',null,0,'COMPLETE'),null);
assert.equal(baselineDifference('gd15',1,null,'PARTIAL'),null);
assert.equal(baselineDifference('gpm',NaN,2,'PARTIAL'),null);
assert.equal(baselineDifference('gpm',2,Infinity,'PARTIAL'),null);
assert.match(baselineDifference('firstTowerPct',50.01,50,'PARTIAL'),/差异不足 0.1 个百分点/);
assert.match(baselineDifference('gd15',-0.01,0,'PARTIAL'),/差异不足 1 金币/);

const makeSection=(validGames,missingGames,coverageStatus)=>({validGames,missingGames,coverageStatus,stats:[]});
const draft={mostPicked:makeSection(29,0,'PARTIAL'),mostBanned:makeSection(28,1,'PARTIAL'),mostBannedAgainst:makeSection(27,2,'PARTIAL'),combinations:{MID_JUNGLE:{roles:['MID','JUNGLE'],...makeSection(29,0,'PARTIAL')},BOT_SUPPORT:{roles:['BOT','SUPPORT'],...makeSection(28,1,'PARTIAL')},TOP_JUNGLE:{roles:['TOP','JUNGLE'],...makeSection(29,0,'PARTIAL')}}};
const rows=draftSampleRows(draft);
assert.equal(rows.length,6);
assert.deepEqual(rows.map(row=>row.validGames),[29,28,27,29,28,29]);
assert.deepEqual(rows.map(row=>row.missingGames),[0,1,2,0,1,0]);
assert.equal(draftCoverageStatus(draft),'PARTIAL');
const complete=structuredClone(draft);
for(const row of [complete.mostPicked,complete.mostBanned,complete.mostBannedAgainst,...Object.values(complete.combinations)])row.coverageStatus='COMPLETE';
assert.equal(draftCoverageStatus(complete),'COMPLETE');
complete.mostBanned.coverageStatus='UNAVAILABLE';
assert.equal(draftCoverageStatus(complete),'PARTIAL');
for(const row of [complete.mostPicked,complete.mostBanned,complete.mostBannedAgainst,...Object.values(complete.combinations)])row.coverageStatus='UNAVAILABLE';
assert.equal(draftCoverageStatus(complete),'UNAVAILABLE');

register('./tests/statistics-css-loader.mjs',pathToFileURL('./'));
globalThis.React=React;
const {TeamStatistics,PlayerStatistics}=await import('../components/team-profile/statistics.tsx');
const metric={value:0,validGames:29,eligibleGames:29,missingGames:0,excludedGames:0,coverageStatus:'PARTIAL',source:[],definitionVersion:'test'};
const definition={id:'team.gd15',chineseName:'GD@15',englishName:'GD@15',unit:'gold',formula:'existing',explanationZh:'test',validSampleRule:'existing',direction:'STYLE'};
const view={region:'LCS',entity:{teamId:'TEST',sampleGames:29,metrics:{gd15:metric}},baselines:[],definitions:[definition],snapshotDate:'test-only',scopeNote:'Synthetic test only',draft,champions:{}};
const unchanged=JSON.stringify(view);
const html=renderToStaticMarkup(React.createElement(TeamStatistics,{view}));
const draftHtml=html.slice(html.indexOf('DRAFT ANALYSIS'));
assert.ok(draftHtml.includes('LCS 最后国内赛段'));
assert.equal((draftHtml.match(/ⓘ 样本量/g)??[]).length,1);
for(const value of ['28 局有效','27 局有效','1 局字段缺失','2 局字段缺失'])assert.ok(draftHtml.includes(value));
assert.ok(!draftHtml.includes('29 局有效 · 部分数据'));
assert.ok(draftHtml.includes('低场次组合的胜率仅供参考'));
assert.equal(JSON.stringify(view),unchanged,'rendering must not mutate source values or states');

for(const count of [2,3,4,5,7]){
 const metrics=Object.fromEntries(Array.from({length:count},(_,i)=>['m'+i,metric]));
 const definitions=Object.keys(metrics).map(key=>({...definition,id:'player.'+key}));
 const playerHtml=renderToStaticMarkup(React.createElement(PlayerStatistics,{view:{...view,entity:{...view.entity,metrics},definitions}}));
 assert.ok(playerHtml.includes(`data-count="${count}"`));
 const labels=[...playerHtml.matchAll(/<strong>(m\d+|GD@15)<\/strong>/g)].length;
 assert.equal(labels,count);
}
console.log('P3-A.6显示回归通过：均值差／百分点／时间／null，6类独立BP分母，动态赛区，指标数量及无数据修改。');
