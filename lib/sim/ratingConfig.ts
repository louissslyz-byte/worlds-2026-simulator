export const MODEL_VERSION='gpr-prob-v1.1';
export const ratingConfig = {
 tierBase:{S:1900,A:1800,B:1700,C:1600,D:1500},
 withinTierStep:20,
 eloDivisor:400,
 gpr:{referenceScore:1350,referenceRating:1700,scoreScale:0.85,calibrationStatus:'heuristic'},
} as const;
