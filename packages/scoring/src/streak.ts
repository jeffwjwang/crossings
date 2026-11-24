export interface StreakState {
  current: number;
  best: number;
  lastDay: string | null;
}

export function nzDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** One completion of any difficulty counts once per New Zealand date. */
export function advanceStreak(state: StreakState, today: string): StreakState {
  if (state.lastDay === today) return state;
  const current = state.lastDay === addDays(today, -1) ? state.current + 1 : 1;
  return {
    current,
    best: Math.max(state.best, current),
    lastDay: today,
  };
}
