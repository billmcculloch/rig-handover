import { describe, expect, it } from 'vitest';
import { readNight } from '../src/digest/read.js';

describe('readNight', () => {
  it('reads 2026-10-28 into one sorted row per job and counts the bad line', () => {
    const night = readNight('runs', '2026-10-28');
    expect(night?.badLines).toBe(1);
    const rows = night?.rows ?? [];
    const jobs = rows.map((r) => r.job);
    expect(jobs).toHaveLength(5);
    expect(jobs).toEqual([...jobs].sort());
    const row = (job: string) => rows.find((r) => r.job === job);
    expect(row('fixtures/refresh')).toMatchObject({ retries: 3, lastStatus: 'ok', lastError: null });
    expect(row('notes/backup')).toMatchObject({ lastStatus: 'fail', lastError: 'quota exceeded' });
    expect(row('digest/render')?.owner).toBeNull();
  });

  it('returns null for a missing night or a night that is not a date', () => {
    expect(readNight('runs', '2026-01-01')).toBeNull();
    expect(readNight('runs', '../x')).toBeNull();
  });
});
