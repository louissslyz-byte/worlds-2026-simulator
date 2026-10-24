import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {nearestChartHit,tooltipPosition,preciseProbability} from '../components/live/chart-interaction.ts';
import {loadLiveView} from '../lib/live/view-server.ts';
import {curveEvents,curveLabels} from '../lib/live/view.ts';
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
for(const count of [3,4]){
 const data=structuredClone(view);if(count===4){data.nodes.push({...data.nodes[2],id:'test-future',label:'测试下一轮'});for(const t of data.teams)t.points.push({...t.points[2],snapshotId:'test-future'});}
 const html=renderToStaticMarkup(React.createElement(LiveTournament,{data}));
 assert.equal((html.match(/data-point-node=/g)||[]).length,19*3*count);
 assert.equal((html.match(/data-curve=/g)||[]).length,57);
}
assert.equal(JSON.stringify(view),original);
const source=await readFile('components/live/live-tournament.tsx','utf8');assert.ok(!source.includes('onMouseEnter={()=>setSelected'));
console.log('Live chart interaction PASS: all 57 real detail panels, exact 0/tiny/100%, nearest/tied hits, viewport clamps, 3/4-node accessibility, untouched source values.');
