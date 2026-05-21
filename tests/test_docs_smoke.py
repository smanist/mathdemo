from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_periodic_excite_page_is_registered() -> None:
    index_text = (ROOT / "docs" / "index.md").read_text()
    conf_text = (ROOT / "docs" / "conf.py").read_text()
    chapter_path = ROOT / "docs" / "chapters" / "M1_periodic_excite.md"
    js_path = ROOT / "docs" / "_static" / "js" / "examples" / "M1_periodic_excite.js"

    assert chapter_path.is_file()
    assert js_path.is_file()
    assert "chapters/M1_periodic_excite" in index_text
    assert "js/examples/M1_periodic_excite.js" in conf_text
