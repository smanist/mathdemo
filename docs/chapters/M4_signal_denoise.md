# Signal Denoising Placeholder

Suppose we have a sinusoidal signal, such as a simplified measurement from an
IMU:

```{math}
:label: eq:signal-denoise-signal
f(t) = \sin(2\pi t).
```

The measured signal is contaminated by noise:

```{math}
:label: eq:signal-denoise-noisy
y(t) = f(t) + \epsilon(t).
```

The example below shows the noisy time-domain
signal, its Fourier spectrum, and a low-pass filtered reconstruction. Use the
numeric input to change the noise level, then use the slider to adjust
the filtering threshold.

:::{container} course-interactive course-interactive-signal-denoise
Interactive example loading...
:::

