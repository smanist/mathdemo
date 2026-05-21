# Fourier Series of a Square Wave

The square wave in this demo takes the value $1$ on
$[-\pi,-\pi/2]\cup[\pi/2,\pi]$ and the value $0$ on $[-\pi/2,\pi/2]$, then
repeats periodically.

Its notebook prototype approximated that signal with partial sums of the
Fourier series

```{math}
S_N(x)=\frac{1}{2}+\sum_{k=1}^{N-1}(-1)^k\frac{2}{(2k-1)\pi}\cos((2k-1)x).
```

Use the slider in the interactive plot to change the number of displayed terms.
As the partial sums approach the jump discontinuities, the overshoot remains
visible; this is the Gibbs phenomenon.

:::{container} course-interactive course-interactive-fourier-gibbs
Interactive example loading...
:::
