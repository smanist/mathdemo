(function () {
  "use strict";

  const {
    loadPlotly,
    makeCheckboxControl,
    makeNumberInputControl,
    makeRangeControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

  const PI = Math.PI;

  function linspace(start, stop, count) {
    if (count <= 1) {
      return [start];
    }

    return Array.from({ length: count }, (_, index) => start + ((stop - start) * index) / (count - 1));
  }

  function formatNumber(value, digits = 2) {
    return Number(value).toFixed(digits).replace(/\.?0+$/, "");
  }

  function initialDisplacement(x) {
    return 0.1 * x * (PI - x);
  }

  function oddExtension(value, period) {
    const wrapped = ((value % (2 * period)) + 2 * period) % (2 * period);
    if (wrapped <= period) {
      return initialDisplacement(wrapped);
    }
    return -initialDisplacement(2 * period - wrapped);
  }

  function exactWaveValue(x, t, c) {
    return 0.5 * oddExtension(x - c * t, PI) + 0.5 * oddExtension(x + c * t, PI);
  }

  function rightRunningValue(x, t, c) {
    return 0.5 * oddExtension(x - c * t, PI);
  }

  function leftRunningValue(x, t, c) {
    return 0.5 * oddExtension(x + c * t, PI);
  }

  function modeValue(x, t, modeIndex, c, damping) {
    const n = 2 * modeIndex + 1;
    const coefficient = 0.8 / (PI * n ** 3);
    return coefficient * Math.cos(n * c * t) * Math.sin(n * x) * Math.exp(-damping * modeIndex * t);
  }

  function modeSeries(x, t, modeCount, c, damping) {
    let value = 0;
    for (let modeIndex = 0; modeIndex < modeCount; modeIndex += 1) {
      value += modeValue(x, t, modeIndex, c, damping);
    }
    return value;
  }

  function wave2dData({ c, damping, periods, nT, nX, nModes }) {
    const x = linspace(0, PI, nX);
    const wideX = linspace(-2 * PI, 3 * PI, nX);
    const tFinal = (2 * periods * PI) / Math.max(c, 1e-9);
    const t = linspace(0, tFinal, nT);
    const exact = t.map((time) => x.map((space) => exactWaveValue(space, time, c)));
    const modal = t.map((time) => x.map((space) => modeSeries(space, time, nModes, c, damping)));
    const modes = [0, 1, 2].map((modeIndex) =>
      t.map((time) => x.map((space) => modeValue(space, time, modeIndex, c, damping)))
    );
    const wide = {
      initial: wideX.map((space) => oddExtension(space, PI)),
      right: t.map((time) => wideX.map((space) => rightRunningValue(space, time, c))),
      left: t.map((time) => wideX.map((space) => leftRunningValue(space, time, c))),
      combined: t.map((time) => wideX.map((space) => rightRunningValue(space, time, c) + leftRunningValue(space, time, c))),
    };

    return { x, wideX, t, exact, modal, modes, wide };
  }

  function xAxisPi(title, wide = false) {
    if (wide) {
      return {
        title,
        range: [-2 * PI, 3 * PI],
        tickmode: "array",
        tickvals: [-2 * PI, -PI, 0, PI, 2 * PI, 3 * PI],
        ticktext: ["-2π", "-π", "0", "π", "2π", "3π"],
      };
    }

    return {
      title,
      range: [0, PI],
      tickmode: "array",
      tickvals: [0, PI / 2, PI],
      ticktext: ["0", "π/2", "π"],
    };
  }

  async function initWaveMoc2d(element) {
    const plotly = await loadPlotly();
    const state = {
      c: numberFromDataset(element, "c", 1),
      showRight: element.dataset.right !== "false",
      showLeft: element.dataset.left !== "false",
      showCombined: element.dataset.combined !== "false",
      timeIndex: Math.round(numberFromDataset(element, "timeIndex", 0)),
    };
    const nT = Math.max(51, Math.round(numberFromDataset(element, "timeSteps", 121)));
    const nX = Math.max(101, Math.round(numberFromDataset(element, "samples", 301)));
    state.timeIndex = Math.min(nT - 1, Math.max(0, state.timeIndex));
    let suppress = true;

    element.innerHTML = "";
    const header = document.createElement("div");
    header.className = "course-interactive__header";
    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = "String Vibration by Characteristics";
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

      const data = wave2dData({ c: state.c, damping: 0, periods: 1, nT, nX, nModes: 5 });
      const time = data.t[state.timeIndex];
      const traces = [
        {
          x: data.wideX,
          y: data.wide.initial,
          mode: "lines",
          line: { color: "#2ca02c", width: 1, dash: "dashdot" },
          name: "Odd extension",
        },
      ];

      if (state.showRight) {
        traces.push({
          x: data.wideX,
          y: data.wide.right[state.timeIndex],
          mode: "lines",
          line: { color: "#d62728", width: 2, dash: "dash" },
          name: "Right-running half",
        });
      }
      if (state.showLeft) {
        traces.push({
          x: data.wideX,
          y: data.wide.left[state.timeIndex],
          mode: "lines",
          line: { color: "#1f77b4", width: 2, dash: "dash" },
          name: "Left-running half",
        });
      }
      if (state.showCombined) {
        traces.push(
          {
            x: data.wideX,
            y: data.wide.combined[state.timeIndex],
            mode: "lines",
            line: { color: "#111111", width: 1.5 },
            name: "d'Alembert extension",
          },
          {
            x: data.x,
            y: data.exact[state.timeIndex],
            mode: "lines",
            line: { color: "#111111", width: 3 },
            name: "String vibration",
          }
        );
      }

      traces.push(
        {
          x: [0, 0],
          y: [-0.3, 0.3],
          mode: "lines",
          line: { color: "#111111", width: 1, dash: "dot" },
          hoverinfo: "skip",
          showlegend: false,
        },
        {
          x: [PI, PI],
          y: [-0.3, 0.3],
          mode: "lines",
          line: { color: "#111111", width: 1, dash: "dot" },
          hoverinfo: "skip",
          showlegend: false,
        }
      );

      readout.textContent = `c = ${formatNumber(state.c)}; t = ${formatNumber(time / (2 * PI / state.c), 2)} T`;
      plotly.react(
        plot,
        traces,
        {
          height: 520,
          margin: { t: 24, r: 24, b: 64, l: 54 },
          xaxis: xAxisPi("x", true),
          yaxis: { title: "u", range: [-0.3, 0.3] },
          legend: { orientation: "h", y: 1.12 },
        },
        { responsive: true, displaylogo: false }
      );
    }

    controls.append(
      makeNumberInputControl({
        label: "Wave speed c",
        min: 0.25,
        max: 5,
        step: 0.25,
        value: state.c,
        onInput(value) {
          state.c = value;
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
      }),
      makeCheckboxControl({
        label: "Right-running solution",
        checked: state.showRight,
        onInput(value) {
          state.showRight = value;
          redraw();
        },
      }),
      makeCheckboxControl({
        label: "Left-running solution",
        checked: state.showLeft,
        onInput(value) {
          state.showLeft = value;
          redraw();
        },
      }),
      makeCheckboxControl({
        label: "d'Alembert solution",
        checked: state.showCombined,
        onInput(value) {
          state.showCombined = value;
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    suppress = false;
    redraw();
  }

  async function initWaveSov2d(element) {
    const plotly = await loadPlotly();
    const state = {
      c: numberFromDataset(element, "c", 1),
      damping: numberFromDataset(element, "damping", 0),
      timeIndex: Math.round(numberFromDataset(element, "timeIndex", 0)),
    };
    const nT = Math.max(51, Math.round(numberFromDataset(element, "timeSteps", 102)));
    const nX = Math.max(101, Math.round(numberFromDataset(element, "samples", 151)));
    const nModes = Math.max(5, Math.round(numberFromDataset(element, "modes", 5)));
    state.timeIndex = Math.min(nT - 1, Math.max(0, state.timeIndex));
    let suppress = true;

    element.innerHTML = "";
    const header = document.createElement("div");
    header.className = "course-interactive__header";
    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = "String Vibration by Separation of Variables";
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

      const data = wave2dData({ c: state.c, damping: state.damping, periods: 2, nT, nX, nModes });
      const time = data.t[state.timeIndex];
      const traces = [
        {
          x: data.x,
          y: data.exact[0],
          mode: "lines",
          line: { color: "#111111", width: 1, dash: "dot" },
          name: "Initial condition",
          xaxis: "x",
          yaxis: "y",
        },
        {
          x: data.x,
          y: data.exact[state.timeIndex],
          mode: "lines",
          line: { color: "#1f77b4", width: 2.5 },
          name: "d'Alembert solution",
          xaxis: "x",
          yaxis: "y",
        },
        {
          x: data.x,
          y: data.modal[state.timeIndex],
          mode: "lines",
          line: { color: "#d62728", width: 2, dash: "dash" },
          name: "SoV approximation",
          xaxis: "x",
          yaxis: "y",
        },
      ];

      data.modes.forEach((modeData, modeIndex) => {
        traces.push({
          x: data.x,
          y: modeData[state.timeIndex],
          mode: "lines",
          line: { color: "#111111", width: 2 },
          name: `Mode ${modeIndex + 1}`,
          showlegend: modeIndex === 0,
          xaxis: `x${modeIndex + 2}`,
          yaxis: `y${modeIndex + 2}`,
        });
      });

      readout.textContent = `c = ${formatNumber(state.c)}; damping = ${formatNumber(
        state.damping
      )}; t = ${formatNumber(time / (2 * PI / state.c), 2)} T`;

      plotly.react(
        plot,
        traces,
        {
          height: 820,
          margin: { t: 34, r: 24, b: 58, l: 56 },
          legend: { orientation: "h", y: 1.08 },
          annotations: [
            { text: "Series solution", x: 0, y: 1, xref: "paper", yref: "paper", showarrow: false, xanchor: "left" },
            { text: "Mode 1", x: 0, y: 0.73, xref: "paper", yref: "paper", showarrow: false, xanchor: "left" },
            { text: "Mode 2", x: 0, y: 0.48, xref: "paper", yref: "paper", showarrow: false, xanchor: "left" },
            { text: "Mode 3", x: 0, y: 0.23, xref: "paper", yref: "paper", showarrow: false, xanchor: "left" },
          ],
          xaxis: { ...xAxisPi(""), domain: [0, 1], anchor: "y" },
          yaxis: { title: "u", range: [-0.3, 0.3], domain: [0.78, 1], anchor: "x" },
          xaxis2: { ...xAxisPi(""), domain: [0, 1], anchor: "y2" },
          yaxis2: { title: "u1", range: [-0.28, 0.28], domain: [0.53, 0.73], anchor: "x2" },
          xaxis3: { ...xAxisPi(""), domain: [0, 1], anchor: "y3" },
          yaxis3: { title: "u2", range: [-0.012, 0.012], domain: [0.28, 0.48], anchor: "x3" },
          xaxis4: { ...xAxisPi("x"), domain: [0, 1], anchor: "y4" },
          yaxis4: { title: "u3", range: [-0.003, 0.003], domain: [0.03, 0.23], anchor: "x4" },
        },
        { responsive: true, displaylogo: false }
      );
    }

    controls.append(
      makeNumberInputControl({
        label: "Wave speed c",
        min: 0.25,
        max: 5,
        step: 0.25,
        value: state.c,
        onInput(value) {
          state.c = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Damping",
        min: 0,
        max: 2,
        step: 0.05,
        value: state.damping,
        onInput(value) {
          state.damping = value;
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

  function surfaceScene(title, zRange) {
    return {
      aspectmode: "manual",
      aspectratio: { x: 2.2, y: 2.8, z: 0.8 },
      camera: { eye: { x: 1.4, y: 1.8, z: 1.0 }, projection: { type: "orthographic" } },
      xaxis: { title: "x", tickmode: "array", tickvals: [0, PI / 2, PI], ticktext: ["0", "π/2", "π"] },
      yaxis: { title: "t" },
      zaxis: { title, range: zRange },
    };
  }

  async function initWaveSov3d(element) {
    const plotly = await loadPlotly();
    const state = {
      c: numberFromDataset(element, "c", 1),
      damping: numberFromDataset(element, "damping", 0),
    };
    const nT = Math.max(31, Math.round(numberFromDataset(element, "timeSteps", 61)));
    const nX = Math.max(51, Math.round(numberFromDataset(element, "samples", 101)));
    let suppress = true;

    element.innerHTML = "";
    const header = document.createElement("div");
    header.className = "course-interactive__header";
    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = "String Vibration Surfaces";
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

      const data = wave2dData({ c: state.c, damping: state.damping, periods: 1, nT, nX, nModes: 5 });
      const zRange = [-0.3, 0.3];
      readout.textContent = `c = ${formatNumber(state.c)}; damping = ${formatNumber(state.damping)}`;
      plotly.react(
        plot,
        [
          {
            type: "surface",
            x: data.x,
            y: data.t,
            z: data.exact,
            scene: "scene",
            colorscale: "Viridis",
            showscale: false,
            name: "Exact solution",
            hovertemplate: "x=%{x:.2f}<br>t=%{y:.2f}<br>u=%{z:.3f}<extra>Exact</extra>",
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
        ],
        {
          height: 850,
          margin: { t: 44, r: 12, b: 8, l: 12 },
          annotations: [
            { text: "Exact solution", x: 0, y: 1, xref: "paper", yref: "paper", showarrow: false, xanchor: "left" },
            { text: "Mode 1", x: 0, y: 0.645, xref: "paper", yref: "paper", showarrow: false, xanchor: "left" },
            { text: "Mode 2", x: 0, y: 0.31, xref: "paper", yref: "paper", showarrow: false, xanchor: "left" },
          ],
          scene: { ...surfaceScene("u", zRange), domain: { x: [0, 1], y: [0.69, 1] } },
          scene2: { ...surfaceScene("u1", [-0.28, 0.28]), domain: { x: [0, 1], y: [0.35, 0.66] } },
          scene3: { ...surfaceScene("u2", [-0.012, 0.012]), domain: { x: [0, 1], y: [0.01, 0.32] } },
        },
        { responsive: true, displaylogo: false }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Wave speed c",
        min: 1,
        max: 2,
        step: 0.05,
        value: state.c,
        onInput(value) {
          state.c = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Damping",
        min: 0,
        max: 2,
        step: 0.05,
        value: state.damping,
        onInput(value) {
          state.damping = value;
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    suppress = false;
    redraw();
  }

  registerExample("m5-wave-moc-2d", initWaveMoc2d, {
    selectors: [".course-interactive-m5-wave-moc-2d"],
  });
  registerExample("m5-wave-sov-2d", initWaveSov2d, {
    selectors: [".course-interactive-m5-wave-sov-2d"],
  });
  registerExample("m5-wave-sov-3d", initWaveSov3d, {
    selectors: [".course-interactive-m5-wave-sov-3d"],
  });
})();
