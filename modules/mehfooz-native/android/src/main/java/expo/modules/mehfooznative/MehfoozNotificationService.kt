package expo.modules.mehfooznative

import android.app.Notification
import android.app.Person
import android.os.Build
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import java.util.UUID

class MehfoozNotificationService : NotificationListenerService() {
  companion object {
    private const val TAG = "MehfoozNotify"

    @Volatile
    private var instance: MehfoozNotificationService? = null

    fun cancelByKey(key: String): Boolean {
      val service = instance ?: return false
      return try {
        service.cancelNotification(key)
        true
      } catch (error: Exception) {
        Log.w(TAG, "Could not cancel notification", error)
        false
      }
    }
  }

  override fun onCreate() {
    super.onCreate()
    instance = this
  }

  override fun onDestroy() {
    instance = null
    super.onDestroy()
  }

  override fun onNotificationPosted(sbn: StatusBarNotification?) {
    if (sbn == null) return

    try {
      process(sbn)
    } catch (error: Exception) {
      Log.w(TAG, "Could not process notification", error)
    }
  }

  private fun process(sbn: StatusBarNotification) {
    if (!IncomingStore.isLiveCaptureEnabled(this)) return
    if (sbn.packageName == packageName) return
    if (!IncomingStore.isAllowed(this, sbn.packageName)) return
    if (sbn.isOngoing) return

    val notification = sbn.notification ?: return
    if ((notification.flags and Notification.FLAG_GROUP_SUMMARY) != 0) return
    if (!isMessageLike(notification, sbn.packageName)) return

    val appLabel = appLabel(sbn.packageName)
    val extras = notification.extras
    val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()?.trim().orEmpty()
    val conversationTitle = extras
      .getCharSequence(Notification.EXTRA_CONVERSATION_TITLE)
      ?.toString()
      ?.trim()
      .orEmpty()
    val fallbackSender = title.ifBlank { conversationTitle }.ifBlank { appLabel }
    val entries = parseEntries(sbn, notification, appLabel, fallbackSender)
    if (entries.isEmpty()) return

    var shouldCancel = false
    val queued = mutableListOf<NotificationEntry>()

    for (entry in entries) {
      val marker = "${entry.key}|${entry.text.hashCode()}|${entry.postedAt}"
      if (!IncomingStore.markSeen(this, marker)) continue

      val prefilterCategory = PreFilter.categoryFor(entry.text)
      val finalEntry = if (prefilterCategory != null) {
        entry.copy(prefiltered = true, prefilterCategory = prefilterCategory)
      } else {
        entry
      }

      if (prefilterCategory != null) shouldCancel = true
      IncomingStore.addPending(this, finalEntry)
      queued.add(finalEntry)
    }

    if (queued.isEmpty()) return

    if (shouldCancel) {
      try {
        cancelNotification(sbn.key)
      } catch (error: Exception) {
        Log.w(TAG, "Could not dismiss harmful notification", error)
      }
    }

    for (entry in queued) {
      MehfoozNativeModule.emitNotification(entry.toMap())
    }
  }

  @Suppress("DEPRECATION")
  private fun parseEntries(
    sbn: StatusBarNotification,
    notification: Notification,
    appLabel: String,
    fallbackSender: String
  ): List<NotificationEntry> {
    val extras = notification.extras
    val result = mutableListOf<NotificationEntry>()
    val messageBundles = extras.getParcelableArray(Notification.EXTRA_MESSAGES)

    if (messageBundles != null) {
      for (item in messageBundles) {
        val bundle = item as? Bundle ?: continue
        val text = bundle.getCharSequence("text")?.toString()?.trim().orEmpty()
        if (text.isEmpty()) continue

        val sender = senderName(bundle)
          ?: bundle.getCharSequence("sender")?.toString()?.trim().orEmpty()
        val timestamp = bundle.getLong("time", sbn.postTime).let { if (it > 0) it else sbn.postTime }

        result.add(
          NotificationEntry(
            id = UUID.randomUUID().toString(),
            appPackage = sbn.packageName,
            appLabel = appLabel,
            sender = sender.ifBlank { fallbackSender },
            text = text,
            postedAt = timestamp,
            key = sbn.key.orEmpty(),
            prefiltered = false,
            prefilterCategory = null
          )
        )
      }
    }

    if (result.isEmpty()) {
      val text = (
        extras.getCharSequence(Notification.EXTRA_TEXT)
          ?: extras.getCharSequence(Notification.EXTRA_BIG_TEXT)
          ?: extras.getCharSequence(Notification.EXTRA_SUB_TEXT)
        )?.toString()?.trim().orEmpty()

      if (text.isNotEmpty()) {
        result.add(
          NotificationEntry(
            id = UUID.randomUUID().toString(),
            appPackage = sbn.packageName,
            appLabel = appLabel,
            sender = fallbackSender,
            text = text,
            postedAt = sbn.postTime,
            key = sbn.key.orEmpty(),
            prefiltered = false,
            prefilterCategory = null
          )
        )
      }
    }

    return result
  }

  @Suppress("DEPRECATION")
  private fun senderName(bundle: Bundle): String? {
    val person: Person? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      bundle.getParcelable("sender_person", Person::class.java)
    } else {
      bundle.getParcelable<Person>("sender_person")
    }

    return person?.name?.toString()?.trim()?.takeIf { it.isNotEmpty() }
  }

  private fun isMessageLike(notification: Notification, sourcePackage: String): Boolean {
    if (notification.category == Notification.CATEGORY_MESSAGE) return true
    if (notification.extras.containsKey(Notification.EXTRA_MESSAGES)) return true

    return sourcePackage == "com.whatsapp" ||
      sourcePackage == "com.whatsapp.w4b" ||
      sourcePackage == "com.facebook.orca"
  }

  private fun appLabel(sourcePackage: String): String {
    return try {
      val info = packageManager.getApplicationInfo(sourcePackage, 0)
      packageManager.getApplicationLabel(info).toString()
    } catch (_: Exception) {
      sourcePackage
    }
  }
}
