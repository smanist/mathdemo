from pathlib import Path


def test_docs_root_exists() -> None:
    assert Path("docs").is_dir()
