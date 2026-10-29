// UI-only layout guards. Actual geometry, focus, scrolling and sessions are browser checks.
import assert from 'node:assert/strict';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
register('./tests/live-ui-loader.mjs',pathToFileURL('./'));globalThis.React=React;
const {default:Home}=await import('../app/page.tsx');
const home=renderToStaticMarkup(React.createElement(Home));
assert.equal((home.match(/class="home-odds-row"/g)||[]).length,5);
for(const value of ['27.1%','20.4%','18.2%'])assert.ok(home.includes(value));
const list=home.split('home-ranking-list')[1].split('比赛日程')[0];for(const score of ['1540','1519','1513','1475','1471'])assert.ok(list.includes(`GPR ${score}`));assert.ok(!list.includes('夺冠'));
const {default:Rankings}=await import('../app/rankings/page.tsx');
const ranking=renderToStaticMarkup(React.createElement(Rankings));
assert.match(ranking,/role="region" aria-label="完整实力榜，可横向滚动" tabindex="0"/);
assert.equal((ranking.match(/<tr>/g)||[]).length,20);assert.match(ranking,/进入淘汰赛/);assert.match(ranking,/夺冠概率/);
const setup=await readFile('app/simulator/new/page.tsx','utf8');assert.equal((setup.match(/onClick={start}/g)||[]).length,1);
assert.ok(setup.indexOf('onClick={start}')<setup.indexOf('className="tier-grid"'));
const sim=await readFile('app/simulator/page.tsx','utf8');assert.ok(sim.includes('aria-label="本轮比赛操作"'));assert.ok(sim.includes('aria-label="整赛段与全赛事操作"'));assert.ok(!/className="bracket-disclosure" open=/.test(sim));
// No data, model, Worker, session, release/config or original roster/road source changes.
// Live presentation is now in U2-C scope; data/curve protections live in data-presentation.mjs.
const protectedFiles=execFileSync('git',['ls-tree','-r','--name-only','7e96e33','--','lib/','app/methodology/','app/simulator/odds-worker.ts','next.config.ts','vercel.json','.gitignore','.vercelignore','components/team-profile/profile-roster.tsx','components/team-profile/qualification-path.tsx','app/teams/[slug]/[player]/page.tsx'],{encoding:'utf8'}).trim().split('\n').filter(file=>!['lib/live/view.ts','lib/live/view-server.ts','next.config.ts','components/team-profile/qualification-path.tsx','app/teams/[slug]/[player]/page.tsx'].includes(file));
for(const file of protectedFiles)assert.deepEqual(await readFile(file),execFileSync('git',['show',`7e96e33:${file}`]),file);
console.log('U2-AB layout: five forecast leaders, full ranking columns, keyboard scroll region, one early Start, distinct action scopes, collapsed paths and protected inputs PASS.');
