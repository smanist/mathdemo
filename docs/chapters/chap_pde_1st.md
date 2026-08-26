---
title: First-Order Partial Differential Equations
date: 12/18/2023
---

```{sectnum}
:depth: 5
```

# First-Order Partial Differential Equations

## Learning Objectives

After learning this chapter, you will be able to:

+ Understand the physical meaning of a first-order PDE.
+ Understand the concept of characteristics in a nonlinear setting.
+ Use the method of characteristics to solve first-order PDEs.


## Introduction

In this chapter we consider a special type of Partial Differential Equations (PDEs) that have only first-order partial derivatives, i.e., first-order PDEs. Just like the second-order PDEs that we have seen, first-order PDEs play a fundamental role in many engineering applications.

One important example is the Euler equation for compressible inviscid flow; aerodynamic solvers based on Euler equations have been widely used as cost-effective tools for the preliminary design of subsonic, transonic and supersonic aircraft. The simplified one-dimensional Euler equation reads

```{math}
\begin{aligned}
\rho_t + u\rho_x &= 0 \\
u_t + \frac{1}{\rho}p_x &= 0 \\
e_t + ue_t &= 0
\end{aligned}
```

where $\rho$ is the gas density, $u$ the velocity, and $e$ the energy; $p$ is pressure as a function of $\rho$ and $u$. As usual, the subscripts denote partial derivatives, e.g., $u_t = \ppf{u}{t}$. Clearly, the Euler equations are PDEs that only involve first-order derivatives.

Another example is the traffic flow equation,

```{math}
u_t+uu_x=0,\quad u(x,0)=\phi(x)
```

where $u$ is the "density" of vehicles, $\phi$ gives the initial distribution of vehicles, and the PDE predicts how the vehicles would be distributed over time. Unlike the previous example, the traffic flow equation is a scalar one, i.e., there is only one unknown variable. Yet, this surprisingly simple equation can explain the so-called phantom traffic jams, where dense traffic comes to a halt and restarts for no apparent reason.


## Model Problem

This chapter will focus on the scalar first-order PDEs, and solve a model problem in the following form:

```{math}
:label: eq:pde_model

\begin{aligned}
\text{PDE:} &\quad u_t+V(u,x,t)u_x = S(u,x,t) \\
\text{Initial condition:} &\quad u(x,0) = \phi(x)
\end{aligned}
```

where $u(x,t)$ is defined for $x\in(-\infty,\infty)$ and $t\in[0,\infty)$, i.e., the entire upper part of the $x$-$t$ plane. Due to the presence of the initial condition, which is defined on the entire $x$-axis, {eq}`eq:pde_model` is an **initial value problem** (IVP).

(sec:mean)=
### What does the PDE really mean?

The equation has three terms, and let us look at them one by one. To facilitate a qualitative and tangible understanding, we can think of $u$ as the density distribution of some gas that varies over space $x$ and time $t$; in this setup, the initial density distribution is given by $\phi(x)$. Also, for simplicity, assume $V$ and $S$ are constant.

First, the $u_t$ term is perhaps the most straightforward one to understand: it means the rate of change in the unknown variable, e.g., how the density varies over time. Next, ignoring $V u_x$, let us look at the combined effect of $u_t$ and $S$, i.e., $u_t=S$; this equation simply defines the rate of change in $u$. In our example, $S$ functions as a source (sink) that adds (removes) gas from the density distribution. Hence, we usually call $S$ the **source** term, with the understanding that a sink is as if a "negative source".

Subsequently, let us look at the combined effect of $u_t$ and $V u_x$, ignoring the effect of the source term $S$. This gives us an equation

```{math}
:label: eq:meaning

u_t + V u_x = 0,\quad u(x,0) = \phi(x)
```

When $V$ is constant, we can verify that the solution to {eq}`eq:meaning` is

```{math}
:label: eq:msol

u(x,t) = \phi(x-Vt)
```

