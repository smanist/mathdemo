---
title: Euler Method Comparison
---

# Euler Method Comparison

This demo compares four numerical methods for three initial value problems:

1. $y' = -20y$, $y(0)=1$
2. $y' = -20y + 20t^2 + 2t$, $y(0)=1$
3. $y' = \dfrac{y^2}{2t-1}$, $y(0)=1$

Use the controls to switch between cases, toggle methods, and change the step
size. The third case follows the notebook's formula, but the differential
equation is singular at $t=0.5$, so this browser port stops numerical stepping
before that point instead of guessing how the notebook intended to continue
through the singularity.

:::{container} course-interactive course-interactive-m2-euler-method-comparison
Interactive example loading...
:::

Questions to test while you explore:

1. Which methods show oscillations or instability as the step size increases?
2. Which methods appear to converge fastest as the step size decreases?
3. When every method behaves poorly, is the issue the method, the step size, or
   the problem itself?
