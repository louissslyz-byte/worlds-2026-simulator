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
for(const file of execFileSync('git',['ls-files','lib/','app/methodology/'],{encoding:'utf8'}).trim().split('\n'))assert.deepEqual(await readFile(file),execFileSync('git',['show',`d66b9d8:${file}`]),file);
const player=await readFile('app/teams/[slug]/[player]/page.tsx','utf8');
assert.match(player,/label="统计范围与来源"/);assert.match(player,/label="选手资料来源"/);assert.match(player,/不自动同步/);assert.match(player,/pool\.reason/);assert.match(player,/pool\.sources/);assert.match(player,/scope\.includes/);
console.log('U2 text: data freshness/seed uncertainty, real GPR/fallback, manual+locked status, one round mode, placeholders, collapsed sources, protected files PASS.');
