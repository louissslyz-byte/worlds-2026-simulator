export const worlds2026 = {
  totalTeams: 19, playInTeams: 4, playInQualifiers: 1, playInGrandFinalReset: false, swissTeams: 16,
  winsToAdvance: 3, lossesToEliminate: 3, knockoutTeams: 8,
  seriesFormats: { playIn: 5, swissEarly: 1, swissDecider: 3, knockout: 5 } as const,
  drawRestrictions: { noRematch: true, avoidSameRegion: true, seedRestriction: false },
  modelVersion: 'demo-elo-1.0',
  dataStatus: '示例队伍与示例评分；非 2026 官方参赛名单或 Riot 预测',
} as const;
