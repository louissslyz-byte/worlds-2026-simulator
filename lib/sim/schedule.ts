/** Riot's published 2026 Worlds schedule, converted to China Standard Time (UTC+8). */
export const scheduleSource = 'https://lolesports.com/en-US/news/msi-and-worlds-updates';
export const updatedStartTimesSource = 'https://lolesports.com/en-US/lolesports/news/worlds-2026-venue-event-policies';

export const worldsSchedule = {
  'play-in': {
    date: '10月16–19日',
    navDate: '10月16–19日',
    time: '每日 02:00',
    zone: 'CST',
  },
  swiss: {
    date: '10月24–27日、29–31日；11月1日',
    navDate: '10月24日–11月1日',
    time: '10月24–27日、11月1日 01:00；10月29–31日 04:00',
    zone: 'CST',
  },
  quarterfinals: {
    date: '11月4–7日',
    navDate: '11月4–7日',
    time: '每日 06:00',
    zone: 'CST',
  },
  semifinals: {
    date: '11月8–9日',
    navDate: '11月8–9日',
    time: '每日 06:00',
    zone: 'CST',
  },
  final: {
    date: '11月15日',
    navDate: '11月15日',
    time: '03:00',
    zone: 'CST',
  },
} as const;

export type ScheduledStage = keyof typeof worldsSchedule;
