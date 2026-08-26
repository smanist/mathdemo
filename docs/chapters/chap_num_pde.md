---
title: Numerical Methods for PDEs
---

```{sectnum}
:depth: 5
```

# Numerical Methods for PDEs

## Introduction

In Chapter 1, we introduced linear algebra, its origins and applications. It is now time to explore one of the main applications of linear algebra in engineering, which is to solve partial differential equations (PDEs). Numerical methods for PDEs refers to methods and algorithms for *solving* a PDE on a computer. These methods often involve the development of a linear system, such as $A\mathbf{x} = \mathbf{b}$, which can be solved with or without an iterative approach.

Here, rather than a symbolic solution to the PDE, we are interested in a numerical approximation to the PDE. The approximation could be due to the finite precision of expressing numbers on a computer and/or a certain degree of acceptable incompleteness in the solution process; we will see the details later.

**So, why do we need numerical methods?** There are several reasons why, but let us look at some prominent ones. First, elegant methods like the separation of variables (SoV) to analytically solve PDEs are highly restrictive. For instance, they assume that the solution of the PDE can indeed be factored into a separable form; this does not always work, e.g., consider $u(x,y) = \exp(xy)$. Second, the actual analytical solution could be too complicated to find. Finally, the point of this chapter is to show that an analytical solution is not necessary for practical applications. This could then beg the question: *why did we learn analytical methods to solve PDEs in the first place?* This is still necessary to verify and validate numerical methods for PDEs.

### Classification of $2$nd Order PDEs

Most PDEs of practical interest are of $2$nd order or higher; that is, the order of the highest derivative in the PDE is at least $2$. It is useful to classify such PDEs into a few canonical forms because the way their solutions behave is so distinct. First, let us introduce a general form of a $2$nd order PDE:

```{math}
Au_{xx} + 2Bu_{xy} + Cu_{yy} = F(x, y, u_x, u_y, u),
```

where $A$, $B$, and $C$ are the PDE coefficients, $F$ is some forcing function, and the notation $u_{xy}$ means $\frac{\partial^2 u}{\partial x \partial y}$. When the coefficients are constants or functions of $x,y$ only, we have a linear PDE; otherwise, it is nonlinear. In this chapter, we focus on solving linear PDEs with numerical methods only. Depending on the coefficients, PDEs may be classified as:

- **Parabolic.** $B^2 - AC = 0$
- **Hyperbolic.** $B^2 - AC > 0$
- **Elliptic.** $B^2 - AC < 0$

See {numref}`tab:my_label` for some examples. All quasi-linear $2$nd order PDEs are some manifestation of these canonical PDE types.

```{table} Examples of PDE types
:name: tab:my_label

| PDE | $B^2 - AC$ | Type | Example |
| --- | --- | --- | --- |
| $u_{xx} + u_{yy} = 0$ | $-1$ | Elliptic | Laplace equation |
| $u_{xx} + u_{yy} = f(x,y)$ | $-1$ | Elliptic | Poisson equation |
| $u_t = u_{xx}$ | $0$ | Parabolic | Unsteady heat equation |
| $u_{tt} = u_{xx}$ | $1$ | Hyperbolic | Wave equation |
```

Finally, solving a PDE using numerical methods involves the following two main steps:

1. *Discretize* the PDE and its initial/boundary conditions to develop a system of equations.
2. Compute the solution of the system of equations.

The second step could involve solving a system like $A\mathbf{u} = \mathbf{b}$, updating a recursive formula, or a combination of both.

## Discretization

```{figure} ../pics/fig1.png
:width: 50%
:name: fig:enter-label

Discretization of a square region of side $L$ with a mesh with equally spaced elements (also squares). The corners of the elements (circles) are called "nodes." Typically, we compute the solution of the PDE at the nodes.
```

Discretization refers to breaking up a continuum into discrete objects. For example, integers are a discretization of the space of real numbers. {numref}`fig:enter-label` shows the discretization of a square region of side $L$ into $16$ elements (smaller squares). The intersections of the element boundaries are called "nodes." We are interested in obtaining the solution of a PDE on these nodes. To numerically solve the PDE, we must also discretize the PDE.

### Taylor Series

```{figure} ../pics/fig2.png
:width: 50%
:name: fig:taylor

Points in the neighborhood of $(x,y)$ that impact the approximation of $\partial u / \partial x$ via Taylor series.
```

We are interested in expressing partial derivatives, like $\partial u / \partial x$ and $\partial^2 u / \partial x^2$, in discrete form. This is founded on Taylor series, which we review next.

Let $u(x,y)$ be a continuously differentiable function in some domain. Consider a point $(x,y)$ and two neighboring points as shown in {numref}`fig:taylor`. Then Taylor series states the following:

```{math}
:label: eqn:1

u(x+h, y) = u(x,y) + h\frac{\partial u}{\partial x} + \frac{h^2}{2!}\frac{\partial^2 u}{\partial x^2} + \frac{h^3}{3!}\frac{\partial^3 u}{\partial x^3} + \ldots
```

```{math}
:label: eqn:2

u(x-h, y) = u(x,y) - h\frac{\partial u}{\partial x} + \frac{h^2}{2!}\frac{\partial^2 u}{\partial x^2} - \frac{h^3}{3!}\frac{\partial^3 u}{\partial x^3} + \ldots
```

Subtracting {eq}`eqn:2` from {eq}`eqn:1`, we get

```{math}
\begin{aligned}
u(x+h, y) - u(x-h, y) = 2h\frac{\partial u}{\partial x} + \text{higher order terms}.
\end{aligned}
```

When $h \ll 1$, the higher-order terms can be considered negligible, leading to the approximation

```{math}
\frac{\partial u}{\partial x} \approx \frac{u(x+h, y) - u(x-h, y)}{2h}.
```

