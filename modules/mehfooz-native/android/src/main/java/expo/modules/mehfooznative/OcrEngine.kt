package expo.modules.mehfooznative

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import com.googlecode.tesseract.android.TessBaseAPI
import expo.modules.kotlin.Promise
import java.io.File
import kotlin.math.max

object OcrEngine {
  fun recognize(context: Context, path: String, language: String, promise: Promise) {
    val file = File(path)
    if (!file.exists()) {
      promise.reject("E_OCR", "Image not found", null)
      return
    }

    when (language) {
      "urdu", "ur" -> recognizeWithTesseract(context, file, "urd", promise)
      "pashto", "ps" -> recognizeWithTesseract(context, file, "pus", promise)
      else -> recognizeWithMlKit(context, file, promise)
    }
  }

  private fun recognizeWithMlKit(context: Context, file: File, promise: Promise) {
    val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    try {
      val image = InputImage.fromFilePath(context, Uri.fromFile(file))
      recognizer.process(image)
        .addOnSuccessListener { result ->
          promise.resolve(mapOf("text" to result.text, "engine" to "mlkit"))
          recognizer.close()
        }
        .addOnFailureListener { error ->
          promise.reject("E_OCR", error.message ?: "ML Kit OCR failed", error)
          recognizer.close()
        }
    } catch (error: Exception) {
      recognizer.close()
      promise.reject("E_OCR", error.message ?: "ML Kit OCR failed", error)
    }
  }

  private fun recognizeWithTesseract(
    context: Context,
    file: File,
    language: String,
    promise: Promise
  ) {
    Thread {
      var tess: TessBaseAPI? = null
      var source: Bitmap? = null
      var prepared: Bitmap? = null

      try {
        ensureTessdata(context, language)
        val api = TessBaseAPI()
        tess = api

        if (!api.init(context.filesDir.absolutePath, language)) {
          throw IllegalStateException("Tesseract could not load $language data")
        }

        api.setPageSegMode(TessBaseAPI.PageSegMode.PSM_AUTO)
        val sourceBitmap = BitmapFactory.decodeFile(file.absolutePath)
          ?: throw IllegalStateException("Could not decode image")
        source = sourceBitmap

        val preparedBitmap = prepareBitmap(sourceBitmap)
        prepared = preparedBitmap
        api.setImage(preparedBitmap)

        val text = api.getUTF8Text()?.trim().orEmpty()
        val confidence = api.meanConfidence()

        promise.resolve(
          mapOf(
            "text" to text,
            "engine" to "tesseract",
            "confidence" to confidence
          )
        )
      } catch (error: Exception) {
        promise.reject("E_OCR", error.message ?: "Tesseract OCR failed", error)
      } finally {
        try {
          tess?.recycle()
        } catch (_: Exception) {
          // Ignore native cleanup errors.
        }
        val preparedBitmap = prepared
        val sourceBitmap = source
        if (preparedBitmap != null && preparedBitmap !== sourceBitmap) preparedBitmap.recycle()
        sourceBitmap?.recycle()
      }
    }.start()
  }

  private fun ensureTessdata(context: Context, language: String) {
    val directory = File(context.filesDir, "tessdata").apply { mkdirs() }
    val target = File(directory, "$language.traineddata")
    if (target.exists() && target.length() > 0) return

    context.assets.open("tessdata/$language.traineddata").use { input ->
      val temporary = File(directory, "$language.traineddata.tmp")
      temporary.outputStream().use { output -> input.copyTo(output) }
      if (!temporary.renameTo(target)) {
        temporary.copyTo(target, overwrite = true)
        temporary.delete()
      }
    }
  }

  private fun prepareBitmap(source: Bitmap): Bitmap {
    val longest = max(source.width, source.height)
    val scale = when {
      longest > 2200 -> 2200f / longest
      longest < 900 -> 900f / longest
      else -> 1f
    }

    if (scale == 1f) return source

    val width = max(1, (source.width * scale).toInt())
    val height = max(1, (source.height * scale).toInt())
    return Bitmap.createScaledBitmap(source, width, height, true)
  }
}
