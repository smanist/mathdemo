---
title: 2x2 Matrix Transformations and Eigenvectors
---

# 2x2 Matrix Transformations and Eigenvectors

This standalone demo migrates the source notebook
`M3_Eigenvalue_problem.ipynb`. It considers a matrix

```{math}
A=\begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix}
```

and a unit vector

```{math}
x=\begin{bmatrix}\cos\theta\\ \sin\theta\end{bmatrix}.
```

The transformed vector is $y=Ax$. Usually $x$ and $y$ have different
directions and lengths. When $x$ is an eigenvector, however, $Ax=\lambda x$:
the output vector stays on the same line and $\lambda$ is the scaling factor.

:::{container} course-interactive course-interactive-m3-eigenvalue-problem
Interactive example loading...
:::

Use the angle slider to look for directions where the blue input vector and
red transformed vector align.
