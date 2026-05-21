from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_issue_19_docs_assets_are_registered() -> None:
    index_text = (ROOT / "docs" / "index.md").read_text(encoding="utf-8")
    conf_text = (ROOT / "docs" / "conf.py").read_text(encoding="utf-8")

    assert "chapters/M3_EVP_for_IVP" in index_text
    assert "js/examples/M3_EVP_for_IVP.js" in conf_text
    assert (ROOT / "docs" / "chapters" / "M3_EVP_for_IVP.md").is_file()
    assert (
        ROOT / "docs" / "_static" / "js" / "examples" / "M3_EVP_for_IVP.js"
    ).is_file()
