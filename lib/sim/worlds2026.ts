import {MODEL_VERSION} from './ratingConfig';
export const worlds2026 = {
  rulesVersion: 'worlds-2026-official-draw-v2',
  tournamentStateVersion: 'worlds-state-v2',
  rngVersion: 'lcg32-high-bucket-v1',
  samplingVersion: 'canonical-uniform-legal-pairings-v1',
  totalTeams: 19, playInTeams: 4, playInQualifiers: 1, playInGrandFinalReset: false, swissTeams: 16,
  winsToAdvance: 3, lossesToEliminate: 3, knockoutTeams: 8,
  seriesFormats: { playIn: 5, swissEarly: 1, swissDecider: 3, knockout: 5 } as const,
  drawRestrictions: { noRematch: true, avoidSameRegionRound1Only: true },
  swissDrawPools: [
    [['LCK',1],['LPL',1],['LCS',1],['LEC',1]],
    [['LCP',1],['CBLOL',1],['LCK',2],['LPL',2]],
    [['LCS',2],['LEC',2],['LCK',3],['LPL',3]],
    [['LCP',2],['LPL',4],['LCK',4],['PLAY_IN_WINNER',0]],
  ] as const,
  modelVersion: MODEL_VERSION,
  dataStatus: '已确认队伍使用 Riot GPR 快照；缺少 GPR 的席位使用既有模拟评分。比赛与夺冠概率由本站计算。',
} as const;
