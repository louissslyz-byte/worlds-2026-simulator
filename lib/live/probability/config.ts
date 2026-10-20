export const LIVE_ODDS={
 generatorVersion:'live-conditional-mc-v1.0',eventDefinitionVersion:'worlds-five-advancement-events-v1',
 historyId:'worlds-live-probability-history-v1',simulationCount:100_000,
 factsSnapshotId:'worlds-2026-post-play-in-v1',
 factsInputSHA256:'e71bb7d0d9828b5b6a1b2f7f2323fe72043c8d057289f7fc64698c867591748b',
 ratingInputSHA256:'50ecd08a842afff2cfb2146a92fa67b929c42c121f831a6e110de9185a7ed8cb',
 sourceCacheSHA256:'8ce8f63929caca68eff760377e16729df419f20a31c05f103c7e991849baad78',
 pre:{id:'worlds-2026-pre-tournament-probability-v1',asOf:'2026-10-15T17:59:59.000Z',randomSeed:2026,sessionSeed:2026},
 post:{id:'worlds-2026-post-play-in-probability-v1',asOf:'2026-10-19T12:00:00.000Z',randomSeed:20261019,sessionSeed:2026},
} as const;
export const EVENTS=['swiss','knockout','semifinal','final','champion'] as const;
export const ENGINE_FILES=['engine.ts','draws.ts','random.ts','monteCarlo.ts','validation.ts','worlds2026.ts','sessionCompatibility.ts','types.ts','oddsMetadata.ts'] as const;
export const STRENGTH_FILES=['gprSnapshot.ts','ratingConfig.ts','ratings.ts','riotGpr.ts','gprProbability.ts','teamSnapshot.ts','oddsConfig.ts'] as const;
export const GENERATOR_FILES=['lib/live/probability/config.ts','lib/live/probability/model.ts','lib/live/probability/adapter.ts','lib/live/probability/schema.ts','lib/live/probability/snapshot.ts','lib/live/probability/archive.ts','lib/live/probability/generate.ts','scripts/generate-live-odds.mjs','scripts/validate-live-odds.mjs'] as const;
