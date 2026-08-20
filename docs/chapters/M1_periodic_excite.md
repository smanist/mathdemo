---
title: Resonance of a Spring-Mass-Damper System
---

# Resonance of a Spring-Mass-Damper System

This demo explores the forced second-order system

```{math}
y'' + 2\zeta\omega_0 y' + \omega_0^2 y = e^{-\sigma t}\cos(\omega t),
```

where `\omega_0` is the natural frequency, `\zeta` is the damping ratio, and
`\sigma` controls exponential decay in the input.

The controls change `\omega_0`, `\zeta`, and `\sigma`. The Plotly slider sweeps
the forcing frequency `\omega`, while the figure compares the time-domain input,
the zero-initial-condition response, and the corresponding poles and input roots
in the `s`-plane.

:::{container} course-interactive course-interactive-m1-periodic-excite
Interactive example loading...
:::

