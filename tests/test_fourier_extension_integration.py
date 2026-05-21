from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_fourier_extension_assets_are_present() -> None:
    chapter = ROOT / "docs/chapters/M4_Fourier_Extension.md"
    script = ROOT / "docs/_static/js/examples/fourier-extension.js"

    assert chapter.is_file()
    assert script.is_file()


def test_fourier_extension_page_is_registered() -> None:
    index_text = (ROOT / "docs/index.md").read_text()
    chapter_text = (ROOT / "docs/chapters/M4_Fourier_Extension.md").read_text()
    conf_text = (ROOT / "docs/conf.py").read_text()

    assert "chapters/M4_Fourier_Extension" in index_text
    assert "course-interactive-fourier-extension" in chapter_text
    assert '"js/examples/fourier-extension.js"' in conf_text
