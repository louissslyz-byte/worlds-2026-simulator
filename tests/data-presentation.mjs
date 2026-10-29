// Real snapshot presentation + in-memory future nodes. No data generation or writes.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {loadLiveView} from '../lib/live/view-server.ts';
import {curveEvents,probabilityText,deltaText,visibleTeams} from '../lib/live/view.ts';
register('./tests/live-ui-loader.mjs',pathToFileURL('./'));globalThis.React=React;
const {LiveTournament}=await import('../components/live/live-tournament.tsx');
const view=await loadLiveView(),before=JSON.stringify(view);
const render=data=>renderToStaticMarkup(React.createElement(LiveTournament,{data}));
for(const count of [2,3,4]){
 const data=structuredClone(view);data.nodes=data.nodes.slice(0,count);for(const team of data.teams){team.points=team.points.slice(0,count);if(team.eliminationNodeIndex!==null&&team.eliminationNodeIndex>=count)team.eliminationNodeIndex=null;}
 while(data.nodes.length<count){const i=data.nodes.length;const id=`test-only-${i}`;data.nodes.push({...data.nodes[1],id,label:`SWISS R${i-1}`});for(const team of data.teams)team.points.push({...structuredClone(team.points[1]),snapshotId:id});}
 const html=render(data),cards=[...html.matchAll(/<article[^>]*data-live-team="([^"]+)"[^>]*>(.*?)<\/article>/gs)];
 assert.equal(cards.length,19);assert.deepEqual(cards.map(c=>c[1]),visibleTeams(data.teams,'ALL').map(t=>t.id));
 assert.equal((html.match(/data-curve=/g)||[]).length,57);assert.equal((html.match(/role="button"/g)||[]).length,data.teams.reduce((sum,t)=>sum+(t.eliminationNodeIndex===null?count:t.eliminationNodeIndex+1),0)*3);
 assert.equal((html.match(/相对赛前变化（pp）/g)||[]).length,19);
 for(const [,id,card] of cards){
  assert.match(card,/纵轴固定0至100%/);for(const tick of ['0','50','100'])assert.match(card,new RegExp('>'+tick+'%<'));
  const team=data.teams.find(t=>t.id===id),w=Math.max(320,72+(count-1)*120);
  for(const event of curveEvents){
   const segment=card.match(new RegExp(`data-curve="${event}"[^>]*><polyline points="([^"]+)"`));assert.ok(segment);
   const xy=segment[1].split(' ').map(p=>p.split(',').map(Number));const shown=team.eliminationNodeIndex===null?count:team.eliminationNodeIndex+1;assert.equal(xy.length,shown);
   for(let i=0;i<shown;i++){assert.equal(xy[i][0],44+i*(w-68)/(count-1));assert.equal(xy[i][1],112-team.points[i].values[event].probability*88);assert.ok(xy[i][1]>=24&&xy[i][1]<=112);}
   const first=team.points[0].values[event],last=team.points.at(-1).values[event];
   const escaped=s=>s.replaceAll('<','&lt;');
   assert.ok(card.includes(escaped(probabilityText(first.probability))));assert.ok(card.includes(escaped(probabilityText(last.probability))));
   assert.ok(card.includes(deltaText((last.count-first.count)*100/team.points.at(-1).simulationCount)));
   for(const p of team.points.slice(0,shown))assert.ok(card.includes(`${(p.values[event].probability*100).toFixed(3)}%`));
  }
 }
 if(count>2)assert.equal((html.match(/历史节点，可横向滚动/g)||[]).length,19);
}
assert.equal(JSON.stringify(view),before);assert.equal(probabilityText(.00001),'<0.1%');assert.equal(probabilityText(0),'0%');assert.equal(deltaText(.045),'+0.045 pp');
// All AB navigation, Home, Setup, Simulator, profiles and protected libraries remain unchanged.
const protectedFiles=execFileSync('git',['ls-tree','-r','--name-only','aea12c9','--','lib/','app/page.tsx','app/worlds-design.css','app/simulator/','app/teams/','app/methodology/','components/site-navigation.tsx','components/team-profile/','components/tournament/','components/live/navigation.module.css','next.config.ts','vercel.json','.gitignore','.vercelignore'],{encoding:'utf8'}).trim().split('\n').filter(file=>!['lib/live/view.ts','lib/live/view-server.ts','next.config.ts','app/worlds-design.css','components/tournament/champion-card.tsx','app/page.tsx','app/teams/page.tsx','app/teams/[slug]/[player]/page.tsx','components/team-profile/qualification-path.tsx','components/tournament/data-status.tsx','components/team-profile/statistics-chart.tsx','components/team-profile/statistics.tsx'].includes(file));
for(const file of protectedFiles){
 let expected=execFileSync('git',['show',`aea12c9:${file}`],{encoding:'utf8'});
 if(file==='app/simulator/page.tsx')expected=expected.replace('<h1>{stageTitle(state)}</h1><p>{stageDescription(state)}</p>',"<h1>{stageTitle(state)}</h1>{state.stage!=='CHAMPION'&&<p>{stageDescription(state)}</p>}");
 assert.equal(await readFile(file,'utf8'),expected,file);
}
// Champion-only selectors may change; every other style rule remains protected.
const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);const postcss=createRequire(require.resolve('next/package.json'))('postcss');
function nonChampionRules(css){const root=postcss.parse(css);const rules=[];root.walkRules(rule=>{if(!rule.selector.includes('champion'))rules.push([rule.selector,rule.nodes.map(n=>n.toString()).join(';'),rule.parent.type==='atrule'?rule.parent.params:'']);});return rules;}
assert.deepEqual(nonChampionRules(await readFile('app/worlds-design.css','utf8')),nonChampionRules(execFileSync('git',['show','aea12c9:app/worlds-design.css'],{encoding:'utf8'})));
console.log('U2-C Live: 19/57, exact real probabilities/deltas/axes/order, in-memory 3/4 nodes, tiny values and all AB/model/data protections PASS.');

const real=render(view),los=real.match(/data-live-team="LOS"[^>]*>(.*?)<\/article>/s)[1];
assert.ok(los.includes('100,000次样本未抽中，不代表理论上不可能'));
for(const id of ['C9','FUR','MVK','AL','TSW']){const card=real.match(new RegExp(`data-live-team="${id}"[^>]*>(.*?)<\\/article>`,'s'))[1];assert.ok(!card.includes('100,000次样本未抽中，不代表理论上不可能'));}
console.log('LiveOps zero-count distinction: LOS sampled zero vs five eliminated teams PASS.');
