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
};

export type Correction = {
  id: string;
  messageId: string;
  from: Category;
  to: Category;
  at: string;
};