In other words, the partial derivative of $u$ at $(x,y)$ can be approximated using the value of $u$ at the neighboring points $(x-h,y)$ and $(x+h,y)$.

Similarly, summing {eq}`eqn:1` and {eq}`eqn:2` gives

```{math}
u(x+h, y) + u(x-h, y) = 2u(x,y) + h^2 \frac{\partial^2 u}{\partial x^2} + \text{higher order terms}.
```

Then an approximation for $\partial^2 u / \partial x^2$ is obtained as

```{math}
\frac{\partial^2 u}{\partial x^2} \approx \frac{u(x+h, y) - 2u(x,y) + u(x-h, y)}{h^2}.
```

Finally, the partial derivatives with respect to $y$ can be obtained similarly by expanding $u(x,y)$ about $(x, y \pm h)$:

```{math}
\begin{aligned}
\frac{\partial u}{\partial y} &\approx \frac{u(x, y+h) - u(x, y-h)}{2h}, \\
\frac{\partial^2 u}{\partial y^2} &\approx \frac{u(x, y+h) - 2u(x,y) + u(x, y-h)}{h^2}.
\end{aligned}
```

```{figure} ../pics/fig3.png
:width: 50%
:name: fig:fivepstencil

Five-point stencil around $(x,y)$ used in the central-difference approximations.
```

```{table} Second-order central-difference (Taylor) approximations at $(x_i,y_j)$
:name: tab:central-diff-2d

| Derivative | Central-difference approximation | Truncation error |
| --- | --- | --- |
| $u_x(x_i,y_j)$ | $\displaystyle \frac{u_{i+1,j} - u_{i-1,j}}{2h}$ | $\mathcal{O}(h^2)$ |
| $u_y(x_i,y_j)$ | $\displaystyle \frac{u_{i,j+1} - u_{i,j-1}}{2h}$ | $\mathcal{O}(h^2)$ |
| $u_{xx}(x_i,y_j)$ | $\displaystyle \frac{u_{i+1,j} - 2u_{i,j} + u_{i-1,j}}{h^2}$ | $\mathcal{O}(h^2)$ |
| $u_{yy}(x_i,y_j)$ | $\displaystyle \frac{u_{i,j+1} - 2u_{i,j} + u_{i,j-1}}{h^2}$ | $\mathcal{O}(h^2)$ |
| $u_{xy}(x_i,y_j)$ | $\displaystyle \frac{u_{i+1,j+1} - u_{i+1,j-1} - u_{i-1,j+1} + u_{i-1,j-1}}{4h^2}$ | $\mathcal{O}(h^2)$ |
```

(sec:elliptic)=
## Numerical Solution to Elliptic PDEs

Now let us illustrate the need for discretization on an elliptic PDE: namely, the two-dimensional steady heat equation, a.k.a. the Laplace equation,

```{math}
\frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2} = 0.
```

Applying the central-difference discretization as before, assuming a grid spacing of $h$ in both the $x$ and $y$ directions, we get

```{math}
\frac{u(x+h, y) - 2u(x,y) + u(x-h, y)}{h^2} + \frac{u(x, y+h) - 2u(x,y) + u(x, y-h)}{h^2} = 0,
```

which simplifies to

```{math}
:label: eqn:laplace_discrete

u(x+h, y) + u(x-h, y) + u(x, y+h) + u(x, y-h) - 4u(x,y) = 0.
```

Note that if the grid spacings were not equal in the $x$ and $y$ directions, then we would get a slightly different form.

Using the five-point stencil shown in {numref}`fig:fivepstencil` and denoting $u(x,y) \equiv u_{i,j}$, we can write {eq}`eqn:laplace_discrete` as

```{math}
:label: eqn:laplace_discrete2

u_{i+1, j} + u_{i-1, j} + u_{i, j+1} + u_{i, j-1} - 4u_{i,j} = 0.
```

As we will see next, {eq}`eqn:laplace_discrete2` can be used to discretize the Laplace equation and its boundary conditions on an entire mesh.

**Illustrative example.** Consider the Laplace equation on the square domain $0 \leq x \leq 1$, $0 \leq y \leq 1$ discretized using a structured grid with grid spacing $h = 1/3$. Consider the following boundary conditions:

```{math}
u(x, 0)=0,\quad u(x, 1)=100,\quad u(0, y)=100,\quad u(1, y)=100.
```

That is, we specify the value of the state variable $u$ on the boundaries directly; this type of boundary condition is called a Dirichlet boundary condition.[^dirichlet-neumann] Let us now obtain the discretized version of the PDE and its boundary conditions.

Recall that we are solving for $u$ on the nodes of the discretized domain in {numref}`fig:laplace_domain`. Given Dirichlet boundary conditions on all four boundaries, we only need to solve for the PDE at nodes $(1,1)$, $(1,2)$, $(2,1)$, and $(2,2)$; therefore, we end up with $4$ discretized equations leading to a $4 \times 4$ linear system.

Applying the five-point stencil at each interior node, we get

```{math}
:label: eqn:laplace_discrete_example

\begin{aligned}
&(i=1, j=1) \\
&u_{21} + u_{12} + u_{01} + u_{10} - 4u_{11} = 0 \\
&(i=1, j=2) \\
&u_{11} + u_{22} + u_{02} + u_{13} - 4u_{12} = 0 \\
&(i=2, j=1) \\
&u_{11} + u_{22} + u_{20} + u_{31} - 4u_{21} = 0 \\
&(i=2, j=2) \\
&u_{21} + u_{12} + u_{23} + u_{32} - 4u_{22} = 0.
\end{aligned}
```

```{figure} ../pics/fig4.png
:width: 50%
:name: fig:laplace_domain

Discretization of the unit square for the 2D Laplace equation with Dirichlet boundary conditions ($h = \tfrac13$).
```

