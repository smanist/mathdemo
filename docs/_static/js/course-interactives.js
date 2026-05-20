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

  async function initInteractive(element) {
    const example = element.dataset.example;

    try {
      if (example === "logistic-map") {
        await initLogisticMap(element);
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
