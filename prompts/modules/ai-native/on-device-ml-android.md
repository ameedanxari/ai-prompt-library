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
