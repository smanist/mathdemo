(function () {
  "use strict";

  const {
    loadPlotly,
    makeNumberInputControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

  const TIME_FINAL = 16;
  const TIME_SAMPLES = 201;
  const OMEGA_SAMPLES = 41;
  const DEFAULT_OMEGA_MAX = 4;
  const OMEGA_BOUND_STEP = 0.5;

  function linspace(start, stop, count) {
    if (count <= 1) {
      return [start];
    }

    return Array.from({ length: count }, (_, index) => start + ((stop - start) * index) / (count - 1));
  }

  function roundUpToStep(value, step) {
    return Math.ceil(value / step) * step;
  }

  function roundDownToStep(value, step) {
    return Math.floor(value / step) * step;
  }

  function makeCheckboxControl({ label, checked, onInput }) {
    const wrapper = document.createElement("div");
    wrapper.className = "course-interactive__control";

    const labelElement = document.createElement("label");
    const input = document.createElement("input");

    input.type = "checkbox";
    input.checked = checked;
    labelElement.append(input, " ", label);
    wrapper.append(labelElement);

    input.addEventListener("input", () => {
      onInput(input.checked);
    });

    return wrapper;
  }

  function forcing(decay, omega, time) {
    return Math.exp(decay * time) * Math.cos(omega * time);
  }

  function derivative(time, state, a, b, decay, omega) {
    return [
      state[1],
      -b * state[0] - a * state[1] + forcing(decay, omega, time),
    ];
  }

  function rk4Step(time, step, state, a, b, decay, omega) {
    const k1 = derivative(time, state, a, b, decay, omega);
    const k2State = [
      state[0] + 0.5 * step * k1[0],
      state[1] + 0.5 * step * k1[1],
    ];
    const k2 = derivative(time + 0.5 * step, k2State, a, b, decay, omega);
    const k3State = [
      state[0] + 0.5 * step * k2[0],
      state[1] + 0.5 * step * k2[1],
    ];
    const k3 = derivative(time + 0.5 * step, k3State, a, b, decay, omega);
    const k4State = [
      state[0] + step * k3[0],
      state[1] + step * k3[1],
    ];
    const k4 = derivative(time + step, k4State, a, b, decay, omega);

    return [
      state[0] + (step / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      state[1] + (step / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    ];
  }

  function simulateResponse(w0, zeta, sigma, omega, timeValues) {
    const a = 2 * zeta * w0;
    const b = w0 * w0;
    const decay = -Math.abs(sigma);
    const input = [];
    const response = [];
    let state = [0, 0];

    input.push(forcing(decay, omega, timeValues[0]));
    response.push(0);

    for (let index = 1; index < timeValues.length; index += 1) {
      const time = timeValues[index - 1];
      const step = timeValues[index] - timeValues[index - 1];
      state = rk4Step(time, step, state, a, b, decay, omega);
      input.push(forcing(decay, omega, timeValues[index]));
      response.push(state[0]);
    }

    return { input, response };
  }

  function quadraticRoots(a, b) {
    const discriminant = a * a - 4 * b;

    if (discriminant >= 0) {
      const sqrtDisc = Math.sqrt(discriminant);
      return [
        { re: (-a + sqrtDisc) / 2, im: 0 },
        { re: (-a - sqrtDisc) / 2, im: 0 },
      ];
    }

    const sqrtImag = Math.sqrt(-discriminant) / 2;
    return [
      { re: -a / 2, im: sqrtImag },
      { re: -a / 2, im: -sqrtImag },
    ];
  }

  function gainValue(realPart, imagPart, a, b) {
    const denominatorReal = realPart * realPart - imagPart * imagPart + a * realPart + b;
    const denominatorImag = 2 * realPart * imagPart + a * imagPart;
    const magnitude = Math.hypot(denominatorReal, denominatorImag);
    return -Math.log(Math.max(magnitude, 1e-12));
  }

  function peakGainOmega(a, b, decay) {
    const alpha = decay * decay + a * decay + b;
    const beta = 2 * decay + a;
    const candidateSquared = alpha - 0.5 * beta * beta;
    return Math.sqrt(Math.max(0, candidateSquared));
  }

  function omegaPlotBounds(w0, poles, peakOmega) {
    const poleImagMax = Math.max(...poles.map((pole) => Math.abs(pole.im)));
    const omegaMax = Math.max(
      DEFAULT_OMEGA_MAX,
      roundUpToStep(Math.max(w0, poleImagMax, peakOmega), OMEGA_BOUND_STEP)
    );
    const omegaAxisMax = roundUpToStep(omegaMax + 0.25, OMEGA_BOUND_STEP);

    return { omegaAxisMax, omegaMax };
  }

  function sPlaneBounds(poles, decay) {
    const leftmostReal = Math.min(decay, ...poles.map((pole) => pole.re));
    const xMin = Math.min(-3, roundDownToStep(leftmostReal - 0.25, OMEGA_BOUND_STEP));
    const xMax = 0.1;

    return { xMax, xMin };
  }

  function periodicExciteData(w0, zeta, sigma, showGain) {
    const a = 2 * zeta * w0;
    const b = w0 * w0;
    const decay = -Math.abs(sigma);
    const timeValues = linspace(0, TIME_FINAL, TIME_SAMPLES);
    const poles = quadraticRoots(a, b);
    const peakOmega = peakGainOmega(a, b, decay);
    const { omegaAxisMax, omegaMax } = omegaPlotBounds(w0, poles, peakOmega);
    const { xMax, xMin } = sPlaneBounds(poles, decay);
    const omegaValues = linspace(0, omegaMax, OMEGA_SAMPLES);
    const inputSeries = [];
    const responseSeries = [];
    let responseMin = Infinity;
    let responseMax = -Infinity;

    omegaValues.forEach((omega) => {
      const simulation = simulateResponse(w0, zeta, sigma, omega, timeValues);
      inputSeries.push(simulation.input);
      responseSeries.push(simulation.response);

      simulation.response.forEach((value) => {
        responseMin = Math.min(responseMin, value);
        responseMax = Math.max(responseMax, value);
      });
    });

    const peakSimulation = showGain ? simulateResponse(w0, zeta, sigma, peakOmega, timeValues) : null;
    const gridX = linspace(xMin, xMax, 41);
    const gridY = linspace(-omegaAxisMax, omegaAxisMax, 82);
    const gainGrid = showGain
      ? gridY.map((imagPart) => gridX.map((realPart) => gainValue(realPart, imagPart, a, b)))
      : null;
    const peakGain = showGain ? gainValue(decay, peakOmega, a, b) : null;
    const responsePadding = Math.max(0.2, 0.08 * (responseMax - responseMin || 1));

    return {
      decay,
      gainGrid,
      gridX,
      gridY,
      inputSeries,
      omegaAxisMax,
      omegaValues,
      sPlaneRange: [xMin, xMax],
      peakGain,
      peakOmega,
      peakSimulation,
      poles,
      responseRange: [responseMin - responsePadding, responseMax + responsePadding],
      responseSeries,
      timeValues,
    };
  }

  async function initPeriodicExcite(element) {
    const plotly = await loadPlotly();
    let w0 = numberFromDataset(element, "w0", 2);
    let zeta = numberFromDataset(element, "zeta", 0);
    let sigma = numberFromDataset(element, "sigma", 0);
    let showGain = element.dataset.showGain === "true";
    let activeOmegaIndex = 0;
    let latestData = null;

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Periodic Excitation and Resonance";

    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Plotly";

    const controls = document.createElement("div");
    controls.className = "course-interactive__controls";

    const readout = document.createElement("div");
    readout.className = "course-interactive__readout";

    const plot = document.createElement("div");
    plot.className = "course-interactive__plot course-interactive__plot--large";

    function updateReadout() {
      if (!latestData) {
        return;
      }

      const omega = latestData.omegaValues[activeOmegaIndex];
      const poleText = latestData.poles[0].im === 0
        ? `${latestData.poles[0].re.toFixed(2)}, ${latestData.poles[1].re.toFixed(2)}`
        : `${latestData.poles[0].re.toFixed(2)} +/- ${Math.abs(latestData.poles[0].im).toFixed(2)}i`;

      const parts = [
        `omega = ${omega.toFixed(2)}`,
        `poles: ${poleText}`,
      ];

      if (showGain) {
        parts.push(`peak gain on Re(s) = ${latestData.decay.toFixed(2)} is near omega = ${latestData.peakOmega.toFixed(2)}`);
      }

      readout.textContent = parts.join("; ");
      element.dataset.currentOmega = omega.toFixed(2);
      element.dataset.currentNaturalFrequency = w0.toFixed(2);
      element.dataset.currentDampingRatio = zeta.toFixed(2);
      element.dataset.currentSigma = sigma.toFixed(2);
    }

    function redraw() {
      latestData = periodicExciteData(w0, zeta, sigma, showGain);
      activeOmegaIndex = Math.min(activeOmegaIndex, latestData.omegaValues.length - 1);
      updateReadout();

      const traces = [];

      latestData.omegaValues.forEach((omega, index) => {
        traces.push({
          x: latestData.timeValues,
          y: latestData.inputSeries[index],
          visible: index === activeOmegaIndex,
          mode: "lines",
          line: { color: "black", width: 1.5 },
          name: "Input",
          showlegend: false,
          xaxis: "x",
          yaxis: "y",
        });
      });

      latestData.omegaValues.forEach((omega, index) => {
        traces.push({
          x: latestData.timeValues,
          y: latestData.responseSeries[index],
          visible: index === activeOmegaIndex,
          mode: "lines",
          line: { color: "black", width: 1.5 },
          name: "Response",
          showlegend: false,
          xaxis: "x3",
          yaxis: "y3",
        });
      });

      latestData.omegaValues.forEach((omega, index) => {
        traces.push({
          x: [latestData.decay, latestData.decay],
          y: [-omega, omega],
          visible: index === activeOmegaIndex,
          mode: "markers",
          marker: { color: "black", size: 12, symbol: "star" },
          name: "Input roots",
          showlegend: false,
          xaxis: "x2",
          yaxis: "y2",
        });
      });

      traces.push({
        x: [latestData.poles[0].re, latestData.poles[1].re],
        y: [latestData.poles[0].im, latestData.poles[1].im],
        visible: true,
        mode: "markers",
        marker: { color: "black", size: 12, symbol: "x" },
        name: "Poles",
        showlegend: false,
        xaxis: "x2",
        yaxis: "y2",
      });

      if (showGain) {
        traces.push(
          {
            x: latestData.timeValues,
            y: latestData.peakSimulation.response,
            visible: true,
            mode: "lines",
            line: { color: "rgba(200, 0, 0, 0.55)", width: 1.5 },
            name: "Peak-gain response",
            showlegend: false,
            xaxis: "x3",
            yaxis: "y3",
          },
          {
            x: latestData.gridX,
            y: latestData.gridY,
            z: latestData.gainGrid,
            visible: true,
            type: "contour",
            ncontours: 16,
            showscale: false,
            contours: { coloring: "lines", showlabels: true },
            line: { width: 2 },
            xaxis: "x2",
            yaxis: "y2",
          },
          {
            x: latestData.gridX,
            y: latestData.gridY,
            z: latestData.gainGrid,
            visible: true,
            type: "contour",
            showscale: false,
            colorscale: [
              [0, "rgb(0,0,0)"],
              [1, "rgb(0,0,0)"],
            ],
            contours: {
              coloring: "lines",
              start: latestData.peakGain,
              end: latestData.peakGain,
            },
            line: { width: 2, dash: "dash" },
            xaxis: "x2",
            yaxis: "y2",
          },
          {
            x: [latestData.decay, latestData.decay],
            y: [-latestData.peakOmega, latestData.peakOmega],
            visible: true,
            mode: "markers",
            marker: { color: "rgba(200, 0, 0, 0.55)", size: 12, symbol: "star" },
            name: "Peak-gain roots",
            showlegend: false,
            xaxis: "x2",
            yaxis: "y2",
          }
        );
      }

      const fixedTraceCount = showGain ? 5 : 1;
      const steps = latestData.omegaValues.map((omega, index) => {
        const visible = new Array(3 * latestData.omegaValues.length + fixedTraceCount).fill(false);
        visible[index] = true;
        visible[index + latestData.omegaValues.length] = true;
        visible[index + 2 * latestData.omegaValues.length] = true;
        visible.fill(true, 3 * latestData.omegaValues.length);

        return {
          method: "update",
          args: [{ visible }],
          label: omega.toFixed(2),
        };
      });

      plotly.react(
        plot,
        traces,
        {
          annotations: [
            { text: "Time-domain input", x: 0.19, y: 1.06, xref: "paper", yref: "paper", showarrow: false },
            { text: "s-plane", x: 0.78, y: 1.06, xref: "paper", yref: "paper", showarrow: false },
            { text: "Time-domain response", x: 0.19, y: 0.47, xref: "paper", yref: "paper", showarrow: false },
          ],
          autosize: true,
          height: 680,
          margin: { t: 56, r: 24, b: 110, l: 56 },
          sliders: [
            {
              active: activeOmegaIndex,
              currentvalue: { prefix: "omega = " },
              pad: { t: 46 },
              steps,
            },
          ],
          xaxis: { domain: [0, 0.42], title: "t" },
          yaxis: { domain: [0.62, 1], range: [-1.05, 1.05], title: "r(t)" },
          xaxis2: { domain: [0.54, 1], range: latestData.sPlaneRange, title: "Re" },
          yaxis2: { domain: [0, 1], range: [-latestData.omegaAxisMax, latestData.omegaAxisMax], title: "Im" },
          xaxis3: { domain: [0, 0.42], title: "t" },
          yaxis3: { domain: [0, 0.38], range: latestData.responseRange, title: "y(t)" },
        },
        { displaylogo: false, responsive: true }
      );
    }

    controls.append(
      makeNumberInputControl({
        label: "Natural frequency omega_0",
        min: 0.1,
        max: 6,
        step: 0.1,
        value: w0,
        onInput: (value) => {
          w0 = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Damping ratio zeta",
        min: 0,
        max: 3,
        step: 0.1,
        value: zeta,
        onInput: (value) => {
          zeta = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Decay rate sigma",
        min: 0,
        max: 3,
        step: 0.05,
        value: sigma,
        onInput: (value) => {
          sigma = value;
          redraw();
        },
      }),
      makeCheckboxControl({
        label: "Show gain plot",
        checked: showGain,
        onInput: (value) => {
          showGain = value;
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    redraw();

    plot.on("plotly_sliderchange", (event) => {
      if (!latestData) {
        return;
      }

      const nextOmega = Number.parseFloat(event.step.label);
      const nextIndex = latestData.omegaValues.findIndex(
        (value) => Math.abs(value - nextOmega) < 1e-9
      );

      if (nextIndex >= 0) {
        activeOmegaIndex = nextIndex;
        updateReadout();
      }
    });
  }

  registerExample("periodic-excite", initPeriodicExcite, {
    selectors: [".course-interactive-periodic-excite"],
  });
})();
