import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { demoScenarios, seedMessages, type DemoScenario } from '../data/scenarios';
import { getScreenshotSample } from '../data/screenshots';
import { classify } from '../engine/classify';
import { classifyWithFallback } from '../engine/geminiClassifier';
import { sealCallRecording, sealEvidence } from '../lib/hash';
import { makeId } from '../lib/id';
import { isValidPhoneNumber, normalizePhoneNumber } from '../lib/phone';
import type {
  CallRecording,
  Category,
  Correction,
  Evidence,
  IncomingNotification,
  Message,
  PendingCallRecording,
  PendingShare,
  SharedScreenshotInput,
} from '../types';

type StoreState = {
  hasOnboarded: boolean;
  disguisedMode: boolean;
  liveMode: boolean;
  pendingShare: PendingShare | null;
  messages: Message[];
  evidence: Evidence[];
  corrections: Correction[];
  callRecordings: CallRecording[];
  watchlist: string[];
  callProtectionEnabled: boolean;

  completeOnboarding: () => void;
  seedInbox: () => void;
  addScenario: (scenarioId: string) => Promise<Message | null>;
  addScreenshot: (sampleId: string) => Promise<Message | null>;
  addIncoming: (payload: IncomingNotification) => Promise<Message | null>;
  addSharedScreenshot: (input: SharedScreenshotInput) => Promise<Message | null>;
  addCallRecording: (payload: PendingCallRecording) => Promise<CallRecording | null>;
  removeCallRecording: (id: string) => void;
  toggleCallInclude: (id: string) => void;
  addWatchlistNumber: (raw: string) => 'added' | 'duplicate' | 'invalid';
  removeWatchlistNumber: (number: string) => void;
  setCallProtectionEnabled: (value: boolean) => void;
  markSafe: (messageId: string) => void;
  toggleInclude: (evidenceId: string) => void;
  setDisguisedMode: (value: boolean) => void;
  setLiveMode: (value: boolean) => void;
  setPendingShare: (share: PendingShare | null) => void;
  clearPendingShare: () => void;
  resetDemo: () => void;
};

type EvidenceImage = {
  imagePath?: string;
  imageSha256?: string;
  imageMimeType?: string;
  imageWidth?: number;
  imageHeight?: number;
};

async function createEvidence(message: Message, image?: EvidenceImage): Promise<Evidence> {
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
    appLabel: message.appLabel,
    classifierSource: message.classifierSource,
    modelVersion: message.modelVersion,
    classifierLatencyMs: message.classifierLatencyMs,
    ...(image ?? {}),
  };

  const sha256 = await sealEvidence(base);
  return { ...base, sha256 };
}

