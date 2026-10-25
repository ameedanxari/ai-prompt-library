"""Transactional task commit driver; Markdown parsing belongs to the shared CLI."""
import argparse
import fcntl
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
from task_contract import load_task_contract

ARTIFACTS = ("execution-log.md", "resumption-checkpoint.md", "path-ledger.md",
             "harness-diagnosis.json", "revise-report.md")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--task", required=True)
    parser.add_argument("--unit")
    parser.add_argument("--change-line")
    parser.add_argument("--safety-report")
    parser.add_argument("--type", choices=("feat", "fix", "test", "chore", "docs", "refactor"))
    parser.add_argument("--no-verify-hooks", action="store_true")
    args = parser.parse_args()
    task = Path(args.task).resolve(strict=True)
    safety_report = Path(args.safety_report).resolve() if args.safety_report else None
    if not task.is_file():
        raise ValueError("--task must name a file")

    def git(*argv, env=None, check=True):
        return subprocess.run(["git", "--literal-pathspecs", *argv], env=env,
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=check)

    root = Path(git("rev-parse", "--show-toplevel").stdout.decode().strip())
    os.chdir(root)
    git_dir = Path(git("rev-parse", "--absolute-git-dir").stdout.decode().strip())
    lock = (git_dir / "ai-prompt-task-commit.lock").open("a")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        raise ValueError("another task commit is in progress")
    journal = git_dir / "ai-prompt-task-commit.json"
    identity = hashlib.sha256(task.read_bytes()).hexdigest() + ":" + (args.unit or "packet")
    def current_head():
        return git("rev-parse", "--verify", "HEAD", check=False).stdout.decode().strip()

    head = current_head()
    original_tree = git("write-tree").stdout.decode().strip()

    # A crash can occur after Git moved HEAD but before the real index was
    # reconciled. Only recover the exact prepared tree and unchanged index.
    if journal.exists():
        pending = json.loads(journal.read_text())
        if head != pending["base"]:
            parent = git("rev-parse", "--verify", "HEAD^", check=False).stdout.decode().strip()
            tree = git("rev-parse", "HEAD^{tree}").stdout.decode().strip()
            if (parent != pending["base"] or tree != pending["tree"]
                    or str(task) != pending["task"] or identity != pending["identity"]
                    or original_tree not in (pending["original_tree"], pending["tree"])):
                raise ValueError("pending task commit needs review: HEAD, task or index changed")
            git("reset", "-q", "HEAD", "--", *pending["paths"])
            journal.unlink()
            print("committed task recovered: " + head)
            return 0
        journal.unlink()  # preparation/failed commit never moved HEAD

    with tempfile.TemporaryDirectory(prefix="ai-prompt-commit-") as temporary:
        temporary = Path(temporary)
        # Restrict contract generation to this packet without inventing another
        # Markdown reader, and never overwrite the user's retained contract.
        packet = temporary / "packet"
        packet.mkdir()
        (packet / task.name).write_bytes(task.read_bytes())
        contract_path = temporary / "task-contract.json"
        builder = Path(__file__).resolve().parents[1] / "build-task-contract.sh"
        result = subprocess.run(["bash", str(builder), str(packet), str(contract_path)],
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if result.returncode:
            raise ValueError("canonical task parser failed: " + result.stderr.decode().strip())
        contract = load_task_contract(contract_path)
        units = contract["units"]
        if args.unit:
            unit_id = args.unit.removeprefix(task.name + "#")
            units = [unit for unit in units if unit["id"] == unit_id]
        selected_ids = {unit.get("canonicalId") for unit in units}
        undeclared = [issue for issue in contract.get("issues", [])
                      if issue.get("code") == "undeclared-test-artifact"
                      and issue.get("canonicalId") in selected_ids]
        if undeclared:
            raise ValueError("undeclared test artifact blocks commit: " + "; ".join(issue["message"] for issue in undeclared))
        if not units or any(not unit.get("filePaths") for unit in units):
            raise ValueError("task selection must contain units with declared file paths")

        def relative(raw):
            p = Path(raw)
            if p.is_absolute() or ".." in p.parts or raw in ("", "."):
                raise ValueError("unsafe task path: " + raw)
            # A parent symlink must not turn staging into an external operation.
            (root / p).parent.resolve().relative_to(root)
            if p.parts[0] == ".git":
                raise ValueError("Git metadata is not a task artifact")
            return p.as_posix()

        declared = sorted({relative(p) for unit in units for p in unit["filePaths"]})
        paths = list(declared)
        for item in declared:
            target = root / item
            tracked = item in git("ls-files", "-z", "--", item).stdout.decode().split("\0")
            if target.is_dir():
                raise ValueError("declare individual files, not a directory: " + item)
            if not target.exists() and not target.is_symlink() and not tracked:
                # Already-staged deletion remains legitimate even when ls-files
                # no longer lists it, provided the path existed in HEAD.
                if git("cat-file", "-t", "HEAD:" + item, check=False).stdout.strip() != b"blob":
                    raise ValueError("required declared file is missing: " + item)
        for directory in (task.parent, root / "prompts/outputs/current"):
            try:
                directory.relative_to(root)
            except ValueError:
                continue
            for name in ARTIFACTS:
                candidate = directory / name
                item = candidate.relative_to(root).as_posix()
                if candidate.exists() or git("cat-file", "-e", "HEAD:" + item, check=False).returncode == 0:
                    paths.append(item)
        paths = sorted(set(paths))
        staged = git("diff", "--cached", "--name-only", "--no-renames", "-z").stdout.decode().split("\0")
        unrelated = sorted(set(staged) - set(paths) - {""})
        if unrelated:
            raise ValueError("unrelated staged paths block task commit: " + ", ".join(unrelated))

        env = dict(os.environ, GIT_INDEX_FILE=str(temporary / "index"))
        if (current_head() != head
                or git("write-tree").stdout.decode().strip() != original_tree):
            raise ValueError("HEAD or index changed while preparing task; retry after reviewing")
        git("read-tree", "HEAD" if head else "--empty", env=env)
        git("add", "-A", "--", *paths, env=env)
        if git("diff", "--cached", "--quiet", env=env, check=False).returncode == 0:
            print("no staged changes after path filter — skipping commit")
            return 1
        slug = task.stem
        kind = args.type or ("fix" if slug.startswith("remediation-") else
                             "test" if any(s in slug for s in ("test", "qa", "regression")) else
                             "docs" if "docs" in slug or "documentation" in slug else "feat")
        scope = slug.removeprefix("tasks-").removeprefix("remediation-")[:40]
        subject = (args.change_line or "implement " + scope).replace("\n", "")[:72]
        message = f"{kind}({scope}): {subject}\n\nTask: {task.name}\nTask-Checkpoint: {identity}\n"
        if safety_report:
            verdict = json.loads(safety_report.read_text()).get("verdict", "unknown")
            message += "Safety-Check: " + str(verdict) + "\n"
        message_path = temporary / "message"
        message_path.write_text(message)
        prepared = {"base": head, "tree": git("write-tree", env=env).stdout.decode().strip(),
                    "original_tree": original_tree, "task": str(task), "identity": identity, "paths": paths}
        journal_tmp = journal.with_suffix(".tmp")
        journal_tmp.write_text(json.dumps(prepared))
        journal_tmp.replace(journal)
        command = ["commit", "-F", str(message_path)]
        if args.no_verify_hooks:
            command.append("--no-verify")
        result = git(*command, env=env, check=False)
        sys.stdout.write(result.stdout.decode())
        sys.stderr.write(result.stderr.decode())
        if result.returncode:
            # Hooks can fail; neither checkpoint bytes nor the user's index is
            # written here. Leave the work available for repair and retry.
            if current_head() == head:
                journal.unlink()
            raise ValueError("git commit failed; original index and task progress preserved")
        if (git("rev-parse", "--verify", "HEAD^", check=False).stdout.decode().strip() != head
                or git("rev-parse", "HEAD^{tree}").stdout.decode().strip() != prepared["tree"]):
            raise ValueError("commit hook changed the prepared commit; review pending journal before retry")
        git("reset", "-q", "HEAD", "--", *paths)
        journal.unlink()
        print("committed task " + task.name)
        return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ValueError, OSError, subprocess.CalledProcessError, KeyError) as exc:
        print("commit-task: " + str(exc), file=sys.stderr)
        sys.exit(2)
