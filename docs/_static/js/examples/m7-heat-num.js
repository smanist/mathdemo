(function () {
  "use strict";

  const {
    loadPlotly,
    makeNumberInputControl,
    makeRangeControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

  const PI = Math.PI;
  const X_FINAL = 2 * PI;

  function linspace(start, stop, count) {
    if (count <= 1) {
      return [start];
    }
    return Array.from({ length: count }, (_, index) => start + ((stop - start) * index) / (count - 1));
  }

  function initialCondition(x) {
    return x < PI ? x : 2 * PI - x;
  }

  function analyticalSolution(x, t, modeCount = 10) {
    let sum = 0;
    for (let modeIndex = 0; modeIndex < modeCount; modeIndex += 1) {
      const k = 2 * modeIndex + 1;
      const sign = modeIndex % 2 === 0 ? 1 : -1;
      sum +=
        sign *
        (8 / PI / (k * k)) *
        Math.sin((k * x) / 2) *
        Math.exp((-(k * k) * t) / 4);
    }
    return sum;
  }

  function solveExplicit(segmentCount, stepCount, dt) {
    const x = linspace(0, X_FINAL, segmentCount + 1);
    const dx = x[1] - x[0];
    const r = dt / (dx * dx);
    const solution = [x.map(initialCondition)];

    for (let timeIndex = 1; timeIndex <= stepCount; timeIndex += 1) {
      const previous = solution[timeIndex - 1];
      const next = new Array(segmentCount + 1).fill(0);
      for (let index = 1; index < segmentCount; index += 1) {
        next[index] = r * (previous[index - 1] + previous[index + 1]) + (1 - 2 * r) * previous[index];
      }
      solution.push(next);
    }

    return { x, solution, r };
  }

  function thomasSolve(lower, diag, upper, rhs) {
    const n = rhs.length;
    const cPrime = new Array(n).fill(0);
    const dPrime = new Array(n).fill(0);
    const out = new Array(n).fill(0);

    cPrime[0] = n > 1 ? upper[0] / diag[0] : 0;
    dPrime[0] = rhs[0] / diag[0];

    for (let index = 1; index < n; index += 1) {
      const denominator = diag[index] - lower[index - 1] * cPrime[index - 1];
      cPrime[index] = index < n - 1 ? upper[index] / denominator : 0;
      dPrime[index] = (rhs[index] - lower[index - 1] * dPrime[index - 1]) / denominator;
    }

    out[n - 1] = dPrime[n - 1];
    for (let index = n - 2; index >= 0; index -= 1) {
      out[index] = dPrime[index] - cPrime[index] * out[index + 1];
    }

    return out;
  }

  function solveCrankNicolson(segmentCount, stepCount, dt) {
    const x = linspace(0, X_FINAL, segmentCount + 1);
    const dx = x[1] - x[0];
    const r = dt / (dx * dx);
    const interiorCount = Math.max(0, segmentCount - 1);
    const solution = [x.map(initialCondition)];

    if (interiorCount === 0) {
      for (let timeIndex = 1; timeIndex <= stepCount; timeIndex += 1) {
        solution.push(new Array(segmentCount + 1).fill(0));
      }
      return { x, solution, r };
    }

    const lower = new Array(interiorCount - 1).fill(-r);
    const diag = new Array(interiorCount).fill(2 * (1 + r));
    const upper = new Array(interiorCount - 1).fill(-r);

    for (let timeIndex = 1; timeIndex <= stepCount; timeIndex += 1) {
      const previous = solution[timeIndex - 1];
      const rhs = new Array(interiorCount);
      for (let j = 0; j < interiorCount; j += 1) {
        const index = j + 1;
        rhs[j] = 2 * (1 - r) * previous[index] + r * previous[index - 1] + r * previous[index + 1];
      }

      const interior = thomasSolve(lower, diag, upper, rhs);
      const next = new Array(segmentCount + 1).fill(0);
      for (let j = 0; j < interior.length; j += 1) {
        next[j + 1] = interior[j];
      }
      solution.push(next);
    }

    return { x, solution, r };
  }

  function finiteRange(values, fallback) {
    const finite = values.filter(Number.isFinite);
    if (!finite.length) {
      return fallback;
    }
    const min = Math.min(...finite);
    const max = Math.max(...finite);
    if (Math.abs(max - min) < 1e-9) {
      return [min - 1, max + 1];
    }
    const pad = 0.08 * (max - min);
    return [min - pad, max + pad];
  }

  async function initHeatNumerics(element) {
    const plotly = await loadPlotly();
    const state = {
      segmentCount: Math.round(numberFromDataset(element, "segments", 4)),
      dt: numberFromDataset(element, "dt", 0.1),
      timeIndex: Math.round(numberFromDataset(element, "timeIndex", 0)),
    };
    const analyticalX = linspace(0, X_FINAL, 401);
    let suppress = true;

    element.innerHTML = "";
    const header = document.createElement("div");
    header.className = "course-interactive__header";
    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = "Numerical Solutions of the 1D Heat Equation";
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
      if (suppress) {
        return;
      }

      const segmentCount = Math.max(2, Math.min(80, Math.round(state.segmentCount)));
      const dt = Math.max(0.01, Math.min(1, state.dt));
      const stepCount = Math.max(10, Math.floor(10 / dt));
      state.timeIndex = Math.min(stepCount, Math.max(0, state.timeIndex));
      const time = state.timeIndex * dt;
      const explicit = solveExplicit(segmentCount, stepCount, dt);
      const crankNicolson = solveCrankNicolson(segmentCount, stepCount, dt);
      const analyticalY = analyticalX.map((x) => analyticalSolution(x, time));
      const explicitY = explicit.solution[state.timeIndex];
      const crankY = crankNicolson.solution[state.timeIndex];
      const yRange = finiteRange([...analyticalY, ...explicitY, ...crankY, 0, PI], [-3.5, 3.5]);
      const stability = explicit.r <= 0.5 ? "explicit stable by r <= 0.5" : "explicit unstable risk: r > 0.5";

      readout.textContent = `Nx = ${segmentCount}; dt = ${dt.toFixed(3)}; t = ${time.toFixed(
        3
      )}; r = ${explicit.r.toFixed(3)} (${stability})`;

      plotly.react(
        plot,
        [
          {
            x: [0, PI, 2 * PI],
            y: [0, PI, 0],
            mode: "lines",
            line: { color: "#111111", width: 1 },
            name: "Initial condition",
          },
          {
            x: analyticalX,
            y: analyticalY,
            mode: "lines",
            line: { color: "#1f77b4", width: 2.5 },
            name: "Analytical series",
          },
          {
            x: explicit.x,
            y: explicitY,
            mode: "lines+markers",
            line: { color: "#111111", width: 1, dash: "dash" },
            marker: { color: "#111111", size: 6 },
            name: "Explicit",
          },
          {
            x: crankNicolson.x,
            y: crankY,
            mode: "lines+markers",
            line: { color: "#d62728", width: 1, dash: "dash" },
            marker: { color: "#d62728", symbol: "square", size: 6 },
            name: "Crank-Nicolson",
          },
        ],
        {
          height: 520,
          margin: { t: 24, r: 24, b: 58, l: 56 },
          xaxis: {
            title: "x",
            range: [0, 2 * PI],
            tickmode: "array",
            tickvals: [0, PI, 2 * PI],
            ticktext: ["0", "π", "2π"],
          },
          yaxis: { title: "u", range: yRange },
          legend: { orientation: "h", y: 1.1 },
        },
        { responsive: true, displaylogo: false }
      );
    }

    controls.append(
      makeNumberInputControl({
        label: "Spatial segments",
        min: 2,
        max: 80,
        step: 1,
        value: state.segmentCount,
        onInput(value) {
          state.segmentCount = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Time step dt",
        min: 0.01,
        max: 1,
        step: 0.01,
        value: state.dt,
        onInput(value) {
          state.dt = value;
          redraw();
        },
      }),
      makeRangeControl({
        label: "Time step",
        min: 0,
        max: 1000,
        step: 1,
        value: state.timeIndex,
        onInput(value) {
          state.timeIndex = Math.round(value);
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    suppress = false;
    redraw();
  }

  registerExample("m7-heat-num", initHeatNumerics, {
    selectors: [".course-interactive-m7-heat-num"],
  });
})();
