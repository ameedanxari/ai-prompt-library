import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
import { ArchiveManager } from '../src/archive-manager.js';

describe('ArchiveManager', () => {
    const testRoot = join(process.cwd(), 'test-workspace-archive');
    const outputsDir = join(testRoot, 'prompts/outputs');
    const archiveDir = join(testRoot, 'prompts/archive');

    beforeEach(() => {
        if (existsSync(testRoot)) {
            rmSync(testRoot, { recursive: true, force: true });
        }
        mkdirSync(outputsDir, { recursive: true });
        writeFileSync(join(outputsDir, 'test-file.txt'), 'test content');
        mkdirSync(join(outputsDir, 'specifications'), { recursive: true });
        writeFileSync(join(outputsDir, 'specifications/spec.md'), 'spec content');
    });

    afterEach(() => {
        if (existsSync(testRoot)) {
            rmSync(testRoot, { recursive: true, force: true });
        }
    });

    it('should move all files from outputs to archive', () => {
        const archiveManager = new ArchiveManager(testRoot);
        const result = archiveManager.archiveOutputs('test-project');

        expect(result.success).toBe(true);
        expect(result.filesMoved).toBe(2); // test-file.txt and specifications directory
        expect(existsSync(result.archivePath!)).toBe(true);
        expect(existsSync(join(result.archivePath!, 'test-file.txt'))).toBe(true);
        expect(existsSync(join(result.archivePath!, 'specifications/spec.md'))).toBe(true);

        // Outputs directory should be empty
        const remainingFiles = readdirSync(outputsDir);
        expect(remainingFiles.length).toBe(0);
    });

    it('should include timestamp in archive path', () => {
        const archiveManager = new ArchiveManager(testRoot);
        const result = archiveManager.archiveOutputs('my-project');

        expect(result.archivePath).toContain('my-project_');
        // Basic check for timestamp format (contains dashes from ISO string replacement)
        expect(result.archivePath).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should handle non-existent outputs directory gracefully', () => {
        rmSync(outputsDir, { recursive: true, force: true });
        const archiveManager = new ArchiveManager(testRoot);
        const result = archiveManager.archiveOutputs();

        expect(result.success).toBe(true);
        expect(result.filesMoved).toBe(0);
        expect(result.error).toBe('Outputs directory does not exist');
    });
});
