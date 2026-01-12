# Caching Strategies Template

## Purpose

This template provides comprehensive patterns for implementing caching strategies across application and database layers. It covers in-memory caching, distributed caching, CDN integration, cache invalidation patterns, and cache optimization techniques for high-performance applications.

## Context

Effective caching is critical for application performance, reducing latency, database load, and infrastructure costs. This template addresses the challenges of implementing multi-layer caching strategies, maintaining cache consistency, and optimizing cache hit rates while ensuring data freshness and system reliability.

## Core Components

### Cache Manager Service

## Examples

```typescript
interface CacheManagerService {
  // Basic cache operations
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  
  // Batch operations
  mget<T>(keys: string[]): Promise<Map<string, T | null>>;
  mset<T>(entries: Map<string, T>, options?: CacheOptions): Promise<void>;
  mdelete(keys: string[]): Promise<number>;
  
  // Pattern operations
  keys(pattern: string): Promise<string[]>;
  deleteByPattern(pattern: string): Promise<number>;
  
  // Cache management
  clear(): Promise<void>;
  getStats(): Promise<CacheStats>;
  healthCheck(): Promise<CacheHealthStatus>;
}

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for grouped invalidation
  priority?: CachePriority;
  compression?: boolean;
  serializer?: CacheSerializer;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memoryUsage: number;
  evictions: number;
  avgLatency: number;
}

interface CacheHealthStatus {
  healthy: boolean;
  latency: number;
  memoryUsage: number;
  connectionCount: number;
  errors: CacheError[];
}

enum CachePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}

type CacheSerializer = 'json' | 'msgpack' | 'protobuf';
```

### Multi-Layer Cache Service

```typescript
interface MultiLayerCacheService {
  // Layer management
  addLayer(layer: CacheLayer): void;
  removeLayer(layerId: string): void;
  getLayers(): CacheLayer[];
  
  // Cascading operations
  get<T>(key: string): Promise<CacheResult<T>>;
  set<T>(key: string, value: T, options?: MultiLayerCacheOptions): Promise<void>;
  invalidate(key: string): Promise<void>;
  
  // Layer-specific operations
  getFromLayer<T>(layerId: string, key: string): Promise<T | null>;
  setToLayer<T>(layerId: string, key: string, value: T): Promise<void>;
  
  // Warming and synchronization
  warmCache(keys: string[]): Promise<WarmingResult>;
  syncLayers(): Promise<SyncResult>;
}

interface CacheLayer {
  id: string;
  type: CacheLayerType;
  priority: number;
  config: CacheLayerConfig;
  client: CacheClient;
}

enum CacheLayerType {
  MEMORY = 'memory',
  REDIS = 'redis',
  MEMCACHED = 'memcached',
  CDN = 'cdn',
  DATABASE = 'database'
}

interface CacheLayerConfig {
  maxSize?: number;
  ttl?: number;
  evictionPolicy?: EvictionPolicy;
  readThrough?: boolean;
  writeThrough?: boolean;
  writeBehind?: boolean;
}

enum EvictionPolicy {
  LRU = 'lru', // Least Recently Used
  LFU = 'lfu', // Least Frequently Used
  FIFO = 'fifo', // First In First Out
  TTL = 'ttl', // Time To Live based
  RANDOM = 'random'
}

interface CacheResult<T> {
  value: T | null;
  found: boolean;
  layer: string;
  latency: number;
  stale: boolean;
}
```

### Cache Invalidation Service

