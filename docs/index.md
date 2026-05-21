# Interactive Course Notes

These notes are built with Sphinx and MyST Markdown. Chapters can use ordinary
Markdown, Sphinx cross-references, and LaTeX equations.

```{toctree}
:maxdepth: 2
:caption: Chapters

chapters/placeholder
chapters/interactive-placeholder
chapters/signal-denoise-placeholder
chapters/chap_num_ode
chapters/chap_pde_1st
chapters/linear-ode-example
```

## Site Conventions

- Write chapters as Markdown files in `docs/chapters/`.
- Put reusable browser code in `docs/_static/js/`.
- Put small embedded example placeholders in the Markdown where the interactive
  example should appear.
- Keep heavyweight libraries pinned by exact CDN version until the site needs
  vendored/offline assets.
