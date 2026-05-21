(function () {
  "use strict";

  const {
    loadPlotly,
    makeNumberInputControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

  function sampleTimes(tFinal, sampleCount) {
    return Array.from({ length: sampleCount }, (_, index) => (tFinal * index) / (sampleCount - 1));
  }

  function forcingSeries(times, omega) {
    return times.map((time) => Math.sin(omega * time));
  }

  function integrateOscillator({
    w0,
    zeta,
    omega,
    tFinal,
    sampleCount,
    displacement0,
    velocity0,
    forcingScale,
  }) {
    const times = sampleTimes(tFinal, sampleCount);
    const displacement = [];
    let y = displacement0;
    let v = velocity0;

    function rhs(time, nextY, nextV) {
      return {
        dy: nextV,
        dv: forcingScale * Math.sin(omega * time) - 2 * zeta * w0 * nextV - w0 * w0 * nextY,
      };
    }

    for (let index = 0; index < times.length; index += 1) {
      displacement.push(y);

      if (index === times.length - 1) {
        continue;
      }

      const time = times[index];
      const step = times[index + 1] - time;
      const k1 = rhs(time, y, v);
      const k2 = rhs(time + 0.5 * step, y + 0.5 * step * k1.dy, v + 0.5 * step * k1.dv);
      const k3 = rhs(time + 0.5 * step, y + 0.5 * step * k2.dy, v + 0.5 * step * k2.dv);
      const k4 = rhs(time + step, y + step * k3.dy, v + step * k3.dv);

      y += (step * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy)) / 6;
      v += (step * (k1.dv + 2 * k2.dv + 2 * k3.dv + k4.dv)) / 6;
    }

    return { times, displacement };
  }

  function omegaSweep(omegaMin, omegaMax, omegaSteps) {
    if (omegaSteps <= 1) {
      return [omegaMin];
    }

    return Array.from({ length: omegaSteps }, (_, index) => {
      const weight = index / (omegaSteps - 1);
      return omegaMin + (omegaMax - omegaMin) * weight;
    });
  }

  function minMax(seriesCollection) {
    let min = Infinity;
    let max = -Infinity;

    seriesCollection.forEach((values) => {
      values.forEach((value) => {
        if (value < min) {
          min = value;
        }
        if (value > max) {
          max = value;
        }
      });
    });

    return { min, max };
  }

  function paddedRange(min, max) {
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return [-1, 1];
    }

    if (Math.abs(max - min) < 1e-9) {
      const magnitude = Math.max(1, Math.abs(max));
      return [min - 0.25 * magnitude, max + 0.25 * magnitude];
    }

    const padding = 0.08 * (max - min);
    return [min - padding, max + padding];
  }

  function dampingRegime(zeta) {
    if (Math.abs(zeta) < 1e-9) {
      return "undamped";
    }
    if (Math.abs(zeta - 1) < 1e-9) {
      return "critically damped";
    }
    if (zeta < 1) {
      return "underdamped";
    }
    return "overdamped";
  }

  function buildSweepData({
    w0,
    zeta,
    y0,
    v0,
    tFinal,
    sampleCount,
    omegaMin,
    omegaMax,
    omegaSteps,
  }) {
    const omegas = omegaSweep(omegaMin, omegaMax, omegaSteps);
    const sweeps = omegas.map((omega) => {
      const total = integrateOscillator({
        w0,
        zeta,
        omega,
        tFinal,
        sampleCount,
        displacement0: y0,
        velocity0: v0,
        forcingScale: 1,
      });
      const forced = integrateOscillator({
        w0,
        zeta,
        omega,
        tFinal,
        sampleCount,
        displacement0: 0,
        velocity0: 0,
        forcingScale: 1,
      });
      const transient = integrateOscillator({
        w0,
        zeta,
        omega,
        tFinal,
        sampleCount,
        displacement0: y0,
        velocity0: v0,
        forcingScale: 0,
      });

      return {
        omega,
        times: total.times,
        input: forcingSeries(total.times, omega),
        total: total.displacement,
        forced: forced.displacement,
        transient: transient.displacement,
      };
    });

    const totalBounds = minMax(sweeps.map((item) => item.total));
    const forcedBounds = minMax(sweeps.map((item) => item.forced));
    const transientBounds = minMax(sweeps.map((item) => item.transient));

    return {
      omegas,
      sweeps,
      totalRange: paddedRange(totalBounds.min, totalBounds.max),
      forcedRange: paddedRange(forcedBounds.min, forcedBounds.max),
      transientRange: paddedRange(transientBounds.min, transientBounds.max),
    };
  }

  async function initSimpleResonance(element) {
    const plotly = await loadPlotly();
    let w0 = numberFromDataset(element, "w0", 1);
    let zeta = numberFromDataset(element, "zeta", 0);
    let y0 = numberFromDataset(element, "y0", 1);
    let v0 = numberFromDataset(element, "v0", 1);
    const tFinal = numberFromDataset(element, "tFinal", 32);
    const sampleCount = Math.max(51, Math.round(numberFromDataset(element, "samples", 201)));
    const omegaMin = numberFromDataset(element, "omegaMin", 0);
    const omegaMax = numberFromDataset(element, "omegaMax", 2);
    const omegaSteps = Math.max(2, Math.round(numberFromDataset(element, "omegaSteps", 41)));
    let activeOmegaIndex = 0;
    let latestSweepData = null;

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Simple Resonance";

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
      if (!latestSweepData) {
        return;
      }

      const currentOmega = latestSweepData.omegas[activeOmegaIndex];
      const resonanceGap = Math.abs(currentOmega - w0);
      const resonanceNote =
        zeta < 1e-9 && resonanceGap <= (omegaMax - omegaMin) / Math.max(1, omegaSteps - 1) / 2
          ? " The forcing frequency is near the natural frequency."
          : "";

      readout.textContent =
        `Current forcing frequency omega = ${currentOmega.toFixed(2)}. ` +
        `The homogeneous response is ${dampingRegime(zeta)} for zeta = ${zeta.toFixed(2)}.` +
        resonanceNote;

      element.dataset.currentOmega = String(currentOmega);
      element.dataset.currentW0 = String(w0);
      element.dataset.currentZeta = String(zeta);
      element.dataset.currentY0 = String(y0);
      element.dataset.currentV0 = String(v0);
    }

    function redraw() {
      latestSweepData = buildSweepData({
        w0,
        zeta,
        y0,
        v0,
        tFinal,
        sampleCount,
        omegaMin,
        omegaMax,
        omegaSteps,
      });
      activeOmegaIndex = Math.min(activeOmegaIndex, latestSweepData.sweeps.length - 1);
      updateReadout();

      const traces = [];

      latestSweepData.sweeps.forEach((item, index) => {
        traces.push({
          x: item.times,
          y: item.input,
          visible: index === activeOmegaIndex,
          mode: "lines",
          line: { color: "black", width: 2 },
          name: "Input",
          showlegend: false,
          xaxis: "x",
          yaxis: "y",
        });
      });

      latestSweepData.sweeps.forEach((item, index) => {
        traces.push({
          x: item.times,
          y: item.total,
          visible: index === activeOmegaIndex,
          mode: "lines",
          line: { color: "#1f2937", width: 2 },
          name: "Output",
          showlegend: false,
          xaxis: "x2",
          yaxis: "y2",
        });
      });

      latestSweepData.sweeps.forEach((item, index) => {
        traces.push({
          x: item.times,
          y: item.forced,
          visible: index === activeOmegaIndex,
          mode: "lines",
          line: { color: "#1d4ed8", width: 2 },
          name: "Forced response",
          showlegend: false,
          xaxis: "x3",
          yaxis: "y3",
        });
      });

      latestSweepData.sweeps.forEach((item, index) => {
        traces.push({
          x: item.times,
          y: item.transient,
          visible: index === activeOmegaIndex,
          mode: "lines",
          line: { color: "#b45309", width: 2 },
          name: "Initial transient",
          showlegend: false,
          xaxis: "x4",
          yaxis: "y4",
        });
      });

      const totalTraces = latestSweepData.sweeps.length * 4;
      const steps = latestSweepData.omegas.map((omega, index) => {
        const visible = new Array(totalTraces).fill(false);
        visible[index] = true;
        visible[index + latestSweepData.sweeps.length] = true;
        visible[index + 2 * latestSweepData.sweeps.length] = true;
        visible[index + 3 * latestSweepData.sweeps.length] = true;

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
            { text: "Input", x: 0.5, y: 1.05, xref: "paper", yref: "paper", showarrow: false },
            { text: "Output", x: 0.5, y: 0.79, xref: "paper", yref: "paper", showarrow: false },
            {
              text: "Forced response",
              x: 0.5,
              y: 0.53,
              xref: "paper",
              yref: "paper",
              showarrow: false,
            },
            {
              text: "Initial transient",
              x: 0.5,
              y: 0.27,
              xref: "paper",
              yref: "paper",
              showarrow: false,
            },
          ],
          autosize: true,
          height: 860,
          margin: { t: 56, r: 24, b: 116, l: 56 },
          sliders: [
            {
              active: activeOmegaIndex,
              currentvalue: { prefix: "omega = " },
              pad: { t: 40 },
              steps,
            },
          ],
          xaxis: { domain: [0, 1], anchor: "y", showticklabels: false },
          yaxis: { domain: [0.78, 1], range: [-1.05, 1.05] },
          xaxis2: { domain: [0, 1], anchor: "y2", showticklabels: false },
          yaxis2: { domain: [0.52, 0.74], range: latestSweepData.totalRange },
          xaxis3: { domain: [0, 1], anchor: "y3", showticklabels: false },
          yaxis3: { domain: [0.26, 0.48], range: latestSweepData.forcedRange },
          xaxis4: { domain: [0, 1], anchor: "y4", title: "t" },
          yaxis4: { domain: [0, 0.22], range: latestSweepData.transientRange },
        },
        { displaylogo: false, responsive: true }
      );
    }

    controls.append(
      makeNumberInputControl({
        label: "Natural frequency omega_0",
        min: 0.1,
        max: 4,
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
        max: 2,
        step: 0.05,
        value: zeta,
        onInput: (value) => {
          zeta = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Initial displacement y0",
        min: -5,
        max: 5,
        step: 0.1,
        value: y0,
        onInput: (value) => {
          y0 = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Initial velocity y'0",
        min: -5,
        max: 5,
        step: 0.1,
        value: v0,
        onInput: (value) => {
          v0 = value;
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    redraw();

    plot.on("plotly_sliderchange", (event) => {
      const nextOmega = Number.parseFloat(event.step.label);
      if (!latestSweepData) {
        return;
      }

      const nextIndex = latestSweepData.omegas.findIndex((value) => Math.abs(value - nextOmega) < 1e-9);
      if (nextIndex >= 0) {
        activeOmegaIndex = nextIndex;
        updateReadout();
      }
    });
  }

  registerExample("m1-simple-resonance", initSimpleResonance, {
    selectors: [".course-interactive-m1-simple-resonance"],
  });
})();
