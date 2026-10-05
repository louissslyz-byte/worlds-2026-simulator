import type {PlayerRole} from '../sim/rosters';

export type Source = {label:string; url:string; checkedAt:string; kind:'OFFICIAL'|'SECONDARY'};
export type Verified<T> = {value:T; source:Source};
export type Nationality = {name:string; countryCode:string};
export type PlayerBiography = {
 realName?:Verified<string>;
 birthDate?:Verified<string>;
 reportedAge?:Verified<number>;
 nationalities?:Verified<Nationality[]>;
 notes?:string[];
};
export type ProfilePlayer = PlayerBiography & {
 id:string; slug:string; playerId:string; teamId:string; role:PlayerRole;
};
export type QualificationStep = {
 stage:string; date:string; opponent:string; score:[number,number]; source:Source;
};
export type RegularSeasonStanding = {
 wins:number; losses:number; rank:number; rankTied:boolean; group:string|null;
 scope:string; source:Source; recordSource?:Source; note?:string;
 stageRecord?:{wins:number;losses:number};
};
export type ChampionStat = {championId:string; championName:string; gamesPlayed:number; wins:number};
export type ChampionPool = {
 status:'VERIFIED'|'PARTIAL'|'UNAVAILABLE'; scopeId:string; source:Source|null;
 completeness:'COMPLETE'|'PARTIAL'|'UNVERIFIED'; stats:ChampionStat[]; reason?:string;
 missingSegments?:string[];
 sources?:Source[]; snapshotDate?:string; note?:string;
 segments?:{tournament:string;sourceUrl:string;totalGames:number;totalWins:number}[];
};
export type Stage3Scope = {
 id:string; region:string; label:string; includes:readonly string[]; excludes:readonly string[];
 source:Source; status:'VERIFIED'|'UNVERIFIED';
};
