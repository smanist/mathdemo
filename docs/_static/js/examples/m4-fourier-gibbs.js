(function () {
  "use strict";

  const { loadPlotly, numberFromDataset, registerExample } = window.CourseInteractives;

  function buildPartialSums(termCount, sampleCount) {
    const x = Array.from(
      { length: sampleCount },
      (_, index) => -3 * Math.PI + (6 * Math.PI * index) / (sampleCount - 1)
    );
    const partialSums = [];
    const current = new Array(sampleCount).fill(0.5);

    partialSums.push(current.slice());

    for (let termIndex = 1; termIndex < termCount; termIndex += 1) {
      const harmonic = 2 * termIndex - 1;
      const coefficient =
        (termIndex % 2 === 0 ? 1 : -1) * (2 / Math.PI) / harmonic;

      for (let pointIndex = 0; pointIndex < sampleCount; pointIndex += 1) {
        current[pointIndex] += coefficient * Math.cos(harmonic * x[pointIndex]);
      }

      partialSums.push(current.slice());
    }

    return { x, partialSums };
  }

  function squareWaveTraces(yRange) {
    const x = [-Math.PI, -Math.PI / 2, -Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI];
    const y = [1, 1, 0, 0, 1, 1];

    return [
      {
        x,
        y,
        mode: "lines",
        line: { color: "black", width: 1 },
        name: "Signal",
      },
      {
        x: x.map((value) => value - 2 * Math.PI),
        y,
        mode: "lines",
        line: { color: "black", width: 1, dash: "dash" },
        name: "Signal copy",
        showlegend: false,
      },
      {
        x: x.map((value) => value + 2 * Math.PI),
        y,
        mode: "lines",
        line: { color: "black", width: 1, dash: "dash" },
        name: "Signal copy",
        showlegend: false,
      },
      {
        x: [-Math.PI, -Math.PI],
        y: yRange,
        mode: "lines",
        line: { color: "red", width: 1, dash: "dot" },
        name: "Period guide",
        showlegend: false,
      },
      {
        x: [Math.PI, Math.PI],
        y: yRange,
        mode: "lines",
        line: { color: "red", width: 1, dash: "dot" },
        name: "Period guide",
        showlegend: false,
      },
    ];
  }

  async function initFourierGibbs(element) {
    const plotly = await loadPlotly();
    const termCount = Math.max(1, Math.floor(numberFromDataset(element, "terms", 20)));
    const sampleCount = Math.max(101, Math.floor(numberFromDataset(element, "samples", 1001)));
    const yRange = [
      numberFromDataset(element, "yMin", -0.2),
      numberFromDataset(element, "yMax", 1.2),
    ];
    const { x, partialSums } = buildPartialSums(termCount, sampleCount);

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Fourier Series of a Square Wave";

    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Plotly";

    const readout = document.createElement("div");
    readout.className = "course-interactive__readout";

    const plot = document.createElement("div");
    plot.className = "course-interactive__plot";

    function updateReadout(activeIndex) {
      const visibleTerms = activeIndex + 1;
      readout.textContent = `No. of terms = ${visibleTerms}`;
      element.dataset.currentTerms = String(visibleTerms);
    }

    const traces = partialSums.map((values, index) => ({
      x,
      y: values,
      visible: index === 0,
      mode: "lines",
      line: { color: "blue", width: 2 },
      name: "Fourier series",
    }));

    traces.push(...squareWaveTraces(yRange));

    const steps = partialSums.map((_, index) => {
      const visible = new Array(partialSums.length + 5).fill(false);
      visible[index] = true;
      visible.fill(true, partialSums.length);

      return {
        method: "update",
        args: [{ visible }],
        label: String(index + 1),
      };
    });

    const tickVals = [
      -3 * Math.PI,
      -2 * Math.PI,
      -Math.PI,
      -Math.PI / 2,
      0,
      Math.PI / 2,
      Math.PI,
      2 * Math.PI,
      3 * Math.PI,
    ];

    header.append(title, status);
    element.append(header, readout, plot);

    updateReadout(0);

    await plotly.newPlot(
      plot,
      traces,
      {
        margin: { t: 24, r: 24, b: 72, l: 48 },
        xaxis: {
          title: "x",
          range: [-3 * Math.PI, 3 * Math.PI],
          tickmode: "array",
          tickvals: tickVals,
          ticktext: ["-3π", "-2π", "-π", "-π/2", "0", "π/2", "π", "2π", "3π"],
        },
        yaxis: {
          title: "y",
          range: yRange,
        },
        sliders: [
          {
            active: 0,
            currentvalue: { prefix: "No. of terms = " },
            pad: { t: 36 },
            steps,
          },
        ],
      },
      { responsive: true }
    );

    plot.on("plotly_sliderchange", (event) => {
      updateReadout(event.slider.active);
    });
  }

  registerExample("m4-fourier-gibbs", initFourierGibbs, {
    selectors: [".course-interactive-m4-fourier-gibbs"],
  });
})();
