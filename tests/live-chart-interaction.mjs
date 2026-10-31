import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {nearestChartHit,tooltipPosition,preciseProbability,timelineLabel,chartGeometry,lastVisibleNode} from '../components/live/chart-interaction.ts';
import {loadLiveView} from '../lib/live/view-server.ts';
import {curveEvents,curveLabels,applyOfficialEliminations,verifiedEliminationNode,fullSnapshotLabel} from '../lib/live/view.ts';
register('./tests/live-ui-loader.mjs',pathToFileURL('./'));globalThis.React=React;
const {NodeProbabilityDetail,LiveTournament}=await import('../components/live/live-tournament.tsx');
assert.equal(preciseProbability(0),'0.000%');assert.equal(preciseProbability(1),'100.000%');assert.equal(preciseProbability(.00001),'0.001%');
const view=await loadLiveView(),original=JSON.stringify(view);
for(const team of view.teams)for(let i=0;i<view.nodes.length;i++){
 const node=view.nodes[i],point=team.points[i];
 const html=renderToStaticMarkup(React.createElement(NodeProbabilityDetail,{id:'detail',teamLabel:team.shortName,nodeLabel:node.label,values:point.values,onClose(){}}));
 assert.equal((html.match(/<strong>/g)||[]).length,1);assert.equal((html.match(/<b>/g)||[]).length,3);
 assert.ok(html.includes('关闭数据点详情'));assert.ok(html.includes(node.label));
 for(const event of curveEvents){assert.ok(html.includes(curveLabels[event]));assert.ok(html.includes(preciseProbability(point.values[event].probability)));}
 for(const forbidden of [node.id,node.asOf,'北京时间','100,000','<time','<small',' / '])assert.ok(!html.includes(forbidden),forbidden);
}
// Nearest actual point, not a column-wide or topmost-SVG-element approximation.
const points=[{node:0,event:0,x:44,y:24},{node:0,event:1,x:44,y:25},{node:0,event:2,x:44,y:112}];
assert.equal(nearestChartHit(points,45,24).event,0);assert.equal(nearestChartHit(points,44,25).event,1);
assert.equal(nearestChartHit(points,58,112).event,2);assert.equal(nearestChartHit(points,59,112),null);
assert.equal(nearestChartHit(points,44,60),null);
assert.equal(nearestChartHit([{...points[0],event:0},{...points[0],event:1}],44,24).event,0);
for(const width of [320,390,768,1440])for(const x of [0,width-1])for(const y of [0,799]){
 const p=tooltipPosition(x,y,210,64,width,800);assert.ok(p.left>=8&&p.left+210<=width-8);assert.ok(p.top>=8&&p.top+64<=792);
}
for(const count of [6,7,8]){
 const data=structuredClone(view);while(data.nodes.length<count){data.nodes.push({...data.nodes[2],id:'test-future',label:'测试下一轮'});for(const t of data.teams)t.points.push({...t.points[2],snapshotId:'test-future'});}
 const html=renderToStaticMarkup(React.createElement(LiveTournament,{data}));
 assert.equal((html.match(/data-point-node=/g)||[]).length,data.teams.reduce((sum,t)=>sum+(t.eliminationNodeIndex===null?count:t.eliminationNodeIndex+1),0)*3);
 assert.equal((html.match(/data-curve=/g)||[]).length,57);
}
assert.equal(JSON.stringify(view),original);
const source=await readFile('components/live/live-tournament.tsx','utf8');assert.ok(!source.includes('onMouseEnter={()=>setSelected'));
console.log('Live chart interaction PASS: all 114 real detail panels, exact 0/tiny/100%, nearest/tied hits, viewport clamps, 6/7/8-node accessibility, untouched source values.');

