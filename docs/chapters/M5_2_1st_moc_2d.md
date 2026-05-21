---
title: First-Order PDEs with Characteristics (2D)
---

# First-Order PDEs with Characteristics (2D)

This standalone demo migrates the source notebook
`M5_2_1st_moc_2d.ipynb` into the site's browser-side format. It considers
first-order PDEs of the form

```{math}
\begin{aligned}
u_t + c(x,t,u)u_x &= s(x,t,u), \\
u(x,0) &= f(x),
\end{aligned}
```

with initial condition $f(x)=\exp(-2(x-2)^2)$. The selectable cases are:

1. $u_t + u_x = 0$
2. $u_t + e^{-t}u_x = 0$
3. $u_t + e^{-t}u_x = -u^2$
4. $u_t + u_x = -u^2$

The plots compare the solution in a moving characteristic coordinate, the
solution in the fixed spatial coordinate, and the full solution on the
$(x,t)$ plane.

:::{container} course-interactive course-interactive-m5-first-order-moc-2d
Interactive example loading...
:::

Questions to test while you explore:

1. Which cases translate the initial pulse without changing its height?
2. Which cases add decay along each characteristic?
3. How does the characteristic geometry change when the speed depends on time?
