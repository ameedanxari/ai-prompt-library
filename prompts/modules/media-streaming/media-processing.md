# Media Processing and Transcoding Template

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose
This template provides comprehensive patterns for audio/video processing, transcoding, and media manipulation in streaming applications. It covers format conversion, quality optimization, thumbnail generation, and automated media processing pipelines.

## Context
Media processing is the backbone of streaming platforms, transforming raw content into optimized formats for delivery across devices and network conditions. This template addresses the complexity of building scalable processing pipelines that handle video transcoding, audio normalization, thumbnail generation, and metadata extraction while maintaining quality and minimizing processing time.

## Instructions

1. **Setup Processing Pipeline**: Configure media processing infrastructure and job queues
2. **Implement Transcoding**: Set up multi-format transcoding with quality profiles
3. **Add Quality Analysis**: Implement audio/video quality assessment and optimization
4. **Configure Batch Processing**: Set up automated processing workflows and scheduling
5. **Enable Real-Time Processing**: Implement live transcoding for streaming content
6. **Add Metadata Extraction**: Extract and process media metadata and thumbnails
7. **Monitor Processing Performance**: Track processing times, quality, and resource usage

## Examples

### Example 1: Media Transcoding Pipeline
```typescript
interface MediaProcessor {
  transcodeAudio(input: MediaFile, profiles: AudioProfile[]): Promise<TranscodingJob>;
  transcodeVideo(input: MediaFile, profiles: VideoProfile[]): Promise<TranscodingJob>;
}

const processor = new MediaProcessor();
const job = await processor.transcodeAudio(inputFile, [
  { bitrate: 128000, format: 'mp3', quality: 'standard' },
  { bitrate: 320000, format: 'mp3', quality: 'high' },
  { bitrate: 1000000, format: 'flac', quality: 'lossless' }
]);
```

### Example 2: Real-Time Processing
```typescript
const liveProcessor = await processor.setupLiveTranscoding({
  inputStream: 'rtmp://input.stream',
  outputProfiles: [
    { resolution: '720p', bitrate: 2500000 },
    { resolution: '480p', bitrate: 1000000 }
  ]
});
```

### Example 3: Batch Processing Workflow
```typescript
const batchJob = await processor.processBatch({
  inputFiles: ['file1.wav', 'file2.wav'],
  operations: ['transcode', 'normalize', 'extract_metadata'],
  priority: 'high'
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| processingEngine | Media processing engine | string | Yes | N/A |
| maxConcurrentJobs | Maximum concurrent processing jobs | number | No | 10 |
| supportedFormats | Supported input/output formats | array | Yes | N/A |
| qualityProfiles | Available quality/bitrate profiles | array | No | standard |
| enableGPUAcceleration | Use GPU for processing acceleration | boolean | No | false |
| processingTimeout | Processing job timeout (minutes) | number | No | 60 |
| enableQualityAnalysis | Analyze media quality metrics | boolean | No | true |
| storageLocation | Processed media storage location | string | Yes | N/A |
| enableMetadataExtraction | Extract media metadata | boolean | No | true |

## Expected Output

This template will produce:
- **Media Processing Pipeline**: Automated transcoding and format conversion system
- **Quality Optimization**: Multi-bitrate encoding and quality analysis
- **Batch Processing System**: Scalable processing workflows and job management
- **Real-Time Transcoding**: Live media processing for streaming applications
- **Metadata Extraction**: Automatic extraction of media information and thumbnails
- **Performance Monitoring**: Processing analytics and resource utilization tracking
- **Format Standardization**: Consistent output formats across all processed media
- **Error Handling**: Robust error recovery and processing retry mechanisms

## Implementation Patterns

### Media Processing Pipeline Architecture

```typescript
// Media Processing Pipeline Interface
interface MediaProcessingPipeline {
  inputValidation: InputValidationConfig;
  transcoding: TranscodingConfig;
  thumbnailGeneration: ThumbnailConfig;
  metadataExtraction: MetadataConfig;
  qualityAnalysis: QualityAnalysisConfig;
  outputDelivery: OutputDeliveryConfig;
}

interface TranscodingConfig {
  videoProfiles: VideoProfile[];
  audioProfiles: AudioProfile[];
  containerFormats: string[]; // ['mp4', 'webm', 'mkv']
  processingPriority: 'speed' | 'quality' | 'balanced';
  parallelProcessing: boolean;
  cloudProcessing: boolean;
}

