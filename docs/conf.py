project = "Interactive Course Notes"
author = "Course Staff"

extensions = [
    "myst_parser",
    "sphinx.ext.mathjax",
]

source_suffix = {
    ".md": "markdown",
}

master_doc = "index"
exclude_patterns = ["_build", "README.md"]

myst_enable_extensions = [
    "amsmath",
    "colon_fence",
    "dollarmath",
]

myst_heading_anchors = 3
numfig = True

html_theme = "alabaster"
html_title = project
html_static_path = ["_static"]

html_css_files = [
    "css/course.css",
]

html_js_files = [
    "js/course-interactives.js",
    "js/examples/logistic-map.js",
    "js/examples/linear-ode.js",
    "js/examples/signal-denoise.js",
    "js/examples/m1-impulse.js",
    "js/examples/M1_periodic_excite.js",
]

mathjax3_config = {
    "tex": {
        "macros": {
            "Abs": r"\mathrm{Abs}",
            "Arg": r"\mathrm{Arg}",
            "Ln": r"\mathrm{Ln}",
            "PV": r"\mathrm{PV}",
            "cL": r"\mathcal{L}",
            "vf": r"\mathbf{f}",
            "vk": r"\mathbf{k}",
            "vy": r"\mathbf{y}",
            "vz": r"\mathbf{z}",
            "dd": r"\mathrm{d}",
            "ppf": [r"\frac{\partial #1}{\partial #2}", 2],
            "pppf": [r"\frac{\partial^2 #1}{\partial #2^2}", 2],
            "ddf": [r"\frac{\mathrm{d} #1}{\mathrm{d} #2}", 2],
            "norm": [r"\left\lVert #1 \right\rVert", 1],
            "Cr": [r"{\color{red} #1}", 1],
            "Cg": [r"{\color{green} #1}", 1],
            "Cb": [r"{\color{blue} #1}", 1],
            "Im": r"\mathrm{Im}",
            "Re": r"\mathrm{Re}",
        },
    },
}

html_theme_options = {
    "description": "Static Sphinx/MyST notes with browser-side examples",
    "fixed_sidebar": True,
}
