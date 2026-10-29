// Plan morning-digest § 1. The contract every part of § 2 builds against.

export type RunStatus = 'ok' | 'retry' | 'fail';

// One line of runs/<night>.jsonl.
export type RunLine = { at: string; job: string; status: RunStatus; owner: string | null; error?: string };

// One job's night. `runs` counts its lines, `retries` its `retry` lines; `last*` come from its
// latest line. Times keep the log's offset. `owner` stays null here; views show it as `—`.
export type DigestRow = {
  job: string;
  owner: string | null;
  runs: number;
  retries: number;
  lastStatus: RunStatus;
  lastError: string | null;
  first: string;
  last: string;
};

// Rows sorted by job. `counts` tallies parsed lines by status. `badLines` counts lines that
// don't parse; they are never thrown.
export type Night = { night: string; rows: DigestRow[]; counts: Record<RunStatus, number>; badLines: number };

// null when `night` isn't YYYY-MM-DD or runs/<night>.jsonl doesn't exist (the routes' 404).
export type ReadNight = (runsDir: string, night: string) => Night | null;
