const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const introPending = document.documentElement.classList.contains("intro-pending");
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

if (introPending) {
  try {
    window.sessionStorage.setItem("hopper-intro", "seen");
  } catch {
    /* session storage can be unavailable; the intro still finishes on its own */
  }
}

const intro = $("[data-intro]");

if (intro && introPending) {
  const finishIntro = () => {
    intro.hidden = true;
  };
  const topPanel = $(".intro__panel--top", intro);
  topPanel?.addEventListener(
    "animationend",
    (event) => {
      if (event.animationName === "intro-lift-top") finishIntro();
    },
    { once: true }
  );
  window.setTimeout(finishIntro, 2100);
}

/* ------------------------------------------------------------------ header */

const header = $("[data-header]");
const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

/* -------------------------------------------------------------- mobile nav */

const mobileNav = $("#mobileNav");
const navToggle = $("[data-nav-toggle]");

if (mobileNav && navToggle) {
  const closeNav = () => {
    if (mobileNav.open) mobileNav.close();
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  };

  navToggle.addEventListener("click", () => {
    if (typeof mobileNav.showModal !== "function") return;
    mobileNav.showModal();
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  });

  $("[data-nav-close]")?.addEventListener("click", closeNav);
  mobileNav.addEventListener("click", (event) => {
    if (event.target === mobileNav) closeNav();
  });
  mobileNav.addEventListener("close", () => {
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  });
  $$("a", mobileNav).forEach((link) => link.addEventListener("click", closeNav));
}

/* ------------------------------------------------------------- hero machine */

const machineStage = $("[data-machine-stage]");
const machineTilt = $("[data-machine-tilt]");
const machine = $(".machine");
const outputChip = $("[data-output-chip]");

const formats = {
  mp4: { name: "MP4", meta: "H.264 + AAC · video", kind: "video" },
  webm: { name: "WebM", meta: "VP8 + Vorbis · video", kind: "video" },
  mp3: { name: "MP3", meta: "MPEG audio · audio", kind: "audio" },
  m4a: { name: "M4A", meta: "AAC · audio", kind: "audio" },
};

let currentFormat = "mp4";
let machineBusy = false;

const outputName = $("[data-output-name]");
const outputMeta = $("[data-output-meta]");
const outputVideoIcon = $("[data-output-icon='video']");
const outputAudioIcon = $("[data-output-icon='audio']");

function updateOutput(formatKey) {
  const format = formats[formatKey] || formats.mp4;
  if (outputName) outputName.textContent = format.name;
  if (outputMeta) outputMeta.textContent = format.meta;
  if (outputVideoIcon) outputVideoIcon.hidden = format.kind !== "video";
  if (outputAudioIcon) outputAudioIcon.hidden = format.kind !== "audio";
}

function setFormat(formatKey) {
  if (!formats[formatKey]) return;
  currentFormat = formatKey;
  $$("[data-hero-format]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.heroFormat === formatKey));
  });
  if (!machineBusy) updateOutput(formatKey);
}

$$("[data-hero-format]").forEach((button) => {
  button.addEventListener("click", () => setFormat(button.dataset.heroFormat));
});

function runMachine(source) {
  if (machineBusy) return;
  machineBusy = true;

  if (source) {
    source.classList.add("is-sending");
    window.setTimeout(() => source.classList.remove("is-sending"), 520);
  }

  if (!outputChip) {
    machineBusy = false;
    return;
  }

  if (reduceMotion) {
    updateOutput(currentFormat);
    machineBusy = false;
    return;
  }

  outputChip.classList.add("is-working");
  if (outputName) outputName.textContent = "Working…";
  if (outputMeta) outputMeta.textContent = "Preparing locally";
  machine?.classList.add("is-processing");

  window.setTimeout(() => {
    outputChip.classList.remove("is-working");
    machine?.classList.remove("is-processing");
    updateOutput(currentFormat);
    outputChip.classList.add("is-fresh");
    window.setTimeout(() => outputChip.classList.remove("is-fresh"), 650);
    machineBusy = false;
  }, 900);
}

if (machineStage) {
  $$("[data-depth]", machineStage).forEach((layer) => {
    const depth = Number(layer.getAttribute("data-depth"));
    if (Number.isFinite(depth)) layer.style.setProperty("--depth", `${depth}px`);
  });
}

