/**
 * Mobile gallery-cleanup module depth
 *
 * Guards the field-tested gaps for native storage cleaners: blur scoring,
 * near-duplicate detection, sensitive OCR classification, video duplicate
 * handling, and honest OS storage/memory boundaries.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const read = (p: string): string => fs.readFileSync(path.join(REPO_ROOT, p), 'utf8');

describe('mobile gallery cleanup modules', () => {
  it('iOS on-device ML covers blur, OCR-sensitive media, and video duplicates', () => {
    const body = read('prompts/modules/ai-native/on-device-ml-ios.md');
    expect(body).toMatch(/Blurry \/ Low-Quality Photo Detection/);
    expect(body).toMatch(/blurVariance/);
    expect(body).toMatch(/Sensitive Document \/ OCR Classification/);
    expect(body).toMatch(/VNRecognizeTextRequest/);
    expect(body).toMatch(/Video Duplicate Handling/);
    expect(body).toMatch(/AVAssetImageGenerator/);
  });

  it('Android on-device ML covers near-duplicates, blur, OCR-sensitive media, and video duplicates', () => {
    const body = read('prompts/modules/ai-native/on-device-ml-android.md');
    expect(body).toMatch(/Near-Duplicate Photo Detection/);
    expect(body).toMatch(/VisualFingerprint/);
    expect(body).toMatch(/Blurry \/ Low-Quality Photo Detection/);
    expect(body).toMatch(/PhotoQualityScore/);
    expect(body).toMatch(/Sensitive Document \/ OCR Classification/);
    expect(body).toMatch(/Video Duplicate Handling/);
    expect(body).toMatch(/MediaMetadataRetriever/);
  });

  it('storage cleanup modules forbid system optimizer claims', () => {
    const storage = read('prompts/modules/feature-patterns/native-storage-cleanup.md');
    const capability = read('prompts/modules/technology-stacks/mobile-os-capability-matrix.md');

    expect(storage).toMatch(/storage\s+cleanup,\s+app-owned cache cleanup,\s+and OS settings guidance only/);
    expect(capability).toMatch(/Do not generate system optimizer claims/);
  });

  it('baseline task shapes adapt debug and privacy tasks for local-only native apps', () => {
    const baseline = read('prompts/orchestrators/baseline-task-shapes.md');
    expect(baseline).toMatch(/For local-only native apps, do not invent an\s+endpoint switcher/);
    expect(baseline).toMatch(/native local UI action/);
    expect(baseline).toMatch(/local store \/ file directory \/ app-owned cache location/);
  });
});
