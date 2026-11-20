package expo.modules.mehfooznative

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

data class NotificationEntry(
  val id: String,
  val appPackage: String,
  val appLabel: String,
  val sender: String,
  val text: String,
  val postedAt: Long,
  val key: String,
  val prefiltered: Boolean,
  val prefilterCategory: String?
) {
  fun toJson(): JSONObject = JSONObject().apply {
    put("id", id)
    put("appPackage", appPackage)
    put("appLabel", appLabel)
    put("sender", sender)
    put("text", text)
    put("postedAt", postedAt)
    put("key", key)
    put("prefiltered", prefiltered)
    if (prefilterCategory != null) put("prefilterCategory", prefilterCategory)
  }

  fun toMap(): Map<String, Any?> {
    val map = mutableMapOf<String, Any?>(
      "id" to id,
      "appPackage" to appPackage,
      "appLabel" to appLabel,
      "sender" to sender,
      "text" to text,
      "postedAt" to postedAt,
      "key" to key,
      "prefiltered" to prefiltered
    )
    if (prefilterCategory != null) map["prefilterCategory"] = prefilterCategory
    return map
  }

  companion object {
    fun fromJson(json: JSONObject?): NotificationEntry? {
      if (json == null) return null
      val text = json.optString("text", "").trim()
      if (text.isEmpty()) return null

      return NotificationEntry(
        id = json.optString("id", UUID.randomUUID().toString()),
        appPackage = json.optString("appPackage", ""),
        appLabel = json.optString("appLabel", ""),
        sender = json.optString("sender", ""),
        text = text,
        postedAt = json.optLong("postedAt", System.currentTimeMillis()),
        key = json.optString("key", ""),
        prefiltered = json.optBoolean("prefiltered", false),
        prefilterCategory = if (json.has("prefilterCategory") && !json.isNull("prefilterCategory")) {
          json.optString("prefilterCategory")
        } else {
          null
        }
      )
    }
  }
}

object IncomingStore {
  private const val PREFS = "mehfooz_native"
  private const val KEY_PENDING = "pending_notifications"
  private const val KEY_SEEN = "seen_notifications"
  private const val KEY_LIVE = "live_capture_enabled"
  private const val KEY_ALLOWED = "allowed_packages"
  private const val KEY_PENDING_SHARE = "pending_share"
  private const val KEY_BG_GEMINI_API = "background_gemini_api_key"
  private const val KEY_BG_GEMINI_MODEL = "background_gemini_model"
  private const val MAX_PENDING = 100
  private const val MAX_SEEN = 300

  private val DEFAULT_PACKAGES = setOf(
    "com.whatsapp",
    "com.whatsapp.w4b",
    "com.instagram.android",
    "com.facebook.katana",
    "com.facebook.orca",
    "com.zhiliaoapp.musically",
    "com.ss.android.ugc.trill"
  )

  private fun prefs(context: Context) =
    context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  private fun readArray(raw: String?): JSONArray = try {
    if (raw.isNullOrBlank()) JSONArray() else JSONArray(raw)
  } catch (_: Exception) {
    JSONArray()
  }

  @Synchronized
  fun setLiveCaptureEnabled(context: Context, enabled: Boolean) {
    prefs(context).edit().putBoolean(KEY_LIVE, enabled).apply()
  }

  @Synchronized
  fun isLiveCaptureEnabled(context: Context): Boolean =
    prefs(context).getBoolean(KEY_LIVE, false)

  @Synchronized
  fun getAllowedPackages(context: Context): Set<String> {
    val stored = prefs(context).getStringSet(KEY_ALLOWED, null)
    return if (stored == null || stored.isEmpty()) DEFAULT_PACKAGES else stored.toSet()
  }

  @Synchronized
  fun setAllowedPackages(context: Context, packages: Set<String>) {
    prefs(context).edit().putStringSet(KEY_ALLOWED, HashSet(packages)).apply()
  }

