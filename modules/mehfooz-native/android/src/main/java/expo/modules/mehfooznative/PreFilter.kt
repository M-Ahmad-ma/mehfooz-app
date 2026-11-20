package expo.modules.mehfooznative

/**
 * Offline fallback used by the notification service when native Gemini cannot
 * run (no key, no network, no notification permission). It is a deliberately
 * tiny high-confidence phrase list, not a classifier. It errs on the side of
 * catching phrases, not in being complete.
 */
object PreFilter {
  private val THREAT_PHRASES = listOf(
    "dekh lunga",
    "dekh loon ga",
    "maar dunga",
    "maar doon ga",
    "ghar ka pata",
    "jan se",
    "i will find you",
    "i will kill you",
    "make you regret",
    "دیکھ لوں گا",
    "مار ڈالوں گا",
    "گھر کا پتہ",
    "جان سے",
    "دې ووینم",
    "وژنم",
    "ستا کور",
    "za ba tasara ogoram",
    "za ba ta sara ogoram",
    "sta kor",
    "sta kor pezhanam",
    "pezhanam",
    "pazhanam"
  )

  private val BLACKMAIL_PHRASES = listOf(
    "sab ko bhej dunga",
    "sab ko bhej doonga",
    "sab ko dikha dunga",
    "sab ko dikha doonga",
    "leak kar dunga",
    "post your pictures",
    "i will post your",
    "i have your photos",
    "سب کو بھیج دوں گا",
    "لیک کر دوں گا",
    "پیسے دو",
    "ټولو ته ولېږم",
    "افشا کړم"
  )

  private val PUNCTUATION = Regex("[\\p{Punct}\\u060C\\u061B\\u061F\\u066A-\\u066D\\u06D4]+")
  private val WHITESPACE = Regex("\\s+")
  private val DIACRITICS = Regex("[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]")

  fun categoryFor(text: String): String? {
    val normalized = normalize(text)
    if (THREAT_PHRASES.any { normalized.contains(it) }) return "threat"
    if (BLACKMAIL_PHRASES.any { normalized.contains(it) }) return "blackmail"
    return null
  }

  private fun normalize(value: String): String =
    value
      .lowercase()
      .replace(DIACRITICS, "")
      .replace(PUNCTUATION, " ")
      .replace(WHITESPACE, " ")
      .trim()
}
