import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { demoScenarios, seedMessages, type DemoScenario } from '../data/scenarios';
import { getScreenshotSample } from '../data/screenshots';
import { classify } from '../engine/classify';
import { sealEvidence } from '../lib/hash';
import { makeId } from '../lib/id';
import type { Category, Correction, Evidence, Message } from '../types';

type StoreState = {
  hasOnboarded: boolean;
  disguisedMode: boolean;
  messages: Message[];
  evidence: Evidence[];
  corrections: Correction[];

  completeOnboarding: () => void;
  seedInbox: () => void;
  addScenario: (scenarioId: string) => Promise<Message | null>;
  addScreenshot: (sampleId: string) => Promise<Message | null>;
  markSafe: (messageId: string) => void;
  toggleInclude: (evidenceId: string) => void;
  setDisguisedMode: (value: boolean) => void;
  resetDemo: () => void;
};

async function createEvidence(message: Message): Promise<Evidence> {
  const base = {
    id: makeId('ev'),
    messageId: message.id,
    text: message.text,
    sender: message.sender,
    language: message.language,
    receivedAt: message.receivedAt,
    category: message.category,
    confidence: message.confidence,
    addedAt: new Date().toISOString(),
    includeInReport: true,
    source: message.source,
  };

  const sha256 = await sealEvidence(base);
  return { ...base, sha256 };
}

function resultFromScenario(scenario: DemoScenario) {
  if (scenario.pinned) {
    return {
      label: scenario.pinned.label,
      confidence: scenario.pinned.confidence,
      reasons: scenario.pinned.reasons,
    };
  }
  return classify(scenario.text);
}

function resultFromScreenshot(sampleId: string) {
  const sample = getScreenshotSample(sampleId);
  if (!sample) return null;
  return {
    sample,
    result: {
      label: sample.pinned.label,
      confidence: sample.pinned.confidence,
      reasons: sample.pinned.reasons,
    },
  };
}

function messageSeed(
  sender: string,
  text: string,
  language: Message['language'],
  receivedAt: string,
  confidence: number,
): Message {
  return {
    id: makeId('msg'),
    sender,
    text,
    language,
    receivedAt,
    category: 'safe',
    confidence,
    reasons: ['Routine message', 'No harmful signals found'],
    hidden: false,
    source: 'demo',
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      disguisedMode: false,
      messages: [],
      evidence: [],
      corrections: [],

      completeOnboarding: () => {
        set({ hasOnboarded: true });
        get().seedInbox();
      },

      seedInbox: () => {
        if (get().messages.length > 0) return;
        const now = Date.now();
        const messages = seedMessages.map((seed) =>
          messageSeed(
            seed.sender,
            seed.text,
            seed.language,
            new Date(now - seed.minutesAgo * 60_000).toISOString(),
            seed.confidence,
          ),
        );
        set({ messages });
      },

      addScenario: async (scenarioId) => {
        const scenario = demoScenarios.find((item) => item.id === scenarioId);
        if (!scenario) return null;

        const result = resultFromScenario(scenario);
        const harmful = result.label !== 'safe';
        const message: Message = {
          id: makeId('msg'),
          sender: scenario.sender,
          text: scenario.text,
          language: scenario.language,
          receivedAt: new Date().toISOString(),
          category: result.label,
          confidence: result.confidence,
          reasons: result.reasons,
          hidden: harmful,
          source: 'demo',
        };

        set((state) => ({ messages: [message, ...state.messages] }));

        if (harmful) {
          const evidence = await createEvidence(message);
          set((state) => ({ evidence: [evidence, ...state.evidence] }));
        }

        return message;
      },

      addScreenshot: async (sampleId) => {
        const resolved = resultFromScreenshot(sampleId);
        if (!resolved) return null;

        const { sample, result } = resolved;
        const harmful = result.label !== 'safe';
        const message: Message = {
          id: makeId('msg'),
          sender: sample.username,
          text: sample.text,
          language: sample.language,
          receivedAt: new Date().toISOString(),
          category: result.label,
          confidence: result.confidence,
          reasons: result.reasons,
          hidden: harmful,
          source: 'screenshot',
        };

        set((state) => ({ messages: [message, ...state.messages] }));

        if (harmful) {
          const evidence = await createEvidence(message);
          set((state) => ({ evidence: [evidence, ...state.evidence] }));
        }

        return message;
      },

      markSafe: (messageId) => {
        const message = get().messages.find((item) => item.id === messageId);
        if (!message || message.category === 'safe' || message.correctedTo === 'safe') return;

        const correction: Correction = {
          id: makeId('cor'),
          messageId,
          from: message.category,
          to: 'safe',
          at: new Date().toISOString(),
        };

        set((state) => ({
          messages: state.messages.map((item) =>
            item.id === messageId ? { ...item, hidden: false, correctedTo: 'safe' as Category } : item,
          ),
          // The evidence record is immutable and keeps its original hash.
          // It is simply excluded from future report drafts.
          evidence: state.evidence.map((item) =>
            item.messageId === messageId ? { ...item, includeInReport: false } : item,
          ),
          corrections: [correction, ...state.corrections],
        }));
      },

      toggleInclude: (evidenceId) => {
        set((state) => ({
          evidence: state.evidence.map((item) =>
            item.id === evidenceId ? { ...item, includeInReport: !item.includeInReport } : item,
          ),
        }));
      },

      setDisguisedMode: (value) => set({ disguisedMode: value }),

      resetDemo: () => {
        set({
          hasOnboarded: false,
          disguisedMode: false,
          messages: [],
          evidence: [],
          corrections: [],
        });
      },
    }),
    {
      name: 'mehfooz-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        disguisedMode: state.disguisedMode,
        messages: state.messages,
        evidence: state.evidence,
        corrections: state.corrections,
      }),
    },
  ),
);

/**
 * Persist hydration can be slow on first launch. The short fallback prevents
 * a storage edge case from leaving the app on a blank boot screen.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useStore.persist.hasHydrated());

  useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const unsubscribe = useStore.persist.onFinishHydration(() => setHydrated(true));
    const fallback = setTimeout(() => setHydrated(true), 1500);

    return () => {
      unsubscribe();
      clearTimeout(fallback);
    };
  }, []);

  return hydrated;
}
