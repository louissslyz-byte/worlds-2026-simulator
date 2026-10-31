import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {register} from 'node:module';import {pathToFileURL} from 'node:url';
import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
register('./tests/live-ui-loader.mjs',pathToFileURL('./'));globalThis.React=React;
const {RegionMark}=await import('../components/tournament/region-mark.tsx');
const sources=JSON.parse(await readFile('public/region-logos/sources.json','utf8'));assert.equal(sources.assets.length,6);
for(const r of sources.assets){const b=await readFile(`public/region-logos/${r.region.toLowerCase()}.png`);assert.equal(createHash('sha256').update(b).digest('hex'),r.sha256);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 const html=renderToStaticMarkup(React.createElement(RegionMark,{region:r.region,showLabel:false}));assert.ok(html.includes(`aria-label="${r.region}"`));assert.ok(!html.includes('>'+r.region+'<'));assert.ok(renderToStaticMarkup(React.createElement(RegionMark,{region:r.region})).includes('>'+r.region+'<'));
}
console.log('Six official region assets: PNG/checksums, label and icon-only accessible variants PASS.');
