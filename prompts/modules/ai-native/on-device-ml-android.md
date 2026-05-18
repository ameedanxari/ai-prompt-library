# On-Device ML — Android (ML Kit, TensorFlow Lite)

## Intent
Implement machine learning capabilities entirely on the user's Android device without sending data to a server. Ensures privacy, works offline, and minimizes latency.

## Key Frameworks
- `Google ML Kit`: High-level APIs for common tasks (Vision, Text, Face)
- `TensorFlow Lite (TFLite)`: Running custom `.tflite` models efficiently
- `MediaPipe`: Advanced pipelines for vision and audio

## Patterns & Architecture

### 1. ML Kit Wrapper (High-level)
Isolate Google Play Services dependencies and model downloading logic. Use Kotlin Coroutines for asynchronous processing.

```kotlin
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.label.ImageLabeling
import com.google.mlkit.vision.label.defaults.ImageLabelerOptions
import kotlinx.coroutines.tasks.await

interface ImageClassifier {
    suspend fun classify(image: InputImage): List<ClassificationResult>
}

class MLKitImageClassifier : ImageClassifier {
    // Use default options or custom threshold
    private val options = ImageLabelerOptions.Builder()
        .setConfidenceThreshold(0.7f)
        .build()
        
    private val labeler = ImageLabeling.getClient(options)

    override suspend fun classify(image: InputImage): List<ClassificationResult> {
        return try {
            // Await the Task using kotlinx-coroutines-play-services
            val labels = labeler.process(image).await()
            labels.map { 
                ClassificationResult(
                    label = it.text, 
                    confidence = it.confidence
                ) 
            }
        } catch (e: Exception) {
            // Handle specific ML Kit exceptions (e.g., model not downloaded yet)
            emptyList()
        }
    }
}
```

### 2. Custom TFLite Model Execution
For models not covered by ML Kit.

```kotlin
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.support.image.TensorImage

class CustomTfliteClassifier(context: Context, modelPath: String) {
    private val interpreter: Interpreter
    
    init {
        // Load model from assets
        val model = FileUtil.loadMappedFile(context, modelPath)
        val options = Interpreter.Options().apply {
            // Use NNAPI (hardware acceleration) if available
            addDelegate(NnApiDelegate()) 
        }
        interpreter = Interpreter(model, options)
    }
    
    fun classify(bitmap: Bitmap): FloatArray {
        // Preprocess image (resize, normalize) using TFLite Support Library
        val imageProcessor = ImageProcessor.Builder()
            .add(ResizeOp(224, 224, ResizeOp.ResizeMethod.BILINEAR))
            .add(NormalizeOp(127.5f, 127.5f))
            .build()
            
        var tensorImage = TensorImage(DataType.FLOAT32)
        tensorImage.load(bitmap)
        tensorImage = imageProcessor.process(tensorImage)
        
        // Output buffer
        val output = TensorBuffer.createFixedSize(intArrayOf(1, 1000), DataType.FLOAT32)
        
        // Run inference
        interpreter.run(tensorImage.buffer, output.buffer.rewind())
        
        return output.floatArray
    }
}
```

### 3. Near-Duplicate Photo Detection
Use a two-stage local pipeline so large libraries stay responsive:

1. Fast candidate generation from MediaStore metadata: media type,
   byte size bucket, dimensions, duration, date taken, and orientation.
2. Visual similarity on downsampled thumbnails:
   - `dHash` / `pHash` for cheap image fingerprints, grouped with
     Hamming distance.
   - Optional TFLite image embedding model for harder edited/exported
     near-duplicates.
   - Locality-sensitive hashing or bucketed hashes to avoid comparing
     every asset to every other asset.

```kotlin
data class VisualFingerprint(
    val mediaStoreId: Long,
    val dhash: ULong,
    val phash: ULong?,
    val embedding: FloatArray?,
    val modelVersion: String,
)
```

