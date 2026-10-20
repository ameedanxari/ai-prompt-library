import storage from '../../scripts/lib/task-contract.cjs';
import type { TaskContractReport } from './task-contract-report.js';

/** Read a legacy report or a versioned shard manifest as one logical contract. */
export function readTaskContract(filename: string): TaskContractReport {
  return storage.readTaskContract(filename) as TaskContractReport;
}

/** Write legacy JSON when small; otherwise write bounded shards and an index. */
export function writeTaskContract(
  filename: string,
  report: TaskContractReport,
  options?: { maxBytes?: number },
): void {
  storage.writeTaskContract(filename, report, options);
}

/** Remove obsolete shards only after publishing the replacement index. */
export function pruneTaskContractShards(filename: string): void {
  storage.pruneTaskContractShards(filename);
}
