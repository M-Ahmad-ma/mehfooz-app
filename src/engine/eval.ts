/* eslint-disable no-console */
import { evalMessages } from '../data/evalMessages';
import type { Category, Language } from '../types';

import { classify } from './classify';

const CATEGORIES: Category[] = ['safe', 'abusive', 'sexual', 'threat', 'blackmail'];
const LANGUAGES: Language[] = ['ur', 'roman-ur', 'ps', 'en'];

const confusion: Record<string, Record<string, number>> = {};
for (const actual of CATEGORIES) {
  confusion[actual] = {};
  for (const predicted of CATEGORIES) confusion[actual][predicted] = 0;
}

let correct = 0;
const languageTotals: Record<string, { correct: number; total: number }> = {};

for (const message of evalMessages) {
  const result = classify(message.text);
  confusion[message.label][result.label] += 1;
  if (result.label === message.label) correct += 1;

  languageTotals[message.language] ??= { correct: 0, total: 0 };
  languageTotals[message.language].total += 1;
  if (result.label === message.label) languageTotals[message.language].correct += 1;
}

console.log('\nMehfooz rules baseline — 160-message held-out test set');
console.log(`Messages: ${evalMessages.length}`);
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

console.log('\nConfusion matrix (rows = actual, columns = predicted)');
console.table(confusion);

console.log(
  '\nNote: this is the rules baseline on a deliberately hard 160-message test set. It is not training or prompt data. Run npm run eval:gemini for the model comparison, and report Pashto honestly.\n',
);
