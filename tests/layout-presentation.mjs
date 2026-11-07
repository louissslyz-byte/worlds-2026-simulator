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
const home=renderToStaticMarkup(await Home());
assert.equal((home.match(/data-live-team=/g)||[]).length,4);assert.equal((home.match(/data-curve=/g)||[]).length,12);
assert.ok(home.indexOf('home-trends')<home.indexOf('home-matches'));assert.ok(home.indexOf('home-matches')<home.indexOf('home-data'));
for(const id of ['GEN','T1','BLG','KC'])assert.ok(home.includes('data-live-team="'+id+'"'));
assert.ok(!home.includes('home-odds-row'));assert.ok(!home.includes('CHAMPIONSHIP FORECAST'));
assert.ok(!home.includes('数据截至'));assert.ok(home.includes('MATCHUPS'));assert.ok(home.includes('Finished: Quarterfinals'));assert.ok(home.includes('Upcoming: Semifinals'));assert.ok(home.includes('赛前队伍战力排名'));assert.ok(home.includes('进入模拟器'));
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
