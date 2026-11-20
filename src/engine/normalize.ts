const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/**
 * Normalises Roman Urdu, Urdu, Pashto and English into a form that can be
 * matched consistently. Deliberately simple and inspectable — this is a
 * prototype, not a production text pipeline.
 */
export function normalizeText(input: string): string {
  let text = (input ?? '').toLowerCase();

  // Urdu/Pashto diacritics and Quranic marks
  text = text.replace(DIACRITICS, '');

  // Common Arabic-script variants
  text = text.replace(/\u064A/g, '\u06CC'); // Arabic yeh -> Urdu yeh
  text = text.replace(/\u0643/g, '\u06A9'); // Arabic kaf -> keheh
  text = text.replace(/[\u0623\u0625\u0622]/g, '\u0627'); // alef variants

  // Apostrophes should not split words ("don't" -> "dont")
  text = text.replace(/['’`]/g, '');

  // Roman Urdu / leetspeak substitutions
  text = text
    .replace(/0/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't');

  // Remove Arabic sentence punctuation
  text = text.replace(/[\u060C\u061B\u061F\u066A-\u066D\u06D4]/g, ' ');

  // Keep Latin, Arabic-script and digits; drop emoji and other punctuation.
  // Explicit ranges are used instead of Unicode property escapes so the
  // normalizer behaves the same on Hermes and Node.
  text = text.replace(
    /[^A-Za-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]/g,
    ' ',
  );
  text = text.replace(/\s+/g, ' ').trim();

  // "bhaaaan" -> "bhan", "pleeease" -> "please"
  text = text.replace(/(.)\1{2,}/g, '$1');

  return text;
}

const FRIENDLY_EMOJI = ['😂', '🤣', '😅', '😊', '😍', '❤️', '🙂'];

const FRIENDLY_WORDS = [
  'yaar',
  'yar',
  'bro',
  'haha',
  'hahaha',
  'lol',
  'mazak',
  'mazaak',
  'joke',
  'cute',
  'hansi',
  'hans',
  'love',
  'shukriya',
  'thanks',
  'thank you',
  'congratulations',
  'awesome',
  'great',
  'یار',
  'مذاق',
  'شکریہ',
  'محبت',
  'پیار',
  'ملګري',
  'مننه',
  'خندا',
];

export function hasFriendlyContext(raw: string, normalized: string): boolean {
  const rawLower = raw.toLowerCase();
  if (FRIENDLY_EMOJI.some((emoji) => rawLower.includes(emoji))) return true;

  const padded = ` ${normalized} `;
  return FRIENDLY_WORDS.some((word) => padded.includes(` ${word.toLowerCase()} `));
}
