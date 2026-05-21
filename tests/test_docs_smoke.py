from pathlib import Path
import runpy


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
INDEX_PATH = DOCS_DIR / "index.md"


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


def test_index_references_existing_fourier_chapter() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    index_text = (repo_root / "docs" / "index.md").read_text(encoding="utf-8")

    assert "chapters/chap_fourier" in index_text
    assert (repo_root / "docs" / "chapters" / "chap_fourier.md").is_file()


def test_index_references_pde_chapter() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    index_text = (repo_root / "docs" / "index.md").read_text(encoding="utf-8")

    assert "chapters/chap_pde_1st" in index_text
    assert (repo_root / "docs" / "chapters" / "chap_pde_1st.md").is_file()


def test_laplace_chapter_is_included_in_docs_index() -> None:
    assert (ROOT / "docs" / "chapters" / "chap_lap_trans.md").is_file()

    docs_index = (ROOT / "docs" / "index.md").read_text(encoding="utf-8")
    assert "chapters/chap_lap_trans" in docs_index


def test_ode_intro_chapter_is_included_in_docs_index() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    chapter = repo_root / "docs" / "chapters" / "chap_ode_intro.md"
    index = repo_root / "docs" / "index.md"

    assert chapter.exists()
    assert "chapters/chap_ode_intro" in index.read_text()


def _index_toctree_entries() -> list[str]:
    entries: list[str] = []
    in_toctree = False

    for line in INDEX_PATH.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped == "```{toctree}":
            in_toctree = True
            continue
        if in_toctree and stripped == "```":
            break
        if in_toctree and stripped and not stripped.startswith(":"):
            entries.append(stripped)

    return entries


def test_docs_index_references_the_review_chapter() -> None:
    assert "chapters/chap_ode_review" in _index_toctree_entries()


def test_docs_index_toctree_entries_exist() -> None:
    assert INDEX_PATH.is_file()
    assert (DOCS_DIR / "conf.py").is_file()

    for entry in _index_toctree_entries():
        assert (DOCS_DIR / f"{entry}.md").is_file()


def test_docs_configuration_and_index_include_pde_chapter() -> None:
    conf = runpy.run_path(str(DOCS_DIR / "conf.py"))

    assert "myst_parser" in conf["extensions"]
    assert "pppf" in conf["mathjax3_config"]["tex"]["macros"]

    index_text = (DOCS_DIR / "index.md").read_text(encoding="utf-8")
    chapter_text = (DOCS_DIR / "chapters" / "chap_pde_sov.md").read_text(encoding="utf-8")

    assert "chapters/chap_pde_sov" in index_text
    assert "# Partial Differential Equations - Separation of Variables" in chapter_text
    assert r"p_n= \frac{n \pi}{a}" in chapter_text
    assert r"\int_0^a \Delta T(x)\cos\left(\frac{n\pi}{a}x\right) dx" in chapter_text
