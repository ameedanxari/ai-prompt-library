"""Canonical Python reader for legacy contracts and versioned shard manifests."""
import hashlib
import json
from pathlib import Path
import re

MAX_BYTES = 8 * 1024 * 1024
FORMAT = "task-contract-shards/v1"
MARKER = "$taskContractShards"


def load_task_contract(filename):
    filename = Path(filename)
    with filename.open(encoding="utf-8") as handle:
        report = json.load(handle)
    if "storageFormat" not in report:
        return report
    if report["storageFormat"] != FORMAT:
        raise ValueError("task contract: unsupported storage format")
    base = filename.resolve().parent
    active = set()

    def resolve(value):
        if isinstance(value, list):
            return [resolve(item) for item in value]
        if not isinstance(value, dict):
            return value
        if MARKER not in value:
            return {key: resolve(item) for key, item in value.items()}
        descriptor = value[MARKER]
        if (len(value) != 1 or not isinstance(descriptor, dict)
                or descriptor.get("kind") not in {"array", "string"}
                or not isinstance(descriptor.get("shards"), list)):
            raise ValueError("task contract: invalid shard descriptor")
        parts = []
        for entry in descriptor["shards"]:
            if (not isinstance(entry, dict)
                    or not isinstance(entry.get("path"), str)
                    or not re.fullmatch(r"task-contract-shards/[a-f0-9]{64}\.json\.shard", entry["path"])
                    or type(entry.get("bytes")) is not int
                    or not 0 < entry["bytes"] <= MAX_BYTES
                    or not isinstance(entry.get("sha256"), str)
                    or not re.fullmatch(r"[a-f0-9]{64}", entry["sha256"])):
                raise ValueError("task contract: invalid shard reference")
            shard = (base / entry["path"]).resolve(strict=True)
            if not shard.is_relative_to(base) or shard in active:
                raise ValueError("task contract: unsafe or cyclic shard reference")
            if shard.stat().st_size != entry["bytes"]:
                raise ValueError(f"task contract: shard size mismatch: {entry['path']}")
            data = shard.read_bytes()
            if hashlib.sha256(data).hexdigest() != entry["sha256"]:
                raise ValueError(f"task contract: shard digest mismatch: {entry['path']}")
            active.add(shard)
            try:
                part = resolve(json.loads(data))
                if descriptor["kind"] == "array":
                    if (not isinstance(part, list) or type(entry.get("count")) is not int
                            or len(part) != entry["count"]):
                        raise ValueError(f"task contract: shard type/count mismatch: {entry['path']}")
                    parts.extend(part)
                elif not isinstance(part, str):
                    raise ValueError(f"task contract: shard type/count mismatch: {entry['path']}")
                else:
                    parts.append(part)
            finally:
                active.remove(shard)
        return parts if descriptor["kind"] == "array" else "".join(parts)

    return resolve({key: value for key, value in report.items() if key != "storageFormat"})
