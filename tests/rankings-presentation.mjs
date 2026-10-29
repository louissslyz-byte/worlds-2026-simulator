import assert from 'node:assert/strict';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {teams} from '../lib/sim/data.ts';
import {precomputedOdds} from '../lib/sim/precomputed.ts';
import {formatProbability} from '../lib/sim/oddsConfig.ts';
register('./tests/live-ui-loader.mjs',pathToFileURL('./'));globalThis.React=React;
const {default:Rankings}=await import('../app/rankings/page.tsx');
const html=renderToStaticMarkup(React.createElement(Rankings));
const rows=[...html.matchAll(/<article[^>]*data-ranking-team="([^"]+)"[^>]*>(.*?)<\/article>/gs)];
const order=[...teams].sort((a,b)=>(a.officialGprRank??999)-(b.officialGprRank??999));
assert.deepEqual(rows.map(r=>r[1]),order.map(t=>t.id));assert.equal(rows.length,19);
assert.match(html,/按 Riot GPR 排名排序/);assert.match(html,/概率由本站进行 Monte Carlo 模拟计算/);
for(const [,id,row] of rows){
 const team=teams.find(t=>t.id===id);
 assert.match(row,/本站夺冠概率/);assert.match(row,/Worlds 种子/);assert.ok(row.includes(`#${team.officialSeed}`));
 assert.match(row,/进入淘汰赛/);assert.ok(row.includes(formatProbability(precomputedOdds.knockoutProbabilities[id])));
 assert.ok(row.includes(formatProbability(precomputedOdds.probabilities[id]).replaceAll('<','&lt;')));assert.ok(row.includes(`/teams/${team.slug}`));
 if(team.officialGprRank)assert.ok(row.includes(`GPR #${team.officialGprRank} · ${team.officialGprScore} 分`));
 else assert.match(row,/GPR 暂无 · 回退模型/);
}
// A corrupted cache is rejected by the existing upstream integrity gate.
const saved=precomputedOdds.knockoutProbabilities.GEN;
try{delete precomputedOdds.knockoutProbabilities.GEN;assert.throws(()=>renderToStaticMarkup(React.createElement(Rankings)),/integer counts/);}finally{precomputedOdds.knockoutProbabilities.GEN=saved;}
assert.match(html,/aria-label="完整实力榜，可横向滚动" tabindex="0"/);assert.equal((html.match(/<tr>/g)||[]).length,20);
console.log('U2-C Rankings: original 19-team GPR order, distinct model label, exact seeds/KO, fallback, missing≠0 and tablet keyboard region PASS.');
