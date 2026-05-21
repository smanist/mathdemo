(function () {
  "use strict";

  const {
    loadPlotly,
    makeNumberInputControl,
    makeRangeControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

  function logisticSeries(r, x0, steps) {
    const x = [0];
    const y = [x0];
    let current = x0;

    for (let i = 1; i <= steps; i += 1) {
      current = r * current * (1 - current);
      x.push(i);
      y.push(current);
    }

    return { x, y };
  }

  async function initLogisticMap(element) {
    const plotly = await loadPlotly();
    let r = numberFromDataset(element, "r", 3.4);
    let x0 = numberFromDataset(element, "x0", 0.2);
    const steps = numberFromDataset(element, "steps", 80);

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Logistic Map";

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
      const series = logisticSeries(r, x0, steps);
      const nextValue = series.y[1];
      readout.textContent = `x1 = ${nextValue.toFixed(6)}`;
      element.dataset.currentX0 = String(x0);
      element.dataset.currentX1 = String(nextValue);

      plotly.react(
        plot,
        [
          {
            x: series.x,
            y: series.y,
            mode: "lines+markers",
            marker: { size: 4 },
            line: { width: 2 },
            name: "x_n",
          },
        ],
        {
          margin: { t: 24, r: 24, b: 48, l: 48 },
          xaxis: { title: "n" },
          yaxis: { title: "x_n", range: [0, 1] },
        },
        { responsive: true }
      );
    }

    controls.append(
      makeRangeControl({
        label: "r",
        min: 0,
        max: 4,
        step: 0.01,
        value: r,
        onInput: (value) => {
          r = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "x0",
        min: 0,
        max: 1,
        step: 0.001,
        value: x0,
        onInput: (value) => {
          x0 = value;
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    redraw();
  }

  registerExample("logistic-map", initLogisticMap, {
    selectors: [".course-interactive-logistic-map"],
  });
})();
