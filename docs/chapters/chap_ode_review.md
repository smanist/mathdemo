---
title: Review - Analytical Methods for ODEs
---

# Review - Analytical Methods for ODEs

So far you should already know how to solve some first-order and second-order
ODEs, such as the following:

```{math}
\begin{aligned}
\text{ODE:} &\quad y'' + a y' + b y = r(t) \\
\text{Initial conditions:} &\quad y(0) = K_0,\quad y'(0) = K_1
\end{aligned}
```

## Example

Let us look at a particular example:

```{math}
y'' + 4y = \sin(2\pi t),\quad y(0)=1,\ y'(0)=0
```

We can solve it using the method of characteristic equation, which consists of
three steps.

### Step 1: Find the Homogeneous Solution

Find the homogeneous solution $y_h(t)$, which is the ODE without the
right-hand side:

```{math}
y_h'' + 4y_h = 0,\quad y_h(0)=1,\ y_h'(0)=0
```

1. The characteristic equation is $\lambda^2+4=0$, and we find
   $\lambda_{1,2}=\pm 2 i$.
2. The two roots correspond to two basic solutions:
   $y_{h1}=\cos(2t)$ and $y_{h2}=\sin(2t)$.
3. The general solution is $y_h(t) = c_1\cos(2t) + c_2\sin(2t)$, where
   $c_1$ and $c_2$ are undetermined coefficients.

### Step 2: Find the Particular Solution

Find the particular solution $y_p(t)$, which uses the right-hand side but
ignores the initial conditions:

```{math}
y_p'' + 4y_p = \sin(2\pi t)
```

1. Here we need some guessing work. The right-hand side is sine and the
   second-order derivative of sine is still sine, so we guess
   $y_p(t)=k\sin(2\pi t)$.
2. Substitute the assumed form into the ODE to determine the coefficient $k$:

   ```{math}
   y_p'' + 4y_p = -(2\pi)^2 k\sin(2\pi t) + 4 k\sin(2\pi t) = \sin(2\pi t)
   ```

   This gives $-4\pi^2k+4k=1$, so $k=\frac{1}{4-4\pi^2}$.
3. Therefore,
   $y_p(t)=\frac{1}{4-4\pi^2}\sin(2\pi t)$.

### Step 3: Determine the Coefficients

Find the undetermined coefficients in $y_h$.

1. The full solution is

   ```{math}
   y(t)=y_h(t)+y_p(t) = c_1\cos(2t) + c_2\sin(2t) + \frac{1}{4-4\pi^2}\sin(2\pi t)
   ```

   and the derivative is

   ```{math}
   y'(t) = -2c_1\sin(2t) + 2c_2\cos(2t) + \frac{2\pi}{4-4\pi^2}\cos(2\pi t)
   ```

2. Apply the initial conditions:

   ```{math}
   \left\{
   \begin{array}{ll}
   y(0)=1: &\quad c_1 + c_2\cdot 0 + 0 = 1 \\
   y'(0)=0: &\quad c_1\cdot 0 + 2c_2 + \frac{2\pi}{4-4\pi^2} = 0
   \end{array}
   \right.
   ```

   We find $c_1=1$ and $c_2=-\frac{\pi}{4-4\pi^2}$.
3. The final solution is

   ```{math}
   \boxed{y(t) = \cos(2t) - \frac{\pi}{4-4\pi^2} \sin(2t) + \frac{1}{4-4\pi^2}\sin(2\pi t)}
   ```

## Other Scenarios

There are certainly other scenarios in the method of characteristic equation.
For example, if the ODE were

```{math}
y''+4y'+4y = 0
```

then the characteristic equation is $\lambda^2+4\lambda+4=0$ with identical
roots $\lambda_{1,2}=-2$, and the homogeneous solution is

```{math}
y(t) = c_1e^{-2t} + c_2 te^{-2t}
```

If the ODE were

```{math}
y''+5y'+4y = 0
```

then the characteristic equation is $\lambda^2+5\lambda+4=0$ with two real
roots $\lambda_1=-1,\ \lambda_2=-4$, and the homogeneous solution is

```{math}
y(t) = c_1e^{-t} + c_2 e^{-4t}
```
