package expo.modules.mehfooznative

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Person
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import java.util.UUID
import java.util.concurrent.Executors

class MehfoozNotificationService : NotificationListenerService() {
  private val worker = Executors.newSingleThreadExecutor()

  companion object {
    private const val TAG = "MehfoozNotify"
    private const val CHANNEL_ID = "mehfooz_alerts"
    private const val CHANNEL_NAME = "Mehfooz alerts"
    private const val ALERT_ID = 7401

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
    ensureAlertChannel()
  }

  override fun onDestroy() {
    instance = null
    worker.shutdownNow()
    super.onDestroy()
  }

  override fun onNotificationPosted(sbn: StatusBarNotification?) {
    if (sbn == null) return

    worker.execute {
      try {
        process(sbn)
      } catch (error: Exception) {
        Log.w(TAG, "Could not process notification", error)
      }
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

    val canAlert = canPostAlerts()
    var shouldCancel = false
    var alertEntry: NotificationEntry? = null
    val queued = mutableListOf<NotificationEntry>()

    for (entry in entries) {
      val marker = "${entry.key}|${entry.text.hashCode()}|${entry.postedAt}"
      if (!IncomingStore.markSeen(this, marker)) continue

      // Prefer Gemini when alerts can actually be posted. The static filter is
      // the offline fallback only, so a safe message that happens to contain a
      // phrase like "sta kor" is not dismissed without context.
      val gemini = if (canAlert) BackgroundGemini.classify(this, entry.text) else null
      var harmfulCategory = when {
        gemini != null -> gemini.label.takeIf { it != "safe" }
        else -> PreFilter.categoryFor(entry.text)
      }

      if (gemini != null) {
        Log.i(TAG, "Background Gemini label=${gemini.label} confidence=${gemini.confidence}")
      }

      if (harmfulCategory != null && gemini == null) {
        Log.i(TAG, "Offline prefilter category=$harmfulCategory")
      }

      val finalEntry = if (harmfulCategory != null) {
        entry.copy(prefiltered = true, prefilterCategory = harmfulCategory)
      } else {
        entry
      }

      if (harmfulCategory != null && canAlert) {
        shouldCancel = true
        alertEntry = finalEntry
      }
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
      alertEntry?.let { showShieldAlert(it) }
    }

    for (entry in queued) {
      MehfoozNativeModule.emitNotification(entry.toMap())
    }
  }

  private fun canPostAlerts(): Boolean {
    if (
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
      checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
    ) {
      return false
    }

    val manager = getSystemService(NotificationManager::class.java)
    if (!manager.areNotificationsEnabled()) return false

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = manager.getNotificationChannel(CHANNEL_ID) ?: return false
      if (channel.importance == NotificationManager.IMPORTANCE_NONE) return false
    }

    return true
  }

  private fun ensureAlertChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val manager = getSystemService(NotificationManager::class.java)
    if (manager.getNotificationChannel(CHANNEL_ID) != null) return

    val channel = NotificationChannel(
      CHANNEL_ID,
      CHANNEL_NAME,
      NotificationManager.IMPORTANCE_HIGH
    ).apply {
      description = "Alerts when Mehfooz shields a harmful message"
      enableVibration(true)
      setShowBadge(true)
    }

    manager.createNotificationChannel(channel)
  }

  private fun showShieldAlert(entry: NotificationEntry) {
    if (
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
      checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
    ) {
      return
    }

    val manager = getSystemService(NotificationManager::class.java)
    if (!manager.areNotificationsEnabled()) return

    ensureAlertChannel()

    val kind = when (entry.prefilterCategory) {
      "threat" -> "Threat"
      "blackmail" -> "Blackmail"
      "sexual" -> "Sexual harassment"
      "abusive" -> "Abusive message"
      else -> "Harmful message"
    }
    val source = entry.appLabel.ifBlank { "an app" }

    val largeIcon = try {
      val iconId = applicationInfo.icon
      if (iconId != 0) BitmapFactory.decodeResource(resources, iconId) else null
    } catch (_: Exception) {
      null
    }

    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_CLEAR_TOP or
          Intent.FLAG_ACTIVITY_SINGLE_TOP
      )
    }

    val contentIntent = launchIntent?.let {
      PendingIntent.getActivity(
        this,
        ALERT_ID,
        it,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
    }

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
    } else {
      Notification.Builder(this)
    }

    builder
      .setSmallIcon(R.drawable.mehfooz_notification)
      .setContentTitle("Mehfooz shielded a harmful message")
      .setContentText("$kind from $source · Tap to review")
      .setStyle(
        Notification.BigTextStyle().bigText(
          "$kind from $source was hidden and saved in the evidence vault. Tap to review."
        )
      )
      .setAutoCancel(true)
      .setVisibility(Notification.VISIBILITY_PRIVATE)
      .setCategory(Notification.CATEGORY_MESSAGE)
      .setOnlyAlertOnce(false)
      .setShowWhen(true)
      .setWhen(System.currentTimeMillis())
      .setColor(Color.parseColor("#0F3D33"))

    if (largeIcon != null) builder.setLargeIcon(largeIcon)
    if (contentIntent != null) builder.setContentIntent(contentIntent)
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      builder.setPriority(Notification.PRIORITY_HIGH)
    }

    manager.notify(ALERT_ID, builder.build())
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
