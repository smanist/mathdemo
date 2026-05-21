---
title: 1D Unsteady Heat Transfer (2D)
---

# 1D Unsteady Heat Transfer (2D)

This standalone demo migrates the source notebook
`M5_1_1D_unsteady_heat_2d.ipynb` into the site's browser-side format. It
solves the one-dimensional unsteady heat equation on
$0 \leq x \leq L,\ t \geq 0$,

```{math}
u_t = c u_{xx}, \qquad u(x,0)=f(x),
```

using separation-of-variables series solutions for three boundary-condition
families:

- **Dirichlet:** $u(0,t)=v_1,\ u(L,t)=v_2$
- **Neumann:** $u_x(0,t)=0,\ u_x(L,t)=0$
- **Mixed:** $u(0,t)=v_1,\ u_x(L,t)=0$

The plotted solution has the form

```{math}
u(x,t)=u_0(x)+\sum_{n=1}^{\infty}u_n(x,t),
```

where $u_0(x)$ is the steady offset and the terms $u_n(x,t)$ are the decaying
modes. The first plot shows the full series approximation; the second plot
shows the leading modal contributions.

:::{container} course-interactive course-interactive-m5-heat-2d
Interactive example loading...
:::

Questions to test while you explore:

1. How does increasing $c$ change the decay rate?
2. What steady state remains as $t \to \infty$?
3. Which boundary condition changes the modal shapes most visibly?
