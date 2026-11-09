/* Signal Grid — a 30-second reaction game */
(function () {
  "use strict";

  const board = document.getElementById("signalBoard");
  if (!board) return;

  const overlay = document.getElementById("signalOverlay");
  const startBtn = document.getElementById("gameStart");
  const overlayStart = document.getElementById("overlayStart");
  const scoreEl = document.getElementById("score");
  const streakEl = document.getElementById("streak");
  const timerEl = document.getElementById("timer");
  const statusEl = document.getElementById("signalStatus");
  const bestEl = document.getElementById("bestScore");
  const bestInGame = document.getElementById("bestScore");

  const CELLS = 16;
  const GAME_SECONDS = 30;
  const BEST_KEY = "guannan-signal-best";

  let cells = [];
  let active = -1;
  let running = false;
  let score = 0;
  let streak = 0;
  let timeLeft = GAME_SECONDS;
  let best = 0;
  let tickTimer = 0;
  let signalTimer = 0;
  let nextTimer = 0;
  let audio = null;

  try {
    best = Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    best = 0;
  }

  if (bestEl) bestEl.textContent = String(best);
  if (bestInGame) bestInGame.textContent = String(best);

  for (let i = 0; i < CELLS; i++) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "signal-cell";
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", `Cell ${i + 1}`);
    cell.dataset.index = String(i);
    cell.addEventListener("click", () => hit(i));
    board.appendChild(cell);
    cells.push(cell);
  }

  function beep(frequency, duration = 0.08) {
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.045, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
      osc.connect(gain).connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + duration);
    } catch {
      /* audio is optional */
    }
  }

  function setTime(value) {
    timeLeft = Math.max(0, value);
    if (timerEl) timerEl.textContent = timeLeft.toFixed(1);
  }

  function paintHUD() {
    if (scoreEl) scoreEl.textContent = String(score);
    if (streakEl) streakEl.textContent = String(streak);
    if (bestEl) bestEl.textContent = String(best);
    if (bestInGame) bestInGame.textContent = String(best);
  }

  function clearSignal() {
    clearTimeout(signalTimer);
    if (active >= 0 && cells[active]) cells[active].classList.remove("active");
    active = -1;
  }

  function pickCell() {
    let next = Math.floor(Math.random() * CELLS);
    if (next === active) next = (next + 3) % CELLS;
    return next;
  }

  function nextSignal() {
    if (!running) return;
    clearSignal();
    active = pickCell();
    cells[active].classList.add("active");
    beep(620 + Math.min(score, 18) * 18, 0.06);

    const windowMs = Math.max(430, 1050 - score * 24 - streak * 20);
    signalTimer = setTimeout(() => {
      if (!running || active < 0) return;
      cells[active].classList.remove("active");
      active = -1;
      miss("Too slow");
    }, windowMs);
  }

  function miss(reason) {
    if (!running) return;
    streak = 0;
    setTime(timeLeft - 2);
    paintHUD();
    if (statusEl) statusEl.textContent = `${reason} — 2s lost`;
    document.body.classList.add("signal-miss");
    setTimeout(() => document.body.classList.remove("signal-miss"), 220);
    beep(150, 0.12);
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    nextTimer = setTimeout(nextSignal, 330);
  }

  function hit(index) {
    if (!running || index !== active) {
      if (running) miss("Wrong cell");
      return;
    }
    clearSignal();
    score += 1;
    streak += 1;
    if (score > best) {
      best = score;
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch {
        /* ignore */
      }
    }
    cells[index].classList.add("hit");
    setTimeout(() => cells[index].classList.remove("hit"), 260);
    beep(880 + Math.min(streak, 10) * 45, 0.07);
    if (statusEl) statusEl.textContent = `Signal ${score} — nice.`;
    paintHUD();
    nextTimer = setTimeout(nextSignal, 180);
  }

  function endGame() {
    if (!running) return;
    running = false;
    clearSignal();
    clearTimeout(nextTimer);
    clearInterval(tickTimer);
    tickTimer = 0;
    setTime(0);
    paintHUD();
    if (statusEl) statusEl.textContent = `Signal lost at ${score}. Press play to retune.`;
    if (overlay) {
      overlay.classList.remove("hidden");
      const kicker = overlay.querySelector(".overlay-kicker");
      const title = overlay.querySelector("strong");
      const copy = overlay.querySelector("p");
      const button = overlay.querySelector("button");
      if (kicker) kicker.textContent = "Run complete";
      if (title) title.textContent = score > 0 ? `${score} signals caught.` : "Signal lost.";
      if (copy) copy.innerHTML = `Best run: <strong>${best}</strong><br>Thirty seconds is a long time.`;
      if (button) button.textContent = "Play again";
    }
    if (startBtn) startBtn.textContent = "Restart";
    beep(220, 0.18);
    setTimeout(() => beep(330, 0.22), 120);
  }

  function start() {
    running = true;
    score = 0;
    streak = 0;
    setTime(GAME_SECONDS);
    paintHUD();
    if (overlay) overlay.classList.add("hidden");
    if (statusEl) statusEl.textContent = "Signal live — click the lit cell.";
    if (startBtn) startBtn.textContent = "Restart";
    clearTimeout(nextTimer);
    clearSignal();
    clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      if (!running) return;
      setTime(timeLeft - 0.1);
      if (timeLeft <= 0) endGame();
    }, 100);
    beep(420, 0.08);
    nextTimer = setTimeout(nextSignal, 360);
  }

  startBtn?.addEventListener("click", start);
  overlayStart?.addEventListener("click", start);
})();

