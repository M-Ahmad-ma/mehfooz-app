package expo.modules.mehfooznative

import android.Manifest
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.lang.ref.WeakReference

class MehfoozNativeModule : Module() {
  companion object {
    @Volatile
    private var instance: WeakReference<MehfoozNativeModule>? = null

    fun emitNotification(payload: Map<String, Any?>) {
      val module = instance?.get() ?: return
      Handler(Looper.getMainLooper()).post {
        module.sendEvent("onNotification", payload)
      }
    }

    fun emitPendingShare(context: Context) {
      val share = IncomingStore.getPendingShare(context) ?: return
      val module = instance?.get() ?: return
      Handler(Looper.getMainLooper()).post {
        module.sendEvent("onShare", share)
      }
    }

    fun emitCallRecording(payload: Map<String, Any?>) {
      val module = instance?.get() ?: return
      Handler(Looper.getMainLooper()).post {
        module.sendEvent("onCallRecording", payload)
      }
    }
  }

  private val context: Context
    get() = requireNotNull(appContext.reactContext) {
      "React context is not available"
    }

  override fun definition() = ModuleDefinition {
    Name("MehfoozNative")

    Events("onNotification", "onShare", "onCallRecording")

    OnCreate {
      instance = WeakReference(this@MehfoozNativeModule)
    }

    OnDestroy {
      instance = null
    }

    Function("isNativeAvailable") { true }

    AsyncFunction("hasNotificationAccess") {
      NotificationAccess.isGranted(context)
    }

    Function("openNotificationAccessSettings") {
      NotificationAccess.open(context)
    }

    AsyncFunction("hasAlertNotificationPermission") {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) ==
          PackageManager.PERMISSION_GRANTED
      } else {
        context.getSystemService(NotificationManager::class.java).areNotificationsEnabled()
      }
    }

    Function("requestAlertNotificationPermission") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
        true
      } else {
        val activity = appContext.currentActivity
        when {
          activity == null -> false
          activity.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED -> true
          else -> {
            activity.requestPermissions(
              arrayOf(Manifest.permission.POST_NOTIFICATIONS),
              7410
            )
            true
          }
        }
      }
    }

    AsyncFunction("hasCallPermissions") {
      mapOf(
        "microphone" to (context.checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED),
        "phoneState" to (context.checkSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED),
        "callLog" to (context.checkSelfPermission(Manifest.permission.READ_CALL_LOG) == PackageManager.PERMISSION_GRANTED)
      )
    }

    Function("requestCallPermissions") {
      val activity = appContext.currentActivity
      if (activity == null) {
        false
      } else {
        val permissions = arrayOf(
          Manifest.permission.RECORD_AUDIO,
          Manifest.permission.READ_PHONE_STATE,
          Manifest.permission.READ_CALL_LOG
        )
        val missing = permissions.filter {
          activity.checkSelfPermission(it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isEmpty()) {
          true
        } else {
          activity.requestPermissions(missing.toTypedArray(), 7411)
          true
        }
      }
    }

    Function("startCallProtection") {
      val microphone = context.checkSelfPermission(Manifest.permission.RECORD_AUDIO) ==
        PackageManager.PERMISSION_GRANTED
      val phoneState = context.checkSelfPermission(Manifest.permission.READ_PHONE_STATE) ==
        PackageManager.PERMISSION_GRANTED
      val callLog = context.checkSelfPermission(Manifest.permission.READ_CALL_LOG) ==
        PackageManager.PERMISSION_GRANTED
      val notificationsPermission = Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
        context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) ==
        PackageManager.PERMISSION_GRANTED
      val notifications = notificationsPermission &&
        context.getSystemService(NotificationManager::class.java).areNotificationsEnabled()

      if (!microphone || !phoneState || !callLog || !notifications) {
        false
      } else {
        try {
          CallStore.setProtectionEnabled(context, true)
          CallRecordingService.start(context)
          true
        } catch (_: Exception) {
          CallStore.setProtectionEnabled(context, false)
          false
        }
      }
    }

    Function("stopCallProtection") {
      CallRecordingService.stop(context)
    }

    AsyncFunction("isCallProtectionEnabled") {
      CallStore.isProtectionEnabled(context)
    }

    Function("setCallWatchlist") { numbers: List<String> ->
      CallStore.setWatchlist(context, numbers)
    }

    Function("getCallWatchlist") {
      CallStore.getWatchlist(context).toList()
    }

    AsyncFunction("getPendingCallRecordings") {
      CallStore.pending(context)
    }

    Function("acknowledgeCallRecordings") { ids: List<String> ->
      CallStore.acknowledge(context, ids)
    }

    Function("deleteCallRecording") { path: String ->
      try {
        val root = context.filesDir.canonicalFile
        val target = File(path).canonicalFile
        if (!target.path.startsWith(root.path + File.separator)) {
          false
        } else {
          target.delete()
        }
      } catch (_: Exception) {
        false
      }
    }

    Function("resetCallRecordingState") {
      CallRecordingService.stop(context)
      CallStore.resetRecordingState(context)
      CallStore.setWatchlist(context, emptyList<String>())
    }

    Function("setLiveCaptureEnabled") { enabled: Boolean ->
      IncomingStore.setLiveCaptureEnabled(context, enabled)
    }

    Function("setBackgroundGeminiConfig") { apiKey: String, model: String ->
      IncomingStore.setBackgroundGeminiConfig(context, apiKey, model)
    }

    Function("isLiveCaptureEnabled") {
      IncomingStore.isLiveCaptureEnabled(context)
    }

    Function("setAllowedPackages") { packages: List<String> ->
      IncomingStore.setAllowedPackages(context, packages.toSet())
    }

    Function("getAllowedPackages") {
      IncomingStore.getAllowedPackages(context).toList()
    }

    AsyncFunction("getPendingNotifications") {
      IncomingStore.pending(context)
    }

    Function("acknowledgeNotifications") { ids: List<String> ->
      IncomingStore.acknowledge(context, ids)
    }

    Function("cancelNotification") { key: String ->
      MehfoozNotificationService.cancelByKey(key)
    }

    AsyncFunction("getPendingShare") {
      IncomingStore.getPendingShare(context) ?: emptyMap<String, Any?>()
    }

    Function("clearPendingShare") {
      IncomingStore.clearPendingShare(context)
    }

    Function("resetCaptureState") {
      IncomingStore.resetCaptureState(context)
    }

    AsyncFunction("recognizeText") { path: String, language: String, promise: Promise ->
      OcrEngine.recognize(context, path, language, promise)
    }

    AsyncFunction("getImagePayload") { path: String, promise: Promise ->
      ImageTools.payload(path, promise)
    }
  }
}
