# Visual Search Template

## Purpose

This template provides comprehensive patterns for implementing visual search systems that enable users to search using images. It covers image recognition, feature extraction, visual similarity matching, object detection, and reverse image search capabilities.

## Context

Visual search allows users to find products, content, or information using images instead of text queries. Users can upload photos, take pictures, or select images to find visually similar items. This template addresses the complexity of building AI-powered visual search systems that leverage computer vision, deep learning models, and efficient similarity search algorithms.

## Instructions

1. **Setup Image Processing Pipeline**: Configure image ingestion and preprocessing
2. **Implement Feature Extraction**: Build CNN-based visual feature extraction
3. **Configure Visual Similarity Search**: Set up vector-based image matching
4. **Add Object Detection**: Implement multi-object recognition in images
5. **Build Reverse Image Search**: Enable finding exact or similar images
6. **Optimize Performance**: Implement caching and efficient indexing
7. **Monitor Quality**: Track visual search accuracy and relevance

## Examples

### Example 1: Visual Search Setup
```typescript
interface VisualSearchEngine {
  searchByImage(image: ImageInput, options?: VisualSearchOptions): Promise<VisualSearchResult>;
  extractFeatures(image: ImageInput): Promise<ImageFeatures>;
  findSimilarImages(imageId: string, count: number): Promise<SimilarImage[]>;
}

const result = await visualSearch.searchByImage(uploadedImage, {
  maxResults: 20,
  minSimilarity: 0.7
});
```

### Example 2: Object Detection Search
```typescript
const objectResult = await visualSearch.searchWithObjectDetection(image, {
  detectObjects: true,
  searchPerObject: true,
  objectTypes: ['product', 'clothing', 'furniture']
});
// Returns results for each detected object in the image
```

### Example 3: Visual Similarity with Filters
```typescript
const filteredResult = await visualSearch.searchByImage(image, {
  filters: {
    category: 'clothing',
    priceRange: { min: 20, max: 100 },
    color: 'blue'
  },
  similarityThreshold: 0.8
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| featureExtractionModel | CNN model for feature extraction | string | Yes | N/A |
| vectorDimensions | Feature vector dimensions | number | No | 2048 |
| similarityMetric | Distance metric for matching | string | No | "cosine" |
| enableObjectDetection | Enable multi-object detection | boolean | No | true |
| enableColorAnalysis | Enable color-based matching | boolean | No | true |
| maxImageSize | Maximum image size in pixels | number | No | 1024 |
| minSimilarityScore | Minimum similarity threshold | number | No | 0.5 |
| enableCropping | Enable automatic image cropping | boolean | No | true |

## Expected Output

This template will produce:
- **Image Feature Extraction**: CNN-based visual feature generation
- **Visual Similarity Search**: Vector-based image matching system
- **Object Detection**: Multi-object recognition and localization
- **Reverse Image Search**: Exact and near-duplicate image finding
- **Color Analysis**: Color-based image matching
- **Crop and Search**: Region-based visual search
- **Performance Optimization**: Efficient indexing and caching
- **Quality Metrics**: Visual search accuracy tracking

## Implementation Patterns

### Visual Search Architecture

```typescript
// Core Visual Search Architecture
interface VisualSearchSystem {
  imageProcessor: ImageProcessor;
  featureExtractor: FeatureExtractor;
  objectDetector: ObjectDetector;
  vectorStore: VectorStore;
  colorAnalyzer: ColorAnalyzer;
  similaritySearcher: SimilaritySearcher;
}

interface VisualSearchQuery {
  image: ImageInput;
  options?: VisualSearchOptions;
  filters?: VisualSearchFilters;
}

interface ImageInput {
  type: 'url' | 'base64' | 'file' | 'buffer';
  data: string | Buffer;
  mimeType?: string;
}

interface VisualSearchOptions {
  maxResults?: number;
  minSimilarity?: number;
  enableObjectDetection?: boolean;
  enableColorMatching?: boolean;
  searchRegion?: BoundingBox;
  includeMetadata?: boolean;
}

interface VisualSearchResult {
  matches: VisualMatch[];
  detectedObjects?: DetectedObject[];
  dominantColors?: Color[];
  queryFeatures: ImageFeatures;
  processingTime: number;
}

interface VisualMatch {
  id: string;
  similarity: number;
  imageUrl: string;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
  matchedRegion?: BoundingBox;
  matchType: 'exact' | 'similar' | 'partial';
}

