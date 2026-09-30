/** Verified against Riot's public 2026 Current GPR table on 2026-09-30.
 * This checked-in snapshot avoids a remote request on every page view.
 * Unassigned regional seed placeholders deliberately have no GPR entry.
 */
export const riotGprSnapshot = {
 sourceUrl:'https://lolesports.com/en-US/gpr/2026/current',
 sourceUpdatedAt:'2026-09-29',
 fetchedAt:'2026-09-30',
 strengthVersion:'riot-gpr-2026-09-29',
 entries:{
  HLE:{rank:1,score:1540},
  GEN:{rank:2,score:1519},
  BLG:{rank:3,score:1513},
  G2:{rank:4,score:1475},
  T1:{rank:5,score:1471},
  DK:{rank:7,score:1409},
  AL:{rank:7,score:1409},
  KC:{rank:10,score:1375},
  TSW:{rank:11,score:1372},
  TES:{rank:12,score:1364},
  IG:{rank:15,score:1348},
  MKOI:{rank:18,score:1317},
  CFO:{rank:18,score:1317},
  MVK:{rank:28,score:1247},
 } satisfies Record<string,{rank:number;score:number}>,
} as const;
