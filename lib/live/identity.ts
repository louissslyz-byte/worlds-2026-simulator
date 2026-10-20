// Read existing identities only: no rating/GPR provider or simulation imports.
import {worldsTeamSnapshot} from '../sim/teamSnapshot';
export const liveTeams=worldsTeamSnapshot.map(({id,name,shortName,slug,region,officialSeed,playIn,logo})=>({id,name,shortName,slug,region,officialSeed,playIn,logo}));
const normalize=(value:string)=>value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const aliases:Record<string,string>={
 TL:'TLAW','Team Liquid':'TLAW','Gen.G Esports':'GEN','Shanghai Invictus Gaming Meituan':'IG','Los Grandes':'LOS',
};
const index=new Map<string,string>();
for(const team of liveTeams)for(const name of [team.id,team.name,team.shortName,team.slug])add(name,team.id);
for(const [alias,teamId] of Object.entries(aliases))add(alias,teamId);
function add(name:string,teamId:string){
 const key=normalize(name),existing=index.get(key);
 if(!liveTeams.some(team=>team.id===teamId)||existing&&existing!==teamId)throw Error('Live team alias collision');
 index.set(key,teamId);
}
export function resolveOfficialTeamId(name:string):string{
 const id=index.get(normalize(name));if(!id)throw Error('Unknown official team identity');return id;
}
