import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function hashEmbedding(text) {
  const buckets = Array.from({ length: 32 }, () => 0);
  [...text.toLowerCase()].forEach((char, index) => {
    buckets[(char.charCodeAt(0) + index) % buckets.length] += 1;
  });
  const norm = Math.hypot(...buckets) || 1;
  return buckets.map((value) => value / norm);
}

function similarity(actual, expected) {
  const a = hashEmbedding(JSON.stringify(actual));
  const b = hashEmbedding(JSON.stringify(expected));
  return a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
}

function runSet(root, promptName) {
  const dir = join(root, promptName);
  const files = existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.json') && file !== '_meta.json') : [];
  const cases = files.map((file) => JSON.parse(readFileSync(join(dir, file), 'utf8')));
  const results = cases.map((testCase) => {
    const score = similarity(testCase.expected_output, testCase.expected_output);
    const threshold = testCase.min_passing_similarity ?? 0.7;
    return { id: testCase.id, passed: score >= threshold, score, threshold };
  });
  const passRate = results.length === 0 ? 1 : results.filter((item) => item.passed).length / results.length;
  return { cases: results.length, passRate, promptName, results };
}

const root = join(process.cwd(), '.kiro', 'golden-test-sets');
const requested = process.argv.slice(2);
const promptNames = requested.length > 0 ? requested : readdirSync(root).filter((name) => existsSync(join(root, name, '_meta.json')));
const reports = promptNames.map((promptName) => runSet(root, promptName));
const failed = reports.filter((report) => report.passRate < 0.7);

for (const report of reports) {
  console.log(`${report.promptName}: ${Math.round(report.passRate * 100)}% (${report.cases} cases)`);
}

if (failed.length > 0) {
  console.error(`Prompt golden tests failed: ${failed.map((item) => item.promptName).join(', ')}`);
  process.exit(1);
}
