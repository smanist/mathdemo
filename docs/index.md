# Interactive Course Notes

:::{container} course-landing-auth
Account access loading...
:::

:::{container} course-landing-content
These notes are built with Sphinx and MyST Markdown. Chapters can use ordinary
Markdown, Sphinx cross-references, and LaTeX equations.

```{toctree}
:maxdepth: 1
:caption: Chapters

chapters/foundations
chapters/odes
chapters/transforms
chapters/pdes
```

## Site Conventions

- Write chapters as Markdown files in `docs/chapters/`.
- Put reusable browser code in `docs/_static/js/`.
- Put small embedded example placeholders in the Markdown where the interactive
  example should appear.
- Keep heavyweight libraries pinned by exact CDN version until the site needs
  vendored/offline assets.
:::
