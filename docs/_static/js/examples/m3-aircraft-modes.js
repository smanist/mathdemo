(function () {
  "use strict";

  const { numberFromDataset, registerExample } = window.CourseInteractives;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const EPSILON = 1e-8;
  const SAMPLE_COUNT = 401;
  const STATE_META = [
    { label: "Δu/U₀", unit: "%", scale: 100 },
    { label: "α", unit: "°", scale: 180 / Math.PI },
    { label: "q", unit: "°/s", scale: 180 / Math.PI },
    { label: "θ", unit: "°", scale: 180 / Math.PI },
  ];

  // z = [theta_fast, q_fast, theta_slow, q_slow].  The map preserves
  // theta-dot = q while making the fast block alpha-dominated and the slow
  // block airspeed-dominated.
  const MODAL_TO_PHYSICAL = [
    [0, 0, 1, 0.8],
    [1, 0.3, 0, 0],
    [0, 1, 0, 1],
    [1, 0, 1, 0],
  ];

  const PRESETS = Object.freeze({
    aircraft: {
      label: "Aircraft-like: two oscillatory pairs",
      cf: 1.6,
      kf: 10.5,
      cs: 0.08,
      ks: 0.62,
    },
    mixed: {
      label: "Fast real roots + slow pair",
      cf: 4,
      kf: 3,
      cs: 0.08,
      ks: 0.62,
    },
    real: {
      label: "Two stable real-root blocks",
      cf: 4,
      kf: 3,
      cs: 1.5,
      ks: 0.5,
    },
    critical: {
      label: "Critical fast block",
      cf: 4,
      kf: 4,
      cs: 0.08,
      ks: 0.62,
    },
    saddle: {
      label: "Fast saddle + slow pair",
      cf: 1,
      kf: -2,
      cs: 0.08,
      ks: 0.62,
    },
    unstable: {
      label: "Growing fast oscillation",
      cf: -0.5,
      kf: 10.5,
      cs: 0.08,
      ks: 0.62,
    },
  });

  const DISTURBANCES = Object.freeze({
    modal: {
      label: "Selected motion (pure modal)",
      unit: "deg modal amplitude",
      defaultMagnitude: 4,
      vector: null,
    },
    alpha: {
      label: "Angle-of-attack perturbation",
      unit: "deg",
      defaultMagnitude: 4,
      vector: (magnitude) => [0, radians(magnitude), 0, 0],
    },
    speed: {
      label: "Airspeed perturbation",
      unit: "% of U₀",
      defaultMagnitude: 5,
      vector: (magnitude) => [magnitude / 100, 0, 0, 0],
    },
    pitchRate: {
      label: "Pitch-rate perturbation",
      unit: "deg/s",
      defaultMagnitude: 6,
      vector: (magnitude) => [0, 0, radians(magnitude), 0],
    },
    pitch: {
      label: "Pitch-angle perturbation",
      unit: "deg",
      defaultMagnitude: 4,
      vector: (magnitude) => [0, 0, 0, radians(magnitude)],
    },
    mixed: {
      label: "Mixed physical perturbation",
      unit: "scale",
      defaultMagnitude: 1,
      vector: (magnitude) => [
        0.04 * magnitude,
        radians(3) * magnitude,
        radians(2) * magnitude,
        radians(1.5) * magnitude,
      ],
    },
  });

  function radians(value) {
    return (value * Math.PI) / 180;
  }

  function degrees(value) {
    return (value * 180) / Math.PI;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function cleanNumber(value) {
    return Math.abs(value) < 5e-12 ? 0 : value;
  }

  function formatNumber(value, digits = 3) {
    const cleaned = cleanNumber(value);
    const magnitude = Math.abs(cleaned);
    if (magnitude > 0 && (magnitude >= 1000 || magnitude < 0.001)) {
      return cleaned.toExponential(2);
    }
    const fixed = cleaned.toFixed(digits);
    return fixed.includes(".") ? fixed.replace(/0+$/, "").replace(/\.$/, "") : fixed;
  }

  function multiplyMatrices(left, right) {
    return left.map((row) =>
      right[0].map((_, column) =>
        row.reduce((sum, value, index) => sum + value * right[index][column], 0)
      )
    );
  }

  function matrixVector(matrix, vector) {
    return matrix.map((row) => row.reduce((sum, value, index) => sum + value * vector[index], 0));
  }

  function invertMatrix(matrix) {
    const size = matrix.length;
    const augmented = matrix.map((row, rowIndex) => [
      ...row,
      ...Array.from({ length: size }, (_, columnIndex) => (rowIndex === columnIndex ? 1 : 0)),
    ]);

    for (let column = 0; column < size; column += 1) {
      let pivotRow = column;
      for (let row = column + 1; row < size; row += 1) {
        if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivotRow][column])) {
          pivotRow = row;
        }
      }
      if (Math.abs(augmented[pivotRow][column]) < EPSILON) {
        throw new Error("The aircraft modal transformation is singular.");
      }
      [augmented[column], augmented[pivotRow]] = [augmented[pivotRow], augmented[column]];
      const pivot = augmented[column][column];
      augmented[column] = augmented[column].map((value) => value / pivot);

      for (let row = 0; row < size; row += 1) {
        if (row === column) {
          continue;
        }
        const factor = augmented[row][column];
        augmented[row] = augmented[row].map(
          (value, index) => value - factor * augmented[column][index]
        );
      }
    }

    return augmented.map((row) => row.slice(size));
  }

  const PHYSICAL_TO_MODAL = invertMatrix(MODAL_TO_PHYSICAL);

  function blockMatrix(parameters) {
    return [
      [0, 1],
      [-parameters.k, -parameters.c],
    ];
  }

  function physicalMatrix(fast, slow) {
    const fastBlock = blockMatrix(fast);
    const slowBlock = blockMatrix(slow);
    const modalMatrix = [
      [fastBlock[0][0], fastBlock[0][1], 0, 0],
      [fastBlock[1][0], fastBlock[1][1], 0, 0],
      [0, 0, slowBlock[0][0], slowBlock[0][1]],
      [0, 0, slowBlock[1][0], slowBlock[1][1]],
    ];
    return multiplyMatrices(multiplyMatrices(MODAL_TO_PHYSICAL, modalMatrix), PHYSICAL_TO_MODAL);
  }

  function blockSpectrum(parameters) {
    const center = -parameters.c / 2;
    const deltaSquared = (parameters.c * parameters.c) / 4 - parameters.k;

    if (deltaSquared > EPSILON) {
      const delta = Math.sqrt(deltaSquared);
      const roots = [
        { re: center + delta, im: 0 },
        { re: center - delta, im: 0 },
      ];
      let classification = "two real roots";
      if (roots[0].re < -EPSILON && roots[1].re < -EPSILON) {
        classification = "stable real roots";
      } else if (roots[0].re > EPSILON && roots[1].re > EPSILON) {
        classification = "unstable real roots";
      } else if (roots[0].re * roots[1].re < -EPSILON) {
        classification = "saddle";
      } else {
        classification = "marginal real roots";
      }
      return { type: "real", roots, classification, deltaSquared };
    }

    if (deltaSquared < -EPSILON) {
      const frequency = Math.sqrt(-deltaSquared);
      let classification = "undamped oscillation";
      if (center < -EPSILON) {
        classification = "stable oscillatory pair";
      } else if (center > EPSILON) {
        classification = "unstable oscillatory pair";
      }
      return {
        type: "complex",
        roots: [
          { re: center, im: frequency },
          { re: center, im: -frequency },
        ],
        classification,
        deltaSquared,
        period: (2 * Math.PI) / frequency,
      };
    }

    const root = { re: center, im: 0 };
    let classification = "repeated critical root";
    if (center < -EPSILON) {
      classification = "stable repeated root";
    } else if (center > EPSILON) {
      classification = "unstable repeated root";
    }
    return {
      type: "critical",
      roots: [root, { ...root }],
      classification,
      deltaSquared,
    };
  }

  function formatRoot(root) {
    if (Math.abs(root.im) < EPSILON) {
      return formatNumber(root.re);
    }
    const sign = root.im >= 0 ? "+" : "−";
    return `${formatNumber(root.re)} ${sign} ${formatNumber(Math.abs(root.im))}i`;
  }

  function formatSpectrum(spectrum) {
    if (spectrum.type === "complex") {
      return `${formatNumber(spectrum.roots[0].re)} ± ${formatNumber(
        Math.abs(spectrum.roots[0].im)
      )}i`;
    }
    if (spectrum.type === "critical") {
      return `${formatNumber(spectrum.roots[0].re)} (double)`;
    }
    return `${formatNumber(spectrum.roots[0].re)}, ${formatNumber(spectrum.roots[1].re)}`;
  }

  function blockExponentialVector(parameters, initial, time) {
    const center = -parameters.c / 2;
    const deltaSquared = (parameters.c * parameters.c) / 4 - parameters.k;
    const shifted = [
      (parameters.c / 2) * initial[0] + initial[1],
      -parameters.k * initial[0] - (parameters.c / 2) * initial[1],
    ];
    const envelope = Math.exp(clamp(center * time, -700, 50));
    let diagonalFactor;
    let shiftedFactor;

    if (deltaSquared > EPSILON) {
      const delta = Math.sqrt(deltaSquared);
      diagonalFactor = Math.cosh(delta * time);
      shiftedFactor = Math.sinh(delta * time) / delta;
    } else if (deltaSquared < -EPSILON) {
      const frequency = Math.sqrt(-deltaSquared);
      diagonalFactor = Math.cos(frequency * time);
      shiftedFactor = Math.sin(frequency * time) / frequency;
    } else {
      diagonalFactor = 1;
      shiftedFactor = time;
    }

    return initial.map(
      (value, index) => envelope * (diagonalFactor * value + shiftedFactor * shifted[index])
    );
  }

  function realRootParts(parameters, initial, time) {
    const spectrum = blockSpectrum(parameters);
    if (spectrum.type !== "real") {
      return null;
    }
    const [plus, minus] = spectrum.roots;
    const denominator = plus.re - minus.re;
    const plusCoefficient = (initial[1] - minus.re * initial[0]) / denominator;
    const minusCoefficient = (plus.re * initial[0] - initial[1]) / denominator;
    const plusAmplitude = plusCoefficient * Math.exp(clamp(plus.re * time, -700, 50));
    const minusAmplitude = minusCoefficient * Math.exp(clamp(minus.re * time, -700, 50));
    return {
      plus: [plusAmplitude, plus.re * plusAmplitude],
      minus: [minusAmplitude, minus.re * minusAmplitude],
    };
  }

  function modalToPhysical(fast, slow) {
    return matrixVector(MODAL_TO_PHYSICAL, [...fast, ...slow]);
  }

  function zeroPair() {
    return [0, 0];
  }

  function chooseDuration(fastSpectrum, slowSpectrum) {
    const roots = [...fastSpectrum.roots, ...slowSpectrum.roots];
    const growthRate = Math.max(0, ...roots.map((root) => root.re));
    if (growthRate > 0.05) {
      return clamp(4 / growthRate, 2, 10);
    }
    return 10;
  }

  function pureModalInitial(parameters, motion, magnitude) {
    const amplitude = radians(magnitude);
    const initial = [0, 0, 0, 0];
    const normalizedMotion = motion === "total" ? "fast" : motion;

    if (normalizedMotion === "fastPlus" || normalizedMotion === "fastMinus") {
      const spectrum = blockSpectrum(parameters.fast);
      const rootIndex = normalizedMotion === "fastPlus" ? 0 : 1;
      const root = spectrum.type === "real" ? spectrum.roots[rootIndex] : null;
      initial[0] = amplitude;
      initial[1] = root ? root.re * amplitude : 0;
      return initial;
    }
    if (normalizedMotion.startsWith("fast")) {
      initial[0] = amplitude;
      return initial;
    }
    if (normalizedMotion === "slowPlus" || normalizedMotion === "slowMinus") {
      const spectrum = blockSpectrum(parameters.slow);
      const rootIndex = normalizedMotion === "slowPlus" ? 0 : 1;
      const root = spectrum.type === "real" ? spectrum.roots[rootIndex] : null;
      initial[2] = amplitude;
      initial[3] = root ? root.re * amplitude : 0;
      return initial;
    }
    initial[2] = amplitude;
    return initial;
  }

  function simulate(parameters, initialPhysical, initialModalOverride = null) {
    const fastSpectrum = blockSpectrum(parameters.fast);
    const slowSpectrum = blockSpectrum(parameters.slow);
    const duration = chooseDuration(fastSpectrum, slowSpectrum);
    const initialModal = initialModalOverride
      ? [...initialModalOverride]
      : matrixVector(PHYSICAL_TO_MODAL, initialPhysical);
    const fastInitial = initialModal.slice(0, 2);
    const slowInitial = initialModal.slice(2, 4);
    const samples = [];

    for (let index = 0; index < SAMPLE_COUNT; index += 1) {
      const time = (duration * index) / (SAMPLE_COUNT - 1);
      const fastModal = blockExponentialVector(parameters.fast, fastInitial, time);
      const slowModal = blockExponentialVector(parameters.slow, slowInitial, time);
      const fast = modalToPhysical(fastModal, zeroPair());
      const slow = modalToPhysical(zeroPair(), slowModal);
      const sample = {
        time,
        fast,
        slow,
        total: fast.map((value, stateIndex) => value + slow[stateIndex]),
      };

      const fastRoots = realRootParts(parameters.fast, fastInitial, time);
      if (fastRoots) {
        sample.fastPlus = modalToPhysical(fastRoots.plus, zeroPair());
        sample.fastMinus = modalToPhysical(fastRoots.minus, zeroPair());
      }
      const slowRoots = realRootParts(parameters.slow, slowInitial, time);
      if (slowRoots) {
        sample.slowPlus = modalToPhysical(zeroPair(), slowRoots.plus);
        sample.slowMinus = modalToPhysical(zeroPair(), slowRoots.minus);
      }
      samples.push(sample);
    }

    return {
      duration,
      fastSpectrum,
      slowSpectrum,
      initialModal,
      samples,
    };
  }

  function sampleState(sample, choice) {
    return sample[choice] || sample.total;
  }

  function flightPath(samples, choice) {
    const points = [{ x: 0, h: 0, state: sampleState(samples[0], choice) }];
    let downrange = 0;
    let altitude = 0;

    for (let index = 1; index < samples.length; index += 1) {
      const previous = sampleState(samples[index - 1], choice);
      const current = sampleState(samples[index], choice);
      const previousSpeed = clamp(1 + previous[0], 0.08, 4);
      const currentSpeed = clamp(1 + current[0], 0.08, 4);
      const previousGamma = clamp(previous[3] - previous[1], -Math.PI / 3, Math.PI / 3);
      const currentGamma = clamp(current[3] - current[1], -Math.PI / 3, Math.PI / 3);
      const dt = samples[index].time - samples[index - 1].time;
      downrange +=
        (dt / 2) *
        (previousSpeed * Math.cos(previousGamma) + currentSpeed * Math.cos(currentGamma));
      altitude +=
        (dt / 2) *
        (previousSpeed * Math.sin(previousGamma) + currentSpeed * Math.sin(currentGamma));
      points.push({ x: downrange, h: altitude, state: current });
    }
    return points;
  }

  function svgElement(name, attributes = {}, textContent = null) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    if (textContent !== null) {
      node.textContent = textContent;
    }
    return node;
  }

  function makePanel(titleText) {
    const panel = document.createElement("section");
    panel.className = "aircraft-modes__panel";
    const title = document.createElement("h3");
    title.className = "aircraft-modes__panel-title";
    title.textContent = titleText;
    panel.append(title);
    return panel;
  }

  function eigenvalueIsActive(family, index, motion) {
    if (motion === "total") {
      return true;
    }
    if (motion === family) {
      return true;
    }
    if (motion === `${family}Plus`) {
      return index === 0;
    }
    if (motion === `${family}Minus`) {
      return index === 1;
    }
    return false;
  }

  function renderEigenPlane(host, fastSpectrum, slowSpectrum, motion) {
    host.innerHTML = "";
    const width = 440;
    const height = 275;
    const margin = { top: 18, right: 24, bottom: 42, left: 52 };
    const roots = [
      ...fastSpectrum.roots.map((root, index) => ({ ...root, family: "fast", index })),
      ...slowSpectrum.roots.map((root, index) => ({ ...root, family: "slow", index })),
    ];
    let xMinimum = Math.min(-0.5, ...roots.map((root) => root.re));
    let xMaximum = Math.max(0.5, ...roots.map((root) => root.re));
    const xPadding = Math.max(0.2, (xMaximum - xMinimum) * 0.16);
    xMinimum -= xPadding;
    xMaximum += xPadding;
    const yMaximum = Math.max(0.5, ...roots.map((root) => Math.abs(root.im))) * 1.25;
    const xScale = (value) =>
      margin.left + ((value - xMinimum) / (xMaximum - xMinimum)) * (width - margin.left - margin.right);
    const yScale = (value) =>
      margin.top + ((yMaximum - value) / (2 * yMaximum)) * (height - margin.top - margin.bottom);

    const svg = svgElement("svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-labelledby": "aircraft-eigen-title aircraft-eigen-desc",
    });
    svg.classList.add("aircraft-modes__eigen-svg");
    svg.append(
      svgElement("title", { id: "aircraft-eigen-title" }, "Eigenvalue plane"),
      svgElement(
        "desc",
        { id: "aircraft-eigen-desc" },
        "Four eigenvalues from the fast and slow longitudinal modal blocks."
      )
    );
    svg.append(
      svgElement("rect", {
        x: margin.left,
        y: margin.top,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
        class: "aircraft-modes__chart-frame",
      })
    );

    const xAxisY = yScale(0);
    const stabilityX = xScale(0);
    svg.append(
      svgElement("line", {
        x1: margin.left,
        y1: xAxisY,
        x2: width - margin.right,
        y2: xAxisY,
        class: "aircraft-modes__axis",
      }),
      svgElement("line", {
        x1: stabilityX,
        y1: margin.top,
        x2: stabilityX,
        y2: height - margin.bottom,
        class: "aircraft-modes__stability-axis",
      })
    );

    for (let index = 0; index <= 4; index += 1) {
      const value = xMinimum + ((xMaximum - xMinimum) * index) / 4;
      const x = xScale(value);
      svg.append(
        svgElement("line", {
          x1: x,
          y1: xAxisY - 4,
          x2: x,
          y2: xAxisY + 4,
          class: "aircraft-modes__axis",
        }),
        svgElement(
          "text",
          { x, y: height - 20, "text-anchor": "middle", class: "aircraft-modes__axis-label" },
          formatNumber(value, 2)
        )
      );
    }

    [-yMaximum, -yMaximum / 2, yMaximum / 2, yMaximum].forEach((value) => {
      const y = yScale(value);
      svg.append(
        svgElement("line", {
          x1: stabilityX - 4,
          y1: y,
          x2: stabilityX + 4,
          y2: y,
          class: "aircraft-modes__axis",
        }),
        svgElement(
          "text",
          { x: margin.left - 8, y: y + 4, "text-anchor": "end", class: "aircraft-modes__axis-label" },
          formatNumber(value, 2)
        )
      );
    });

    svg.append(
      svgElement(
        "text",
        { x: (margin.left + width - margin.right) / 2, y: height - 2, "text-anchor": "middle", class: "aircraft-modes__axis-title" },
        "Re(λ)"
      ),
      svgElement(
        "text",
        {
          x: 14,
          y: (margin.top + height - margin.bottom) / 2,
          transform: `rotate(-90 14 ${(margin.top + height - margin.bottom) / 2})`,
          "text-anchor": "middle",
          class: "aircraft-modes__axis-title",
        },
        "Im(λ)"
      )
    );

    roots.forEach((root, rootIndex) => {
      const active = eigenvalueIsActive(root.family, root.index, motion);
      const circle = svgElement("circle", {
        cx: xScale(root.re),
        cy: yScale(root.im),
        r: active ? 7 : rootIndex % 2 === 0 ? 6 : 5,
        class:
          `aircraft-modes__eigen aircraft-modes__eigen--${root.family} ` +
          `aircraft-modes__eigen--${active ? "active" : "inactive"}`,
      });
      const familyName = root.family === "fast" ? "Fast" : "Slow";
      circle.append(svgElement("title", {}, `${familyName}: λ = ${formatRoot(root)}`));
      svg.append(circle);
    });

    host.append(svg);
  }

  function complexPhysicalMode(family, root) {
    const firstColumn = family === "fast" ? 0 : 2;
    const secondColumn = firstColumn + 1;
    return MODAL_TO_PHYSICAL.map((row) => ({
      re: row[firstColumn] + row[secondColumn] * root.re,
      im: row[secondColumn] * root.im,
    }));
  }

  function normalizeAngle(value) {
    let angle = value;
    while (angle > 180) {
      angle -= 360;
    }
    while (angle <= -180) {
      angle += 360;
    }
    return angle;
  }

  function renderModeCard(host, family, root, kind, suffix) {
    const vector = complexPhysicalMode(family, root);
    const magnitudes = vector.map((value) => Math.hypot(value.re, value.im));
    const maximum = Math.max(EPSILON, ...magnitudes);
    const thetaPhase = (Math.atan2(vector[3].im, vector[3].re) * 180) / Math.PI;
    const card = document.createElement("article");
    card.className = `aircraft-modes__mode-card aircraft-modes__mode-card--${family}`;
    const heading = document.createElement("h4");
    const familyName = family === "fast" ? "Fast" : "Slow";
    heading.textContent = `${familyName}${suffix ? ` ${suffix}` : " pair"}: λ = ${formatRoot(root)}`;
    card.append(heading);

    vector.forEach((value, index) => {
      const row = document.createElement("div");
      row.className = "aircraft-modes__shape-row";
      const label = document.createElement("span");
      label.textContent = STATE_META[index].label;
      const track = document.createElement("span");
      track.className = `aircraft-modes__shape-track aircraft-modes__shape-track--${kind}`;
      const bar = document.createElement("span");
      bar.className = "aircraft-modes__shape-bar";
      const valueText = document.createElement("span");
      valueText.className = "aircraft-modes__shape-value";

      if (kind === "complex") {
        bar.style.width = `${(100 * magnitudes[index]) / maximum}%`;
        const phase = normalizeAngle((Math.atan2(value.im, value.re) * 180) / Math.PI - thetaPhase);
        valueText.textContent = `${formatNumber(magnitudes[index] / maximum, 2)} ∠ ${formatNumber(
          phase,
          0
        )}°`;
      } else {
        const signedValue = value.re / maximum;
        bar.style.width = `${50 * Math.abs(signedValue)}%`;
        bar.style.left = signedValue >= 0 ? "50%" : `${50 - 50 * Math.abs(signedValue)}%`;
        valueText.textContent = formatNumber(signedValue, 2);
      }

      track.append(bar);
      row.append(label, track, valueText);
      card.append(row);
    });
    host.append(card);
  }

  function renderModeShapes(host, fastSpectrum, slowSpectrum) {
    host.innerHTML = "";
    host.className = "aircraft-modes__mode-grid";
    [
      { family: "fast", spectrum: fastSpectrum },
      { family: "slow", spectrum: slowSpectrum },
    ].forEach(({ family, spectrum }) => {
      if (spectrum.type === "complex") {
        renderModeCard(host, family, spectrum.roots[0], "complex", "");
      } else if (spectrum.type === "real") {
        renderModeCard(host, family, spectrum.roots[0], "real", "λ+");
        renderModeCard(host, family, spectrum.roots[1], "real", "λ−");
      } else {
        renderModeCard(host, family, spectrum.roots[0], "real", "repeated");
      }
    });
  }

  function pathData(samples, stateIndex, scaleValue, xScale, yScale) {
    return samples
      .map((sample, index) => {
        const x = xScale(sample.time);
        const y = yScale(sample[stateIndex] * scaleValue);
        return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }

  function renderTimeChart(host, simulation) {
    host.innerHTML = "";
    const width = 780;
    const height = 350;
    const margin = { top: 20, right: 92, bottom: 34, left: 68 };
    const laneHeight = (height - margin.top - margin.bottom) / STATE_META.length;
    const xScale = (time) =>
      margin.left + (time / simulation.duration) * (width - margin.left - margin.right);
    const svg = svgElement("svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-labelledby": "aircraft-response-title aircraft-response-desc",
    });
    svg.classList.add("aircraft-modes__response-svg");
    svg.append(
      svgElement("title", { id: "aircraft-response-title" }, "Aircraft state response"),
      svgElement(
        "desc",
        { id: "aircraft-response-desc" },
        "Time histories of normalized speed, angle of attack, pitch rate, and pitch angle, decomposed into fast and slow contributions."
      )
    );

    const valueTexts = [];
    STATE_META.forEach((meta, stateIndex) => {
      const laneTop = margin.top + stateIndex * laneHeight;
      const laneBottom = laneTop + laneHeight;
      const centerY = (laneTop + laneBottom) / 2;
      const allValues = simulation.samples.flatMap((sample) => [
        sample.fast[stateIndex] * meta.scale,
        sample.slow[stateIndex] * meta.scale,
        sample.total[stateIndex] * meta.scale,
      ]);
      const maximum = Math.max(1e-6, ...allValues.map((value) => Math.abs(value))) * 1.12;
      const yScale = (value) => centerY - (value / maximum) * (laneHeight * 0.4);

      svg.append(
        svgElement("line", {
          x1: margin.left,
          y1: centerY,
          x2: width - margin.right,
          y2: centerY,
          class: "aircraft-modes__zero-line",
        }),
        svgElement(
          "text",
          { x: margin.left - 10, y: centerY + 4, "text-anchor": "end", class: "aircraft-modes__state-label" },
          `${meta.label} (${meta.unit})`
        ),
        svgElement("path", {
          d: pathData(
            simulation.samples.map((sample) => ({ time: sample.time, ...sample.fast })),
            stateIndex,
            meta.scale,
            xScale,
            yScale
          ),
          class: "aircraft-modes__response-line aircraft-modes__response-line--fast",
        }),
        svgElement("path", {
          d: pathData(
            simulation.samples.map((sample) => ({ time: sample.time, ...sample.slow })),
            stateIndex,
            meta.scale,
            xScale,
            yScale
          ),
          class: "aircraft-modes__response-line aircraft-modes__response-line--slow",
        }),
        svgElement("path", {
          d: pathData(
            simulation.samples.map((sample) => ({ time: sample.time, ...sample.total })),
            stateIndex,
            meta.scale,
            xScale,
            yScale
          ),
          class: "aircraft-modes__response-line aircraft-modes__response-line--total",
        })
      );

      if (stateIndex < STATE_META.length - 1) {
        svg.append(
          svgElement("line", {
            x1: margin.left,
            y1: laneBottom,
            x2: width - margin.right,
            y2: laneBottom,
            class: "aircraft-modes__lane-separator",
          })
        );
      }
      const valueText = svgElement(
        "text",
        { x: width - margin.right + 10, y: centerY + 4, class: "aircraft-modes__current-value" },
        ""
      );
      valueTexts.push({ node: valueText, meta, stateIndex });
      svg.append(valueText);
    });

    const cursor = svgElement("line", {
      x1: xScale(0),
      y1: margin.top,
      x2: xScale(0),
      y2: height - margin.bottom,
      class: "aircraft-modes__time-cursor",
    });
    svg.append(cursor);

    [0, simulation.duration / 2, simulation.duration].forEach((time) => {
      svg.append(
        svgElement(
          "text",
          {
            x: xScale(time),
            y: height - 9,
            "text-anchor": "middle",
            class: "aircraft-modes__axis-label",
          },
          `${formatNumber(time, 1)} s`
        )
      );
    });
    host.append(svg);
    return { cursor, valueTexts, xScale };
  }

  function updateTimeChartCursor(chart, simulation, sampleIndex) {
    const sample = simulation.samples[sampleIndex];
    const x = chart.xScale(sample.time);
    chart.cursor.setAttribute("x1", x);
    chart.cursor.setAttribute("x2", x);
    chart.valueTexts.forEach(({ node, meta, stateIndex }) => {
      node.textContent = `${formatNumber(sample.total[stateIndex] * meta.scale, 2)} ${meta.unit}`;
    });
  }

  function drawAircraft(context, x, y, angle, size, color, opacity) {
    context.save();
    context.translate(x, y);
    context.rotate(-angle);
    context.globalAlpha = opacity;
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(-size, 0);
    context.lineTo(size * 0.78, 0);
    context.lineTo(size, -size * 0.12);
    context.lineTo(size * 0.78, size * 0.12);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(-size * 0.25, 0);
    context.lineTo(-size * 0.62, -size * 0.52);
    context.lineTo(size * 0.2, 0);
    context.lineTo(-size * 0.62, size * 0.52);
    context.stroke();
    context.beginPath();
    context.moveTo(-size * 0.76, 0);
    context.lineTo(-size * 0.94, -size * 0.28);
    context.stroke();
    context.restore();
  }

  function drawArrow(context, x, y, angle, length, color) {
    context.save();
    context.translate(x, y);
    context.rotate(-angle);
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 1.5;
    context.setLineDash([5, 4]);
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(length, 0);
    context.stroke();
    context.setLineDash([]);
    context.beginPath();
    context.moveTo(length, 0);
    context.lineTo(length - 7, -4);
    context.lineTo(length - 7, 4);
    context.closePath();
    context.fill();
    context.restore();
  }

  function canvasColors(element) {
    const styles = getComputedStyle(element);
    const value = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
    return {
      foreground: value("--aircraft-foreground", "#1f2937"),
      muted: value("--aircraft-muted", "#7b8794"),
      grid: value("--aircraft-grid", "#d8dee9"),
      fast: value("--aircraft-fast", "#2563eb"),
      slow: value("--aircraft-slow", "#d97706"),
      total: value("--aircraft-total", "#111827"),
      velocity: value("--aircraft-velocity", "#138a72"),
    };
  }

  function drawAircraftScene(element, canvas, path, sampleIndex, motionChoice) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width || 680));
    const height = 330;
    const pixelRatio = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * pixelRatio) || canvas.height !== Math.round(height * pixelRatio)) {
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
    }
    const context = canvas.getContext("2d");
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    const colors = canvasColors(element);
    const padding = { left: 42, right: 24, top: 34, bottom: 42 };
    const xMaximum = Math.max(0.1, ...path.map((point) => point.x));
    const altitudeMinimum = Math.min(0, ...path.map((point) => point.h));
    const altitudeMaximum = Math.max(0, ...path.map((point) => point.h));
    const altitudeCenter = (altitudeMinimum + altitudeMaximum) / 2;
    const altitudeHalfRange = Math.max(0.08, (altitudeMaximum - altitudeMinimum) * 0.62);
    const xScale = (value) =>
      padding.left + (value / xMaximum) * (width - padding.left - padding.right);
    const yScale = (value) =>
      padding.top +
      ((altitudeCenter + altitudeHalfRange - value) / (2 * altitudeHalfRange)) *
        (height - padding.top - padding.bottom);

    context.strokeStyle = colors.grid;
    context.lineWidth = 1;
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(padding.left, yScale(0));
    context.lineTo(width - padding.right, yScale(0));
    context.stroke();
    context.setLineDash([]);

    let motionColor = colors.total;
    if (motionChoice.startsWith("fast")) {
      motionColor = colors.fast;
    } else if (motionChoice.startsWith("slow")) {
      motionColor = colors.slow;
    }
    context.strokeStyle = motionColor;
    context.lineWidth = 2.5;
    context.beginPath();
    for (let index = 0; index <= sampleIndex; index += 1) {
      const point = path[index];
      const x = xScale(point.x);
      const y = yScale(point.h);
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();

    const ghostStep = Math.max(1, Math.round((path.length - 1) / 10));
    for (let index = 0; index < sampleIndex; index += ghostStep) {
      const point = path[index];
      drawAircraft(
        context,
        xScale(point.x),
        yScale(point.h),
        point.state[3] * 2,
        11,
        colors.muted,
        0.42
      );
    }

    const current = path[sampleIndex];
    const currentX = xScale(current.x);
    const currentY = yScale(current.h);
    const pitch = current.state[3];
    const gamma = current.state[3] - current.state[1];
    drawArrow(context, currentX, currentY, gamma * 2, 42, colors.velocity);
    drawAircraft(context, currentX, currentY, pitch * 2, 17, motionColor, 1);

    context.fillStyle = colors.muted;
    context.font = "12px sans-serif";
    context.textAlign = "left";
    context.fillText("trim flight path", padding.left + 4, yScale(0) - 7);
    context.fillText("vertical auto-scale; pitch and γ shown ×2", padding.left, 17);
    context.textAlign = "center";
    context.fillText("time-compressed downrange", (padding.left + width - padding.right) / 2, height - 10);
  }

  function makeNumberField(labelText, value, options, onValue) {
    const wrapper = document.createElement("div");
    wrapper.className = "course-interactive__control";
    const label = document.createElement("label");
    const input = document.createElement("input");
    const message = document.createElement("div");
    input.type = "number";
    input.value = String(value);
    input.min = String(options.min);
    input.max = String(options.max);
    input.step = String(options.step);
    input.id = `aircraft-mode-number-${Math.random().toString(36).slice(2)}`;
    label.htmlFor = input.id;
    label.textContent = labelText;
    message.className = "course-interactive__message";

    input.addEventListener("input", () => {
      const next = Number(input.value);
      if (
        input.value.trim() === "" ||
        !Number.isFinite(next) ||
        next < options.min ||
        next > options.max
      ) {
        input.setAttribute("aria-invalid", "true");
        message.textContent = `Enter a number from ${options.min} to ${options.max}.`;
        return;
      }
      input.removeAttribute("aria-invalid");
      message.textContent = "";
      onValue(next);
    });
    wrapper.append(label, input, message);
    return { wrapper, input, label };
  }

  function makeSelectField(labelText, options) {
    const wrapper = document.createElement("div");
    wrapper.className = "course-interactive__control";
    const label = document.createElement("label");
    const select = document.createElement("select");
    select.id = `aircraft-mode-select-${Math.random().toString(36).slice(2)}`;
    label.htmlFor = select.id;
    label.textContent = labelText;
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      select.append(optionElement);
    });
    wrapper.append(label, select);
    return { wrapper, select, label };
  }

  function matrixText(matrix) {
    return matrix
      .map((row) => `[ ${row.map((value) => formatNumber(value, 4).padStart(9)).join("  ")} ]`)
      .join("\n");
  }

  async function initAircraftModes(element) {
    const state = {
      cf: numberFromDataset(element, "cf", PRESETS.aircraft.cf),
      kf: numberFromDataset(element, "kf", PRESETS.aircraft.kf),
      cs: numberFromDataset(element, "cs", PRESETS.aircraft.cs),
      ks: numberFromDataset(element, "ks", PRESETS.aircraft.ks),
      disturbance: element.dataset.disturbance || "alpha",
      magnitude: numberFromDataset(element, "magnitude", DISTURBANCES.alpha.defaultMagnitude),
      motion: "total",
      playbackSpeed: 1,
    };
    let simulation = null;
    let selectedPath = [];
    let playbackTime = 0;
    let playing = false;
    let animationFrame = 0;
    let lastTimestamp = 0;
    let chart = null;

    element.innerHTML = "";
    element.classList.add("aircraft-modes");

    const header = document.createElement("div");
    header.className = "course-interactive__header";
    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Longitudinal Aircraft Modes";
    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Matrix exponential · SVG + canvas";
    header.append(title, status);

    const controls = document.createElement("div");
    controls.className = "aircraft-modes__controls";
    const primaryControls = document.createElement("div");
    primaryControls.className = "aircraft-modes__control-row aircraft-modes__control-row--primary";
    const coefficientControls = document.createElement("div");
    coefficientControls.className = "aircraft-modes__control-row aircraft-modes__control-row--coefficients";
    const disturbanceControls = document.createElement("div");
    disturbanceControls.className = "aircraft-modes__control-row aircraft-modes__control-row--disturbance";
    const presetField = makeSelectField("Preset", [
      { value: "", label: "Custom" },
      ...Object.entries(PRESETS).map(([value, preset]) => ({ value, label: preset.label })),
    ]);
    presetField.select.value = "aircraft";
    const fastCField = makeNumberField("c_f", state.cf, { min: -5, max: 10, step: 0.05 }, (value) => {
      state.cf = value;
      presetField.select.value = "";
      recompute();
    });
    const fastKField = makeNumberField("k_f", state.kf, { min: -10, max: 30, step: 0.05 }, (value) => {
      state.kf = value;
      presetField.select.value = "";
      recompute();
    });
    const slowCField = makeNumberField("c_s", state.cs, { min: -5, max: 10, step: 0.01 }, (value) => {
      state.cs = value;
      presetField.select.value = "";
      recompute();
    });
    const slowKField = makeNumberField("k_s", state.ks, { min: -10, max: 30, step: 0.01 }, (value) => {
      state.ks = value;
      presetField.select.value = "";
      recompute();
    });
    const disturbanceField = makeSelectField(
      "Initial disturbance",
      Object.entries(DISTURBANCES).map(([value, disturbance]) => ({ value, label: disturbance.label }))
    );
    disturbanceField.select.value = state.disturbance;
    const magnitudeField = makeNumberField(
      `Magnitude (${DISTURBANCES[state.disturbance].unit})`,
      state.magnitude,
      { min: 0.05, max: 20, step: 0.1 },
      (value) => {
        state.magnitude = value;
        recompute();
      }
    );
    const motionField = makeSelectField("Motion shown", [{ value: "total", label: "Full response" }]);
    const speedField = makeSelectField("Playback speed", [
      { value: "0.5", label: "0.5×" },
      { value: "1", label: "1×" },
      { value: "2", label: "2×" },
    ]);
    speedField.select.value = "1";
    [fastCField, fastKField, slowCField, slowKField].forEach((field) => {
      field.wrapper.classList.add("aircraft-modes__coefficient-field");
    });
    primaryControls.append(presetField.wrapper, motionField.wrapper, speedField.wrapper);
    coefficientControls.append(
      fastCField.wrapper,
      fastKField.wrapper,
      slowCField.wrapper,
      slowKField.wrapper
    );
    disturbanceControls.append(disturbanceField.wrapper, magnitudeField.wrapper);
    controls.append(
      primaryControls,
      coefficientControls,
      disturbanceControls
    );

    const spectrumReadout = document.createElement("div");
    spectrumReadout.className = "course-interactive__readout aircraft-modes__spectrum-readout";
    spectrumReadout.setAttribute("aria-live", "polite");

    const transport = document.createElement("div");
    transport.className = "aircraft-modes__transport";
    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "aircraft-modes__button";
    playButton.textContent = "Play";
    const restartButton = document.createElement("button");
    restartButton.type = "button";
    restartButton.className = "aircraft-modes__button";
    restartButton.textContent = "Restart";
    const timeLabel = document.createElement("label");
    timeLabel.className = "aircraft-modes__time-label";
    timeLabel.textContent = "Time";
    const timeOutput = document.createElement("output");
    timeOutput.textContent = "0.00 s";
    const timeSlider = document.createElement("input");
    timeSlider.type = "range";
    timeSlider.min = "0";
    timeSlider.max = "10";
    timeSlider.step = "0.01";
    timeSlider.value = "0";
    timeSlider.setAttribute("aria-label", "Animation time");
    timeLabel.append(" ", timeOutput, timeSlider);
    transport.append(playButton, restartButton, timeLabel);

    const currentReadout = document.createElement("div");
    currentReadout.className = "course-interactive__readout aircraft-modes__current-readout";
    currentReadout.setAttribute("aria-live", "polite");

    const dashboard = document.createElement("div");
    dashboard.className = "aircraft-modes__dashboard";
    const motionPanel = makePanel("Aircraft motion");
    motionPanel.classList.add("aircraft-modes__panel--motion");
    const canvas = document.createElement("canvas");
    canvas.className = "aircraft-modes__canvas";
    canvas.setAttribute(
      "aria-label",
      "Side view of time-compressed longitudinal aircraft motion with equal-time silhouettes"
    );
    motionPanel.append(canvas);
    const eigenPanel = makePanel("Eigenvalue plane");
    eigenPanel.classList.add("aircraft-modes__panel--eigen");
    const eigenHost = document.createElement("div");
    eigenHost.className = "aircraft-modes__svg-host aircraft-modes__svg-host--eigen";
    eigenPanel.append(eigenHost);
    dashboard.append(motionPanel, eigenPanel);

    const modesPanel = makePanel("Eigenmodes in the physical state");
    modesPanel.classList.add("aircraft-modes__panel--wide");
    const modesHost = document.createElement("div");
    modesPanel.append(modesHost);

    const responsePanel = makePanel("State response and modal contributions");
    responsePanel.classList.add("aircraft-modes__panel--wide");
    const legend = document.createElement("div");
    legend.className = "aircraft-modes__legend";
    [
      ["total", "Total"],
      ["fast", "Fast contribution"],
      ["slow", "Slow contribution"],
    ].forEach(([family, labelText]) => {
      const item = document.createElement("span");
      const swatch = document.createElement("span");
      swatch.className = `aircraft-modes__legend-swatch aircraft-modes__legend-swatch--${family}`;
      item.append(swatch, labelText);
      legend.append(item);
    });
    const responseHost = document.createElement("div");
    responseHost.className = "aircraft-modes__svg-host";
    responsePanel.append(legend, responseHost);

    const matrixDetails = document.createElement("details");
    matrixDetails.className = "aircraft-modes__matrix-details";
    const matrixSummary = document.createElement("summary");
    matrixSummary.textContent = "Current physical-state matrix A";
    const matrixPre = document.createElement("pre");
    matrixDetails.append(matrixSummary, matrixPre);

    element.append(
      header,
      controls,
      spectrumReadout,
      transport,
      currentReadout,
      dashboard,
      modesPanel,
      responsePanel,
      matrixDetails
    );

    function parameters() {
      return {
        fast: { c: state.cf, k: state.kf },
        slow: { c: state.cs, k: state.ks },
      };
    }

    function normalizeMotionForParameters(currentParameters) {
      const fastSpectrum = blockSpectrum(currentParameters.fast);
      const slowSpectrum = blockSpectrum(currentParameters.slow);
      if (state.motion.startsWith("fast") && state.motion !== "fast" && fastSpectrum.type !== "real") {
        state.motion = "fast";
      }
      if (state.motion.startsWith("slow") && state.motion !== "slow" && slowSpectrum.type !== "real") {
        state.motion = "slow";
      }
      if (state.disturbance === "modal" && state.motion === "total") {
        state.motion = "fast";
      }
    }

    function motionLabel(choice) {
      const labels = {
        total: "full response",
        fast: "fast block",
        slow: "slow block",
        fastPlus: "fast λ+ eigenvector",
        fastMinus: "fast λ− eigenvector",
        slowPlus: "slow λ+ eigenvector",
        slowMinus: "slow λ− eigenvector",
      };
      return labels[choice] || choice;
    }

    function updateMotionOptions() {
      const previous = state.motion;
      const options = [
        { value: "total", label: "Full response" },
        { value: "fast", label: "Fast block contribution" },
        { value: "slow", label: "Slow block contribution" },
      ];
      if (simulation.fastSpectrum.type === "real") {
        options.push(
          {
            value: "fastPlus",
            label: `Fast λ+ = ${formatRoot(simulation.fastSpectrum.roots[0])}`,
          },
          {
            value: "fastMinus",
            label: `Fast λ− = ${formatRoot(simulation.fastSpectrum.roots[1])}`,
          }
        );
      }
      if (simulation.slowSpectrum.type === "real") {
        options.push(
          {
            value: "slowPlus",
            label: `Slow λ+ = ${formatRoot(simulation.slowSpectrum.roots[0])}`,
          },
          {
            value: "slowMinus",
            label: `Slow λ− = ${formatRoot(simulation.slowSpectrum.roots[1])}`,
          }
        );
      }
      motionField.select.innerHTML = "";
      options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        motionField.select.append(optionElement);
      });
      state.motion = options.some((option) => option.value === previous) ? previous : "total";
      motionField.select.value = state.motion;
    }

    function setPlaying(nextPlaying) {
      playing = nextPlaying;
      playButton.textContent = playing ? "Pause" : "Play";
      playButton.setAttribute("aria-pressed", String(playing));
      lastTimestamp = 0;
      if (playing && !animationFrame) {
        animationFrame = requestAnimationFrame(animate);
      }
    }

    function currentSampleIndex() {
      if (!simulation) {
        return 0;
      }
      return clamp(
        Math.round((playbackTime / simulation.duration) * (simulation.samples.length - 1)),
        0,
        simulation.samples.length - 1
      );
    }

    function drawCurrent() {
      if (!simulation) {
        return;
      }
      const sampleIndex = currentSampleIndex();
      const sample = simulation.samples[sampleIndex];
      const shown = sampleState(sample, state.motion);
      drawAircraftScene(element, canvas, selectedPath, sampleIndex, state.motion);
      updateTimeChartCursor(chart, simulation, sampleIndex);
      timeSlider.value = String(playbackTime);
      timeOutput.textContent = `${playbackTime.toFixed(2)} s`;
      const gamma = shown[3] - shown[1];
      currentReadout.textContent =
        `Shown state at t = ${playbackTime.toFixed(2)} s: ` +
        `Δu/U₀ = ${formatNumber(100 * shown[0], 2)}%, ` +
        `α = ${formatNumber(degrees(shown[1]), 2)}°, ` +
        `q = ${formatNumber(degrees(shown[2]), 2)}°/s, ` +
        `θ = ${formatNumber(degrees(shown[3]), 2)}°, ` +
        `γ = ${formatNumber(degrees(gamma), 2)}°.`;
      element.dataset.currentTime = String(playbackTime);
      element.dataset.motionShown = state.motion;
      element.dataset.currentState = shown.join(",");
    }

    function animate(timestamp) {
      animationFrame = 0;
      if (!playing || !simulation) {
        return;
      }
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }
      playbackTime += ((timestamp - lastTimestamp) / 1000) * state.playbackSpeed;
      lastTimestamp = timestamp;
      if (playbackTime >= simulation.duration) {
        playbackTime = simulation.duration;
        setPlaying(false);
      }
      drawCurrent();
      if (playing) {
        animationFrame = requestAnimationFrame(animate);
      }
    }

    function recompute() {
      setPlaying(false);
      playbackTime = 0;
      const currentParameters = parameters();
      normalizeMotionForParameters(currentParameters);
      const initialPhysical =
        state.disturbance === "modal"
          ? null
          : DISTURBANCES[state.disturbance].vector(state.magnitude);
      const initialModal =
        state.disturbance === "modal"
          ? pureModalInitial(currentParameters, state.motion, state.magnitude)
          : null;
      simulation = simulate(currentParameters, initialPhysical, initialModal);
      updateMotionOptions();
      selectedPath = flightPath(simulation.samples, state.motion);
      timeSlider.max = String(simulation.duration);
      timeSlider.step = String(simulation.duration / (SAMPLE_COUNT - 1));
      renderEigenPlane(eigenHost, simulation.fastSpectrum, simulation.slowSpectrum, state.motion);
      renderModeShapes(modesHost, simulation.fastSpectrum, simulation.slowSpectrum);
      chart = renderTimeChart(responseHost, simulation);
      matrixPre.textContent = matrixText(physicalMatrix(currentParameters.fast, currentParameters.slow));
      spectrumReadout.textContent =
        `Fast: λ = ${formatSpectrum(simulation.fastSpectrum)} (${simulation.fastSpectrum.classification}). ` +
        `Slow: λ = ${formatSpectrum(simulation.slowSpectrum)} (${simulation.slowSpectrum.classification}). ` +
        `Displayed interval: ${formatNumber(simulation.duration, 2)} s.` +
        (state.disturbance === "modal"
          ? ` Pure modal initial condition: ${motionLabel(state.motion)}.`
          : "");
      element.dataset.fastEigenvalues = simulation.fastSpectrum.roots
        .map((root) => `${root.re},${root.im}`)
        .join(";");
      element.dataset.slowEigenvalues = simulation.slowSpectrum.roots
        .map((root) => `${root.re},${root.im}`)
        .join(";");
      drawCurrent();
    }

    presetField.select.addEventListener("change", () => {
      const preset = PRESETS[presetField.select.value];
      if (!preset) {
        return;
      }
      state.cf = preset.cf;
      state.kf = preset.kf;
      state.cs = preset.cs;
      state.ks = preset.ks;
      fastCField.input.value = String(state.cf);
      fastKField.input.value = String(state.kf);
      slowCField.input.value = String(state.cs);
      slowKField.input.value = String(state.ks);
      recompute();
    });

    disturbanceField.select.addEventListener("change", () => {
      state.disturbance = disturbanceField.select.value;
      state.magnitude = DISTURBANCES[state.disturbance].defaultMagnitude;
      if (state.disturbance === "modal" && state.motion === "total") {
        state.motion = "fast";
        motionField.select.value = state.motion;
      }
      magnitudeField.input.value = String(state.magnitude);
      magnitudeField.label.textContent = `Magnitude (${DISTURBANCES[state.disturbance].unit})`;
      recompute();
    });

    motionField.select.addEventListener("change", () => {
      state.motion = motionField.select.value;
      if (state.disturbance === "modal") {
        recompute();
      } else {
        selectedPath = flightPath(simulation.samples, state.motion);
        renderEigenPlane(eigenHost, simulation.fastSpectrum, simulation.slowSpectrum, state.motion);
        drawCurrent();
      }
    });

    speedField.select.addEventListener("change", () => {
      state.playbackSpeed = Number(speedField.select.value);
    });

    playButton.addEventListener("click", () => {
      if (!playing && simulation && playbackTime >= simulation.duration) {
        playbackTime = 0;
      }
      setPlaying(!playing);
      drawCurrent();
    });

    restartButton.addEventListener("click", () => {
      setPlaying(false);
      playbackTime = 0;
      drawCurrent();
    });

    timeSlider.addEventListener("input", () => {
      setPlaying(false);
      playbackTime = Number(timeSlider.value);
      drawCurrent();
    });

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => drawCurrent());
      resizeObserver.observe(canvas);
    }

    recompute();
  }

  registerExample("m3-aircraft-modes", initAircraftModes, {
    selectors: [".course-interactive-m3-aircraft-modes"],
  });
})();
