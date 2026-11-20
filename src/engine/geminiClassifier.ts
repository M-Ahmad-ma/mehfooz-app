import type { Language } from '../types';

import { classify, type ClassifierResult } from './classify';
import { buildGeminiRequestBody, parseGeminiOutput } from './geminiPrompt';

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const CONFIGURED_MODEL = (process.env.EXPO_PUBLIC_GEMINI_MODEL || DEFAULT_MODEL)
  .trim()
  .replace(/^models\//, '');

export const isGeminiConfigured = API_KEY.trim().length > 10;
export const geminiModel = CONFIGURED_MODEL;
export const geminiApiKey = API_KEY;

function zeroScores(): ClassifierResult['scores'] {
  return { threat: 0, blackmail: 0, sexual: 0, abusive: 0 };
}

export async function classifyWithGemini(
  text: string,
  languageHint?: Language,
): Promise<ClassifierResult> {
  if (!isGeminiConfigured) {
    throw new Error('Gemini API key is not configured');
  }

  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY.trim(),
        },
        body: JSON.stringify(buildGeminiRequestBody(text, languageHint)),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      promptFeedback?: { blockReason?: string };
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    if (data.promptFeedback?.blockReason) {
      throw new Error(`Gemini blocked: ${data.promptFeedback.blockReason}`);
    }

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const raw = parts.map((part) => part.text ?? '').join('');
    if (!raw.trim()) throw new Error('Gemini returned no text');

    const parsed = parseGeminiOutput(raw);

    return {
      label: parsed.label,
      confidence: parsed.confidence,
      reasons: parsed.reasons,
      scores: zeroScores(),
      source: 'gemini',
      model: geminiModel,
      latencyMs: Date.now() - started,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * The live pipeline always succeeds: Gemini first when configured, local
 * rules on timeout/refusal/network failure. The scripted demo calls the rules
 * engine directly so it never depends on the network.
 */
export async function classifyWithFallback(
  text: string,
  languageHint?: Language,
): Promise<ClassifierResult> {
  const started = Date.now();

  if (!isGeminiConfigured) {
    return {
      ...classify(text),
      source: 'rules',
      latencyMs: Date.now() - started,
    };
  }

  try {
    return await classifyWithGemini(text, languageHint);
  } catch (error) {
    return {
      ...classify(text),
      source: 'rules-fallback',
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : 'Gemini unavailable',
    };
  }
}
