/**
 * Artifact Migrator
 *
 * Migrates artifacts from the current prompt-based system to
 * the new skill-based content-addressable storage.
 *
 * Validates: Requirements 12.3, 12.4
 */

import { ArtifactStorage, StoreOptions } from '../memory/artifact-storage';

/**
 * Migration result for a single artifact
 */
export interface MigrationRecord {
  originalPath: string;
  newId: string;
  success: boolean;
  error?: string;
}

export class ArtifactMigrator {
  constructor(private storage: ArtifactStorage) {}

  /**
   * Migrates a single file into artifact storage
   */
  public async migrateFile(filePath: string, content: string, options: Partial<StoreOptions> & { name: string }): Promise<MigrationRecord> {
    try {
      const id = await this.storage.store(content, {
        name: options.name,
        type: options.type || 'other',
        creator: options.creator || 'migration-tool',
        version: options.version || '1.0.0',
        tags: [...(options.tags || []), 'migrated'],
      });

      return { originalPath: filePath, newId: id, success: true };
    } catch (error: any) {
      return { originalPath: filePath, newId: '', success: false, error: error.message };
    }
  }

  /**
   * Batch migrates multiple files
   */
  public async migrateAll(files: { path: string; content: string; name: string }[]): Promise<MigrationRecord[]> {
    const results: MigrationRecord[] = [];
    for (const file of files) {
      results.push(await this.migrateFile(file.path, file.content, { name: file.name }));
    }
    return results;
  }

  /**
   * Generates a migration report
   */
  public generateReport(records: MigrationRecord[]): string {
    const success = records.filter(r => r.success).length;
    const failed = records.filter(r => !r.success).length;

    let report = `# Migration Report\n\n`;
    report += `- **Total:** ${records.length}\n`;
    report += `- **Success:** ${success}\n`;
    report += `- **Failed:** ${failed}\n\n`;

    if (failed > 0) {
      report += '## Failures\n';
      for (const r of records.filter(r => !r.success)) {
        report += `- ${r.originalPath}: ${r.error}\n`;
      }
    }

    return report;
  }
}
