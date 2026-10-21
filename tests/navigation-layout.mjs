import assert from 'node:assert/strict';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
register('./tests/live-ui-loader.mjs',pathToFileURL('./'));
register('./tests/navigation-loader.mjs',pathToFileURL('./'));
globalThis.React=React;
const {SiteNavigation}=await import('../components/site-navigation.tsx');
const routes=['/','/rankings','/simulator','/teams','/live','/methodology','/simulator/new'];
for(const path of [...routes,'/teams/gen/chovy']){
 process.env.UI_TEST_PATHNAME=path;
 const html=renderToStaticMarkup(React.createElement(SiteNavigation));
 assert.equal((html.match(/aria-label="主导航"/g)||[]).length,1);
 for(const route of routes)assert.equal((html.match(new RegExp('href="'+route+'"','g'))||[]).length,2,'one link in each mutually exclusive responsive layout');
 assert.equal((html.match(/aria-current="page"/g)||[]).length,2,'one current page per layout');
 assert.ok(html.includes('aria-expanded="false"'));assert.ok(html.includes('aria-controls="site-more-navigation"'));
 if(path.startsWith('/teams'))assert.match(html,/当前：战队档案/);
}
delete process.env.UI_TEST_PATHNAME;
const css=await readFile('components/live/navigation.module.css','utf8');
assert.match(css,/\.desktopLinks\{display:none\}/);assert.match(css,/\.secondaryLinks\[data-open=true\]\{display:grid\}/);
assert.match(css,/min-height:44px/);assert.match(css,/color:#fff/);
const contrast=(a,b)=>{const lum=c=>c.map(v=>{const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);const values=[lum(a),lum(b)].sort((x,y)=>x-y);return (values[1]+.05)/(values[0]+.05);};
assert.ok(contrast([255,255,255],[0,122,181])>=4.5);assert.ok(contrast([255,255,255],[0,107,158])>=4.5);
console.log('Navigation: seven existing routes per responsive layout, nested team active, native toggle semantics, 44px targets and CTA AA contrast PASS.');
