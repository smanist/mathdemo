from __future__ import annotations

from pathlib import Path
from typing import Any
import runpy


REPO_ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = REPO_ROOT / "docs"
CHAPTERS_DIR = DOCS_DIR / "chapters"
EXAMPLES_DIR = DOCS_DIR / "_static" / "js" / "examples"
INDEX_PATH = DOCS_DIR / "index.md"
CONF_PATH = DOCS_DIR / "conf.py"


def read_text(path: str | Path) -> str:
    file_path = Path(path)
    if not file_path.is_absolute():
        file_path = REPO_ROOT / file_path
    return file_path.read_text(encoding="utf-8")


def load_conf() -> dict[str, Any]:
    return runpy.run_path(str(CONF_PATH))


def toctree_entries(path: str | Path = INDEX_PATH) -> list[str]:
    source_path = Path(path)
    if not source_path.is_absolute():
        source_path = REPO_ROOT / source_path

    entries: list[str] = []
    in_toctree = False

    for raw_line in read_text(source_path).splitlines():
        line = raw_line.strip()
        if line == "```{toctree}":
            in_toctree = True
            continue
        if in_toctree and line == "```":
            in_toctree = False
            continue
        if in_toctree and line and not line.startswith(":"):
            entries.append(line)

    return entries


def docs_relative_toctree_entries(path: str | Path = INDEX_PATH) -> list[str]:
    source_path = Path(path)
    if not source_path.is_absolute():
        source_path = REPO_ROOT / source_path

    entries: list[str] = []
    for entry in toctree_entries(source_path):
        if entry.endswith(">") and "<" in entry:
            entry = entry.rsplit("<", 1)[1][:-1]
        target = (source_path.parent / f"{entry}.md").resolve()
        entries.append(target.relative_to(DOCS_DIR).with_suffix("").as_posix())

    return entries


def index_toctree_entries() -> list[str]:
    return docs_relative_toctree_entries(INDEX_PATH)


def all_toctree_entries(path: str | Path = INDEX_PATH) -> list[str]:
    source_path = Path(path)
    if not source_path.is_absolute():
        source_path = REPO_ROOT / source_path

    entries: list[str] = []
    visited: set[Path] = set()

    def visit(current_path: Path) -> None:
        for entry in docs_relative_toctree_entries(current_path):
            entries.append(entry)
            target_path = DOCS_DIR / f"{entry}.md"
            if target_path.is_file() and target_path not in visited:
                visited.add(target_path)
                visit(target_path)

    visit(source_path)
    return entries