```typescript
interface CacheInvalidationService {
  // Direct invalidation
  invalidateKey(key: string): Promise<void>;
  invalidateKeys(keys: string[]): Promise<void>;
  invalidateByPattern(pattern: string): Promise<number>;
  invalidateByTags(tags: string[]): Promise<number>;
  
  // Event-based invalidation
  onDataChange(event: DataChangeEvent): Promise<void>;
  registerInvalidationRule(rule: InvalidationRule): void;
  
  // Scheduled invalidation
  scheduleInvalidation(key: string, at: Date): Promise<string>;
  cancelScheduledInvalidation(scheduleId: string): Promise<boolean>;
  
  // Propagation
  propagateInvalidation(key: string, targets: CacheTarget[]): Promise<void>;
}

interface DataChangeEvent {
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  changedFields?: string[];
  timestamp: Date;
}

interface InvalidationRule {
  id: string;
  entityType: string;
  operations: ('create' | 'update' | 'delete')[];
  keyPattern: string;
  tags?: string[];
  cascade?: boolean;
}

interface CacheTarget {
  type: CacheLayerType;
  endpoint?: string;
  region?: string;
}
```

### Database Query Cache

```typescript
interface QueryCacheService {
  // Query caching
  cacheQuery<T>(query: CacheableQuery, result: T): Promise<void>;
  getCachedQuery<T>(query: CacheableQuery): Promise<T | null>;
  invalidateQuery(query: CacheableQuery): Promise<void>;
  
  // Table-based invalidation
  invalidateByTable(tableName: string): Promise<number>;
  invalidateByTables(tableNames: string[]): Promise<number>;
  
  // Query analysis
  analyzeQueryCacheability(query: string): QueryCacheAnalysis;
  getQueryStats(): Promise<QueryCacheStats>;
}

interface CacheableQuery {
  sql: string;
  params?: unknown[];
  tables: string[];
  ttl?: number;
}

interface QueryCacheAnalysis {
  cacheable: boolean;
  reason?: string;
  suggestedTtl?: number;
  dependencies: string[];
  volatility: 'low' | 'medium' | 'high';
}

interface QueryCacheStats {
  totalQueries: number;
  cachedQueries: number;
  cacheHitRate: number;
  avgQueryTime: number;
  avgCachedQueryTime: number;
  timeSaved: number;
}
```

## Implementation Patterns

### Redis Cache Implementation

```typescript
class RedisCacheManager implements CacheManagerService {
  private client: RedisClient;
  private prefix: string;
  private defaultTtl: number;

  constructor(config: RedisCacheConfig) {
    this.client = new RedisClient(config.connection);
    this.prefix = config.prefix || 'cache:';
    this.defaultTtl = config.defaultTtl || 3600;
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    const data = await this.client.get(fullKey);
    
    if (!data) return null;
    
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const fullKey = this.getFullKey(key);
    const ttl = options?.ttl ?? this.defaultTtl;
    
    let serialized: string;
    if (options?.compression) {
      serialized = await this.compress(JSON.stringify(value));
    } else {
      serialized = JSON.stringify(value);
    }

    if (ttl > 0) {
      await this.client.setex(fullKey, ttl, serialized);
    } else {
      await this.client.set(fullKey, serialized);
    }

    // Store tags for grouped invalidation
    if (options?.tags?.length) {
      await this.addToTags(fullKey, options.tags);
    }
  }

  async delete(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    const result = await this.client.del(fullKey);
    return result > 0;
  }

  async mget<T>(keys: string[]): Promise<Map<string, T | null>> {
    const fullKeys = keys.map(k => this.getFullKey(k));
    const values = await this.client.mget(fullKeys);
    
    const result = new Map<string, T | null>();
    keys.forEach((key, index) => {
      const value = values[index];
      result.set(key, value ? JSON.parse(value) : null);
    });
    
    return result;
  }

  async deleteByPattern(pattern: string): Promise<number> {
    const fullPattern = this.getFullKey(pattern);
    const keys = await this.client.keys(fullPattern);
    
    if (keys.length === 0) return 0;
    
    return this.client.del(...keys);
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private async addToTags(key: string, tags: string[]): Promise<void> {
    const pipeline = this.client.pipeline();
    for (const tag of tags) {
      pipeline.sadd(`${this.prefix}tag:${tag}`, key);
    }
    await pipeline.exec();
  }
}
```

