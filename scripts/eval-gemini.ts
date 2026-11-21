/* eslint-disable no-console */
import 'dotenv/config';

import {
  EVAL_V2_VERSION,
  evalMessages,
  safeStressMessages,
  type EvalMessage,
} from '../src/data/evalMessagesV2';
import type { Category, Language } from '../src/types';

const CATEGORIES: Category[] = ['safe', 'abusive', 'sexual', 'threat', 'blackmail'];
const LANGUAGES: Language[] = ['ur', 'roman-ur', 'ps', 'en'];
const DELAY_MS = Number(process.env.EVAL_DELAY_MS ?? 2000);
const RUN_STRESS = process.env.EVAL_STRESS === '1';
const LIMIT = Number(process.env.EVAL_LIMIT ?? 0);

type Prediction = {
  message: EvalMessage;
  actual: Category;
  predicted: Category;
  source?: string;
  latencyMs?: number;
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

function tagRows(predictions: Prediction[]) {
  const totals = new Map<string, { correct: number; total: number }>();
  for (const prediction of predictions) {
    for (const tag of prediction.message.tags ?? []) {
      if (tag === 'legacy-v1' || tag.startsWith('v1-')) continue;
      const current = totals.get(tag) ?? { correct: 0, total: 0 };
      current.total += 1;
      if (prediction.actual === prediction.predicted) current.correct += 1;
      totals.set(tag, current);
    }
  }

  return [...totals.entries()]
    .filter(([, value]) => value.total >= 5)
    .sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]))
    .slice(0, 30)
    .map(([tag, value]) => ({
      tag,
      messages: value.total,
      accuracy: formatPercent(value.correct / value.total),
    }));
}

function categoryRows(predictions: Prediction[]) {
  const confusion = buildConfusion(predictions);
  return CATEGORIES.map((category) => {
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
      support: predictions.filter((prediction) => prediction.actual === category).length,
      precision: precision.toFixed(2),
      recall: recall.toFixed(2),
      f1: f1For(category, confusion).toFixed(2),
    };
  });
}

