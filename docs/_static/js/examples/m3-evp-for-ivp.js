(function () {
  "use strict";

  const {
    loadPlotly,
    makeNumberInputControl,
    makeRangeControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

  const EIGEN_TOLERANCE = 1e-10;

  function vectorFromDataset(element, key, fallback) {
    const values = (element.dataset[key] || "")
      .split(",")
      .map((value) => Number(value.trim()));

    if (values.length !== fallback.length || values.some((value) => !Number.isFinite(value))) {
      return [...fallback];
    }

    return values;
  }

  function makeTabularControl({ label, entries, columns = 2, errorMessage }) {
    const wrapper = document.createElement("fieldset");
    wrapper.className = "course-interactive__control course-interactive__matrix-control";

    const legend = document.createElement("legend");
    legend.textContent = label;

    const grid = document.createElement("div");
    grid.className = "course-interactive__matrix-grid";
    if (columns === 1) {
      grid.classList.add("course-interactive__matrix-grid--vector");
    }

    const message = document.createElement("div");
    message.className = "course-interactive__message course-interactive__matrix-message";
    const inputs = [];

    entries.forEach((entry) => {
      const input = document.createElement("input");
      input.type = "number";
      input.min = "-10";
      input.max = "10";
      input.step = "0.1";
      input.value = String(entry.value);
      input.inputMode = "decimal";
      input.className = "course-interactive__matrix-input";
      input.setAttribute("aria-label", entry.ariaLabel);
      input.title = entry.ariaLabel;
      inputs.push(input);

      input.addEventListener("input", () => {
        const value = Number(input.value);
        const isValid =
          input.value.trim() !== "" && Number.isFinite(value) && value >= -10 && value <= 10;

        if (!isValid) {
          input.setAttribute("aria-invalid", "true");
          message.textContent = errorMessage;
          return;
        }

        input.removeAttribute("aria-invalid");
        entry.onInput(value);
        message.textContent = inputs.some(
          (candidate) => candidate.getAttribute("aria-invalid") === "true"
        )
          ? errorMessage
          : "";
      });

      grid.append(input);
    });

    wrapper.append(legend, grid, message);
    return wrapper;
  }

  function normalize(vector) {
    const length = Math.hypot(vector[0], vector[1]);
    if (length < EIGEN_TOLERANCE) {
      return null;
    }
    return [vector[0] / length, vector[1] / length];
  }

  function solve2x2(matrix, rhs) {
    const [[a, b], [c, d]] = matrix;
    const det = a * d - b * c;
    if (Math.abs(det) < EIGEN_TOLERANCE) {
      return null;
    }
    return [
      (d * rhs[0] - b * rhs[1]) / det,
      (-c * rhs[0] + a * rhs[1]) / det,
    ];
  }

  function eigenvectorFor(matrix, eigenvalue) {
    const [[a11, a12], [a21, a22]] = matrix;
    const row1 = [a11 - eigenvalue, a12];
    const row2 = [a21, a22 - eigenvalue];
    const row1Norm = Math.hypot(row1[0], row1[1]);
    const row2Norm = Math.hypot(row2[0], row2[1]);

    if (row1Norm >= row2Norm && row1Norm > EIGEN_TOLERANCE) {
      return normalize([row1[1], -row1[0]]);
    }
    if (row2Norm > EIGEN_TOLERANCE) {
      return normalize([row2[1], -row2[0]]);
    }

    return null;
  }

  function complexEigenbasis(matrix, realPart, imaginaryPart) {
    const [[a11, a12], [a21, a22]] = matrix;
    let realVector;
    let imaginaryVector;

    if (Math.abs(a12) >= Math.abs(a21)) {
      realVector = [a12, realPart - a11];
      imaginaryVector = [0, imaginaryPart];
    } else {
      realVector = [realPart - a22, a21];
      imaginaryVector = [imaginaryPart, 0];
    }

    const length = Math.hypot(...realVector, ...imaginaryVector);
    if (length < EIGEN_TOLERANCE) {
      return null;
    }

    return [
      realVector.map((value) => value / length),
      imaginaryVector.map((value) => value / length),
    ];
  }

  function formatScalar(value) {
    const normalized = Math.abs(value) < EIGEN_TOLERANCE ? 0 : value;
    return normalized.toPrecision(4);
  }

  function computeMatrixExponentialPaths(matrix, x0, dt, stepCount) {
    const [[a11, a12], [a21, a22]] = matrix;
    const trace = a11 + a22;
    const determinant = a11 * a22 - a12 * a21;
    const discriminant = trace * trace - 4 * determinant;

    let basis;
    let eigenvalues;
    let modesAtTime;
    let modeType;
    let componentLabels;
    let spectrumLabel;

    if (discriminant < -EIGEN_TOLERANCE) {
      const realPart = trace / 2;
      const imaginaryPart = Math.sqrt(-discriminant) / 2;
      basis = complexEigenbasis(matrix, realPart, imaginaryPart);

      if (!basis) {
        return {
          error: "The demo could not recover a stable basis from the complex eigenvector.",
        };
      }

      eigenvalues = [
        { real: realPart, imaginary: imaginaryPart },
        { real: realPart, imaginary: -imaginaryPart },
      ];
      modeType = "complex";
      componentLabels = ["Real-part mode", "Imaginary-part mode"];
      spectrumLabel =
        `lambda_1,2 = ${formatScalar(realPart)} ± ` + `${formatScalar(imaginaryPart)}i`;

      modesAtTime = (time) => {
        const [realVector, imaginaryVector] = basis;
        const growth = Math.exp(realPart * time);
        const cosine = Math.cos(imaginaryPart * time);
        const sine = Math.sin(imaginaryPart * time);

        return [
          realVector.map(
            (value, index) =>
              growth * (value * cosine - imaginaryVector[index] * sine)
          ),
          realVector.map(
            (value, index) =>
              growth * (value * sine + imaginaryVector[index] * cosine)
          ),
        ];
      };
    } else if (Math.abs(discriminant) <= EIGEN_TOLERANCE) {
      const repeatedEigenvalue = trace / 2;
      const isScalarMatrix =
        Math.abs(a12) <= EIGEN_TOLERANCE &&
        Math.abs(a21) <= EIGEN_TOLERANCE &&
        Math.abs(a11 - a22) <= EIGEN_TOLERANCE;

      if (!isScalarMatrix) {
        const nilpotentAction = [
          (a11 - repeatedEigenvalue) * x0[0] + a12 * x0[1],
          a21 * x0[0] + (a22 - repeatedEigenvalue) * x0[1],
        ];
        const times = Array.from({ length: stepCount }, (_, index) => index * dt);
        const solution = times.map((time) => {
          const growth = Math.exp(repeatedEigenvalue * time);
          return [
            growth * (x0[0] + time * nilpotentAction[0]),
            growth * (x0[1] + time * nilpotentAction[1]),
          ];
        });

        return {
          eigenvalues: [repeatedEigenvalue, repeatedEigenvalue],
          component1: null,
          component2: null,
          solution,
          times,
          modeType: "defective",
          componentLabels: [],
          referenceEigenvector: eigenvectorFor(matrix, repeatedEigenvalue),
          spectrumLabel:
            `lambda_1,2 = ${formatScalar(repeatedEigenvalue)} ` + "(non-diagonalizable)",
        };
      }

      eigenvalues = [repeatedEigenvalue, repeatedEigenvalue];
      basis = [
        [1, 0],
        [0, 1],
      ];
    } else {
      const root = Math.sqrt(Math.max(discriminant, 0));
      const lambda1 = (trace + root) / 2;
      const lambda2 = (trace - root) / 2;
      const v1 = eigenvectorFor(matrix, lambda1);
      const v2 = eigenvectorFor(matrix, lambda2);

      if (!v1 || !v2) {
        return {
          error:
            "The demo could not recover a stable real eigenbasis for this matrix.",
        };
      }

      basis = [v1, v2];
      eigenvalues = [lambda1, lambda2];
    }

    if (!modesAtTime) {
      modeType = "real";
      componentLabels = ["Eigenvector 1", "Eigenvector 2"];
      spectrumLabel =
        `lambda_1 = ${formatScalar(eigenvalues[0])}, ` +
        `lambda_2 = ${formatScalar(eigenvalues[1])}`;
      modesAtTime = (time) => [
        basis[0].map((value) => value * Math.exp(eigenvalues[0] * time)),
        basis[1].map((value) => value * Math.exp(eigenvalues[1] * time)),
      ];
    }

    const basisMatrix = [
      [basis[0][0], basis[1][0]],
      [basis[0][1], basis[1][1]],
    ];
    const coefficients = solve2x2(basisMatrix, x0);

    if (!coefficients) {
      return {
        error:
          "The eigenvector basis is singular, so the initial condition cannot be decomposed reliably.",
      };
    }

    const times = Array.from({ length: stepCount }, (_, index) => index * dt);
    const component1 = [];
    const component2 = [];
    const solution = [];

    times.forEach((time) => {
      const [firstMode, secondMode] = modesAtTime(time);
      const first = firstMode.map((value) => coefficients[0] * value);
      const second = secondMode.map((value) => coefficients[1] * value);

      component1.push(first);
      component2.push(second);
      solution.push([first[0] + second[0], first[1] + second[1]]);
    });

    return {
      eigenvalues,
      component1,
      component2,
      solution,
      times,
      modeType,
      componentLabels,
      spectrumLabel,
    };
  }

  function formatVector(vector) {
    return `(${vector[0].toPrecision(4)}, ${vector[1].toPrecision(4)})`;
  }

  function makeEmptyFigureLayout(message) {
    return {
      margin: { t: 24, r: 24, b: 56, l: 64 },
      xaxis: { title: "x_1", zeroline: true },
      yaxis: {
        title: "x_2",
        zeroline: true,
        scaleanchor: "x",
        scaleratio: 1,
      },
      annotations: [
        {
          text: message,
          xref: "paper",
          yref: "paper",
          x: 0.5,
          y: 0.5,
          showarrow: false,
          align: "center",
        },
      ],
    };
  }

  async function initMatrixExponentialDemo(element) {
    const plotly = await loadPlotly();
    let a11 = numberFromDataset(element, "a11", -5);
    let a12 = numberFromDataset(element, "a12", 2);
    let a21 = numberFromDataset(element, "a21", 2);
    let a22 = numberFromDataset(element, "a22", -2);
    const x0 = vectorFromDataset(element, "x0", [0.1, 0]);
    let dt = numberFromDataset(element, "dt", 0.2);
    const stepCount = Math.max(2, Math.round(numberFromDataset(element, "stepCount", 10)));
    let visibleStep = 1;

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Solving 2D ODE by Matrix Exponentials";

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
      const matrix = [
        [a11, a12],
        [a21, a22],
      ];
      const data = computeMatrixExponentialPaths(matrix, x0, dt, stepCount);

      if (data.error) {
        status.textContent = "Plotly · unavailable";
        readout.textContent = data.error;
        plotly.react(plot, [], makeEmptyFigureLayout(data.error), {
          displaylogo: false,
          responsive: true,
        });
        return;
      }

      const stepIndex = Math.min(Math.max(visibleStep - 1, 0), data.times.length - 1);
      const currentTime = data.times[stepIndex];
      const currentSolution = data.solution[stepIndex];
      const solutionPath = data.solution.slice(0, stepIndex + 1);
      const hasModeDecomposition = data.component1 !== null && data.component2 !== null;
      const component1Path = hasModeDecomposition
        ? data.component1.slice(0, stepIndex + 1)
        : [];
      const component2Path = hasModeDecomposition
        ? data.component2.slice(0, stepIndex + 1)
        : [];

      const modeStatus = {
        complex: "complex modes",
        defective: "non-diagonalizable",
        real: "real modes",
      };
      status.textContent = `Plotly · ${modeStatus[data.modeType]}`;
      readout.textContent =
        `${data.spectrumLabel}, ` +
        `t = ${currentTime.toPrecision(3)}, ` +
        `x(t) = ${formatVector(currentSolution)}.`;

      element.dataset.modeType = data.modeType;
      element.dataset.currentStep = String(visibleStep);
      element.dataset.currentTime = String(currentTime);
      element.dataset.currentSolution = currentSolution.join(",");

      const traces = [];

      if (hasModeDecomposition) {
        const currentFirst = data.component1[stepIndex];
        const currentSecond = data.component2[stepIndex];
        traces.push(
          {
            x: [0, ...component1Path.map((point) => point[0])],
            y: [0, ...component1Path.map((point) => point[1])],
            mode: "lines",
            line: { color: "blue", width: 2 },
            name: data.componentLabels[0],
          },
          {
            x: [0, ...component2Path.map((point) => point[0])],
            y: [0, ...component2Path.map((point) => point[1])],
            mode: "lines",
            line: { color: "red", width: 2 },
            name: data.componentLabels[1],
          },
          {
            x: [currentFirst[0], currentSolution[0], currentSecond[0]],
            y: [currentFirst[1], currentSolution[1], currentSecond[1]],
            mode: "lines",
            line: { color: "gray", width: 1, dash: "dash" },
            name: "Decomposition",
          }
        );
      }

      if (data.referenceEigenvector) {
        const alignment =
          data.referenceEigenvector[0] * currentSolution[0] +
          data.referenceEigenvector[1] * currentSolution[1];
        const orientation = alignment < 0 ? -1 : 1;
        const referenceScale = Math.max(
          EIGEN_TOLERANCE,
          ...solutionPath.map((point) => Math.hypot(point[0], point[1]))
        );

        traces.push({
          x: [0, orientation * referenceScale * data.referenceEigenvector[0]],
          y: [0, orientation * referenceScale * data.referenceEigenvector[1]],
          mode: "lines+markers",
          line: { color: "#1f77b4", width: 2, dash: "dot" },
          marker: { color: "#1f77b4", size: [0, 7] },
          name: "Eigenvector reference",
        });
      }

      const solutionTraceIndex = hasModeDecomposition ? 2 : traces.length;
      traces.splice(solutionTraceIndex, 0, {
        x: solutionPath.map((point) => point[0]),
        y: solutionPath.map((point) => point[1]),
        mode: "lines+markers",
        line: { color: "black", width: 2 },
        marker: { color: "black", size: 5 },
        name: "Solution",
      });

      plotly.react(
        plot,
        traces,
        {
          autosize: true,
          legend: { orientation: "h", y: -0.2 },
          margin: { t: 24, r: 24, b: 88, l: 64 },
          xaxis: { title: "x_1", zeroline: true },
          yaxis: {
            title: "x_2",
            zeroline: true,
            scaleanchor: "x",
            scaleratio: 1,
          },
        },
        { displaylogo: false, responsive: true }
      );
    }

    const matrixControl = makeTabularControl({
      label: "Matrix A",
      errorMessage: "Each matrix entry must be between -10 and 10.",
      entries: [
        {
          ariaLabel: "a11",
          value: a11,
          onInput: (value) => {
            a11 = value;
            redraw();
          },
        },
        {
          ariaLabel: "a12",
          value: a12,
          onInput: (value) => {
            a12 = value;
            redraw();
          },
        },
        {
          ariaLabel: "a21",
          value: a21,
          onInput: (value) => {
            a21 = value;
            redraw();
          },
        },
        {
          ariaLabel: "a22",
          value: a22,
          onInput: (value) => {
            a22 = value;
            redraw();
          },
        },
      ],
    });

    const initialConditionControl = makeTabularControl({
      label: "Initial condition x0",
      columns: 1,
      errorMessage: "Each initial-condition entry must be between -10 and 10.",
      entries: [
        {
          ariaLabel: "x0 component 1",
          value: x0[0],
          onInput: (value) => {
            x0[0] = value;
            redraw();
          },
        },
        {
          ariaLabel: "x0 component 2",
          value: x0[1],
          onInput: (value) => {
            x0[1] = value;
            redraw();
          },
        },
      ],
    });

    controls.append(
      matrixControl,
      initialConditionControl,
      makeNumberInputControl({
        label: "Step size",
        min: 0.1,
        max: 1,
        step: 0.1,
        value: dt,
        onInput: (value) => {
          dt = value;
          redraw();
        },
      }),
      makeRangeControl({
        label: "Visible step",
        min: 1,
        max: stepCount,
        step: 1,
        value: visibleStep,
        onInput: (value) => {
          visibleStep = Math.round(value);
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    redraw();
  }

  registerExample("m3-evp-for-ivp", initMatrixExponentialDemo, {
    selectors: [".course-interactive-m3-evp-for-ivp"],
  });
})();
