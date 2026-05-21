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

When the matrix admits a real eigenvalue decomposition

```{math}
A = X \Lambda X^{-1},
```
the exact solution can be written in terms of matrix exponentials and the
eigenvector components of the initial data. The notebook prototype for this
demo visualized that decomposition in the phase plane.

The interactive below keeps that structure: it shows the two eigenvector
contributions, their sum, and the decomposition segment at a selected time
step. The original notebook plotted only real eigendecompositions, so this page
reports matrices with complex or defective eigenstructure instead of guessing a
replacement visualization.

:::{container} course-interactive course-interactive-m3-evp-for-ivp
Interactive example loading...
:::
