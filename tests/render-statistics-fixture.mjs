// Opt-in private static fixture using the real P2-C one-game role-switch record.
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
if(process.env.NODE_ENV==='production'||!process.env.TEAM_STATS_SNAPSHOT||!process.env.STATISTICS_FIXTURE_DIR)throw new Error('Explicit private input/output paths required; never run in production');
const output=resolve(process.env.STATISTICS_FIXTURE_DIR);
if(!relative(process.cwd(),output).startsWith('..'))throw new Error('Fixture output must be outside the website');
register('./tests/statistics-css-loader.mjs',pathToFileURL('./'));
globalThis.React=React;
const {PlayerStatistics}=await import('../components/team-profile/statistics.tsx');
const data=JSON.parse(await readFile(process.env.TEAM_STATS_SNAPSHOT,'utf8'));
const region=data.regions.LPL;const entity=Object.values(region.playerStatsByKey).find(p=>p.displayName==='Photic'&&p.role==='TOP');
if(!entity||entity.metrics.gd15.value!==null||entity.sampleGames!==1)throw new Error('Expected true unavailable/small-sample source record not found');
const baselines=structuredClone(data.regionalComparisonsByRegion.LPL.positional.filter(p=>p.role==='TOP'));
for(const b of baselines)for(const p of b.distribution){p.displayName=region.playerStatsByKey[`${p.teamId}|${p.playerId}|TOP`]?.displayName;p.playerId=null;}
const view={region:'LPL',entity,baselines,definitions:data.metricDictionary.metrics.filter(m=>m.id.startsWith('player.')&&m.id.split('.')[1] in entity.metrics),snapshotDate:data.metadata.sourceSnapshotDate,scopeNote:'真实一局换位样本，GD@15/CSD@15缺少源字段。',champions:{}};
const body=renderToStaticMarkup(React.createElement(PlayerStatistics,{view}));
const css=await readFile('components/team-profile/statistics.module.css','utf8');const globals=await readFile('app/globals.css','utf8');
await mkdir(output,{recursive:true});await writeFile(output+'/unavailable.html',`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="http://127.0.0.1:3022/"><title>本地组件验收 · 真实缺失样本</title><style>${globals}\n${css}</style></head><body><main class="shell"><h1>Photic · NIP · 上路</h1><p>私人静态组件验收：真实一局换位记录，不是新增Worlds档案。仅验证空值、小样本布局；交互在正式本地页面验收。</p>${body}</main></body></html>`);
if(!body.includes('暂无有效数据')||!body.includes('小样本'))throw new Error('Unavailable/small sample rendering failed');
console.log('真实UNAVAILABLE与小样本组件渲染通过。');
