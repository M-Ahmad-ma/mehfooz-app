export type Category = 'safe' | 'abusive' | 'sexual' | 'threat' | 'blackmail';

export type Language = 'ur' | 'roman-ur' | 'ps' | 'en';

export type MessageSource = 'demo' | 'screenshot' | 'notification';

export type ClassifierSource = 'rules' | 'gemini' | 'rules-fallback';

export type ClassifierResult = {
  label: Category;
  confidence: number;
  reasons: string[];
  scores: Record<Exclude<Category, 'safe'>, number>;
  source?: ClassifierSource;
  model?: string;
  latencyMs?: number;
  error?: string;
};

export type Message = {
  id: string;
  sender: string;
  text: string;
  language: Language;
  receivedAt: string;
  category: Category;
  confidence: number;
  reasons: string[];
  hidden: boolean;
  correctedTo?: Category;
  source: MessageSource;
  /** Human-readable source app, e.g. WhatsApp or Instagram. */
  appLabel?: string;
  /** Native notification id, used to deduplicate queued captures. */
  externalId?: string;
  /** Which classifier produced this result. */
  classifierSource?: ClassifierSource;
  modelVersion?: string;
  classifierLatencyMs?: number;
};

export type Evidence = {
  id: string;
  messageId: string;
  text: string;
  sender: string;
  language: Language;
  receivedAt: string;
  category: Category;
  confidence: number;
  sha256: string;
  addedAt: string;
  includeInReport: boolean;
  source: MessageSource;
  appLabel?: string;
  /** Shared screenshot evidence. */
  imagePath?: string;
  imageSha256?: string;
  imageMimeType?: string;
  imageWidth?: number;
  imageHeight?: number;
  /** Which classifier produced the record. */
  classifierSource?: ClassifierSource;
  modelVersion?: string;
  classifierLatencyMs?: number;
};

export type Correction = {
  id: string;
  messageId: string;
  from: Category;
  to: Category;
  at: string;
};

/** Payload emitted by the Android notification listener / queue. */
export type IncomingNotification = {
  id: string;
  appPackage: string;
  appLabel: string;
  sender: string;
  text: string;
  postedAt: number;
  key: string;
  prefiltered: boolean;
  prefilterCategory?: string;
};

/** A screenshot shared into the app through the Android share sheet. */
export type PendingShare = {
  path: string;
  mimeType: string;
  receivedAt: number;
};

export type CallPermissions = {
  microphone: boolean;
  phoneState: boolean;
  callLog: boolean;
};

/** Payload emitted by the native call recording service. */
export type PendingCallRecording = {
  id: string;
  callerNumber: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  audioPath: string;
  audioSha256: string;
  mimeType: string;
  fileSize: number;
};

/** A locally stored watchlisted-call recording. */
export type CallRecording = {
  id: string;
  callerNumber: string;
  callerLabel?: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  audioPath: string;
  audioSha256: string;
  mimeType: string;
  fileSize: number;
  sha256: string;
  addedAt: string;
  includeInReport: boolean;
  source: 'call-watchlist';
};

export type OcrResult = {
  text: string;
  engine: 'mlkit' | 'tesseract' | string;
  confidence?: number;
};

export type ImagePayload = {
  base64: string;
  mimeType: string;
  sha256: string;
  width: number;
  height: number;
};

export type SharedScreenshotInput = {
  text: string;
  language: Language;
  imagePath: string;
  imageSha256: string;
  imageMimeType: string;
  imageWidth: number;
  imageHeight: number;
  classification: ClassifierResult;
};
