---
title: 1D Unsteady Heat Transfer (3D)
---

# 1D Unsteady Heat Transfer (3D)

This demo uses the same one-dimensional heat
equation and boundary-condition families as the 2D view, but plots the
solution over both space and time as surfaces:

```{math}
u_t = c u_{xx}, \qquad u(x,0)=f(x).
```

The top surface shows the series solution $u(x,t)$. The lower surfaces show
the first two homogeneous modes, so the different spatial shapes and decay
rates can be compared directly.

:::{container} course-interactive course-interactive-m5-heat-3d
Interactive example loading...
:::

Use the controls to compare the boundary-condition families and the heat
transfer coefficient. Larger values of $c$ damp higher-frequency modes more
quickly.
