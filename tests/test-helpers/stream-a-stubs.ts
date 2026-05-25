/**
 * Stream A test helpers.
 *
 * After Stream A landed, `validate-instantiation.sh` requires four
 * upstream-planning artifacts to coexist with tasks-*.md / remediation-*.md:
 *   - product-vision.md
 *   - architecture.md
 *   - release-plan.md
 *   - store-submission.md
 *
 * Existing tests pre-date Stream A and only fixture features-*.md +
 * tasks-*.md + external-accounts.md. This helper writes the four
 * required stubs so those tests can keep validating what they
 * actually care about (the specific gate behaviour) without churning
 * every fixture by hand.
 *
 * The stubs are intentionally minimal — they exist purely to satisfy
 * the required-companion check. Tests that validate Stream A schema
 * specifically should write their own richer fixtures.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Write the four Stream A required-companion stubs into `sandbox`, and
 * back-fill `Phase: mvp` on any tasks-*.md / remediation-*.md that
 * exist there without one. Idempotent — safe to call multiple times.
 *
 * The Phase back-fill exists so existing tests that fixture tasks
 * without a Phase field (because they were written before Stream B)
 * don't need to learn the field. Tests that exercise Phase semantics
 * specifically should set the field by hand on their own fixtures.
 */
export function writeStreamAStubs(sandbox: string): void {
  fs.writeFileSync(
    path.join(sandbox, 'product-vision.md'),
    '# Product Vision\n\n## Identity\n- One-liner: stub for test fixture.\n',
  );
  fs.writeFileSync(
    path.join(sandbox, 'architecture.md'),
    '# Architecture\n\n## Layer map\nstub for test fixture.\n',
  );
  fs.writeFileSync(
    path.join(sandbox, 'release-plan.md'),
    '# Release Plan\n\n## Stage map\nstub for test fixture.\n',
  );
  fs.writeFileSync(
    path.join(sandbox, 'store-submission.md'),
    '# Store Submission\n\nDistribution: stub for test fixture.\n',
  );
  // ux-flows.md is required whenever ui-reference-source-map.md
  // exists. Writing it unconditionally is harmless because the
  // validator only checks for it conditionally.
  fs.writeFileSync(
    path.join(sandbox, 'ux-flows.md'),
    '# UX Flows\n\n## Screen map\nstub for test fixture.\n',
  );
  // Stream B companion: delivery-order.md. A minimal stub satisfies
  // the required-companion check; tests that exercise delivery-order
  // semantics should write their own richer manifest.
  fs.writeFileSync(
    path.join(sandbox, 'delivery-order.md'),
    [
      '---',
      'generated_at: 2026-01-01T00:00:00Z',
      'total_tasks: 0',
      'phase_counts:',
      '  foundation: 0',
      '  mvp: 0',
      '  expand: 0',
      '  polish: 0',
      'phase_inversions: []',
      'cycle_tasks: []',
      'missing_phase_field: []',
      '---',
      '',
      '# Delivery Order',
      '',
      '_Stub for test fixture._',
      '',
    ].join('\n'),
  );

  // Back-fill Phase on existing tasks-*.md / remediation-*.md.
  for (const fn of fs.readdirSync(sandbox)) {
    if (!fn.endsWith('.md')) continue;
    if (!fn.startsWith('tasks-') && !fn.startsWith('remediation-')) continue;
    const full = path.join(sandbox, fn);
    const body = fs.readFileSync(full, 'utf8');
    if (/\*\*Phase:\*\*/.test(body)) continue;
    const phaseLine = '- **Phase:** mvp\n';
    fs.writeFileSync(full, body.endsWith('\n') ? body + phaseLine : body + '\n' + phaseLine);
  }
}
