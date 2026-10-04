import type {Team} from './types';

export const teamSnapshotMetadata={
 source:'LoL Esports Worlds qualifying teams',
 sourceUrl:'https://lolesports.com/en-US/tournament/115660540725177488/overview',
 sourceUpdatedAt:'2026-10-05',snapshotUpdatedAt:'2026-10-05',
 version:'worlds-teams-2026-10-05-v3',
 seedSource:'LPL/LCK/LEC: previously user-confirmed order; LCP: completed regional results. LCS/CBLOL: official seed unknown.',
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
 ['LYON','LYON','LCS',1,1730,null],['TLAW','Team Liquid Alienware','LCS',2,1680,null],
 ['C9','Cloud9 Kia','LCS',3,1635,null],['LOS','LOS','CBLOL',1,1600,null],
 ['FUR','FURIA','CBLOL',2,1575,null],
];
export const worldsTeamSnapshot:Team[]=rows.map(([id,name,region,seed,rating,officialSeed])=>{
 const confirmed=true;
 return {id,name,shortName:confirmed?id:'TBD',slug:id.toLowerCase(),region,seed,officialSeed,rating,
  playIn:(region==='LEC'||region==='LCP'||region==='LCS')?seed===3:region==='CBLOL'&&seed===2,
  confirmed,qualificationStatus:confirmed?'CONFIRMED':'TBD',gprKey:confirmed?id:null,
  logo:confirmed?`/team-logos/${id.toLowerCase()}.png`:'',...teamSnapshotMetadata};
});