Start with conservative thresholds, then calibrate with fixtures:
Hamming distance `<= 8` for likely near-duplicates, `9..14` for manual
review, and embedding cosine similarity `>= 0.92` only after device
performance tests. Do not auto-delete from similarity alone.

### 4. Blurry / Low-Quality Photo Detection
Implement blur scoring without network services:

- Decode a bounded thumbnail with `ImageDecoder` / `BitmapFactory`
  using sampling so the long edge is at most 1024 px.
- Convert to luminance and compute variance of Laplacian with a small
  convolution kernel. OpenCV is optional; a hand-written convolution is
  acceptable for thumbnails and avoids adding a large native dependency.
- Combine blur score with resolution, exposure metadata where available,
  screenshot/document exclusions, and manual-review thresholds.

```kotlin
data class PhotoQualityScore(
    val mediaStoreId: Long,
    val blurVariance: Double,
    val isLowResolution: Boolean,
    val confidence: Float,
    val reasons: List<String>,
)
```

Test sharp, motion-blurred, low-light, screenshot, document, and
compressed-image fixtures. Low-confidence candidates go to review,
never directly to deletion.

### 5. Sensitive Document / OCR Classification
Use ML Kit Text Recognition and local heuristics for sensitive media:

- Run OCR only after explicit disclosure / opt-in when the product is a
  gallery cleaner.
- Classify categories such as possible ID, receipt, bill, medical form,
  bank card, ticket, or screenshot with text using local regex/keyword
  rules plus layout cues.
- Store only category, confidence, model/rule version, asset ID, and
  timestamp unless the product explicitly requires raw OCR storage.
- Provide a setting to clear all derived sensitive labels.

Do not add `INTERNET` for OCR. If using Play Services model download,
document that the model download is network activity and prefer bundled
models for strict local-only products.

### 6. Video Duplicate Handling
Use `MediaMetadataRetriever` for local frame sampling:

- Exact duplicate candidates: duration, dimensions, byte size, codec,
  date taken, and optional hash when file access is available.
- Near-duplicate candidates: sample 3-7 frames at deterministic
  timestamps, compute dHash/pHash or TFLite embeddings per frame, and
  compare the median/trimmed-mean distance.
- Process long videos with WorkManager or a cancellable foreground-safe
  coroutine path depending on product UX.
- Include fixtures for identical video, trimmed video, transcoded video,
  same thumbnail but different content, and unrelated video.

## Storage Management (Critical for Android)
1. **Unbundled models vs Bundled**: ML Kit can use "unbundled" models (downloaded via Play Services to save APK size) or "bundled" (in APK, increases size but guarantees offline availability). For privacy-first offline apps, bundled is safer, but warn about APK size.
2. For custom `.tflite` models, place them in `app/src/main/assets/`. Ensure `aaptOptions { noCompress "tflite" }` is in `build.gradle` to allow direct memory mapping.

## Security & Privacy Considerations
1. Ensure `AndroidManifest.xml` does not require `INTERNET` permission if the app is strictly offline.
2. If using unbundled ML Kit models, the download happens via Play Services. This *does* use the network, but only to download the model, not to send user data. Clearly document this distinction.
3. For strict local-only products, prefer bundled ML Kit / TFLite models
   or explicitly approved preinstalled model paths. Do not add model
   download behavior by default.
4. For sensitive-content detection, make scanning opt-in or clearly
   disclosed, store only local labels/confidence unless the product
   explicitly requires more, use explainable labels, and never
   auto-delete sensitive candidates.
5. Use category-specific confidence thresholds and route low-confidence
   results to manual review instead of destructive cleanup flows.

## Testing Strategy
1. **Unit tests**: Test the wrapper logic by mocking the ML Kit/TFLite interfaces.
2. **Instrumentation tests**: Use `androidTest` to load actual bitmaps from the test `assets/` folder and verify inference results on an emulator or physical device.
