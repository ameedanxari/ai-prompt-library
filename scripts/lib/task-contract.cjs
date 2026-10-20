/** Canonical Node storage adapter. Wire manifests retain schemaVersion and summary;
 * readTaskContract returns the unchanged logical report for either storage format. */
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const FORMAT = 'task-contract-shards/v1';
const MAX_BYTES = 8 * 1024 * 1024;
const CHUNK_BYTES = 4 * 1024 * 1024;
const marker = '$taskContractShards';
const encode = (value) => `${JSON.stringify(value, null, 2)}\n`;
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

function writeTaskContract(filename, report, options = {}) {
  const limit = options.maxBytes ?? MAX_BYTES;
  if (!Number.isInteger(limit) || limit < 1024 || limit > MAX_BYTES) {
    throw new Error('task contract: maxBytes must be between 1024 and 8388608');
  }
  const raw = encode(report);
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  if (Buffer.byteLength(raw) <= limit) {
    fs.writeFileSync(filename, raw);
    return;
  }
  const chunkLimit = Math.min(CHUNK_BYTES, Math.floor(limit / 2));
  const directory = path.join(path.dirname(filename), 'task-contract-shards');
  fs.mkdirSync(directory, { recursive: true });
  const put = (value) => {
    const bytes = Buffer.from(encode(value));
    if (bytes.length > limit) throw new Error('task contract: shard exceeds byte limit');
    const sha256 = hash(bytes);
    const name = `${sha256}.json.shard`;
    const destination = path.join(directory, name);
    // Content-addressed immutable files are installed before the manifest. A
    // previous manifest remains usable if generation or atomic publication fails.
    if (!fs.existsSync(destination) || !fs.readFileSync(destination).equals(bytes)) {
      const temporary = `${destination}.${process.pid}.tmp`;
      try {
        fs.writeFileSync(temporary, bytes);
        fs.renameSync(temporary, destination);
      } finally {
        if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
      }
    }
    return { path: `task-contract-shards/${name}`, bytes: bytes.length, sha256 };
  };
  const partition = (value, force = false) => {
    if (!force && Buffer.byteLength(encode(value)) <= chunkLimit) return value;
    if (Array.isArray(value)) {
      const shards = [];
      let group = [];
      let groupBytes = 3;
      for (const original of value) {
        const item = partition(original);
        const itemBytes = Buffer.byteLength(encode(item)) + 4;
        if (group.length && groupBytes + itemBytes > chunkLimit) {
          shards.push({ ...put(group), count: group.length });
          group = [];
          groupBytes = 3;
        }
        group.push(item);
        groupBytes += itemBytes;
      }
      if (group.length) shards.push({ ...put(group), count: group.length });
      return { [marker]: { kind: 'array', shards } };
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, partition(item, force)]));
    }
    if (typeof value === 'string') {
      const shards = [];
      let group = '';
      let bytes = 3;
      for (const character of value) {
        const size = Buffer.byteLength(JSON.stringify(character)) - 2;
        if (bytes + size > chunkLimit) {
          shards.push(put(group));
          group = '';
          bytes = 3;
        }
        group += character;
        bytes += size;
      }
      if (group) shards.push(put(group));
      return { [marker]: { kind: 'string', shards } };
    }
    return value;
  };
  // Externalize root collections; partition nested large graph collections or
  // unusually large task fields without dropping any data or changing ordering.
  const manifest = { storageFormat: FORMAT, ...Object.fromEntries(Object.entries(report).map(
    ([key, value]) => [key, partition(value, Array.isArray(value))],
  )) };
  const manifestBytes = encode(manifest);
  if (Buffer.byteLength(manifestBytes) > limit) throw new Error('task contract: manifest exceeds byte limit');
  fs.writeFileSync(filename, manifestBytes);
}

