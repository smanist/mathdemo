from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def test_fourier_gibbs_demo_is_registered_in_docs() -> None:
    index_text = (REPO_ROOT / "docs" / "index.md").read_text()
    conf_text = (REPO_ROOT / "docs" / "conf.py").read_text()
    chapter_text = (REPO_ROOT / "docs" / "chapters" / "M4_Fourier_Gibbs.md").read_text()
    script_path = (
        REPO_ROOT / "docs" / "_static" / "js" / "examples" / "fourier-gibbs.js"
    )

    assert "chapters/M4_Fourier_Gibbs" in index_text
    assert "js/examples/fourier-gibbs.js" in conf_text
    assert "course-interactive-fourier-gibbs" in chapter_text
    assert script_path.is_file()
