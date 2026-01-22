import { ArchiveManager } from './archive-manager.js';

const projectName = process.argv[2] || 'last-feature';
const archiveManager = new ArchiveManager();

console.log(`Archiving outputs for project: ${projectName}...`);

const result = archiveManager.archiveOutputs(projectName);

if (result.success) {
    console.log(`Successfully archived ${result.filesMoved} files to ${result.archivePath}`);
} else {
    console.error(`Archiving failed: ${result.error}`);
    process.exit(1);
}
