// Unit fixture only: real Next Link/Image behavior is covered by production HTTP/browser tests.
export async function resolve(specifier,context,nextResolve){
 if(specifier==='next/link'||specifier==='next/image')return {url:'data:text/javascript,'+encodeURIComponent(`import React from '${new URL('../node_modules/react/index.js',import.meta.url).href}';export default function Fixture({children,...props}){delete props.unoptimized;return React.createElement('${specifier==='next/link'?'a':'img'}',props,children);}`),shortCircuit:true};
 return nextResolve(specifier,context);
}
export async function load(url,context,nextLoad){if(url.endsWith('.css'))return {format:'module',shortCircuit:true,source:'export default new Proxy({}, {get:(_,key)=>key});'};return nextLoad(url,context);}
