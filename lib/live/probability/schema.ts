import {z} from 'zod';
const hash=z.string().regex(/^[a-f0-9]{64}$/),instant=z.string().datetime({offset:true}),version=z.string().min(1);
const count=z.number().int().min(0).max(100_000),prob=z.number().min(0).max(1);
export const probabilityTeamSchema=z.object({teamId:version,swissCount:count,knockoutCount:count,semifinalCount:count,finalCount:count,championCount:count,swissProbability:prob,knockoutProbability:prob,semifinalProbability:prob,finalProbability:prob,championProbability:prob}).strict();
export const probabilitySnapshotSchema=z.object({
 schemaVersion:z.literal('live-probability-snapshot-v1.0'),snapshotId:version,label:z.enum(['PRE-TOURNAMENT','POST-PLAY-IN']),asOf:instant,revisionOf:version.nullable(),conditioningDescription:version,
 factsSnapshotId:version.nullable(),factsInputSHA256:hash.nullable(),knownDrawIds:z.array(version),
 rulesVersion:version,stateVersion:version,strengthVersion:version,modelVersion:version,probabilityModelVersion:version,ratingVersion:version,ratingInputSHA256:hash,frozenModelSHA256:hash,rulesSHA256:hash,engineSourceSHA256:hash,strengthSourceSHA256:hash,
 rngVersion:version,samplingVersion:version,eventDefinitionVersion:version,
 simulationCount:z.literal(100_000),requestedCount:z.literal(100_000),completedCount:z.literal(100_000),failedCount:z.literal(0),randomSeed:z.number().int().min(0).max(4294967295),sessionSeed:z.number().int().min(0).max(4294967295),
 tournamentStateHash:version,simulationInputSHA256:hash,countSHA256:hash,
 generatedAt:instant,generatorVersion:version,generatorCommit:z.string().regex(/^[a-f0-9]{40}$/),generatorSourceSHA256:hash,
 calculation:z.object({method:z.enum(['REUSED_R1_VERIFIED','SHARED_ENGINE_RUN']),calculatedAt:instant,durationMs:z.number().nonnegative(),peakProcessRssBytes:z.number().int().nonnegative().nullable(),sourceCacheSHA256:hash.nullable()}).strict(),
 teams:z.array(probabilityTeamSchema).length(19),
}).strict();
export type ProbabilitySnapshot=z.infer<typeof probabilitySnapshotSchema>;
export const historySchema=z.object({
 schemaVersion:z.literal('live-probability-history-v1.0'),historyId:version,
 frozenModel:z.object({file:version,sha256:hash,modelSHA256:hash}).strict(),
 snapshots:z.array(z.object({snapshotId:version,label:version,asOf:instant,file:version,sha256:hash,countSHA256:hash}).strict()).length(2),
 comparison:z.object({file:version,sha256:hash}).strict(),
 comparisonCsv:z.object({file:version,sha256:hash}).strict(),
 generationAudit:z.object({file:version,sha256:hash}).strict(),
}).strict();
export type ProbabilityHistoryIndex=z.infer<typeof historySchema>;

const totals=z.object({swiss:z.literal(1600000),knockout:z.literal(800000),semifinal:z.literal(400000),final:z.literal(200000),champion:z.literal(100000)}).strict();
export const generationAuditSchema=z.object({schemaVersion:z.literal('live-probability-generation-audit-v1.0'),generatorCommit:z.string().regex(/^[a-f0-9]{40}$/),generatorSourceSHA256:hash,factsInputSHA256:hash,ratingInputSHA256:hash,
 pre:z.object({method:z.literal('REUSED_R1_VERIFIED'),sourceCacheSHA256:hash,sourceCalculatedAt:instant,countsExactlyEqualToR1:z.literal(true),totalCounts:totals}).strict(),
 post:z.object({method:z.literal('SHARED_ENGINE_RUN'),simulationCount:z.literal(100000),failedCount:z.literal(0),durationMs:z.number().nonnegative(),peakProcessRssBytes:z.number().int().nonnegative(),totalCounts:totals}).strict(),
 preCountSHA256:hash,postCountSHA256:hash,conditionalInvariants:version,memoryMeasurement:version,
}).strict();
