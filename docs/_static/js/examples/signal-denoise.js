(function () {
  "use strict";

  const {
    loadPlotly,
    makeNumberInputControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

  function seededGaussianNoise(length, seed) {
    const values = [];
    let state = Math.max(1, Math.floor(seed)) >>> 0;

    function random() {
      state = (1664525 * state + 1013904223) >>> 0;
      return (state + 1) / 4294967297;
    }

    while (values.length < length) {
      const u1 = random();
      const u2 = random();
      const radius = Math.sqrt(-2 * Math.log(u1));
      const angle = 2 * Math.PI * u2;
      values.push(radius * Math.cos(angle));
      if (values.length < length) {
        values.push(radius * Math.sin(angle));
      }
    }

    return values;
  }

  function fftReal(values) {
    const n = values.length;
    const re = new Array(n);
    const im = new Array(n);

    for (let k = 0; k < n; k += 1) {
      let sumRe = 0;
      let sumIm = 0;
      for (let j = 0; j < n; j += 1) {
        const angle = (-2 * Math.PI * k * j) / n;
        sumRe += values[j] * Math.cos(angle);
        sumIm += values[j] * Math.sin(angle);
      }
      re[k] = sumRe;
      im[k] = sumIm;
    }

    return { re, im };
  }

  function frequencyBins(length, sampleRate) {
    const bins = [];
    const midpoint = Math.floor(length / 2);

    for (let k = 0; k < length; k += 1) {
      bins.push(k <= midpoint ? (k * sampleRate) / length : ((k - length) * sampleRate) / length);
    }

    return bins;
  }

  function positiveSpectrum(freq, specRe, specIm) {
    const x = [];
    const y = [];
    const n = freq.length;

    for (let k = 0; k < n; k += 1) {
      if (freq[k] >= 0) {
        x.push(freq[k]);
        y.push((2 * Math.hypot(specRe[k], specIm[k])) / n);
      }
    }

    return { x, y };
  }

  function lowPassSpectrum(freq, specRe, specIm, cutoff) {
    const filteredRe = [];
    const filteredIm = [];

    for (let k = 0; k < freq.length; k += 1) {
      if (Math.abs(freq[k]) > cutoff) {
        filteredRe.push(0);
        filteredIm.push(0);
      } else {
        filteredRe.push(specRe[k]);
        filteredIm.push(specIm[k]);
      }
    }

    return { re: filteredRe, im: filteredIm };
  }

  function inverseFftReal(specRe, specIm) {
    const n = specRe.length;
    const values = new Array(n);

    for (let j = 0; j < n; j += 1) {
      let sum = 0;
      for (let k = 0; k < n; k += 1) {
        const angle = (2 * Math.PI * k * j) / n;
        sum += specRe[k] * Math.cos(angle) - specIm[k] * Math.sin(angle);
      }
      values[j] = sum / n;
    }

    return values;
  }

  function signalDenoiseData(noiseLevel, baseNoise) {
    const thresholdValues = Array.from({ length: 19 }, (_, i) => (i + 2) * 0.5);
    const samplePeriod = 5;
    const sampleRate = 100;
    const sampleCount = Math.floor(samplePeriod * sampleRate);
    const n = sampleCount + 1;
    const t = Array.from({ length: n }, (_, i) => (samplePeriod * i) / sampleCount);
    const clean = t.map((value) => 1.5 * Math.sin(2 * Math.PI * value));
    const noisy = clean.map((value, i) => value + noiseLevel * baseNoise[i]);
    const freq = frequencyBins(n, sampleRate);
    const spec = fftReal(noisy);
    const noisySpectrum = positiveSpectrum(freq, spec.re, spec.im);
    const filtered = thresholdValues.map((cutoff) => {
      const lowPass = lowPassSpectrum(freq, spec.re, spec.im, cutoff);
      const spectrum = positiveSpectrum(freq, lowPass.re, lowPass.im);
      return {
        cutoff,
        signal: inverseFftReal(lowPass.re, lowPass.im),
        spectrum,
      };
    });

    return { t, clean, noisy, noisySpectrum, filtered, thresholdValues };
  }

  async function initSignalDenoise(element) {
    const plotly = await loadPlotly();
    let noiseLevel = numberFromDataset(element, "noiseLevel", 1);
    let activeThresholdIndex = 18;
    let latestData = null;
    const baseNoise = seededGaussianNoise(501, numberFromDataset(element, "seed", 7));

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Signal Denoising";

    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Plotly";

    const controls = document.createElement("div");
    controls.className = "course-interactive__controls";

    const readout = document.createElement("div");
    readout.className = "course-interactive__readout";

    const plot = document.createElement("div");
    plot.className = "course-interactive__plot course-interactive__plot--large";

    function updateReadout(data) {
      const cutoff = data.thresholdValues[activeThresholdIndex];
      readout.textContent = `Noise level = ${noiseLevel.toFixed(2)}; threshold = ${cutoff.toFixed(1)} Hz`;
      element.dataset.currentNoiseLevel = String(noiseLevel);
      element.dataset.currentThreshold = String(cutoff);
    }

    function redraw() {
      const data = signalDenoiseData(noiseLevel, baseNoise);
      latestData = data;
      const totalThresholds = data.thresholdValues.length;
      activeThresholdIndex = Math.min(activeThresholdIndex, totalThresholds - 1);
      updateReadout(data);

      const traces = [];
      data.filtered.forEach((item, index) => {
        traces.push({
          x: data.t,
          y: item.signal,
          visible: index === activeThresholdIndex,
          mode: "lines",
          line: { color: "green", width: 2, dash: "dash" },
          name: "Filtered signal",
          xaxis: "x3",
          yaxis: "y3",
        });
      });

      data.filtered.forEach((item, index) => {
        traces.push({
          x: item.spectrum.x,
          y: item.spectrum.y,
          visible: index === activeThresholdIndex,
          mode: "lines",
          line: { color: "black", width: 2 },
          name: "Filtered spectrum",
          showlegend: false,
          xaxis: "x4",
          yaxis: "y4",
        });
      });

      traces.push(
        {
          x: data.t,
          y: data.noisy,
          visible: true,
          mode: "lines",
          line: { color: "red", width: 1, dash: "dash" },
          name: "Noisy signal",
          xaxis: "x",
          yaxis: "y",
        },
        {
          x: data.t,
          y: data.clean,
          visible: true,
          mode: "lines",
          line: { color: "blue", width: 2 },
          name: "Clean signal",
          xaxis: "x",
          yaxis: "y",
        },
        {
          x: data.noisySpectrum.x,
          y: data.noisySpectrum.y,
          visible: true,
          mode: "lines",
          line: { color: "black", width: 2 },
          name: "Noisy spectrum",
          showlegend: false,
          xaxis: "x2",
          yaxis: "y2",
        },
        {
          x: data.t,
          y: data.clean,
          visible: true,
          mode: "lines",
          line: { color: "blue", width: 2 },
          name: "Clean signal",
          showlegend: false,
          xaxis: "x3",
          yaxis: "y3",
        }
      );

      const steps = data.thresholdValues.map((cutoff, index) => {
        const visible = new Array(2 * totalThresholds + 4).fill(false);
        visible[index] = true;
        visible[index + totalThresholds] = true;
        visible.fill(true, 2 * totalThresholds);
        return {
          method: "update",
          args: [{ visible }],
          label: `${cutoff.toFixed(1)} Hz`,
        };
      });

      plotly.react(
        plot,
        traces,
        {
          annotations: [
            { text: "Raw Signal", x: 0.225, y: 1.05, xref: "paper", yref: "paper", showarrow: false },
            { text: "Noisy Spectrum", x: 0.775, y: 1.05, xref: "paper", yref: "paper", showarrow: false },
            { text: "Filtered Signal", x: 0.225, y: 0.45, xref: "paper", yref: "paper", showarrow: false },
            { text: "Filtered Spectrum", x: 0.775, y: 0.45, xref: "paper", yref: "paper", showarrow: false },
          ],
          autosize: true,
          height: 620,
          legend: { orientation: "h", y: -0.18 },
          margin: { t: 52, r: 24, b: 112, l: 48 },
          sliders: [
            {
              active: activeThresholdIndex,
              currentvalue: { prefix: "Threshold = " },
              pad: { t: 44 },
              steps,
            },
          ],
          xaxis: { domain: [0, 0.45] },
          yaxis: { domain: [0.6, 1], range: [-3, 3] },
          xaxis2: { domain: [0.55, 1], range: [0, 12] },
          yaxis2: { domain: [0.6, 1] },
          xaxis3: { domain: [0, 0.45], title: "time, s" },
          yaxis3: { domain: [0, 0.4], range: [-3, 3] },
          xaxis4: { domain: [0.55, 1], range: [0, 12], title: "Frequency, Hz" },
          yaxis4: { domain: [0, 0.4] },
        },
        { displaylogo: false, responsive: true }
      );
    }

    controls.append(
      makeNumberInputControl({
        label: "Level of noise",
        min: 0,
        max: 3,
        step: 0.1,
        value: noiseLevel,
        onInput: (value) => {
          noiseLevel = value;
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    redraw();
    plot.on("plotly_sliderchange", (event) => {
      const nextThreshold = Number.parseFloat(event.step.label);
      const index = Array.from({ length: 19 }, (_, i) => (i + 2) * 0.5).findIndex(
        (value) => value === nextThreshold
      );
      if (index >= 0 && latestData) {
        activeThresholdIndex = index;
        updateReadout(latestData);
      }
    });
  }

  registerExample("signal-denoise", initSignalDenoise, {
    selectors: [".course-interactive-signal-denoise"],
  });
})();