if (machineStage && machineTilt && !reduceMotion && finePointer) {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let frame = 0;
  let orbit = null;
  let orbitX = 0;
  let orbitY = 0;

  const tick = () => {
    currentX += (targetX - currentX) * 0.11;
    currentY += (targetY - currentY) * 0.11;
    machineStage.style.setProperty("--scene-x", currentX.toFixed(3));
    machineStage.style.setProperty("--scene-y", currentY.toFixed(3));
    machineStage.style.setProperty("--tilt-x", currentX.toFixed(3));
    machineStage.style.setProperty("--tilt-y", currentY.toFixed(3));
    machineStage.style.setProperty("--sheen-x", `${(50 + currentX * 32).toFixed(1)}%`);
    machineStage.style.setProperty("--sheen-y", `${(44 + currentY * 28).toFixed(1)}%`);
    frame = window.requestAnimationFrame(tick);
  };

  const start = () => {
    if (!frame) frame = window.requestAnimationFrame(tick);
  };

  machineStage.addEventListener("pointermove", (event) => {
    const rect = machineStage.getBoundingClientRect();
    targetX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    targetY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    start();
  });

  machineStage.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    start();
  });

  machineTilt.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.pointerType === "touch") return;
    orbit = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: orbitX,
      baseY: orbitY,
    };
    machineStage.classList.add("is-orbiting");
    try {
      machineTilt.setPointerCapture(event.pointerId);
    } catch {
      /* synthetic or unsupported pointer capture */
    }
  });

  machineTilt.addEventListener("pointermove", (event) => {
    if (!orbit || event.pointerId !== orbit.pointerId) return;
    const dx = event.clientX - orbit.startX;
    const dy = event.clientY - orbit.startY;
    orbitX = clamp(orbit.baseX + dx * 0.12, -26, 26);
    orbitY = clamp(orbit.baseY - dy * 0.08, -11, 11);
    machineStage.style.setProperty("--orbit-x", orbitX.toFixed(2));
    machineStage.style.setProperty("--orbit-y", orbitY.toFixed(2));
  });

  const endOrbit = (event) => {
    if (!orbit) return;
    orbit = null;
    machineStage.classList.remove("is-orbiting");
    try {
      machineTilt.releasePointerCapture(event.pointerId);
    } catch {
      /* the pointer was already released */
    }
    orbitX = 0;
    orbitY = 0;
    machineStage.style.setProperty("--orbit-x", "0");
    machineStage.style.setProperty("--orbit-y", "0");
  };

  machineTilt.addEventListener("pointerup", endOrbit);
  machineTilt.addEventListener("pointercancel", endOrbit);
}

/* ------------------------------------------------------------- auto-detect */

const detectCard = $("[data-detect-demo]");
const detectTitle = $("[data-detect-title]");
const detectMeta = $("[data-detect-meta]");
const detectBadge = $("[data-detect-badge]");
let detectTimer = 0;
let detectStartTimer = 0;

function setDetectState(state) {
  if (!detectCard) return;
  detectCard.classList.toggle("is-scanning", state === "scanning");
  detectCard.classList.toggle("is-found", state === "found");
  if (detectTitle) detectTitle.textContent = state === "scanning" ? "Scanning page" : "Video found";
  if (detectMeta) detectMeta.textContent = state === "scanning" ? "Looking in your open tab" : "MP4 · ready to save";
  if (detectBadge) detectBadge.textContent = state === "scanning" ? "Scanning" : "Ready";
}

function playDetect() {
  if (!detectCard) return;
  window.clearTimeout(detectTimer);
  window.clearTimeout(detectStartTimer);

  if (reduceMotion) {
    setDetectState("found");
    runMachine(null);
    return;
  }

  setDetectState("scanning");
  detectTimer = window.setTimeout(() => {
    setDetectState("found");
    runMachine(null);
  }, 1250);
}

if (detectCard) {
  detectCard.addEventListener("click", playDetect);
  if (!reduceMotion) {
      detectStartTimer = window.setTimeout(playDetect, introPending ? 2600 : 1200);
    }
}

let dragState = null;
let suppressClick = false;

