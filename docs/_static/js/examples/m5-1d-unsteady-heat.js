(function () {
  "use strict";

  const {
    loadPlotly,
    makeNumberInputControl,
    makeRangeControl,
    makeSelectControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

  const PI = Math.PI;
  const PROBLEM_OPTIONS = [
    { label: "Dirichlet", value: "Dirichlet" },
    { label: "Neumann", value: "Neumann" },
    { label: "Mixed", value: "Mixed" },
  ];
  const MODE_COLORS = ["#1f77b4", "#d62728", "#2ca02c", "#111111", "#17becf"];

  function linspace(start, stop, count) {
    if (count <= 1) {
      return [start];
    }

    return Array.from({ length: count }, (_, index) => start + ((stop - start) * index) / (count - 1));
  }

  function boundedProblem(value) {
    return PROBLEM_OPTIONS.some((option) => option.value === value) ? value : "Dirichlet";
  }

  function formatNumber(value, digits = 2) {
    return Number(value).toFixed(digits).replace(/\.?0+$/, "");
  }

  function minMax(values) {
    let min = Infinity;
    let max = -Infinity;

    values.forEach((series) => {
      series.forEach((row) => {
        if (Array.isArray(row)) {
          row.forEach((value) => {
            if (value < min) {
              min = value;
            }
            if (value > max) {
              max = value;
            }
          });
        } else {
          if (row < min) {
            min = row;
          }
          if (row > max) {
            max = row;
          }
        }
      });
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return [-1, 1];
    }
    if (Math.abs(max - min) < 1e-9) {
      const pad = Math.max(0.5, Math.abs(max) * 0.2);
      return [min - pad, max + pad];
    }

    const pad = 0.08 * (max - min);
    return [min - pad, max + pad];
  }

  function initialAndSteadyCurves(problem, v1, v2) {
    if (problem === "Dirichlet") {
      return {
        initialX: [0, PI, 2 * PI],
        initialY: [v1, PI + (v1 + v2) / 2, v2],
        steadyX: [0, 2 * PI],
        steadyY: [v1, v2],
      };
    }

    if (problem === "Neumann") {
      return {
        initialX: [0, PI, 2 * PI],
        initialY: [0, PI, 0],
        steadyX: [0, 2 * PI],
        steadyY: [PI / 2, PI / 2],
      };
    }

    return {
      initialX: [0, PI, 2 * PI],
      initialY: [v1, PI + v1, v1],
      steadyX: [0, 2 * PI],
      steadyY: [v1, v1],
    };
  }

  function heatSeries({ problem, c, v1, v2, nModes, nX, nT, tFinal }) {
    const x = linspace(0, 2 * PI, nX);
    const t = linspace(0, tFinal, nT);
    const modes = Array.from({ length: nModes }, () => Array.from({ length: nT }, () => new Array(nX)));
    let steady;

    if (problem === "Dirichlet") {
      steady = x.map((value) => ((v2 - v1) / (2 * PI)) * value + v1);

      for (let modeIndex = 0; modeIndex < nModes; modeIndex += 1) {
        const k = 2 * modeIndex + 1;
        const coefficient = ((modeIndex % 2 === 0 ? 1 : -1) * 8) / PI / (k * k);

        for (let timeIndex = 0; timeIndex < nT; timeIndex += 1) {
          const decay = Math.exp((-((k * t[timeIndex]) ** 2) * c) / 4);
          for (let xIndex = 0; xIndex < nX; xIndex += 1) {
            modes[modeIndex][timeIndex][xIndex] = coefficient * decay * Math.sin((k * x[xIndex]) / 2);
          }
        }
      }
    } else if (problem === "Neumann") {
      steady = new Array(nX).fill(PI / 2);

      for (let modeIndex = 0; modeIndex < nModes; modeIndex += 1) {
        const k = 2 * modeIndex + 1;
        const coefficient = -4 / PI / (k * k);

        for (let timeIndex = 0; timeIndex < nT; timeIndex += 1) {
          const decay = Math.exp(-((k * t[timeIndex]) ** 2) * c);
          for (let xIndex = 0; xIndex < nX; xIndex += 1) {
            modes[modeIndex][timeIndex][xIndex] = coefficient * decay * Math.cos(k * x[xIndex]);
          }
        }
      }
    } else {
      steady = new Array(nX).fill(v1);

      for (let modeIndex = 0; modeIndex < nModes; modeIndex += 1) {
        const k = 2 * modeIndex + 1;
        const coefficient =
          (16 / PI / (k * k)) *
          ((modeIndex % 2 === 0 ? -1 : 1) + Math.sqrt(2) * ((Math.floor(modeIndex / 2) % 2 === 0) ? 1 : -1));

        for (let timeIndex = 0; timeIndex < nT; timeIndex += 1) {
          const decay = Math.exp((-((k * t[timeIndex]) ** 2) * c) / 4);
          for (let xIndex = 0; xIndex < nX; xIndex += 1) {
            modes[modeIndex][timeIndex][xIndex] = coefficient * decay * Math.sin((k * x[xIndex]) / 4);
          }
        }
      }
    }

    const solution = Array.from({ length: nT }, (_, timeIndex) =>
      x.map((_, xIndex) => {
        let value = steady[xIndex];
        for (let modeIndex = 0; modeIndex < nModes; modeIndex += 1) {
          value += modes[modeIndex][timeIndex][xIndex];
        }
        return value;
      })
    );

    return { x, t, modes, solution, steady };
  }

  function xAxisConfig(title) {
    return {
      title,
      range: [0, 2 * PI],
      tickmode: "array",
      tickvals: [0, PI, 2 * PI],
      ticktext: ["0", "π", "2π"],
    };
  }

  async function initHeat2d(element) {
    const plotly = await loadPlotly();
    const state = {
      problem: boundedProblem(element.dataset.problem || "Dirichlet"),
      c: numberFromDataset(element, "c", 5),
      v1: numberFromDataset(element, "v1", 0),
      v2: numberFromDataset(element, "v2", 0),
      timeIndex: Math.round(numberFromDataset(element, "timeIndex", 0)),
    };
    const nModes = Math.max(6, Math.round(numberFromDataset(element, "modes", 10)));
    const nPlotModes = Math.min(5, nModes);
    const nX = Math.max(101, Math.round(numberFromDataset(element, "samples", 401)));
    const nT = Math.max(11, Math.round(numberFromDataset(element, "timeSteps", 51)));
    const tFinal = numberFromDataset(element, "tFinal", 1);
    let suppress = true;

    state.timeIndex = Math.min(nT - 1, Math.max(0, state.timeIndex));
    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "1D Unsteady Heat Transfer";

    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Plotly";

    const controls = document.createElement("div");
    controls.className = "course-interactive__controls";

    const readout = document.createElement("div");
    readout.className = "course-interactive__readout";

    const plot = document.createElement("div");
    plot.className = "course-interactive__plot course-interactive__plot--large";

    function redraw() {
      if (suppress) {
        return;
      }

      const data = heatSeries({
        problem: state.problem,
        c: state.c,
        v1: state.v1,
        v2: state.v2,
        nModes,
        nX,
        nT,
        tFinal,
      });
      const time = data.t[state.timeIndex];
      const guide = initialAndSteadyCurves(state.problem, state.v1, state.v2);
      const yRange = minMax([data.solution, data.modes.flat(), [guide.initialY], [guide.steadyY]]);
      const traces = [
        {
          x: guide.initialX,
          y: guide.initialY,
          mode: "lines",
          line: { color: "#111111", width: 1 },
          name: "Initial condition",
          xaxis: "x",
          yaxis: "y",
        },
        {
          x: guide.steadyX,
          y: guide.steadyY,
          mode: "lines",
          line: { color: "#d62728", width: 1, dash: "dash" },
          name: "Steady solution",
          xaxis: "x",
          yaxis: "y",
        },
        {
          x: data.x,
          y: data.solution[state.timeIndex],
          mode: "lines",
          line: { color: "#1f77b4", width: 2.5 },
          name: "Series solution",
          xaxis: "x",
          yaxis: "y",
        },
        {
          x: guide.initialX,
          y: guide.initialY,
          mode: "lines",
          line: { color: "#111111", width: 1 },
          name: "Initial condition",
          showlegend: false,
          xaxis: "x2",
          yaxis: "y2",
        },
        {
          x: guide.steadyX,
          y: guide.steadyY,
          mode: "lines",
          line: { color: "#d62728", width: 1, dash: "dash" },
          name: "Steady solution",
          showlegend: false,
          xaxis: "x2",
          yaxis: "y2",
        },
      ];

      for (let modeIndex = 0; modeIndex < nPlotModes; modeIndex += 1) {
        traces.push({
          x: data.x,
          y: data.modes[modeIndex][state.timeIndex],
          mode: "lines",
          line: { color: MODE_COLORS[modeIndex], width: 1.5 },
          name: `Mode ${modeIndex + 1}`,
          xaxis: "x2",
          yaxis: "y2",
        });
      }

      readout.textContent = `${state.problem}; c = ${formatNumber(state.c)}; t = ${formatNumber(time, 2)}`;

      plotly.react(
        plot,
        traces,
        {
          height: 760,
          margin: { t: 36, r: 24, b: 58, l: 56 },
          legend: { orientation: "h", y: 1.08 },
          annotations: [
            {
              text: "Series solution",
              x: 0,
              xref: "paper",
              xanchor: "left",
              y: 1.0,
              yref: "paper",
              yanchor: "bottom",
              showarrow: false,
              font: { size: 14 },
            },
            {
              text: "Decomposition (homogeneous part)",
              x: 0,
              xref: "paper",
              xanchor: "left",
              y: 0.43,
              yref: "paper",
              yanchor: "bottom",
              showarrow: false,
              font: { size: 14 },
            },
          ],
          xaxis: { ...xAxisConfig(""), domain: [0, 1], anchor: "y" },
          yaxis: { title: "u", range: yRange, domain: [0.56, 1], anchor: "x" },
          xaxis2: { ...xAxisConfig("x"), domain: [0, 1], anchor: "y2" },
          yaxis2: { title: "u", range: yRange, domain: [0, 0.42], anchor: "x2" },
        },
        { responsive: true, displaylogo: false }
      );
    }

    controls.append(
      makeSelectControl({
        label: "Boundary condition",
        options: PROBLEM_OPTIONS,
        value: state.problem,
        onInput(value) {
          state.problem = boundedProblem(value);
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Heat coefficient c",
        min: 0,
        max: 20,
        step: 0.25,
        value: state.c,
        onInput(value) {
          state.c = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Left value v1",
        min: -20,
        max: 20,
        step: 0.5,
        value: state.v1,
        onInput(value) {
          state.v1 = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Right value v2",
        min: -20,
        max: 20,
        step: 0.5,
        value: state.v2,
        onInput(value) {
          state.v2 = value;
          redraw();
        },
      }),
      makeRangeControl({
        label: "Time step",
        min: 0,
        max: nT - 1,
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

  function sceneConfig(title, zRange) {
    return {
      aspectmode: "manual",
      aspectratio: { x: 2.2, y: 2.6, z: 0.8 },
      camera: {
        eye: { x: 1.55, y: 1.9, z: 0.9 },
        projection: { type: "orthographic" },
      },
      xaxis: { title: "x", tickmode: "array", tickvals: [0, PI, 2 * PI], ticktext: ["0", "π", "2π"] },
      yaxis: { title: "t" },
      zaxis: { title, range: zRange },
    };
  }

  async function initHeat3d(element) {
    const plotly = await loadPlotly();
    const state = {
      problem: boundedProblem(element.dataset.problem || "Dirichlet"),
      c: numberFromDataset(element, "c", 1),
      v1: numberFromDataset(element, "v1", 0),
      v2: numberFromDataset(element, "v2", 0),
    };
    const nModes = Math.max(3, Math.round(numberFromDataset(element, "modes", 10)));
    const nX = Math.max(41, Math.round(numberFromDataset(element, "samples", 101)));
    const nT = Math.max(21, Math.round(numberFromDataset(element, "timeSteps", 51)));
    const tFinal = numberFromDataset(element, "tFinal", 2);
    let suppress = true;

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "1D Unsteady Heat Transfer Surfaces";

    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Plotly";

    const controls = document.createElement("div");
    controls.className = "course-interactive__controls";

    const readout = document.createElement("div");
    readout.className = "course-interactive__readout";

    const plot = document.createElement("div");
    plot.className = "course-interactive__plot course-interactive__plot--large";

    function redraw() {
      if (suppress) {
        return;
      }

      const data = heatSeries({
        problem: state.problem,
        c: state.c,
        v1: state.v1,
        v2: state.v2,
        nModes,
        nX,
        nT,
        tFinal,
      });
      const zRange = minMax([data.solution, data.modes[0], data.modes[1]]);
      const traces = [
        {
          type: "surface",
          x: data.x,
          y: data.t,
          z: data.solution,
          scene: "scene",
          colorscale: "Viridis",
          showscale: false,
          name: "Series solution",
          hovertemplate: "x=%{x:.2f}<br>t=%{y:.2f}<br>u=%{z:.3f}<extra>Series</extra>",
        },
        {
          type: "surface",
          x: data.x,
          y: data.t,
          z: data.modes[0],
          scene: "scene2",
          colorscale: "Blues",
          showscale: false,
          name: "Mode 1",
          hovertemplate: "x=%{x:.2f}<br>t=%{y:.2f}<br>u=%{z:.3f}<extra>Mode 1</extra>",
        },
        {
          type: "surface",
          x: data.x,
          y: data.t,
          z: data.modes[1],
          scene: "scene3",
          colorscale: "RdBu",
          showscale: false,
          name: "Mode 2",
          hovertemplate: "x=%{x:.2f}<br>t=%{y:.2f}<br>u=%{z:.3f}<extra>Mode 2</extra>",
        },
      ];

      readout.textContent = `${state.problem}; c = ${formatNumber(state.c)}; v1 = ${formatNumber(
        state.v1
      )}; v2 = ${formatNumber(state.v2)}`;

      plotly.react(
        plot,
        traces,
        {
          height: 850,
          margin: { t: 44, r: 12, b: 8, l: 12 },
          annotations: [
            {
              text: "Series solution",
              x: 0,
              y: 1.0,
              xref: "paper",
              yref: "paper",
              xanchor: "left",
              yanchor: "bottom",
              showarrow: false,
              font: { size: 14 },
            },
            {
              text: "Mode 1",
              x: 0,
              y: 0.645,
              xref: "paper",
              yref: "paper",
              xanchor: "left",
              yanchor: "bottom",
              showarrow: false,
              font: { size: 14 },
            },
            {
              text: "Mode 2",
              x: 0,
              y: 0.31,
              xref: "paper",
              yref: "paper",
              xanchor: "left",
              yanchor: "bottom",
              showarrow: false,
              font: { size: 14 },
            },
          ],
          scene: { ...sceneConfig("u", zRange), domain: { x: [0, 1], y: [0.69, 1] } },
          scene2: { ...sceneConfig("u1", zRange), domain: { x: [0, 1], y: [0.35, 0.66] } },
          scene3: { ...sceneConfig("u2", zRange), domain: { x: [0, 1], y: [0.01, 0.32] } },
        },
        { responsive: true, displaylogo: false }
      );
    }

    controls.append(
      makeSelectControl({
        label: "Boundary condition",
        options: PROBLEM_OPTIONS,
        value: state.problem,
        onInput(value) {
          state.problem = boundedProblem(value);
          redraw();
        },
      }),
      makeRangeControl({
        label: "Heat coefficient c",
        min: 1,
        max: 8,
        step: 0.5,
        value: state.c,
        onInput(value) {
          state.c = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Left value v1",
        min: -20,
        max: 20,
        step: 0.5,
        value: state.v1,
        onInput(value) {
          state.v1 = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Right value v2",
        min: -20,
        max: 20,
        step: 0.5,
        value: state.v2,
        onInput(value) {
          state.v2 = value;
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    suppress = false;
    redraw();
  }

  registerExample("m5-heat-2d", initHeat2d, {
    selectors: [".course-interactive-m5-heat-2d"],
  });
  registerExample("m5-heat-3d", initHeat3d, {
    selectors: [".course-interactive-m5-heat-3d"],
  });
})();