  @Synchronized
  fun isAllowed(context: Context, packageName: String): Boolean =
    getAllowedPackages(context).contains(packageName)

  @Synchronized
  fun pending(context: Context): List<Map<String, Any?>> {
    val array = readArray(prefs(context).getString(KEY_PENDING, null))
    val result = mutableListOf<Map<String, Any?>>()
    for (index in 0 until array.length()) {
      NotificationEntry.fromJson(array.optJSONObject(index))?.let { result.add(it.toMap()) }
    }
    return result
  }

  @Synchronized
  fun addPending(context: Context, entry: NotificationEntry) {
    val array = readArray(prefs(context).getString(KEY_PENDING, null))
    array.put(entry.toJson())
    while (array.length() > MAX_PENDING) {
      array.remove(0)
    }
    prefs(context).edit().putString(KEY_PENDING, array.toString()).apply()
  }

  @Synchronized
  fun acknowledge(context: Context, ids: List<String>) {
    if (ids.isEmpty()) return
    val idSet = ids.toSet()
    val array = readArray(prefs(context).getString(KEY_PENDING, null))
    val next = JSONArray()
    for (index in 0 until array.length()) {
      val item = array.optJSONObject(index) ?: continue
      if (!idSet.contains(item.optString("id"))) {
        next.put(item)
      }
    }
    prefs(context).edit().putString(KEY_PENDING, next.toString()).apply()
  }

  /**
   * Returns true when this notification text has not been processed before.
   * The marker prevents notification updates from duplicating a message.
   */
  @Synchronized
  fun markSeen(context: Context, marker: String): Boolean {
    val array = readArray(prefs(context).getString(KEY_SEEN, null))
    for (index in 0 until array.length()) {
      if (array.optString(index) == marker) return false
    }
    array.put(marker)
    while (array.length() > MAX_SEEN) {
      array.remove(0)
    }
    prefs(context).edit().putString(KEY_SEEN, array.toString()).apply()
    return true
  }

  @Synchronized
  fun setPendingShare(context: Context, path: String, mimeType: String, receivedAt: Long) {
    val json = JSONObject().apply {
      put("path", path)
      put("mimeType", mimeType)
      put("receivedAt", receivedAt)
    }
    prefs(context).edit().putString(KEY_PENDING_SHARE, json.toString()).apply()
  }

  @Synchronized
  fun getPendingShare(context: Context): Map<String, Any?>? {
    val raw = prefs(context).getString(KEY_PENDING_SHARE, null) ?: return null
    return try {
      val json = JSONObject(raw)
      val path = json.optString("path", "")
      if (path.isEmpty()) return null
      mapOf(
        "path" to path,
        "mimeType" to json.optString("mimeType", "image/jpeg"),
        "receivedAt" to json.optLong("receivedAt", System.currentTimeMillis())
      )
    } catch (_: Exception) {
      null
    }
  }

  @Synchronized
  fun clearPendingShare(context: Context) {
    prefs(context).edit().remove(KEY_PENDING_SHARE).apply()
  }

  @Synchronized
  fun setBackgroundGeminiConfig(context: Context, apiKey: String, model: String) {
    prefs(context).edit()
      .putString(KEY_BG_GEMINI_API, apiKey.trim())
      .putString(KEY_BG_GEMINI_MODEL, model.trim())
      .apply()
  }

  @Synchronized
  fun getBackgroundGeminiApiKey(context: Context): String =
    prefs(context).getString(KEY_BG_GEMINI_API, "").orEmpty()

  @Synchronized
  fun getBackgroundGeminiModel(context: Context): String =
    prefs(context).getString(KEY_BG_GEMINI_MODEL, "gemini-3.5-flash-lite").orEmpty()

  @Synchronized
  fun resetCaptureState(context: Context) {
    prefs(context).edit()
      .remove(KEY_PENDING)
      .remove(KEY_SEEN)
      .remove(KEY_PENDING_SHARE)
      .putBoolean(KEY_LIVE, false)
      .apply()
  }
}
