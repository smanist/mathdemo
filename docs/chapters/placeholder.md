# Placeholder Chapter

This is a placeholder chapter. Replace this file with your course material later.

(sec-fixed-point)=
## A Cross-Referenced Section

MyST supports Sphinx-style labels. For example, another page can link to this
section with `{ref}`sec-fixed-point``.

Equation labels work too:

```{math}
:label: eq:fixed-point
x = g(x)
```

The equation above can be referenced as {eq}`eq:fixed-point`.

You can also use inline math such as $f'(x)$ and display math:

$$
\int_0^1 x^2\,dx = \frac{1}{3}.
$$