&clubs; Exercise: Verify the solution as an exercise. This can be done by checking if {eq}`eq:msol` satisfies *both* the PDE and initial condition in {eq}`eq:meaning`.

&clubs; We will show how to find this solution very soon.

What does {eq}`eq:msol` mean? If we substitute in some numbers: at $t=1$, $u(x,t) = \phi(x-V)$, and $\phi(x-V)$ is simply the initial condition $\phi(x)$ shifted to the right by $V$; then at $t=2$, $u(x,t) = \phi(x-2V)$ is $\phi(x)$ shifted to the right by $2V$, and so on. To summarize, {eq}`eq:msol` represents that the initial condition $\phi(x)$ is constantly shifted to the right at a rate of $V$. In our example, this can mean that there is constantly a wind blowing from left to right at the velocity $V$, that moves the initial gas distribution to the right at the same rate; this phenomenon is **advection**.

At this point, we can conclude that, qualitatively, the first-order PDE describes the time variation of some quantity due to the combined effects of *source* and *advection*.

### Plan of attack

Now return to the more general model problem {eq}`eq:pde_model`. You might have noticed two key differences from the second-order PDEs we have solved so far:

1. {eq}`eq:pde_model` does not have boundary conditions. There are fewer conditions to satisfy and our life is thus *easier*.
2. {eq}`eq:pde_model` can be nonlinear, i.e., we might have terms involving products of unknown functions and their derivatives. For example, if $V(u,x,t)=u^2$, we would get a nonlinear convection term $u^2 u_x$ in the PDE. The nonlinearity would make our life *harder*.

Yet, luckily, {eq}`eq:pde_model` can be viewed as *quasi-linear*, in the sense that the $u_t$ and $u_x$ terms are always first-order regardless of the nonlinearity in $V$ and $S$. Here "first-order" means that we do not have "strange" terms such as $u_t^2$, $\sqrt{u_x}$, $\sin(u_t)$, etc. We will leverage this quasi-linearity and use a modified version of the **method of characteristics** to solve the IVP of first-order PDEs.


## Method of Characteristics: Nonlinear Version

### What are characteristics

#### Definition

Let us look again at the simple problem of advection with constant velocity in {ref}`sec:mean`:

```{math}
u_t+Vu_x=0,\quad u(x,0)=\phi(x)
```

The solution is {eq}`eq:msol`, $u(x,t)=\phi(x-Vt)$. If we define a new variable $\eta(x,t)=x-Vt$, then $u$ can be written as a *uni-variate* function $u(\eta)$. This fact actually has a non-trivial implication for constant advection: for whatever combination of $(x,t)$, as long as $\eta$ is the same, $u$ remains the same.

A geometrical intuition helps here. In the numerical example, we simply set $V=1$, and $\eta=x-Vt=x-t$ represents a straight line with a slope $1/V=1$ that intersects the $x$-axis at $x=\eta$. Also, we pick an initial condition for the IVP

```{math}
\phi(x)=\exp(-(x-2)^2/2)
```

This function is like a single wave: it has a peak of 1 at $x=2$ and is almost zero when $x<1$ or $x>3$.

Now we start from an arbitrary point on the $x$-axis, say $x=\eta=2$; at this point $\phi(2)=1$ and $t=0$. Associated with the point $(x,t)=(2,0)$, we have a curve $2=x-t$. We can verify that the values of $u$ at all the points on this curve, e.g., $(3,1)$, $(4,2)$, $(5,3)$, etc., are the same as the value at the point on the $x$-axis $(x,t)=(2,0)$, i.e.,

```{math}
u(3,1)=u(4,2)=u(5,3)=\cdots=u(2,0)=\phi(2)=1
```

Furthermore, note that the choice of point on the $x$-axis is arbitrary. This means we can just pick any $x=\eta$ on the $x$-axis, and find a curve $\eta=x-Vt$; on this curve $u$ is constantly $\phi(\eta)$.

