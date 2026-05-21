from pathlib import Path


def test_index_references_existing_fourier_chapter() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    index_text = (repo_root / "docs" / "index.md").read_text(encoding="utf-8")

    assert "chapters/chap_fourier" in index_text
    assert (repo_root / "docs" / "chapters" / "chap_fourier.md").is_file()