assert.deepEqual(view.nodes.map(timelineLabel),['赛前','入围赛后','Swiss R1 后','Swiss R2 后','Swiss R3 后','Swiss R4 后']);
assert.equal(timelineLabel({kind:'SWISS-R5-COMPLETE',label:'第五轮结束'}),'Swiss R5 后');
assert.equal(timelineLabel({kind:'UNKNOWN',label:'未登记语义'}),'未登记语义');
assert.equal(timelineLabel({label:'瑞士轮第三轮后'}),'瑞士轮第三轮后'); // never guess
for(const team of view.teams){
 assert.equal(team.eliminationNodeIndex,['C9','FUR','MVK'].includes(team.id)?1:['AL','TSW'].includes(team.id)?4:['CFO','G2','TLAW'].includes(team.id)?5:null);
 const html=renderToStaticMarkup(React.createElement(LiveTournament,{data:{...view,matches:[],teams:[team]}}));
 const count=lastVisibleNode(view.nodes.length,team.eliminationNodeIndex)+1;
 assert.equal((html.match(/data-point-node=/g)||[]).length,count*3);
 assert.equal((html.match(/pointer-events="none" cx=/g)||[]).length,count*3);
 assert.equal((html.match(/data-elimination-node=/g)||[]).length,team.eliminationNodeIndex===null?0:1);
 for(const path of html.matchAll(/<polyline points="([^"]+)"/g))assert.equal(path[1].split(' ').length,count);
 if(team.eliminationNodeIndex!==null){assert.ok(!html.includes(`data-point-node="${team.eliminationNodeIndex+1}"`));assert.ok(html.includes('Swiss R2'));}
}
for(const count of [6,7]){
 const data=structuredClone(view);
 while(data.nodes.length<count){const r=data.nodes.length-1;data.nodes.push({id:`fixture-${r}`,kind:`SWISS-R${r}-COMPLETE`,label:`瑞士轮第${r}轮后`,asOf:`2026-10-${26+r}T00:00:00.000Z`});for(const t of data.teams)t.points.push(structuredClone(t.points.at(-1)));}
 const before=JSON.stringify(data.teams.find(t=>t.id==='GEN').points);
 applyOfficialEliminations(data,['GEN'],'2026-10-30T00:00:00.000Z');
 const gen=data.teams.find(t=>t.id==='GEN');assert.equal(gen.eliminationNodeIndex,5);assert.equal(JSON.stringify(gen.points),before);
 assert.equal(gen.points[5].values.swiss.probability,1); // achieved Swiss event stays 100%
 const html=renderToStaticMarkup(React.createElement(LiveTournament,{data:{...data,matches:[],teams:[gen]}}));
 assert.equal((html.match(/data-point-node=/g)||[]).length,18);assert.ok(!html.includes('data-point-node="6"'));
 const geo=chartGeometry(count);assert.equal(geo.x(5),Number([...html.matchAll(/<polyline points="([^"]+)"/g)][0][1].split(' ').at(-1).split(',')[0]));
 assert.equal(geo.x(1),chartGeometry(count).x(1));
}
assert.equal(verifiedEliminationNode([{asOf:'2026-10-01Z'},{asOf:'2026-10-03Z'}],'2026-10-02Z'),1);
assert.throws(()=>verifiedEliminationNode(view.nodes,'2030-01-01Z'),/no containing/);
assert.throws(()=>lastVisibleNode(4,4),/Invalid/);
const los=view.teams.find(t=>t.id==='LOS');assert.equal(los.points[4].values.champion.count,0);assert.equal(los.eliminationNodeIndex,null);
console.log('Timeline/termination PASS: global axes, explicit semantic labels, verified PI eliminations, zero-count survivor, verified Swiss R3 elimination, 6/7-node fixtures, source values unchanged.');

assert.equal(fullSnapshotLabel('SWISS-R3-COMPLETE'),'瑞士轮第三轮后');assert.equal(fullSnapshotLabel('UNKNOWN'),'UNKNOWN');

for(let round=1;round<=5;round++)assert.equal(timelineLabel({kind:`SWISS-R${round}-COMPLETE`,label:'完整节点名称'}),`Swiss R${round} 后`);
