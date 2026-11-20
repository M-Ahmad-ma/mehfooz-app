import type { Category } from '../types';

import { SIGNALS, type HarmCategory } from './lexicon';
import { hasFriendlyContext, normalizeText } from './normalize';

export type ClassifierResult = {
  label: Category;
  confidence: number;
  reasons: string[];
  scores: Record<HarmCategory, number>;
};

export type Classifier = (text: string) => ClassifierResult;

const ORDER: HarmCategory[] = ['threat', 'blackmail', 'sexual', 'abusive'];

const THRESHOLDS: Record<HarmCategory, number> = {
  threat: 3,
  blackmail: 3,
  sexual: 3,
  abusive: 2,
};

const REASON_PREFIX: Record<HarmCategory, string> = {
  threat: 'Threat phrase',
  blackmail: 'Blackmail phrase',
  sexual: 'Sexual language',
  abusive: 'Insult',
};

function matches(normalized: string, term: string): boolean {
  if (!term) return false;

  // Urdu/Pashto terms are matched as substrings so common suffixes
  // (احمق / احمقه) do not break detection. Latin terms must be whole words.
  if (/[^\x00-\x7F]/.test(term)) {
    return normalized.includes(term);
  }

  return ` ${normalized} `.includes(` ${term} `);
}

function emptyScores(): Record<HarmCategory, number> {
  return { threat: 0, blackmail: 0, sexual: 0, abusive: 0 };
}

function emptyHits(): Record<HarmCategory, string[]> {
  return { threat: [], blackmail: [], sexual: [], abusive: [] };
}

/**
 * Rules + lexicon + context guard. The UI only depends on this signature,
 * so a trained model or hosted API can replace the body later.
 */
export function classify(input: string): ClassifierResult {
  const normalized = normalizeText(input);
  const scores = emptyScores();
  const hits = emptyHits();

  if (normalized) {
    for (const signal of SIGNALS) {
      if (!matches(normalized, signal.term)) continue;
      scores[signal.category] += signal.weight;
      if (!hits[signal.category].includes(signal.display)) {
        hits[signal.category].push(signal.display);
      }
    }
  }

  const friendly = hasFriendlyContext(input ?? '', normalized);
  const strongHarm = scores.threat + scores.blackmail + scores.sexual;
  if (friendly && strongHarm === 0) {
    // "Yaar tum pagal ho" is affection, not abuse. Only soften insults;
    // never soften a threat, blackmail or sexual signal.
    scores.abusive *= 0.25;
  }

  let label: Category = 'safe';
  for (const category of ORDER) {
    if (scores[category] >= THRESHOLDS[category]) {
      label = category;
      break;
    }
  }

  if (label === 'safe') {
    const playful = hits.abusive[0];
    const reasons =
      friendly && playful
        ? [`Friendly context around “${playful}”`, 'No threat or blackmail signals']
        : ['No harmful signals found'];

    return {
      label: 'safe',
      confidence: friendly && playful ? 0.88 : 0.91,
      reasons,
      scores,
    };
  }

  const top = scores[label];
  const next = Math.max(0, ...ORDER.filter((category) => category !== label).map((category) => scores[category]));
  const margin = Math.max(0, top - next);
  const confidence = Math.min(
    0.97,
    0.84 + Math.min(top, 8) * 0.014 + Math.min(margin, 4) * 0.006,
  );

  const reasons = hits[label].slice(0, 2).map((term, index) =>
    index === 0 ? `${REASON_PREFIX[label]}: “${term}”` : `Also: “${term}”`,
  );

  if (reasons.length === 0) {
    reasons.push(`${REASON_PREFIX[label]} detected`);
  }

  return {
    label,
    confidence: Math.round(confidence * 100) / 100,
    reasons,
    scores,
  };
}

export const classifyText: Classifier = classify;

export function scoreSummary(result: ClassifierResult): string {
  return ORDER.filter((category) => result.scores[category] > 0)
    .map((category) => `${category}: ${result.scores[category].toFixed(1)}`)
    .join(' · ');
}
