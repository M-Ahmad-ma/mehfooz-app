package expo.modules.mehfooznative

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import android.telephony.TelephonyManager
import android.util.Log
import java.io.File
import java.io.FileInputStream
import java.security.MessageDigest
import java.util.UUID
import java.util.concurrent.Executors

/**
 * Persistent foreground service that watches incoming calls from the user's
 * watchlist and records the local microphone while the call is active.
 *
 * This is deliberately a prototype. Android 10+ does not give ordinary apps
 * access to the cellular call audio stream; the recording may contain only the
 * local side or room audio, depending on the device.
 */
class CallRecordingService : Service() {
  companion object {
    private const val TAG = "MehfoozCall"
    private const val CHANNEL_PROTECTION = "mehfooz_call_protection"
    private const val CHANNEL_SAVED = "mehfooz_call_saved"
    private const val NOTIF_PROTECTION = 7460
    private const val NOTIF_SAVED = 7461
    private const val ACTION_START = "expo.modules.mehfooznative.CALL_START"
    private const val ACTION_STOP = "expo.modules.mehfooznative.CALL_STOP"

    fun start(context: Context) {
      val intent = Intent(context, CallRecordingService::class.java).setAction(ACTION_START)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      CallStore.setProtectionEnabled(context, false)
      context.stopService(Intent(context, CallRecordingService::class.java))
    }
  }

  private var mediaRecorder: MediaRecorder? = null
  private var recordingFile: File? = null
  private var recordingCaller: String? = null
  private var recordingStartedAt: Long = 0L
  private var armedCaller: String? = null
  private var foregroundStarted = false
  @Volatile
  private var destroyed = false
  private val finalizer = Executors.newSingleThreadExecutor()