function readTaskContract(filename) {
  const report = JSON.parse(fs.readFileSync(filename, 'utf8'));
  if (!Object.hasOwn(report, 'storageFormat')) return report;
  if (report.storageFormat !== FORMAT) throw new Error('task contract: unsupported storage format');
  const base = path.dirname(fs.realpathSync(filename));
  const active = new Set();
  const resolve = (value) => {
    if (Array.isArray(value)) return value.map(resolve);
    if (!value || typeof value !== 'object') return value;
    if (Object.hasOwn(value, marker)) {
      const descriptor = value[marker];
      if (Object.keys(value).length !== 1 || !descriptor || !['array', 'string'].includes(descriptor.kind)
          || !Array.isArray(descriptor.shards)) throw new Error('task contract: invalid shard descriptor');
      const parts = descriptor.shards.map((entry) => {
        if (!entry || typeof entry.path !== 'string' || !/^task-contract-shards\/[a-f0-9]{64}\.json\.shard$/.test(entry.path)
            || !Number.isInteger(entry.bytes) || entry.bytes < 1 || entry.bytes > MAX_BYTES
            || !/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error('task contract: invalid shard reference');
        const shardPath = fs.realpathSync(path.join(base, entry.path));
        if (!shardPath.startsWith(`${base}${path.sep}`) || active.has(shardPath)) {
          throw new Error('task contract: unsafe or cyclic shard reference');
        }
        const size = fs.statSync(shardPath).size;
        if (size !== entry.bytes) throw new Error(`task contract: shard size mismatch: ${entry.path}`);
        const bytes = fs.readFileSync(shardPath);
        if (hash(bytes) !== entry.sha256) throw new Error(`task contract: shard digest mismatch: ${entry.path}`);
        active.add(shardPath);
        try {
          const part = resolve(JSON.parse(bytes.toString('utf8')));
          if (descriptor.kind === 'array' ? !Array.isArray(part) || part.length !== entry.count : typeof part !== 'string') {
            throw new Error(`task contract: shard type/count mismatch: ${entry.path}`);
          }
          return part;
        } finally { active.delete(shardPath); }
      });
      return descriptor.kind === 'array' ? parts.flat() : parts.join('');
    }
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolve(item)]));
  };
  const { storageFormat, ...logical } = report;
  return resolve(logical);
}
/** Prune only after the new index has been successfully published. Preserve
 * shards referenced by other output indexes in the same directory as well. */
function pruneTaskContractShards(filename) {
  const base = path.dirname(filename);
  const directory = path.join(base, 'task-contract-shards');
  if (!fs.existsSync(directory)) return;
  const retained = new Set();
  const collect = (value) => {
    if (!value || typeof value !== 'object') return;
    if (Object.hasOwn(value, marker)) {
      for (const entry of value[marker].shards) {
        if (retained.has(entry.path)) continue;
        retained.add(entry.path);
        collect(JSON.parse(fs.readFileSync(path.join(base, entry.path), 'utf8')));
      }
    } else {
      Object.values(value).forEach(collect);
    }
  };
  for (const name of fs.readdirSync(base)) {
    const candidate = path.join(base, name);
    if ((!name.endsWith('.json') && path.resolve(candidate) !== path.resolve(filename)) || !fs.statSync(candidate).isFile()) continue;
    let value;
    try { value = JSON.parse(fs.readFileSync(candidate, 'utf8')); } catch { continue; }
    if (value?.storageFormat !== FORMAT) continue;
    readTaskContract(candidate); // Validate all retained indexes before deleting anything.
    collect(value);
  }
  for (const name of fs.readdirSync(directory)) {
    if (/^[a-f0-9]{64}\.json\.shard$/.test(name) && !retained.has(`task-contract-shards/${name}`)) {
      fs.unlinkSync(path.join(directory, name));
    }
  }
  if (fs.readdirSync(directory).length === 0) fs.rmdirSync(directory);
}
module.exports = { readTaskContract, writeTaskContract, pruneTaskContractShards, MAX_BYTES };
