import { teams } from './data';
import { ratingConfig } from './ratingConfig';
import type { Team,Tier,TierList } from './types';
export interface RatingProvider { getRatings():Record<string,number> }
export class SystemRatingProvider implements RatingProvider { getRatings(){return Object.fromEntries(teams.map(t=>[t.id,t.rating]))} }
export function validateTierList(tierList:TierList):string|null { const ids=Object.values(tierList).flat(); if(ids.length!==teams.length)return `必须分配全部 ${teams.length} 支队伍。`; if(new Set(ids).size!==ids.length)return '队伍不能重复。'; if(ids.some(id=>!teams.some(t=>t.id===id)))return '存在未知队伍。'; return null }
export function generateRatingsFromTierList(tierList:TierList):Record<string,number> { const error=validateTierList(tierList); if(error)throw new Error(error); const result:Record<string,number>={}; (Object.keys(tierList) as Tier[]).forEach(tier=>{const list=tierList[tier];list.forEach((id,index)=>{result[id]=ratingConfig.tierBase[tier]+((list.length-1)/2-index)*ratingConfig.withinTierStep})});return result }
export class CustomTierRatingProvider implements RatingProvider { constructor(private tierList:TierList){} getRatings(){return generateRatingsFromTierList(this.tierList)} }
export function defaultTierList():TierList { const sorted=[...teams].sort((a,b)=>b.rating-a.rating);return {S:sorted.slice(0,3).map(t=>t.id),A:sorted.slice(3,7).map(t=>t.id),B:sorted.slice(7,12).map(t=>t.id),C:sorted.slice(12,16).map(t=>t.id),D:sorted.slice(16).map(t=>t.id)} }
export function gameProbability(a:number,b:number){return 1/(1+Math.pow(10,(b-a)/ratingConfig.eloDivisor))}
export function seriesProbability(p:number,format:1|3|5){const need=(format+1)/2; let sum=0;for(let wins=need;wins<=format;wins++){let choose=1;for(let i=1;i<=wins;i++)choose=choose*(format-i+1)/i;sum+=choose*Math.pow(p,wins)*Math.pow(1-p,format-wins)}return sum}
export function teamRating(team:Team,ratings:Record<string,number>){return ratings[team.id]??team.rating}
