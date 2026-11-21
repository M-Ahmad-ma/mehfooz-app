/* eslint-disable no-console */
import {
  EVAL_V2_VERSION,
  evalMessages,
  safeStressMessages,
  type EvalMessage,
} from '../data/evalMessagesV2';
import type { Category, Language } from '../types';

import { classify } from './classify';

const CATEGORIES: Category[] = ['safe', 'abusive', 'sexual', 'threat', 'blackmail'];
const LANGUAGES: Language[] = ['ur', 'roman-ur', 'ps', 'en'];

type Prediction = {
  message: EvalMessage;
  actual: Category;
  predicted: Category;
};

type Confusion = Record<Category, Record<Category, number>>;

function emptyConfusion(): Confusion {
  return Object.fromEntries(
    CATEGORIES.map((actual) => [
      actual,
      Object.fromEntries(CATEGORIES.map((predicted) => [predicted, 0])),
    ]),
  ) as Confusion;
}

function buildConfusion(predictions: Prediction[]): Confusion {
  const confusion = emptyConfusion();
  for (const prediction of predictions) {
    confusion[prediction.actual][prediction.predicted] += 1;
  }
  return confusion;
}

function accuracy(predictions: Prediction[]): number {
  if (predictions.length === 0) return 0;
  return predictions.filter((prediction) => prediction.actual === prediction.predicted).length /
    predictions.length;
}

function f1For(category: Category, confusion: Confusion): number {
  const truePositive = confusion[category][category];
  const falsePositive = CATEGORIES.filter((actual) => actual !== category).reduce(
    (sum, actual) => sum + confusion[actual][category],
    0,
  );
  const falseNegative = CATEGORIES.filter((predicted) => predicted !== category).reduce(
    (sum, predicted) => sum + confusion[category][predicted],
    0,
  );
  const precision =
    truePositive + falsePositive === 0 ? 0 : truePositive / (truePositive + falsePositive);
  const recall =
    truePositive + falseNegative === 0 ? 0 : truePositive / (truePositive + falseNegative);
  return precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
}

function macroF1(predictions: Prediction[]): number {
  const confusion = buildConfusion(predictions);
  return CATEGORIES.reduce((sum, category) => sum + f1For(category, confusion), 0) /
    CATEGORIES.length;
}

function percentile(sorted: number[], fraction: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor(fraction * sorted.length)));
  return sorted[index];
}

function mulberry32(seed: number): () => number {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function bootstrapConfidenceIntervals(predictions: Prediction[]) {
  const rng = mulberry32(0x4d656866);
  const accuracies: number[] = [];
  const macroF1s: number[] = [];
  const iterations = 1000;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const sample: Prediction[] = [];
    for (let index = 0; index < predictions.length; index += 1) {
      sample.push(predictions[Math.floor(rng() * predictions.length)]);
    }
    accuracies.push(accuracy(sample));
    macroF1s.push(macroF1(sample));
  }

  accuracies.sort((a, b) => a - b);
  macroF1s.sort((a, b) => a - b);

  return {
    accuracy: [percentile(accuracies, 0.025), percentile(accuracies, 0.975)] as const,
    macroF1: [percentile(macroF1s, 0.025), percentile(macroF1s, 0.975)] as const,
  };
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatInterval(interval: readonly [number, number], digits = 1): string {
  if (digits === 1) return `${formatPercent(interval[0])} – ${formatPercent(interval[1])}`;
  return `${interval[0].toFixed(2)} – ${interval[1].toFixed(2)}`;
}

const predictions: Prediction[] = evalMessages.map((message) => ({
  message,
  actual: message.label,
  predicted: classify(message.text).label,
}));

const confusion = buildConfusion(predictions);
const correct = predictions.filter((prediction) => prediction.actual === prediction.predicted).length;
const overallAccuracy = accuracy(predictions);
const overallMacroF1 = macroF1(predictions);
const intervals = bootstrapConfidenceIntervals(predictions);

console.log('\nMehfooz rules baseline — v2 core benchmark');
console.log(`Version: ${EVAL_V2_VERSION}`);
console.log(`Messages: ${evalMessages.length}`);
console.log(
  `Accuracy: ${formatPercent(overallAccuracy)} (95% bootstrap CI ${formatInterval(intervals.accuracy)})`,
);
console.log(
  `Macro-F1: ${overallMacroF1.toFixed(2)} (95% bootstrap CI ${formatInterval(intervals.macroF1, 2)})\n`,
);

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
  const precision =
    truePositive + falsePositive === 0 ? 0 : truePositive / (truePositive + falsePositive);
  const recall =
    truePositive + falseNegative === 0 ? 0 : truePositive / (truePositive + falseNegative);

  return {
    category,
    support: evalMessages.filter((message) => message.label === category).length,
    precision: precision.toFixed(2),
    recall: recall.toFixed(2),
    f1: f1For(category, confusion).toFixed(2),
  };
});

