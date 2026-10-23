import * as path from 'node:path';
import { buildTaskContractReport } from '../task-contract/task-contract-report.js';
import { parsePlanTaskDirectory } from '../task-contract/task-parser.js';
import type { DeliveryScope } from '../delivery/types.js';

/** Derived reports have no independent authority. Regeneration and byte-for-byte
 * comparison let the budget exclude them without trusting a manifest exemption. */
export function deliveryProjections(scope: DeliveryScope): Map<string, string> {
  const contract = buildTaskContractReport(parsePlanTaskDirectory(scope.runDirectory), { sourceDirectory: scope.runDirectory });
  const units = new Map(contract.units.map((unit) => [unit.canonicalId, unit]));
  const ledger = ['# Active slice path ledger', '', '| Unit | Change | Path |', '| --- | --- | --- |'];
  for (const unit of contract.units) {
    for (const file of unit.filePaths) ledger.push(`| ${unit.canonicalId} | ${unit.changeType} | ${file} |`);
  }
  const order = ['# Active slice delivery order', '', 'Derived from unit dependencies. Accepted outcome prerequisites are enforced by the delivery gate.', ''];
  for (const id of contract.graphs.taskUnits.topologicalOrder) order.push(`- ${id}: ${units.get(id)?.title ?? ''}`);
  return new Map([
    [path.join(scope.runDirectory, 'task-contract.json'), JSON.stringify(contract, null, 2) + '\n'],
    [path.join(scope.runDirectory, 'path-ledger.md'), ledger.join('\n') + '\n'],
    [path.join(scope.runDirectory, 'delivery-order.md'), order.join('\n') + '\n'],
  ]);
}