&clubs; Exercise: Consider $\phi(1.5)\approx 0.5$, and identify the combinations $(x,t)$ for which $u=\phi(1.5)$.

To sum up at this point, in the constant advection problem, the equation $\eta=x-Vt$ represents a family of special curves with a parameter $\eta$; every point on the $x$-axis emanates one curve and it runs forward in time. On each curve the variation of $u$ is *greatly simplified*, in the current case of which $u$ becomes constant. This type of special curve is called the characteristic lines, or **characteristics** for short.

#### Fixed and moving frames

So far we have been looking at one characteristic at a time; this is as if we slice the solution $u$ and the $(x,t)$ plane along the characteristics, so that we only look at this slice.

There are certainly other ways to slice the solution $u$, one of which is to slice at a time $t$. In this case, we can think of the characteristics as *rails*. Along the rails, a slice of solution at $t=0$, $u(x,0)$, moves forward by time $t$, and arrives at another slice of solution $u(x,t)$. Depending on the shape of the rails, the slice can shift to the right or left, dilute or shrink, and so on. In the constant advection problem, the characteristics run straight to the right, hence the slice of solution simply shifts to the right at a constant rate. We call this perspective of "characteristics as rails" the **fixed frame**, since we are as if sitting on the $x$-axis and watching the slice of solution move forward in time.

There is also a view of a **moving frame**. Following the analogy of rails, we ourselves are simply moving on the rails together with the solution. As a result, we would not sense any shift in the slice of solution, and rather would sense only the change in the distribution of the solution. In the constant advection problem, the shape remains the same, hence in the moving frame, we would sense *no* change at all. Mathematically, the moving frame is equivalent to having a change of variables and writing the solution in terms of $\eta$ and $t$.

### Finding characteristics

The key takeaway from the previous section is that, if we can find the characteristics of a first-order PDE, then we probably can use the characteristics to simplify and solve the IVP. Now the question becomes how to find the characteristics. To do so we will leverage the concept of total derivative from multi-variate calculus.

The total derivative of a multivariate function $u(x,t)$ with respect to $t$ is

```{math}
:label: eq:td

\Cr{\ddf{u}{t}} = u_x \Cb{\ddf{x}{t}} + u_t
```

Now we rearrange the first-order PDE and compare it side by side with {eq}`eq:td`,

```{math}
:label: eq:pde

\Cr{S} = u_x \Cb{V} + u_t
```

Clearly, there is a striking similarity between {eq}`eq:td` and {eq}`eq:pde`, highlighted by the color coding. Since the total derivative formula {eq}`eq:td` is valid for an arbitrary function, the similarity indicates that our first-order PDE should be representing some form of total derivative of $u$ *as well*. In other words, it seems natural to set

```{math}
:label: eq:odes

\ddf{u}{t} = S,\quad \ddf{x}{t}=V
```

If we solve the second ODE starting from a point $P$ on the $x$-axis, e.g., $x=\eta$, $t=0$, then we would find $x$ as a function of $t$ that passes through the point $(\eta,0)$. For example, in the constant advection problem, we can solve

```{math}
\ddf{x}{t}=V,\quad x(t=0)=\eta
```

to find $x=Vt+\eta$, or $\eta=f(x,t)=x-Vt$. This is exactly what we called the characteristics, and this line starts from the point $(\eta,0)$ and runs forward in time.

Next, at point $P$, we also know $u(\eta,0)=\phi(\eta)$, so we can supply the first ODE in {eq}`eq:odes` with initial conditions $t=0$, $u=\phi(\eta)$. For example, in the constant advection problem, we have $S=0$ and

```{math}
\ddf{u}{t}=0,\quad u(t=0)=\phi(\eta)
```

Clearly the solution is $u=\text{const}=\phi(\eta)$, which is valid along the characteristics.