function detectLanguage(text: string): Message['language'] {
  if (/[\u0600-\u06FF]/.test(text)) {
    // Pashto-specific letters: ښ ږ ډ ټ ړ څ ځ ڼ ې ۍ
    return /[ښږډټړڅځڼېۍ]/.test(text) ? 'ps' : 'ur';
  }

  const romanUrdu =
    /\b(tum|tumhe|tumhein|yaar|hai|nahi|kya|bhej|kar|mera|meri|tera|aaj|kal|acha|hoon|raha|rahi)\b/i;
  const english =
    /\b(the|you|your|please|hello|hi|meeting|today|tomorrow|thanks|message|call|will|not|this|that|from|with)\b/i;

  if (!romanUrdu.test(text) && english.test(text)) return 'en';
  return 'roman-ur';
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
      liveMode: false,
      pendingShare: null,
      messages: [],
      evidence: [],
      corrections: [],
      callRecordings: [],
      watchlist: [],
      callProtectionEnabled: false,

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
          classifierSource: 'rules',
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
          classifierSource: 'rules',
        };

        set((state) => ({ messages: [message, ...state.messages] }));

        if (harmful) {
          const evidence = await createEvidence(message);
          set((state) => ({ evidence: [evidence, ...state.evidence] }));
        }

        return message;
      },

      addIncoming: async (payload) => {
        const existing = get().messages.find((message) => message.externalId === payload.id);
        if (existing) return existing;

        const text = payload.text.trim();
        if (!text) return null;

        const language = detectLanguage(text);
        const result = await classifyWithFallback(text, language);
        const harmful = result.label !== 'safe';
        const message: Message = {
          id: makeId('msg'),
          externalId: payload.id,
          sender: payload.sender.trim() || payload.appLabel || 'Unknown sender',
          text,
          language,
          receivedAt: new Date(payload.postedAt > 0 ? payload.postedAt : Date.now()).toISOString(),
          category: result.label,
          confidence: result.confidence,
          reasons: result.reasons,
          hidden: harmful,
          source: 'notification',
          appLabel: payload.appLabel || undefined,
          classifierSource: result.source,
          modelVersion: result.model,
          classifierLatencyMs: result.latencyMs,
        };

        // Create the evidence before committing the message so a storage or
        // crypto failure leaves the queue intact for a retry.
        const evidence = harmful ? await createEvidence(message) : null;

        const raced = get().messages.find((item) => item.externalId === payload.id);
        if (raced) return raced;

        set((state) => ({
          messages: [message, ...state.messages],
          evidence: evidence ? [evidence, ...state.evidence] : state.evidence,
        }));

        return message;
      },

      addCallRecording: async (payload) => {
        const existing = get().callRecordings.find((item) => item.id === payload.id);
        if (existing) return existing;
        if (!payload.audioPath || !payload.audioSha256) return null;

        const base = {
          id: payload.id,
          callerNumber: payload.callerNumber || 'Unknown number',
          startedAt: new Date(payload.startedAt).toISOString(),
          endedAt: new Date(payload.endedAt).toISOString(),
          durationMs: payload.durationMs,
          audioPath: payload.audioPath,
          audioSha256: payload.audioSha256,
          mimeType: payload.mimeType || 'audio/mp4',
          fileSize: payload.fileSize,
          addedAt: new Date().toISOString(),
          includeInReport: true,
          source: 'call-watchlist' as const,
        };

        const sha256 = await sealCallRecording(base);
        const recording: CallRecording = { ...base, sha256 };

        const raced = get().callRecordings.find((item) => item.id === payload.id);
        if (raced) return raced;

        set((state) => ({ callRecordings: [recording, ...state.callRecordings] }));
        return recording;
      },

      removeCallRecording: (id) => {
        set((state) => ({
          callRecordings: state.callRecordings.filter((item) => item.id !== id),
        }));
      },

      toggleCallInclude: (id) => {
        set((state) => ({
          callRecordings: state.callRecordings.map((item) =>
            item.id === id ? { ...item, includeInReport: !item.includeInReport } : item,
          ),
        }));
      },

      addWatchlistNumber: (raw) => {
        if (!isValidPhoneNumber(raw)) return 'invalid';
        const number = normalizePhoneNumber(raw);
        if (get().watchlist.includes(number)) return 'duplicate';
        set((state) => ({ watchlist: [number, ...state.watchlist] }));
        return 'added';
      },

      removeWatchlistNumber: (number) => {
        set((state) => ({ watchlist: state.watchlist.filter((item) => item !== number) }));
      },

      setCallProtectionEnabled: (value) => set({ callProtectionEnabled: value }),

      addSharedScreenshot: async (input) => {
        const text = input.text.trim();
        if (!text) return null;

        const result = input.classification;
        if (result.label === 'safe') return null;

        const message: Message = {
          id: makeId('msg'),
          sender: 'Shared screenshot',
          text,
          language: input.language,
          receivedAt: new Date().toISOString(),
          category: result.label,
          confidence: result.confidence,
          reasons: result.reasons,
          hidden: true,
          source: 'screenshot',
          appLabel: 'Shared image',
          classifierSource: result.source,
          modelVersion: result.model,
          classifierLatencyMs: result.latencyMs,
        };

        const evidence = await createEvidence(message, {
          imagePath: input.imagePath,
          imageSha256: input.imageSha256,
          imageMimeType: input.imageMimeType,
          imageWidth: input.imageWidth,
          imageHeight: input.imageHeight,
        });

        set((state) => ({
          messages: [message, ...state.messages],
          evidence: [evidence, ...state.evidence],
        }));

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

      setLiveMode: (value) => set({ liveMode: value }),

      setPendingShare: (share) => set({ pendingShare: share }),

      clearPendingShare: () => set({ pendingShare: null }),

      resetDemo: () => {
        set({
          hasOnboarded: false,
          disguisedMode: false,
          liveMode: false,
          pendingShare: null,
          messages: [],
          evidence: [],
          corrections: [],
          callRecordings: [],
          watchlist: [],
          callProtectionEnabled: false,
        });
      },
    }),
    {
      name: 'mehfooz-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        disguisedMode: state.disguisedMode,
        liveMode: state.liveMode,
        messages: state.messages,
        evidence: state.evidence,
        corrections: state.corrections,
        callRecordings: state.callRecordings,
        watchlist: state.watchlist,
        callProtectionEnabled: state.callProtectionEnabled,
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
