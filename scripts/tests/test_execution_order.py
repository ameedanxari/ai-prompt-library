"""Regression tests for the archive-aware execution order validator."""

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


VALIDATOR = Path(__file__).resolve().parents[1] / "validate-execution-order.sh"


def done(task):
    return f"### `{task}` — done\n"


def entry_text(entry):
    if isinstance(entry, str):
        return done(entry)
    task, records = entry
    return done(task) + "".join(
        "```execution-status-record\n" + json.dumps(record) + "\n```\n"
        for record in records
    )


class ExecutionOrderTests(unittest.TestCase):
    def setUp(self):
        self.sandbox = tempfile.TemporaryDirectory(prefix="execution-order-")
        self.addCleanup(self.sandbox.cleanup)
        self.root = Path(self.sandbox.name)
        self.plan = self.root / "prompts" / "outputs" / "current"
        self.plan.mkdir(parents=True)

    def validate(self, dependencies, entries, archives=(), contract=None):
        graph = {"nodes": [
            {"id": task, "dependencies": deps}
            for task, deps in dependencies.items()
        ]}
        contract_path = self.plan / "task-contract.json"
        if contract is not None:
            graph["source_contract"] = str(contract_path)
            if contract != "missing":
                contract_path.write_text(
                    contract if isinstance(contract, str) else json.dumps({"units": contract}),
                    encoding="utf-8",
                )
        (self.plan / "task-graph.json").write_text(json.dumps(graph), encoding="utf-8")
        archive_list = "".join(f"  - {name}\n" for name, _ in archives)
        frontmatter = f"---\njournal_archives:\n{archive_list}---\n" if archives else ""
        main_log = self.plan / "execution-log.md"
        main_log.write_text(frontmatter + "".join(map(entry_text, entries)), encoding="utf-8")
        for name, archive_entries in archives:
            archive = self.root / name
            archive.parent.mkdir(parents=True, exist_ok=True)
            archive.write_text("---\nsession_id: old\n---\n" + "".join(map(entry_text, archive_entries)), encoding="utf-8")
        before = {path: path.read_bytes() for path in [main_log, self.plan / "task-graph.json"]}
        if contract_path.exists():
            before[contract_path] = contract_path.read_bytes()
        before.update({self.root / name: (self.root / name).read_bytes() for name, _ in archives})
        result = subprocess.run(
            ["bash", str(VALIDATOR), str(self.plan)],
            cwd=self.root, capture_output=True, text=True, check=False,
        )
        self.assertEqual(before, {path: path.read_bytes() for path in before})
        return result

    def test_later_prerequisite_reverification_does_not_create_inversion(self):
        result = self.validate(
            {"tasks-child.md": ["tasks-parent.md"]},
            ["tasks-parent.md", "tasks-child.md", "tasks-parent.md"],
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("2 logged tasks checked", result.stdout)

    def test_later_child_reverification_does_not_hide_original_inversion(self):
        result = self.validate(
            {"tasks-child.md": ["tasks-parent.md"]},
            ["tasks-child.md", "tasks-parent.md", "tasks-child.md"],
        )
        self.assertEqual(result.returncode, 1)
        self.assertIn("tasks-child.md logged at #1 before dependency tasks-parent.md at #2", result.stdout)

    def test_rotated_entries_precede_main_log_and_reverification(self):
        result = self.validate(
            {"tasks-child.md": ["tasks-parent.md"]},
            ["tasks-parent.md"],
            archives=[
                ("prompts/outputs/archive/execution-log-001.md", ["tasks-parent.md"]),
                ("prompts/outputs/archive/execution-log-002.md", ["tasks-child.md"]),
            ],
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("2 logged tasks checked", result.stdout)

    def test_rotated_original_inversion_still_fails(self):
        result = self.validate(
            {"tasks-child.md": ["tasks-parent.md"]},
            ["tasks-child.md"],
            archives=[
                ("prompts/outputs/archive/execution-log-001.md", ["tasks-child.md"]),
                ("prompts/outputs/archive/execution-log-002.md", ["tasks-parent.md"]),
            ],
        )
        self.assertEqual(result.returncode, 1)
        self.assertIn("tasks-child.md logged at #1 before dependency tasks-parent.md at #2", result.stdout)

    def test_follow_up_unit_uses_its_first_canonical_completion(self):
        child = "tasks-child.md"
        parent = "tasks-parent.md"
        unit = f"{child}#T36"
        result = self.validate(
            {child: [parent]},
            [(child, []), (parent, []), (child, [{"taskId": unit, "status": "done"}])],
            contract=[{"file": child, "canonicalId": unit, "dependencies": [{"file": parent}]}],
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_follow_up_reverification_cannot_hide_early_unit_completion(self):
        child = "tasks-child.md"
        parent = "tasks-parent.md"
        unit = f"{child}#T36"
        result = self.validate(
            {child: [parent]},
            [
                (child, [{"taskId": unit, "status": "done"}]),
                (parent, []),
                (child, [{"taskId": unit, "status": "done", "followUp": True}]),
            ],
            contract=[{"file": child, "canonicalId": unit, "dependencies": [{"file": parent}]}],
        )
        self.assertEqual(result.returncode, 1)
        self.assertIn("tasks-child.md logged at #1 before dependency tasks-parent.md at #2", result.stdout)

    def test_missing_contract_or_unit_record_keeps_strict_file_order(self):
        child = "tasks-child.md"
        parent = "tasks-parent.md"
        unit = f"{child}#T36"
        entries = [(child, []), (parent, []), (child, [])]
        declaration = [{"file": child, "canonicalId": unit, "dependencies": [{"file": parent}]}]
        for contract in ("missing", declaration):
            with self.subTest(contract=contract):
                result = self.validate({child: [parent]}, entries, contract=contract)
                self.assertEqual(result.returncode, 1)
                self.assertIn("tasks-child.md logged at #1 before dependency tasks-parent.md at #2", result.stdout)

    def test_malformed_referenced_contract_fails_closed(self):
        result = self.validate(
            {"tasks-child.md": ["tasks-parent.md"]},
            ["tasks-child.md", "tasks-parent.md"],
            contract="{bad json",
        )
        self.assertEqual(result.returncode, 2)
        self.assertIn("cannot read task contract", result.stderr)


if __name__ == "__main__":
    unittest.main()
