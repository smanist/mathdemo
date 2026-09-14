---
title: Longitudinal Aircraft Modes by Matrix Exponentials
---

# Longitudinal Aircraft Modes by Matrix Exponentials

The longitudinal response of an aircraft commonly contains a fast,
pitch-dominated motion and a slower motion involving airspeed and flight path.
This time-compressed teaching model represents those motions with two tunable
second-order blocks,

```{math}
\dot{\mathbf z}
=
\begin{bmatrix}
B_f&0\\
0&B_s
\end{bmatrix}\mathbf z,
\qquad
B_j=
\begin{bmatrix}
0&1\\
-k_j&-c_j
\end{bmatrix}.
```

The eigenvalues of either block are

```{math}
\lambda_{j,\pm}
=\frac{-c_j\pm\sqrt{c_j^2-4k_j}}{2}.
```

Consequently, changing only the damping coefficient $c_j$ and restoring
coefficient $k_j$ can produce a conjugate pair, two distinct real roots, a
repeated root, a saddle, or an unstable pair. The default values give a fast
period of about two seconds and a slow period of about eight seconds so both
patterns are visible in a short animation.

## From Modal Coordinates to Aircraft Motion

A fixed real transformation maps the modal coordinates to the normalized
aircraft state

```{math}
\mathbf x=
\begin{bmatrix}
\Delta u/U_0&\alpha&q&\theta
\end{bmatrix}^{\mathsf T}
=T\mathbf z.
```

The transformation is chosen so the fast block is dominated by angle of attack
and pitch rate, while the slow block is dominated by airspeed and flight-path
motion. In physical coordinates,

```{math}
\dot{\mathbf x}=A\mathbf x,
\qquad
A=T\operatorname{diag}(B_f,B_s)T^{-1},
\qquad
\boxed{\mathbf x(t)=e^{At}\mathbf x_0}.
```

The side-view animation reconstructs the flight-path angle using
$\gamma\approx\theta-\alpha$. Its vertical scale and attitude angles are
visually exaggerated, but the relative timing, phase, decay, and growth of the
modes follow the matrix-exponential solution.

Use a preset for a quick comparison, or edit the four modal coefficients. The
aircraft view, eigenvalue plane, mode shapes, and state histories update
together. When a block has two real roots, its individual eigenvalue
contributions are also available in the **Motion shown** menu.
Choose **Selected motion (pure modal)** as the initial disturbance to keep the
response entirely inside the fast block, slow block, or selected real
eigenvector shown by that menu.

:::{container} course-interactive course-interactive-m3-aircraft-modes
Interactive example loading...
:::
