# Interactive Placeholder

This page shows the intended pattern for embedding an interactive example in the
middle of explanatory text.

The logistic map is the recurrence

```{math}
:label: eq:logistic-map
x_{n+1} = r x_n(1 - x_n).
```

The example below is a compact MyST placeholder. The static JavaScript discovers
it and attaches the controls and Plotly figure. Changing the initial value `x0`
recomputes the sequence in real time.

:::{container} course-interactive course-interactive-logistic-map
Interactive example loading...
:::

The text continues after the interactive element, and the equation can still be
referenced as {eq}`eq:logistic-map`. You can also link back to the first
placeholder chapter's section: {ref}`sec-fixed-point`.
