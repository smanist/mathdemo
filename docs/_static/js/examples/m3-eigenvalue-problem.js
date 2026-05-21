(function () {
  "use strict";

  const {
    loadPlotly,
    makeNumberInputControl,
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

    function redraw() {
      if (suppress) {
        return;
      }

      const matrix = [
        [state.a11, state.a12],
        [state.a21, state.a22],
      ];
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

      readout.textContent = `theta = ${formatNumber(degrees(theta), 1)} deg; |y| = ${formatNumber(
        Math.hypot(y[0], y[1])
      )}; dir(x)-dir(y) = ${formatNumber(directionDifference, 1)} deg`;

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

    function matrixControl(label, key) {
      return makeNumberInputControl({
        label,
        min: -2,
        max: 2,
        step: 0.1,
        value: state[key],
        onInput(value) {
          state[key] = value;
          redraw();
        },
      });
    }

    controls.append(
      matrixControl("a11", "a11"),
      matrixControl("a12", "a12"),
      matrixControl("a21", "a21"),
      matrixControl("a22", "a22"),
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
