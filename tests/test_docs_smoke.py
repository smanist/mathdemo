from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_laplace_chapter_is_included_in_docs_index() -> None:
    assert (ROOT / "docs" / "chapters" / "chap_lap_trans.md").is_file()

    docs_index = (ROOT / "docs" / "index.md").read_text(encoding="utf-8")
    assert "chapters/chap_lap_trans" in docs_index
