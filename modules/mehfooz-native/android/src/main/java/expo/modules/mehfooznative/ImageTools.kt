package expo.modules.mehfooznative

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import expo.modules.kotlin.Promise
import java.io.ByteArrayOutputStream
import java.io.File
import java.security.MessageDigest
import kotlin.math.max

object ImageTools {
  fun payload(path: String, promise: Promise) {
    Thread {
      var source: Bitmap? = null
      var thumbnail: Bitmap? = null

      try {
        val file = File(path)
        if (!file.exists()) throw IllegalStateException("Image not found")

        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(path, bounds)
        if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
          throw IllegalStateException("Could not read image dimensions")
        }

        val longest = max(bounds.outWidth, bounds.outHeight)
        val sampleSize = if (longest > 3200) 2 else 1
        val options = BitmapFactory.Options().apply { inSampleSize = sampleSize }
        val sourceBitmap = BitmapFactory.decodeFile(path, options)
          ?: throw IllegalStateException("Could not decode image")
        source = sourceBitmap

        val decodedLongest = max(sourceBitmap.width, sourceBitmap.height)
        val thumbnailScale = if (decodedLongest > 1200) 1200f / decodedLongest else 1f
        val thumbnailBitmap = if (thumbnailScale < 1f) {
          Bitmap.createScaledBitmap(
            sourceBitmap,
            max(1, (sourceBitmap.width * thumbnailScale).toInt()),
            max(1, (sourceBitmap.height * thumbnailScale).toInt()),
            true
          )
        } else {
          sourceBitmap
        }
        thumbnail = thumbnailBitmap

        val output = ByteArrayOutputStream()
        thumbnailBitmap.compress(Bitmap.CompressFormat.JPEG, 82, output)

        promise.resolve(
          mapOf(
            "base64" to Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP),
            "mimeType" to "image/jpeg",
            "sha256" to sha256(file),
            "width" to bounds.outWidth,
            "height" to bounds.outHeight
          )
        )
      } catch (error: Exception) {
        promise.reject("E_IMAGE", error.message ?: "Could not read image", error)
      } finally {
        val thumbnailBitmap = thumbnail
        val sourceBitmap = source
        if (thumbnailBitmap != null && thumbnailBitmap !== sourceBitmap) thumbnailBitmap.recycle()
        sourceBitmap?.recycle()
      }
    }.start()
  }

  private fun sha256(file: File): String {
    val digest = MessageDigest.getInstance("SHA-256")
    file.inputStream().use { input ->
      val buffer = ByteArray(8192)
      while (true) {
        val read = input.read(buffer)
        if (read <= 0) break
        digest.update(buffer, 0, read)
      }
    }

    return digest.digest().joinToString("") { byte ->
      ((byte.toInt() and 0xff) + 0x100).toString(16).substring(1)
    }
  }
}