console.table(rows);

const byLanguage = LANGUAGES.map((language) => {
  const languagePredictions = predictions.filter(
    (prediction) => prediction.message.language === language,
  );
  return {
    language,
    messages: languagePredictions.length,
    accuracy: formatPercent(accuracy(languagePredictions)),
    macroF1: macroF1(languagePredictions).toFixed(2),
  };
});

console.log('\nBy language');
console.table(byLanguage);

const pashtoPredictions = predictions.filter(
  (prediction) => prediction.message.language === 'ps',
);

console.log('\nPashto by script');
console.table(
  (['arabic', 'roman'] as const).map((script) => {
    const scriptPredictions = pashtoPredictions.filter(
      (prediction) => (prediction.message.scriptVariant ?? 'arabic') === script,
    );
    return {
      script,
      messages: scriptPredictions.length,
      accuracy: formatPercent(accuracy(scriptPredictions)),
      macroF1: macroF1(scriptPredictions).toFixed(2),
    };
  }),
);

const tagTotals = new Map<string, { correct: number; total: number }>();
for (const prediction of predictions) {
  for (const tag of prediction.message.tags ?? []) {
    if (tag === 'legacy-v1' || tag.startsWith('v1-')) continue;
    const current = tagTotals.get(tag) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (prediction.actual === prediction.predicted) current.correct += 1;
    tagTotals.set(tag, current);
  }
}

const tagRows = [...tagTotals.entries()]
  .filter(([, value]) => value.total >= 5)
  .sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]))
  .slice(0, 30)
  .map(([tag, value]) => ({
    tag,
    messages: value.total,
    accuracy: formatPercent(value.correct / value.total),
  }));

console.log('\nTag slices (at least 5 messages, top 30)');
console.table(tagRows);

const stressPredictions: Prediction[] = safeStressMessages.map((message) => ({
  message,
  actual: 'safe',
  predicted: classify(message.text).label,
}));
const stressFalsePositives = stressPredictions.filter(
  (prediction) => prediction.predicted !== 'safe',
);
const stressSafeRecall = 1 - stressFalsePositives.length / stressPredictions.length;

console.log('\nHard-safe stress set');
console.log(`Messages: ${stressPredictions.length}`);
console.log(`Correctly kept safe: ${formatPercent(stressSafeRecall)}`);
console.log(`False-positive rate: ${formatPercent(1 - stressSafeRecall)}\n`);

console.table(
  LANGUAGES.map((language) => {
    const languagePredictions = stressPredictions.filter(
      (prediction) => prediction.message.language === language,
    );
    const falsePositives = languagePredictions.filter(
      (prediction) => prediction.predicted !== 'safe',
    ).length;
    return {
      language,
      messages: languagePredictions.length,
      falsePositives,
      falsePositiveRate: formatPercent(falsePositives / languagePredictions.length),
    };
  }),
);

if (stressFalsePositives.length > 0) {
  console.log('\nStress false positives (first 15)');
  console.table(
    stressFalsePositives.slice(0, 15).map((prediction) => ({
      predicted: prediction.predicted,
      id: prediction.message.id,
      text: prediction.message.text.slice(0, 90),
    })),
  );
}

console.log('\nConfusion matrix (rows = actual, columns = predicted)');
console.table(confusion);

console.log(
  '\nNote: the v2 core set is balanced for measurement, not prevalence. The hard-safe stress set exists to expose keyword false positives and is reported separately. The rules baseline is not a production accuracy claim. Run npm run eval:gemini for the model comparison and report Pashto honestly.\n',
);
