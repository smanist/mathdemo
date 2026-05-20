(function () {
  "use strict";

  const CDN = {
    plotly: "https://cdn.plot.ly/plotly-3.3.1.min.js",
    pyodideIndex: "https://cdn.jsdelivr.net/pyodide/v0.29.4/full/",
    p5: "https://cdnjs.cloudflare.com/ajax/libs/p5.js/2.0.5/p5.min.js",
    jsxgraphCss: "https://cdn.jsdelivr.net/npm/jsxgraph@1.6.2/distrib/jsxgraph.css",
    jsxgraphJs: "https://cdn.jsdelivr.net/npm/jsxgraph@1.6.2/distrib/jsxgraphcore.js",
  };

  const loadedScripts = new Map();
  let controlIdCounter = 0;
  let pyodidePromise = null;

  function loadScript(src) {
    if (loadedScripts.has(src)) {
      return loadedScripts.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.head.appendChild(script);
    });

    loadedScripts.set(src, promise);
    return promise;
  }

  function loadCss(href) {
    if ([...document.styleSheets].some((sheet) => sheet.href === href)) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  async function loadPlotly() {
    if (!window.Plotly) {
      await loadScript(CDN.plotly);
    }
    return window.Plotly;
  }

  async function loadPyodideRuntime() {
    if (!pyodidePromise) {
      pyodidePromise = loadScript(`${CDN.pyodideIndex}pyodide.js`).then(() =>
        window.loadPyodide({ indexURL: CDN.pyodideIndex })
      );
    }
    return pyodidePromise;
  }

  async function loadP5() {
    if (!window.p5) {
      await loadScript(CDN.p5);
    }
    return window.p5;
  }

  async function loadJsxGraph() {
    loadCss(CDN.jsxgraphCss);
    if (!window.JXG) {
      await loadScript(CDN.jsxgraphJs);
    }
    return window.JXG;
  }

  function numberFromDataset(element, key, fallback) {
    const value = Number(element.dataset[key]);
    return Number.isFinite(value) ? value : fallback;
  }

  function makeRangeControl({ label, min, max, step, value, onInput }) {
    const wrapper = document.createElement("div");
    wrapper.className = "course-interactive__control";

    const labelElement = document.createElement("label");
    const output = document.createElement("output");
    const input = document.createElement("input");

    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.id = `course-interactive-control-${controlIdCounter += 1}`;

    labelElement.htmlFor = input.id;
    function sync() {
      output.value = input.value;
      onInput(Number(input.value));
    }

    labelElement.append(label, " ", output);
    wrapper.append(labelElement, input);
    input.addEventListener("input", sync);
    sync();

    return wrapper;
  }

  function makeNumberInputControl({ label, min, max, step, value, onInput }) {
    const wrapper = document.createElement("div");
    wrapper.className = "course-interactive__control";

    const labelElement = document.createElement("label");
    const input = document.createElement("input");
    const message = document.createElement("div");

    input.type = "number";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.inputMode = "decimal";
    input.id = `course-interactive-control-${controlIdCounter += 1}`;

    message.className = "course-interactive__message";
    labelElement.textContent = label;
    labelElement.htmlFor = input.id;

    function sync() {
      const nextValue = Number(input.value);
      const isValid =
        input.value.trim() !== "" &&
        Number.isFinite(nextValue) &&
        nextValue >= min &&
        nextValue <= max;

      if (!isValid) {
        input.setAttribute("aria-invalid", "true");
        message.textContent = `Enter a number from ${min} to ${max}.`;
        return;
      }

      input.removeAttribute("aria-invalid");
      message.textContent = "";
      onInput(nextValue);
    }

    wrapper.append(labelElement, input, message);
    input.addEventListener("input", sync);
    sync();

    return wrapper;
  }

  function logisticSeries(r, x0, steps) {
    const x = [0];
    const y = [x0];
    let current = x0;

    for (let i = 1; i <= steps; i += 1) {
      current = r * current * (1 - current);
      x.push(i);
      y.push(current);
    }

    return { x, y };
  }

  function linearOdeData(k, x0, tFinal, requestedStep) {
    const stepCount = Math.max(1, Math.ceil(tFinal / requestedStep));
    const h = tFinal / stepCount;
    const exactSamples = 240;
    const exact = { t: [], x: [] };
    const explicit = { t: [0], x: [x0] };
    const implicit = { t: [0], x: [x0] };
    const rk2 = { t: [0], x: [x0] };
    const rk4 = { t: [0], x: [x0] };

    for (let i = 0; i <= exactSamples; i += 1) {
      const t = (tFinal * i) / exactSamples;
      exact.t.push(t);
      exact.x.push(x0 * Math.exp(k * t));
    }

    let explicitValue = x0;
    let implicitValue = x0;
    let rk2Value = x0;
    let rk4Value = x0;

    for (let i = 1; i <= stepCount; i += 1) {
      const t = i * h;

      explicitValue += h * k * explicitValue;
      explicit.t.push(t);
      explicit.x.push(explicitValue);

      const denominator = 1 - h * k;
      implicitValue = Math.abs(denominator) < 1e-12 ? NaN : implicitValue / denominator;
      implicit.t.push(t);
      implicit.x.push(implicitValue);

      const rk2a = k * rk2Value;
      const rk2b = k * (rk2Value + h * rk2a);
      rk2Value += (h * (rk2a + rk2b)) / 2;
      rk2.t.push(t);
      rk2.x.push(rk2Value);

      const rk4a = k * rk4Value;
      const rk4b = k * (rk4Value + 0.5 * h * rk4a);
      const rk4c = k * (rk4Value + 0.5 * h * rk4b);
      const rk4d = k * (rk4Value + h * rk4c);
      rk4Value += (h * (rk4a + 2 * rk4b + 2 * rk4c + rk4d)) / 6;
      rk4.t.push(t);
      rk4.x.push(rk4Value);
    }

    return { exact, explicit, implicit, rk2, rk4, h, stepCount };
  }

  function seededGaussianNoise(length, seed) {
    const values = [];
    let state = Math.max(1, Math.floor(seed)) >>> 0;

    function random() {
      state = (1664525 * state + 1013904223) >>> 0;
      return (state + 1) / 4294967297;
    }

    while (values.length < length) {
      const u1 = random();
      const u2 = random();
      const radius = Math.sqrt(-2 * Math.log(u1));
      const angle = 2 * Math.PI * u2;
      values.push(radius * Math.cos(angle));
      if (values.length < length) {
        values.push(radius * Math.sin(angle));
      }
    }

    return values;
  }

  function fftReal(values) {
    const n = values.length;
    const re = new Array(n);
    const im = new Array(n);

    for (let k = 0; k < n; k += 1) {
      let sumRe = 0;
      let sumIm = 0;
      for (let j = 0; j < n; j += 1) {
        const angle = (-2 * Math.PI * k * j) / n;
        sumRe += values[j] * Math.cos(angle);
        sumIm += values[j] * Math.sin(angle);
      }
      re[k] = sumRe;
      im[k] = sumIm;
    }

    return { re, im };
  }

  function frequencyBins(length, sampleRate) {
    const bins = [];
    const midpoint = Math.floor(length / 2);

    for (let k = 0; k < length; k += 1) {
      bins.push(k <= midpoint ? (k * sampleRate) / length : ((k - length) * sampleRate) / length);
    }

    return bins;
  }

  function positiveSpectrum(freq, specRe, specIm) {
    const x = [];
    const y = [];
    const n = freq.length;

    for (let k = 0; k < n; k += 1) {
      if (freq[k] >= 0) {
        x.push(freq[k]);
        y.push((2 * Math.hypot(specRe[k], specIm[k])) / n);
      }
    }

    return { x, y };
  }

  function lowPassSpectrum(freq, specRe, specIm, cutoff) {
    const filteredRe = [];
    const filteredIm = [];

    for (let k = 0; k < freq.length; k += 1) {
      if (Math.abs(freq[k]) > cutoff) {
        filteredRe.push(0);
        filteredIm.push(0);
      } else {
        filteredRe.push(specRe[k]);
        filteredIm.push(specIm[k]);
      }
    }

    return { re: filteredRe, im: filteredIm };
  }

  function inverseFftReal(specRe, specIm) {
    const n = specRe.length;
    const values = new Array(n);

    for (let j = 0; j < n; j += 1) {
      let sum = 0;
      for (let k = 0; k < n; k += 1) {
        const angle = (2 * Math.PI * k * j) / n;
        sum += specRe[k] * Math.cos(angle) - specIm[k] * Math.sin(angle);
      }
      values[j] = sum / n;
    }

    return values;
  }

  function signalDenoiseData(noiseLevel, baseNoise) {
    const thresholdValues = Array.from({ length: 19 }, (_, i) => (i + 2) * 0.5);
    const samplePeriod = 5;
    const sampleRate = 100;
    const sampleCount = Math.floor(samplePeriod * sampleRate);
    const n = sampleCount + 1;
    const t = Array.from({ length: n }, (_, i) => (samplePeriod * i) / sampleCount);
    const clean = t.map((value) => 1.5 * Math.sin(2 * Math.PI * value));
    const noisy = clean.map((value, i) => value + noiseLevel * baseNoise[i]);
    const freq = frequencyBins(n, sampleRate);
    const spec = fftReal(noisy);
    const noisySpectrum = positiveSpectrum(freq, spec.re, spec.im);
    const filtered = thresholdValues.map((cutoff) => {
      const lowPass = lowPassSpectrum(freq, spec.re, spec.im, cutoff);
      const spectrum = positiveSpectrum(freq, lowPass.re, lowPass.im);
      return {
        cutoff,
        signal: inverseFftReal(lowPass.re, lowPass.im),
        spectrum,
      };
    });

    return { t, clean, noisy, noisySpectrum, filtered, thresholdValues };
  }

  async function initLogisticMap(element) {
    const plotly = await loadPlotly();
    let r = numberFromDataset(element, "r", 3.4);
    let x0 = numberFromDataset(element, "x0", 0.2);
    const steps = numberFromDataset(element, "steps", 80);

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Interactive Example";

    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Plotly";

    const controls = document.createElement("div");
    controls.className = "course-interactive__controls";

    const readout = document.createElement("div");
    readout.className = "course-interactive__readout";

    const plot = document.createElement("div");
    plot.className = "course-interactive__plot";

    function redraw() {
      const series = logisticSeries(r, x0, steps);
      const nextValue = series.y[1];
      readout.textContent = `x1 = ${nextValue.toFixed(6)}`;
      element.dataset.currentX0 = String(x0);
      element.dataset.currentX1 = String(nextValue);

      plotly.react(
        plot,
        [
          {
            x: series.x,
            y: series.y,
            mode: "lines+markers",
            marker: { size: 4 },
            line: { width: 2 },
            name: "x_n",
          },
        ],
        {
          margin: { t: 24, r: 24, b: 48, l: 48 },
          xaxis: { title: "n" },
          yaxis: { title: "x_n", range: [0, 1] },
        },
        { responsive: true }
      );
    }

    controls.append(
      makeRangeControl({
        label: "r",
        min: 0,
        max: 4,
        step: 0.01,
        value: r,
        onInput: (value) => {
          r = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "x0",
        min: 0,
        max: 1,
        step: 0.001,
        value: x0,
        onInput: (value) => {
          x0 = value;
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    redraw();
  }

  async function initLinearOde(element) {
    const plotly = await loadPlotly();
    let k = numberFromDataset(element, "k", -1);
    let x0 = numberFromDataset(element, "x0", 1);
    let tFinal = numberFromDataset(element, "tFinal", 1);
    let stepSize = numberFromDataset(element, "stepSize", 0.1);

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Linear ODE";

    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Plotly";

    const controls = document.createElement("div");
    controls.className = "course-interactive__controls";

    const readout = document.createElement("div");
    readout.className = "course-interactive__readout";

    const plot = document.createElement("div");
    plot.className = "course-interactive__plot";

    function redraw() {
      const data = linearOdeData(k, x0, tFinal, stepSize);
      const exactFinal = x0 * Math.exp(k * tFinal);
      const explicitFinal = data.explicit.x[data.explicit.x.length - 1];
      const absoluteError = Math.abs(explicitFinal - exactFinal);

      readout.textContent =
        `Using ${data.stepCount} steps (actual h = ${data.h.toPrecision(3)}). ` +
        `Explicit Euler absolute error at t_f is ${absoluteError.toPrecision(3)}.`;

      element.dataset.currentK = String(k);
      element.dataset.currentX0 = String(x0);
      element.dataset.currentStepSize = String(stepSize);
      element.dataset.currentExplicitError = String(absoluteError);

      plotly.react(
        plot,
        [
          {
            x: data.exact.t,
            y: data.exact.x,
            mode: "lines",
            line: { color: "black", width: 3, dash: "dash" },
            name: "Exact",
          },
          {
            x: data.explicit.t,
            y: data.explicit.x,
            mode: "lines+markers",
            marker: { size: 5 },
            line: { color: "blue", width: 2 },
            name: "Explicit Euler",
          },
          {
            x: data.implicit.t,
            y: data.implicit.x,
            mode: "lines+markers",
            marker: { size: 5 },
            line: { color: "red", width: 2 },
            name: "Implicit Euler",
          },
          {
            x: data.rk2.t,
            y: data.rk2.x,
            mode: "lines+markers",
            marker: { size: 5 },
            line: { color: "green", width: 2 },
            name: "RK2",
          },
          {
            x: data.rk4.t,
            y: data.rk4.x,
            mode: "lines+markers",
            marker: { size: 5 },
            line: { color: "grey", width: 2 },
            name: "RK4",
          },
        ],
        {
          autosize: true,
          legend: { orientation: "h", y: -0.2 },
          margin: { t: 24, r: 24, b: 88, l: 56 },
          xaxis: { title: "t", range: [0, tFinal] },
          yaxis: { title: "x(t)", autorange: true },
        },
        { displaylogo: false, responsive: true }
      );
    }

    controls.append(
      makeNumberInputControl({
        label: "k",
        min: -20,
        max: 20,
        step: 0.1,
        value: k,
        onInput: (value) => {
          k = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "x0",
        min: -20,
        max: 20,
        step: 0.1,
        value: x0,
        onInput: (value) => {
          x0 = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "t_f",
        min: 0.1,
        max: 10,
        step: 0.1,
        value: tFinal,
        onInput: (value) => {
          tFinal = value;
          redraw();
        },
      }),
      makeRangeControl({
        label: "h",
        min: 0.005,
        max: 0.5,
        step: 0.005,
        value: stepSize,
        onInput: (value) => {
          stepSize = value;
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    redraw();
  }

  async function initSignalDenoise(element) {
    const plotly = await loadPlotly();
    let noiseLevel = numberFromDataset(element, "noiseLevel", 1);
    let activeThresholdIndex = 18;
    let latestData = null;
    const baseNoise = seededGaussianNoise(501, numberFromDataset(element, "seed", 7));

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Signal Denoising";

    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Plotly";

    const controls = document.createElement("div");
    controls.className = "course-interactive__controls";

    const readout = document.createElement("div");
    readout.className = "course-interactive__readout";

    const plot = document.createElement("div");
    plot.className = "course-interactive__plot course-interactive__plot--large";

    function updateReadout(data) {
      const cutoff = data.thresholdValues[activeThresholdIndex];
      readout.textContent = `Noise level = ${noiseLevel.toFixed(2)}; threshold = ${cutoff.toFixed(1)} Hz`;
      element.dataset.currentNoiseLevel = String(noiseLevel);
      element.dataset.currentThreshold = String(cutoff);
    }

    function redraw() {
      const data = signalDenoiseData(noiseLevel, baseNoise);
      latestData = data;
      const totalThresholds = data.thresholdValues.length;
      activeThresholdIndex = Math.min(activeThresholdIndex, totalThresholds - 1);
      updateReadout(data);

      const traces = [];
      data.filtered.forEach((item, index) => {
        traces.push({
          x: data.t,
          y: item.signal,
          visible: index === activeThresholdIndex,
          mode: "lines",
          line: { color: "green", width: 2, dash: "dash" },
          name: "Filtered signal",
          xaxis: "x3",
          yaxis: "y3",
        });
      });

      data.filtered.forEach((item, index) => {
        traces.push({
          x: item.spectrum.x,
          y: item.spectrum.y,
          visible: index === activeThresholdIndex,
          mode: "lines",
          line: { color: "black", width: 2 },
          name: "Filtered spectrum",
          showlegend: false,
          xaxis: "x4",
          yaxis: "y4",
        });
      });

      traces.push(
        {
          x: data.t,
          y: data.noisy,
          visible: true,
          mode: "lines",
          line: { color: "red", width: 1, dash: "dash" },
          name: "Noisy signal",
          xaxis: "x",
          yaxis: "y",
        },
        {
          x: data.t,
          y: data.clean,
          visible: true,
          mode: "lines",
          line: { color: "blue", width: 2 },
          name: "Clean signal",
          xaxis: "x",
          yaxis: "y",
        },
        {
          x: data.noisySpectrum.x,
          y: data.noisySpectrum.y,
          visible: true,
          mode: "lines",
          line: { color: "black", width: 2 },
          name: "Noisy spectrum",
          showlegend: false,
          xaxis: "x2",
          yaxis: "y2",
        },
        {
          x: data.t,
          y: data.clean,
          visible: true,
          mode: "lines",
          line: { color: "blue", width: 2 },
          name: "Clean signal",
          showlegend: false,
          xaxis: "x3",
          yaxis: "y3",
        }
      );

      const steps = data.thresholdValues.map((cutoff, index) => {
        const visible = new Array(2 * totalThresholds + 4).fill(false);
        visible[index] = true;
        visible[index + totalThresholds] = true;
        visible.fill(true, 2 * totalThresholds);
        return {
          method: "update",
          args: [{ visible }],
          label: `${cutoff.toFixed(1)} Hz`,
        };
      });

      plotly.react(
        plot,
        traces,
        {
          annotations: [
            { text: "Raw Signal", x: 0.225, y: 1.05, xref: "paper", yref: "paper", showarrow: false },
            { text: "Noisy Spectrum", x: 0.775, y: 1.05, xref: "paper", yref: "paper", showarrow: false },
            { text: "Filtered Signal", x: 0.225, y: 0.45, xref: "paper", yref: "paper", showarrow: false },
            { text: "Filtered Spectrum", x: 0.775, y: 0.45, xref: "paper", yref: "paper", showarrow: false },
          ],
          autosize: true,
          height: 620,
          legend: { orientation: "h", y: -0.18 },
          margin: { t: 52, r: 24, b: 112, l: 48 },
          sliders: [
            {
              active: activeThresholdIndex,
              currentvalue: { prefix: "Threshold = " },
              pad: { t: 44 },
              steps,
            },
          ],
          xaxis: { domain: [0, 0.45] },
          yaxis: { domain: [0.6, 1], range: [-3, 3] },
          xaxis2: { domain: [0.55, 1], range: [0, 12] },
          yaxis2: { domain: [0.6, 1] },
          xaxis3: { domain: [0, 0.45], title: "time, s" },
          yaxis3: { domain: [0, 0.4], range: [-3, 3] },
          xaxis4: { domain: [0.55, 1], range: [0, 12], title: "Frequency, Hz" },
          yaxis4: { domain: [0, 0.4] },
        },
        { displaylogo: false, responsive: true }
      );
    }

    controls.append(
      makeNumberInputControl({
        label: "Level of noise",
        min: 0,
        max: 3,
        step: 0.1,
        value: noiseLevel,
        onInput: (value) => {
          noiseLevel = value;
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    redraw();
    plot.on("plotly_sliderchange", (event) => {
      const nextThreshold = Number.parseFloat(event.step.label);
      const index = Array.from({ length: 19 }, (_, i) => (i + 2) * 0.5).findIndex(
        (value) => value === nextThreshold
      );
      if (index >= 0 && latestData) {
        activeThresholdIndex = index;
        updateReadout(latestData);
      }
    });
  }

  async function initInteractive(element) {
    const example = element.dataset.example;

    try {
      if (example === "logistic-map") {
        await initLogisticMap(element);
        return;
      }

      if (
        example === "linear-ode" ||
        element.classList.contains("course-interactive--linear-ode") ||
        element.classList.contains("course-interactive-linear-ode")
      ) {
        await initLinearOde(element);
        return;
      }

      if (example === "signal-denoise") {
        await initSignalDenoise(element);
        return;
      }

      element.textContent = `Unknown interactive example: ${example || "none"}`;
    } catch (error) {
      element.textContent = "This interactive example could not be loaded.";
      console.error(error);
    }
  }

  window.CourseInteractives = {
    loadJsxGraph,
    loadP5,
    loadPlotly,
    loadPyodideRuntime,
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".course-interactive").forEach(initInteractive);
  });
})();
