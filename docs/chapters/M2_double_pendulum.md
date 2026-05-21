---
title: Double Pendulum Simulation
---

# Double Pendulum Simulation

This page migrates the source notebook `M2_double_pendulum.ipynb` into the
site's static Sphinx/MyST format. The browser recomputes the motion for the
same parameter set exposed by the notebook: gravity, the two rod lengths, and
the two bob masses.

The source notebook keeps the initial conditions fixed at
$\theta_1(0)=120^\circ$, $\theta_2(0)=-10^\circ$, and
$\dot{\theta}_1(0)=\dot{\theta}_2(0)=0$, so this migrated version does the
same instead of inventing extra controls.

The notebook title says "See when it repeats itself", but the source only
renders an animation and does not implement repeat detection. This page keeps
that behavior and shows the evolving motion with a trailing path.

:::{container} course-interactive course-interactive-m2-double-pendulum
Interactive example loading...
:::
