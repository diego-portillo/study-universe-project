import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

type RunResult = {
  id: string;
  category: string;
  provider: string;
  pass: boolean;
  reason: string;
  skip?: boolean;
};

type ResultsFile = {
  timestamp: string;
  judgeModel: string;
  passed: number;
  total: number;
  results: RunResult[];
};

const RESULTS_DIR = join(import.meta.dirname, 'results');
const BASELINE_PATH = join(import.meta.dirname, 'baseline.json');

function latestResultsFile(): string {
  const files = readdirSync(RESULTS_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) throw new Error('No eval results found in evals/results/');
  files.sort();
  return join(RESULTS_DIR, files[files.length - 1]);
}

function loadResults(path: string): ResultsFile {
  return JSON.parse(readFileSync(path, 'utf-8')) as ResultsFile;
}

function statusOf(r: RunResult): string {
  if (r.skip) return 'SKIP';
  return r.pass ? 'PASS' : 'FAIL';
}

function keyOf(r: RunResult): string {
  return `${r.id}::${r.provider}`;
}

function escapeForTable(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 140);
}

function renderResultsTable(results: RunResult[]): string[] {
  const lines = ['| id | provider | category | status | reason |', '|---|---|---|---|---|'];
  for (const r of results) {
    lines.push(
      `| ${r.id} | ${r.provider} | ${r.category} | ${statusOf(r)} | ${escapeForTable(r.reason)} |`,
    );
  }
  return lines;
}

function renderDiffSection(current: ResultsFile): string[] {
  let baseline: ResultsFile;
  try {
    baseline = loadResults(BASELINE_PATH);
  } catch {
    return [
      '',
      '### Diff vs. baseline',
      '',
      '_No baseline found (evals/baseline.json) — run this workflow on main with `update_baseline: true` to create one._',
    ];
  }

  const baselineByKey = new Map(baseline.results.map((r) => [keyOf(r), r]));
  const changed = current.results.filter((r) => {
    const prior = baselineByKey.get(keyOf(r));
    return prior && statusOf(prior) !== statusOf(r);
  });

  const lines = ['', `### Diff vs. baseline (${baseline.timestamp})`, ''];
  if (changed.length === 0) {
    lines.push('No prompts changed status vs. the baseline.');
    return lines;
  }

  lines.push('| id | provider | baseline → current |', '|---|---|---|');
  for (const r of changed) {
    const prior = baselineByKey.get(keyOf(r));
    if (!prior) continue;
    lines.push(`| ${r.id} | ${r.provider} | ${statusOf(prior)} → ${statusOf(r)} |`);
  }
  return lines;
}

function main() {
  const resultsPath = process.argv[2] ?? latestResultsFile();
  const current = loadResults(resultsPath);

  const lines: string[] = [
    '### Eval report',
    '',
    `Judge model: \`${current.judgeModel}\` · ${current.passed}/${current.total} passed · run at ${current.timestamp}`,
    '',
    ...renderResultsTable(current.results),
    ...renderDiffSection(current),
  ];

  console.log(lines.join('\n'));
}

main();