Lastly, once we have found the characteristics equation $\eta=f(x,t)$ and the solution $u$ along the characteristics, we can combine the solutions to find the solution to the first-order PDE. Again, for the example of constant advection, we know $\eta=x-Vt$ and $u=\phi(\eta)$, and thus the final solution is

```{math}
u(x,t) = \phi(\eta) = \phi(x-Vt)
```

just exactly as what we found earlier in {eq}`eq:msol`.

### Summary of method

The above discussion lays out the steps of the method of characteristics for the IVP of a first-order PDE. The method can be summarized in three steps.

First, convert the problem into two IVPs of ODEs:

```{math}
\begin{aligned}
\ddf{x}{t}&=V,\quad x(t=0)=\eta \\
\ddf{u}{t}&=S,\quad u(t=0)=\phi(\eta)
\end{aligned}
```

Second, solve the two ODEs and obtain (1) $x$ as a function of $(t,\eta)$ and (2) $u$ as a function of $(t,\eta)$.

Third, rearrange $x(t,\eta)$ to obtain the characteristics $\eta=f(x,t)$; eliminate $\eta$ in $u$ and obtain the final solution $u(x,t)$.


## Examples

Here we provide a series of examples of increasing complexity, and illustrate the typical behaviors of first-order PDEs. When not explicitly specified, we continue to use the single wave equation, $\phi(x)=\exp(-(x-2)^2/2)$, as the initial condition for the IVP.

### Non-uniform advection: Homogeneous case

We consider the following problem

```{math}
:label: eq:eg1

u_t+e^{-t}u_x = 0,\quad u(x,0) = \phi(x)
```

First, we identify that $V=e^{-t}$ and $S=0$, which gives us the ODEs

```{math}
\begin{aligned}
\ddf{x}{t}&=V=e^{-t},\quad x(t=0)=\eta \\
\ddf{u}{t}&=S=0,\quad u(t=0)=\phi(\eta)
\end{aligned}
```

Here $\eta$ means we are picking an arbitrary point $x=\eta$ on the $x$-axis.

Next, we solve the first ODE for the characteristics. From the ODE we find $x = -e^{-t} + d_0$ with undetermined coefficient $d_0$. From the IC, $\eta=-e^{-0}+d_0$, we find $d_0=\eta+1$, so the characteristics are

```{math}
x = -e^{-t} + \eta + 1,\quad\text{or}\quad \eta = x + e^{-t} - 1
```

Intuitively, thinking of $\ddf{x}{t}$ as the speed of advection, the ODE indicates that the speed decreases over time.

Subsequently, we solve the second ODE that tells us the evolution of $u$ along one characteristic. In this example, the ODE is easy to solve, and $u$ stays constant all the time:

```{math}
u=\phi(\eta)
```

Intuitively, since the source term is zero, nothing is added or removed from $u$, and hence $u$ is not changing over time.

Lastly, we combine the ODE solutions to obtain the complete PDE solution:

```{math}
u(x,t)=\phi(\eta)=\phi(x + e^{-t} - 1)
```

The characteristics act as rails, and the initial condition moves exactly along them. In the moving frame of the characteristics, i.e., moving at the given advection speed, we would see $u$ stay absolutely unchanged starting from the initial condition.

### Non-uniform advection: Non-homogeneous case

Next, we modify the problem a little bit:

```{math}
:label: eq:eg2

u_t+e^{-t}u_x = -u^2,\quad u(x,0) = \phi(x)
```

First, we identify that $V=e^{-t}$ and $S=-u^2$, which gives us the ODEs

```{math}
\begin{aligned}
\ddf{x}{t}&=V=e^{-t},\quad x(t=0)=\eta \\
\ddf{u}{t}&=S=-u^2,\quad u(t=0)=\phi(\eta)
\end{aligned}
```

Next, the first ODE is the same as the previous example, and the characteristics have been found to be

```{math}
\eta = x + e^{-t} - 1
```

