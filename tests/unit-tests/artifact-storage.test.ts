import { describe, expect, it } from 'vitest';
import { ArtifactStorage } from '../../src/memory/artifact-storage';

describe('ArtifactStorage', () => {
  it('stores versioned content-addressable artifacts with metadata indexes', async () => {
    const storage = new ArtifactStorage();
    const id = await storage.store('export const ok = true;', {
      name: 'example.ts',
      type: 'code',
      creator: 'test',
      version: '1.0.0',
      tags: ['runtime'],
    });

    await expect(storage.retrieve(id)).resolves.toMatchObject({
      id,
      metadata: {
        name: 'example.ts',
        type: 'code',
        version: '1.0.0',
        tags: ['runtime'],
      },
    });
    await expect(storage.listByType('code')).resolves.toHaveLength(1);
    await expect(storage.listByTag('runtime')).resolves.toHaveLength(1);
  });

  it('removes deleted artifacts from metadata indexes', async () => {
    const storage = new ArtifactStorage();
    const id = await storage.store('hello', {
      name: 'note.txt',
      type: 'documentation',
      creator: 'test',
      tags: ['docs'],
    });

    await expect(storage.delete(id)).resolves.toBe(true);
    await expect(storage.listByType('documentation')).resolves.toHaveLength(0);
    await expect(storage.listByTag('docs')).resolves.toHaveLength(0);
  });
});
