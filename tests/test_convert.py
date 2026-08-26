from __future__ import annotations

import os
from pathlib import Path
import shutil
import subprocess

from helpers import REPO_ROOT


def make_converter(tmp_path: Path) -> tuple[Path, dict[str, str], Path]:
    tool_root = tmp_path / "tool"
    chapters_dir = tool_root / "docs" / "chapters"
    scripts_dir = tool_root / "scripts"
    bin_dir = tmp_path / "bin"
    chapters_dir.mkdir(parents=True)
    scripts_dir.mkdir()
    bin_dir.mkdir()

    shutil.copy2(REPO_ROOT / "convert", tool_root / "convert")
    shutil.copy2(
        REPO_ROOT / "scripts" / "pandoc-myst-preprocess.awk",
        scripts_dir / "pandoc-myst-preprocess.awk",
    )

    pandoc_log = tmp_path / "pandoc-arguments.txt"
    fake_pandoc = bin_dir / "pandoc"
    fake_pandoc.write_text(
        """#!/usr/bin/env bash
set -euo pipefail
output_file=
: >"$PANDOC_LOG"
for argument in "$@"; do
  printf '%s\\n' "$argument" >>"$PANDOC_LOG"
  case "$argument" in
    --output=*) output_file=${argument#*=} ;;
  esac
done
printf 'test pdf\\n' >"$output_file"
""",
        encoding="utf-8",
    )
    fake_pandoc.chmod(0o755)

    fake_xelatex = bin_dir / "xelatex"
    fake_xelatex.write_text("#!/usr/bin/env bash\nexit 0\n", encoding="utf-8")
    fake_xelatex.chmod(0o755)

    env = os.environ.copy()
    env["PATH"] = f"{bin_dir}:{env['PATH']}"
    env["PANDOC_LOG"] = str(pandoc_log)
    return tool_root, env, pandoc_log


def run_converter(tool_root: Path, env: dict[str, str], *args: str):
    return subprocess.run(
        [str(tool_root / "convert"), *args],
        cwd=tool_root,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )


def test_convert_keeps_single_chapter_output_name(tmp_path: Path) -> None:
    tool_root, env, pandoc_log = make_converter(tmp_path)
    (tool_root / "docs" / "chapters" / "alpha.md").write_text(
        "# Alpha\n", encoding="utf-8"
    )

    result = run_converter(tool_root, env, "alpha.md")

    assert result.returncode == 0, result.stderr
    assert result.stdout == "Created pdfs/alpha.pdf\n"
    assert (tool_root / "pdfs" / "alpha.pdf").is_file()
    pandoc_arguments = pandoc_log.read_text(encoding="utf-8").splitlines()
    input_arguments = [
        argument
        for argument in pandoc_arguments
        if argument.endswith(".md")
    ]
    assert len(input_arguments) == 1
    assert input_arguments[0].endswith("/input-1.md")
    assert "--file-scope" not in pandoc_arguments


def test_convert_merge_combines_two_chapters_in_order(tmp_path: Path) -> None:
    tool_root, env, pandoc_log = make_converter(tmp_path)
    chapters_dir = tool_root / "docs" / "chapters"
    (chapters_dir / "alpha.md").write_text("# Alpha\n", encoding="utf-8")
    (chapters_dir / "beta.md").write_text("# Beta\n", encoding="utf-8")

    result = run_converter(tool_root, env, "--merge", "alpha.md", "beta.md")

    assert result.returncode == 0, result.stderr
    assert result.stdout == "Created pdfs/alpha-beta.pdf\n"
    assert (tool_root / "pdfs" / "alpha-beta.pdf").is_file()
    assert not (tool_root / "pdfs" / "alpha.pdf").exists()
    assert not (tool_root / "pdfs" / "beta.pdf").exists()
    pandoc_arguments = pandoc_log.read_text(encoding="utf-8").splitlines()
    input_arguments = [
        argument
        for argument in pandoc_arguments
        if argument.endswith(".md")
    ]
    assert len(input_arguments) == 2
    assert input_arguments[0].endswith("/input-1.md")
    assert input_arguments[1].endswith("/input-2.md")
    assert "--file-scope" in pandoc_arguments


def test_convert_merge_requires_exactly_two_chapters(tmp_path: Path) -> None:
    tool_root, env, _ = make_converter(tmp_path)

    result = run_converter(tool_root, env, "--merge", "alpha.md")

    assert result.returncode == 2
    assert "--merge requires exactly two Markdown filenames" in result.stderr
