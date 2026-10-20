export function readTaskContract(filename: string): unknown;
export function writeTaskContract(filename: string, report: object, options?: { maxBytes?: number }): void;
export const MAX_BYTES: number;
export function pruneTaskContractShards(filename: string): void;
