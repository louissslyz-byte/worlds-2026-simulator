export const worlds2026 = {
  totalTeams: 19, playInTeams: 4, playInQualifiers: 1, playInGrandFinalReset: false, swissTeams: 16,
  winsToAdvance: 3, lossesToEliminate: 3, knockoutTeams: 8,
  seriesFormats: { playIn: 5, swissEarly: 1, swissDecider: 3, knockout: 5 } as const,
  drawRestrictions: { noRematch: true, avoidSameRegion: true, seedRestriction: false },
  modelVersion: 'gpr-elo-v1.0',
  dataStatus: '已确认队伍使用 Riot GPR 快照；未确认种子席位使用既有模拟评分。比赛与夺冠概率由本站计算。',
} as const;
