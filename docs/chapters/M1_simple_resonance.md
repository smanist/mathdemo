# Simple Resonance

This demo visualizes the response of a spring-mass-damper system and separates
the total motion into its forced response and initial transient.

```{math}
:label: eq:m1-simple-resonance-ode
y'' + 2\zeta\omega_0 y' + \omega_0^2 y = \sin(\omega t),
\qquad
y(0)=y_0,
\qquad
y'(0)=y'_0.
```

The transfer function for the displacement response is

```{math}
:label: eq:m1-simple-resonance-transfer
Q(s) = \frac{1}{s^2 + 2\zeta\omega_0 s + \omega_0^2}.
```

The migrated browser version keeps the notebook's four-panel layout: input,
total output, forced response, and initial transient. Use the numeric controls
to change $\omega_0$, $\zeta$, and the initial conditions, then use the Plotly
slider to sweep the forcing frequency $\omega$.

:::{container} course-interactive course-interactive-m1-simple-resonance
Interactive example loading...
:::

To reproduce the notebook's resonance experiment, try $\omega_0 = 1$ and
$\zeta = 0$, keep nonzero initial conditions, and sweep $\omega$ through the
slider. Near $\omega = \omega_0$, the forced-response panel shows the familiar
growth associated with resonance.
