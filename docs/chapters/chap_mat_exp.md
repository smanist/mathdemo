---
title: Matrix Exponentials for Linear Systems
---

```{sectnum}
:depth: 5
```

# Matrix Exponentials for Linear Systems

## Learning Objectives

After learning this chapter, you will be able to:

- Write the solution of an autonomous linear system using a matrix exponential.
- Use eigenvalue decomposition to evaluate the matrix exponential.
- Interpret each eigenvalue and eigenvector as one mode of the solution.

## Autonomous Linear Systems

Consider the initial value problem

```{math}
:label: eq:linear-system-ivp

\mathbf{x}'(t)=A\mathbf{x}(t),\qquad \mathbf{x}(0)=\mathbf{x}_0,
```

where $A$ is a constant $n\times n$ matrix. The system is called
*autonomous* because its right-hand side does not depend explicitly on time.

For the scalar equation $x'=\lambda x$, the solution is
$x(t)=e^{\lambda t}x(0)$. The matrix version of this result is

```{math}
:label: eq:matrix-exponential-solution

\boxed{\mathbf{x}(t)=e^{At}\mathbf{x}_0}.
```

The matrix exponential can be defined by the power series

```{math}
e^{At}=I+At+\frac{(At)^2}{2!}+\frac{(At)^3}{3!}+\cdots.
```

It satisfies $e^{A0}=I$ and
$\frac{\dd}{\dd t}e^{At}=Ae^{At}$, so {eq}`eq:matrix-exponential-solution`
satisfies both the ODE and the initial condition in {eq}`eq:linear-system-ivp`.

## Evaluating $e^{At}$ with Eigenvalues

Suppose $A$ has $n$ linearly independent eigenvectors. Put the eigenvectors
into the columns of $V$ and their corresponding eigenvalues into $\Lambda$:

```{math}
A=V\Lambda V^{-1},\qquad
\Lambda=\operatorname{diag}(\lambda_1,\ldots,\lambda_n).
```

Introduce the modal coordinates $\mathbf{z}=V^{-1}\mathbf{x}$. Then

```{math}
\mathbf{z}'=V^{-1}\mathbf{x}'
=V^{-1}AV\mathbf{z}
=\Lambda\mathbf{z}.
```

The coupled system has become $n$ independent scalar equations,
$z_i'=\lambda_i z_i$. Therefore,

```{math}
:label: eq:eigendecomposition-exponential

\boxed{e^{At}=Ve^{\Lambda t}V^{-1}},\qquad
e^{\Lambda t}=\operatorname{diag}
\left(e^{\lambda_1t},\ldots,e^{\lambda_nt}\right).
```

Equivalently, if the initial condition is written as a combination of the
eigenvectors,

```{math}
\mathbf{x}_0=c_1\mathbf{v}_1+\cdots+c_n\mathbf{v}_n,
```

then the solution is

```{math}
:label: eq:linear-system-modal-solution

\boxed{\mathbf{x}(t)=
c_1e^{\lambda_1t}\mathbf{v}_1+\cdots+
c_ne^{\lambda_nt}\mathbf{v}_n}.
```

Each eigenvector gives a direction, or *mode*, while its eigenvalue determines
how that mode grows, decays, or oscillates. Here we restrict our attention to
diagonalizable matrices. Matrices without a full set of independent
eigenvectors require a more general construction.

## Example: A Two-Dimensional System

Let us recycle the matrix from the eigenvalue example in the linear algebra
chapter:

```{math}
\mathbf{x}'=
\begin{bmatrix}-5&2\\2&-2\end{bmatrix}\mathbf{x},
\qquad
\mathbf{x}(0)=\begin{bmatrix}3\\1\end{bmatrix}.
```

The characteristic equation is

```{math}
\det(A-\lambda I)=\lambda^2+7\lambda+6
=(\lambda+6)(\lambda+1)=0.
```

The eigenvalue-eigenvector pairs can be chosen as

```{math}
\lambda_1=-6,\quad
\mathbf{v}_1=\begin{bmatrix}2\\-1\end{bmatrix},
\qquad
\lambda_2=-1,\quad
\mathbf{v}_2=\begin{bmatrix}1\\2\end{bmatrix}.
```

Thus

```{math}
V=\begin{bmatrix}2&1\\-1&2\end{bmatrix},\qquad
V^{-1}=\frac{1}{5}\begin{bmatrix}2&-1\\1&2\end{bmatrix}.
```

The modal coefficients are particularly simple:

```{math}
\begin{bmatrix}c_1\\c_2\end{bmatrix}
=V^{-1}\mathbf{x}_0
=\begin{bmatrix}1\\1\end{bmatrix}.
```

Using {eq}`eq:linear-system-modal-solution`, we obtain

```{math}
\boxed{
\mathbf{x}(t)
=e^{-6t}\begin{bmatrix}2\\-1\end{bmatrix}
+e^{-t}\begin{bmatrix}1\\2\end{bmatrix}
=\begin{bmatrix}
2e^{-6t}+e^{-t}\\
-e^{-6t}+2e^{-t}
\end{bmatrix}}.
```

For example, at $t=1$,

```{math}
\mathbf{x}(1)\approx\begin{bmatrix}0.3728\\0.7333\end{bmatrix}.
```

Both modes decay because both eigenvalues are negative. The $e^{-6t}$ mode
disappears much faster, so at later times the solution points approximately in
the direction of $\mathbf{v}_2$.

For any other initial condition, we could instead calculate the matrix once:

```{math}
e^{At}=\frac{1}{5}
\begin{bmatrix}
4e^{-6t}+e^{-t} & -2e^{-6t}+2e^{-t}\\
-2e^{-6t}+2e^{-t} & e^{-6t}+4e^{-t}
\end{bmatrix},
```

and multiply it by the new $\mathbf{x}_0$.

## Example: A Second-Order ODE as a System

Consider

```{math}
y''+3y'+2y=0,\qquad y(0)=1,\quad y'(0)=0.
```

Set $\mathbf{x}=[y\;\;y']^{\mathsf T}$. Then

```{math}
\mathbf{x}'=
\begin{bmatrix}0&1\\-2&-3\end{bmatrix}\mathbf{x},
\qquad
\mathbf{x}(0)=\begin{bmatrix}1\\0\end{bmatrix}.
```

The eigenvalues are $-1$ and $-2$, with eigenvectors
$[1\;\;-1]^{\mathsf T}$ and $[1\;\;-2]^{\mathsf T}$. Since

```{math}
\mathbf{x}_0
=2\begin{bmatrix}1\\-1\end{bmatrix}
-\begin{bmatrix}1\\-2\end{bmatrix},
```

the solution is

```{math}
\mathbf{x}(t)=
2e^{-t}\begin{bmatrix}1\\-1\end{bmatrix}
-e^{-2t}\begin{bmatrix}1\\-2\end{bmatrix}.
```

The first component gives

```{math}
\boxed{y(t)=2e^{-t}-e^{-2t}},
```

which is the same result produced by the characteristic-equation method. The
matrix-exponential approach extends that familiar idea to any number of
coupled, first-order linear equations.


## Interactive Example

This section contains an interactive visualization of the solution of ODEs
by matrix exponentials.

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

Also in {doc}`M3_EVP_for_IVP`.
