---
title: First-Order PDEs and Shock Formation
---

# First-Order PDEs and Shock Formation

This standalone demo migrates the source notebook
`M5_2_1st_moc_shock_2d.ipynb`. It considers the nonlinear transport equation

```{math}
\begin{aligned}
u_t + u u_x &= 0, \\
u(x,0) &= 1-x^2.
\end{aligned}
```

The characteristic speed is the solution value itself, so different parts of
the initial profile move at different speeds. The plots show how the
characteristics crowd together as the classical solution approaches shock
formation.

:::{container} course-interactive course-interactive-m5-first-order-moc-shock-2d
Interactive example loading...
:::

Think about what the blank region means after characteristics begin to merge.
