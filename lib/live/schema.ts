import {z} from 'zod';

const instant=z.string().datetime({offset:true}).refine(value=>new Date(value).toISOString()===value,'Use canonical UTC ISO 8601 with milliseconds');
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value,'Invalid date');
const id=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.-]*$/);
const refs=z.array(id).min(1);
export const verificationSchema=z.enum(['OFFICIAL_VERIFIED','CROSS_VERIFIED','UNVERIFIED']);
const source=z.object({
 sourceId:id,sourceName:z.string().min(1),sourceUrl:z.string().url().refine(value=>value.startsWith('https://')),
 supports:z.array(z.enum(['EVENT_RULES','STAGE_SCHEDULE','PLAY_IN_RESULTS','SWISS_DRAW','QUALIFICATION'])).min(1),
 sourceType:z.enum(['OFFICIAL','TRUSTED_THIRD_PARTY']),accessStatus:z.enum(['READABLE','UNREADABLE']),
 publishedAt:instant.nullable(),publishedDate:date.nullable(),checkedAt:instant,
 verificationStatus:verificationSchema,location:z.string().min(1),notes:z.string().min(1),
}).strict();
const evidence=z.object({verificationStatus:verificationSchema,sourceIds:refs,temporalSourceIds:refs,knownBy:instant}).strict();
const participantFrom=z.object({matchId:id,outcome:z.enum(['WINNER','LOSER'])}).strict().nullable();
const schedule=z.object({
 scheduledAt:instant.nullable(),timeStatus:z.enum(['CONFIRMED','TIME_TBD']),
 originalLocalTime:z.string().nullable(),originalTimeZone:z.enum(['America/Los_Angeles','America/Chicago']),
 evidence:evidence.nullable(),notes:z.string(),
}).strict();
export const liveMatchSchema=z.object({
 matchId:id,officialMatchId:z.string().nullable(),stage:z.enum(['PLAY_IN','SWISS','KNOCKOUT']),round:z.number().int().min(1).max(5),
 bracketPosition:id,teamA:id,teamB:id,bestOf:z.union([z.literal(1),z.literal(3),z.literal(5)]),
 teamAFrom:participantFrom,teamBFrom:participantFrom,competitionDate:date,competitionTimeZone:z.enum(['America/Los_Angeles','America/Chicago']),
 schedule,startedAt:instant.nullable(),completedAt:instant.nullable(),
 status:z.enum(['SCHEDULED','COMPLETED']),scoreA:z.number().int().nonnegative().nullable(),scoreB:z.number().int().nonnegative().nullable(),
 winnerId:id.nullable(),loserId:id.nullable(),evidence,updatedAt:instant,
}).strict();
const officialDraw=z.object({
 drawId:id,kind:z.literal('OFFICIAL_DRAW'),stage:z.literal('SWISS'),round:z.literal(1),publishedAt:instant.nullable(),publishedDate:date,
 orderStatus:z.literal('NOT_MATCH_ORDER'),pools:z.array(z.array(id).length(4)).length(4),matchIds:z.array(id).length(8),evidence,
}).strict();
export const liveTournamentSchema=z.object({
 metadata:z.object({
  schemaVersion:z.literal('live-tournament-facts-v1.0'),eventId:z.literal('worlds-2026'),eventName:z.literal('Worlds 2026'),season:z.literal(2026),
  snapshotId:id,asOf:instant,sourceCheckedAt:instant,tournamentStage:z.literal('POST_PLAY_IN'),dataVersion:id,
  rulesVersion:z.string().min(1),revisionOf:id.nullable(),boundaryExplanation:z.string().min(1),
 }).strict(),
 teamIds:z.array(id).length(19),sources:z.array(source).min(1),
 matches:z.object({playIn:z.array(liveMatchSchema).length(6),swiss:z.array(liveMatchSchema).length(8),knockout:z.array(liveMatchSchema).length(0)}).strict(),
 officialDraws:z.array(officialDraw).length(1),
 officialQualification:z.object({qualifiedToSwiss:z.array(id).length(1),evidence}).strict(),
 stageSchedule:z.object({swissRound1StartsAt:instant,originalLocalTime:z.string(),originalTimeZone:z.literal('America/Chicago'),evidence}).strict(),
 limitations:z.array(z.object({code:id,description:z.string().min(1)}).strict()),
}).strict();
export type LiveTournamentData=z.infer<typeof liveTournamentSchema>;
export type LiveMatch=z.infer<typeof liveMatchSchema>;
export type Evidence=z.infer<typeof evidence>;
export type LiveSource=z.infer<typeof source>;
export type DerivedOfficialState={
 completedMatchIds:string[];qualifiedToSwiss:string[];eliminatedTeams:string[];directToSwiss:string[];swissParticipants:string[];
 currentStage:'SWISS';currentRound:1;upcomingMatchIds:string[];swissRecords:Record<string,{wins:0;losses:0}>;
};
