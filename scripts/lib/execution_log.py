"""Archive-aware reading of prompts/outputs/current/execution-log.md.

The execution log is append-only and can grow past the oversized-file limit.
scripts/rotate-execution-log.sh moves older completed journal entries into
prompts/outputs/archive/execution-log-NNN.md and lists those files in the main
log's YAML frontmatter:

    journal_archives:
      - prompts/outputs/archive/execution-log-001.md

or the inline form `journal_archives: [a.md, b.md]`. Paths are relative to the
project root (the directory that contains `prompts/`).

Every consumer reads the *logical* log: the archives concatenated in listed
order (they are older), then the main log. "The last record in log order is
authoritative" therefore still holds.

Usage from a python heredoc:

    import os, sys
    sys.dont_write_bytecode = True
    sys.path.insert(0, os.environ["EXEC_LOG_LIB"])
    from execution_log import load_logical_log
"""
from __future__ import annotations

import os
import re
from dataclasses import dataclass, field

# Inserted between archives and the main log so a section body can never run
# from one file into the next (`##` ends a journal section).
ARCHIVE_BOUNDARY = "\n## (journal archive boundary)\n\n"

_FRONTMATTER = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\Z)", re.S)


def split_frontmatter(text: str) -> tuple[str, str]:
    """Return (frontmatter_body, rest); frontmatter_body is "" when absent."""
    match = _FRONTMATTER.match(text)
    if not match:
        return "", text
    return match.group(1), text[match.end():]


def parse_journal_archives(text: str) -> list[str]:
    """Parse the `journal_archives` list from a log's frontmatter."""
    frontmatter, _ = split_frontmatter(text)
    if not frontmatter:
        return []
    items: list[str] = []
    lines = frontmatter.splitlines()
    for index, line in enumerate(lines):
        match = re.match(r"^journal_archives:\s*(.*)$", line)
        if not match:
            continue
        inline = match.group(1).strip()
        if inline.startswith("["):
            inner = inline.strip()[1:]
            inner = inner[:-1] if inner.endswith("]") else inner
            items = [part.strip().strip("\"'") for part in inner.split(",") if part.strip()]
        elif inline and inline not in {"null", "~"}:
            items = [inline.strip("\"'")]
        else:
            for follow in lines[index + 1:]:
                item = re.match(r"^\s+-\s+(.*?)\s*$", follow)
                if not item:
                    break
                value = item.group(1).strip().strip("\"'")
                if value:
                    items.append(value)
        break
    return items


def project_root_candidates(plan_dir: str) -> list[str]:
    """Directories that may be the project root for a plan dir.

    The plan dir is normally <root>/prompts/outputs/current, so the root is
    three levels up; the working directory is the fallback.
    """
    plan_abs = os.path.abspath(plan_dir)
    candidates = [os.path.abspath(os.path.join(plan_abs, "..", "..", ".."))]
    cwd = os.getcwd()
    if cwd not in candidates:
        candidates.append(cwd)
    return candidates


def resolve_archive(plan_dir: str, relative: str) -> str | None:
    """Absolute path of an archive listed in journal_archives, or None."""
    if os.path.isabs(relative):
        return relative if os.path.isfile(relative) else None
    normalized = os.path.normpath(relative)
    if normalized.startswith(".."):
        return None
    for root in project_root_candidates(plan_dir):
        candidate = os.path.join(root, normalized)
        if os.path.isfile(candidate):
            return candidate
    return None


@dataclass
class LogicalLog:
    main_text: str
    archives: list[str] = field(default_factory=list)   # listed paths, in order
    archive_texts: list[str] = field(default_factory=list)  # frontmatter stripped
    missing: list[str] = field(default_factory=list)

    @property
    def text(self) -> str:
        """Archives (oldest first) then the full main log."""
        if not self.archive_texts:
            return self.main_text
        return ARCHIVE_BOUNDARY.join(self.archive_texts) + ARCHIVE_BOUNDARY + self.main_text

    @property
    def body(self) -> str:
        """Like `text`, but the main log's own frontmatter is dropped."""
        _, rest = split_frontmatter(self.main_text)
        if not self.archive_texts:
            return rest
        return ARCHIVE_BOUNDARY.join(self.archive_texts) + ARCHIVE_BOUNDARY + rest


def load_logical_log(plan_dir: str, main_text: str) -> LogicalLog:
    """Load the archives named by main_text's frontmatter, in listed order."""
    logical = LogicalLog(main_text=main_text)
    for relative in parse_journal_archives(main_text):
        logical.archives.append(relative)
        resolved = resolve_archive(plan_dir, relative)
        if resolved is None:
            logical.missing.append(relative)
            continue
        try:
            with open(resolved, encoding="utf-8") as handle:
                raw = handle.read()
        except OSError:
            logical.missing.append(relative)
            continue
        _, rest = split_frontmatter(raw)
        logical.archive_texts.append(rest)
    return logical
