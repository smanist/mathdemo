from pathlib import Path


def test_ode_intro_chapter_is_included_in_docs_index() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    chapter = repo_root / "docs" / "chapters" / "chap_ode_intro.md"
    index = repo_root / "docs" / "index.md"

    assert chapter.exists()
    assert "chapters/chap_ode_intro" in index.read_text()
