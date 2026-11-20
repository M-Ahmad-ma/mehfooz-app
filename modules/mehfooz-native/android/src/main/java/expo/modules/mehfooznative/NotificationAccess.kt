package expo.modules.mehfooznative

import android.content.Context
import android.content.Intent
import android.provider.Settings

object NotificationAccess {
  fun isGranted(context: Context): Boolean {
    val enabled = Settings.Secure.getString(
      context.contentResolver,
      "enabled_notification_listeners"
    ) ?: return false

    return enabled
      .split(":")
      .any { entry -> entry.substringBefore('/') == context.packageName }
  }

  fun open(context: Context): Boolean {
    val candidates = listOf(
      Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS),
      Intent(Settings.ACTION_SETTINGS)
    )

    for (intent in candidates) {
      try {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
        return true
      } catch (_: Exception) {
        // Try the next settings screen.
      }
    }

    return false
  }
}
