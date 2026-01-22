import { existsSync, mkdirSync, renameSync, readdirSync, lstatSync } from 'fs';
import { join, basename } from 'path';
import { OUTPUT_STRUCTURE } from './output-directory-manager.js';

/**
 * Archive Manager
 * 
 * Manages archiving of past feature development results to clear the workspace for new features.
 * Moves everything from prompts/outputs/ to prompts/archive/PROJECT_NAME_TIMESTAMP/
 */

export interface ArchiveResult {
    success: boolean;
    archivePath?: string;
    error?: string;
    filesMoved: number;
}

export class ArchiveManager {
    private baseOutputsDir: string;
    private archiveParentDir: string;

    constructor(basePath: string = '') {
        this.baseOutputsDir = join(basePath, OUTPUT_STRUCTURE.base);
        this.archiveParentDir = join(basePath, 'prompts/archive');
    }

    /**
     * Archive the current outputs
     * @param projectName Name of the project to include in the archive folder name
     */
    archiveOutputs(projectName: string = 'last-feature'): ArchiveResult {
        if (!existsSync(this.baseOutputsDir)) {
            return { success: true, filesMoved: 0, error: 'Outputs directory does not exist' };
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archiveName = `${projectName}_${timestamp}`;
        const archivePath = join(this.archiveParentDir, archiveName);

        try {
            // Ensure archive parent exists
            if (!existsSync(this.archiveParentDir)) {
                mkdirSync(this.archiveParentDir, { recursive: true });
            }

            // Create specific archive directory
            mkdirSync(archivePath, { recursive: true });

            const files = readdirSync(this.baseOutputsDir);
            let filesMoved = 0;

            for (const file of files) {
                if (file === '.' || file === '..') continue;

                const oldPath = join(this.baseOutputsDir, file);
                const newPath = join(archivePath, file);

                renameSync(oldPath, newPath);
                filesMoved++;
            }

            return {
                success: true,
                archivePath,
                filesMoved
            };
        } catch (error) {
            return {
                success: false,
                filesMoved: 0,
                error: error instanceof Error ? error.message : 'Unknown error during archiving'
            };
        }
    }
}
