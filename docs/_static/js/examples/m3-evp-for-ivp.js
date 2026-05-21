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

  function computeMatrixExponentialPaths(matrix, y0, dt, stepCount) {
    const [[a11, a12], [a21, a22]] = matrix;
    const trace = a11 + a22;
    const determinant = a11 * a22 - a12 * a21;
    const discriminant = trace * trace - 4 * determinant;

    if (discriminant < -EIGEN_TOLERANCE) {
      return {
        error:
          "The selected matrix has complex eigenvalues, so the notebook's real phase-plane eigendecomposition does not apply directly.",
      };
    }

    let basis;
    let eigenvalues;

    if (Math.abs(discriminant) <= EIGEN_TOLERANCE) {
      const repeatedEigenvalue = trace / 2;
      const isScalarMatrix =
        Math.abs(a12) <= EIGEN_TOLERANCE &&
        Math.abs(a21) <= EIGEN_TOLERANCE &&
        Math.abs(a11 - a22) <= EIGEN_TOLERANCE;

      if (!isScalarMatrix) {
        return {
          error:
            "The selected matrix is not diagonalizable over a real eigenbasis, so this demo cannot reproduce the notebook's decomposition.",
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

    const basisMatrix = [
      [basis[0][0], basis[1][0]],
      [basis[0][1], basis[1][1]],
    ];
    const coefficients = solve2x2(basisMatrix, y0);

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
      const amplitude1 = coefficients[0] * Math.exp(eigenvalues[0] * time);
      const amplitude2 = coefficients[1] * Math.exp(eigenvalues[1] * time);
      const first = [basis[0][0] * amplitude1, basis[0][1] * amplitude1];
      const second = [basis[1][0] * amplitude2, basis[1][1] * amplitude2];

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
    };
  }

  function formatVector(vector) {
    return `(${vector[0].toPrecision(4)}, ${vector[1].toPrecision(4)})`;
  }

  function makeEmptyFigureLayout(message) {
    return {
      margin: { t: 24, r: 24, b: 56, l: 64 },
      xaxis: { title: "y_1", zeroline: true },
      yaxis: {
        title: "y_2",
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
    let a11 = numberFromDataset(element, "a11", 1);
    let a12 = numberFromDataset(element, "a12", -1);
    let a21 = numberFromDataset(element, "a21", -0.25);
    let a22 = numberFromDataset(element, "a22", 1);
    let y01 = numberFromDataset(element, "y01", 0.1);
    let y02 = numberFromDataset(element, "y02", 0);
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
      const data = computeMatrixExponentialPaths(matrix, [y01, y02], dt, stepCount);

      if (data.error) {
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
      const component1Path = data.component1.slice(0, stepIndex + 1);
      const component2Path = data.component2.slice(0, stepIndex + 1);
      const solutionPath = data.solution.slice(0, stepIndex + 1);
      const currentFirst = data.component1[stepIndex];
      const currentSecond = data.component2[stepIndex];

      readout.textContent =
        `lambda_1 = ${data.eigenvalues[0].toPrecision(4)}, ` +
        `lambda_2 = ${data.eigenvalues[1].toPrecision(4)}, ` +
        `t = ${currentTime.toPrecision(3)}, ` +
        `y(t) = ${formatVector(currentSolution)}.`;

      element.dataset.currentStep = String(visibleStep);
      element.dataset.currentTime = String(currentTime);
      element.dataset.currentSolution = currentSolution.join(",");

      plotly.react(
        plot,
        [
          {
            x: [0, ...component1Path.map((point) => point[0])],
            y: [0, ...component1Path.map((point) => point[1])],
            mode: "lines",
            line: { color: "blue", width: 2 },
            name: "Eigenvector 1",
          },
          {
            x: [0, ...component2Path.map((point) => point[0])],
            y: [0, ...component2Path.map((point) => point[1])],
            mode: "lines",
            line: { color: "red", width: 2 },
            name: "Eigenvector 2",
          },
          {
            x: solutionPath.map((point) => point[0]),
            y: solutionPath.map((point) => point[1]),
            mode: "lines",
            line: { color: "black", width: 2 },
            name: "Solution",
          },
          {
            x: [currentFirst[0], currentSolution[0], currentSecond[0]],
            y: [currentFirst[1], currentSolution[1], currentSecond[1]],
            mode: "lines",
            line: { color: "gray", width: 1, dash: "dash" },
            name: "Decomposition",
          },
        ],
        {
          autosize: true,
          legend: { orientation: "h", y: -0.2 },
          margin: { t: 24, r: 24, b: 88, l: 64 },
          xaxis: { title: "y_1", zeroline: true },
          yaxis: {
            title: "y_2",
            zeroline: true,
            scaleanchor: "x",
            scaleratio: 1,
          },
        },
        { displaylogo: false, responsive: true }
      );
    }

    controls.append(
      makeNumberInputControl({
        label: "a11",
        min: -2,
        max: 2,
        step: 0.1,
        value: a11,
        onInput: (value) => {
          a11 = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "a12",
        min: -2,
        max: 2,
        step: 0.1,
        value: a12,
        onInput: (value) => {
          a12 = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "a21",
        min: -2,
        max: 2,
        step: 0.1,
        value: a21,
        onInput: (value) => {
          a21 = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "a22",
        min: -2,
        max: 2,
        step: 0.1,
        value: a22,
        onInput: (value) => {
          a22 = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "y01",
        min: -2,
        max: 2,
        step: 0.1,
        value: y01,
        onInput: (value) => {
          y01 = value;
          redraw();
        },
      }),
      makeNumberInputControl({
        label: "y02",
        min: -2,
        max: 2,
        step: 0.1,
        value: y02,
        onInput: (value) => {
          y02 = value;
          redraw();
        },
      }),
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
