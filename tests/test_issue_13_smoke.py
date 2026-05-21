from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def test_m1_impulse_page_is_wired_into_the_docs() -> None:
    conf_text = (REPO_ROOT / "docs" / "conf.py").read_text()
    index_text = (REPO_ROOT / "docs" / "index.md").read_text()
    chapter_text = (REPO_ROOT / "docs" / "chapters" / "M1_impulse.md").read_text()
    js_path = REPO_ROOT / "docs" / "_static" / "js" / "examples" / "m1-impulse.js"

    assert '"js/examples/m1-impulse.js"' in conf_text
    assert "chapters/M1_impulse" in index_text
    assert "course-interactive-m1-impulse" in chapter_text
    assert js_path.is_file()
