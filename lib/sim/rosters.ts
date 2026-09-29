/** Publicly listed five-player lineups. Kept separate from simulation team data. */
export type PlayerRole = 'TOP' | 'JUNGLE' | 'MID' | 'BOT' | 'SUPPORT';
export type TeamRoster = { players: readonly string[]; source: string };

export const playerRoles: readonly { key: PlayerRole; label: string }[] = [
  { key: 'TOP', label: '上路' },
  { key: 'JUNGLE', label: '打野' },
  { key: 'MID', label: '中路' },
  { key: 'BOT', label: '下路' },
  { key: 'SUPPORT', label: '辅助' },
];

// Player order follows playerRoles. Seed placeholders deliberately have no lineup:
// their qualified teams cannot be matched to a specific seed yet.
export const teamRosters: Readonly<Record<string, TeamRoster>> = {
  GEN: { players: ['Kiin', 'Canyon', 'Chovy', 'Ruler', 'Duro'], source: 'https://liquipedia.net/leagueoflegends/Gen.G_Esports' },
  HLE: { players: ['Zeus', 'Kanavi', 'Zeka', 'Gumayusi', 'Delight'], source: 'https://liquipedia.net/leagueoflegends/Hanwha_Life_Esports' },
  T1: { players: ['Doran', 'Oner', 'Faker', 'Peyz', 'Keria'], source: 'https://liquipedia.net/leagueoflegends/T1' },
  DK: { players: ['Siwoo', 'Lucid', 'ShowMaker', 'Smash', 'Career'], source: 'https://liquipedia.net/leagueoflegends/Dplus' },
  AL: { players: ['Breathe', 'Tarzan', 'Shanks', 'Hope', 'Kael'], source: 'https://liquipedia.net/leagueoflegends/Anyone%27s_Legend' },
  BLG: { players: ['Bin', 'Xun', 'Knight', 'Viper', 'ON'], source: 'https://liquipedia.net/leagueoflegends/Bilibili_Gaming' },
  TES: { players: ['ZUIAN', 'Tian', 'Creme', 'JackeyLove', 'Zhuo'], source: 'https://liquipedia.net/leagueoflegends/Top_Esports' },
  IG: { players: ['TheShy', 'Wei', 'Rookie', 'JiaQi', 'Meiko'], source: 'https://liquipedia.net/leagueoflegends/Invictus_Gaming' },
  G2: { players: ['BrokenBlade', 'SkewMond', 'Caps', 'Hans Sama', 'Labrov'], source: 'https://liquipedia.net/leagueoflegends/G2_Esports' },
  MKOI: { players: ['Myrwn', 'Elyoya', 'Jojopyun', 'Supa', 'Alvaro'], source: 'https://liquipedia.net/leagueoflegends/Movistar_KOI' },
  KC: { players: ['Canna', 'Yike', 'kyeahoo', 'Caliste', 'Busio'], source: 'https://liquipedia.net/leagueoflegends/Karmine_Corp' },
  TSW: { players: ['Pun', 'Hizto', 'Dire', 'Eddie', 'Bie'], source: 'https://liquipedia.net/leagueoflegends/World_Championship/2026' },
  CFO: { players: ['Rest', 'Shad0w', 'POUT', 'Doggo', 'Kino'], source: 'https://liquipedia.net/leagueoflegends/World_Championship/2026' },
  MVK: { players: ['Kratos', 'Gury', 'Chika', 'Harky', 'SiuLoong'], source: 'https://liquipedia.net/leagueoflegends/MVK_Esports' },
};
