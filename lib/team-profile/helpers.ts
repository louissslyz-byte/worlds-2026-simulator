import type {ChampionStat, ProfilePlayer} from './types';

export function playerSlug(playerId:string){return playerId.toLowerCase().replace(/\s+/g,'-');}
export function countryFlag(code:string){
 return /^[A-Z]{2}$/.test(code)?String.fromCodePoint(...[...code].map(c=>127397+c.charCodeAt(0))):'';
}
/** Calendar age on the supplied China Standard Time date, without time-of-day rounding. */
export function ageFromBirthDate(birthDate:string,now=new Date()):number|null{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(birthDate))return null;
 const birth=new Date(`${birthDate}T00:00:00Z`);
 if(Number.isNaN(birth.valueOf())||birth.toISOString().slice(0,10)!==birthDate)return null;
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const current=Object.fromEntries(parts.map(p=>[p.type,p.value]));
 const [y,m,d]=birthDate.split('-').map(Number);
 const age=Number(current.year)-y-(Number(current.month)<m||(Number(current.month)===m&&Number(current.day)<d)?1:0);
 return age>=0&&age<120?age:null;
}
export function playerAge(player:ProfilePlayer,now=new Date()){
 if(player.birthDate)return ageFromBirthDate(player.birthDate.value,now);
 return player.reportedAge?.value??null;
}
export function sortedChampionStats(stats:readonly ChampionStat[]){
 return [...stats].sort((a,b)=>b.gamesPlayed-a.gamesPlayed||a.championName.localeCompare(b.championName,'en'));
}
export function championWinRate(stat:ChampionStat){return `${(100*stat.wins/stat.gamesPlayed).toFixed(1)}%`;}
