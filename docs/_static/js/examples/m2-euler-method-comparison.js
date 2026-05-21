(function () {
  "use strict";

  const { loadPlotly, makeCheckboxControl, makeSelectControl, registerExample } =
    window.CourseInteractives;

  const STEP_VALUES = Array.from({ length: 16 }, (_, index) => 0.05 * 10 ** (-1 + (2 * index) / 15));

  const METHOD_ORDER = ["EE", "IE", "R2", "R4"];
  const METHOD_STYLES = {
    EE: { color: "blue", label: "Explicit Euler" },
    IE: { color: "red", label: "Implicit Euler" },
    R2: { color: "green", label: "RK2" },
    R4: { color: "grey", label: "RK4" },
  };

  function finiteOrNull(value) {
    return Number.isFinite(value) ? value : null;
  }

  function formatStep(value) {
    return value < 0.01 ? value.toFixed(4) : value.toFixed(3);
  }

  function solveImplicitSingularCase(previousValue, nextTime, step) {
    const denominator = 2 * nextTime - 1;
    if (Math.abs(denominator) < 1e-12) {
      return NaN;
    }

    const a = step / denominator;
    if (Math.abs(a) < 1e-12) {
      return previousValue;
    }

    const discriminant = 1 - 4 * a * previousValue;
    if (discriminant < 0) {
      return NaN;
    }

    const rootA = (1 - Math.sqrt(discriminant)) / (2 * a);
    const rootB = (1 + Math.sqrt(discriminant)) / (2 * a);
    return Math.abs(rootA - previousValue) <= Math.abs(rootB - previousValue) ? rootA : rootB;
  }

  const CASES = {
    "1": {
      description: "Linear ODE",
      equation: "y' = -20y, y(0) = 1",
      maxTime: 0.5,
      exact(time) {
        return Math.exp(-20 * time);
      },
      rhs(value) {
        return -20 * value;
      },
      implicitStep(previousValue, nextTime, step) {
        void nextTime;
        return previousValue / (1 + 20 * step);
      },
    },
    "2": {
      description: "Stiff test ODE",
      equation: "y' = -20y + 20t^2 + 2t, y(0) = 1",
      maxTime: 0.5,
      exact(time) {
        return Math.exp(-20 * time) + time * time;
      },
      rhs(value, time) {
        return -20 * value + 20 * time * time + 2 * time;
      },
      implicitStep(previousValue, nextTime, step) {
        return (previousValue + step * (20 * nextTime * nextTime + 2 * nextTime)) / (1 + 20 * step);
      },
    },
    "3": {
      description: "Singular-coefficient ODE",
      equation: "y' = y^2 / (2t - 1), y(0) = 1",
      maxTime: 0.5,
      safeLimit: 0.499,
      notebookNote:
        "The source notebook labels this case as finite-time blow-up. This port keeps the notebook's formula but stops before t = 0.5, where the ODE coefficient is singular.",
      exact(time) {
        return 2 / (2 - Math.log(1 - 2 * time));
      },
      rhs(value, time) {
        return (value * value) / (2 * time - 1);
      },
      implicitStep(previousValue, nextTime, step) {
        return solveImplicitSingularCase(previousValue, nextTime, step);
      },
    },
  };

  function exactSeries(caseConfig) {
    const t = [];
    const y = [];
    const limit = caseConfig.safeLimit ?? caseConfig.maxTime;
    const samples = 240;

    for (let index = 0; index <= samples; index += 1) {
      const time = (limit * index) / samples;
      t.push(time);
      y.push(finiteOrNull(caseConfig.exact(time)));
    }

    return { t, y, limit };
  }

  function nextFiniteValue(previousValue, stepper) {
    if (!Number.isFinite(previousValue)) {
      return null;
    }

    return finiteOrNull(stepper(previousValue));
  }

  function numericalSeries(caseConfig, step) {
    const limit = caseConfig.safeLimit ?? caseConfig.maxTime;
    const series = {
      EE: { t: [0], y: [1] },
      IE: { t: [0], y: [1] },
      R2: { t: [0], y: [1] },
      R4: { t: [0], y: [1] },
    };

    while (series.EE.t[series.EE.t.length - 1] + step <= limit + 1e-12) {
      const previousTime = series.EE.t[series.EE.t.length - 1];
      const nextTime = previousTime + step;

      const explicitValue = series.EE.y[series.EE.y.length - 1];
      series.EE.t.push(nextTime);
      series.EE.y.push(
        nextFiniteValue(explicitValue, (value) => value + step * caseConfig.rhs(value, previousTime))
      );

      const implicitValue = series.IE.y[series.IE.y.length - 1];
      series.IE.t.push(nextTime);
      series.IE.y.push(nextFiniteValue(implicitValue, (value) => caseConfig.implicitStep(value, nextTime, step)));

      const rk2Value = series.R2.y[series.R2.y.length - 1];
      series.R2.t.push(nextTime);
      series.R2.y.push(
        nextFiniteValue(rk2Value, (value) => {
          const rk2k1 = step * caseConfig.rhs(value, previousTime);
          const rk2k2 = step * caseConfig.rhs(value + 0.5 * rk2k1, previousTime + 0.5 * step);
          return value + rk2k2;
        })
      );

      const rk4Value = series.R4.y[series.R4.y.length - 1];
      series.R4.t.push(nextTime);
      series.R4.y.push(
        nextFiniteValue(rk4Value, (value) => {
          const rk4k1 = step * caseConfig.rhs(value, previousTime);
          const rk4k2 = step * caseConfig.rhs(value + 0.5 * rk4k1, previousTime + 0.5 * step);
          const rk4k3 = step * caseConfig.rhs(value + 0.5 * rk4k2, previousTime + 0.5 * step);
          const rk4k4 = step * caseConfig.rhs(value + rk4k3, nextTime);
          return value + (rk4k1 + 2 * rk4k2 + 2 * rk4k3 + rk4k4) / 6;
        })
      );
    }

    return {
      exact: exactSeries(caseConfig),
      series,
      lastTime: series.EE.t[series.EE.t.length - 1],
      stepCount: series.EE.t.length - 1,
    };
  }

  async function initEulerMethodComparison(element) {
    const plotly = await loadPlotly();
    let caseKey = element.dataset.case || "2";
    let stepIndex = Number.parseInt(element.dataset.stepIndex || "3", 10);
    const visibleMethods = {
      EE: true,
      IE: true,
      R2: true,
      R4: true,
    };

    if (!CASES[caseKey]) {
      caseKey = "2";
    }
    if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= STEP_VALUES.length) {
      stepIndex = 3;
    }

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = "Euler Method Comparison";

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
      const caseConfig = CASES[caseKey];
      const step = STEP_VALUES[stepIndex];
      const data = numericalSeries(caseConfig, step);
      const visibleNames = METHOD_ORDER.filter((method) => visibleMethods[method]).map(
        (method) => METHOD_STYLES[method].label
      );
      const traces = [
        {
          x: data.exact.t,
          y: data.exact.y,
          mode: "lines",
          line: { color: "black", width: 3, dash: "dash" },
          name: "Exact solution",
        },
      ];

      METHOD_ORDER.forEach((method) => {
        if (!visibleMethods[method]) {
          return;
        }

        traces.push({
          x: data.series[method].t,
          y: data.series[method].y,
          mode: "lines+markers",
          line: { color: METHOD_STYLES[method].color, width: 2 },
          marker: { size: 5 },
          name: METHOD_STYLES[method].label,
        });
      });

      readout.textContent =
        `${caseConfig.description}: ${caseConfig.equation}. ` +
        `Using ${data.stepCount} full step${data.stepCount === 1 ? "" : "s"} of h = ${formatStep(step)} up to t = ${data.lastTime.toFixed(3)}. ` +
        `${visibleNames.length > 0 ? `Showing ${visibleNames.join(", ")}.` : "Showing the exact solution only."}` +
        `${caseConfig.notebookNote ? ` ${caseConfig.notebookNote}` : ""}`;

      element.dataset.currentCase = caseKey;
      element.dataset.currentStepSize = String(step);

      plotly.react(
        plot,
        traces,
        {
          autosize: true,
          legend: { orientation: "h", y: -0.2 },
          margin: { t: 24, r: 24, b: 88, l: 56 },
          xaxis: { title: "t", range: [-0.02, 0.52] },
          yaxis: { title: "y", autorange: true },
        },
        { displaylogo: false, responsive: true }
      );
    }

    controls.append(
      makeSelectControl({
        label: "Case",
        value: caseKey,
        options: [
          { value: "1", label: "1: Linear ODE" },
          { value: "2", label: "2: Stiff test ODE" },
          { value: "3", label: "3: Singular-coefficient ODE" },
        ],
        onInput: (value) => {
          caseKey = value;
          redraw();
        },
      }),
      makeSelectControl({
        label: "Step size h",
        value: String(stepIndex),
        options: STEP_VALUES.map((value, index) => ({
          value: String(index),
          label: formatStep(value),
        })),
        onInput: (value) => {
          stepIndex = Number.parseInt(value, 10);
          redraw();
        },
      }),
      makeCheckboxControl({
        label: "Explicit Euler",
        checked: visibleMethods.EE,
        onInput: (value) => {
          visibleMethods.EE = value;
          redraw();
        },
      }),
      makeCheckboxControl({
        label: "Implicit Euler",
        checked: visibleMethods.IE,
        onInput: (value) => {
          visibleMethods.IE = value;
          redraw();
        },
      }),
      makeCheckboxControl({
        label: "RK2",
        checked: visibleMethods.R2,
        onInput: (value) => {
          visibleMethods.R2 = value;
          redraw();
        },
      }),
      makeCheckboxControl({
        label: "RK4",
        checked: visibleMethods.R4,
        onInput: (value) => {
          visibleMethods.R4 = value;
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    redraw();
  }

  registerExample("m2-euler-method-comparison", initEulerMethodComparison, {
    selectors: [".course-interactive-m2-euler-method-comparison"],
  });
})();
