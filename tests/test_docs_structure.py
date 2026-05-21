from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def read_text(relative_path: str) -> str:
    return (REPO_ROOT / relative_path).read_text(encoding="utf-8")


def test_pde_chapter_is_listed_in_index_toctree() -> None:
    assert "chapters/chap_num_pde" in read_text("docs/index.md")


def test_pde_chapter_has_page_title() -> None:
    assert "# Numerical Methods for PDEs" in read_text("docs/chapters/chap_num_pde.md")
