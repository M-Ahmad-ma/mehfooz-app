package expo.modules.mehfooznative

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

data class PendingCallRecording(
  val id: String,
  val callerNumber: String,
  val startedAt: Long,
  val endedAt: Long,
  val durationMs: Long,
  val audioPath: String,
  val audioSha256: String,
  val mimeType: String,
  val fileSize: Long
) {
  fun toJson(): JSONObject = JSONObject().apply {
    put("id", id)
    put("callerNumber", callerNumber)
    put("startedAt", startedAt)
    put("endedAt", endedAt)
    put("durationMs", durationMs)
    put("audioPath", audioPath)
    put("audioSha256", audioSha256)
    put("mimeType", mimeType)
    put("fileSize", fileSize)
  }

  fun toMap(): Map<String, Any?> = mapOf(
    "id" to id,
    "callerNumber" to callerNumber,
    "startedAt" to startedAt,
    "endedAt" to endedAt,
    "durationMs" to durationMs,
    "audioPath" to audioPath,
    "audioSha256" to audioSha256,
    "mimeType" to mimeType,
    "fileSize" to fileSize
  )

  companion object {
    fun fromJson(json: JSONObject?): PendingCallRecording? {
      if (json == null) return null
      val audioPath = json.optString("audioPath", "").trim()
      if (audioPath.isEmpty()) return null

      return PendingCallRecording(
        id = json.optString("id", "call_${UUID.randomUUID()}"),
        callerNumber = json.optString("callerNumber", "").trim(),
        startedAt = json.optLong("startedAt", System.currentTimeMillis()),
        endedAt = json.optLong("endedAt", System.currentTimeMillis()),
        durationMs = json.optLong("durationMs", 0L),
        audioPath = audioPath,
        audioSha256 = json.optString("audioSha256", ""),
        mimeType = json.optString("mimeType", "audio/mp4"),
        fileSize = json.optLong("fileSize", 0L)
      )
    }
  }
}

object CallStore {
  private const val PREFS = "mehfooz_calls"
  private const val KEY_WATCHLIST = "call_watchlist"
  private const val KEY_ENABLED = "call_protection_enabled"
  private const val KEY_PENDING = "pending_call_recordings"
  private const val MAX_PENDING = 50

  private fun prefs(context: Context) =
    context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  fun normalizeNumber(raw: String): String {
    val digits = raw.filter { it.isDigit() }
    if (digits.isEmpty()) return ""

    val national = when {
      digits.startsWith("0092") && digits.length > 4 -> digits.drop(4)
      digits.startsWith("92") && digits.length >= 12 -> digits.drop(2)
      digits.startsWith("0") && digits.length >= 10 -> digits.drop(1)
      else -> digits
    }

    return if (national.length == 10 && national.startsWith("3")) {
      "+92$national"
    } else {
      "+$digits"
    }
  }

  @Synchronized
  fun setWatchlist(context: Context, numbers: List<String>) {
    val normalized = numbers
      .map { normalizeNumber(it) }
      .filter { it.isNotEmpty() }
      .toSet()
    prefs(context).edit().putStringSet(KEY_WATCHLIST, HashSet(normalized)).apply()
  }

  @Synchronized
  fun getWatchlist(context: Context): Set<String> =
    prefs(context).getStringSet(KEY_WATCHLIST, emptySet<String>())?.toSet() ?: emptySet()

  @Synchronized
  fun isWatchlisted(context: Context, rawNumber: String): Boolean {
    val normalized = normalizeNumber(rawNumber)
    return normalized.isNotEmpty() && getWatchlist(context).contains(normalized)
  }

  @Synchronized
  fun setProtectionEnabled(context: Context, enabled: Boolean) {
    prefs(context).edit().putBoolean(KEY_ENABLED, enabled).apply()
  }

  @Synchronized
  fun isProtectionEnabled(context: Context): Boolean =
    prefs(context).getBoolean(KEY_ENABLED, false)

  @Synchronized
  fun addPending(context: Context, recording: PendingCallRecording) {
    val array = readArray(prefs(context).getString(KEY_PENDING, null))
    array.put(recording.toJson())
    while (array.length() > MAX_PENDING) array.remove(0)
    prefs(context).edit().putString(KEY_PENDING, array.toString()).apply()
  }

  @Synchronized
  fun pending(context: Context): List<Map<String, Any?>> {
    val array = readArray(prefs(context).getString(KEY_PENDING, null))
    val result = mutableListOf<Map<String, Any?>>()
    for (index in 0 until array.length()) {
      PendingCallRecording.fromJson(array.optJSONObject(index))?.let { result.add(it.toMap()) }
    }
    return result
  }

  @Synchronized
  fun acknowledge(context: Context, ids: List<String>) {
    if (ids.isEmpty()) return
    val idSet = ids.toSet()
    val array = readArray(prefs(context).getString(KEY_PENDING, null))
    val next = JSONArray()
    for (index in 0 until array.length()) {
      val item = array.optJSONObject(index) ?: continue
      if (!idSet.contains(item.optString("id"))) next.put(item)
    }
    prefs(context).edit().putString(KEY_PENDING, next.toString()).apply()
  }

  @Synchronized
  fun resetRecordingState(context: Context) {
    prefs(context).edit()
      .remove(KEY_PENDING)
      .putBoolean(KEY_ENABLED, false)
      .apply()
  }

  private fun readArray(raw: String?): JSONArray = try {
    if (raw.isNullOrBlank()) JSONArray() else JSONArray(raw)
  } catch (_: Exception) {
    JSONArray()
  }
}
