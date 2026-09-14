---
title: Solving 2D ODE by Matrix Exponentials
---

# Solving 2D ODE by Matrix Exponentials

Consider the linear initial value problem

```{math}
\vx' = A \vx, \qquad \vx(0) = \vx_0,
```

with

```{math}
A = \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix}.
```

When the matrix admits a real eigenvalue decomposition

```{math}
A = V \Lambda V^{-1},
```
the exact solution can be written using the two real eigenvector components of
the initial data. When the eigenvalues are a complex-conjugate pair, the real
and imaginary parts of $e^{\lambda t}\mathbf{v}$ instead provide two real basis
solutions. For a repeated, non-diagonalizable eigenvalue, the demo evaluates
$\vx(t)=e^{\lambda t}[I+t(A-\lambda I)]\vx_0$ directly.

The interactive below shows either the two real eigenvector contributions or
the real- and imaginary-part mode contributions, together with their sum and
the decomposition segment at a selected time step. When no eigenvector
decomposition exists, it displays the solution path and the single eigenvector
as a reference, without component traces.

:::{container} course-interactive course-interactive-m3-evp-for-ivp
Interactive example loading...
:::
