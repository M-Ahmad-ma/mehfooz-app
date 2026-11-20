export type Category = 'safe' | 'abusive' | 'sexual' | 'threat' | 'blackmail';

export type Language = 'ur' | 'roman-ur' | 'ps' | 'en';

export type MessageSource = 'demo' | 'screenshot' | 'notification';

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
};
