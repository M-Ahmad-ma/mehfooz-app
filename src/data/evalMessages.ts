import type { Category, Language } from '../types';

export type EvalMessage = {
  text: string;
  language: Language;
  label: Category;
};

/**
 * Held-out curated set. These messages are not used in the demo feed.
 * It is a sanity check for the rules engine, not a replacement for a
 * properly annotated test set.
 */
export const evalMessages: EvalMessage[] = [
  // safe
  { text: 'Kal class 3 baje hai, notes bhej dena please.', language: 'roman-ur', label: 'safe' },
  { text: 'السلام علیکم، سب خیریت؟', language: 'ur', label: 'safe' },
  { text: 'Meeting moved to 4 pm. See you in the library.', language: 'en', label: 'safe' },
  { text: 'Yaar tum pagal ho, itna acha joke kiya 😂', language: 'roman-ur', label: 'safe' },
  { text: 'سلام، سبا به یونیورسٹی ته ځو؟', language: 'ps', label: 'safe' },
  { text: 'Your assignment was really good, congratulations!', language: 'en', label: 'safe' },
  { text: 'شکریہ، آپ کی مدد سے کام ہو گیا۔', language: 'ur', label: 'safe' },
  { text: 'مننه، زما درس ښه و.', language: 'ps', label: 'safe' },

  // abusive
  { text: 'Tum bohat besharam aur bewakoof ho.', language: 'roman-ur', label: 'abusive' },
  { text: 'You are a stupid idiot.', language: 'en', label: 'abusive' },
  { text: 'تم بہت بے شرم اور بے وقوف ہو۔', language: 'ur', label: 'abusive' },
  { text: 'ته ډیره بې شرمه او احمقه یې.', language: 'ps', label: 'abusive' },
  {
    text: 'Har jagah badnaam karti ho, sharam nahi aati.',
    language: 'roman-ur',
    label: 'abusive',
  },
  { text: 'You useless fool, everyone laughs at you.', language: 'en', label: 'abusive' },
  { text: 'تم نے میری عزت خراب کر دی، بے شرم۔', language: 'ur', label: 'abusive' },
  { text: 'ته بده او بې شرمه یې.', language: 'ps', label: 'abusive' },

  // threat
  {
    text: 'Main tumhe dekh lunga, ghar ka pata bhi pata hai.',
    language: 'roman-ur',
    label: 'threat',
  },
  { text: 'I will find you and make you regret this.', language: 'en', label: 'threat' },
  { text: 'تمہیں دیکھ لوں گا، گھر کا پتہ معلوم ہے۔', language: 'ur', label: 'threat' },
  { text: 'زه به دې ووینم، ستا کور پیژنم.', language: 'ps', label: 'threat' },
  { text: 'Tumhe maar dunga agar dobara message kiya.', language: 'roman-ur', label: 'threat' },
  { text: 'I will kill you if you tell anyone.', language: 'en', label: 'threat' },
  { text: 'جان سے مار ڈالوں گا، بھگتے گا۔', language: 'ur', label: 'threat' },
  { text: 'که بیا پیغام ولېږې، زه به دې ووینم.', language: 'ps', label: 'threat' },

  // blackmail
  {
    text: 'Ye screenshots sab ko bhej dunga agar reply nahi kiya.',
    language: 'roman-ur',
    label: 'blackmail',
  },
  {
    text: 'Send Rs 5000 or I will post your pictures everywhere.',
    language: 'en',
    label: 'blackmail',
  },
  {
    text: 'اگر تم نے جواب نہیں دیا تو تصویریں سب کو بھیج دوں گا۔',
    language: 'ur',
    label: 'blackmail',
  },
  { text: 'دا عکسونه به ټولو ته ولېږم که ځواب نه راکړې.', language: 'ps', label: 'blackmail' },
  {
    text: 'Warna main tumhari tasveerein sab ko dikha dunga.',
    language: 'roman-ur',
    label: 'blackmail',
  },
  {
    text: 'I have your photos. Pay me or I will leak them.',
    language: 'en',
    label: 'blackmail',
  },
  { text: 'پیسے دو ورنہ اسکرین شاٹ لیک کر دوں گا۔', language: 'ur', label: 'blackmail' },
  { text: 'که پیسې نه راکړې، عکسونه به افشا کړم.', language: 'ps', label: 'blackmail' },

  // sexual
  {
    text: 'Tum bohat sexy lag rahi ho, raat ko akeli milo.',
    language: 'roman-ur',
    label: 'sexual',
  },
  {
    text: 'Send me your photos, you look so hot.',
    language: 'en',
    label: 'sexual',
  },
  { text: 'تم بہت سیکسی ہو، تصویریں بھیجو۔', language: 'ur', label: 'sexual' },
  { text: 'ته ډیره سیکسي یې، عکس راولېږه.', language: 'ps', label: 'sexual' },
  {
    text: 'Apni tasveerein bhejo, nude photos chahiye.',
    language: 'roman-ur',
    label: 'sexual',
  },
  { text: 'I want to see your body. Send nudes.', language: 'en', label: 'sexual' },
  { text: 'رات کو اکیلی مل، فوٹو بھیج۔', language: 'ur', label: 'sexual' },
  { text: 'بربنډ عکس راولېږه.', language: 'ps', label: 'sexual' },
];
