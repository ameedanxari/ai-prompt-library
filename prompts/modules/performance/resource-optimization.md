# Resource Optimization Template

## Purpose

This template provides comprehensive patterns for optimizing memory, CPU, storage, and network resources in applications. It covers memory management strategies, CPU utilization optimization, storage efficiency patterns, network optimization, and cost optimization strategies for cloud-native applications.

## Context

Resource optimization is critical for application performance, cost management, and environmental sustainability. This template addresses the challenges of identifying resource bottlenecks, implementing efficient resource utilization patterns, optimizing cloud costs, and maintaining performance while minimizing resource consumption.

## Core Components

### Memory Management Service

## Examples

```typescript
interface MemoryManagementService {
  // Memory monitoring
  getMemoryUsage(): MemoryUsage;
  getHeapStatistics(): HeapStatistics;
  trackMemoryAllocation(label: string): AllocationTracker;
  
  // Memory optimization
  optimizeMemoryUsage(): Promise<OptimizationResult>;
  triggerGarbageCollection(): void;
  clearCaches(): Promise<void>;
  
  // Memory limits
  setMemoryLimit(limit: number): void;
  getMemoryLimit(): number;
  onMemoryPressure(callback: MemoryPressureCallback): void;
  
  // Leak detection
  detectMemoryLeaks(): Promise<MemoryLeakReport>;
  getRetainedObjects(): Promise<RetainedObject[]>;
}

interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
  heapUsedPercent: number;
}

interface HeapStatistics {
  totalHeapSize: number;
  totalHeapSizeExecutable: number;
  totalPhysicalSize: number;
  totalAvailableSize: number;
  usedHeapSize: number;
  heapSizeLimit: number;
  mallocedMemory: number;
  peakMallocedMemory: number;
  numberOfNativeContexts: number;
  numberOfDetachedContexts: number;
}

interface MemoryLeakReport {
  leaksDetected: boolean;
  suspectedLeaks: SuspectedLeak[];
  recommendations: string[];
  heapGrowthRate: number;
}

interface SuspectedLeak {
  type: string;
  count: number;
  retainedSize: number;
  path: string[];
  confidence: number;
}
```


### CPU Optimization Service

```typescript
interface CPUOptimizationService {
  // CPU monitoring
  getCPUUsage(): CPUUsage;
  getCPUProfile(duration: number): Promise<CPUProfile>;
  getEventLoopLag(): number;
  
  // Workload management
  scheduleWork(task: Task, priority: TaskPriority): Promise<void>;
  throttleWork(maxConcurrency: number): void;
  setWorkerPoolSize(size: number): void;
  
  // Optimization
  identifyHotspots(): Promise<Hotspot[]>;
  optimizeEventLoop(): Promise<OptimizationResult>;
  
  // Async optimization
  batchOperations<T>(operations: Operation<T>[], batchSize: number): Promise<T[]>;
  debounce<T>(fn: () => Promise<T>, delay: number): () => Promise<T>;
  throttle<T>(fn: () => Promise<T>, limit: number): () => Promise<T>;
}

interface CPUUsage {
  user: number;
  system: number;
  idle: number;
  total: number;
  percentUsed: number;
  cores: CoreUsage[];
}

interface CoreUsage {
  core: number;
  user: number;
  system: number;
  idle: number;
}

enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
  BACKGROUND = 'background'
}

interface Hotspot {
  function: string;
  file: string;
  line: number;
  selfTime: number;
  totalTime: number;
  callCount: number;
  avgTime: number;
}
```

### Storage Optimization Service

