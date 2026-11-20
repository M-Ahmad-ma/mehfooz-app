export const support = {
  drfNumber: '0800-39393',
  drfDial: '080039393',
  ncciaHelpline: '1799',
  ncciaPortal: 'https://complaint.nccia.gov.pk',
  ncciaWebsite: 'https://www.nccia.gov.pk',
  verified: 'November 2026',
};

export const ncciaSteps = [
  {
    title: 'Keep the evidence',
    body: 'Save the original messages, screenshots, usernames, profile links and dates. Do not edit or delete them.',
  },
  {
    title: 'Write a short summary',
    body: 'Who contacted you, what was said, when it started, and what happened as a result.',
  },
  {
    title: 'File the complaint',
    body: 'Use the NCCIA online portal (complaint.nccia.gov.pk), call the NCCIA helpline, or submit the complaint proforma at the nearest NCCIA office.',
  },
  {
    title: 'Attach the evidence pack',
    body: 'Include the PDF, screenshots and account links. Keep the acknowledgment or complaint number you receive.',
  },
  {
    title: 'Follow up',
    body: 'Ask for the complaint number and the investigating officer. The DRF helpline can guide you through the process.',
  },
];

export const pecaNote =
  'Under PECA 2016 (amended in 2025), online harassment, stalking, threats, blackmail and sharing private images without consent can be offences. Section 29(1) of the amended Act authorises NCCIA to investigate and prosecute.';

export type HelpLanguage = 'en' | 'ur' | 'ps';

export type HelpCopy = {
  tab: string;
  title: string;
  intro: string;
  steps: string[];
  rights: string;
  helplineNote: string;
  ncciaNote: string;
};

export const helpCopy: Record<HelpLanguage, HelpCopy> = {
  en: {
    tab: 'EN',
    title: 'If someone is harassing you online',
    intro:
      'You do not have to handle it alone. These steps help you stay safe and keep evidence that can be used later.',
    steps: [
      'Do not reply. Do not delete the messages or screenshots.',
      'Block the account and report it on the platform.',
      'Keep the evidence: usernames, dates, screenshots and this app’s evidence pack.',
      'Call the DRF helpline 0800-39393. It is free and confidential.',
      'File a complaint with NCCIA online or at the nearest NCCIA office.',
      'Tell someone you trust. This is not your fault.',
    ],
    rights:
      'Harassment, stalking, threats, blackmail and sharing private images without consent can be offences under PECA 2016 (amended in 2025). You do not need a lawyer to ask for help.',
    helplineNote: 'Daily, 9am–5pm. Free and confidential.',
    ncciaNote:
      'Online at complaint.nccia.gov.pk, or submit the NCCIA complaint proforma at the nearest office with your evidence. Helpline: 1799.',
  },
  ur: {
    tab: 'اردو',
    title: 'اگر کوئی آن لائن ہراساں کر رہا ہے',
    intro:
      'آپ کو یہ اکیلے نہیں سہنا ہے۔ یہ اقدامات آپ کی حفاظت اور ثبوت محفوظ رکھنے میں مدد دیتے ہیں۔',
    steps: [
      'جواب نہ دیں۔ پیغامات یا اسکرین شاٹس ڈیلیٹ نہ کریں۔',
      'اکاؤنٹ بلاک کریں اور پلیٹ فارم پر رپورٹ کریں۔',
      'ثبوت سنبھالیں: اکاؤنٹ کا نام، تاریخ، اسکرین شاٹس اور اس ایپ کا ایویڈنس پیک۔',
      'ڈی آر ایف ہیلپ لائن 0800-39393 پر کال کریں۔ یہ مفت اور رازدارانہ ہے۔',
      'این سی سی آئی اے کو آن لائن یا قریبی دفتر میں شکایت دیں۔',
      'کسی قابلِ اعتماد شخص کو بتائیں۔ یہ آپ کی غلطی نہیں ہے۔',
    ],
    rights:
      'ہراسانی، پیچھا کرنا، دھمکیاں، بلیک میلنگ اور بغیر اجازت نجی تصاویر شیئر کرنا پیکا 2016 (2025 میں ترمیم شدہ) کے تحت جرم ہو سکتا ہے۔ مدد مانگنے کے لیے وکیل ضروری نہیں۔',
    helplineNote: 'روزانہ، صبح 9 سے شام 5 بجے تک۔ مفت اور رازدارانہ۔',
    ncciaNote:
      'آن لائن: complaint.nccia.gov.pk، یا قریبی این سی سی آئی اے دفتر میں ثبوت کے ساتھ شکایت فارم جمع کروائیں۔ ہیلپ لائن: 1799۔',
  },
  ps: {
    tab: 'پښتو',
    title: 'که څوک آنلاین ځوروي',
    intro:
      'دا یوازې تاسو نه شي زغملای. دا ګامونه ستاسو د خوندیتوب او شواهدو ساتلو کې مرسته کوي.',
    steps: [
      'ځواب مه ورکوئ. پیغامونه یا سکرین شاټونه مه ړنګوئ.',
      'حساب بلاک کړئ او په پلیټ فارم کې یې رپورټ کړئ.',
      'شواهد وساتئ: د حساب نوم، نېټه، سکرین شاټونه او د دې ایپ ایویډنس پیک.',
      'د DRF هیلپ لاین 0800-39393 ته زنګ ووهئ. دا وړیا او محرمانه دی.',
      'د NCCIA سره آنلاین یا په نږدې دفتر کې شکایت وړاندې کړئ.',
      'د یو باوري کس سره خبرې وکړئ. دا ستاسو غلطی نه ده.',
    ],
    rights:
      'ځورول، تعقیبول، ګواښل، بلیک میل او د خصوصي عکسونو پرته له اجازې شریکول د PECA 2016 (چې په 2025 کې تعدیل شو) لاندې جرم کېدای شي. د مرستې غوښتنې لپاره وکیل ته اړتیا نشته.',
    helplineNote: 'هره ورځ، د سهار 9 څخه تر ماښام 5 بجو پورې. وړیا او محرمانه.',
    ncciaNote:
      'آنلاین: complaint.nccia.gov.pk، یا د NCCIA نږدې دفتر ته د شواهدو سره د شکایت فورمه وسپارئ. هیلپ لاین: 1799.',
  },
};
