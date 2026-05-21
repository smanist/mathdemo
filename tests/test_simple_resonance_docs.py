from pathlib import Path
import runpy


ROOT = Path(__file__).resolve().parents[1]


def test_simple_resonance_docs_are_registered() -> None:
    index_text = (ROOT / "docs" / "index.md").read_text(encoding="utf-8")
    chapter_text = (ROOT / "docs" / "chapters" / "M1_simple_resonance.md").read_text(
        encoding="utf-8"
    )
    conf = runpy.run_path(str(ROOT / "docs" / "conf.py"))

    assert "chapters/M1_simple_resonance" in index_text
    assert "course-interactive-m1-simple-resonance" in chapter_text
    assert "js/examples/M1_simple_resonance.js" in conf["html_js_files"]