```typescript
interface StorageOptimizationService {
  // Storage monitoring
  getStorageUsage(): StorageUsage;
  getDiskIOStats(): DiskIOStats;
  getFileSystemStats(path: string): FileSystemStats;
  
  // Data compression
  compressData(data: Buffer, algorithm: CompressionAlgorithm): Promise<Buffer>;
  decompressData(data: Buffer, algorithm: CompressionAlgorithm): Promise<Buffer>;
  estimateCompressionRatio(data: Buffer): Promise<number>;
  
  // Storage cleanup
  cleanupTempFiles(): Promise<CleanupResult>;
  archiveOldData(criteria: ArchiveCriteria): Promise<ArchiveResult>;
  deduplicateStorage(): Promise<DeduplicationResult>;
  
  // Tiered storage
  moveToTier(data: DataReference, tier: StorageTier): Promise<void>;
  getOptimalTier(data: DataReference): Promise<StorageTier>;
}

interface StorageUsage {
  total: number;
  used: number;
  available: number;
  percentUsed: number;
  byType: Record<string, number>;
}

interface DiskIOStats {
  readOps: number;
  writeOps: number;
  readBytes: number;
  writeBytes: number;
  readLatency: number;
  writeLatency: number;
  queueDepth: number;
}

enum CompressionAlgorithm {
  GZIP = 'gzip',
  BROTLI = 'brotli',
  LZ4 = 'lz4',
  ZSTD = 'zstd',
  SNAPPY = 'snappy'
}

enum StorageTier {
  HOT = 'hot',
  WARM = 'warm',
  COLD = 'cold',
  ARCHIVE = 'archive'
}
```

### Network Optimization Service

```typescript
interface NetworkOptimizationService {
  // Network monitoring
  getNetworkStats(): NetworkStats;
  measureLatency(endpoint: string): Promise<LatencyMeasurement>;
  measureBandwidth(endpoint: string): Promise<BandwidthMeasurement>;
  
  // Connection management
  getConnectionPool(): ConnectionPoolStats;
  optimizeConnectionPool(): Promise<void>;
  setMaxConnections(max: number): void;
  
  // Request optimization
  enableCompression(config: CompressionConfig): void;
  enableKeepAlive(config: KeepAliveConfig): void;
  enableHTTP2(): void;
  
  // Caching
  configureDNSCache(config: DNSCacheConfig): void;
  configureResponseCache(config: ResponseCacheConfig): void;
}

interface NetworkStats {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  errors: number;
  dropped: number;
  activeConnections: number;
}

interface ConnectionPoolStats {
  active: number;
  idle: number;
  waiting: number;
  total: number;
  maxSize: number;
  avgWaitTime: number;
}

interface LatencyMeasurement {
  endpoint: string;
  dns: number;
  tcp: number;
  tls: number;
  ttfb: number;
  total: number;
  timestamp: Date;
}
```

### Cost Optimization Service

```typescript
interface CostOptimizationService {
  // Cost analysis
  getCurrentCosts(): Promise<CostBreakdown>;
  getCostTrend(period: TimePeriod): Promise<CostTrend>;
  getCostByResource(): Promise<ResourceCost[]>;
  
  // Recommendations
  getOptimizationRecommendations(): Promise<CostRecommendation[]>;
  estimateSavings(recommendation: CostRecommendation): Promise<SavingsEstimate>;
  
  // Resource rightsizing
  analyzeResourceUtilization(): Promise<UtilizationAnalysis>;
  recommendRightsizing(): Promise<RightsizingRecommendation[]>;
  
  // Reserved capacity
  analyzeReservedCapacity(): Promise<ReservedCapacityAnalysis>;
  recommendReservations(): Promise<ReservationRecommendation[]>;
  
  // Spot/preemptible instances
  analyzeSpotOpportunities(): Promise<SpotOpportunity[]>;
}

interface CostBreakdown {
  total: number;
  currency: string;
  period: TimePeriod;
  byService: Record<string, number>;
  byRegion: Record<string, number>;
  byTag: Record<string, number>;
}

interface CostRecommendation {
  id: string;
  type: RecommendationType;
  resource: string;
  currentCost: number;
  estimatedSavings: number;
  savingsPercent: number;
  effort: EffortLevel;
  risk: RiskLevel;
  description: string;
  implementation: string;
}

enum RecommendationType {
  RIGHTSIZE = 'rightsize',
  TERMINATE_IDLE = 'terminate_idle',
  RESERVED_INSTANCE = 'reserved_instance',
  SPOT_INSTANCE = 'spot_instance',
  STORAGE_TIER = 'storage_tier',
  NETWORK_OPTIMIZATION = 'network_optimization'
}

interface RightsizingRecommendation {
  resourceId: string;
  resourceType: string;
  currentSize: string;
  recommendedSize: string;
  currentCost: number;
  projectedCost: number;
  savings: number;
  utilizationMetrics: UtilizationMetrics;
}
```

