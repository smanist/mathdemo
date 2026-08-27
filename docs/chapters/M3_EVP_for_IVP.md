---
title: Solving 2D ODE by Matrix Exponentials
---

# Solving 2D ODE by Matrix Exponentials

Consider the linear initial value problem

```{math}
\vy' = A \vy, \qquad \vy(0) = \vy_0,
```

with

```{math}
A = \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix}.
```

This example considers when the matrix admits a real eigenvalue decomposition

```{math}
A = X \Lambda X^{-1},
```
the exact solution can be written in terms of matrix exponentials and the
eigenvector components of the initial data.

The interactive below keeps that structure: it shows the two eigenvector
contributions, their sum, and the decomposition segment at a selected time
step.

:::{container} course-interactive course-interactive-m3-evp-for-ivp
Interactive example loading...
:::