interface DetectedObject {
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
  features?: number[];
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### Image Processing Pipeline

```typescript
// Image Processing Implementation
class ImageProcessor {
  private config: ImageProcessingConfig;

  async processImage(input: ImageInput): Promise<ProcessedImage> {
    const rawImage = await this.loadImage(input);
    const validated = await this.validateImage(rawImage);
    const normalized = await this.normalizeImage(validated);
    const preprocessed = await this.preprocess(normalized);

    return {
      original: rawImage,
      processed: preprocessed,
      metadata: this.extractMetadata(rawImage)
    };
  }

  private async loadImage(input: ImageInput): Promise<RawImage> {
    switch (input.type) {
      case 'url':
        return await this.loadFromUrl(input.data as string);
      case 'base64':
        return this.decodeBase64(input.data as string);
      case 'file':
        return await this.loadFromFile(input.data as string);
      case 'buffer':
        return this.loadFromBuffer(input.data as Buffer);
      default:
        throw new Error(`Unsupported image input type: ${input.type}`);
    }
  }

  private async normalizeImage(image: RawImage): Promise<NormalizedImage> {
    let normalized = image;

    // Resize if too large
    if (image.width > this.config.maxSize || image.height > this.config.maxSize) {
      normalized = await this.resize(image, this.config.maxSize);
    }

    // Convert to standard format
    normalized = await this.convertFormat(normalized, 'RGB');

    // Apply standard preprocessing
    normalized = await this.applyNormalization(normalized);

    return normalized;
  }

  private async preprocess(image: NormalizedImage): Promise<PreprocessedImage> {
    return {
      tensor: this.imageToTensor(image),
      dimensions: { width: image.width, height: image.height },
      channels: 3
    };
  }
}
```

### Feature Extraction

```typescript
// Feature Extraction Implementation
class FeatureExtractor {
  private model: CNNModel;
  private cache: FeatureCache;

  async extractFeatures(image: ProcessedImage): Promise<ImageFeatures> {
    const cacheKey = this.generateCacheKey(image);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const features = await this.model.extractFeatures(image.processed.tensor);
    const normalized = this.normalizeFeatures(features);

    await this.cache.set(cacheKey, normalized);
    return normalized;
  }

  async extractRegionFeatures(
    image: ProcessedImage,
    region: BoundingBox
  ): Promise<ImageFeatures> {
    const croppedImage = this.cropImage(image, region);
    return await this.extractFeatures(croppedImage);
  }

  private normalizeFeatures(features: number[]): ImageFeatures {
    const magnitude = Math.sqrt(
      features.reduce((sum, val) => sum + val * val, 0)
    );

    return {
      vector: features.map(val => val / magnitude),
      dimensions: features.length,
      modelVersion: this.model.version
    };
  }
}

// CNN Model Implementations
class ResNetFeatureExtractor implements CNNModel {
  private model: any;

  async extractFeatures(tensor: ImageTensor): Promise<number[]> {
    const output = await this.model.predict(tensor);
    // Extract features from penultimate layer
    return Array.from(output.dataSync());
  }
}

class EfficientNetFeatureExtractor implements CNNModel {
  private model: any;

  async extractFeatures(tensor: ImageTensor): Promise<number[]> {
    const output = await this.model.predict(tensor);
    return Array.from(output.dataSync());
  }
}

class CLIPFeatureExtractor implements CNNModel {
  private model: any;

  async extractFeatures(tensor: ImageTensor): Promise<number[]> {
    const imageEmbedding = await this.model.encodeImage(tensor);
    return Array.from(imageEmbedding);
  }

  async extractTextFeatures(text: string): Promise<number[]> {
    const textEmbedding = await this.model.encodeText(text);
    return Array.from(textEmbedding);
  }
}
```

### Object Detection

```typescript
// Object Detection Implementation
class ObjectDetector {
  private model: DetectionModel;
  private config: DetectionConfig;

  async detectObjects(image: ProcessedImage): Promise<DetectedObject[]> {
    const detections = await this.model.detect(image.processed.tensor);

    return detections
      .filter(d => d.confidence >= this.config.minConfidence)
      .map(d => ({
        label: d.class,
        confidence: d.confidence,
        boundingBox: this.normalizeBoundingBox(d.bbox, image),
        features: d.features
      }))
      .slice(0, this.config.maxObjects);
  }

  async detectAndExtractFeatures(
    image: ProcessedImage,
    featureExtractor: FeatureExtractor
  ): Promise<ObjectWithFeatures[]> {
    const objects = await this.detectObjects(image);

    const objectsWithFeatures = await Promise.all(
      objects.map(async (obj) => {
        const regionFeatures = await featureExtractor.extractRegionFeatures(
          image,
          obj.boundingBox
        );

        return {
          ...obj,
          features: regionFeatures.vector
        };
      })
    );

    return objectsWithFeatures;
  }

  private normalizeBoundingBox(
    bbox: number[],
    image: ProcessedImage
  ): BoundingBox {
    const [x, y, width, height] = bbox;
    return {
      x: x / image.processed.dimensions.width,
      y: y / image.processed.dimensions.height,
      width: width / image.processed.dimensions.width,
      height: height / image.processed.dimensions.height
    };
  }
}
```

### Visual Similarity Search

```typescript
// Visual Similarity Search Implementation
class VisualSimilaritySearcher {
  private vectorStore: VectorStore;
  private featureExtractor: FeatureExtractor;

  async search(
    queryFeatures: ImageFeatures,
    options: VisualSearchOptions
  ): Promise<VisualMatch[]> {
    const searchResults = await this.vectorStore.search(
      queryFeatures.vector,
      {
        limit: options.maxResults || 50,
        minScore: options.minSimilarity || 0.5,
        filter: options.filters
      }
    );

    return searchResults.map(result => ({
      id: result.id,
      similarity: result.score,
      imageUrl: result.metadata.imageUrl,
      thumbnailUrl: result.metadata.thumbnailUrl,
      metadata: result.metadata,
      matchType: this.classifyMatchType(result.score)
    }));
  }

  async searchByRegion(
    image: ProcessedImage,
    region: BoundingBox,
    options: VisualSearchOptions
  ): Promise<VisualMatch[]> {
    const regionFeatures = await this.featureExtractor.extractRegionFeatures(
      image,
      region
    );

    const matches = await this.search(regionFeatures, options);

    return matches.map(match => ({
      ...match,
      matchedRegion: region
    }));
  }

  async searchWithObjectDetection(
    image: ProcessedImage,
    objectDetector: ObjectDetector,
    options: VisualSearchOptions
  ): Promise<ObjectSearchResult[]> {
    const objects = await objectDetector.detectAndExtractFeatures(
      image,
      this.featureExtractor
    );

    const results = await Promise.all(
      objects.map(async (obj) => {
        const matches = await this.vectorStore.search(obj.features!, {
          limit: options.maxResults || 10,
          minScore: options.minSimilarity || 0.5
        });

        return {
          object: obj,
          matches: matches.map(m => ({
            id: m.id,
            similarity: m.score,
            imageUrl: m.metadata.imageUrl,
            metadata: m.metadata,
            matchType: this.classifyMatchType(m.score)
          }))
        };
      })
    );

    return results;
  }

  private classifyMatchType(similarity: number): 'exact' | 'similar' | 'partial' {
    if (similarity >= 0.95) return 'exact';
    if (similarity >= 0.7) return 'similar';
    return 'partial';
  }
}
```

### Color Analysis

```typescript
// Color Analysis Implementation
class ColorAnalyzer {
  async extractDominantColors(image: ProcessedImage, count: number = 5): Promise<Color[]> {
    const pixels = this.getPixelData(image);
    const clusters = await this.kMeansClustering(pixels, count);

    return clusters
      .sort((a, b) => b.percentage - a.percentage)
      .map(cluster => ({
        hex: this.rgbToHex(cluster.centroid),
        rgb: cluster.centroid,
        percentage: cluster.percentage,
        name: this.getColorName(cluster.centroid)
      }));
  }

  async matchByColor(
    queryColors: Color[],
    options: ColorMatchOptions
  ): Promise<ColorMatch[]> {
    const colorVector = this.colorsToVector(queryColors);

    const matches = await this.colorIndex.search(colorVector, {
      limit: options.maxResults || 50,
      minScore: options.minSimilarity || 0.6
    });

    return matches.map(m => ({
      id: m.id,
      colorSimilarity: m.score,
      dominantColors: m.metadata.colors,
      imageUrl: m.metadata.imageUrl
    }));
  }

  private kMeansClustering(pixels: RGB[], k: number): ColorCluster[] {
    // Initialize centroids randomly
    let centroids = this.initializeCentroids(pixels, k);
    let clusters: ColorCluster[] = [];

    for (let iteration = 0; iteration < 100; iteration++) {
      // Assign pixels to nearest centroid
      const assignments = pixels.map(pixel =>
        this.findNearestCentroid(pixel, centroids)
      );

      // Update centroids
      const newCentroids = this.updateCentroids(pixels, assignments, k);

      // Check convergence
      if (this.hasConverged(centroids, newCentroids)) {
        break;
      }

      centroids = newCentroids;
    }

    // Calculate cluster statistics
    clusters = centroids.map((centroid, i) => {
      const clusterPixels = pixels.filter((_, idx) =>
        this.findNearestCentroid(pixels[idx], centroids) === i
      );

      return {
        centroid,
        percentage: clusterPixels.length / pixels.length
      };
    });

    return clusters;
  }
}
```

## Configuration

### Visual Search Configuration

```yaml
# visual-search-config.yml
visual_search:
  image_processing:
    max_size: 1024
    supported_formats: ["jpg", "jpeg", "png", "webp"]
    normalize: true
    auto_orient: true

  feature_extraction:
    model: "efficientnet-b0"
    dimensions: 1280
    batch_size: 32
    cache:
      enabled: true
      ttl_seconds: 86400

  object_detection:
    enabled: true
    model: "yolov8"
    min_confidence: 0.5
    max_objects: 10
    classes: ["product", "clothing", "furniture", "electronics"]

  similarity_search:
    metric: "cosine"
    min_similarity: 0.5
    max_results: 100

  color_analysis:
    enabled: true
    dominant_colors: 5
    color_space: "LAB"

  performance:
    timeout_ms: 5000
    max_concurrent_requests: 100
    cache_results: true
```

## Integration Points

### Image Storage Integration

```typescript
// Image Storage Integration
class VisualSearchIndexer {
  async indexImage(imageId: string, imageUrl: string): Promise<void> {
    const image = await this.imageProcessor.processImage({
      type: 'url',
      data: imageUrl
    });

    const features = await this.featureExtractor.extractFeatures(image);
    const colors = await this.colorAnalyzer.extractDominantColors(image);

    await this.vectorStore.upsert([{
      id: imageId,
      vector: features.vector,
      metadata: {
        imageUrl,
        colors,
        dimensions: image.processed.dimensions
      }
    }]);
  }

  async batchIndexImages(images: ImageIndexRequest[]): Promise<void> {
    const batches = this.chunkArray(images, 100);

    for (const batch of batches) {
      await Promise.all(
        batch.map(img => this.indexImage(img.id, img.url))
      );
    }
  }
}

// E-commerce Integration
class ProductVisualSearch {
  async searchProducts(image: ImageInput): Promise<ProductMatch[]> {
    const result = await this.visualSearch.searchByImage(image);

    return result.matches.map(match => ({
      productId: match.metadata.productId,
      similarity: match.similarity,
      product: match.metadata.product,
      imageUrl: match.imageUrl
    }));
  }
}
```

## Security Considerations

### Image Validation and Sanitization

```typescript
class ImageSecurityValidator {
  async validateImage(input: ImageInput): Promise<ValidationResult> {
    const errors: string[] = [];

    // Check file size
    const size = await this.getImageSize(input);
    if (size > this.config.maxFileSize) {
      errors.push('Image file size exceeds maximum allowed');
    }

    // Validate format
    const format = await this.detectFormat(input);
    if (!this.config.allowedFormats.includes(format)) {
      errors.push(`Image format ${format} is not supported`);
    }

    // Check for malicious content
    const isSafe = await this.scanForMaliciousContent(input);
    if (!isSafe) {
      errors.push('Image failed security scan');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async sanitizeImage(image: ProcessedImage): Promise<ProcessedImage> {
    // Strip EXIF data
    const stripped = await this.stripMetadata(image);

    // Re-encode to remove potential exploits
    const reencoded = await this.reencode(stripped);

    return reencoded;
  }
}
```

## Testing Considerations

### Visual Search Testing

```typescript
describe('Visual Search', () => {
  it('should find visually similar images', async () => {
    const result = await visualSearch.searchByImage(testImage);

    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0].similarity).toBeGreaterThan(0.5);
  });

  it('should detect objects in images', async () => {
    const result = await visualSearch.searchWithObjectDetection(testImage, {
      detectObjects: true
    });

    expect(result.detectedObjects).toBeDefined();
    expect(result.detectedObjects!.length).toBeGreaterThan(0);
  });

  it('should extract dominant colors', async () => {
    const colors = await colorAnalyzer.extractDominantColors(testImage);

    expect(colors.length).toBe(5);
    expect(colors[0].percentage).toBeGreaterThan(0);
  });

  it('should handle region-based search', async () => {
    const region = { x: 0.2, y: 0.2, width: 0.6, height: 0.6 };
    const result = await visualSearch.searchByRegion(testImage, region);

    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0].matchedRegion).toEqual(region);
  });
});
```
