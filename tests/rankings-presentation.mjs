import assert from 'node:assert/strict';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {compareGpr,currentOfficialGpr,signedGprChange} from '../lib/rankings/gpr-comparison.ts';
import {teams} from '../lib/sim/data.ts';
import {precomputedOdds} from '../lib/sim/precomputed.ts';
import {formatProbability} from '../lib/sim/oddsConfig.ts';
register('./tests/live-ui-loader.mjs',pathToFileURL('./'));globalThis.React=React;
const {default:Rankings}=await import('../app/rankings/page.tsx');
const html=renderToStaticMarkup(React.createElement(Rankings));
const rows=[...html.matchAll(/<article[^>]*data-ranking-team="([^"]+)"[^>]*>(.*?)<\/article>/gs)];
const order=[...teams].sort((a,b)=>(compareGpr(a.id).current?.rank??999)-(compareGpr(b.id).current?.rank??999));
assert.deepEqual(rows.map(r=>r[1]),order.map(t=>t.id));assert.equal(rows.length,19);
assert.match(html,/按最新官方全球名次排序/);assert.match(html,/本站预测仍使用冻结赛前GPR/);
for(const [,id,row] of rows){
 const team=teams.find(t=>t.id===id);
 assert.match(row,/赛前夺冠概率/);assert.match(row,/Worlds 种子/);assert.ok(row.includes(`#${team.officialSeed}`));
 assert.match(row,/进入淘汰赛/);assert.ok(row.includes(formatProbability(precomputedOdds.knockoutProbabilities[id])));
 assert.ok(row.includes(formatProbability(precomputedOdds.probabilities[id]).replaceAll('<','&lt;')));assert.ok(row.includes(`/teams/${team.slug}`));
 const c=compareGpr(id);assert.ok(row.includes(String(c.current.score)));assert.ok(row.includes(signedGprChange(c.scoreChange)));assert.match(row,/赛前 GPR/);assert.match(row,/最新 GPR/);assert.match(row,/分数变化/);
 if(c.previous)assert.ok(row.includes(String(c.previous.score)));else assert.match(row,/暂无官方分数/);
}
// A corrupted cache is rejected by the existing upstream integrity gate.
const saved=precomputedOdds.knockoutProbabilities.GEN;
try{delete precomputedOdds.knockoutProbabilities.GEN;assert.throws(()=>renderToStaticMarkup(React.createElement(Rankings)),/integer counts/);}finally{precomputedOdds.knockoutProbabilities.GEN=saved;}
assert.match(html,/aria-label="完整实力榜，可横向滚动" tabindex="0"/);assert.equal((html.match(/<tr>/g)||[]).length,20);
console.log('Rankings: 19-team latest official order, pre/current comparison, distinct frozen odds, exact seeds/KO and accessible tablet region PASS.');

assert.equal(Object.keys(currentOfficialGpr.entries).length,19);assert.equal(compareGpr('GEN').scoreChange,40);assert.equal(compareGpr('LOS').scoreChange,84);assert.equal(compareGpr('TLAW').scoreChange,0);assert.equal(compareGpr('FUR').scoreChange,null);assert.equal(compareGpr('HLE').current.rank,compareGpr('GEN').current.rank);
