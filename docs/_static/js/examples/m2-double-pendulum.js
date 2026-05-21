(function () {
  "use strict";

  const { makeNumberInputControl, numberFromDataset, registerExample } = window.CourseInteractives;

  const DEFAULTS = Object.freeze({
    g: 9.8,
    l1: 1,
    l2: 1,
    m1: 1,
    m2: 1,
    theta1: (120 * Math.PI) / 180,
    omega1: 0,
    theta2: (-10 * Math.PI) / 180,
    omega2: 0,
    dt: 0.02,
    duration: 50,
    playbackSpeed: 1.5,
    trailLength: 180,
  });

  function derivatives(state, params) {
    const [theta1, omega1, theta2, omega2] = state;
    const delta = theta2 - theta1;
    const sinDelta = Math.sin(delta);
    const cosDelta = Math.cos(delta);
    const denominator1 = (params.m1 + params.m2) * params.l1 - params.m2 * params.l1 * cosDelta * cosDelta;
    const denominator2 = (params.l2 / params.l1) * denominator1;

    return [
      omega1,
      (
        params.m2 * params.l1 * omega1 * omega1 * sinDelta * cosDelta +
        params.m2 * params.g * Math.sin(theta2) * cosDelta +
        params.m2 * params.l2 * omega2 * omega2 * sinDelta -
        (params.m1 + params.m2) * params.g * Math.sin(theta1)
      ) / denominator1,
      omega2,
      (
        -params.m2 * params.l2 * omega2 * omega2 * sinDelta * cosDelta +
        (params.m1 + params.m2) * params.g * Math.sin(theta1) * cosDelta -
        (params.m1 + params.m2) * params.l1 * omega1 * omega1 * sinDelta -
        (params.m1 + params.m2) * params.g * Math.sin(theta2)
      ) / denominator2,
    ];
  }

  function addScaled(state, delta, scale) {
    return state.map((value, index) => value + delta[index] * scale);
  }

  function rk4Step(state, dt, params) {
    const k1 = derivatives(state, params);
    const k2 = derivatives(addScaled(state, k1, dt / 2), params);
    const k3 = derivatives(addScaled(state, k2, dt / 2), params);
    const k4 = derivatives(addScaled(state, k3, dt), params);

    return state.map(
      (value, index) => value + (dt * (k1[index] + 2 * k2[index] + 2 * k3[index] + k4[index])) / 6
    );
  }

  function cartesianState(state, params) {
    const [theta1, , theta2] = state;
    const x1 = params.l1 * Math.sin(theta1);
    const y1 = -params.l1 * Math.cos(theta1);
    const x2 = x1 + params.l2 * Math.sin(theta2);
    const y2 = y1 - params.l2 * Math.cos(theta2);
    return { x1, y1, x2, y2 };
  }

  function simulateTrajectory(params) {
    const stepCount = Math.max(1, Math.round(DEFAULTS.duration / DEFAULTS.dt));
    const samples = new Array(stepCount + 1);
    let state = [DEFAULTS.theta1, DEFAULTS.omega1, DEFAULTS.theta2, DEFAULTS.omega2];

    // The notebook integrated farther in time but only animated the first 50 seconds.
    for (let index = 0; index <= stepCount; index += 1) {
      samples[index] = {
        time: index * DEFAULTS.dt,
        ...cartesianState(state, params),
      };
      if (index < stepCount) {
        state = rk4Step(state, DEFAULTS.dt, params);
      }
    }

    return samples;
  }

  function interpolateSample(samples, time) {
    const maxTime = samples[samples.length - 1].time;
    const wrappedTime = ((time % maxTime) + maxTime) % maxTime;
    const rawIndex = wrappedTime / DEFAULTS.dt;
    const index = Math.floor(rawIndex);
    const nextIndex = Math.min(index + 1, samples.length - 1);
    const alpha = rawIndex - index;
    const current = samples[index];
    const next = samples[nextIndex];

    return {
      time: wrappedTime,
      x1: current.x1 + (next.x1 - current.x1) * alpha,
      y1: current.y1 + (next.y1 - current.y1) * alpha,
      x2: current.x2 + (next.x2 - current.x2) * alpha,
      y2: current.y2 + (next.y2 - current.y2) * alpha,
      frameIndex: index,
    };
  }

  function toCanvas(pointX, pointY, originX, originY, scale) {
    return [originX + scale * pointX, originY - scale * pointY];
  }

  function drawScene(context, canvas, samples, params, time) {
    const frame = interpolateSample(samples, time);
    const extent = params.l1 + params.l2;
    const scale = (Math.min(canvas.width, canvas.height) * 0.42) / Math.max(extent, 0.1);
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = "#d8dee9";
    context.lineWidth = 1;
    context.beginPath();
    context.arc(originX, originY, scale * extent, 0, 2 * Math.PI);
    context.stroke();

    const trailStart = Math.max(0, frame.frameIndex - DEFAULTS.trailLength);
    context.strokeStyle = "rgba(31, 111, 235, 0.35)";
    context.lineWidth = 2;
    context.beginPath();
    for (let index = trailStart; index <= frame.frameIndex; index += 1) {
      const [x, y] = toCanvas(samples[index].x2, samples[index].y2, originX, originY, scale);
      if (index === trailStart) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();

    const [bob1X, bob1Y] = toCanvas(frame.x1, frame.y1, originX, originY, scale);
    const [bob2X, bob2Y] = toCanvas(frame.x2, frame.y2, originX, originY, scale);

    context.strokeStyle = "#1f2937";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(originX, originY);
    context.lineTo(bob1X, bob1Y);
    context.lineTo(bob2X, bob2Y);
    context.stroke();

    context.fillStyle = "#111827";
    context.beginPath();
    context.arc(originX, originY, 5, 0, 2 * Math.PI);
    context.fill();

    context.fillStyle = "#2563eb";
    context.beginPath();
    context.arc(bob1X, bob1Y, 6 + 3 * Math.sqrt(params.m1), 0, 2 * Math.PI);
    context.fill();

    context.fillStyle = "#dc2626";
    context.beginPath();
    context.arc(bob2X, bob2Y, 6 + 3 * Math.sqrt(params.m2), 0, 2 * Math.PI);
    context.fill();

    return frame.time;
  }

  async function initDoublePendulum(element) {
    let g = numberFromDataset(element, "g", DEFAULTS.g);
    let l1 = numberFromDataset(element, "l1", DEFAULTS.l1);
    let l2 = numberFromDataset(element, "l2", DEFAULTS.l2);
    let m1 = numberFromDataset(element, "m1", DEFAULTS.m1);
    let m2 = numberFromDataset(element, "m2", DEFAULTS.m2);

    element.innerHTML = "";

    const header = document.createElement("div");
    header.className = "course-interactive__header";

    const title = document.createElement("h2");
    title.className = "course-interactive__title";
    title.textContent = element.dataset.title || "Double Pendulum";

    const status = document.createElement("div");
    status.className = "course-interactive__status";
    status.textContent = "Browser canvas + RK4";

    const controls = document.createElement("div");
    controls.className = "course-interactive__controls";

    const readout = document.createElement("div");
    readout.className = "course-interactive__readout";

    const plot = document.createElement("div");
    plot.className = "course-interactive__plot";
    plot.style.display = "flex";
    plot.style.justifyContent = "center";

    const canvas = document.createElement("canvas");
    canvas.width = 560;
    canvas.height = 560;
    canvas.style.width = "100%";
    canvas.style.maxWidth = "560px";
    canvas.style.height = "auto";
    canvas.setAttribute("aria-label", "Animated double pendulum");
    plot.append(canvas);

    const context = canvas.getContext("2d");
    if (!context) {
      element.textContent = "This interactive example could not create a drawing surface.";
      return;
    }

    let samples = [];
    let animationFrameId = 0;
    let lastTimestamp = 0;
    let playbackTime = 0;

    function currentParams() {
      return { g, l1, l2, m1, m2 };
    }

    function updateReadout(time) {
      readout.textContent =
        `t = ${time.toFixed(2)} s. Fixed initial conditions: theta1(0) = 120 deg, ` +
        `theta2(0) = -10 deg, omega1(0) = omega2(0) = 0.`;
      element.dataset.currentTime = String(time);
      element.dataset.currentG = String(g);
      element.dataset.currentL1 = String(l1);
      element.dataset.currentL2 = String(l2);
      element.dataset.currentM1 = String(m1);
      element.dataset.currentM2 = String(m2);
    }

    function renderFrame(time) {
      const displayedTime = drawScene(context, canvas, samples, currentParams(), time);
      updateReadout(displayedTime);
    }

    function restartAnimation() {
      samples = simulateTrajectory(currentParams());
      playbackTime = 0;
      lastTimestamp = 0;
      renderFrame(playbackTime);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      const tick = (timestamp) => {
        if (!lastTimestamp) {
          lastTimestamp = timestamp;
        }
        const elapsedSeconds = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
        lastTimestamp = timestamp;
        playbackTime = (playbackTime + elapsedSeconds * DEFAULTS.playbackSpeed) % DEFAULTS.duration;
        renderFrame(playbackTime);
        animationFrameId = requestAnimationFrame(tick);
      };

      animationFrameId = requestAnimationFrame(tick);
    }

    controls.append(
      makeNumberInputControl({
        label: "g (m/s^2)",
        min: 0.1,
        max: 100,
        step: 0.1,
        value: g,
        onInput: (value) => {
          g = value;
          restartAnimation();
        },
      }),
      makeNumberInputControl({
        label: "L1 (m)",
        min: 0.1,
        max: 2,
        step: 0.1,
        value: l1,
        onInput: (value) => {
          l1 = value;
          restartAnimation();
        },
      }),
      makeNumberInputControl({
        label: "L2 (m)",
        min: 0.1,
        max: 2,
        step: 0.1,
        value: l2,
        onInput: (value) => {
          l2 = value;
          restartAnimation();
        },
      }),
      makeNumberInputControl({
        label: "M1 (kg)",
        min: 0.1,
        max: 10,
        step: 0.1,
        value: m1,
        onInput: (value) => {
          m1 = value;
          restartAnimation();
        },
      }),
      makeNumberInputControl({
        label: "M2 (kg)",
        min: 0.1,
        max: 10,
        step: 0.1,
        value: m2,
        onInput: (value) => {
          m2 = value;
          restartAnimation();
        },
      })
    );

    header.append(title, status);
    element.append(header, controls, readout, plot);
    restartAnimation();
  }

  registerExample("m2-double-pendulum", initDoublePendulum, {
    selectors: [".course-interactive-m2-double-pendulum"],
  });
})();
