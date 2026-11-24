export interface Palette {
  ink: string;
  paper: string;
  panel: string;
  accent: string;
  select: string;
  ok: string;
  okDark: string;
  bad: string;
  hint: string;
  prefill: string;
  night: string;
  gold: string;
  muted: string;
  line: string;
  road: string;
  fog: string;
}

export function palette(highContrast: boolean): Palette {
  return {
    ink: '#16130f',
    paper: highContrast ? '#fffaf0' : '#efe3c8',
    panel: '#fffaf0',
    accent: '#ffcf33',
    select: '#fff0b0',
    ok: '#bfe8b5',
    okDark: '#1e5e22',
    bad: '#c62828',
    hint: '#0d47a1',
    prefill: '#6b4e12',
    night: '#1b1822',
    gold: '#ffd96a',
    muted: '#5a4a2a',
    line: highContrast ? '#000000' : '#16130f',
    road: highContrast ? '#6b4e12' : '#b39a6c',
    fog: '#17141f',
  };
}

export function font(scale: number, size: number): number {
  return Math.round(size * scale);
}
