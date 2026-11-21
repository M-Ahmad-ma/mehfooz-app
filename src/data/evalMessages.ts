import type { Category, Language } from '../types';

export type EvalMessage = {
  text: string;
  language: Language;
  label: Category;
  /** Stable id for v2 rows; v1 rows are assigned one when they are loaded. */
  id?: string;
  /** Phenomenon tags used for slice reporting. */
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'legacy';
  /** Pashto only: whether the text is Arabic script or Romanized. */
  scriptVariant?: 'arabic' | 'roman';
  /** Optional note for ambiguous review cases. */
  notes?: string;
};

/**
 * v1 benchmark archive: 160 messages, 32 per category and 40 per language.
 * Preserved for historical comparison. The current v2 benchmark combines this
 * set with evalV2Core.ts in evalMessagesV2.ts; run the scripts against v2.
 *
 * Policy: classify the intent directed at the recipient. Quoted/reported
 * speech, news, education, venting and legitimate conditions are safe unless
 * they are aimed at the recipient with harmful intent. Overlaps use the app's
 * precedence: threat > blackmail > sexual > abusive > safe.
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
  { text: 'Kal chutti hai, sab log ghar chale jayenge.', language: 'roman-ur', label: 'safe' },
  { text: 'Yaar tum pagal ho, itni achi cooking kaise ki 😂', language: 'roman-ur', label: 'safe' },
  { text: 'Kutta bohat cute hai, uska naam kya hai?', language: 'roman-ur', label: 'safe' },
  { text: 'I will kill it at the debate tomorrow, watch me.', language: 'roman-ur', label: 'safe' },
  { text: 'Send me the event pictures when you get time.', language: 'roman-ur', label: 'safe' },
  { text: 'This traffic is killing me today.', language: 'roman-ur', label: 'safe' },
  { text: 'کل چھٹی ہے، سب گھر چلے جائیں گے۔', language: 'ur', label: 'safe' },
  { text: 'یار تم پاگل ہو، اتنا اچھا کھانا کیسے بنایا 😂', language: 'ur', label: 'safe' },
  { text: 'کتا بہت پیارا ہے، اس کا نام کیا ہے؟', language: 'ur', label: 'safe' },
  { text: 'میں کل تقریر میں سب کو ہرا دوں گا۔', language: 'ur', label: 'safe' },
  { text: 'فنکشن کی تصویریں بھیج دینا۔', language: 'ur', label: 'safe' },
  { text: 'آج ٹریفک نے مار ڈالا۔', language: 'ur', label: 'safe' },
  { text: 'سبا رخصتي ده، ټول کور ته ځي.', language: 'ps', label: 'safe' },
  { text: 'ته ډیر خندونکی یې، دا ټوکه دې ښه وه.', language: 'ps', label: 'safe' },
  { text: 'دا سګر ډیر ښکلی دی، نوم یې څه دی؟', language: 'ps', label: 'safe' },
  { text: 'زه به سبا په خبرو کې ټول مات کړم.', language: 'ps', label: 'safe' },
  { text: 'د فنکشن عکسونه راولېږه.', language: 'ps', label: 'safe' },
  { text: 'نن ټرافیک ډیر و.', language: 'ps', label: 'safe' },
  { text: 'The library closes at 6 today.', language: 'en', label: 'safe' },
  { text: 'I’ll kill it at the debate tomorrow.', language: 'en', label: 'safe' },
  { text: 'This traffic is killing me.', language: 'en', label: 'safe' },
  { text: 'She said “I will kill you” in the movie — it was intense.', language: 'en', label: 'safe' },
  { text: 'Send me the event photos when you can.', language: 'en', label: 'safe' },
  { text: 'I reported the account that threatened me.', language: 'en', label: 'safe' },

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
  { text: 'Tum ek useless insaan ho, kisi kaam ke nahi.', language: 'roman-ur', label: 'abusive' },
  { text: 'Tumhari soch gandi hai, sharam karo.', language: 'roman-ur', label: 'abusive' },
  { text: 'Bewakoof kahin ke, har cheez galat karte ho.', language: 'roman-ur', label: 'abusive' },
  { text: 'Tum kitni badsoorat aur moti ho.', language: 'roman-ur', label: 'abusive' },
  { text: 'Sab tumse nafrat karte hain, koi tumhe pasand nahi karta.', language: 'roman-ur', label: 'abusive' },
  { text: 'Tum ek loser ho, zindagi mein kuch nahi kar sakte.', language: 'roman-ur', label: 'abusive' },
  { text: 'تم ایک بیکار انسان ہو، کسی کام کے نہیں۔', language: 'ur', label: 'abusive' },
  { text: 'تمہاری سوچ گندی ہے، شرم کرو۔', language: 'ur', label: 'abusive' },
  { text: 'بے وقوف کہیں کے، ہر چیز غلط کرتے ہو۔', language: 'ur', label: 'abusive' },
  { text: 'تم کتنی بدصورت اور موٹی ہو۔', language: 'ur', label: 'abusive' },
  { text: 'سب تم سے نفرت کرتے ہیں، کوئی تمہیں پسند نہیں کرتا۔', language: 'ur', label: 'abusive' },
  { text: 'تم ایک ناکام انسان ہو، کچھ نہیں کر سکتے۔', language: 'ur', label: 'abusive' },
  { text: 'ته یو بې کاره انسان یې، د هیچا کار نه کوې.', language: 'ps', label: 'abusive' },
  { text: 'ستا فکر خراب دی، شرم وکړه.', language: 'ps', label: 'abusive' },
  { text: 'احمق یې، هر څه غلط کوې.', language: 'ps', label: 'abusive' },
  { text: 'ته ډیره بده او چاغه یې.', language: 'ps', label: 'abusive' },
  { text: 'ټول له تا کرکه لري، څوک تا نه خوښوي.', language: 'ps', label: 'abusive' },
  { text: 'ته یو ناکام یې، هېڅ نشې کولی.', language: 'ps', label: 'abusive' },
  { text: 'You are a useless loser and nobody likes you.', language: 'en', label: 'abusive' },
  { text: 'You are so ugly and fat.', language: 'en', label: 'abusive' },
  { text: 'You are a pathetic excuse for a human being.', language: 'en', label: 'abusive' },
  { text: 'Everyone hates you; you have no friends.', language: 'en', label: 'abusive' },
  { text: 'You are a worthless piece of trash.', language: 'en', label: 'abusive' },
  { text: 'Shut up, you stupid cow.', language: 'en', label: 'abusive' },

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
  { text: 'Tumhe dekh lunga, bahar nikalna.', language: 'roman-ur', label: 'threat' },
  { text: 'Main tumhare ghar tak pahunch jaunga.', language: 'roman-ur', label: 'threat' },
  { text: 'Tumhe maar ke rakh dunga agar dubara message kiya.', language: 'roman-ur', label: 'threat' },
  { text: 'Tumhari zindagi khatam kar dunga.', language: 'roman-ur', label: 'threat' },
  { text: 'Rukna, main tumhe sadak par milta hoon.', language: 'roman-ur', label: 'threat' },
  { text: 'Tumhe aisa sabak sikhaunga ke yaad rakho ge.', language: 'roman-ur', label: 'threat' },
  { text: 'تمہیں دیکھ لوں گا، باہر نکلنا۔', language: 'ur', label: 'threat' },
  { text: 'میں تمہارے گھر تک پہنچ جاؤں گا۔', language: 'ur', label: 'threat' },
  { text: 'تمہیں مار کے رکھ دوں گا اگر دوبارہ پیغام کیا۔', language: 'ur', label: 'threat' },
  { text: 'تمہاری زندگی ختم کر دوں گا۔', language: 'ur', label: 'threat' },
  { text: 'رکنا، میں تمہیں سڑک پر ملتا ہوں۔', language: 'ur', label: 'threat' },
  { text: 'تمہیں ایسا سبق سکھاؤں گا کہ یاد رکھو گے۔', language: 'ur', label: 'threat' },
  { text: 'زه به دې ووینم، بهر ووځه.', language: 'ps', label: 'threat' },
  { text: 'زه به ستا کور ته ورسیږم.', language: 'ps', label: 'threat' },
  { text: 'که بیا پیغام ولېږې، زه به دې ووژنم.', language: 'ps', label: 'threat' },
  { text: 'ستا ژوند به ختم کړم.', language: 'ps', label: 'threat' },
  { text: 'ودرېږه، زه به دې په سړک کې ووینم.', language: 'ps', label: 'threat' },
  { text: 'زه به دې داسې درس ورکړم چې هېڅکله هېر نه کړې.', language: 'ps', label: 'threat' },
  { text: 'I’ll be waiting outside your hostel.', language: 'en', label: 'threat' },
  { text: 'I know where you live and I can reach you.', language: 'en', label: 'threat' },
  { text: 'You will regret this; I will make your life hell.', language: 'en', label: 'threat' },
  { text: 'I will hurt you if you ignore me again.', language: 'en', label: 'threat' },
  { text: 'Watch your back.', language: 'en', label: 'threat' },
  { text: 'I’ll destroy you.', language: 'en', label: 'threat' },

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
  { text: 'Tumhari tasveerein mere paas hain, 5000 bhejo.', language: 'roman-ur', label: 'blackmail' },
  { text: 'Agar tum ne block kiya to sab ko bata dunga.', language: 'roman-ur', label: 'blackmail' },
  { text: 'Main tumhari chats sab ko dikha dunga.', language: 'roman-ur', label: 'blackmail' },
  { text: 'Mujhe 10 hazar do warna ye screenshots group mein bhej dunga.', language: 'roman-ur', label: 'blackmail' },
  { text: 'Tumhari family ko sab kuch bata dunga agar tum ne nahi mila.', language: 'roman-ur', label: 'blackmail' },
  { text: 'Ye video delete nahi karunga jab tak paise nahi aate.', language: 'roman-ur', label: 'blackmail' },
  { text: 'تمہاری تصویریں میرے پاس ہیں، 5000 بھیجو۔', language: 'ur', label: 'blackmail' },
  { text: 'اگر تم نے بلاک کیا تو سب کو بتا دوں گا۔', language: 'ur', label: 'blackmail' },
  { text: 'میں تمہاری چیٹس سب کو دکھا دوں گا۔', language: 'ur', label: 'blackmail' },
  { text: 'مجھے 10 ہزار دو ورنہ یہ اسکرین شاٹ گروپ میں بھیج دوں گا۔', language: 'ur', label: 'blackmail' },
  { text: 'تمہاری فیملی کو سب کچھ بتا دوں گا اگر تم نہیں ملی۔', language: 'ur', label: 'blackmail' },
  { text: 'یہ ویڈیو ڈیلیٹ نہیں کروں گا جب تک پیسے نہیں آتے۔', language: 'ur', label: 'blackmail' },
  { text: 'ستا عکسونه زما سره دي، 5000 راولېږه.', language: 'ps', label: 'blackmail' },
  { text: 'که بلاک کړې، زه به ټولو ته ووایم.', language: 'ps', label: 'blackmail' },
  { text: 'زه به ستا چیٹونه ټولو ته ښکاره کړم.', language: 'ps', label: 'blackmail' },
  { text: '10 زره راکړه، که نه دا سکرین شاټونه ګروپ ته ولېږم.', language: 'ps', label: 'blackmail' },
  { text: 'که رانشي، زه به ستا کورنۍ ته ټول څه ووایم.', language: 'ps', label: 'blackmail' },
  { text: 'دا ویډیو نه ړنګوم تر څو پیسې رانشي.', language: 'ps', label: 'blackmail' },
  { text: 'I have your pictures. Send 5,000 or they go to your family.', language: 'en', label: 'blackmail' },
  { text: 'If you block me, I’ll share your chats with everyone.', language: 'en', label: 'blackmail' },
  { text: 'Pay me 10,000 or I’ll leak the screenshots.', language: 'en', label: 'blackmail' },
  { text: 'Meet me or I’ll tell your parents everything.', language: 'en', label: 'blackmail' },
  { text: 'I’ll delete the video when you pay me.', language: 'en', label: 'blackmail' },
  { text: 'I have your photos from the trip; do what I say or they go public.', language: 'en', label: 'blackmail' },

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
  { text: 'Tumhari body bohat sexy hai, kya dikhao gi?', language: 'roman-ur', label: 'sexual' },
  { text: 'Raat ko akeli milo, maza aayega.', language: 'roman-ur', label: 'sexual' },
  { text: 'Apni nude tasveerein bhejo.', language: 'roman-ur', label: 'sexual' },
  { text: 'Tumhare kapre utaar ke dekhna chahta hoon.', language: 'roman-ur', label: 'sexual' },
  { text: 'Tum bohat hot lag rahi ho, ek photo bhejo.', language: 'roman-ur', label: 'sexual' },
  { text: 'Mujhe tumhari private pictures chahiye.', language: 'roman-ur', label: 'sexual' },
  { text: 'تمہاری باڈی بہت سیکسی ہے، کیا دکھاؤ گی؟', language: 'ur', label: 'sexual' },
  { text: 'رات کو اکیلی مل، مزا آئے گا۔', language: 'ur', label: 'sexual' },
  { text: 'اپنی ننگی تصویریں بھیجو۔', language: 'ur', label: 'sexual' },
  { text: 'تمہارے کپڑے اتار کے دیکھنا چاہتا ہوں۔', language: 'ur', label: 'sexual' },
  { text: 'تم بہت ہاٹ لگ رہی ہو، ایک فوٹو بھیجو۔', language: 'ur', label: 'sexual' },
  { text: 'مجھے تمہاری نجی تصویریں چاہیے۔', language: 'ur', label: 'sexual' },
  { text: 'ستا جسم ډیر سیکسي دی، څه به ښکاره کړې؟', language: 'ps', label: 'sexual' },
  { text: 'شپه یوازې راشه، مزه به وکړي.', language: 'ps', label: 'sexual' },
  { text: 'خپل بربنډ عکسونه راولېږه.', language: 'ps', label: 'sexual' },
  { text: 'زه غواړم ستا کالي لرې کړم.', language: 'ps', label: 'sexual' },
  { text: 'ته ډیره هټه یې، یو عکس راولېږه.', language: 'ps', label: 'sexual' },
  { text: 'زه ستا شخصي عکسونه غواړم.', language: 'ps', label: 'sexual' },
  { text: 'You have a sexy body; what will you show me?', language: 'en', label: 'sexual' },
  { text: 'Meet me alone at night; it will be fun.', language: 'en', label: 'sexual' },
  { text: 'Send me your nude pictures.', language: 'en', label: 'sexual' },
  { text: 'I want to see you without clothes.', language: 'en', label: 'sexual' },
  { text: 'You look so hot; send one photo.', language: 'en', label: 'sexual' },
  { text: 'I want your private pictures.', language: 'en', label: 'sexual' },
];
