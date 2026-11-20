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
  }

  private val context: Context
    get() = requireNotNull(appContext.reactContext) {
      "React context is not available"
    }

  override fun definition() = ModuleDefinition {
    Name("MehfoozNative")

    Events("onNotification", "onShare")

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
