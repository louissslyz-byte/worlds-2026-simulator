import type {PlayerBiography, Source} from './types';

export const profileCheckedAt='2026-10-05';
export function official(label:string,url:string):Source{return {label,url,checkedAt:profileCheckedAt,kind:'OFFICIAL'};}
export function secondary(label:string,url:string):Source{return {label,url,checkedAt:profileCheckedAt,kind:'SECONDARY'};}
const geng=official('Gen.G 官网','https://geng.gg/pages/league-of-legends');
const hle=official('HLE 官网公开选手资料','https://hle.kr/en');
const t1=official('LoL Esports · T1','https://lolesports.com/en-US/teams/t1');
const ig=official('LoL Esports · IG','https://lolesports.com/en-US/teams/invictus-gaming');
const liquid=official('LoL Esports · TLAW','https://lolesports.com/en-US/teams/team-liquid');
const c9=official('Cloud9 官网','https://cloud9.gg/teams/league-of-legends/');
const name=(value:string,source:Source):PlayerBiography=>({realName:{value,source}});
const g2=(slug:string)=>official('G2 官方选手页',`https://g2esports.com/blogs/team-member/${slug}`);
// A biography is keyed by the existing team id and exact player id. It is never
// consumed by the simulator, its roster strip, strength inputs or odds cache.
export const biographies:Readonly<Record<string,PlayerBiography>>={
 'GEN:Kiin':name('Gi In Kim',geng), 'GEN:Canyon':name('Geon Bu Kim',geng),
 'GEN:Chovy':name('Ji Hun Jung',geng), 'GEN:Ruler':name('Park Jae-hyuk',geng), 'GEN:Duro':name('Joo Min-kyu',geng),
 'HLE:Zeus':{...name('CHOI WOOJE',hle),birthDate:{value:'2004-01-31',source:hle}},
 'HLE:Kanavi':{...name('SEO JINHYEOK',hle),birthDate:{value:'2000-11-02',source:hle}},
 'HLE:Zeka':{...name('KIM GEONWOO',hle),birthDate:{value:'2002-11-28',source:hle}},
 'HLE:Gumayusi':{...name('LEE MINHYUNG',hle),birthDate:{value:'2002-02-06',source:hle}},
 'HLE:Delight':{...name('YU HWANJUNG',hle),birthDate:{value:'2002-09-12',source:hle}},
 'T1:Doran':name('HYEONJUN CHOI',t1), 'T1:Oner':name('HYUNJUN MUN',t1),
 'T1:Faker':name('Lee Sang-hyeok',official('Riot · Hall of Legends','https://lolesports.com/en-GB/news/lol-esports-welcomes-faker-to-hall-of-legends')),
 'T1:Peyz':name('SOOHWAN KIM',t1), 'T1:Keria':name('MINSEOK RYU',t1),
 'DK:ShowMaker':name('Heo Su',official('LoL Esports · MSI 2021','https://lolesports.com/news/2021-msi-')),
 'IG:TheShy':name('SEUNG-LOK KANG',ig), 'IG:Wei':name('YANG-WEI YAN',ig),
 'IG:Rookie':name('UI-JIN SONG',ig), 'IG:JiaQi':name('JIAQI ZI',ig), 'IG:Meiko':name('YE TIAN',ig),
 'TLAW:Morgan':name('RUHAN PARK',liquid), 'TLAW:Josedeodo':name('BRANDON VILLEGAS',liquid),
 'TLAW:Quid':name('HYEONSEUNG LIM',liquid), 'TLAW:Yeon':name('SEAN SUNG',liquid), 'TLAW:CoreJJ':name('YONGIN JO',liquid),
 'C9:Thanatos':name('Seung-gyu Park',c9), 'C9:Blaber':name('Robert Huang',c9), 'C9:Vulcan':name('Philippe Laflamme',c9),
 'G2:BrokenBlade':{...name('Sergen Çelik',g2('broken-blade')),reportedAge:{value:26,source:g2('broken-blade')},nationalities:{value:[{name:'Germany',countryCode:'DE'},{name:'Turkey',countryCode:'TR'}],source:g2('broken-blade')}},
 'G2:SkewMond':{reportedAge:{value:22,source:g2('skewmond')},nationalities:{value:[{name:'France',countryCode:'FR'},{name:'Lebanon',countryCode:'LB'}],source:g2('skewmond')},notes:['官方页面的姓名标题与正文拼写不一致，姓名待核验。']},
 'G2:Caps':{...name('Rasmus Winther',g2('caps')),reportedAge:{value:26,source:g2('caps')},nationalities:{value:[{name:'Denmark',countryCode:'DK'}],source:g2('caps')}},
 'G2:Hans Sama':{...name('Steven Liv',g2('hans-sama')),reportedAge:{value:27,source:g2('hans-sama')},nationalities:{value:[{name:'France',countryCode:'FR'}],source:g2('hans-sama')}},
 'G2:Labrov':{reportedAge:{value:24,source:g2('labrov')},nationalities:{value:[{name:'Greece',countryCode:'GR'}],source:g2('labrov')},notes:['官方页面的姓名标题与正文拼写不一致，姓名待核验。']},
};

export const officialRosterSources:Readonly<Record<string,Source>>={
 GEN:geng,HLE:hle,T1:t1,IG:ig,
 G2:official('G2 官方阵容','https://g2esports.com/pages/team/league-of-legends'),
 KC:official('KC 官方阵容','https://www.karminecorp.fr/en/pages/nos-joueurs-league-of-legends'),
};

// Only this module supplements teams without an existing roster. Null is an
// unresolved starter slot, not a substitute promoted into that position.
export const additionalRosters:Readonly<Record<string,{players:readonly (string|null)[];source:Source;note?:string}>>={
 TLAW:{players:['Morgan','Josedeodo','Quid','Yeon','CoreJJ'],source:official('Riot · 2026 LCS 阵容','https://lolesports.com/news/lcs-2026-address')},
 LYON:{players:['Dhokla','Inspired','Saint','Berserker','Isles'],source:secondary('Liquipedia · LYON','https://liquipedia.net/leagueoflegends/LYON'),note:'当前阵容参考 Liquipedia；Riot 7 月官方赛事照片亦列出这五名选手。Worlds 登记名单待核验。'},
 C9:{players:['Thanatos','Blaber','Loki','Tactical','Vulcan'],source:secondary('Liquipedia · Worlds 2026 C9 首发','https://liquipedia.net/leagueoflegends/World_Championship/2026'),note:'首发采用 Loki、Tactical；Liquipedia Worlds 阵容将 APA、Zven 列为替补。'},
 LOS:{players:['Zest','Curse','Feisty','Duduhh','Ackerman'],source:secondary('Liquipedia · LOS','https://liquipedia.net/leagueoflegends/LOS')},
 FUR:{players:['Guigo','Tatu','Tutsz','Ayu','JoJo'],source:secondary('Leaguepedia · FURIA','https://lol.fandom.com/wiki/FURIA')},
};
