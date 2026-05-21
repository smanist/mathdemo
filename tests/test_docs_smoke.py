from pathlib import Path
import runpy


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"


def test_docs_configuration_and_index_include_pde_chapter() -> None:
    conf = runpy.run_path(str(DOCS / "conf.py"))

    assert "myst_parser" in conf["extensions"]
    assert "pppf" in conf["mathjax3_config"]["tex"]["macros"]

    index_text = (DOCS / "index.md").read_text(encoding="utf-8")
    chapter_text = (DOCS / "chapters" / "chap_pde_sov.md").read_text(encoding="utf-8")

    assert "chapters/chap_pde_sov" in index_text
    assert "# Partial Differential Equations - Separation of Variables" in chapter_text
    assert r"p_n= \frac{n \pi}{a}" in chapter_text
    assert r"\int_0^a \Delta T(x)\cos\left(\frac{n\pi}{a}x\right) dx" in chapter_text