## Implementation Patterns

### Memory Pool Implementation

```typescript
class MemoryPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (item: T) => void;
  private maxSize: number;
  private allocated: number = 0;

  constructor(config: MemoryPoolConfig<T>) {
    this.factory = config.factory;
    this.reset = config.reset;
    this.maxSize = config.maxSize;
    
    // Pre-allocate initial pool
    for (let i = 0; i < config.initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      this.allocated++;
      return this.pool.pop()!;
    }
    
    if (this.allocated < this.maxSize) {
      this.allocated++;
      return this.factory();
    }
    
    throw new Error('Memory pool exhausted');
  }

  release(item: T): void {
    this.reset(item);
    this.pool.push(item);
    this.allocated--;
  }

  getStats(): PoolStats {
    return {
      poolSize: this.pool.length,
      allocated: this.allocated,
      maxSize: this.maxSize,
      utilizationPercent: (this.allocated / this.maxSize) * 100
    };
  }
}

// Usage example: Buffer pool
const bufferPool = new MemoryPool<Buffer>({
  factory: () => Buffer.allocUnsafe(4096),
  reset: (buffer) => buffer.fill(0),
  initialSize: 100,
  maxSize: 1000
});
```

### Lazy Loading Implementation

```typescript
class LazyLoader<T> {
  private cache: Map<string, T> = new Map();
  private loading: Map<string, Promise<T>> = new Map();
  private loader: (key: string) => Promise<T>;
  private maxCacheSize: number;
  private accessOrder: string[] = [];

  constructor(loader: (key: string) => Promise<T>, maxCacheSize: number = 100) {
    this.loader = loader;
    this.maxCacheSize = maxCacheSize;
  }

  async get(key: string): Promise<T> {
    // Check cache first
    if (this.cache.has(key)) {
      this.updateAccessOrder(key);
      return this.cache.get(key)!;
    }

    // Check if already loading
    if (this.loading.has(key)) {
      return this.loading.get(key)!;
    }

    // Load and cache
    const loadPromise = this.loader(key);
    this.loading.set(key, loadPromise);

    try {
      const value = await loadPromise;
      this.cache.set(key, value);
      this.updateAccessOrder(key);
      this.evictIfNeeded();
      return value;
    } finally {
      this.loading.delete(key);
    }
  }

  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  private evictIfNeeded(): void {
    while (this.cache.size > this.maxCacheSize) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }
}
```

### Work Queue with Backpressure

```typescript
class BackpressureWorkQueue<T, R> {
  private queue: QueueItem<T, R>[] = [];
  private processing: number = 0;
  private maxConcurrency: number;
  private maxQueueSize: number;
  private processor: (item: T) => Promise<R>;

  constructor(config: WorkQueueConfig<T, R>) {
    this.maxConcurrency = config.maxConcurrency;
    this.maxQueueSize = config.maxQueueSize;
    this.processor = config.processor;
  }

  async enqueue(item: T): Promise<R> {
    // Apply backpressure if queue is full
    if (this.queue.length >= this.maxQueueSize) {
      await this.waitForCapacity();
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });
      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.processing >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    this.processing++;
    const { item, resolve, reject } = this.queue.shift()!;

    try {
      const result = await this.processor(item);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing--;
      this.processNext();
    }
  }

  private waitForCapacity(): Promise<void> {
    return new Promise((resolve) => {
      const checkCapacity = () => {
        if (this.queue.length < this.maxQueueSize) {
          resolve();
        } else {
          setTimeout(checkCapacity, 10);
        }
      };
      checkCapacity();
    });
  }

  getStats(): QueueStats {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      maxConcurrency: this.maxConcurrency,
      maxQueueSize: this.maxQueueSize
    };
  }
}
```

