package expo.modules.mehfooznative

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import java.io.File

/**
 * The share sheet target. It copies the shared image into app storage, stores
 * it as a pending share, and brings the main Mehfooz activity to the front.
 */
class ShareActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    handleIntent(intent)
  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    if (intent != null) handleIntent(intent)
  }

  @Suppress("DEPRECATION")
  private fun extractImageUri(intent: Intent): Uri? {
    val direct = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
    } else {
      intent.getParcelableExtra(Intent.EXTRA_STREAM)
    }

    return direct ?: intent.clipData?.takeIf { it.itemCount > 0 }?.getItemAt(0)?.uri
  }

  private fun handleIntent(intent: Intent?) {
    if (intent == null || intent.action != Intent.ACTION_SEND) {
      finish()
      return
    }

    val uri = extractImageUri(intent)
    if (uri == null) {
      toast("Could not read the shared image")
      finish()
      return
    }

    val mimeType = intent.type ?: contentResolver.getType(uri) ?: "image/*"

    try {
      val directory = File(filesDir, "shared_screenshots").apply { mkdirs() }
      val extension = when {
        mimeType.contains("png") -> "png"
        mimeType.contains("webp") -> "webp"
        else -> "jpg"
      }
      val file = File(directory, "screenshot_${System.currentTimeMillis()}.$extension")

      contentResolver.openInputStream(uri)?.use { input ->
        file.outputStream().use { output -> input.copyTo(output) }
      } ?: throw IllegalStateException("Empty image stream")

      IncomingStore.setPendingShare(
        applicationContext,
        file.absolutePath,
        mimeType,
        System.currentTimeMillis()
      )

      MehfoozNativeModule.emitPendingShare(applicationContext)

      val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
      launchIntent?.addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_CLEAR_TOP or
          Intent.FLAG_ACTIVITY_SINGLE_TOP
      )

      if (launchIntent != null) {
        startActivity(launchIntent)
      } else {
        toast("Open Mehfooz to review the screenshot")
      }
    } catch (_: Exception) {
      toast("Could not read the shared image")
    } finally {
      finish()
    }
  }

  private fun toast(message: String) {
    Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
  }
}