function isOverMachine(x, y) {
  if (!machine) return false;
  const rect = machine.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

$$("[data-file-chip]").forEach((chip) => {
  chip.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const rect = chip.getBoundingClientRect();
    dragState = {
      chip,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rect,
      active: false,
      clone: null,
    };
    chip.setPointerCapture?.(event.pointerId);
  });

  chip.addEventListener("pointermove", (event) => {
    if (!dragState || dragState.chip !== chip || dragState.pointerId !== event.pointerId) return;
    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;

    if (!dragState.active && Math.hypot(dx, dy) < 7) return;

    if (!dragState.active) {
      dragState.active = true;
      suppressClick = true;
      const clone = chip.cloneNode(true);
      clone.classList.add("is-dragging");
      clone.removeAttribute("data-file-chip");
      clone.style.width = `${dragState.rect.width}px`;
      clone.style.height = `${dragState.rect.height}px`;
      clone.style.left = `${dragState.rect.left}px`;
      clone.style.top = `${dragState.rect.top}px`;
      document.body.appendChild(clone);
      dragState.clone = clone;
      chip.style.opacity = "0.28";
    }

    dragState.clone.style.left = `${dragState.rect.left + dx}px`;
    dragState.clone.style.top = `${dragState.rect.top + dy}px`;
    machine?.classList.toggle("is-over", isOverMachine(event.clientX, event.clientY));
  });

  const endDrag = (event) => {
    if (!dragState || dragState.chip !== chip) return;
    const wasActive = dragState.active;
    const dropped = wasActive && isOverMachine(event.clientX, event.clientY);

    dragState.clone?.remove();
    chip.style.opacity = "";
    machine?.classList.remove("is-over");
    dragState = null;

    if (wasActive) {
      event.preventDefault();
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
      if (dropped) runMachine(chip);
    }
  };

  chip.addEventListener("pointerup", endDrag);
  chip.addEventListener("pointercancel", endDrag);
  chip.addEventListener("click", (event) => {
    if (suppressClick) {
      event.preventDefault();
      return;
    }
    runMachine(chip);
  });
});

/* --------------------------------------------------------------- format lab */

const labFormats = {
  mp4: {
    label: "MP4",
    codec: "H.264 + AAC",
    use: "A dependable video file for sharing, archiving, and playback.",
    accent: "#2457ff",
    bars: [34, 52, 41, 68, 57, 76, 49, 83, 62, 71, 55, 88, 66, 74, 58, 92, 63, 79, 51, 84, 59, 73, 47, 81, 56, 69, 44, 77],
  },
  webm: {
    label: "WebM",
    codec: "VP8 + Vorbis",
    use: "A smaller video file for the web and modern players.",
    accent: "#21c7d9",
    bars: [28, 44, 36, 58, 49, 66, 42, 72, 53, 61, 47, 76, 57, 64, 50, 80, 54, 68, 45, 73, 52, 63, 41, 70, 48, 60, 38, 66],
  },
  mp3: {
    label: "MP3",
    codec: "MPEG audio",
    use: "Audio that plays almost anywhere, at a size that travels well.",
    accent: "#ff9e2c",
    bars: [40, 58, 46, 72, 62, 80, 55, 86, 68, 76, 60, 90, 70, 82, 64, 94, 72, 86, 58, 88, 66, 80, 54, 84, 62, 76, 50, 82],
  },
  m4a: {
    label: "M4A",
    codec: "AAC",
    use: "Clean audio in a compact MP4 container.",
    accent: "#7c5cfc",
    bars: [32, 50, 42, 64, 54, 72, 47, 78, 60, 68, 52, 82, 63, 70, 56, 86, 61, 74, 49, 80, 58, 68, 45, 76, 52, 66, 43, 72],
  },
};

const labOrder = ["mp4", "webm", "mp3", "m4a"];
const formatStage = $("[data-format-stage]");
const formatCards = $$("[data-format-card]");
const formatReadout = $("[data-format-readout]");

formatCards.forEach((card) => {
  const key = card.dataset.formatCard;
  const format = labFormats[key];
  const bars = $("[data-card-bars]", card);
  if (!format || !bars || bars.children.length) return;
  format.bars.forEach((value, index) => {
    const bar = document.createElement("span");
    bar.style.height = `${value}%`;
    bar.style.setProperty("--i", String(index));
    bars.appendChild(bar);
  });
});

let labIndex = 0;

function setLab(formatKey) {
  const format = labFormats[formatKey];
  const index = labOrder.indexOf(formatKey);
  if (!format || index < 0) return;
  labIndex = index;

  formatCards.forEach((card, cardIndex) => {
    const offset = (cardIndex - index + labOrder.length) % labOrder.length;
    let position = "back";
    if (offset === 0) position = "active";
    else if (offset === 1) position = "next";
    else if (offset === labOrder.length - 1) position = "prev";
    card.dataset.position = position;
    card.setAttribute("aria-hidden", String(position !== "active"));
  });

  $$("[data-lab-format]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.labFormat === formatKey));
  });

  if (formatReadout) {
    formatReadout.textContent = `${format.label}. ${format.codec}. ${format.use}`;
  }
  formatStage?.style.setProperty("--lab-accent", format.accent);
}