interface VideoProfile {
  name: string;
  resolution: string; // "1920x1080"
  bitrate: number; // kbps
  framerate: number; // fps
  codec: string; // "h264", "h265", "av1"
  preset: string; // "ultrafast", "fast", "medium", "slow"
  twoPass: boolean;
}

interface AudioProfile {
  name: string;
  codec: string; // "aac", "opus", "mp3"
  bitrate: number; // kbps
  sampleRate: number; // Hz
  channels: number; // 1=mono, 2=stereo, 6=5.1
}
```

### Video Transcoding Service

```typescript
// Video Transcoding Implementation
class VideoTranscodingService {
  private ffmpegPath: string;
  private processingQueue: ProcessingQueue;
  
  async transcodeVideo(
    inputPath: string, 
    outputProfiles: VideoProfile[]
  ): Promise<TranscodingResult[]> {
    const results: TranscodingResult[] = [];
    
    // Validate input file
    const inputInfo = await this.getMediaInfo(inputPath);
    if (!this.isValidVideoInput(inputInfo)) {
      throw new Error('Invalid video input format');
    }
    
    // Process each profile
    for (const profile of outputProfiles) {
      try {
        const result = await this.processVideoProfile(inputPath, profile);
        results.push(result);
      } catch (error) {
        console.error(`Failed to process profile ${profile.name}:`, error);
        results.push({
          profile: profile.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  private async processVideoProfile(
    inputPath: string, 
    profile: VideoProfile
  ): Promise<TranscodingResult> {
    const outputPath = this.generateOutputPath(inputPath, profile);
    
    const ffmpegCommand = this.buildFFmpegCommand(inputPath, outputPath, profile);
    
    const startTime = Date.now();
    await this.executeFFmpeg(ffmpegCommand);
    const processingTime = Date.now() - startTime;
    
    // Validate output
    const outputInfo = await this.getMediaInfo(outputPath);
    const quality = await this.analyzeVideoQuality(outputPath);
    
    return {
      profile: profile.name,
      success: true,
      outputPath,
      fileSize: outputInfo.size,
      duration: outputInfo.duration,
      processingTime,
      qualityScore: quality.score,
      bitrate: outputInfo.bitrate
    };
  }
  
  private buildFFmpegCommand(
    inputPath: string, 
    outputPath: string, 
    profile: VideoProfile
  ): string[] {
    const command = [
      this.ffmpegPath,
      '-i', inputPath,
      '-c:v', profile.codec,
      '-b:v', `${profile.bitrate}k`,
      '-s', profile.resolution,
      '-r', profile.framerate.toString(),
      '-preset', profile.preset
    ];
    
    // Add two-pass encoding if enabled
    if (profile.twoPass) {
      command.push('-pass', '1', '-f', 'null', '/dev/null', '&&');
      command.push(this.ffmpegPath, '-i', inputPath);
      command.push('-c:v', profile.codec, '-b:v', `${profile.bitrate}k`);
      command.push('-pass', '2');
    }
    
    // Add audio encoding
    command.push('-c:a', 'aac', '-b:a', '128k');
    
    // Add output format and path
    command.push('-f', 'mp4', outputPath);
    
    return command;
  }
}
```

### Audio Processing Service

```typescript
// Audio Processing Implementation
class AudioProcessingService {
  async processAudio(
    inputPath: string, 
    profiles: AudioProfile[]
  ): Promise<AudioProcessingResult[]> {
    const results: AudioProcessingResult[] = [];
    
    // Extract audio metadata
    const metadata = await this.extractAudioMetadata(inputPath);
    
    // Normalize audio levels
    const normalizedPath = await this.normalizeAudio(inputPath);
    
    // Process each profile
    for (const profile of profiles) {
      const result = await this.processAudioProfile(normalizedPath, profile, metadata);
      results.push(result);
    }
    
    return results;
  }
  
  private async processAudioProfile(
    inputPath: string, 
    profile: AudioProfile,
    metadata: AudioMetadata
  ): Promise<AudioProcessingResult> {
    const outputPath = this.generateAudioOutputPath(inputPath, profile);
    
    const command = [
      'ffmpeg',
      '-i', inputPath,
      '-c:a', profile.codec,
      '-b:a', `${profile.bitrate}k`,
      '-ar', profile.sampleRate.toString(),
      '-ac', profile.channels.toString()
    ];
    
    // Add codec-specific options
    if (profile.codec === 'aac') {
      command.push('-profile:a', 'aac_low');
    } else if (profile.codec === 'opus') {
      command.push('-application', 'audio');
    }
    
    command.push(outputPath);
    
    await this.executeFFmpeg(command);
    
    // Analyze output quality
    const quality = await this.analyzeAudioQuality(outputPath);
    
    return {
      profile: profile.name,
      outputPath,
      quality: quality.score,
      fileSize: await this.getFileSize(outputPath),
      duration: metadata.duration
    };
  }
  
  private async normalizeAudio(inputPath: string): Promise<string> {
    const outputPath = inputPath.replace(/\.[^.]+$/, '_normalized.wav');
    
    // Use loudnorm filter for EBU R128 normalization
    const command = [
      'ffmpeg',
      '-i', inputPath,
      '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
      '-c:a', 'pcm_s16le',
      outputPath
    ];
    
    await this.executeFFmpeg(command);
    return outputPath;
  }
}
```

### Thumbnail and Preview Generation

```typescript
// Thumbnail Generation Service
class ThumbnailGenerationService {
  async generateVideoThumbnails(
    videoPath: string, 
    config: ThumbnailConfig
  ): Promise<ThumbnailResult[]> {
    const duration = await this.getVideoDuration(videoPath);
    const thumbnails: ThumbnailResult[] = [];
    
    // Generate thumbnails at specified intervals
    for (let i = 0; i < config.count; i++) {
      const timestamp = (duration / config.count) * i;
      const thumbnail = await this.generateThumbnailAtTime(
        videoPath, 
        timestamp, 
        config
      );
      thumbnails.push(thumbnail);
    }
    
    // Generate animated preview (GIF or WebP)
    if (config.generateAnimatedPreview) {
      const animatedPreview = await this.generateAnimatedPreview(videoPath, config);
      thumbnails.push(animatedPreview);
    }
    
    return thumbnails;
  }
  
  private async generateThumbnailAtTime(
    videoPath: string, 
    timestamp: number, 
    config: ThumbnailConfig
  ): Promise<ThumbnailResult> {
    const outputPath = this.generateThumbnailPath(videoPath, timestamp, config);
    
    const command = [
      'ffmpeg',
      '-i', videoPath,
      '-ss', timestamp.toString(),
      '-vframes', '1',
      '-s', `${config.width}x${config.height}`,
      '-q:v', '2', // High quality
      outputPath
    ];
    
    await this.executeFFmpeg(command);
    
    return {
      timestamp,
      path: outputPath,
      width: config.width,
      height: config.height,
      fileSize: await this.getFileSize(outputPath)
    };
  }
  
  private async generateAnimatedPreview(
    videoPath: string, 
    config: ThumbnailConfig
  ): Promise<ThumbnailResult> {
    const outputPath = videoPath.replace(/\.[^.]+$/, '_preview.gif');
    
    // Generate 3-second preview from middle of video
    const duration = await this.getVideoDuration(videoPath);
    const startTime = Math.max(0, (duration / 2) - 1.5);
    
    const command = [
      'ffmpeg',
      '-i', videoPath,
      '-ss', startTime.toString(),
      '-t', '3',
      '-vf', `scale=${config.width}:${config.height}:flags=lanczos,fps=10`,
      '-loop', '0',
      outputPath
    ];
    
    await this.executeFFmpeg(command);
    
    return {
      timestamp: startTime,
      path: outputPath,
      width: config.width,
      height: config.height,
      fileSize: await this.getFileSize(outputPath),
      isAnimated: true
    };
  }
}
```

### Metadata Extraction Service

```typescript
// Metadata Extraction Implementation
class MetadataExtractionService {
  async extractMediaMetadata(filePath: string): Promise<MediaMetadata> {
    const command = [
      'ffprobe',
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath
    ];
    
    const result = await this.executeCommand(command);
    const probeData = JSON.parse(result.stdout);
    
    return this.parseMetadata(probeData);
  }
  
  private parseMetadata(probeData: any): MediaMetadata {
    const format = probeData.format;
    const videoStream = probeData.streams.find(s => s.codec_type === 'video');
    const audioStream = probeData.streams.find(s => s.codec_type === 'audio');
    
    return {
      duration: parseFloat(format.duration),
      fileSize: parseInt(format.size),
      bitrate: parseInt(format.bit_rate),
      
      // Video metadata
      video: videoStream ? {
        codec: videoStream.codec_name,
        resolution: `${videoStream.width}x${videoStream.height}`,
        framerate: this.parseFramerate(videoStream.r_frame_rate),
        bitrate: parseInt(videoStream.bit_rate) || 0,
        pixelFormat: videoStream.pix_fmt
      } : null,
      
      // Audio metadata
      audio: audioStream ? {
        codec: audioStream.codec_name,
        sampleRate: parseInt(audioStream.sample_rate),
        channels: audioStream.channels,
        bitrate: parseInt(audioStream.bit_rate) || 0,
        channelLayout: audioStream.channel_layout
      } : null,
      
      // Format metadata
      format: {
        container: format.format_name,
        tags: format.tags || {}
      }
    };
  }
  
  async extractAudioFingerprint(audioPath: string): Promise<AudioFingerprint> {
    // Use chromaprint for audio fingerprinting
    const command = [
      'fpcalc',
      '-json',
      '-length', '120', // First 2 minutes
      audioPath
    ];
    
    const result = await this.executeCommand(command);
    const fingerprintData = JSON.parse(result.stdout);
    
    return {
      fingerprint: fingerprintData.fingerprint,
      duration: fingerprintData.duration,
      algorithm: 'chromaprint'
    };
  }
}
```

### Quality Analysis Service

```typescript
// Quality Analysis Implementation
class QualityAnalysisService {
  async analyzeVideoQuality(videoPath: string): Promise<VideoQualityReport> {
    const metrics = await Promise.all([
      this.calculatePSNR(videoPath),
      this.calculateSSIM(videoPath),
      this.detectArtifacts(videoPath),
      this.analyzeMotion(videoPath)
    ]);
    
    return {
      psnr: metrics[0],
      ssim: metrics[1],
      artifacts: metrics[2],
      motion: metrics[3],
      overallScore: this.calculateOverallScore(metrics)
    };
  }
  
  private async calculatePSNR(videoPath: string): Promise<number> {
    // Peak Signal-to-Noise Ratio calculation
    const command = [
      'ffmpeg',
      '-i', videoPath,
      '-vf', 'psnr',
      '-f', 'null',
      '-'
    ];
    
    const result = await this.executeCommand(command);
    const psnrMatch = result.stderr.match(/PSNR.*average:(\d+\.\d+)/);
    return psnrMatch ? parseFloat(psnrMatch[1]) : 0;
  }
  
  private async calculateSSIM(videoPath: string): Promise<number> {
    // Structural Similarity Index calculation
    const command = [
      'ffmpeg',
      '-i', videoPath,
      '-vf', 'ssim',
      '-f', 'null',
      '-'
    ];
    
    const result = await this.executeCommand(command);
    const ssimMatch = result.stderr.match(/SSIM.*All:(\d+\.\d+)/);
    return ssimMatch ? parseFloat(ssimMatch[1]) : 0;
  }
  
  async analyzeAudioQuality(audioPath: string): Promise<AudioQualityReport> {
    const [thd, snr, loudness] = await Promise.all([
      this.calculateTHD(audioPath),
      this.calculateSNR(audioPath),
      this.analyzeLoudness(audioPath)
    ]);
    
    return {
      thd,
      snr,
      loudness,
      overallScore: this.calculateAudioScore(thd, snr, loudness)
    };
  }
}
```

### Cloud Processing Integration

```typescript
// Cloud Processing Service
class CloudProcessingService {
  private awsMediaConvert: AWS.MediaConvert;
  private gcpTranscoder: any; // Google Cloud Transcoder API
  
  async processWithAWS(
    inputS3Path: string, 
    outputS3Path: string, 
    profiles: VideoProfile[]
  ): Promise<string> {
    const jobSettings = this.buildAWSJobSettings(inputS3Path, outputS3Path, profiles);
    
    const job = await this.awsMediaConvert.createJob({
      Role: process.env.AWS_MEDIACONVERT_ROLE,
      Settings: jobSettings
    }).promise();
    
    return job.Job.Id;
  }
  
  async processWithGCP(
    inputGCSPath: string, 
    outputGCSPath: string, 
    profiles: VideoProfile[]
  ): Promise<string> {
    const jobConfig = this.buildGCPJobConfig(inputGCSPath, outputGCSPath, profiles);
    
    const [job] = await this.gcpTranscoder.createJob({
      parent: `projects/${process.env.GCP_PROJECT_ID}/locations/${process.env.GCP_LOCATION}`,
      job: jobConfig
    });
    
    return job.name;
  }
  
  async monitorCloudJob(jobId: string, provider: 'aws' | 'gcp'): Promise<JobStatus> {
    switch (provider) {
      case 'aws':
        return this.monitorAWSJob(jobId);
      case 'gcp':
        return this.monitorGCPJob(jobId);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
```

## Configuration Parameters

### Media Processing Pipeline Configuration

```yaml
# Media Processing Configuration
media_processing:
  transcoding:
    parallel_jobs: 4
    processing_priority: "balanced"  # speed, quality, balanced
    cloud_processing: true
    local_fallback: true
    
  video_profiles:
    - name: "mobile_low"
      resolution: "640x360"
      bitrate: 800
      codec: "h264"
      preset: "fast"
      two_pass: false
    - name: "mobile_high"
      resolution: "1280x720"
      bitrate: 2500
      codec: "h264"
      preset: "medium"
      two_pass: true
    - name: "desktop"
      resolution: "1920x1080"
      bitrate: 5000
      codec: "h264"
      preset: "slow"
      two_pass: true
    - name: "4k"
      resolution: "3840x2160"
      bitrate: 15000
      codec: "h265"
      preset: "slow"
      two_pass: true

  audio_profiles:
    - name: "low_quality"
      codec: "aac"
      bitrate: 64
      sample_rate: 44100
      channels: 2
    - name: "standard"
      codec: "aac"
      bitrate: 128
      sample_rate: 48000
      channels: 2
    - name: "high_quality"
      codec: "aac"
      bitrate: 256
      sample_rate: 48000
      channels: 2

  thumbnail_generation:
    count: 10
    width: 320
    height: 180
    format: "jpg"
    quality: 85
    animated_preview: true
    preview_duration: 3  # seconds
```

### Cloud Processing Configuration

```json
{
  "cloud_providers": {
    "aws_mediaconvert": {
      "enabled": true,
      "region": "us-east-1",
      "role_arn": "arn:aws:iam::account:role/MediaConvertRole",
      "queue": "Default",
      "pricing_tier": "on_demand"
    },
    "gcp_transcoder": {
      "enabled": false,
      "project_id": "your-project-id",
      "location": "us-central1",
      "template_id": "custom-template"
    },
    "azure_media_services": {
      "enabled": false,
      "account_name": "your-account",
      "resource_group": "media-rg",
      "transform_name": "custom-transform"
    }
  },
  "processing_rules": {
    "file_size_threshold": 100,
    "duration_threshold": 300,
    "use_cloud_for_4k": true,
    "fallback_to_local": true,
    "max_retry_attempts": 3
  }
}
```

### Quality Analysis Configuration

```typescript
// Quality Analysis Configuration
interface QualityAnalysisConfig {
  video: {
    enablePSNR: boolean;
    enableSSIM: boolean;
    enableVMAF: boolean;
    artifactDetection: boolean;
    motionAnalysis: boolean;
    qualityThresholds: {
      minPSNR: number;
      minSSIM: number;
      minVMAF: number;
    };
  };
  audio: {
    enableTHD: boolean;
    enableSNR: boolean;
    loudnessAnalysis: boolean;
    dynamicRangeAnalysis: boolean;
    qualityThresholds: {
      maxTHD: number;
      minSNR: number;
      targetLUFS: number;
    };
  };
}

// Example configuration
const qualityConfig: QualityAnalysisConfig = {
  video: {
    enablePSNR: true,
    enableSSIM: true,
    enableVMAF: false, // Requires additional setup
    artifactDetection: true,
    motionAnalysis: true,
    qualityThresholds: {
      minPSNR: 30.0,
      minSSIM: 0.85,
      minVMAF: 70.0
    }
  },
  audio: {
    enableTHD: true,
    enableSNR: true,
    loudnessAnalysis: true,
    dynamicRangeAnalysis: false,
    qualityThresholds: {
      maxTHD: 0.1,
      minSNR: 60.0,
      targetLUFS: -16.0
    }
  }
};
```

### Processing Queue Configuration

```yaml
# Processing Queue Configuration
processing_queue:
  redis:
    host: "localhost"
    port: 6379
    db: 0
    password: null
    
  queue_settings:
    default_priority: 5
    max_concurrent_jobs: 8
    job_timeout: 3600  # 1 hour
    retry_attempts: 3
    retry_delay: 300   # 5 minutes
    
  priority_rules:
    - condition: "file_size < 100MB"
      priority: 7
    - condition: "user_tier == 'premium'"
      priority: 8
    - condition: "content_type == 'live'"
      priority: 9
    - condition: "processing_time > 1800"
      priority: 3
      
  resource_limits:
    max_memory_per_job: "4GB"
    max_cpu_cores: 4
    temp_storage_limit: "10GB"
    cleanup_temp_files: true
```

## Platform-Specific Implementations

### Web Implementation

```javascript
// Web-based Media Processing (using WebAssembly FFmpeg)
class WebMediaProcessor {
  constructor() {
    this.ffmpeg = null;
  }
  
  async initialize() {
    const { createFFmpeg, fetchFile } = FFmpeg;
    this.ffmpeg = createFFmpeg({
      log: true,
      corePath: '/ffmpeg-core.js'
    });
    await this.ffmpeg.load();
  }
  
  async processVideoInBrowser(file, profile) {
    this.ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));
    
    await this.ffmpeg.run(
      '-i', 'input.mp4',
      '-c:v', profile.codec,
      '-b:v', `${profile.bitrate}k`,
      '-s', profile.resolution,
      'output.mp4'
    );
    
    const data = this.ffmpeg.FS('readFile', 'output.mp4');
    return new Blob([data.buffer], { type: 'video/mp4' });
  }
}
```

### Mobile Implementation

```swift
// iOS Media Processing
import AVFoundation

class iOSMediaProcessor {
    func processVideo(inputURL: URL, profile: VideoProfile) async throws -> URL {
        let asset = AVURLAsset(url: inputURL)
        let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetMediumQuality)
        
        let outputURL = generateOutputURL(for: profile)
        exportSession?.outputURL = outputURL
        exportSession?.outputFileType = .mp4
        
        // Configure video settings
        exportSession?.videoComposition = createVideoComposition(for: asset, profile: profile)
        
        await exportSession?.export()
        
        guard exportSession?.status == .completed else {
            throw ProcessingError.exportFailed
        }
        
        return outputURL
    }
    
    private func createVideoComposition(for asset: AVAsset, profile: VideoProfile) -> AVVideoComposition {
        let composition = AVMutableVideoComposition()
        composition.renderSize = CGSize(width: profile.width, height: profile.height)
        composition.frameDuration = CMTime(value: 1, timescale: Int32(profile.framerate))
        
        return composition
    }
}
```

## Testing Strategy

```typescript
// Media Processing Tests
describe('Media Processing Pipeline', () => {
  test('should transcode video to multiple profiles', async () => {
    const inputPath = 'test-video.mp4';
    const profiles = [
      { name: '720p', resolution: '1280x720', bitrate: 2500, codec: 'h264' },
      { name: '480p', resolution: '854x480', bitrate: 1200, codec: 'h264' }
    ];
    
    const results = await videoTranscodingService.transcodeVideo(inputPath, profiles);
    
    expect(results).toHaveLength(2);
    expect(results.every(r => r.success)).toBe(true);
    
    // Verify output quality
    for (const result of results) {
      expect(result.qualityScore).toBeGreaterThan(0.8);
      expect(result.fileSize).toBeGreaterThan(0);
    }
  });
  
  test('should generate thumbnails at correct intervals', async () => {
    const videoPath = 'test-video.mp4';
    const config = { count: 5, width: 320, height: 180 };
    
    const thumbnails = await thumbnailService.generateVideoThumbnails(videoPath, config);
    
    expect(thumbnails).toHaveLength(5);
    expect(thumbnails.every(t => t.width === 320 && t.height === 180)).toBe(true);
  });
});
```

## Best Practices

1. **Processing Queue**: Implement job queues for handling multiple processing tasks
2. **Progress Tracking**: Provide real-time progress updates for long-running processes
3. **Error Handling**: Implement robust error handling and retry mechanisms
4. **Quality Control**: Always validate output quality and file integrity
5. **Resource Management**: Monitor CPU, memory, and disk usage during processing
6. **Caching**: Cache processed results to avoid redundant processing

## Integration Points

- **CDN Module**: Upload processed media to CDN for distribution
- **Storage Module**: Manage input/output file storage and cleanup
- **Analytics Module**: Track processing metrics and performance
- **Notification Module**: Send processing completion notifications

This template provides a comprehensive foundation for implementing robust media processing and transcoding capabilities in streaming applications.
