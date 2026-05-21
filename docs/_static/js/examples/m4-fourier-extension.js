(function () {
  "use strict";

  const {
    loadPlotly,
    makeRangeControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

  const DOMAIN_START = -Math.PI;
  const DOMAIN_END = Math.PI;
  const SAMPLE_COUNT = 401;
  const TICK_VALUES = [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI];
  const TICK_TEXT = ["-pi", "-pi/2", "0", "pi/2", "pi"];

  function linspace(start, end, count) {
    return Array.from({ length: count }, (_, index) => start + ((end - start) * index) / (count - 1));
  }

  function extensionData(xValues, termCount) {
    // Preserve the notebook's closed-form partial sums for the three extension choices.
    const simple = [];
    const even = [];
    const odd = [];

    for (const x of xValues) {
      let simpleValue = Math.PI / 4;
      let evenValue = Math.PI / 2;
      let oddValue = 2 * Math.sin(x);

      for (let i = 1; i < termCount; i += 1) {
        const oddIndex = 2 * i - 1;
        simpleValue +=
          (-2 / Math.PI) * Math.cos(oddIndex * (x - Math.PI)) / (oddIndex * oddIndex) +
          Math.pow(-1, i) * Math.sin(i * (x - Math.PI)) / i;
        evenValue += (4 / Math.PI) * Math.cos(oddIndex * x) / (oddIndex * oddIndex);
        oddValue += (2 * Math.sin((i + 1) * x)) / (i + 1);
      }

      simple.push(simpleValue);
      even.push(evenValue);
      odd.push(oddValue);
    }

    return { simple, even, odd };
  }

  function baseTrace(x, y, options = {}) {
    return {
      x,
      y,
      mode: "lines",
      ...options,
    };
  }

  function panelLayout(title) {
    return {
      autosize: true,
      height: 320,
      margin: { t: 48, r: 24, b: 48, l: 56 },
      title: { text: title, x: 0.5 },
      legend: { orientation: "h", y: 1.12 },
      xaxis: { tickvals: TICK_VALUES, ticktext: TICK_TEXT, range: [DOMAIN_START, DOMAIN_END], title: "x" },
      yaxis: { title: "y", range: [-Math.PI - 0.5, Math.PI + 0.5] },
    };
  }

  async function initFourierExtension(element) {
    const plotly = await loadPlotly();
    const xValues = linspace(DOMAIN_START, DOMAIN_END, SAMPLE_COUNT);
    const maxTerms = numberFromDataset(element, "maxTerms", 20);
    let termCount = Math.max(1, Math.min(maxTerms, numberFromDataset(element, "terms", 1)));

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Fourier Extension";

    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Plotly";

    const controls = document.createElement("div");
    controls.className = "course-interactive__controls";

    const readout = document.createElement("div");
    readout.className = "course-interactive__readout";

    const simplePlot = document.createElement("div");
    simplePlot.className = "course-interactive__plot";
    simplePlot.style.marginBottom = "1rem";

    const evenPlot = document.createElement("div");
    evenPlot.className = "course-interactive__plot";
    evenPlot.style.marginBottom = "1rem";

    const oddPlot = document.createElement("div");
    oddPlot.className = "course-interactive__plot";

    function redraw() {
      const sums = extensionData(xValues, termCount);
      readout.textContent = `Partial sums with ${termCount} Fourier term${termCount === 1 ? "" : "s"}.`;
      element.dataset.currentTerms = String(termCount);

      plotly.react(
        simplePlot,
        [
          baseTrace(xValues, sums.simple, {
            line: { color: "#1f77b4", width: 2 },
            name: "Fourier series",
          }),
          baseTrace([0, Math.PI], [Math.PI, 0], {
            line: { color: "#111827", width: 1.5 },
            name: "Signal",
          }),
          baseTrace([-Math.PI, 0, 0], [0, 0, Math.PI], {
            line: { color: "#111827", width: 1.5, dash: "dash" },
            name: "Extension",
          }),
        ],
        panelLayout("Simple Extension"),
        { displaylogo: false, responsive: true }
      );

      plotly.react(
        evenPlot,
        [
          baseTrace(xValues, sums.even, {
            line: { color: "#1f77b4", width: 2 },
            name: "Fourier series",
          }),
          baseTrace([0, Math.PI], [Math.PI, 0], {
            line: { color: "#111827", width: 1.5 },
            name: "Signal",
          }),
          baseTrace([-Math.PI, 0], [0, Math.PI], {
            line: { color: "#111827", width: 1.5, dash: "dash" },
            name: "Extension",
          }),
        ],
        panelLayout("Even Extension"),
        { displaylogo: false, responsive: true }
      );

      plotly.react(
        oddPlot,
        [
          baseTrace(xValues, sums.odd, {
            line: { color: "#1f77b4", width: 2 },
            name: "Fourier series",
          }),
          baseTrace([0, Math.PI], [Math.PI, 0], {
            line: { color: "#111827", width: 1.5 },
            name: "Signal",
          }),
          baseTrace([-Math.PI, 0, 0], [0, -Math.PI, Math.PI], {
            line: { color: "#111827", width: 1.5, dash: "dash" },
            name: "Extension",
          }),
        ],
        panelLayout("Odd Extension"),
        { displaylogo: false, responsive: true }
      );
    }

    controls.append(
      makeRangeControl({
        label: "Number of terms",
        min: 1,
        max: maxTerms,
        step: 1,
        value: termCount,
        onInput: (value) => {
          termCount = Math.round(value);
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, simplePlot, evenPlot, oddPlot);
    redraw();
  }

  registerExample("m4-fourier-extension", initFourierExtension, {
    selectors: [".course-interactive-m4-fourier-extension"],
  });
})();
