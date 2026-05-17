# On-Device ML — iOS (Core ML, Vision)

## Intent
Implement machine learning capabilities entirely on the user's Apple device without sending data to a server. Ensures privacy, works offline, and minimizes latency.

## Key Frameworks
- `Core ML`: Running models (.mlmodelc) on Neural Engine/GPU
- `Vision`: Image analysis, face detection, text recognition, feature extraction
- `Create ML`: (Optional) Training custom models

## Patterns & Architecture

### 1. The ML Service Wrapper
Isolate ML framework code from UI. The wrapper handles model loading, asynchronous prediction, and error handling.

```swift
import CoreML
import Vision

protocol ImageClassifierService {
    func classify(image: CGImage) async throws -> [ClassificationResult]
}

final class CoreMLImageClassifier: ImageClassifierService {
    private let model: VNCoreMLModel
    
    init() throws {
        // Load model lazily or at startup depending on size
        let config = MLModelConfiguration()
        // Prefer Neural Engine but allow fallback
        config.computeUnits = .all 
        let coreMLModel = try MyClassifierModel(configuration: config)
        self.model = try VNCoreMLModel(for: coreMLModel.model)
    }
    
    func classify(image: CGImage) async throws -> [ClassificationResult] {
        return try await withCheckedThrowingContinuation { continuation in
            let request = VNCoreMLRequest(model: self.model) { request, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                
                guard let results = request.results as? [VNClassificationObservation] else {
                    continuation.resume(returning: [])
                    return
                }
                
                let mapped = results.map { ClassificationResult(identifier: $0.identifier, confidence: $0.confidence) }
                continuation.resume(returning: mapped)
            }
            
            // Critical for performance: Use specific crops/scales if known
            request.imageCropAndScaleOption = .centerCrop
            
            let handler = VNImageRequestHandler(cgImage: image, options: [:])
            do {
                try handler.perform([request])
            } catch {
                continuation.resume(throwing: error)
            }
        }
    }
}
```

### 2. Duplicate/Similar Image Detection (Perceptual Hashing)
For gallery cleanup apps, comparing exact bytes fails if metadata or compression changes. Use Vision's `VNGenerateImageFeaturePrintRequest`.

```swift
// Generates a lightweight vector representation (feature print) of an image
// Distances between vectors indicate visual similarity
let request = VNGenerateImageFeaturePrintRequest()
try handler.perform([request])
guard let observation = request.results?.first as? VNFeaturePrintObservation else { return }

// Compare two feature prints
var distance = Float(0)
try observation.computeDistance(&distance, to: otherObservation)
// distance < 10.0 often indicates near-duplicates depending on the model version
```

## Security & Privacy Considerations
1. **Never send user data to a server** when using this module. The primary value proposition is local processing.
2. Ensure the app's `PrivacyInfo.xcprivacy` documents that data remains on-device.
3. If processing the user's photo library, request `PHAuthorizationStatus` and handle the `.limited` state gracefully.
4. For sensitive-content detection, make scanning opt-in or clearly
   disclosed, store only local labels/confidence unless the product
   explicitly requires more, use explainable labels, and never
   auto-delete sensitive candidates.
5. Use category-specific confidence thresholds and route low-confidence
   results to manual review instead of destructive cleanup flows.

## Testing Strategy
1. **Unit tests**: Test the service wrapper using a mock `VNImageRequestHandler` or passing known test images bundled in the test target.
2. **Performance tests**: Write an `XCTestCase` with `measure { ... }` blocks around prediction calls to ensure they meet latency budgets.
3. **Accuracy tests**: Run predictions against a known dataset of 10-50 images and assert that precision/recall meet acceptable thresholds.
