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
  Markdown should contain only a small semantic placeholder when possible.
- Prefer compact placeholders such as:

  ```md
  ```{raw} html
  <div
    class="course-interactive"
    data-example="logistic-map"
    data-r="3.4"
    data-x0="0.2">
  </div>
  ```
  ```

- Put the actual JavaScript, plotting logic, Pyodide calls, and DOM construction
  in static JavaScript files.
- If a raw HTML block grows beyond a small placeholder, move that behavior into
  a reusable directive, template, or JavaScript module.

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

## Verification

- Run `sphinx-build -b html docs docs/_build/html` after documentation or
  static asset changes.
- For interactive examples, verify at least one rendered page in a browser when
  the behavior changes.
