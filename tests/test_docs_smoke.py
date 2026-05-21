from pathlib import Path
import runpy


ROOT = Path(__file__).resolve().parents[1]


def test_sphinx_conf_defines_expected_math_macros() -> None:
    conf = runpy.run_path(str(ROOT / "docs" / "conf.py"))

    macros = conf["mathjax3_config"]["tex"]["macros"]

    assert conf["project"] == "Interactive Course Notes"
    assert "dd" in macros
    assert "ddf" in macros
    assert "ppf" in macros
    assert "norm" in macros


def test_index_references_complex_chapter() -> None:
    index_text = (ROOT / "docs" / "index.md").read_text()

    assert "chapters/chap_cmplx" in index_text
    assert (ROOT / "docs" / "chapters" / "chap_cmplx.md").exists()