$$("[data-lab-format]").forEach((button) => {
  button.addEventListener("click", () => setLab(button.dataset.labFormat));
});

if (formatStage) {
  let lastCardDragAt = -1000;

  formatStage.addEventListener("click", (event) => {
    if (performance.now() - lastCardDragAt < 260) return;
    const card = event.target.closest("[data-format-card]");
    if (!card || card.dataset.position === "active") return;
    setLab(card.dataset.formatCard);
  });

  if (!reduceMotion) {
    let drag = null;
    let dragX = 0;

    const applyDrag = (dx) => {
      formatStage.style.setProperty("--drag-x", `${dx.toFixed(1)}px`);
      formatStage.style.setProperty("--drag-rotate", `${Math.max(-7, Math.min(7, dx * -0.035)).toFixed(2)}deg`);
    };

    formatStage.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest("button")) return;
      drag = { pointerId: event.pointerId, startX: event.clientX, moved: false };
      dragX = 0;
      formatStage.classList.add("is-dragging");
      try {
        formatStage.setPointerCapture(event.pointerId);
      } catch {
        /* synthetic or unsupported pointer capture */
      }
    });

    formatStage.addEventListener("pointermove", (event) => {
      if (drag) {
        if (event.pointerId !== drag.pointerId) return;
        dragX = event.clientX - drag.startX;
        if (Math.abs(dragX) > 6) drag.moved = true;
        applyDrag(dragX);
        return;
      }

      const rect = formatStage.getBoundingClientRect();
      const x = Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5));
      const y = Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5));
      formatStage.style.setProperty("--deck-ry", `${(x * 8).toFixed(2)}deg`);
      formatStage.style.setProperty("--deck-rx", `${(-y * 6).toFixed(2)}deg`);
    });

    const endDrag = (event) => {
      if (!drag) return;
      const { moved, pointerId } = drag;
      const distance = dragX;
      drag = null;
      dragX = 0;
      formatStage.classList.remove("is-dragging");
      try {
        if (formatStage.hasPointerCapture(pointerId)) {
          formatStage.releasePointerCapture(pointerId);
        }
      } catch {
        /* the pointer was already released */
      }
      applyDrag(0);
      if (!moved) return;
      lastCardDragAt = performance.now();
      if (distance < -46) setLab(labOrder[(labIndex + 1) % labOrder.length]);
      else if (distance > 46) setLab(labOrder[(labIndex - 1 + labOrder.length) % labOrder.length]);
    };

    formatStage.addEventListener("pointerup", endDrag);
    formatStage.addEventListener("pointercancel", endDrag);
    formatStage.addEventListener("pointerleave", () => {
      if (drag) return;
      formatStage.style.setProperty("--deck-ry", "0deg");
      formatStage.style.setProperty("--deck-rx", "0deg");
    });
  }
}

/* ------------------------------------------------------------- web download */

const webFlow = $("[data-web-flow]");

if (webFlow) {
  const webProgress = $("[data-web-progress]", webFlow);
  const webState = $("[data-web-state]", webFlow);
  const webReplay = $("[data-web-replay]", webFlow);
  let webTimers = [];
  let webVisible = false;

  const clearWebTimers = () => {
    webTimers.forEach((timer) => window.clearTimeout(timer));
    webTimers = [];
  };

  const later = (ms, fn) => {
    webTimers.push(window.setTimeout(fn, ms));
  };

  const setWebState = (state) => {
    if (webState) webState.textContent = state;
  };

  const resetWebProgress = () => {
    if (!webProgress) return;
    webProgress.style.transition = "none";
    webProgress.style.width = "0%";
    void webProgress.offsetWidth;
    webProgress.style.transition = "";
  };

  const resetWebFlow = () => {
    clearWebTimers();
    webFlow.classList.remove("is-scanning", "is-found", "is-saving", "is-saved");
    setWebState("Waiting");
    resetWebProgress();
  };

  const runWebFlow = () => {
    clearWebTimers();
    webFlow.classList.remove("is-found", "is-saving", "is-saved");
    webFlow.classList.add("is-scanning");
    setWebState("Detecting");
    resetWebProgress();

    later(1200, () => {
      webFlow.classList.remove("is-scanning");
      webFlow.classList.add("is-found");
      setWebState("Found");
    });

    later(1550, () => {
      webFlow.classList.add("is-saving");
      setWebState("Downloading");
      window.requestAnimationFrame(() => {
        if (webProgress) webProgress.style.width = "100%";
      });
    });

    later(2950, () => {
      webFlow.classList.remove("is-saving");
      webFlow.classList.add("is-saved");
      setWebState("Saved");
    });

    later(5600, () => {
      if (webVisible) runWebFlow();
    });
  };

  if (reduceMotion) {
    webFlow.classList.add("is-found", "is-saved");
    setWebState("Saved");
    if (webProgress) webProgress.style.width = "100%";
  } else if ("IntersectionObserver" in window) {
    const webObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (webVisible) return;
            webVisible = true;
            runWebFlow();
          } else {
            webVisible = false;
            resetWebFlow();
          }
        });
      },
      { threshold: 0.32 }
    );
    webObserver.observe(webFlow);
  } else {
    webVisible = true;
    runWebFlow();
  }

  webReplay?.addEventListener("click", () => {
    webVisible = true;
    runWebFlow();
  });
}

