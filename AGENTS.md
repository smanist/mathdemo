# Agent Guidelines

This repository is a static Sphinx/MyST site for interactive course notes.

## Documentation Structure

- Keep chapter content in Markdown under `docs/chapters/`.
- Prefer MyST syntax for math, cross-references, figures, and directives.
- Keep Sphinx configuration in `docs/conf.py`.
- Keep shared styling in `docs/_static/css/`.
- Keep browser-side interactive code in `docs/_static/js/`.

## Avoid Raw HTML Everywhere

- Do not put large raw HTML, inline scripts, or example implementation logic
  directly inside chapter Markdown files.
- A chapter may embed an interactive example in the middle of prose, but the
  Markdown should contain only a small semantic MyST placeholder when possible.
- Prefer MyST containers with identifying classes, not raw HTML blocks:

  ```md
  :::{container} course-interactive course-interactive-linear-ode
  Interactive example loading...
  :::
  ```

- Put the actual JavaScript, plotting logic, Pyodide calls, and DOM construction
  in static JavaScript files.
- If a raw HTML block grows beyond a small placeholder, move that behavior into
  a reusable directive, template, or JavaScript module.

## Importing Sample Markdown Chapters

Sample chapter Markdown may come from Pandoc-oriented sources and often needs
normalization before it will compile correctly in Sphinx/MyST.

- Do not leave top-level LaTeX macro definitions such as `\newcommand` in the
  chapter body. Move shared macros into `mathjax3_config` in `docs/conf.py`.
- Preserve the intended macro behavior when moving definitions. For example,
  map `\dd`, `\ddf`, `\ppf`, vector macros, norm macros, and color macros into
  MathJax `tex.macros`.
- Convert display math written as `$$ ... $$` to MyST math fences:

  ````md
  ```{math}
  ...
  ```
  ````

- Preserve equation labels during conversion. For example, convert
  `$$ ... $$ {#eq:model}` to:

  ````md
  ```{math}
  :label: eq:model

  ...
  ```
  ````

- Give every imported chapter one real page title heading, usually matching the
  front matter title:

  ```md
  # Numerical Methods for ODEs
  ```

- If the sample uses level-1 headings for sections, demote them one level after
  adding the page title: `# Section` becomes `## Section`, and `## Subsection`
  becomes `### Subsection`. This prevents Sphinx sidebars and toctrees from
  treating each section as a separate page-level entry.
- After conversion, run a fresh Sphinx build with `python -m sphinx -E -b html
  docs docs/_build/html` when navigation structure, labels, or math parsing
  changed.

## Temporary Ingestion Workflow

During the ingestion phase, keep raw source material outside this repository and
treat it as read-only. Do not edit files under:

```text
/Users/daninghuang/Downloads/mathdemo-raw
```

The raw source tree is organized as follows:

```text
/Users/daninghuang/Downloads/mathdemo-raw/
  chaps/   # source chapter Markdown
  pics/    # figures referenced by source chapters
  demos/   # notebook sources for HTML-style interactive examples
```

When asked to migrate a chapter from `chaps/`:

- Keep the original file name when creating the migrated chapter under
  `docs/chapters/`.
- Add the migrated chapter to the appropriate Sphinx/MyST toctree.
- Move any new LaTeX macros into `docs/conf.py`.
- Convert display math to MyST math fences.
- Preserve equation labels.
- Migrate referenced figures from `pics/` into the repository, following the
  existing figure location and reference style. If a referenced figure file is
  not found, leave the chapter reference clearly marked for follow-up instead of
  inventing a replacement.
- Do not migrate linked or embedded HTML examples as part of a chapter
  migration unless explicitly asked.
- Follow all other rules in this file.

When asked to migrate a demo from `demos/`:

- Create a standalone Markdown page for the demo, using the same base name as
  the source `.ipynb` file.
- Implement browser-side behavior in `docs/_static/js/examples/`.
- Keep the Markdown page limited to prose, MyST structure, and a small semantic
  placeholder for the interactive component.
- Follow all other rules in this file.

## Modular Interactive Examples

- Keep interactive examples as individual JavaScript files whenever possible.
- Use one file per example or closely related example family, for example:

  ```text
  docs/_static/js/examples/logistic-map.js
  docs/_static/js/examples/euler-method.js
  docs/_static/js/examples/fourier-filter.js
  ```

- Keep `docs/_static/js/course-interactives.js` focused on shared loader,
  registry, and initialization behavior.
- Example files should export or register a small initializer that receives the
  placeholder element and reads configuration from `data-*` attributes.
- Avoid duplicating CDN loading logic across example files. Use shared helpers
  for Plotly, Pyodide, p5.js, and JSXGraph.
- Recompute examples from user inputs in the browser only. Do not introduce a
  backend dependency.

## Asset Loading

- Use pinned CDN versions for Plotly, Pyodide, p5.js, and JSXGraph unless the
  project explicitly switches to vendored assets.
- Lazy-load heavyweight libraries, especially Pyodide, only when an example
  actually needs them.
- Keep the site deployable to Read the Docs as a static Sphinx build.

## Local Website Workflow

- For quick local static-site checks, start a server from the repository root
  with `python -m http.server <port> --bind 127.0.0.1`.
- Visit local pages with the Codex Browser plugin at
  `http://localhost:<port>`.
- Stop repo-local HTTP servers with `scripts/kill-local-http-server <pid>`.
  Do not use raw `kill <pid>` for this workflow.

## Verification

- Run `sphinx-build -b html docs docs/_build/html` after documentation or
  static asset changes.
- For interactive examples, verify at least one rendered page in a browser when
  the behavior changes.
