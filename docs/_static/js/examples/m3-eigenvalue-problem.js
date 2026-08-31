(function () {
  "use strict";

  const {
    loadPlotly,
    makeRangeControl,
    numberFromDataset,
    registerExample,
  } = window.CourseInteractives;

  function linspace(start, stop, count) {
    if (count <= 1) {
      return [start];
    }
    return Array.from({ length: count }, (_, index) => start + ((stop - start) * index) / (count - 1));
  }

  function matrixVector(matrix, vector) {
    return [
      matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
      matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
    ];
  }

  function vectorAngle(vector) {
    return Math.atan2(vector[1], vector[0]);
  }

  function degrees(angle) {
    return (angle * 180) / Math.PI;
  }

  function formatNumber(value, digits = 3) {
    return Number(value).toFixed(digits).replace(/\.?0+$/, "");
  }

  function roundedEntry(value) {
    const rounded = Number(value.toFixed(4));
    return Object.is(rounded, -0) ? 0 : rounded;
  }

  function randomEntry(nonzero = false) {
    if (nonzero) {
      const magnitude = 1 + Math.floor(Math.random() * 20);
      return (Math.random() < 0.5 ? -magnitude : magnitude) / 10;
    }
    return (Math.floor(Math.random() * 41) - 20) / 10;
  }

  function randomMatrix(type) {
    if (type === "generic") {
      return Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => randomEntry()));
    }

    if (type === "symmetric") {
      const a11 = randomEntry();
      const a12 = randomEntry();
      const a22 = randomEntry();
      return [
        [a11, a12],
        [a12, a22],
      ];
    }

    if (type === "skew-symmetric") {
      const a12 = randomEntry(true);
      return [
        [0, a12],
        [-a12, 0],
      ];
    }

    if (type === "diagonal") {
      return [
        [randomEntry(), 0],
        [0, randomEntry()],
      ];
    }

    if (type === "upper-triangular") {
      return [
        [randomEntry(), randomEntry()],
        [0, randomEntry()],
      ];
    }

    if (type === "degenerate") {
      let a11 = randomEntry();
      const a12 = randomEntry();
      if (a11 === 0 && a12 === 0) {
        a11 = randomEntry(true);
      }
      const rowScale = Math.random() < 0.5 ? -1 : 1;
      return [
        [a11, a12],
        [rowScale * a11, rowScale * a12],
      ];
    }

    const angle = Math.random() * 2 * Math.PI;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);

    if (type === "orthogonal") {
      const shrink = 0.25 + Math.random() * 0.65;
      const amplify = 1.1 + Math.random() * 0.7;
      const [column1Scale, column2Scale] =
        Math.random() < 0.5 ? [shrink, amplify] : [amplify, shrink];
      const orientation = Math.random() < 0.5 ? -1 : 1;

      return [
        [
          roundedEntry(column1Scale * cosine),
          roundedEntry(-orientation * column2Scale * sine),
        ],
        [
          roundedEntry(column1Scale * sine),
          roundedEntry(orientation * column2Scale * cosine),
        ],
      ];
    }

    if (type === "reflection") {
      return [
        [roundedEntry(cosine), roundedEntry(sine)],
        [roundedEntry(sine), roundedEntry(-cosine)],
      ];
    }

    return [
      [roundedEntry(cosine), roundedEntry(-sine)],
      [roundedEntry(sine), roundedEntry(cosine)],
    ];
  }

  function makeRandomMatrixControl(onGenerate) {
    const wrapper = document.createElement("div");
    wrapper.className = "course-interactive__control";

    const label = document.createElement("label");
    const select = document.createElement("select");
    select.id = `course-interactive-random-matrix-${Math.random().toString(36).slice(2)}`;
    label.htmlFor = select.id;
    label.textContent = "Generate random matrix";

    [
      { value: "", label: "Choose a type..." },
      { value: "generic", label: "Generic" },
      { value: "rotation", label: "Rotation" },
      { value: "reflection", label: "Reflection" },
      { value: "orthogonal", label: "Orthogonal columns" },
      { value: "symmetric", label: "Symmetric" },
      { value: "skew-symmetric", label: "Skew-symmetric" },
      { value: "diagonal", label: "Diagonal" },
      { value: "upper-triangular", label: "Upper triangular" },
      { value: "degenerate", label: "Degenerate (det = 0)" },
    ].forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      select.append(optionElement);
    });

    select.addEventListener("change", () => {
      if (select.value) {
        onGenerate(select.value);
        select.value = "";
      }
    });

    wrapper.append(label, select);
    return wrapper;
  }

  function trajectory(matrix, samples) {
    const theta = linspace(0, 2 * Math.PI, samples + 1).slice(0, -1);
    const x = theta.map((angle) => [Math.cos(angle), Math.sin(angle)]);
    const y = x.map((vector) => matrixVector(matrix, vector));
    return { theta, x, y };
  }

  function eigenDirectionTraces(matrix) {
    const a = matrix[0][0];
    const b = matrix[0][1];
    const c = matrix[1][0];
    const d = matrix[1][1];
    const trace = a + d;
    const determinant = a * d - b * c;
    const discriminant = trace * trace - 4 * determinant;

    if (discriminant < -1e-9) {
      return [];
    }

    const root = Math.sqrt(Math.max(0, discriminant));
    const values = [(trace + root) / 2, (trace - root) / 2];
    const seenAngles = [];

    return values.flatMap((lambda, index) => {
      let vector;
      if (Math.abs(b) > Math.abs(c)) {
        vector = [b, lambda - a];
      } else {
        vector = [lambda - d, c];
      }

      const norm = Math.hypot(vector[0], vector[1]);
      if (norm < 1e-9) {
        vector = index === 0 ? [1, 0] : [0, 1];
      } else {
        vector = [vector[0] / norm, vector[1] / norm];
      }

      const angle = Math.atan2(vector[1], vector[0]);
      if (seenAngles.some((other) => Math.abs(Math.sin(angle - other)) < 1e-6)) {
        return [];
      }
      seenAngles.push(angle);

      return [
        {
          x: [-2 * vector[0], 2 * vector[0]],
          y: [-2 * vector[1], 2 * vector[1]],
          mode: "lines",
          line: { color: "#666666", width: 1, dash: "dot" },
          name: `Eigenline ${seenAngles.length}`,
          hovertemplate: `lambda = ${formatNumber(lambda)}<extra></extra>`,
        },
      ];
    });
  }

  async function initEigenvalueProblem(element) {
    const plotly = await loadPlotly();
    const state = {
      a11: numberFromDataset(element, "a11", 1),
      a12: numberFromDataset(element, "a12", -1),
      a21: numberFromDataset(element, "a21", -0.25),
      a22: numberFromDataset(element, "a22", 1),
      thetaIndex: Math.round(numberFromDataset(element, "thetaIndex", 0)),
    };
    const angleCount = Math.max(72, Math.round(numberFromDataset(element, "angleSteps", 360)));
    state.thetaIndex = Math.min(angleCount - 1, Math.max(0, state.thetaIndex));
    let suppress = true;

    element.innerHTML = "";
    const header = document.createElement("div");
    header.className = "course-interactive__header";
    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = "Transformation of a 2x2 Matrix";
    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Plotly";
    const controls = document.createElement("div");
    controls.className = "course-interactive__controls";
    const readout = document.createElement("div");
    readout.className = "course-interactive__readout";
    const plot = document.createElement("div");
    plot.className = "course-interactive__plot course-interactive__plot--large";
    const matrixInputs = {};
    let matrixMessage;

    function redraw() {
      if (suppress) {
        return;
      }

      const matrix = [
        [state.a11, state.a12],
        [state.a21, state.a22],
      ];
      const determinant = state.a11 * state.a22 - state.a12 * state.a21;
      const data = trajectory(matrix, angleCount);
      const theta = data.theta[state.thetaIndex];
      const x = data.x[state.thetaIndex];
      const y = data.y[state.thetaIndex];
      let directionDifference = degrees(vectorAngle(x) - vectorAngle(y));
      while (directionDifference > 180) {
        directionDifference -= 360;
      }
      while (directionDifference <= -180) {
        directionDifference += 360;
      }

      readout.textContent = `det(A) = ${formatNumber(determinant)}; theta = ${formatNumber(
        degrees(theta),
        1
      )} deg; |y| = ${formatNumber(Math.hypot(y[0], y[1]))}; dir(x)-dir(y) = ${formatNumber(
        directionDifference,
        1
      )} deg`;

      plotly.react(
        plot,
        [
          {
            x: data.x.map((vector) => vector[0]),
            y: data.x.map((vector) => vector[1]),
            mode: "lines",
            line: { color: "#111111", width: 1 },
            name: "Trajectory of x",
          },
          {
            x: data.y.map((vector) => vector[0]),
            y: data.y.map((vector) => vector[1]),
            mode: "lines",
            line: { color: "#888888", width: 1 },
            name: "Trajectory of y",
          },
          ...eigenDirectionTraces(matrix),
          {
            x: [0, x[0]],
            y: [0, x[1]],
            mode: "lines+markers",
            line: { color: "#1f77b4", width: 3 },
            marker: { color: "#1f77b4", size: 6 },
            name: "x - unit vector",
          },
          {
            x: [0, y[0]],
            y: [0, y[1]],
            mode: "lines+markers",
            line: { color: "#d62728", width: 3 },
            marker: { color: "#d62728", size: 6 },
            name: "y - transformed vector",
          },
        ],
        {
          height: 720,
          margin: { t: 24, r: 24, b: 54, l: 54 },
          xaxis: { title: "x", range: [-2, 2], zeroline: true, scaleanchor: "y", scaleratio: 1 },
          yaxis: { title: "y", range: [-2, 2], zeroline: true },
          legend: { orientation: "h", y: 1.08 },
        },
        { responsive: true, displaylogo: false }
      );
    }

    function makeMatrixControl() {
      const wrapper = document.createElement("fieldset");
      wrapper.className = "course-interactive__control course-interactive__matrix-control";
      const legend = document.createElement("legend");
      legend.textContent = "Matrix A";
      const grid = document.createElement("div");
      grid.className = "course-interactive__matrix-grid";
      matrixMessage = document.createElement("div");
      matrixMessage.className = "course-interactive__message course-interactive__matrix-message";

      [
        ["a11", "a11"],
        ["a12", "a12"],
        ["a21", "a21"],
        ["a22", "a22"],
      ].forEach(([label, key]) => {
        const input = document.createElement("input");
        input.type = "number";
        input.min = "-2";
        input.max = "2";
        input.step = "0.1";
        input.value = String(state[key]);
        input.inputMode = "decimal";
        input.className = "course-interactive__matrix-input";
        input.setAttribute("aria-label", label);
        input.title = label;
        matrixInputs[key] = input;

        input.addEventListener("input", () => {
          const value = Number(input.value);
          const isValid =
            input.value.trim() !== "" && Number.isFinite(value) && value >= -2 && value <= 2;

          if (!isValid) {
            input.setAttribute("aria-invalid", "true");
            matrixMessage.textContent = "Each matrix entry must be between -2 and 2.";
            return;
          }

          input.removeAttribute("aria-invalid");
          state[key] = value;
          matrixMessage.textContent = Object.values(matrixInputs).some(
            (matrixInput) => matrixInput.getAttribute("aria-invalid") === "true"
          )
            ? "Each matrix entry must be between -2 and 2."
            : "";
          redraw();
        });
        grid.append(input);
      });

      wrapper.append(legend, grid, matrixMessage);
      return wrapper;
    }

    function setMatrix(matrix) {
      const entries = {
        a11: matrix[0][0],
        a12: matrix[0][1],
        a21: matrix[1][0],
        a22: matrix[1][1],
      };

      Object.entries(entries).forEach(([key, value]) => {
        state[key] = value;
        matrixInputs[key].value = String(value);
        matrixInputs[key].removeAttribute("aria-invalid");
      });
      matrixMessage.textContent = "";
      redraw();
    }

    const matrixControl = makeMatrixControl();
    controls.append(
      makeRandomMatrixControl((type) => setMatrix(randomMatrix(type))),
      matrixControl,
      makeRangeControl({
        label: "theta",
        min: 0,
        max: angleCount - 1,
        step: 1,
        value: state.thetaIndex,
        onInput(value) {
          state.thetaIndex = Math.round(value);
          redraw();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    suppress = false;
    redraw();
  }

  registerExample("m3-eigenvalue-problem", initEigenvalueProblem, {
    selectors: [".course-interactive-m3-eigenvalue-problem"],
  });
})();
