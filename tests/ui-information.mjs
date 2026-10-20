// UI-only tests. No probability generation, model changes or private research reads.
import assert from 'node:assert/strict';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
register('./tests/live-ui-loader.mjs',pathToFileURL('./'));globalThis.React=React;
const {InfoDisclosure}=await import('../components/ui/info-disclosure.tsx');
const html=renderToStaticMarkup(React.createElement(InfoDisclosure,{label:'数据与计算方法'},React.createElement('p',null,'说明保留')));
assert.match(html,/<details/);assert.ok(!html.includes(' open='));assert.match(html,/aria-label="数据与计算方法"/);assert.ok(html.includes('说明保留'));
const {default:Rankings}=await import('../app/rankings/page.tsx');
const ranking=renderToStaticMarkup(React.createElement(Rankings));
assert.ok(ranking.includes('Riot GPR 实力榜'));assert.ok(ranking.includes('数据与计算方法'));assert.ok(ranking.includes('不是 Riot 官方夺冠预测'));assert.ok(ranking.includes('/methodology'));assert.ok(ranking.includes('暂无'));
assert.equal((ranking.match(/<tr>/g)||[]).length,20);
const {default:Home}=await import('../app/page.tsx');const home=renderToStaticMarkup(React.createElement(Home));assert.ok(home.includes('关于预测'));assert.ok(home.includes('创建模拟'));
for(const path of execFileSync('git',['ls-files','lib/','app/methodology/'],{encoding:'utf8'}).trim().split('\n')){
 const before=execFileSync('git',['show',`d2dd830:${path}`]);assert.deepEqual(await readFile(path),before,`Protected data/model changed: ${path}`);
}
const live=await readFile('components/live/live-tournament.tsx','utf8');assert.ok(live.includes('非实时更新'));assert.ok(live.includes('beijing(data.asOf)'));assert.ok(live.includes('关于概率'));assert.ok(live.includes('时间待核实'));
console.log('U1: native collapsed disclosure, source/methodology links, 19 rankings, all lib data/model and Methodology unchanged PASS.');
const ts=(await import('typescript')).default;
for(const path of ['app/simulator/page.tsx','app/simulator/new/page.tsx']){
 const before=execFileSync('git',['show',`d2dd830:${path}`],{encoding:'utf8'}),after=await readFile(path,'utf8');
 function logic(text){const tree=ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const component=tree.statements.find(n=>ts.isFunctionDeclaration(n)&&n.modifiers?.some(m=>m.kind===ts.SyntaxKind.DefaultKeyword));return component.body.statements.filter(n=>!ts.isReturnStatement(n)).map(n=>n.getText(tree));}
 assert.deepEqual(logic(after),logic(before),`${path}: session/model/state callbacks must be byte-identical`);
}
console.log('Simulator AST guard: all component setup/state/callback statements unchanged; only returned presentation differs.');
