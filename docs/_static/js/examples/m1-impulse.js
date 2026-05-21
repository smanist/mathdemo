(function () {
  "use strict";

  const { loadPlotly, makeNumberInputControl, numberFromDataset, registerExample } =
    window.CourseInteractives;

  const WIDTH_VALUES = Array.from({ length: 11 }, (_, index) => 10 ** (-2 + 0.2 * index));
  const WIDTH_LABELS = WIDTH_VALUES.map((value) => value.toFixed(2));
  const WIDTH_LABEL_TO_INDEX = new Map(WIDTH_LABELS.map((label, index) => [label, index]));

  function linspace(start, end, count) {
    return Array.from({ length: count }, (_, index) => start + ((end - start) * index) / (count - 1));
  }

  function impulseKernel(time, omega0, zeta) {
    if (time < 0) {
      return 0;
    }

    if (Math.abs(zeta - 1) < 1e-8) {
      return time * Math.exp(-omega0 * time);
    }

    if (zeta < 1) {
      const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
      return (Math.exp(-zeta * omega0 * time) * Math.sin(omegaD * time)) / omegaD;
    }

    const alpha = Math.sqrt(zeta * zeta - 1);
    const r1 = -omega0 * (zeta - alpha);
    const r2 = -omega0 * (zeta + alpha);
    return (Math.exp(r1 * time) - Math.exp(r2 * time)) / (r1 - r2);
  }

  function stepKernel(time, omega0, zeta) {
    if (time < 0) {
      return 0;
    }

    const omegaSquared = omega0 * omega0;

    if (Math.abs(zeta - 1) < 1e-8) {
      return (1 - Math.exp(-omega0 * time) * (1 + omega0 * time)) / omegaSquared;
    }

    if (zeta < 1) {
      const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
      const exponential = Math.exp(-zeta * omega0 * time);
      const oscillation =
        Math.cos(omegaD * time) + ((zeta * omega0) / omegaD) * Math.sin(omegaD * time);
      return (1 - exponential * oscillation) / omegaSquared;
    }

    const alpha = Math.sqrt(zeta * zeta - 1);
    const r1 = -omega0 * (zeta - alpha);
    const r2 = -omega0 * (zeta + alpha);
    return (
      1 / omegaSquared +
      Math.exp(r1 * time) / (r1 * (r1 - r2)) +
      Math.exp(r2 * time) / (r2 * (r2 - r1))
    );
  }

  function responseBounds(primary, secondary) {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const value of primary.concat(secondary)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }

    const span = Math.max(max - min, 0.1);
    const padding = 0.08 * span;
    return [min - padding, max + padding];
  }

  function impulseDemoData(omega0, zeta, tFinal) {
    const time = linspace(0, tFinal, 361);
    const idealOutput = time.map((value) => impulseKernel(value - 1, omega0, zeta));
    const widths = WIDTH_VALUES.map((width) => {
      const finiteOutput = time.map(
        (value) =>
          (stepKernel(value - 1, omega0, zeta) - stepKernel(value - 1 - width, omega0, zeta)) / width
      );
      const maxDifference = Math.max(
        ...finiteOutput.map((value, index) => Math.abs(value - idealOutput[index]))
      );

      return {
        width,
        finiteInput: {
          x: [0, 1, 1, 1 + width, 1 + width, tFinal],
          y: [0, 0, 1 / width, 1 / width, 0, 0],
        },
        finiteOutput,
        inputRange: [-0.05 * Math.max(10, 1 / width), 1.05 * Math.max(10, 1 / width)],
        outputRange: responseBounds(finiteOutput, idealOutput),
        maxDifference,
      };
    });

    return {
      time,
      widths,
      idealInput: {
        x: [0, 1, 1, 1, tFinal],
        y: [0, 0, 10, 0, 0],
      },
      idealOutput,
    };
  }

  async function initM1Impulse(element) {
    const plotly = await loadPlotly();
    let omega0 = numberFromDataset(element, "omega0", 2);
    let zeta = numberFromDataset(element, "zeta", 1.5);
    const tFinal = numberFromDataset(element, "tFinal", 6);
    let activeWidthIndex = 0;

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Impulse Response Comparison";

    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Plotly";

    const controls = document.createElement("div");
    controls.className = "course-interactive__controls";

    const readout = document.createElement("div");
    readout.className = "course-interactive__readout";

    const plot = document.createElement("div");
    plot.className = "course-interactive__plot course-interactive__plot--large";

    let latestData = null;

    function updateReadout() {
      if (!latestData) {
        return;
      }

      const activeWidth = latestData.widths[activeWidthIndex];
      readout.textContent =
        `w = ${activeWidth.width.toFixed(2)}, pulse height = ${(1 / activeWidth.width).toFixed(2)}, ` +
        `max |y_w - y_delta| = ${activeWidth.maxDifference.toPrecision(3)}.`;
      element.dataset.currentWidth = String(activeWidth.width);
      element.dataset.currentOmega0 = String(omega0);
      element.dataset.currentZeta = String(zeta);
    }

    function redraw() {
      latestData = impulseDemoData(omega0, zeta, tFinal);
      activeWidthIndex = Math.min(activeWidthIndex, latestData.widths.length - 1);
      updateReadout();

      const traces = [];
      latestData.widths.forEach((item, index) => {
        traces.push({
          x: item.finiteInput.x,
          y: item.finiteInput.y,
          visible: index === activeWidthIndex,
          mode: "lines",
          line: { color: "black", width: 2 },
          name: "Finite pulse input",
          xaxis: "x",
          yaxis: "y",
          showlegend: index === 0,
        });
      });

      latestData.widths.forEach((item, index) => {
        traces.push({
          x: latestData.time,
          y: item.finiteOutput,
          visible: index === activeWidthIndex,
          mode: "lines",
          line: { color: "black", width: 2 },
          name: "Finite pulse output",
          xaxis: "x2",
          yaxis: "y2",
          showlegend: index === 0,
        });
      });

      traces.push(
        {
          x: latestData.idealInput.x,
          y: latestData.idealInput.y,
          visible: true,
          mode: "lines",
          line: { color: "red", width: 2, dash: "dash" },
          name: "Ideal impulse marker",
          xaxis: "x",
          yaxis: "y",
        },
        {
          x: latestData.time,
          y: latestData.idealOutput,
          visible: true,
          mode: "lines",
          line: { color: "red", width: 2, dash: "dash" },
          name: "Ideal impulse output",
          xaxis: "x2",
          yaxis: "y2",
        }
      );

      const steps = latestData.widths.map((item, index) => {
        const visible = new Array(2 * latestData.widths.length + 2).fill(false);
        visible[index] = true;
        visible[index + latestData.widths.length] = true;
        visible[visible.length - 2] = true;
        visible[visible.length - 1] = true;

        return {
          method: "update",
          args: [
            { visible },
            {
              "yaxis.range": item.inputRange,
              "yaxis2.range": item.outputRange,
            },
          ],
          label: WIDTH_LABELS[index],
        };
      });

      const activeWidth = latestData.widths[activeWidthIndex];

      plotly.react(
        plot,
        traces,
        {
          annotations: [
            { text: "Input", x: 0.5, y: 1.05, xref: "paper", yref: "paper", showarrow: false },
            { text: "Output", x: 0.5, y: 0.44, xref: "paper", yref: "paper", showarrow: false },
          ],
          autosize: true,
          height: 620,
          legend: { orientation: "h", y: -0.18 },
          margin: { t: 56, r: 24, b: 112, l: 56 },
          sliders: [
            {
              active: activeWidthIndex,
              currentvalue: { prefix: "width = " },
              pad: { t: 44 },
              steps,
            },
          ],
          xaxis: { domain: [0, 1], range: [0, tFinal] },
          yaxis: { domain: [0.62, 1], range: activeWidth.inputRange },
          xaxis2: { domain: [0, 1], range: [0, tFinal], title: "t" },
          yaxis2: { domain: [0, 0.42], range: activeWidth.outputRange, title: "y(t)" },
        },
        { displaylogo: false, responsive: true }
      );
    }

    controls.append(
      makeNumberInputControl({
        label: "Natural frequency omega_0",
        min: 0.2,
        max: 10,
        step: 0.1,
        value: omega0,
        onInput: (value) => {
          omega0 = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "Damping ratio zeta",
        min: 0,
        max: 3,
        step: 0.05,
        value: zeta,
        onInput: (value) => {
          zeta = value;
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    redraw();

    plot.on("plotly_sliderchange", (event) => {
      const nextIndex = WIDTH_LABEL_TO_INDEX.get(event.step.label);
      if (nextIndex !== undefined) {
        activeWidthIndex = nextIndex;
        updateReadout();
      }
    });
  }

  registerExample("m1-impulse", initM1Impulse, {
    selectors: [".course-interactive-m1-impulse"],
  });
})();