In {eq}`eqn:laplace_discrete_example`, the boundary-node values are already known from the Dirichlet data. This leaves us with $4$ equations in $4$ unknowns:

```{math}
:label: eqn:laplace_discrete_final

\begin{aligned}
&u_{21} + u_{12} - 4u_{11} = -u_{01} - u_{10} \\
&u_{11} + u_{22} - 4u_{12} = -u_{02} - u_{13} \\
&u_{11} + u_{22} - 4u_{21} = -u_{20} - u_{31} \\
&u_{21} + u_{12} - 4u_{22} = -u_{23} - u_{32}.
\end{aligned}
```

This leads to a linear system of the form

```{math}
A\mathbf{u} = \mathbf{b},
```

where

```{math}
\begin{aligned}
A &=
\begin{bmatrix}
-4 & 1 & 1 & 0 \\
1 & -4 & 0 & 1 \\
1 & 0 & -4 & 1 \\
0 & 1 & 1 & -4
\end{bmatrix}, \\
\mathbf{u} &=
\begin{bmatrix}
u_{11} \\
u_{12} \\
u_{21} \\
u_{22}
\end{bmatrix}, \\
\mathbf{b} &=
\begin{bmatrix}
-u_{01} - u_{10} \\
-u_{02} - u_{13} \\
-u_{20} - u_{31} \\
-u_{23} - u_{32}
\end{bmatrix}.
\end{aligned}
```

The above linear system may be solved with direct methods, such as LU decomposition, Cramer's rule, or Gaussian elimination, or with iterative solution methods. We previously introduced direct methods in the linear algebra module; we now introduce iterative methods for solving linear systems.

(sec:iterative_methods)=
## Iterative Methods for Solving Linear Systems

Linear systems arising in the numerical solution of PDEs often have two characteristics: they are sparse and they are large. From a computational efficiency point of view, such systems are better suited for iterative solution approaches, which sequentially improve the guess to the solution, as opposed to exactly solving them. We will introduce two iterative methods: the Gauss-Jacobi and Gauss-Seidel iterations.

### Gauss-Jacobi Iteration

Consider a PDE discretization that leads to large sparse linear systems of the form

```{math}
A\mathbf{u} = \mathbf{b}, \qquad A \in \mathbb{R}^{n \times n},\; \mathbf{u}, \mathbf{b} \in \mathbb{R}^n,
```

where $\mathbf{u}$ contains the discrete unknowns, such as nodal values of a flow variable. The *Gauss-Jacobi* (usually just *Jacobi*) method is a simple stationary iteration based on splitting $A$ into

```{math}
A = D + L + U,
```

where $D = \mathrm{diag}(a_{11}, \dots, a_{nn})$ is the diagonal of $A$, $L$ is the strictly lower-triangular part, and $U$ is the strictly upper-triangular part.

**Derivation.** Starting from $A\mathbf{u} = \mathbf{b}$,

```{math}
\left(D + L + U\right)\mathbf{u} = \mathbf{b}
\quad \Longrightarrow \quad
D\mathbf{u} = \mathbf{b} - (L + U)\mathbf{u}.
```

Jacobi replaces $\mathbf{u}$ on the right-hand side by the previous iterate $\mathbf{u}^{(k)}$ and solves the diagonal system for the next iterate:

```{math}
\begin{aligned}
D\mathbf{u}^{(k+1)} &= \mathbf{b} - (L + U)\mathbf{u}^{(k)}, \\
\mathbf{u}^{(k+1)} &= -D^{-1}(L + U)\mathbf{u}^{(k)} + D^{-1}\mathbf{b}.
\end{aligned}
```

Componentwise, this is

```{math}
u_i^{(k+1)} = \frac{1}{a_{ii}}\left(b_i - \sum_{j \neq i} a_{ij}u_j^{(k)}\right), \qquad i = 1,\dots,n.
```

Equivalently, Jacobi can be viewed as a diagonally preconditioned iteration:

```{math}
\mathbf{u}^{(k+1)} = \mathbf{u}^{(k)} + D^{-1}\left(\mathbf{b} - A\mathbf{u}^{(k)}\right).
```

**Illustrative example.** Consider

```{math}
\begin{aligned}
A &=
\begin{bmatrix}
4 & -1 & 0 \\
-1 & 4 & -1 \\
0 & -1 & 3
\end{bmatrix}, \\
\mathbf{b} &=
\begin{bmatrix}
15 \\
10 \\
10
\end{bmatrix}.
\end{aligned}
```

The exact solution is $\mathbf{u}^\ast = [\,5,\;5,\;5\,]^T$. Writing the equations explicitly,

```{math}
\begin{aligned}
4u_1 - u_2 &= 15, \\
-u_1 + 4u_2 - u_3 &= 10, \\
-u_2 + 3u_3 &= 10,
\end{aligned}
```

the Jacobi updates are

```{math}
:label: eq:jacobi_ex_u1

u_1^{(k+1)} = \frac{15 + u_2^{(k)}}{4},
```

```{math}
:label: eq:jacobi_ex_u2

u_2^{(k+1)} = \frac{10 + u_1^{(k)} + u_3^{(k)}}{4},
```

```{math}
:label: eq:jacobi_ex_u3

u_3^{(k+1)} = \frac{10 + u_2^{(k)}}{3}.
```

Starting from $\mathbf{u}^{(0)} = \mathbf{0}$, a few iterates are:

| $k$ | $u_1^{(k)}$ | $u_2^{(k)}$ | $u_3^{(k)}$ | $\lVert \mathbf{b} - A\mathbf{u}^{(k)} \rVert_\infty$ |
| --- | ---: | ---: | ---: | ---: |
| 0 | 0.0000 | 0.0000 | 0.0000 | 15.0000 |
| 1 | 3.7500 | 2.5000 | 3.3333 | 7.0833 |
| 2 | 4.3750 | 4.2708 | 4.1667 | 1.7708 |
| 3 | 4.8177 | 4.6354 | 4.7569 | 1.0330 |
| 4 | 4.9089 | 4.8937 | 4.8785 | 0.2582 |

