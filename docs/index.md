# Interactive Course Notes

These notes are built with Sphinx and MyST Markdown. Chapters can use ordinary
Markdown, Sphinx cross-references, and LaTeX equations.

```{toctree}
:maxdepth: 2
:caption: Chapters

chapters/signal-denoise-placeholder
chapters/chap_ode_intro
chapters/chap_ode_review
chapters/M1_periodic_excite
chapters/M4_Fourier_Extension
chapters/M4_Fourier_Gibbs
chapters/chap_num_ode
chapters/chap_cmplx
chapters/chap_fourier
chapters/chap_pde_1st
chapters/chap_lap_trans
chapters/chap_pde_moc
chapters/chap_pde_sov
chapters/chap_num_pde
chapters/chap_la
chapters/linear-ode-example
chapters/M1_impulse
chapters/M1_simple_resonance
chapters/M2_double_pendulum
chapters/M2_Euler_method_comparison
chapters/M3_EVP_for_IVP
```

## Site Conventions

- Write chapters as Markdown files in `docs/chapters/`.
- Put reusable browser code in `docs/_static/js/`.
- Put small embedded example placeholders in the Markdown where the interactive
  example should appear.
- Keep heavyweight libraries pinned by exact CDN version until the site needs
  vendored/offline assets.