Subsequently, we solve the second ODE, which is more complex than the previous example. From the ODE,

```{math}
\begin{aligned}
\frac{\dd u}{-u^2} &= \dd t \\
\frac{1}{u} &= t + d_0 \\
u &= \frac{1}{t+d_0}
\end{aligned}
```

From the IC,

```{math}
u(t=0) = \phi(\eta) = \frac{1}{0+d_0}\quad\Rightarrow\quad d_0=\frac{1}{\phi(\eta)}
```

so the final ODE solution is

```{math}
u = \frac{1}{t+d_0} = \frac{1}{t+1/\phi(\eta)} = \frac{\phi(\eta)}{t\phi(\eta)+1}
```

Lastly, we combine the ODE solutions to obtain the complete PDE solution:

```{math}
u(x,t)=\frac{\phi(x + e^{-t} - 1)}{t\phi(x + e^{-t} - 1)+1}
```

Compared with the homogeneous case, the characteristics are the same, but the amplitude of the solution now decreases as time increases because of the source term.

&clubs; Exercise: What if the source term is $u^2$? First think intuitively, and then verify your intuition.

### Nonlinear advection

Lastly, we touch upon a more complex problem,

```{math}
:label: eq:eg3

u_t+uu_x = 0,\quad u(x,0) = \phi(x) = 1-x^2
```

You might recognize this equation from the motivating example of traffic flow.

We again start with identifying the ODEs

```{math}
\begin{aligned}
\ddf{x}{t}&=u,\quad x(t=0)=\eta \\
\ddf{u}{t}&=0,\quad u(t=0)=1-\eta^2
\end{aligned}
```

Note that now the ODE for characteristics basically says that the advection speed is larger when $u$ is larger, and the speed may become negative if $u$ is negative; the ODE now involves the unknown function $u$ and cannot be solved directly.

Instead, we attempt to first solve the ODE for $u$, which, luckily, is rather simple:

```{math}
u=\text{const}=1-\eta^2
```

Subsequently, returning to the first ODE, which now becomes

```{math}
\ddf{x}{t}=u=1-\eta^2,\quad x(t=0)=\eta
```

and we have $x=(1-\eta^2)t + d_0$. Using the IC, $\eta=(1-\eta^2)\times 0 + d_0$, we get $d_0=\eta$, so the characteristics equation is

```{math}
x=(1-\eta^2)t + \eta
```

The first complication we see here is that $\eta$ is an implicit function of $(x,t)$. But still, we could find an explicit expression of $\eta$ by solving a quadratic equation, and find

```{math}
\eta = \frac{1-\sqrt{1+4t^2-4xt}}{2t}
```

&clubs; Exercise: A quadratic equation always has two roots. Think about why we throw away one of the roots here.

&clubs; Hint: Look at $t=0$.

Lastly, we can combine the two ODE solutions to find the PDE solution,

```{math}
:label: eq:eg3s

u(x,t) = 1-\eta^2 = \frac{-1+2tx+\sqrt{1+4t^2-4xt}}{2t^2}
```

The solution looks relatively more complex than previous ones. A second complication appears here: the characteristics are no longer parallel to each other. In some regions, the lines move away from each other, while in some other regions the lines move closer. This non-uniformity is due to the dependency of advection speed on the solution $u$ itself. As a result, while $u$ would still move along the characteristics, the distribution would be distorted by the characteristics.

&clubs; Problem solved? Is {eq}`eq:eg3s` as "harmless" as it looks? For example, is the solution defined when $t=1/2$ and $x>1$?

&clubs; This is where we see a "shock" in the solution. We will discuss more in the advanced topics.


## Summary of Basic Modules

By now you should be able to:

+ Solve first-order PDEs using the method of characteristics.
+ Explain how the solution of a first-order PDE behaves along the characteristics.
+ Find the characteristics of a first-order PDE.
+ Use the characteristics to solve homogeneous and non-homogeneous first-order PDEs.