### Streaming Data Processor

```typescript
class StreamingDataProcessor<T, R> {
  private transform: (chunk: T) => R;
  private batchSize: number;
  private flushInterval: number;
  private batch: T[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: StreamProcessorConfig<T, R>) {
    this.transform = config.transform;
    this.batchSize = config.batchSize;
    this.flushInterval = config.flushInterval;
  }

  async process(item: T): Promise<void> {
    this.batch.push(item);

    if (this.batch.length >= this.batchSize) {
      await this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  async flush(): Promise<R[]> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }

    if (this.batch.length === 0) {
      return [];
    }

    const items = this.batch;
    this.batch = [];

    // Process in parallel with controlled concurrency
    const results: R[] = [];
    for (const item of items) {
      results.push(this.transform(item));
    }

    return results;
  }
}
```

## Integration Points

### AWS Cost Explorer Integration

```typescript
class AWSCostExplorerIntegration {
  private costExplorer: CostExplorerClient;

  async getCostAndUsage(params: CostQueryParams): Promise<CostBreakdown> {
    const response = await this.costExplorer.send(
      new GetCostAndUsageCommand({
        TimePeriod: {
          Start: params.startDate,
          End: params.endDate
        },
        Granularity: params.granularity,
        Metrics: ['UnblendedCost', 'UsageQuantity'],
        GroupBy: [
          { Type: 'DIMENSION', Key: 'SERVICE' }
        ]
      })
    );

    return this.transformResponse(response);
  }

  async getRightsizingRecommendations(): Promise<RightsizingRecommendation[]> {
    const response = await this.costExplorer.send(
      new GetRightsizingRecommendationCommand({
        Service: 'AmazonEC2',
        Configuration: {
          RecommendationTarget: 'SAME_INSTANCE_FAMILY',
          BenefitsConsidered: true
        }
      })
    );

    return response.RightsizingRecommendations?.map(rec => ({
      resourceId: rec.CurrentInstance?.ResourceId || '',
      resourceType: 'EC2',
      currentSize: rec.CurrentInstance?.InstanceType || '',
      recommendedSize: rec.ModifyRecommendationDetail?.TargetInstances?.[0]?.InstanceType || '',
      currentCost: parseFloat(rec.CurrentInstance?.MonthlyCost || '0'),
      projectedCost: parseFloat(rec.ModifyRecommendationDetail?.TargetInstances?.[0]?.EstimatedMonthlyCost || '0'),
      savings: parseFloat(rec.ModifyRecommendationDetail?.TargetInstances?.[0]?.EstimatedMonthlySavings || '0'),
      utilizationMetrics: {
        cpu: rec.CurrentInstance?.ResourceUtilization?.EC2ResourceUtilization?.MaxCpuUtilizationPercentage || '0',
        memory: rec.CurrentInstance?.ResourceUtilization?.EC2ResourceUtilization?.MaxMemoryUtilizationPercentage || '0'
      }
    })) || [];
  }
}
```

### Prometheus Resource Metrics

```typescript
class PrometheusResourceMetrics {
  private registry: Registry;

  constructor() {
    this.registry = new Registry();
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    // Memory metrics
    new Gauge({
      name: 'process_memory_heap_used_bytes',
      help: 'Process heap memory used',
      registers: [this.registry],
      collect() {
        const usage = process.memoryUsage();
        this.set(usage.heapUsed);
      }
    });

    // CPU metrics
    new Gauge({
      name: 'process_cpu_usage_percent',
      help: 'Process CPU usage percentage',
      registers: [this.registry],
      collect() {
        const usage = process.cpuUsage();
        const total = usage.user + usage.system;
        this.set(total / 1000000); // Convert to seconds
      }
    });

    // Event loop lag
    new Gauge({
      name: 'nodejs_eventloop_lag_seconds',
      help: 'Event loop lag in seconds',
      registers: [this.registry],
      collect() {
        const start = process.hrtime.bigint();
        setImmediate(() => {
          const lag = Number(process.hrtime.bigint() - start) / 1e9;
          this.set(lag);
        });
      }
    });
  }
}
```

