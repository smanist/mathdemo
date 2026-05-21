---
title: String Vibration by Characteristics
---

# String Vibration by Characteristics

This standalone demo migrates the source notebook
`M5_2_wave_moc_2d.ipynb`. It solves the fixed-end string vibration problem

```{math}
\begin{aligned}
u_{tt} &= c^2 u_{xx}, \\
u(0,t) &= 0, \qquad u(\pi,t)=0, \\
u(x,0) &= f(x), \qquad u_t(x,0)=0,
\end{aligned}
```

where $c$ is the wave speed and $f(x)=0.1x(\pi-x)$. The method of
characteristics gives the d'Alembert form

```{math}
u(x,t)=\frac{1}{2}\left(\hat f(x+ct)+\hat f(x-ct)\right),
```

where $\hat f$ is the odd periodic extension of $f$. The two half-amplitude
waves travel left and right at speed $c$ and combine to satisfy the fixed-end
boundary conditions.

:::{container} course-interactive course-interactive-m5-wave-moc-2d
Interactive example loading...
:::

Use the toggles to isolate the right-running, left-running, and combined
solutions.