Jacobi steadily approaches $[5,5,5]^T$, but it typically requires many iterations for large PDE systems unless combined with acceleration methods such as multigrid, Krylov methods, or relaxation.

### Gauss-Seidel Iteration

The *Gauss-Seidel* (GS) method uses the same splitting $A = D + L + U$ but differs in an important way: it immediately reuses newly computed components of $\mathbf{u}^{(k+1)}$ as soon as they are available. This tends to reduce the spectral radius of the iteration matrix and improves convergence compared with Jacobi.

**Derivation.** Rewrite $A\mathbf{u} = \mathbf{b}$ as

```{math}
\left(D + L\right)\mathbf{u} = \mathbf{b} - U\mathbf{u}.
```

Gauss-Seidel uses $\mathbf{u}^{(k)}$ on the right-hand side but solves the lower-triangular system for $\mathbf{u}^{(k+1)}$:

```{math}
\begin{aligned}
\left(D + L\right)\mathbf{u}^{(k+1)} &= \mathbf{b} - U\mathbf{u}^{(k)}, \\
\mathbf{u}^{(k+1)} &= -(D + L)^{-1}U\,\mathbf{u}^{(k)} + (D + L)^{-1}\mathbf{b}.
\end{aligned}
```

Componentwise, with the natural ordering $i = 1,\dots,n$,

```{math}
u_i^{(k+1)} =
\frac{1}{a_{ii}}
\left(
b_i
- \sum_{j < i} a_{ij}u_j^{(k+1)}
- \sum_{j > i} a_{ij}u_j^{(k)}
\right).
```

Equivalently, GS can be written in residual-correction form:

```{math}
\mathbf{u}^{(k+1)} = \mathbf{u}^{(k)} + (D + L)^{-1}\left(\mathbf{b} - A\mathbf{u}^{(k)}\right),
```

which is a Richardson-type update preconditioned by the lower-triangular part of $A$.

**Illustrative example (same system as above).** Using the same $A$ and $\mathbf{b}$, GS updates become

```{math}
:label: eq:gs_ex_u1

u_1^{(k+1)} = \frac{15 + u_2^{(k)}}{4},
```

```{math}
:label: eq:gs_ex_u2

u_2^{(k+1)} = \frac{10 + u_1^{(k+1)} + u_3^{(k)}}{4},
```

```{math}
:label: eq:gs_ex_u3

u_3^{(k+1)} = \frac{10 + u_2^{(k+1)}}{3}.
```

The only difference from {eq}`eq:jacobi_ex_u1`--{eq}`eq:jacobi_ex_u3` is the use of *new* values on the right-hand side whenever available.

Starting from $\mathbf{u}^{(0)} = \mathbf{0}$:

| $k$ | $u_1^{(k)}$ | $u_2^{(k)}$ | $u_3^{(k)}$ | $\lVert \mathbf{b} - A\mathbf{u}^{(k)} \rVert_\infty$ |
| --- | ---: | ---: | ---: | ---: |
| 0 | 0.0000 | 0.0000 | 0.0000 | 15.0000 |
| 1 | 3.7500 | 3.4375 | 4.4792 | 4.4792 |
| 2 | 4.6094 | 4.7721 | 4.9240 | 1.3346 |
| 3 | 4.9430 | 4.9668 | 4.9889 | 0.1946 |
| 4 | 4.9917 | 4.9952 | 4.9984 | 0.0284 |

**Comparison and practical notes.**

- **Update pattern.** Jacobi uses only the previous iterate $\mathbf{u}^{(k)}$ to compute $\mathbf{u}^{(k+1)}$. Gauss-Seidel uses the newest available components within the same sweep.
- **Convergence speed.** Gauss-Seidel typically converges in fewer iterations than Jacobi on the same problem because it more strongly damps certain error components.
- **Parallelism and implementation on modern hardware.** Jacobi is naturally parallel. Gauss-Seidel is inherently sequential in its basic form due to data dependencies.
- **Memory usage.** Jacobi is usually implemented with two vectors, while Gauss-Seidel can update $\mathbf{u}$ in place.
- **When they struggle.** For poorly conditioned systems, both methods can become very slow, even if they converge.
- **Role in PDE solvers.** In practice, Jacobi and Gauss-Seidel are frequently used as smoothers or simple preconditioners rather than as standalone solvers for high-accuracy solutions on fine grids.

(sec:parabolic)=
## Numerical Solution to Parabolic PDEs

We now introduce the numerical solution of parabolic PDEs. The introduction of time slightly modifies the solution approach. However, we will see that these methods still involve the solution of linear systems, and the iterative approaches discussed previously apply naturally.

Consider the 1D heat equation on $0 \leq x \leq 1$, $t \geq 0$:

```{math}
\begin{aligned}
u_t &= u_{xx}, \qquad 0 \leq x \leq 1,\ t \geq 0, \\
u(x,0) &= f(x), \qquad 0 \leq x \leq 1, \\
u(0,t) &= 0,\qquad u(1,t)=0,\qquad t \geq 0.
\end{aligned}
```

### A General Explicit Finite-Difference Scheme

Let the spatial mesh size be $h$ and the time step be $k$. Define grid points

```{math}
x_i = ih,\quad i = 0,1,\dots,N,\qquad (Nh = 1),
```

```{math}
t^j = jk,\quad j = 0,1,\dots,M,\qquad (Mk = T),
```

and denote the grid function by

```{math}
u_i^j \approx u(x_i,t^j).
```

At an interior point $(x_i,t^j)$ with $i = 1,\dots,N-1$, approximate derivatives by