## Security Considerations

### Secure Resource Management

```typescript
class SecureResourceManager {
  private resourceLimits: ResourceLimits;
  private auditLogger: AuditLogger;

  async allocateResource(request: ResourceRequest, userId: string): Promise<Resource> {
    // Validate request against limits
    if (!this.validateRequest(request)) {
      throw new Error('Resource request exceeds allowed limits');
    }

    // Check user quotas
    const userQuota = await this.getUserQuota(userId);
    if (request.amount > userQuota.remaining) {
      throw new Error('User quota exceeded');
    }

    // Audit log
    await this.auditLogger.log({
      action: 'RESOURCE_ALLOCATION',
      userId,
      resource: request.type,
      amount: request.amount
    });

    return this.doAllocate(request);
  }

  private validateRequest(request: ResourceRequest): boolean {
    const limit = this.resourceLimits[request.type];
    return request.amount <= limit.maxPerRequest &&
           request.amount >= limit.minPerRequest;
  }
}
```

## Testing Considerations

### Resource Optimization Tests

```typescript
describe('Memory Pool Tests', () => {
  it('should reuse pooled objects', () => {
    const pool = new MemoryPool<Buffer>({
      factory: () => Buffer.allocUnsafe(1024),
      reset: (b) => b.fill(0),
      initialSize: 5,
      maxSize: 10
    });

    const buffer1 = pool.acquire();
    pool.release(buffer1);
    const buffer2 = pool.acquire();

    expect(buffer1).toBe(buffer2);
  });

  it('should throw when pool is exhausted', () => {
    const pool = new MemoryPool<Buffer>({
      factory: () => Buffer.allocUnsafe(1024),
      reset: (b) => b.fill(0),
      initialSize: 1,
      maxSize: 1
    });

    pool.acquire();
    expect(() => pool.acquire()).toThrow('Memory pool exhausted');
  });
});

describe('Work Queue Tests', () => {
  it('should apply backpressure when queue is full', async () => {
    const queue = new BackpressureWorkQueue<number, number>({
      maxConcurrency: 1,
      maxQueueSize: 2,
      processor: async (n) => {
        await new Promise(r => setTimeout(r, 100));
        return n * 2;
      }
    });

    const start = Date.now();
    await Promise.all([
      queue.enqueue(1),
      queue.enqueue(2),
      queue.enqueue(3)
    ]);
    const duration = Date.now() - start;

    // Should take at least 200ms due to backpressure
    expect(duration).toBeGreaterThanOrEqual(200);
  });
});
```

## Configuration Examples

### Resource Limits Configuration

```typescript
const resourceLimitsConfig: ResourceLimitsConfig = {
  memory: {
    maxHeapSize: 512 * 1024 * 1024, // 512MB
    warningThreshold: 0.8,
    criticalThreshold: 0.95,
    gcTriggerThreshold: 0.7
  },
  cpu: {
    maxUtilization: 0.8,
    throttleThreshold: 0.9,
    workerPoolSize: 4
  },
  connections: {
    maxTotal: 100,
    maxPerHost: 10,
    idleTimeout: 30000,
    keepAliveTimeout: 60000
  },
  storage: {
    maxTempSize: 1024 * 1024 * 1024, // 1GB
    cleanupInterval: 3600000,
    compressionThreshold: 1024 * 1024 // 1MB
  }
};
```

### Cost Optimization Configuration

```typescript
const costOptimizationConfig: CostOptimizationConfig = {
  analysis: {
    lookbackPeriod: 30, // days
    utilizationThreshold: 0.4,
    savingsThreshold: 0.1 // 10% minimum savings
  },
  recommendations: {
    enableRightsizing: true,
    enableReservedInstances: true,
    enableSpotInstances: true,
    enableStorageTiering: true
  },
  alerts: {
    budgetThreshold: 0.8,
    anomalyDetection: true,
    dailyReport: true
  }
};
```
