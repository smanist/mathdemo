from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
INDEX_PATH = DOCS_DIR / "index.md"


def _index_toctree_entries() -> list[str]:
    entries: list[str] = []
    in_toctree = False

    for line in INDEX_PATH.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped == "```{toctree}":
            in_toctree = True
            continue
        if in_toctree and stripped == "```":
            break
        if in_toctree and stripped and not stripped.startswith(":"):
            entries.append(stripped)

    return entries


def test_docs_index_references_the_review_chapter() -> None:
    assert "chapters/chap_ode_review" in _index_toctree_entries()


def test_docs_index_toctree_entries_exist() -> None:
    assert INDEX_PATH.is_file()
    assert (DOCS_DIR / "conf.py").is_file()

    for entry in _index_toctree_entries():
        assert (DOCS_DIR / f"{entry}.md").is_file()
