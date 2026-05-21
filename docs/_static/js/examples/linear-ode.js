(function () {
  "use strict";

  const {
    loadPlotly,
    makeNumberInputControl,
    makeRangeControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

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

  registerExample("linear-ode", initLinearOde, {
    selectors: [".course-interactive--linear-ode", ".course-interactive-linear-ode"],
  });
})();