  private val phoneStateReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      if (intent?.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return
      handlePhoneState(intent)
    }
  }

  override fun onCreate() {
    super.onCreate()
    ensureChannels()
    registerPhoneReceiver()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    startAsForeground()
    if (!foregroundStarted) {
      CallStore.setProtectionEnabled(this, false)
      return START_NOT_STICKY
    }

    when (intent?.action) {
      ACTION_STOP -> {
        CallStore.setProtectionEnabled(this, false)
        finishRecording()
        stopForeground(true)
        stopSelf()
        return START_NOT_STICKY
      }

      else -> {
        CallStore.setProtectionEnabled(this, true)
        updateProtectionNotification()
      }
    }

    return START_STICKY
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onDestroy() {
    destroyed = true
    CallStore.setProtectionEnabled(this, false)
    finishRecording()
    try {
      unregisterReceiver(phoneStateReceiver)
    } catch (_: Exception) {
      // Receiver may already be unregistered.
    }
    foregroundStarted = false
    finalizer.shutdown()
    stopForeground(true)
    super.onDestroy()
  }

  @Suppress("DEPRECATION")
  private fun registerPhoneReceiver() {
    try {
      val filter = IntentFilter(TelephonyManager.ACTION_PHONE_STATE_CHANGED)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        registerReceiver(phoneStateReceiver, filter, Context.RECEIVER_EXPORTED)
      } else {
        registerReceiver(phoneStateReceiver, filter)
      }
    } catch (error: Exception) {
      Log.w(TAG, "Could not register phone state receiver", error)
    }
  }

  private fun startAsForeground() {
    val notification = buildProtectionNotification()
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        startForeground(
          NOTIF_PROTECTION,
          notification,
          ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
        )
      } else {
        startForeground(NOTIF_PROTECTION, notification)
      }
      foregroundStarted = true
    } catch (error: Exception) {
      foregroundStarted = false
      Log.w(TAG, "Could not start call protection foreground service", error)
      stopSelf()
    }
  }

  private fun handlePhoneState(intent: Intent) {
    val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
    val rawNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER).orEmpty()
    val normalized = CallStore.normalizeNumber(rawNumber)

    when (state) {
      TelephonyManager.EXTRA_STATE_RINGING -> {
        if (normalized.isNotEmpty() && CallStore.isWatchlisted(this, normalized)) {
          armedCaller = normalized
          updateProtectionNotification("Incoming call from watchlist · $normalized")
          Log.i(TAG, "Armed recording for watchlisted incoming call")
        } else {
          armedCaller = null
        }
      }

      TelephonyManager.EXTRA_STATE_OFFHOOK -> {
        val caller = armedCaller
        if (caller != null && !isRecording()) {
          startRecording(caller)
        }
      }

      TelephonyManager.EXTRA_STATE_IDLE -> {
        finishRecording()
        armedCaller = null
        updateProtectionNotification()
      }
    }
  }

  @Suppress("DEPRECATION")
  private fun startRecording(caller: String) {
    if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
      postInfoNotification(
        "Microphone permission needed",
        "Allow the microphone to record watchlisted calls."
      )
      return
    }

    val directory = File(filesDir, "call_recordings").apply { mkdirs() }
    val file = File(directory, "mehfooz_call_${System.currentTimeMillis()}.m4a")
    val sources = intArrayOf(
      MediaRecorder.AudioSource.VOICE_COMMUNICATION,
      MediaRecorder.AudioSource.MIC
    )

    for (source in sources) {
      val recorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        MediaRecorder(this)
      } else {
        MediaRecorder()
      }

      try {
        recorder.setAudioSource(source)
        recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
        recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
        recorder.setAudioEncodingBitRate(64_000)
        recorder.setAudioSamplingRate(44_100)
        recorder.setOutputFile(file.absolutePath)
        recorder.prepare()
        recorder.start()

        mediaRecorder = recorder
        recordingFile = file
        recordingCaller = caller
        recordingStartedAt = System.currentTimeMillis()
        updateProtectionNotification("Recording call · $caller")
        postInfoNotification("Recording started", "Mehfooz is recording this call locally.")
        Log.i(TAG, "Recording started with audio source $source")
        return
      } catch (error: Exception) {
        Log.w(TAG, "Could not record with audio source $source", error)
        try {
          recorder.release()
        } catch (_: Exception) {
          // Ignore release errors.
        }
        file.delete()
      }
    }

    postInfoNotification(
      "Call recording unavailable",
      "Android blocked call audio on this device. The call was not recorded."
    )
  }

  private fun finishRecording() {
    val recorder = mediaRecorder
    val file = recordingFile
    val caller = recordingCaller
    val startedAt = recordingStartedAt

    mediaRecorder = null
    recordingFile = null
    recordingCaller = null
    recordingStartedAt = 0L

    if (recorder == null || file == null || caller == null) {
      updateProtectionNotification()
      return
    }

    var stopped = false
    try {
      recorder.stop()
      stopped = true
    } catch (error: Exception) {
      Log.w(TAG, "Recording stop failed; discarding partial file", error)
    } finally {
      try {
        recorder.release()
      } catch (_: Exception) {
        // Ignore release errors.
      }
    }

    if (!stopped || !file.exists() || file.length() < 2048) {
      file.delete()
      updateProtectionNotification()
      return
    }

    val endedAt = System.currentTimeMillis()
    finalizer.execute {
      try {
        val digest = sha256(file)
        val entry = PendingCallRecording(
          id = "call_${UUID.randomUUID()}",
          callerNumber = caller,
          startedAt = startedAt,
          endedAt = endedAt,
          durationMs = (endedAt - startedAt).coerceAtLeast(0L),
          audioPath = file.absolutePath,
          audioSha256 = digest,
          mimeType = "audio/mp4",
          fileSize = file.length()
        )
        CallStore.addPending(this, entry)
        MehfoozNativeModule.emitCallRecording(entry.toMap())
        postSavedNotification(entry)
        Log.i(TAG, "Recording saved (${entry.durationMs}ms)")
      } catch (error: Exception) {
        Log.w(TAG, "Could not finalize call recording", error)
        file.delete()
      }

      updateProtectionNotification()
    }
  }

  private fun isRecording(): Boolean = mediaRecorder != null

  private fun sha256(file: File): String {
    val digest = MessageDigest.getInstance("SHA-256")
    FileInputStream(file).use { input ->
      val buffer = ByteArray(8192)
      while (true) {
        val read = input.read(buffer)
        if (read <= 0) break
        digest.update(buffer, 0, read)
      }
    }
    return digest.digest().joinToString("") { "%02x".format(it.toInt() and 0xff) }
  }

  private fun ensureChannels() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java)

    if (manager.getNotificationChannel(CHANNEL_PROTECTION) == null) {
      manager.createNotificationChannel(
        NotificationChannel(
          CHANNEL_PROTECTION,
          "Call protection",
          NotificationManager.IMPORTANCE_LOW
        ).apply {
          description = "Shows when Mehfooz is watching for watchlisted calls"
          setShowBadge(false)
        }
      )
    }

    if (manager.getNotificationChannel(CHANNEL_SAVED) == null) {
      manager.createNotificationChannel(
        NotificationChannel(
          CHANNEL_SAVED,
          "Call recording saved",
          NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
          description = "Alerts when a watchlisted call recording is saved"
          setShowBadge(true)
        }
      )
    }
  }

  private fun buildProtectionNotification(
    text: String = "Call protection is on · ${CallStore.getWatchlist(this).size} numbers watched"
  ): Notification {
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_PROTECTION)
    } else {
      Notification.Builder(this)
    }

    builder
      .setSmallIcon(R.drawable.mehfooz_notification)
      .setContentTitle("Mehfooz call protection")
      .setContentText(text)
      .setStyle(Notification.BigTextStyle().bigText(text))
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setVisibility(Notification.VISIBILITY_PRIVATE)
      .setCategory(Notification.CATEGORY_SERVICE)

    openAppIntent()?.let { builder.setContentIntent(it) }

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      builder.setPriority(Notification.PRIORITY_LOW)
    }

    return builder.build()
  }

  private fun updateProtectionNotification(
    text: String = "Call protection is on · ${CallStore.getWatchlist(this).size} numbers watched"
  ) {
    if (destroyed) return
    val manager = getSystemService(NotificationManager::class.java)
    manager.notify(NOTIF_PROTECTION, buildProtectionNotification(text))
  }

  private fun postSavedNotification(entry: PendingCallRecording) {
    if (
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
      checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
    ) {
      return
    }

    val minutes = (entry.durationMs / 1000 / 60).toInt()
    val seconds = ((entry.durationMs / 1000) % 60).toInt()
    val duration = if (minutes > 0) "${minutes}m ${seconds}s" else "${seconds}s"
    val body = "Call from ${entry.callerNumber} · $duration · saved to the evidence vault"

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_SAVED)
    } else {
      Notification.Builder(this)
    }

    builder
      .setSmallIcon(R.drawable.mehfooz_notification)
      .setContentTitle("Call recording saved")
      .setContentText(body)
      .setStyle(Notification.BigTextStyle().bigText(body))
      .setAutoCancel(true)
      .setVisibility(Notification.VISIBILITY_PRIVATE)

    openAppIntent()?.let { builder.setContentIntent(it) }

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      builder.setPriority(Notification.PRIORITY_DEFAULT)
    }

    getSystemService(NotificationManager::class.java).notify(NOTIF_SAVED, builder.build())
  }

  private fun postInfoNotification(title: String, body: String) {
    if (
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
      checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
    ) {
      return
    }

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_SAVED)
    } else {
      Notification.Builder(this)
    }

    builder
      .setSmallIcon(R.drawable.mehfooz_notification)
      .setContentTitle(title)
      .setContentText(body)
      .setAutoCancel(true)
      .setVisibility(Notification.VISIBILITY_PRIVATE)

    openAppIntent()?.let { builder.setContentIntent(it) }

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      builder.setPriority(Notification.PRIORITY_DEFAULT)
    }

    getSystemService(NotificationManager::class.java).notify(NOTIF_SAVED, builder.build())
  }

  private fun openAppIntent(): PendingIntent? {
    val intent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_CLEAR_TOP or
          Intent.FLAG_ACTIVITY_SINGLE_TOP
      )
    } ?: return null

    return PendingIntent.getActivity(
      this,
      NOTIF_PROTECTION,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }
}