### Cache-Aside Pattern Implementation

```typescript
class CacheAsideService<T> {
  private cache: CacheManagerService;
  private dataSource: DataSource<T>;
  private keyGenerator: KeyGenerator;

  constructor(
    cache: CacheManagerService,
    dataSource: DataSource<T>,
    keyGenerator: KeyGenerator
  ) {
    this.cache = cache;
    this.dataSource = dataSource;
    this.keyGenerator = keyGenerator;
  }

  async get(id: string): Promise<T | null> {
    const key = this.keyGenerator.generate(id);
    
    // Try cache first
    const cached = await this.cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Cache miss - fetch from data source
    const data = await this.dataSource.fetch(id);
    
    if (data !== null) {
      // Populate cache
      await this.cache.set(key, data, {
        ttl: this.keyGenerator.getTtl(id),
        tags: this.keyGenerator.getTags(id)
      });
    }
    
    return data;
  }

  async getMany(ids: string[]): Promise<Map<string, T | null>> {
    const keys = ids.map(id => this.keyGenerator.generate(id));
    const cached = await this.cache.mget<T>(keys);
    
    const result = new Map<string, T | null>();
    const missingIds: string[] = [];
    
    ids.forEach((id, index) => {
      const key = keys[index];
      const value = cached.get(key);
      if (value !== null) {
        result.set(id, value);
      } else {
        missingIds.push(id);
      }
    });
    
    // Fetch missing from data source
    if (missingIds.length > 0) {
      const fetched = await this.dataSource.fetchMany(missingIds);
      const toCache = new Map<string, T>();
      
      for (const [id, data] of fetched) {
        result.set(id, data);
        if (data !== null) {
          toCache.set(this.keyGenerator.generate(id), data);
        }
      }
      
      // Populate cache with fetched data
      if (toCache.size > 0) {
        await this.cache.mset(toCache);
      }
    }
    
    return result;
  }

  async invalidate(id: string): Promise<void> {
    const key = this.keyGenerator.generate(id);
    await this.cache.delete(key);
  }

  async refresh(id: string): Promise<T | null> {
    await this.invalidate(id);
    return this.get(id);
  }
}
```

### Write-Through Cache Pattern

```typescript
class WriteThroughCacheService<T> {
  private cache: CacheManagerService;
  private dataSource: DataSource<T>;
  private keyGenerator: KeyGenerator;

  async save(id: string, data: T): Promise<void> {
    const key = this.keyGenerator.generate(id);
    
    // Write to data source first
    await this.dataSource.save(id, data);
    
    // Then update cache
    await this.cache.set(key, data, {
      ttl: this.keyGenerator.getTtl(id),
      tags: this.keyGenerator.getTags(id)
    });
  }

  async delete(id: string): Promise<void> {
    const key = this.keyGenerator.generate(id);
    
    // Delete from data source first
    await this.dataSource.delete(id);
    
    // Then remove from cache
    await this.cache.delete(key);
  }
}
```

### Write-Behind (Write-Back) Cache Pattern

```typescript
class WriteBehindCacheService<T> {
  private cache: CacheManagerService;
  private dataSource: DataSource<T>;
  private writeQueue: WriteQueue<T>;
  private batchSize: number;
  private flushInterval: number;

  constructor(config: WriteBehindConfig<T>) {
    this.cache = config.cache;
    this.dataSource = config.dataSource;
    this.writeQueue = new WriteQueue<T>();
    this.batchSize = config.batchSize || 100;
    this.flushInterval = config.flushInterval || 5000;
    
    this.startFlushTimer();
  }

  async save(id: string, data: T): Promise<void> {
    const key = this.keyGenerator.generate(id);
    
    // Write to cache immediately
    await this.cache.set(key, data, {
      ttl: this.keyGenerator.getTtl(id)
    });
    
    // Queue write to data source
    this.writeQueue.enqueue({
      id,
      data,
      operation: 'save',
      timestamp: Date.now()
    });
    
    // Flush if batch size reached
    if (this.writeQueue.size() >= this.batchSize) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    const batch = this.writeQueue.dequeueAll();
    if (batch.length === 0) return;
    
    try {
      await this.dataSource.saveBatch(
        batch.map(item => ({ id: item.id, data: item.data }))
      );
    } catch (error) {
      // Re-queue failed items
      for (const item of batch) {
        this.writeQueue.enqueue(item);
      }
      throw error;
    }
  }

  private startFlushTimer(): void {
    setInterval(() => this.flush(), this.flushInterval);
  }
}
```

