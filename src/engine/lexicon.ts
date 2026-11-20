import type { Category } from '../types';

import { normalizeText } from './normalize';

export type HarmCategory = Exclude<Category, 'safe'>;

export type Signal = {
  /** Normalised form used for matching. */
  term: string;
  /** Human-readable form used in reasons and the UI. */
  display: string;
  category: HarmCategory;
  weight: number;
};

type Group = [HarmCategory, number, string[]];

/**
 * A deliberately small, hand-built lexicon. Weights encode how strongly a
 * surface form suggests a category. Phrases are more reliable than single
 * words, which is why most entries are multi-word.
 */
const GROUPS: Group[] = [
  // ---------------------------------------------------------------- threat
  [
    'threat',
    5,
    [
      'dekh lunga',
      'dekh loon ga',
      'dekh lon ga',
      'dekh lo ga',
      'maar dunga',
      'maar doon ga',
      'maar dalunga',
      'jan se',
      'jaan se',
      'khatam kar dunga',
      'i will kill you',
      'i will find you',
      'make you regret',
      'you will regret',
      'watch your back',
      'i know where you live',
      'i will hurt you',
      'دیکھ لوں گا',
      'دیکھ لونگا',
      'دیکھ لو گا',
      'مار ڈالوں گا',
      'مار دوں گا',
      'جان سے',
      'ختم کر دوں گا',
      'بھگتے گا',
      'بھگتے گی',
      'بچ کے رہ',
      'دې ووینم',
      'ته به ووینم',
      'وژنم',
    ],
  ],
  [
    'threat',
    4,
    ['ghar ka pata', 'tumhara hashr', 'گھر کا پتہ', 'ستا کور', 'kill you'],
  ],
  [
    'threat',
    3,
    ['pata hai mujhe', 'pata mujhe', 'پتہ معلوم', 'کور پیژنم'],
  ],
  ['threat', 2, ['پیژنم']],

  // ------------------------------------------------------------- blackmail
  [
    'blackmail',
    5,
    [
      'sab ko bhej',
      'sab ko bhej dunga',
      'leak kar dunga',
      'expose kar dunga',
      'badnaam kar dunga',
      'i will post your',
      'post your pictures',
      'post your photos',
      'post your pics',
      'i will leak',
      'blackmail',
      'سب کو بھیج دوں گا',
      'لیک کر دوں گا',
      'بے نقاب کر',
      'پیسے دو',
      'بدنام کر دوں گا',
      'ټولو ته ولېږم',
      'افشا کړم',
      'بلیک میل',
    ],
  ],
  [
    'blackmail',
    4,
    [
      'sab ko dikha',
      'sab ko bata',
      'screenshots sab',
      'tasveerein sab',
      'tasveeren sab',
      'tasveerain sab',
      'agar reply nahi',
      'agar jawab nahi',
      'agar tum ne jawab',
      'reply nahi kiya',
      'share your pictures',
      'share your photos',
      'pay me',
      'leak them',
      'expose you',
      'or i will post',
      'or i will leak',
      'سب کو دکھا',
      'سب کو بتا',
      'تصویریں سب',
      'اگر جواب نہیں',
      'اگر تم نے جواب',
      'اسکرین شاٹ',
      'ټولو ته ښکاره',
      'که ځواب نه',
      'که پیسې نه',
    ],
  ],
  [
    'blackmail',
    2.5,
    ['send rs', 'send me money', 'i have your photos', 'i have your pictures'],
  ],
  [
    'blackmail',
    2,
    ['warna', 'screenshot', 'screenshots', 'ورنہ', 'دا عکسونه'],
  ],

  // ---------------------------------------------------------------- sexual
  [
    'sexual',
    5,
    [
      'send nudes',
      'nude photos',
      'naked pics',
      'i want to see you naked',
      'i want to see your body',
      'بربنډ عکس',
    ],
  ],
  [
    'sexual',
    4,
    [
      'sexy',
      'bohat sexy',
      'bahut sexy',
      'raat ko akeli',
      'raat ko milo',
      'akeli milo',
      'akela milo',
      'apni tasveerein bhejo',
      'apni tasveeren bhejo',
      'apni tasveerain bhejo',
      'send me your photos',
      'send me your pics',
      'nudes',
      'you look sexy',
      'you look so hot',
      'سیکسی',
      'بہت سیکسی',
      'تصویریں بھیج',
      'اپنی تصویریں',
      'رات کو مل',
      'اکیلی مل',
      'اکیلا مل',
      'برہنہ',
      'سیکسي',
      'ډیره سیکسي',
      'بربنډ',
    ],
  ],
  [
    'sexual',
    3,
    [
      'tasveerein bhejo',
      'tasveeren bhejo',
      'tasveerain bhejo',
      'send me pics',
      'nude',
      'sexting',
      'شپه راشه',
    ],
  ],
  [
    'sexual',
    2,
    [
      'photo bhejo',
      'your body',
      'sexual',
      'تصویر بھیج',
      'فوٹو بھیج',
      'عکس راولېږه',
      'عکسونه راولېږه',
      'جسم',
    ],
  ],

  // --------------------------------------------------------------- abusive
  [
    'abusive',
    3,
    [
      'harami',
      'haramzada',
      'bitch',
      'slut',
      'whore',
      'bastard',
      'حرامی',
      'حرامزادہ',
    ],
  ],
  [
    'abusive',
    2.5,
    [
      'besharam',
      'be sharam',
      'bewakoof',
      'bewaqoof',
      'stupid',
      'idiot',
      'بے شرم',
      'بے وقوف',
      'بې شرمه',
      'بې شرم',
      'احمق',
      'احمقه',
    ],
  ],
  [
    'abusive',
    2,
    [
      'badnaam',
      'sharam nahi',
      'بدنام',
      'شرم نہیں',
      'نالائق',
      'نکما',
      'کم عقل',
    ],
  ],
  [
    'abusive',
    1.5,
    [
      'pagal',
      'kutta',
      'kutti',
      'kutte',
      'nikamma',
      'nalayak',
      'loser',
      'useless',
      'fool',
      'moron',
      'shut up',
      'پاگل',
      'کتا',
      'کتی',
      'بے کار',
      'بده',
      'بې کاره',
    ],
  ],
];

export const SIGNALS: Signal[] = GROUPS.flatMap(([category, weight, terms]) =>
  terms.map((display) => ({
    term: normalizeText(display),
    display,
    category,
    weight,
  })),
);
