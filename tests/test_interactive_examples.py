from __future__ import annotations

from dataclasses import dataclass

import pytest

from helpers import CHAPTERS_DIR, EXAMPLES_DIR, load_conf, read_text
from helpers import index_toctree_entries


@dataclass(frozen=True)
class InteractiveExample:
    chapter: str
    script: str
    placeholder_class: str | None = None
    script_registration: str | None = None

    @property
    def index_entry(self) -> str:
        return f"chapters/{self.chapter}"

    @property
    def script_entry(self) -> str:
        return f"js/examples/{self.script}"


EXAMPLES = [
    InteractiveExample(
        chapter="M1_impulse",
        script="m1-impulse.js",
        placeholder_class="course-interactive-m1-impulse",
    ),
    InteractiveExample(
        chapter="M1_periodic_excite",
        script="M1_periodic_excite.js",
    ),
    InteractiveExample(
        chapter="M1_simple_resonance",
        script="M1_simple_resonance.js",
        placeholder_class="course-interactive-m1-simple-resonance",
    ),
    InteractiveExample(
        chapter="M2_Euler_method_comparison",
        script="M2_Euler_method_comparison.js",
        placeholder_class="course-interactive-m2-euler-method-comparison",
        script_registration='registerExample("m2-euler-method-comparison"',
    ),
    InteractiveExample(
        chapter="M3_EVP_for_IVP",
        script="M3_EVP_for_IVP.js",
    ),
    InteractiveExample(
        chapter="M4_Fourier_Extension",
        script="fourier-extension.js",
        placeholder_class="course-interactive-fourier-extension",
    ),
    InteractiveExample(
        chapter="M4_Fourier_Gibbs",
        script="fourier-gibbs.js",
        placeholder_class="course-interactive-fourier-gibbs",
    ),
]


@pytest.mark.parametrize("example", EXAMPLES, ids=[example.chapter for example in EXAMPLES])
def test_interactive_example_is_registered(example: InteractiveExample) -> None:
    conf = load_conf()
    chapter_path = CHAPTERS_DIR / f"{example.chapter}.md"
    script_path = EXAMPLES_DIR / example.script

    assert example.index_entry in index_toctree_entries()
    assert example.script_entry in conf["html_js_files"]
    assert chapter_path.is_file()
    assert script_path.is_file()

    if example.placeholder_class is not None:
        assert example.placeholder_class in read_text(chapter_path)
    if example.script_registration is not None:
        assert example.script_registration in read_text(script_path)
