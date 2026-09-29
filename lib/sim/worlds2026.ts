export const worlds2026 = {
  totalTeams: 19, playInTeams: 4, playInQualifiers: 1, playInGrandFinalReset: false, swissTeams: 16,
  winsToAdvance: 3, lossesToEliminate: 3, knockoutTeams: 8,
  seriesFormats: { playIn: 5, swissEarly: 1, swissDecider: 3, knockout: 5 } as const,
  drawRestrictions: { noRematch: true, avoidSameRegion: true, seedRestriction: false },
  modelVersion: 'demo-elo-1.0',
  dataStatus: '参赛名单依据 LoL Esports 更新；未确定席位以赛区和种子号占位。系统评分与模拟概率由本站生成，非 Riot 官方预测',
} as const;