## Integration Points

### CDN Cache Integration

```typescript
class CDNCacheIntegration {
  private cdnProvider: CDNProvider;

  async purgeUrl(url: string): Promise<void> {
    await this.cdnProvider.createInvalidation({
      paths: [url]
    });
  }

  async purgeByTag(tag: string): Promise<void> {
    await this.cdnProvider.purgeByTag(tag);
  }

  async warmCache(urls: string[]): Promise<WarmingResult> {
    const results: WarmingResult = {
      successful: [],
      failed: []
    };

    for (const url of urls) {
      try {
        await fetch(url, { method: 'GET' });
        results.successful.push(url);
      } catch (error) {
        results.failed.push({ url, error: error.message });
      }
    }

    return results;
  }

  generateCacheHeaders(config: CacheHeaderConfig): Record<string, string> {
    const headers: Record<string, string> = {};

    if (config.maxAge) {
      headers['Cache-Control'] = `public, max-age=${config.maxAge}`;
    }

    if (config.staleWhileRevalidate) {
      headers['Cache-Control'] += `, stale-while-revalidate=${config.staleWhileRevalidate}`;
    }

    if (config.etag) {
      headers['ETag'] = config.etag;
    }

    if (config.vary) {
      headers['Vary'] = config.vary.join(', ');
    }

    return headers;
  }
}
```

### Database Cache Integration

```typescript
class DatabaseCacheIntegration {
  private queryCache: QueryCacheService;
  private connectionPool: ConnectionPool;

  async executeWithCache<T>(
    query: string,
    params: unknown[],
    options: QueryCacheOptions
  ): Promise<T> {
    const cacheableQuery: CacheableQuery = {
      sql: query,
      params,
      tables: options.tables,
      ttl: options.ttl
    };

    // Check cache first
    const cached = await this.queryCache.getCachedQuery<T>(cacheableQuery);
    if (cached !== null) {
      return cached;
    }

    // Execute query
    const result = await this.connectionPool.query<T>(query, params);

    // Cache result
    await this.queryCache.cacheQuery(cacheableQuery, result);

    return result;
  }

  async invalidateOnTableChange(tableName: string): Promise<void> {
    await this.queryCache.invalidateByTable(tableName);
  }
}
```

## Security Considerations

### Cache Security Best Practices

```typescript
class SecureCacheManager {
  private cache: CacheManagerService;
  private encryptionService: EncryptionService;

  async setSecure<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    // Encrypt sensitive data before caching
    const encrypted = await this.encryptionService.encrypt(JSON.stringify(value));
    await this.cache.set(key, encrypted, options);
  }

  async getSecure<T>(key: string): Promise<T | null> {
    const encrypted = await this.cache.get<string>(key);
    if (!encrypted) return null;
    
    const decrypted = await this.encryptionService.decrypt(encrypted);
    return JSON.parse(decrypted) as T;
  }

  // Prevent cache poisoning
  validateCacheKey(key: string): boolean {
    const validKeyPattern = /^[a-zA-Z0-9:_-]+$/;
    return validKeyPattern.test(key) && key.length <= 250;
  }

  // Sanitize cached data
  sanitizeCacheValue<T>(value: T): T {
    if (typeof value === 'string') {
      return this.sanitizeString(value) as unknown as T;
    }
    return value;
  }
}
```

