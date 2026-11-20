/* eslint-disable no-console */
import 'dotenv/config';

import { evalMessages } from '../src/data/evalMessages';
import type { Category, Language } from '../src/types';

const CATEGORIES: Category[] = ['safe', 'abusive', 'sexual', 'threat', 'blackmail'];
const LANGUAGES: Language[] = ['ur', 'roman-ur', 'ps', 'en'];
const DELAY_MS = Number(process.env.EVAL_DELAY_MS ?? 2000);

const confusion: Record<string, Record<string, number>> = {};
for (const actual of CATEGORIES) {
  confusion[actual] = {};
  for (const predicted of CATEGORIES) confusion[actual][predicted] = 0;
}

let correct = 0;
let geminiCount = 0;
let fallbackCount = 0;
let fallbackAccuracy = 0;
let totalLatency = 0;
let latencySamples = 0;
const languageTotals: Record<string, { correct: number; total: number }> = {};
const failures: Array<{ text: string; expected: Category; predicted: Category; source?: string }> = [];
const fallbackErrors: string[] = [];

async function main() {
const {
  classifyWithFallback,
  geminiModel,
  isGeminiConfigured,
} = await import('../src/engine/geminiClassifier');

if (!isGeminiConfigured) {
  console.error(
    'No Gemini key found. Put EXPO_PUBLIC_GEMINI_API_KEY in .env before running eval:gemini.',
  );
  process.exit(1);
}

console.log(`\nMehfooz model eval — ${geminiModel}`);
console.log(`Messages: ${evalMessages.length}`);
console.log(`Delay between requests: ${DELAY_MS}ms`);
console.log('The test set is not used in the prompt.\n');

for (const message of evalMessages) {
  const result = await classifyWithFallback(message.text, message.language);
  const predicted = result.label;

  confusion[message.label][predicted] += 1;
  if (predicted === message.label) correct += 1;
  else {
    failures.push({
      text: message.text,
      expected: message.label,
      predicted,
      source: result.source,
    });
  }

  languageTotals[message.language] ??= { correct: 0, total: 0 };
  languageTotals[message.language].total += 1;
  if (predicted === message.label) languageTotals[message.language].correct += 1;

  if (result.source === 'gemini') {
    geminiCount += 1;
    if (result.latencyMs) {
      totalLatency += result.latencyMs;
      latencySamples += 1;
    }
  } else {
    fallbackCount += 1;
    if (predicted === message.label) fallbackAccuracy += 1;
    if (result.error) fallbackErrors.push(result.error);
  }

  if (DELAY_MS > 0) {
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }
}

console.log(`Accuracy: ${((correct / evalMessages.length) * 100).toFixed(1)}%\n`);

const rows = CATEGORIES.map((category) => {
  const truePositive = confusion[category][category];
  const falsePositive = CATEGORIES.filter((actual) => actual !== category).reduce(
    (sum, actual) => sum + confusion[actual][category],
    0,
  );
  const falseNegative = CATEGORIES.filter((predicted) => predicted !== category).reduce(
    (sum, predicted) => sum + confusion[category][predicted],
    0,
  );
  const precision = truePositive + falsePositive === 0 ? 0 : truePositive / (truePositive + falsePositive);
  const recall = truePositive + falseNegative === 0 ? 0 : truePositive / (truePositive + falseNegative);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return {
    category,
    support: evalMessages.filter((message) => message.label === category).length,
    precision: precision.toFixed(2),
    recall: recall.toFixed(2),
    f1: f1.toFixed(2),
  };
});

console.table(rows);

console.log('\nAccuracy by language');
console.table(
  LANGUAGES.filter((language) => languageTotals[language]).map((language) => ({
    language,
    messages: languageTotals[language].total,
    accuracy: `${((languageTotals[language].correct / languageTotals[language].total) * 100).toFixed(1)}%`,
  })),
);

console.log('\nSource');
console.table([
  {
    gemini: geminiCount,
    rulesFallback: fallbackCount,
    avgGeminiLatencyMs: latencySamples > 0 ? Math.round(totalLatency / latencySamples) : 0,
    fallbackAccuracy: fallbackCount > 0 ? `${((fallbackAccuracy / fallbackCount) * 100).toFixed(1)}%` : 'n/a',
  },
]);

console.log('\nConfusion matrix (rows = actual, columns = predicted)');
console.table(confusion);

if (fallbackErrors.length > 0) {
  console.log('\nFallback errors (first 8)');
  console.log([...new Set(fallbackErrors)].slice(0, 8).join('\n'));
}

if (failures.length > 0) {
  console.log(`\nFailures (${failures.length})`);
  console.table(
    failures.slice(0, 20).map((failure) => ({
      expected: failure.expected,
      predicted: failure.predicted,
      source: failure.source,
      text: failure.text.slice(0, 80),
    })),
  );
}

console.log(
  '\nNote: confidence is the model/rules score, not a calibrated probability. Re-run with EVAL_DELAY_MS=5000 if the fallback count is high from rate limiting. Do not commit the API key.\n',
);

}

void main();
