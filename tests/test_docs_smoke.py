from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
INDEX_PATH = DOCS_DIR / "index.md"


def _toctree_entries() -> list[str]:
    entries: list[str] = []
    in_toctree = False

    for raw_line in INDEX_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()

        if line == "```{toctree}":
            in_toctree = True
            continue
        if in_toctree and line == "```":
            break
        if not in_toctree or not line or line.startswith(":"):
            continue

        entries.append(line)

    return entries


def test_index_toctree_targets_exist() -> None:
    entries = _toctree_entries()
    assert entries, "Expected at least one toctree entry in docs/index.md"

    missing = [
        entry
        for entry in entries
        if not (DOCS_DIR / f"{entry}.md").exists() and not (DOCS_DIR / entry).exists()
    ]

    assert not missing, f"Missing files referenced by docs/index.md toctree: {missing}"
