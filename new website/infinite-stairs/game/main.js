(() => {
  "use strict";

  const RIV_URL = "assets/infinite_stairs.riv?v=2026-10-13b"; // change the stamp after each rebuild so browsers fetch the new file
  const MUSIC_VOLUME = 0.16; // the song stays quiet under the game
  const SFX_VOLUME = 0.5;
  const GAME_SIZE = 1080; // the Game artboard is 1080 x 1080
  const SWIPE_MIN = 60; // TUNING.SWIPE_MIN_PX in game.luau, in artboard units

  const app = document.getElementById("app");
  const gameCanvas = document.getElementById("game");
  const marcCanvas = document.getElementById("marc");
  const logoCanvas = document.getElementById("logo");
  const loaderBar = document.getElementById("loaderBar");
  const loaderPct = document.getElementById("loaderPct");
  const loaderTitle = document.querySelector(".loader-title");
  const music = document.getElementById("music");
  const musicBtn = document.getElementById("musicBtn");
  const sfxBtn = document.getElementById("sfxBtn");

  // ───────────── Preferences ─────────────

  const prefs = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : v === "1";
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value ? "1" : "0");
      } catch (e) {
        /* private mode: the choice lasts until the page closes */
      }
    },
  };

  let musicOn = prefs.get("is.music", true);
  let sfxOn = prefs.get("is.sfx", true);

  // ───────────── Sound ─────────────

  let actx = null;
  let sfxBus = null;

  function audio() {
    if (!actx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      actx = new Ctx();
      sfxBus = actx.createGain();
      sfxBus.gain.value = SFX_VOLUME;
      sfxBus.connect(actx.destination);
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }

  function envelope(a, t, peak, attack, release) {
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
    g.connect(sfxBus);
    return g;
  }

  // A short rising blip.
  function sfxJump() {
    if (!sfxOn) return;
    const a = audio();
    if (!a) return;
    const t = a.currentTime;
    const osc = a.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.11);
    const lp = a.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2200;
    osc.connect(lp);
    lp.connect(envelope(a, t, 0.13, 0.008, 0.15));
    osc.start(t);
    osc.stop(t + 0.18);
  }

  let noiseBuffer = null;
  function noise(a) {
    if (!noiseBuffer) {
      const len = Math.floor(a.sampleRate * 0.5);
      noiseBuffer = a.createBuffer(1, len, a.sampleRate);
      const d = noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = a.createBufferSource();
    src.buffer = noiseBuffer;
    return src;
  }

  // A crunch, a thud and a few bones clattering.
  function sfxBreak() {
    if (!sfxOn) return;
    const a = audio();
    if (!a) return;
    const t = a.currentTime;

    const crunch = noise(a);
    const bp = a.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(2400, t);
    bp.frequency.exponentialRampToValueAtTime(320, t + 0.3);
    crunch.connect(bp);
    bp.connect(envelope(a, t, 0.5, 0.004, 0.3));
    crunch.start(t);
    crunch.stop(t + 0.36);

    const thud = a.createOscillator();
    thud.type = "sine";
    thud.frequency.setValueAtTime(150, t);
    thud.frequency.exponentialRampToValueAtTime(45, t + 0.2);
    thud.connect(envelope(a, t, 0.45, 0.005, 0.22));
    thud.start(t);
    thud.stop(t + 0.25);

    for (let i = 0; i < 4; i++) {
      const at = t + 0.05 + i * 0.045 + Math.random() * 0.03;
      const click = a.createOscillator();
      click.type = "triangle";
      click.frequency.setValueAtTime(900 + Math.random() * 900, at);
      click.connect(envelope(a, at, 0.12, 0.002, 0.04));
      click.start(at);
      click.stop(at + 0.06);
    }
  }

  // A thump, then three falling notes: the classic "you lost".
  function sfxDeath() {
    if (!sfxOn) return;
    const a = audio();
    if (!a) return;
    const t = a.currentTime;

    const thud = a.createOscillator();
    thud.type = "sine";
    thud.frequency.setValueAtTime(120, t);
    thud.frequency.exponentialRampToValueAtTime(40, t + 0.25);
    thud.connect(envelope(a, t, 0.5, 0.005, 0.3));
    thud.start(t);
    thud.stop(t + 0.32);

    const notes = [392, 330, 262]; // G, E, C
    notes.forEach((freq, i) => {
      const at = t + 0.18 + i * 0.2;
      const last = i === notes.length - 1;
      const osc = a.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, at);
      if (last) osc.frequency.exponentialRampToValueAtTime(freq * 0.84, at + 0.6);
      const lp = a.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1800;
      osc.connect(lp);
      lp.connect(envelope(a, at, 0.22, 0.01, last ? 0.65 : 0.17));
      osc.start(at);
      osc.stop(at + (last ? 0.7 : 0.2));
    });
  }

  function playMusic() {
    if (!musicOn) return;
    music.volume = MUSIC_VOLUME;
    const p = music.play();
    if (p && p.catch) p.catch(() => {});
  }

  function syncButtons() {
    musicBtn.setAttribute("aria-pressed", String(musicOn));
    sfxBtn.setAttribute("aria-pressed", String(sfxOn));
  }

  musicBtn.addEventListener("click", () => {
    musicOn = !musicOn;
    prefs.set("is.music", musicOn);
    if (musicOn) playMusic();
    else music.pause();
    syncButtons();
  });

  sfxBtn.addEventListener("click", () => {
    sfxOn = !sfxOn;
    prefs.set("is.sfx", sfxOn);
    syncButtons();
    if (sfxOn) sfxJump();
  });

  syncButtons();

  // Browsers only start sound after the visitor does something.
  let unlocked = false;
  function unlockAudio() {
    if (unlocked) return;
    unlocked = true;
    audio();
    playMusic();
  }
  ["pointerdown", "keydown", "touchend"].forEach((type) =>
    window.addEventListener(type, unlockAudio, { capture: true, passive: true })
  );

  // ───────────── Loading ─────────────

  function setProgress(f) {
    const pct = Math.round(Math.max(0, Math.min(1, f)) * 100);
    loaderBar.style.width = pct + "%";
    loaderPct.textContent = pct + "%";
  }

  function fail(message) {
    app.dataset.state = "error";
    loaderTitle.textContent = message;
    console.error("[site]", message);
  }

  async function fetchBytes(url, onProgress) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url + ": " + res.status);
    const total = Number(res.headers.get("content-length")) || 6.5e6;
    if (!res.body || !res.body.getReader) {
      const buf = await res.arrayBuffer();
      onProgress(1);
      return buf;
    }
    const reader = res.body.getReader();
    const chunks = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      got += value.length;
      onProgress(Math.min(0.97, got / total));
    }
    const out = new Uint8Array(got);
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.length;
    }
    return out.buffer;
  }

  function hasWebGL2() {
    try {
      return !!document.createElement("canvas").getContext("webgl2");
    } catch (e) {
      return false;
    }
  }

  // ───────────── Rive ─────────────

  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  let game = null;
  let vm = null;
  const sideInstances = [];

  function layout() {
    return new rive.Layout({ fit: rive.Fit.Contain, alignment: rive.Alignment.Center });
  }

  function watchSize(canvas, getInstance) {
    const ro = new ResizeObserver(() => {
      const inst = getInstance();
      if (inst) inst.resizeDrawingSurfaceToCanvas(dpr());
    });
    ro.observe(canvas);
  }

  function makeArt(canvas, artboard, bytes) {
    const inst = new rive.Rive({
      buffer: bytes,
      canvas,
      artboard,
      autoplay: true,
      layout: layout(),
      shouldDisableRiveListeners: true,
      onLoad: () => inst.resizeDrawingSurfaceToCanvas(dpr()),
      onLoadError: (e) => console.warn("[site] " + artboard + " did not load", e),
    });
    sideInstances.push(inst);
    watchSize(canvas, () => inst);
    return inst;
  }

  async function start() {
    if (!hasWebGL2()) {
      fail("This tower needs a browser with WebGL 2");
      return;
    }
    rive.RuntimeLoader.setWasmUrl("vendor/rive.wasm");

    let bytes;
    try {
      bytes = await fetchBytes(RIV_URL, setProgress);
    } catch (e) {
      fail("The tower did not load. Try reloading the page");
      return;
    }

    // The frame and the logo come from the same file as the game.
    makeArt(marcCanvas, "marc", bytes.slice(0));
    makeArt(logoCanvas, "logo", bytes.slice(0));

    game = new rive.Rive({
      buffer: bytes,
      canvas: gameCanvas,
      artboard: "Game",
      stateMachines: "Game SM",
      autoplay: true,
      autoBind: true,
      enableGPUCanvas: true, // the 3D stairs are drawn with WGSL shaders
      useOffscreenRenderer: false,
      layout: layout(),
      onLoad: onGameLoad,
      onLoadError: () => fail("The tower did not load. Try reloading the page"),
    });
    watchSize(gameCanvas, () => game);
  }

  function onGameLoad() {
    game.resizeDrawingSurfaceToCanvas(dpr());
    vm = game.viewModelInstance;
    if (!vm) {
      fail("The tower did not load. Try reloading the page");
      return;
    }
    setProgress(1);
    // Give the script a moment to build the scene before lifting the curtain.
    setTimeout(() => {
      app.dataset.state = "ready";
    }, 350);
    setInterval(poll, 80);
  }

  // ───────────── Game state ─────────────

  let state = "ready";
  let lastBeaten = 0;
  let gameOverAt = 0;

  function readState() {
    try {
      return vm ? vm.enum("state").value : "ready";
    } catch (e) {
      return state;
    }
  }

  function poll() {
    const s = readState();
    if (s !== state) {
      if (s === "game_over") {
        gameOverAt = performance.now();
        sfxDeath();
      }
      state = s;
      app.dataset.game = s;
    }
    let beaten = lastBeaten;
    try {
      beaten = vm.number("beaten").value;
    } catch (e) {
      /* no such property in this build */
    }
    if (beaten > lastBeaten) sfxBreak();
    lastBeaten = beaten;
  }

  function fire(name) {
    if (!vm) return;
    try {
      vm.trigger(name).trigger();
    } catch (e) {
      console.warn("[site] no trigger " + name);
    }
  }

  // One entry point for keys and buttons.
  function act(action) {
    if (!vm) return;
    state = readState();
    if (action === "pause") {
      if (state === "playing" || state === "paused") fire("pause");
      return;
    }
    if (action === "restart") {
      if (state !== "playing") fire("restart");
      return;
    }
    if (state === "ready") {
      fire("restart"); // any move starts the climb
      return;
    }
    if (state === "game_over") {
      // A short wait, so a key still held from the fall does not restart at once.
      if (performance.now() - gameOverAt > 700) fire("restart");
      return;
    }
    if (state !== "playing") return;
    fire(action);
    if (action === "jump") sfxJump();
  }

  // ───────────── Keyboard ─────────────

  const KEYS = {
    ArrowUp: "jump",
    KeyW: "jump",
    Space: "jump",
    ArrowDown: "crouch",
    KeyS: "crouch",
    ArrowRight: "attack",
    KeyD: "attack",
    KeyJ: "attack",
    Escape: "pause",
    Enter: "restart",
    NumpadEnter: "restart",
  };

  window.addEventListener("keydown", (e) => {
    const action = KEYS[e.code];
    if (!action || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    // Space and Enter on a focused button press the button.
    if (t && t.closest && t.closest("button, a, input, textarea") && (e.code === "Space" || e.code.endsWith("Enter"))) return;
    e.preventDefault();
    if (e.repeat) return;
    act(action);
  });

  // ───────────── Touch and mouse on the game ─────────────

  // The game reads swipes and taps itself; the page only adds the jump sound.
  let downY = null;
  gameCanvas.addEventListener("pointerdown", (e) => {
    downY = e.clientY;
  }, { passive: true });
  gameCanvas.addEventListener("pointerup", (e) => {
    if (downY === null) return;
    const scale = GAME_SIZE / gameCanvas.clientWidth;
    const dy = (e.clientY - downY) * scale;
    downY = null;
    if (state === "playing" && dy <= -SWIPE_MIN) sfxJump();
  }, { passive: true });
  gameCanvas.addEventListener("contextmenu", (e) => e.preventDefault());

  // ───────────── On-screen buttons ─────────────

  document.querySelectorAll(".pad-btn").forEach((btn) => {
    const action = btn.dataset.action;
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      btn.classList.add("is-down");
      act(action);
    });
    const up = () => btn.classList.remove("is-down");
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("pointerleave", up);
    // Keyboard activation of the button (pointer presses are handled above).
    btn.addEventListener("click", (e) => {
      if (e.detail === 0) act(action);
    });
  });

  // ───────────── Leaving the tab ─────────────

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (readState() === "playing") fire("pause");
      music.pause();
    } else if (unlocked) {
      playMusic();
    }
  });

  start();
})();
