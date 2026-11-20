import type { Category, Language } from '../types';

export type DemoScenario = {
  id: string;
  title: string;
  description: string;
  sender: string;
  text: string;
  language: Language;
  group: 'harassment' | 'context' | 'language' | 'safe';
  /** Optional deterministic override for the two moments the demo depends on. */
  pinned?: { label: Category; confidence: number; reasons: string[] };
};

export const demoScenarios: DemoScenario[] = [
  {
    id: 'threat-roman',
    title: 'Threat',
    description: 'Roman Urdu · unknown number',
    sender: 'Unknown · +92 3XX XXXXXXX',
    text: 'Main tumhe dekh lunga. Ghar ka pata bhi mujhe pata hai.',
    language: 'roman-ur',
    group: 'harassment',
    pinned: {
      label: 'threat',
      confidence: 0.94,
      reasons: ['Threat phrase: “dekh lunga”', 'Location reference: “ghar ka pata”'],
    },
  },
  {
    id: 'blackmail-roman',
    title: 'Blackmail',
    description: 'Roman Urdu · threatens to share screenshots',
    sender: 'R. Khan',
    text: 'Ye screenshots main sab ko bhej dunga agar tum ne reply nahi kiya.',
    language: 'roman-ur',
    group: 'harassment',
  },
  {
    id: 'sexual-roman',
    title: 'Sexual harassment',
    description: 'Roman Urdu · unwanted request',
    sender: 'Unknown · Instagram',
    text: 'Tum bohat sexy lag rahi ho. Raat ko akeli milo aur apni tasveerein bhejo.',
    language: 'roman-ur',
    group: 'harassment',
  },
  {
    id: 'abusive-roman',
    title: 'Abusive message',
    description: 'Roman Urdu · insulting language',
    sender: 'Class group admin',
    text: 'Tum bohat besharam aur bewakoof ho. Har jagah badnaam karti ho.',
    language: 'roman-ur',
    group: 'harassment',
  },
  {
    id: 'safe-friendly',
    title: 'Friendly context',
    description: 'Contains “pagal” — should pass',
    sender: 'Ayesha',
    text: 'Yaar tum pagal ho, itna acha joke kiya 😂 main hans hans ke mar gayi.',
    language: 'roman-ur',
    group: 'context',
    pinned: {
      label: 'safe',
      confidence: 0.89,
      reasons: ['Friendly context detected', '“pagal” used playfully, no threat signals'],
    },
  },
  {
    id: 'urdu-threat',
    title: 'Threat · Urdu',
    description: 'Urdu script · unknown number',
    sender: 'Unknown · WhatsApp',
    text: 'تمہیں دیکھ لوں گا۔ گھر کا پتہ بھی مجھے معلوم ہے۔',
    language: 'ur',
    group: 'language',
  },
  {
    id: 'urdu-safe',
    title: 'Safe · Urdu',
    description: 'Class update from a friend',
    sender: 'Sana',
    text: 'السلام علیکم، کل یونیورسٹی کی کلاس کینسل ہو گئی ہے۔',
    language: 'ur',
    group: 'safe',
  },
  {
    id: 'pashto-abusive',
    title: 'Abusive · Pashto',
    description: 'Pashto script · public comment',
    sender: 'Facebook comment',
    text: 'ته ډیره بې شرمه او بده یې.',
    language: 'ps',
    group: 'language',
  },
  {
    id: 'pashto-safe',
    title: 'Safe · Pashto',
    description: 'A normal message from a friend',
    sender: 'Mehwish',
    text: 'سلام، سبا به یونیورسٹی ته ځو؟',
    language: 'ps',
    group: 'safe',
  },
  {
    id: 'english-safe',
    title: 'Safe · English',
    description: 'Routine campus announcement',
    sender: 'Campus Notice',
    text: 'The library will close at 6 pm today. Please plan your study time.',
    language: 'en',
    group: 'safe',
  },
  {
    id: 'english-blackmail',
    title: 'Blackmail · English',
    description: 'Threatens to post photos',
    sender: 'Unknown · WhatsApp',
    text: 'Send Rs 5,000 or I will post your pictures everywhere.',
    language: 'en',
    group: 'language',
  },
  {
    id: 'pashto-threat',
    title: 'Threat · Pashto',
    description: 'Pashto script · intimidating message',
    sender: 'Unknown · Facebook',
    text: 'زه به دې ووینم، ستا کور هم پیژنم.',
    language: 'ps',
    group: 'language',
  },
];

export function getScenario(id: string): DemoScenario | undefined {
  return demoScenarios.find((scenario) => scenario.id === id);
}

export type SeedMessage = {
  sender: string;
  text: string;
  language: Language;
  minutesAgo: number;
  confidence: number;
};

export const seedMessages: SeedMessage[] = [
  {
    sender: 'Ayesha',
    text: 'Kal class 3 baje hai, notes bhej dena please.',
    language: 'roman-ur',
    minutesAgo: 42,
    confidence: 0.96,
  },
  {
    sender: 'Sana',
    text: 'السلام علیکم! اسائنمنٹ جمع کروا دیا؟',
    language: 'ur',
    minutesAgo: 88,
    confidence: 0.94,
  },
  {
    sender: 'Campus Notice',
    text: 'The library will close at 6 pm today.',
    language: 'en',
    minutesAgo: 150,
    confidence: 0.98,
  },
];
