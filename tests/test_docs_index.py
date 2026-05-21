from pathlib import Path


def test_docs_index_toctree_entries_exist() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    docs_dir = repo_root / "docs"
    index_text = (docs_dir / "index.md").read_text(encoding="utf-8")

    in_toctree = False
    entries: list[str] = []

    for raw_line in index_text.splitlines():
        line = raw_line.strip()
        if line == "```{toctree}":
            in_toctree = True
            continue
        if in_toctree and line == "```":
            break
        if not in_toctree or not line or line.startswith(":"):
            continue
        entries.append(line)

    assert entries, "Expected at least one toctree entry in docs/index.md"

    missing = [entry for entry in entries if not (docs_dir / f"{entry}.md").exists()]
    assert missing == [], f"Missing toctree targets: {missing}"
