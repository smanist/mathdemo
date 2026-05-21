from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def read_text(relative_path: str) -> str:
    return (REPO_ROOT / relative_path).read_text(encoding="utf-8")


def test_issue_17_docs_integration() -> None:
    chapter_path = REPO_ROOT / "docs/chapters/M2_Euler_method_comparison.md"
    example_path = REPO_ROOT / "docs/_static/js/examples/M2_Euler_method_comparison.js"

    assert chapter_path.exists()
    assert example_path.exists()

    index_text = read_text("docs/index.md")
    assert "chapters/M2_Euler_method_comparison" in index_text

    conf_text = read_text("docs/conf.py")
    assert "js/examples/M2_Euler_method_comparison.js" in conf_text

    chapter_text = read_text("docs/chapters/M2_Euler_method_comparison.md")
    assert "course-interactive-m2-euler-method-comparison" in chapter_text

    example_text = read_text("docs/_static/js/examples/M2_Euler_method_comparison.js")
    assert 'registerExample("m2-euler-method-comparison"' in example_text