/* ----------------------------------------------------------------- reveals */

const revealItems = $$(".reveal");

$$("[data-reveal-group]").forEach((group) => {
  $$(".reveal", group).forEach((item, index) => {
    item.style.setProperty("--delay", `${Math.min(index * 70, 280)}ms`);
  });
});

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-in"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  revealItems.forEach((item) => observer.observe(item));
}

/* ------------------------------------------------------------- copy buttons */

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    area.remove();
    return copied;
  }
}

$$("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.getAttribute("data-copy");
    if (!text) return;
    const original = button.textContent;
    const copied = await copyText(text);
    button.textContent = copied ? "Copied" : "Select";
    button.classList.toggle("is-copied", copied);
    window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove("is-copied");
    }, 1600);
  });
});

/* ------------------------------------------------------------ gallery viewer */

const shotDialog = $("[data-shot-dialog]");

if (shotDialog) {
  const shotImage = $("[data-shot-image]", shotDialog);
  const shotCaption = $("[data-shot-caption]", shotDialog);
  const shotClose = $("[data-shot-close]", shotDialog);
  let shotTrigger = null;

  $$("[data-shot]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const image = $("img", trigger);
      shotTrigger = trigger;
      if (shotImage) {
        shotImage.src = trigger.dataset.shot;
        shotImage.alt = image?.alt || "";
      }
      if (shotCaption) shotCaption.textContent = trigger.dataset.shotCaption || "";
      if (typeof shotDialog.showModal === "function" && !shotDialog.open) {
        shotDialog.showModal();
      } else {
        shotDialog.setAttribute("open", "");
      }
      shotClose?.focus();
    });
  });

  shotClose?.addEventListener("click", () => shotDialog.close());
  shotDialog.addEventListener("click", (event) => {
    if (event.target === shotDialog) shotDialog.close();
  });
  shotDialog.addEventListener("close", () => {
    shotTrigger?.focus();
    shotTrigger = null;
  });
}

/* ---------------------------------------------------------- pointer accents */

if (finePointer && !reduceMotion) {
  $$(".button").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty("--mx", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
      button.style.setProperty("--my", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
    });
  });

  $$(".gallery-frame").forEach((frame) => {
    frame.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const rect = frame.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      frame.style.setProperty("--shot-ry", `${((x - 0.5) * 7).toFixed(2)}deg`);
      frame.style.setProperty("--shot-rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
      frame.style.setProperty("--shot-x", `${(x * 100).toFixed(1)}%`);
      frame.style.setProperty("--shot-y", `${(y * 100).toFixed(1)}%`);
    });

    frame.addEventListener("pointerleave", () => {
      frame.style.setProperty("--shot-ry", "0deg");
      frame.style.setProperty("--shot-rx", "0deg");
      frame.style.setProperty("--shot-x", "50%");
      frame.style.setProperty("--shot-y", "50%");
    });
  });
}

/* ------------------------------------------------------------- scroll progress */

const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
progressBar.setAttribute("aria-hidden", "true");
progressBar.innerHTML = "<i></i>";
document.body.appendChild(progressBar);

const progressFill = progressBar.firstElementChild;
let progressQueued = false;

const drawProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  if (progressFill) progressFill.style.transform = `scaleX(${ratio.toFixed(4)})`;
  progressQueued = false;
};

const queueProgress = () => {
  if (progressQueued) return;
  progressQueued = true;
  window.requestAnimationFrame(drawProgress);
};

window.addEventListener("scroll", queueProgress, { passive: true });
window.addEventListener("resize", queueProgress);
drawProgress();

/* ---------------------------------------------------------------- page init */

updateOutput(currentFormat);
setLab("mp4");