### Access Control for Cache

```typescript
interface CacheAccessControl {
  canRead(userId: string, key: string): Promise<boolean>;
  canWrite(userId: string, key: string): Promise<boolean>;
  canInvalidate(userId: string, pattern: string): Promise<boolean>;
}

class RBACCacheAccessControl implements CacheAccessControl {
  private rbacService: RBACService;

  async canRead(userId: string, key: string): Promise<boolean> {
    const resource = this.extractResource(key);
    return this.rbacService.hasPermission(userId, resource, 'read');
  }

  async canWrite(userId: string, key: string): Promise<boolean> {
    const resource = this.extractResource(key);
    return this.rbacService.hasPermission(userId, resource, 'write');
  }

  async canInvalidate(userId: string, pattern: string): Promise<boolean> {
    return this.rbacService.hasPermission(userId, 'cache', 'admin');
  }
}
```

## Testing Considerations

### Cache Testing Patterns

```typescript
describe('Cache Manager Tests', () => {
  let cacheManager: CacheManagerService;

  beforeEach(() => {
    cacheManager = new RedisCacheManager({
      connection: { host: 'localhost', port: 6379 },
      prefix: 'test:'
    });
  });

  afterEach(async () => {
    await cacheManager.clear();
  });

  it('should store and retrieve values', async () => {
    const key = 'test-key';
    const value = { name: 'test', count: 42 };

    await cacheManager.set(key, value);
    const retrieved = await cacheManager.get(key);

    expect(retrieved).toEqual(value);
  });

  it('should respect TTL', async () => {
    const key = 'ttl-test';
    const value = 'expires-soon';

    await cacheManager.set(key, value, { ttl: 1 });
    
    // Value should exist immediately
    expect(await cacheManager.get(key)).toBe(value);
    
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Value should be gone
    expect(await cacheManager.get(key)).toBeNull();
  });

  it('should handle cache miss gracefully', async () => {
    const result = await cacheManager.get('non-existent-key');
    expect(result).toBeNull();
  });

  it('should invalidate by pattern', async () => {
    await cacheManager.set('user:1:profile', { name: 'User 1' });
    await cacheManager.set('user:2:profile', { name: 'User 2' });
    await cacheManager.set('product:1', { name: 'Product 1' });

    await cacheManager.deleteByPattern('user:*');

    expect(await cacheManager.get('user:1:profile')).toBeNull();
    expect(await cacheManager.get('user:2:profile')).toBeNull();
    expect(await cacheManager.get('product:1')).not.toBeNull();
  });
});
```

## Configuration Examples

### Redis Cluster Configuration

```typescript
const redisClusterConfig: RedisClusterConfig = {
  nodes: [
    { host: 'redis-1.example.com', port: 6379 },
    { host: 'redis-2.example.com', port: 6379 },
    { host: 'redis-3.example.com', port: 6379 }
  ],
  options: {
    scaleReads: 'slave',
    maxRedirections: 16,
    retryDelayOnFailover: 100,
    retryDelayOnClusterDown: 100
  },
  defaultTtl: 3600,
  prefix: 'app:cache:'
};
```

### Multi-Layer Cache Configuration

```typescript
const multiLayerConfig: MultiLayerCacheConfig = {
  layers: [
    {
      id: 'memory',
      type: CacheLayerType.MEMORY,
      priority: 1,
      config: {
        maxSize: 1000,
        ttl: 60,
        evictionPolicy: EvictionPolicy.LRU
      }
    },
    {
      id: 'redis',
      type: CacheLayerType.REDIS,
      priority: 2,
      config: {
        ttl: 3600,
        readThrough: true,
        writeThrough: true
      }
    }
  ],
  defaultTtl: 300,
  warmOnStart: true
};
```
