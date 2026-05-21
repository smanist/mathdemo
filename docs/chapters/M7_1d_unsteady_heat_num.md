---
title: Numerical Solutions of the 1D Heat Equation
---

# Numerical Solutions of the 1D Heat Equation

This standalone demo migrates the source notebook
`M7_1d_unsteady_heat_num.ipynb`. It solves the one-dimensional heat equation
on $0 \leq x \leq 2\pi$,

```{math}
u_t = u_{xx}, \qquad u(0,t)=u(2\pi,t)=0,
```

with triangular initial condition

```{math}
u(x,0)=
\begin{cases}
x, & x < \pi,\\
2\pi-x, & x \geq \pi.
\end{cases}
```

The interactive plot compares an analytical series solution with two finite
difference schemes:

- an explicit central-space, forward-time method;
- a Crank-Nicolson method using central differences in space and a midpoint
  rule in time.

:::{container} course-interactive course-interactive-m7-heat-num
Interactive example loading...
:::

Change the number of spatial segments and the time step to compare accuracy
and stability.