```{math}
u_t(x_i,t^j) \approx \frac{u_i^{j+1} - u_i^j}{k}
\qquad \text{(forward difference in time)},
```

```{math}
u_{xx}(x_i,t^j) \approx \frac{u_{i+1}^j - 2u_i^j + u_{i-1}^j}{h^2}
\qquad \text{(centered difference in space)}.
```

Substituting into $u_t = u_{xx}$ gives the standard explicit forward-in-time centered-in-space (FTCS) scheme:

```{math}
\begin{aligned}
\frac{u_i^{j+1} - u_i^j}{k} &= \frac{u_{i+1}^j - 2u_i^j + u_{i-1}^j}{h^2}, \\
u_i^{j+1} &= u_i^j + \lambda\left(u_{i+1}^j - 2u_i^j + u_{i-1}^j\right),
\qquad \lambda := \frac{k}{h^2},
\quad i = 1,\dots,N-1.
\end{aligned}
```

Initial and boundary data are imposed as

```{math}
u_i^0 = f(x_i)\quad (i = 0,\dots,N),\qquad
u_0^j = 0,\ \ u_N^j = 0\quad (j = 0,\dots,M).
```

```{figure} ../pics/fig5.png
:width: 50%
:name: fig:par_stencil

FTCS stencil for $u_i^{j+1}$ using $(i-1,j)$, $(i,j)$, and $(i+1,j)$.
```

A minimal stencil for this explicit update is shown in {numref}`fig:par_stencil`.

**Accuracy and stability (context).** This FTCS discretization is first order in time and second order in space, i.e., truncation error $\mathcal{O}(k + h^2)$. For the 1D heat equation, a standard stability requirement for the explicit method is

```{math}
\lambda = \frac{k}{h^2} \leq \frac12.
```

**Illustrative example.** We now demonstrate the numerical solution on a simple grid as shown in {numref}`fig:mesh_para`.

```{figure} ../pics/fig6.png
:width: 50%
:name: fig:mesh_para

Full grid for $h = \tfrac14$, $k = \tfrac1{64}$, $T = \tfrac1{16}$.
```

Consider the initial condition

```{math}
f(x) = \sin(\pi x),
```

and choose

```{math}
h = \frac14,\qquad k = \frac{1}{64},\qquad T = \frac{1}{16}.
```

Then $N = 4$ and $M = 4$. The grid is

```{math}
x_i = \frac{i}{4},\ i = 0,\dots,4,\qquad t^j = \frac{j}{64},\ j = 0,\dots,4.
```

**Discrete equations on this grid.** Here

```{math}
\lambda = \frac{k}{h^2} = \frac{1/64}{(1/4)^2} = \frac14.
```

So the update for interior points becomes

```{math}
\begin{aligned}
u_i^{j+1}
&= u_i^j + \frac14\left(u_{i+1}^j - 2u_i^j + u_{i-1}^j\right) \\
&= \left(1 - 2 \cdot \frac14\right)u_i^j + \frac14 u_{i-1}^j + \frac14 u_{i+1}^j \\
&= \frac12\,u_i^j + \frac14\,u_{i-1}^j + \frac14\,u_{i+1}^j,
\qquad i = 1,2,3,\ \ j = 0,1,2,3.
\end{aligned}
```

Boundary conditions give, for all $j = 0,1,2,3,4$,

```{math}
u_0^j = 0,\qquad u_4^j = 0.
```

Therefore, the fully written interior update equations are

```{math}
\begin{aligned}
u_1^{j+1} &= \frac12\,u_1^j + \frac14\,u_2^j, \\
u_2^{j+1} &= \frac14\,u_1^j + \frac12\,u_2^j + \frac14\,u_3^j, \\
u_3^{j+1} &= \frac14\,u_2^j + \frac12\,u_3^j,
\qquad j = 0,1,2,3.
\end{aligned}
```

Initial conditions at $t^0 = 0$ are

```{math}
u_i^0 = f(x_i) = \sin(\pi x_i),\qquad x_i = \frac{i}{4}.
```

Concretely,

```{math}
u_0^0 = 0,\quad
u_1^0 = \sin\left(\frac{\pi}{4}\right) = \frac{\sqrt{2}}{2},\quad
u_2^0 = \sin\left(\frac{\pi}{2}\right) = 1,\quad
u_3^0 = \sin\left(\frac{3\pi}{4}\right) = \frac{\sqrt{2}}{2},\quad
u_4^0 = 0.
```

**Optional compact matrix form.** Collect the interior unknowns into $U^j = [u_1^j\ \ u_2^j\ \ u_3^j]^T$. Then

```{math}
U^{j+1} = A\,U^j,\qquad
A =
\begin{bmatrix}
\frac12 & \frac14 & 0 \\
\frac14 & \frac12 & \frac14 \\
0 & \frac14 & \frac12
\end{bmatrix},
\qquad j = 0,1,2,3,
```

with

```{math}
U^0 = \begin{bmatrix}\frac{\sqrt{2}}{2} \\ 1 \\ \frac{\sqrt{2}}{2}\end{bmatrix}.
```

**Final time level.** With $T = \tfrac{1}{16}$ and $k = \tfrac{1}{64}$, we have $M = T/k = 4$, so the final solution on the grid is

```{math}
\left[u_0^4,\ u_1^4,\ u_2^4,\ u_3^4,\ u_4^4\right]^T
\quad \text{at} \quad
t^4 = T.
```

The boundary values satisfy $u_0^4 = u_4^4 = 0$.

**Explicit FTCS (forward Euler in time, centered in space).** For $\lambda = \tfrac14$, the explicit update is

```{math}
u_i^{j+1} = \tfrac12 u_i^j + \tfrac14 u_{i-1}^j + \tfrac14 u_{i+1}^j,\qquad i = 1,2,3.
```