async function main() {
  const { classifyWithFallback, geminiModel, isGeminiConfigured } = await import(
    '../src/engine/geminiClassifier'
  );

  if (!isGeminiConfigured) {
    console.error(
      'No Gemini key found. Put EXPO_PUBLIC_GEMINI_API_KEY in .env before running eval:gemini.',
    );
    process.exit(1);
  }

  console.log(`\nMehfooz model eval — ${geminiModel}`);
  console.log(`Dataset version: ${EVAL_V2_VERSION}`);
  const coreMessages = LIMIT > 0 ? evalMessages.slice(0, LIMIT) : evalMessages;
  console.log(
    `Core messages: ${coreMessages.length}${LIMIT > 0 ? ` (limited from ${evalMessages.length})` : ''}`,
  );
  console.log(`Delay between requests: ${DELAY_MS}ms`);
  console.log(`Stress set: ${RUN_STRESS ? 'included' : 'skipped (set EVAL_STRESS=1)'}`);
  console.log('The core test set is not used in the prompt.\n');

  const predictions: Prediction[] = [];
  const failures: Array<{
    text: string;
    expected: Category;
    predicted: Category;
    source?: string;
  }> = [];
  const fallbackErrors: string[] = [];
  let geminiCount = 0;
  let fallbackCount = 0;
  let fallbackCorrect = 0;
  let totalLatency = 0;
  let latencySamples = 0;

  for (const message of coreMessages) {
    const result = await classifyWithFallback(message.text, message.language);
    predictions.push({
      message,
      actual: message.label,
      predicted: result.label,
      source: result.source,
      latencyMs: result.latencyMs,
    });

    if (result.label !== message.label) {
      failures.push({
        text: message.text,
        expected: message.label,
        predicted: result.label,
        source: result.source,
      });
    }

    if (result.source === 'gemini') {
      geminiCount += 1;
      if (result.latencyMs) {
        totalLatency += result.latencyMs;
        latencySamples += 1;
      }
    } else {
      fallbackCount += 1;
      if (result.label === message.label) fallbackCorrect += 1;
      if (result.error) fallbackErrors.push(result.error);
    }

    if (DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  const overallAccuracy = accuracy(predictions);
  const overallMacroF1 = macroF1(predictions);
  const intervals = bootstrapConfidenceIntervals(predictions);

  console.log(
    `Accuracy: ${formatPercent(overallAccuracy)} (95% bootstrap CI ${formatInterval(intervals.accuracy)})`,
  );
  console.log(
    `Macro-F1: ${overallMacroF1.toFixed(2)} (95% bootstrap CI ${formatInterval(intervals.macroF1, 2)})\n`,
  );

  console.log('By category');
  console.table(categoryRows(predictions));

  console.log('\nBy language');
  console.table(
    LANGUAGES.map((language) => {
      const languagePredictions = predictions.filter(
        (prediction) => prediction.message.language === language,
      );
      return {
        language,
        messages: languagePredictions.length,
        accuracy: formatPercent(accuracy(languagePredictions)),
        macroF1: macroF1(languagePredictions).toFixed(2),
      };
    }),
  );

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

  console.log('\nTag slices (at least 5 messages, top 30)');
  console.table(tagRows(predictions));

  console.log('\nSource');
  console.table([
    {
      gemini: geminiCount,
      rulesFallback: fallbackCount,
      avgGeminiLatencyMs: latencySamples > 0 ? Math.round(totalLatency / latencySamples) : 0,
      fallbackAccuracy:
        fallbackCount > 0 ? formatPercent(fallbackCorrect / fallbackCount) : 'n/a',
    },
  ]);

  if (RUN_STRESS) {
    const stressPredictions: Prediction[] = [];
    for (const message of safeStressMessages) {
      const result = await classifyWithFallback(message.text, message.language);
      stressPredictions.push({
        message,
        actual: 'safe',
        predicted: result.label,
        source: result.source,
        latencyMs: result.latencyMs,
      });
      if (DELAY_MS > 0) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    const falsePositives = stressPredictions.filter(
      (prediction) => prediction.predicted !== 'safe',
    );

    console.log('\nHard-safe stress set');
    console.log(`Messages: ${stressPredictions.length}`);
    console.log(`Correctly kept safe: ${formatPercent(1 - falsePositives.length / stressPredictions.length)}`);
    console.log(`False-positive rate: ${formatPercent(falsePositives.length / stressPredictions.length)}\n`);

    console.table(
      LANGUAGES.map((language) => {
        const languagePredictions = stressPredictions.filter(
          (prediction) => prediction.message.language === language,
        );
        const languageFalsePositives = languagePredictions.filter(
          (prediction) => prediction.predicted !== 'safe',
        ).length;
        return {
          language,
          messages: languagePredictions.length,
          falsePositives: languageFalsePositives,
          falsePositiveRate: formatPercent(languageFalsePositives / languagePredictions.length),
        };
      }),
    );

    if (falsePositives.length > 0) {
      console.log('\nStress false positives (first 15)');
      console.table(
        falsePositives.slice(0, 15).map((prediction) => ({
          predicted: prediction.predicted,
          id: prediction.message.id,
          text: prediction.message.text.slice(0, 90),
        })),
      );
    }
  } else {
    console.log('\nHard-safe stress set skipped. Run with EVAL_STRESS=1 to measure false positives.');
  }

  console.log('\nConfusion matrix (rows = actual, columns = predicted)');
  console.table(buildConfusion(predictions));

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
    '\nNote: confidence is the model/rules score, not a calibrated probability. The core set is balanced for measurement, not prevalence; the stress set is reported separately. Re-run with EVAL_DELAY_MS=5000 if the fallback count is high from rate limiting. Do not commit the API key.\n',
  );
}

void main();
