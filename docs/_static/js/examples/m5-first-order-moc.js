(function () {
  "use strict";

  const {
    loadPlotly,
    makeRangeControl,
    makeSelectControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

  const CASE_OPTIONS = [
    { label: "1: u_t + u_x = 0", value: "1" },
    { label: "2: u_t + exp(-t) u_x = 0", value: "2" },
    { label: "3: u_t + exp(-t) u_x = -u^2", value: "3" },
    { label: "4: u_t + u_x = -u^2", value: "4" },
  ];

  function linspace(start, stop, count) {
    if (count <= 1) {
      return [start];
    }

    return Array.from({ length: count }, (_, index) => start + ((stop - start) * index) / (count - 1));
  }

  function boundedCase(value) {
    return CASE_OPTIONS.some((option) => option.value === String(value)) ? String(value) : "1";
  }

  function initialPulse(r) {
    return Math.exp(-2 * (r - 2) * (r - 2));
  }

  function formatNumber(value, digits = 2) {
    return Number(value).toFixed(digits).replace(/\.?0+$/, "");
  }

  function caseMetadata(caseKey) {
    if (caseKey === "1") {
      return {
        label: "u_t + u_x = 0",
        characteristicFromPoint: (x, t) => x - t,
        pointFromCharacteristic: (r, t) => r + t,
        solutionFromCharacteristic: (r) => initialPulse(r),
      };
    }
    if (caseKey === "2") {
      return {
        label: "u_t + exp(-t) u_x = 0",
        characteristicFromPoint: (x, t) => x + Math.exp(-t) - 1,
        pointFromCharacteristic: (r, t) => r - Math.exp(-t) + 1,
        solutionFromCharacteristic: (r) => initialPulse(r),
      };
    }
    if (caseKey === "3") {
      return {
        label: "u_t + exp(-t) u_x = -u^2",
        characteristicFromPoint: (x, t) => x + Math.exp(-t) - 1,
        pointFromCharacteristic: (r, t) => r - Math.exp(-t) + 1,
        solutionFromCharacteristic: (r, t) => initialPulse(r) / (1 + t * initialPulse(r)),
      };
    }

    return {
      label: "u_t + u_x = -u^2",
      characteristicFromPoint: (x, t) => x - t,
      pointFromCharacteristic: (r, t) => r + t,
      solutionFromCharacteristic: (r, t) => initialPulse(r) / (1 + t * initialPulse(r)),
    };
  }

  function firstOrderData(caseKey, options = {}) {
    const metadata = caseMetadata(caseKey);
    const xFinal = options.xFinal || 6;
    const tFinal = options.tFinal || 2;
    const rFinal = options.rFinal || 4;
    const nX = options.nX || 121;
    const nT = options.nT || 101;
    const nR = options.nR || 101;
    const x = linspace(0, xFinal, nX);
    const t = linspace(0, tFinal, nT);
    const r = linspace(0, rFinal, nR);

    const surface = t.map((time) =>
      x.map((space) => {
        const characteristic = metadata.characteristicFromPoint(space, time);
        return metadata.solutionFromCharacteristic(characteristic, time);
      })
    );
    const characteristicX = t.map((time) => r.map((coordinate) => metadata.pointFromCharacteristic(coordinate, time)));
    const movingSolution = t.map((time) => r.map((coordinate) => metadata.solutionFromCharacteristic(coordinate, time)));

    return { metadata, x, t, r, surface, characteristicX, movingSolution };
  }

  function shockInitial(r) {
    return 1 - r * r;
  }

  function shockRoot(space, time) {
    if (Math.abs(time) < 1e-9) {
      return space;
    }

    const discriminant = 1 + 4 * time * time - 4 * space * time;
    if (discriminant < 0) {
      return null;
    }

    return (1 - Math.sqrt(discriminant)) / (2 * time);
  }

  function shockValue(space, time) {
    const root = shockRoot(space, time);
    if (root === null || root < -1 || root > 1) {
      return null;
    }
    return shockInitial(root);
  }

  function shockData(options = {}) {
    const xFinal = options.xFinal || 1.5;
    const tFinal = options.tFinal || 0.5;
    const rFinal = options.rFinal || 1;
    const nX = options.nX || 121;
    const nT = options.nT || 51;
    const nR = options.nR || 51;
    const x = linspace(-xFinal, xFinal, nX);
    const t = linspace(0, tFinal, nT);
    const r = linspace(-rFinal, rFinal, nR);
    const surface = t.map((time) => x.map((space) => shockValue(space, time)));
    const characteristicX = t.map((time) => r.map((coordinate) => coordinate + shockInitial(coordinate) * time));
    const movingSolution = t.map(() => r.map(shockInitial));

    return { x, t, r, surface, characteristicX, movingSolution };
  }

  function makeCharacteristicTraces(data, xaxis, yaxis, count, color) {
    const traces = [];
    const stride = Math.max(1, Math.floor((data.r.length - 1) / (count - 1)));

    for (let index = 0; index < data.r.length; index += stride) {
      traces.push({
        x: data.t.map((_, timeIndex) => data.characteristicX[timeIndex][index]),
        y: data.t,
        mode: "lines",
        line: { color, width: 1, dash: "dash" },
        hoverinfo: "skip",
        showlegend: false,
        xaxis,
        yaxis,
      });
    }

    return traces;
  }

  function standard2dLayout(title, xRange, rRange, tRange, yRange) {
    return {
      height: 820,
      margin: { t: 50, r: 24, b: 58, l: 58 },
      legend: { orientation: "h", y: 1.06 },
      annotations: [
        {
          text: title,
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
          text: "Moving frame",
          x: 0,
          y: 0.99,
          xref: "paper",
          yref: "paper",
          xanchor: "left",
          yanchor: "top",
          showarrow: false,
        },
        {
          text: "Fixed frame",
          x: 0,
          y: 0.66,
          xref: "paper",
          yref: "paper",
          xanchor: "left",
          yanchor: "top",
          showarrow: false,
        },
        {
          text: "x-t frame",
          x: 0,
          y: 0.32,
          xref: "paper",
          yref: "paper",
          xanchor: "left",
          yanchor: "top",
          showarrow: false,
        },
      ],
      xaxis: { title: "eta", range: rRange, domain: [0, 1], anchor: "y" },
      yaxis: { title: "u", range: yRange, domain: [0.71, 1], anchor: "x" },
      xaxis2: { title: "x", range: xRange, domain: [0, 1], anchor: "y2" },
      yaxis2: { title: "u", range: yRange, domain: [0.38, 0.67], anchor: "x2" },
      xaxis3: { title: "x", range: xRange, domain: [0, 1], anchor: "y3" },
      yaxis3: { title: "t", range: tRange, domain: [0, 0.32], anchor: "x3" },
    };
  }

  function build2dTraces(data, activeIndex, options = {}) {
    const fixedX = data.characteristicX[activeIndex];
    const movingY = data.movingSolution[activeIndex];
    const time = data.t[activeIndex];
    const initialX = options.initialX || data.x;
    const initialY = options.initialY || data.x.map(initialPulse);
    const xAxis3 = "x3";
    const yAxis3 = "y3";
    const traces = [
      {
        x: initialX,
        y: initialY,
        mode: "lines",
        line: { color: "#111111", width: 1, dash: "dot" },
        name: "Initial condition",
        xaxis: "x",
        yaxis: "y",
      },
      {
        x: data.r,
        y: movingY,
        mode: "lines",
        line: { color: "#1f77b4", width: 2.5 },
        name: "Moving frame",
        xaxis: "x",
        yaxis: "y",
      },
      {
        x: initialX,
        y: initialY,
        mode: "lines",
        line: { color: "#111111", width: 1, dash: "dot" },
        name: "Initial condition",
        showlegend: false,
        xaxis: "x2",
        yaxis: "y2",
      },
      {
        x: fixedX,
        y: movingY,
        mode: "lines",
        line: { color: "#d62728", width: 2.5 },
        name: "Fixed frame",
        xaxis: "x2",
        yaxis: "y2",
      },
      {
        x: [fixedX[0], fixedX[0]],
        y: [-0.05, 1.1],
        mode: "lines",
        line: { color: "#2ca02c", width: 1, dash: "dash" },
        hoverinfo: "skip",
        showlegend: false,
        xaxis: "x2",
        yaxis: "y2",
      },
      {
        x: [fixedX[fixedX.length - 1], fixedX[fixedX.length - 1]],
        y: [-0.05, 1.1],
        mode: "lines",
        line: { color: "#2ca02c", width: 1, dash: "dash" },
        hoverinfo: "skip",
        showlegend: false,
        xaxis: "x2",
        yaxis: "y2",
      },
      {
        type: "contour",
        x: data.x,
        y: data.t,
        z: data.surface,
        colorscale: "Viridis",
        contours: { coloring: "heatmap" },
        showscale: false,
        hovertemplate: "x=%{x:.2f}<br>t=%{y:.2f}<br>u=%{z:.3f}<extra></extra>",
        name: "Solution field",
        xaxis: xAxis3,
        yaxis: yAxis3,
      },
      {
        x: fixedX,
        y: new Array(fixedX.length).fill(time),
        mode: "lines",
        line: { color: "#d62728", width: 2 },
        name: "Current frame",
        showlegend: false,
        xaxis: xAxis3,
        yaxis: yAxis3,
      },
      {
        x: [fixedX[0], fixedX[0]],
        y: [0, data.t[data.t.length - 1]],
        mode: "lines",
        line: { color: "#2ca02c", width: 1, dash: "dash" },
        hoverinfo: "skip",
        showlegend: false,
        xaxis: xAxis3,
        yaxis: yAxis3,
      },
      {
        x: [fixedX[fixedX.length - 1], fixedX[fixedX.length - 1]],
        y: [0, data.t[data.t.length - 1]],
        mode: "lines",
        line: { color: "#2ca02c", width: 1, dash: "dash" },
        hoverinfo: "skip",
        showlegend: false,
        xaxis: xAxis3,
        yaxis: yAxis3,
      },
    ];

    traces.push(...makeCharacteristicTraces(data, xAxis3, yAxis3, options.characteristicCount || 6, "#111111"));
    return traces;
  }

  async function initFirstOrderMoc2d(element) {
    const plotly = await loadPlotly();
    const state = {
      caseKey: boundedCase(element.dataset.case || "1"),
      timeIndex: Math.round(numberFromDataset(element, "timeIndex", 0)),
    };
    const nT = Math.max(21, Math.round(numberFromDataset(element, "timeSteps", 101)));
    state.timeIndex = Math.min(nT - 1, Math.max(0, state.timeIndex));
    let suppress = true;

    element.innerHTML = "";
    const header = document.createElement("div");
    header.className = "course-interactive__header";
    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = "First-Order PDE Characteristics";
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

      const data = firstOrderData(state.caseKey, { nT });
      const time = data.t[state.timeIndex];
      readout.textContent = `${data.metadata.label}; t = ${formatNumber(time, 2)}`;
      plotly.react(
        plot,
        build2dTraces(data, state.timeIndex),
        standard2dLayout(data.metadata.label, [0, 6], [0, 4], [0, 2], [-0.05, 1.1]),
        { responsive: true, displaylogo: false }
      );
    }

    controls.append(
      makeSelectControl({
        label: "PDE case",
        options: CASE_OPTIONS,
        value: state.caseKey,
        onInput(value) {
          state.caseKey = boundedCase(value);
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

  async function initFirstOrderMoc3d(element) {
    const plotly = await loadPlotly();
    const state = {
      caseKey: boundedCase(element.dataset.case || "1"),
    };
    let suppress = true;

    element.innerHTML = "";
    const header = document.createElement("div");
    header.className = "course-interactive__header";
    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = "First-Order PDE Surface";
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

      const data = firstOrderData(state.caseKey);
      readout.textContent = data.metadata.label;
      plotly.react(
        plot,
        [
          {
            type: "surface",
            x: data.x,
            y: data.t,
            z: data.surface,
            colorscale: "Viridis",
            showscale: false,
            hovertemplate: "x=%{x:.2f}<br>t=%{y:.2f}<br>u=%{z:.3f}<extra></extra>",
          },
        ],
        {
          height: 760,
          margin: { t: 34, r: 16, b: 8, l: 16 },
          scene: {
            aspectmode: "manual",
            aspectratio: { x: 1.3, y: 1, z: 0.75 },
            camera: { eye: { x: 1.45, y: 1.65, z: 1.1 }, projection: { type: "orthographic" } },
            xaxis: { title: "x" },
            yaxis: { title: "t" },
            zaxis: { title: "u", range: [-0.05, 1.05] },
          },
        },
        { responsive: true, displaylogo: false }
      );
    }

    controls.append(
      makeSelectControl({
        label: "PDE case",
        options: CASE_OPTIONS,
        value: state.caseKey,
        onInput(value) {
          state.caseKey = boundedCase(value);
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    suppress = false;
    redraw();
  }

  async function initShock2d(element) {
    const plotly = await loadPlotly();
    const nT = Math.max(21, Math.round(numberFromDataset(element, "timeSteps", 51)));
    const state = {
      timeIndex: Math.min(nT - 1, Math.max(0, Math.round(numberFromDataset(element, "timeIndex", 0)))),
    };
    let suppress = true;

    element.innerHTML = "";
    const header = document.createElement("div");
    header.className = "course-interactive__header";
    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = "First-Order PDE and Shock Formation";
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

      const data = shockData({ nT });
      const time = data.t[state.timeIndex];
      readout.textContent = `u_t + u u_x = 0; t = ${formatNumber(time, 2)}`;
      plotly.react(
        plot,
        build2dTraces(data, state.timeIndex, {
          initialX: data.x,
          initialY: data.x.map((value) => (value >= -1 && value <= 1 ? shockInitial(value) : null)),
          characteristicCount: 18,
        }),
        standard2dLayout("u_t + u u_x = 0", [-1.5, 1.5], [-1, 1], [0, 0.5], [-0.05, 1.1]),
        { responsive: true, displaylogo: false }
      );
    }

    controls.append(
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

  registerExample("m5-first-order-moc-2d", initFirstOrderMoc2d, {
    selectors: [".course-interactive-m5-first-order-moc-2d"],
  });
  registerExample("m5-first-order-moc-3d", initFirstOrderMoc3d, {
    selectors: [".course-interactive-m5-first-order-moc-3d"],
  });
  registerExample("m5-first-order-moc-shock-2d", initShock2d, {
    selectors: [".course-interactive-m5-first-order-moc-shock-2d"],
  });
})();