Starting from $u_i^0 = \sin(\pi x_i)$, the final-time values at $j = 4$ are

```{math}
u_0^4 = 0,\qquad
u_1^4 = \frac{3}{16} + \frac{17\sqrt{2}}{128} \approx 0.37532524,
```

```{math}
u_2^4 = \frac{17}{64} + \frac{3\sqrt{2}}{16} \approx 0.53079004,\qquad
u_3^4 = u_1^4,\qquad
u_4^4 = 0.
```

Thus

```{math}
U_{\text{FTCS}}^4 =
\begin{bmatrix}
0 \\
0.37532524 \\
0.53079004 \\
0.37532524 \\
0
\end{bmatrix}.
```

### The Crank-Nicolson (Implicit) Scheme

An alternative to the explicit scheme is an implicit approach given by the Crank-Nicolson scheme. We again discretize $0 \leq x \leq 1$ and $0 \leq t \leq T$ with

```{math}
x_i = ih,\quad i = 0,1,\dots,N,\qquad (Nh = 1),
```

```{math}
t^j = jk,\quad j = 0,1,\dots,M,\qquad (Mk = T),
```

and $u_i^j \approx u(x_i,t^j)$. For interior indices $i = 1,\dots,N-1$, the Crank-Nicolson method uses a forward difference in time and the average of centered second differences in space at time levels $j$ and $j+1$:

```{math}
\frac{u_i^{j+1} - u_i^j}{k}
= \frac12\left[
\frac{u_{i+1}^j - 2u_i^j + u_{i-1}^j}{h^2}
+
\frac{u_{i+1}^{j+1} - 2u_i^{j+1} + u_{i-1}^{j+1}}{h^2}
\right].
```

Introduce $\lambda := k/h^2$. Multiplying through and collecting unknowns at time level $j+1$ on the left yields

```{math}
\begin{aligned}
-\frac{\lambda}{2}\,u_{i-1}^{j+1} + (1+\lambda)\,u_i^{j+1} - \frac{\lambda}{2}\,u_{i+1}^{j+1}
=
\frac{\lambda}{2}\,u_{i-1}^{j} + (1-\lambda)\,u_i^{j} + \frac{\lambda}{2}\,u_{i+1}^{j},
\qquad i = 1,\dots,N-1.
\end{aligned}
```

Boundary and initial conditions are imposed as before:

```{math}
u_0^j = 0,\quad u_N^j = 0\quad (j = 0,\dots,M),\qquad
u_i^0 = f(x_i)\quad (i = 0,\dots,N).
```

```{figure} ../pics/fig7.png
:width: 50%
:name: fig:fig7

Crank-Nicolson stencil: points at both $j$ and $j+1$ enter one equation.
```

**Stencil for the CN equation.** The Crank-Nicolson equation at $(i,j) \to (i,j+1)$ involves six points: $(i-1,i,i+1)$ at both time levels $j$ and $j+1$.

**Accuracy and stability (context).** Crank-Nicolson is second order in time and second order in space, with truncation error $\mathcal{O}(k^2 + h^2)$. For the diffusion equation it is unconditionally stable in the usual von Neumann sense.

**Illustrative example.** We use the mesh in {numref}`fig:cn_mesh` and set

```{math}
f(x) = \sin(\pi x),\qquad
h = \frac14,\qquad k = \frac{1}{64},\qquad T = \frac{1}{16}.
```

Then $N = 4$, $M = 4$, and

```{math}
x_i = \frac{i}{4},\ i = 0,\dots,4,\qquad
t^j = \frac{j}{64},\ j = 0,\dots,4,\qquad
\lambda = \frac{k}{h^2} = \frac14.
```

```{figure} ../pics/fig8.png
:width: 50%
:name: fig:cn_mesh

Full grid for the Crank-Nicolson discretization with the same $h$, $k$, and $T$ as the explicit example.
```

**Discrete CN equations on this grid.** Here $\lambda = \tfrac14$ and $\lambda/2 = \tfrac18$. The interior equation becomes

```{math}
\begin{aligned}
-\frac18\,u_{i-1}^{j+1} + \frac54\,u_i^{j+1} - \frac18\,u_{i+1}^{j+1}
=
\frac18\,u_{i-1}^{j} + \frac34\,u_i^{j} + \frac18\,u_{i+1}^{j},
\qquad i = 1,2,3,\ \ j = 0,1,2,3.
\end{aligned}
```

Imposing $u_0^j = 0$ and $u_4^j = 0$ for all $j$, the three interior equations are

```{math}
\begin{aligned}
\frac54\,u_1^{j+1} - \frac18\,u_2^{j+1}
&= \frac34\,u_1^{j} + \frac18\,u_2^{j}, \\
-\frac18\,u_1^{j+1} + \frac54\,u_2^{j+1} - \frac18\,u_3^{j+1}
&= \frac18\,u_1^{j} + \frac34\,u_2^{j} + \frac18\,u_3^{j}, \\
-\frac18\,u_2^{j+1} + \frac54\,u_3^{j+1}
&= \frac18\,u_2^{j} + \frac34\,u_3^{j},
\qquad j = 0,1,2,3.
\end{aligned}
```

Initial data at $t^0 = 0$ is

```{math}
u_i^0 = \sin(\pi x_i),\qquad x_i = \frac{i}{4},
```

so

```{math}
u_0^0 = 0,\quad
u_1^0 = \sin\left(\frac{\pi}{4}\right) = \frac{\sqrt{2}}{2},\quad
u_2^0 = \sin\left(\frac{\pi}{2}\right) = 1,\quad
u_3^0 = \sin\left(\frac{3\pi}{4}\right) = \frac{\sqrt{2}}{2},\quad
u_4^0 = 0.
```

