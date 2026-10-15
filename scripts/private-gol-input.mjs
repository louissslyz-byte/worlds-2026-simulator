// Only used by the manual pool generator, never imported by application code.
import {realpathSync,statSync} from 'node:fs';
import {isAbsolute,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

export function privateGolResearchDirectory(env=process.env,projectRoot=fileURLToPath(new URL('../',import.meta.url))){
 if(env.NODE_ENV==='production'||env.CI||env.VERCEL)throw new Error('GoL research generation is disabled in production/CI/Vercel');
 const input=env.GOL_RESEARCH_DIR;
 if(!input||!isAbsolute(input))throw new Error('Set GOL_RESEARCH_DIR to an existing absolute private directory outside the repository');
 const root=realpathSync(projectRoot),directory=realpathSync(input);
 const outside=path=>{const rel=relative(root,path);return rel==='..'||rel.startsWith(`..${sep}`)||isAbsolute(rel);};
 if(!statSync(directory).isDirectory()||!outside(directory))throw new Error('GoL research directory must be outside the repository');
 for(const name of ['gol-segments.json','gol-match-rows.json']){
  const file=realpathSync(resolve(directory,name));
  if(!outside(file)||!statSync(file).isFile())throw new Error('GoL research files must be private files outside the repository');
 }
 return directory;
}
