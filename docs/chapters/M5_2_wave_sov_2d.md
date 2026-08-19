---
title: String Vibration by Separation of Variables (2D)
---

# String Vibration by Separation of Variables (2D)

This demo solves the fixed-end string vibration problem

```{math}
\begin{aligned}
u_{tt} &= c^2 u_{xx}, \\
u(0,t) &= 0, \qquad u(\pi,t)=0, \\
u(x,0) &= f(x), \qquad u_t(x,0)=0,
\end{aligned}
```

with $f(x)=0.1x(\pi-x)$. The separation-of-variables solution is a modal
series

```{math}
u(x,t)=\sum_{n=1}^{\infty} A_n\cos(nct)\sin(nx),
```

with only odd modes present for this initial displacement. The browser demo
compares the d'Alembert solution with the truncated modal approximation and
shows the first three modal contributions.

:::{container} course-interactive course-interactive-m5-wave-sov-2d
Interactive example loading...
:::

Questions to test while you explore:

1. How does changing $c$ alter the oscillation period?
2. Which modes are most affected when damping is increased?