**Compact matrix form (tri-diagonal solve each time step).** Let $U^j = [u_1^j\ \ u_2^j\ \ u_3^j]^T$. Then for $j = 0,1,2,3$,

```{math}
A\,U^{j+1} = B\,U^{j},
```

with

```{math}
\begin{aligned}
A &=
\begin{bmatrix}
\frac54 & -\frac18 & 0 \\
-\frac18 & \frac54 & -\frac18 \\
0 & -\frac18 & \frac54
\end{bmatrix}, \\
B &=
\begin{bmatrix}
\frac34 & \frac18 & 0 \\
\frac18 & \frac34 & \frac18 \\
0 & \frac18 & \frac34
\end{bmatrix}.
\end{aligned}
```

For general $N$, $A$ and $B$ are $(N-1) \times (N-1)$ tri-diagonal matrices. This linear system can be solved efficiently by the Thomas algorithm.

**Crank-Nicolson final solution.** For $\lambda = \tfrac14$, solving the resulting $3 \times 3$ tridiagonal system at each time step $j = 0,1,2,3$ gives

```{math}
u_0^4 = 0,\qquad
u_1^4 \approx 0.39321044,\qquad
u_2^4 \approx 0.55608354,\qquad
u_3^4 = u_1^4,\qquad
u_4^4 = 0,
```

that is,

```{math}
U_{\text{CN}}^4 =
\begin{bmatrix}
0 \\
0.39321044 \\
0.55608354 \\
0.39321044 \\
0
\end{bmatrix}.
```

**Reference exact PDE solution at $T$.** For $f(x) = \sin(\pi x)$ with homogeneous Dirichlet boundary conditions, the exact solution is

```{math}
u(x,t) = e^{-\pi^2 t}\sin(\pi x).
```

At $T = \tfrac{1}{16}$, the exact values at the grid nodes are

```{math}
u(0,T) = 0,\quad u\left(\tfrac14,T\right) \approx 0.38158415,\quad
u\left(\tfrac12,T\right) \approx 0.53964149,\quad
u\left(\tfrac34,T\right) \approx 0.38158415,\quad u(1,T) = 0.
```

| $x_i$ | FTCS $u_i^4$ | CN $u_i^4$ | Exact $u(x_i,T)$ | $\lvert \text{FTCS} - \text{Exact} \rvert$ | $\lvert \text{CN} - \text{Exact} \rvert$ |
| --- | ---: | ---: | ---: | ---: | ---: |
| $0$ | $0.00000000$ | $0.00000000$ | $0.00000000$ | $0$ | $0$ |
| $\tfrac14$ | $0.37532524$ | $0.39321044$ | $0.38158415$ | $0.00625892$ | $0.01162629$ |
| $\tfrac12$ | $0.53079004$ | $0.55608354$ | $0.53964149$ | $0.00885144$ | $0.01644205$ |
| $\tfrac34$ | $0.37532524$ | $0.39321044$ | $0.38158415$ | $0.00625892$ | $0.01162629$ |
| $1$ | $0.00000000$ | $0.00000000$ | $0.00000000$ | $0$ | $0$ |

**Comparison of results.**

- Both schemes preserve symmetry about $x = \tfrac12$ and satisfy the homogeneous boundary conditions exactly on the grid.
- Even though Crank-Nicolson is higher order in time, it is not closer to the continuous exact solution here because the error is dominated by the spatial discretization.
- If the goal is to accurately integrate the semi-discrete ODE system after space discretization, Crank-Nicolson is much more accurate per step than FTCS.

### Explicit vs. Crank-Nicolson Schemes: Final Remarks

- **Form of the update.** Explicit FTCS computes $u_i^{j+1}$ directly from values at time level $j$, while Crank-Nicolson couples $u_i^{j+1}$ to neighboring unknowns and requires a linear solve at each step.
- **Accuracy in time.** Explicit FTCS is first order in time, $\mathcal{O}(k + h^2)$, while Crank-Nicolson is second order in time, $\mathcal{O}(k^2 + h^2)$.
- **Stability.** Explicit FTCS is conditionally stable for the heat equation and typically requires $\lambda = \tfrac{k}{h^2} \leq \tfrac12$ in 1D, while Crank-Nicolson is unconditionally stable.
- **Cost per time step.** Explicit FTCS is a simple local update with $\mathcal{O}(N)$ arithmetic, while Crank-Nicolson solves a tri-diagonal system each step.
- **Practical behavior.** Explicit FTCS is often forced to take very small $k$ when $h$ is small, while Crank-Nicolson permits larger $k$ without instability, though very large $k/h^2$ can still lead to nonphysical time oscillations.

## Numerical Solution to Hyperbolic PDEs

A second type of time-dependent PDE is the hyperbolic type. A common prototype is the wave equation.

**1D wave equation with fixed ends.** Consider the initial-boundary value problem

```{math}
:label: eq:wave

u_{tt} = c^2 u_{xx}, \qquad 0 \leq x \leq L,\ \ t \geq 0,
```

```{math}
:label: eq:bc

u(0,t) = 0,\quad u(L,t)=0, \qquad t \geq 0,
```

```{math}
:label: eq:ic1

u(x,0) = f(x), \qquad 0 \leq x \leq L,
```

```{math}
:label: eq:ic2

u_t(x,0) = g(x), \qquad 0 \leq x \leq L.
```

### Explicit Central-Difference Scheme

Let the spatial grid be

```{math}
x_i = i\,h,\qquad i = 0,1,\dots,N,\qquad h = \frac{L}{N},
```

and the time grid be

```{math}
t_j = j\,k,\qquad j = 0,1,\dots,\qquad k = \Delta t.
```

Denote the numerical approximation by

```{math}
u_i^j \approx u(x_i,t_j).
```

Use second-order central differences:

