import pytest

from helpers import CONF_PATH, DOCS_DIR, INDEX_PATH, all_toctree_entries, load_conf
from helpers import read_text
from helpers import index_toctree_entries


def test_docs_root_exists() -> None:
    assert DOCS_DIR.is_dir()


def test_sphinx_conf_defines_expected_options() -> None:
    conf = load_conf()
    macros = conf["mathjax3_config"]["tex"]["macros"]

    assert conf["project"] == "Interactive Course Notes"
    assert "myst_parser" in conf["extensions"]
    assert conf["numfig"] is True
    assert "js/course-page-toc.js" in conf["html_js_files"]
    assert (DOCS_DIR / "_static" / "js" / "course-page-toc.js").is_file()
    assert {"dd", "ddf", "norm", "ppf", "pppf"} <= set(macros)


def test_docs_index_toctree_entries_exist() -> None:
    assert INDEX_PATH.is_file()
    assert CONF_PATH.is_file()

    entries = index_toctree_entries()
    assert entries, "Expected at least one toctree entry in docs/index.md"

    missing = [entry for entry in entries if not (DOCS_DIR / f"{entry}.md").is_file()]
    assert missing == [], f"Missing toctree targets: {missing}"


def test_all_navigation_targets_exist() -> None:
    missing = [
        entry
        for entry in all_toctree_entries()
        if not (DOCS_DIR / f"{entry}.md").is_file()
    ]

    assert missing == []


@pytest.mark.parametrize(
    "entry",
    [
        "chapters/foundations",
        "chapters/odes",
        "chapters/transforms",
        "chapters/pdes",
    ],
)
def test_docs_index_lists_only_chapter_groups(entry: str) -> None:
    assert entry in index_toctree_entries()


@pytest.mark.parametrize(
    "entry",
    [
        "chapters/chap_cmplx",
        "chapters/chap_fourier",
        "chapters/chap_lap_trans",
        "chapters/chap_num_pde",
        "chapters/chap_ode_intro",
        "chapters/chap_ode_review",
        "chapters/chap_pde_1st",
        "chapters/chap_pde_sov",
    ],
)
def test_expected_chapters_are_listed_in_navigation(entry: str) -> None:
    assert entry in all_toctree_entries()


@pytest.mark.parametrize(
    ("chapter_path", "expected_text"),
    [
        ("docs/chapters/chap_num_pde.md", "# Numerical Methods for PDEs"),
        (
            "docs/chapters/chap_pde_sov.md",
            "# Partial Differential Equations - Separation of Variables",
        ),
        ("docs/chapters/chap_pde_sov.md", r"p_n= \frac{n \pi}{a}"),
        (
            "docs/chapters/chap_pde_sov.md",
            r"\int_0^a \Delta T(x)\cos\left(\frac{n\pi}{a}x\right) dx",
        ),
    ],
)
def test_chapters_contain_expected_content(
    chapter_path: str, expected_text: str
) -> None:
    assert expected_text in read_text(chapter_path)
