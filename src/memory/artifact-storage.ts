/**
 * Artifact Storage Service
 * 
 * Implements content-addressable storage for engineering artifacts with versioning
 * and metadata support. Artifacts include code snippets, documentation, test results,
 * and intermediate representations used by the Agentic Engineering Runtime.
 * 
 * Validates: Requirements 5.4, 14.4
 */

import * as crypto from 'crypto';

/**
 * Unique identifier for an artifact (Hash-based)
 */
export type ArtifactId = string;

/**
 * Types of artifacts supported by the system
 */
export type ArtifactType = 
  | 'code' 
  | 'documentation' 
  | 'test-result' 
  | 'specification' 
  | 'design-model' 
  | 'execution-log' 
  | 'plan' 
  | 'other';

/**
 * Metadata associated with an artifact
 */
export interface ArtifactMetadata {
  name: string;
  type: ArtifactType;
  creator: string;
  createdAt: Date;
  version: string;
  tags: string[];
  parentId?: ArtifactId;
  dependencies: ArtifactId[];
  checksum: string;
  size: number;
  mimeType: string;
  customMetadata?: Record<string, any>;
}

/**
 * Full artifact structure including content and metadata
 */
export interface Artifact {
  id: ArtifactId;
  content: Buffer | string;
  metadata: ArtifactMetadata;
}

/**
 * Options for storing an artifact
 */
export interface StoreOptions {
  name: string;
  type: ArtifactType;
  creator: string;
  version?: string;
  tags?: string[];
  parentId?: ArtifactId;
  dependencies?: ArtifactId[];
  customMetadata?: Record<string, any>;
  mimeType?: string;
}

export class ArtifactStorage {
  private artifacts: Map<ArtifactId, Artifact> = new Map();
  private metadataIndex: Map<string, ArtifactId[]> = new Map(); // Index by tag, type, etc.

  /**
   * Stores an artifact and returns its unique ID
   */
  public async store(content: Buffer | string, options: StoreOptions): Promise<ArtifactId> {
    const checksum = this.calculateChecksum(content);
    const id = this.generateId(checksum, options.name, options.version || '1.0.0');

    const artifact: Artifact = {
      id,
      content,
      metadata: {
        name: options.name,
        type: options.type,
        creator: options.creator,
        createdAt: new Date(),
        version: options.version || '1.0.0',
        tags: options.tags || [],
        parentId: options.parentId,
        dependencies: options.dependencies || [],
        checksum,
        size: content.length,
        mimeType: options.mimeType || (typeof content === 'string' ? 'text/plain' : 'application/octet-stream'),
        customMetadata: options.customMetadata
      }
    };

    this.artifacts.set(id, artifact);
    this.updateIndices(artifact);

    return id;
  }

  /**
   * Retrieves an artifact by its ID
   */
  public async retrieve(id: ArtifactId): Promise<Artifact | undefined> {
    return this.artifacts.get(id);
  }

  /**
   * Retrieves artifact metadata by its ID
   */
  public async getMetadata(id: ArtifactId): Promise<ArtifactMetadata | undefined> {
    return this.artifacts.get(id)?.metadata;
  }

  /**
   * Lists artifacts by type
   */
  public async listByType(type: ArtifactType): Promise<ArtifactMetadata[]> {
    return Array.from(this.artifacts.values())
      .filter(a => a.metadata.type === type)
      .map(a => a.metadata);
  }

  /**
   * Lists artifacts by tag
   */
  public async listByTag(tag: string): Promise<ArtifactMetadata[]> {
    return Array.from(this.artifacts.values())
      .filter(a => a.metadata.tags.includes(tag))
      .map(a => a.metadata);
  }

  /**
   * Deletes an artifact
   */
  public async delete(id: ArtifactId): Promise<boolean> {
    const artifact = this.artifacts.get(id);
    if (!artifact) {
      return false;
    }

    this.artifacts.delete(id);
    this.removeFromIndex(`type:${artifact.metadata.type}`, id);
    for (const tag of artifact.metadata.tags) {
      this.removeFromIndex(`tag:${tag}`, id);
    }
    return true;
  }

  /**
   * Calculates SHA-256 checksum for content
   */
  private calculateChecksum(content: Buffer | string): string {
    const hash = crypto.createHash('sha256');
    hash.update(content);
    return hash.digest('hex');
  }

  /**
   * Generates a unique ID for the artifact
   */
  private generateId(checksum: string, name: string, version: string): ArtifactId {
    const data = `${name}:${version}:${checksum}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Updates search indices for the artifact
   */
  private updateIndices(artifact: Artifact): void {
    // Basic indexing for type
    const typeKey = `type:${artifact.metadata.type}`;
    if (!this.metadataIndex.has(typeKey)) {
      this.metadataIndex.set(typeKey, []);
    }
    this.metadataIndex.get(typeKey)!.push(artifact.id);

    // Indexing for tags
    for (const tag of artifact.metadata.tags) {
      const tagKey = `tag:${tag}`;
      if (!this.metadataIndex.has(tagKey)) {
        this.metadataIndex.set(tagKey, []);
      }
      this.metadataIndex.get(tagKey)!.push(artifact.id);
    }
  }

  private removeFromIndex(key: string, id: ArtifactId): void {
    const values = this.metadataIndex.get(key);
    if (!values) {
      return;
    }
    const filtered = values.filter(value => value !== id);
    if (filtered.length === 0) {
      this.metadataIndex.delete(key);
    } else {
      this.metadataIndex.set(key, filtered);
    }
  }

  /**
   * Clears the storage (for testing)
   */
  public clear(): void {
    this.artifacts.clear();
    this.metadataIndex.clear();
  }
}