```{math}
u_{tt}(x_i,t_j) \approx \frac{u_i^{j+1} - 2u_i^{j} + u_i^{j-1}}{k^2},
\qquad
u_{xx}(x_i,t_j) \approx \frac{u_{i+1}^{j} - 2u_i^{j} + u_{i-1}^{j}}{h^2}.
```

Substituting into {eq}`eq:wave` gives, for interior points $i = 1,\dots,N-1$,

```{math}
\frac{u_i^{j+1} - 2u_i^{j} + u_i^{j-1}}{k^2}
=
c^2\,\frac{u_{i+1}^{j} - 2u_i^{j} + u_{i-1}^{j}}{h^2}.
```

Define the Courant number

```{math}
r = \frac{c\,k}{h}.
```

Solving for the new time level yields the explicit update

```{math}
:label: eq:explicitwave

u_i^{j+1}
=
2u_i^{j} - u_i^{j-1}
+ r^2\left(u_{i+1}^{j} - 2u_i^{j} + u_{i-1}^{j}\right),
\qquad i = 1,\dots,N-1,\ \ j \geq 1.
```

Equivalently,

```{math}
u_i^{j+1} = 2(1-r^2)u_i^j + r^2(u_{i-1}^j + u_{i+1}^j) - u_i^{j-1}.
```

**Boundary conditions (fixed ends).** Impose the Dirichlet conditions at every time level:

```{math}
u_0^j = 0,\qquad u_N^j = 0,\qquad j \geq 0.
```

**Initialization from $f$ and $g$.** Set

```{math}
u_i^0 = f(x_i), \qquad i = 0,\dots,N,
```

with $u_0^0 = u_N^0 = 0$ consistent with the boundary conditions. To start the two-step recurrence {eq}`eq:explicitwave`, compute $u_i^1$ using a Taylor expansion:

```{math}
u(x_i,k) = u(x_i,0) + k\,u_t(x_i,0) + \frac{k^2}{2}u_{tt}(x_i,0) + \mathcal{O}(k^3).
```

Using $u_{tt}(x,0) = c^2u_{xx}(x,0)$ and approximating $u_{xx}(x_i,0)$ by the centered difference of $f(x)$ gives

```{math}
:label: eq:firststep

u_i^1
=
u_i^0 + k\,g(x_i)
+ \frac{r^2}{2}\left(u_{i+1}^0 - 2u_i^0 + u_{i-1}^0\right).
```

Set $u_0^1 = u_N^1 = 0$.

```{figure} ../pics/fig9.png
:width: 50%
:name: fig:fig9

Stencil for the explicit second-order wave scheme: $u_i^{j+1}$ depends on $(u_{i-1}^j, u_i^j, u_{i+1}^j)$ and $u_i^{j-1}$.
```

**Stencil.** The update pattern is shown in {numref}`fig:fig9`.

**Illustrative example.** Consider

```{math}
u_{tt} = c^2 u_{xx},\quad x \in (0,1),\ t > 0,\qquad
u(0,t) = u(1,t) = 0,
```

with $c = 1$,

```{math}
u(x,0) = \sin(\pi x),\qquad u_t(x,0) = 0.
```

The exact solution is

```{math}
u(x,t) = \cos(\pi t)\sin(\pi x).
```

Take $\Delta x = 0.25$ so $x_i = i\Delta x$, $i = 0,\dots,4$, and $\Delta t = 0.2$ so $t^n = n\Delta t$, $n = 0,1,2$. The Courant number is

```{math}
r = \frac{c\Delta t}{\Delta x} = \frac{0.2}{0.25} = 0.8 \leq 1.
```

For interior nodes $i = 1,2,3$,

```{math}
u_i^{n+1} = 2u_i^n - u_i^{n-1} + r^2\left(u_{i+1}^n - 2u_i^n + u_{i-1}^n\right).
```

Startup at $n = 0$ using $u_t(x,0) = 0$:

```{math}
u_i^{1} = u_i^{0} + \frac{r^2}{2}\left(u_{i+1}^0 - 2u_i^0 + u_{i-1}^0\right).
```

Boundary values for all $n$ satisfy $u_0^n = u_4^n = 0$.

At the grid nodes $x = [0,\,0.25,\,0.5,\,0.75,\,1]$, the numerical values are

```{math}
u^0 = [0,\ 0.7071,\ 1.0000,\ 0.7071,\ 0],
```

```{math}
u^1 = [0,\ 0.5746,\ 0.8125,\ 0.5746,\ 0],
```

```{math}
u^2 = [0,\ 0.2266,\ 0.3205,\ 0.2266,\ 0].
```

At the final time $T = 0.4$, we compare the numerical and exact solutions in {numref}`tab:hyp` and {numref}`fig:plot_hyp`. As in the parabolic example, the error drops with finer spatial resolution, and the numerical solution preserves the symmetry of the exact solution.

```{table} Comparison of numerical and exact solutions for the 1D wave equation
:name: tab:hyp

| $x_i$ | $u_i$ (FD) | $u(x_i,0.4)$ exact | error |
| --- | ---: | ---: | ---: |
| $0.00$ | $0.0000$ | $0.0000$ | $0.0000$ |
| $0.25$ | $0.2266$ | $0.2185$ | $0.0081$ |
| $0.50$ | $0.3205$ | $0.3090$ | $0.0115$ |
| $0.75$ | $0.2266$ | $0.2185$ | $0.0081$ |
| $1.00$ | $0.0000$ | $0.0000$ | $0.0000$ |
```

```{figure} ../pics/fig10.png
:width: 50%
:name: fig:plot_hyp

Plot of the numerical and exact solution at $T = 0.4$.
```

[^dirichlet-neumann]: Specifying partial derivatives of $u$ on the boundaries gives Neumann boundary conditions. Boundary conditions can mix Dirichlet and Neumann types.
