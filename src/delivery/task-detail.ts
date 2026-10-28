import * as path from 'node:path';
import { isPlanTaskFilename, parsePlanTaskFile } from '../task-contract/task-parser.js';

/** Only real parser-owned sections can leave the pending budget. Preambles,
 * auxiliary files and unowned sections always remain counted. */
export function deliveryTaskDetailSections(file: string, content: string): { preamble: string; sections: { id: string; text: string }[] } {
  if (!isPlanTaskFilename(path.basename(file))) return { preamble: content, sections: [] };
  const units = parsePlanTaskFile(path.basename(file), content).units;
  const offsets = [0]; for (const match of content.matchAll(/\r?\n/g)) offsets.push(match.index! + match[0].length);
  const starts = units.map(unit => offsets[unit.lineNumber - 1]);
  return { preamble: content.slice(0, starts[0] ?? content.length), sections: units.map((unit, i) => ({ id: unit.canonicalId, text: content.slice(starts[i], starts[i + 1] ?? content.length) })) };
}

export function pendingDeliveryTaskDetail(file: string, content: string, retiredUnits: ReadonlySet<string>): string {
  const detail = deliveryTaskDetailSections(file, content);
  return detail.preamble + detail.sections.filter(section => !retiredUnits.has(section.id)).map(section => section.text).join('');
}
