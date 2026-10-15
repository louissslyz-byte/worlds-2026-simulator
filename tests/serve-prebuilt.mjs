// Local handler harness, not an implementation of Vercel's CDN or cloud runtime.
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {readFile} from 'node:fs/promises';
const directory=resolve('.vercel/output/functions/teams/[slug].func');
const config=JSON.parse(await readFile(directory+'/.vc-config.json','utf8'));
if(config.runtime!=='nodejs22.x'||config.filePathMap)throw Error('Standalone Node22 function required');
const handler=createRequire(import.meta.url)(directory+'/'+config.handler);
const server=createServer((req,res)=>Promise.resolve(handler(req,res)).catch(()=>{res.statusCode=500;res.end('Prebuilt local handler failed');}));
server.listen(3025,'127.0.0.1',()=>console.log('Local prebuilt function handler on loopback:3025'));
