import type {Team} from './types';

export const teamSnapshotMetadata={
 source:'LoL Esports Worlds qualifying teams',
 sourceUrl:'https://lolesports.com/en-US/tournament/115660540725177488/overview',
 sourceUpdatedAt:'2026-10-11',snapshotUpdatedAt:'2026-10-11',
 version:'worlds-teams-2026-10-11-v4',
 seedSource:'LoL Esports Worlds 2026 Primer and official LCS/CBLOL finals results.',
 seedSourceUrls:['https://lolesports.com/en-GB/news/worlds-2026-primer','https://lolesports.com/en-US/leagues/cblol-brazil%2Cfirst_stand%2Clck%2Clcs%2Clec%2Clpl%2Cmsi%2Cworlds','https://lolesports.com/pt-BR/leagues/cblol-brazil'],
};
// The numeric seed is the configurable simulation assumption, never an official
// claim. An unknown officialSeed is displayed as TBD even for qualified teams.
type Row=[id:string,name:string,region:string,seed:number,rating:number,officialSeed:number|null];
const rows:Row[]=[
 ['GEN','Gen.G','LCK',1,1900,1],['HLE','Hanwha Life Esports','LCK',2,1825,2],
 ['T1','T1','LCK',3,1850,3],['DK','Dplus KIA','LCK',4,1660,4],
 ['AL','Anyone’s Legend','LPL',1,1805,1],['BLG','Bilibili Gaming','LPL',2,1875,2],
 ['TES','Top Esports','LPL',3,1755,3],['IG','Invictus Gaming','LPL',4,1670,4],
 ['G2','G2 Esports','LEC',1,1780,1],['MKOI','Movistar KOI','LEC',2,1690,2],
 ['KC','Karmine Corp','LEC',3,1650,3],['TSW','Team Secret Whales','LCP',1,1710,1],
 ['CFO','CTBC Flying Oyster','LCP',2,1665,2],['MVK','MVK Esports','LCP',3,1620,3],
 ['LYON','LYON','LCS',2,1730,2],['TLAW','Team Liquid Alienware','LCS',1,1680,1],
 ['C9','Cloud9 Kia','LCS',3,1635,3],['LOS','LOS','CBLOL',1,1600,1],
 ['FUR','FURIA','CBLOL',2,1575,2],
];
export const worldsTeamSnapshot:Team[]=rows.map(([id,name,region,seed,rating,officialSeed])=>{
 const confirmed=true;
 return {id,name,shortName:confirmed?id:'TBD',slug:id.toLowerCase(),region,seed,officialSeed,rating,
  playIn:(region==='LEC'||region==='LCP'||region==='LCS')?seed===3:region==='CBLOL'&&seed===2,
  confirmed,qualificationStatus:confirmed?'CONFIRMED':'TBD',gprKey:confirmed?id:null,
  logo:confirmed?`/team-logos/${id.toLowerCase()}.png`:'',...teamSnapshotMetadata};
});
