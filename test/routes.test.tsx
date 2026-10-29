import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const runsDir = mkdtempSync(join(tmpdir(), 'rig-'));
const config = { adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir };

function line(at: string, job: string, status: string) {
  return JSON.stringify({ at, job, status, owner: null });
}

const good = [
  line('2026-10-28T01:00:00+01:00', 'zeta-sync', 'ok'),
  line('2026-10-28T01:05:00+01:00', 'alpha-backup', 'retry'),
  line('2026-10-28T01:10:00+01:00', 'alpha-backup', 'ok'),
].join('\n');

beforeAll(() => {
  writeFileSync(join(runsDir, '2026-10-01.jsonl'), good + '\n');
  writeFileSync(join(runsDir, '2026-10-02.jsonl'), '');
  writeFileSync(join(runsDir, '2026-10-03.jsonl'), [good, 'not json'].join('\n') + '\n');
});

afterAll(() => {
  rmSync(runsDir, { recursive: true, force: true });
});

describe('digest routes', () => {
  it('serves a good night on both routes, jobs in the same order', async () => {
    const app = createApp(config);
    const page = await app.request('/digest/2026-10-01');
    const api = await app.request('/api/digest/2026-10-01');
    expect(page.status).toBe(200);
    expect(api.status).toBe(200);
    const html = await page.text();
    const body = (await api.json()) as { rows: { job: string }[] };
    const jobs = body.rows.map((r) => r.job);
    expect(jobs).toEqual(['alpha-backup', 'zeta-sync']);
    const positions = jobs.map((j) => html.indexOf(j));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('404s a night with no file on both routes', async () => {
    const app = createApp(config);
    expect((await app.request('/digest/2026-10-09')).status).toBe(404);
    expect((await app.request('/api/digest/2026-10-09')).status).toBe(404);
  });

  it('handles an empty night', async () => {
    const app = createApp(config);
    expect(await (await app.request('/digest/2026-10-02')).text()).toContain('nothing ran');
    const body = (await (await app.request('/api/digest/2026-10-02')).json()) as { rows: unknown[] };
    expect(body.rows).toEqual([]);
  });

  it('counts a bad line and still renders the rows', async () => {
    const app = createApp(config);
    const page = await app.request('/digest/2026-10-03');
    const api = await app.request('/api/digest/2026-10-03');
    expect(page.status).toBe(200);
    expect(await page.text()).toContain('alpha-backup');
    expect(api.status).toBe(200);
    const body = (await api.json()) as { badLines: number };
    expect(body.badLines).toBe(1);
  });
});
