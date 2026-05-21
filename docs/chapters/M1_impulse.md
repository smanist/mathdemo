---
title: Impulse Responses of a Spring-Mass-Damper System
---

# Impulse Responses of a Spring-Mass-Damper System

This demo compares the response of a spring-mass-damper system to a finite
rectangular pulse and to an idealized impulse applied at $t=1$.

```{math}
:label: eq:m1-impulse-governing
y'' + 2 \zeta \omega_0 y' + \omega_0^2 y
= \frac{u(t - 1) - u(t - 1 - w)}{w},
\qquad y(0) = 0,
\qquad y'(0) = 0.
```

The finite pulse has width $w$ and unit area. Its Laplace-domain output is

```{math}
:label: eq:m1-impulse-finite
Y_w(s)
= \frac{1}{s^2 + 2 \zeta \omega_0 s + \omega_0^2}
\frac{e^{-s} - e^{-(1 + w)s}}{w s}.
```

For comparison, the ideal impulse model uses $\delta(t-1)$:

```{math}
:label: eq:m1-impulse-dirac
Y_\delta(s)
= \frac{e^{-s}}{s^2 + 2 \zeta \omega_0 s + \omega_0^2}.
```

The source notebook rendered the Dirac input schematically rather than as a
literal plottable function. This standalone page keeps that convention and
shows the ideal impulse input as a dashed marker while plotting the exact
output response.

:::{container} course-interactive course-interactive-m1-impulse
Interactive example loading...
:::
