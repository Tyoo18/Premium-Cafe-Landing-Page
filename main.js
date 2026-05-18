// Real Audio Generation Script (Procedural Web Audio API to play comforting coffee house vibe)

let audioCtx = null;
let rainNode = null;
let crackleNode = null;
let soundEnabled = false;

// Procedural sound generators to stay self-contained
function createWhiteNoiseBuffer(ctx, duration) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function initAmbientSound() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // --- RAIN NODE SETUP (Muted low rumble white noise) ---
    const rainSource = audioCtx.createBufferSource();
    rainSource.buffer = createWhiteNoiseBuffer(audioCtx, 4);
    rainSource.loop = true;

    const rainFilter = audioCtx.createBiquadFilter();
    rainFilter.type = "lowpass";
    rainFilter.frequency.setValueAtTime(320, audioCtx.currentTime); // Deep rumbling rain

    const rainGain = audioCtx.createGain();
    rainGain.gain.setValueAtTime(0.18, audioCtx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(audioCtx.destination);
    rainNode = rainSource;

    // --- VINYL CRACKLE NODE SETUP (Comforting vintage noise) ---
    const crackleSource = audioCtx.createBufferSource();
    crackleSource.buffer = createWhiteNoiseBuffer(audioCtx, 1.5);
    crackleSource.loop = true;

    const crackleFilter = audioCtx.createBiquadFilter();
    crackleFilter.type = "bandpass";
    crackleFilter.frequency.setValueAtTime(4000, audioCtx.currentTime); // High crackle

    const crackleGain = audioCtx.createGain();
    crackleGain.gain.setValueAtTime(0.015, audioCtx.currentTime);

    crackleSource.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(audioCtx.destination);
    crackleNode = crackleSource;
  } catch (e) {
    console.warn(
      "Web Audio API not fully supported or blocked by user parameters",
      e,
    );
  }
}

function toggleAmbientSound() {
  if (!audioCtx) {
    initAmbientSound();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const statusText = document.getElementById("ambient-status");
  const soundDot = document.getElementById("sound-dot");
  const soundPing = document.getElementById("sound-ping");

  if (!soundEnabled) {
    try {
      rainNode.start();
      crackleNode.start();
    } catch (e) {
      // Recreate source if stopped previously
      initAmbientSound();
      rainNode.start();
      crackleNode.start();
    }
    soundEnabled = true;
    statusText.innerText = "Ambient On";
    soundDot.classList.replace("bg-neutral-400", "bg-terracotta");
    soundDot.classList.replace("dark:bg-neutral-600", "bg-terracotta");
    soundPing.classList.remove("hidden");
  } else {
    try {
      rainNode.stop();
      crackleNode.stop();
    } catch (e) {}
    soundEnabled = false;
    statusText.innerText = "Sound Off";
    soundDot.classList.replace("bg-terracotta", "bg-neutral-400");
    soundDot.classList.add("dark:bg-neutral-600");
    soundPing.classList.add("hidden");
  }
}

// --- Dynamic Vibe Switcher Logic ---
let darkVibe = false;
const heroImg = document.getElementById("hero-img");
const vibeLabel = document.getElementById("vibe-label");
const sunIcon = document.getElementById("vibe-icon-sun");
const moonIcon = document.getElementById("vibe-icon-moon");

const vibeImages = {
  light:
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=2000",
  dark: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000",
};

function toggleVibe() {
  darkVibe = !darkVibe;
  if (darkVibe) {
    document.documentElement.classList.add("dark");
    vibeLabel.innerText = "Midnight Jazz";
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
    heroImg.src = vibeImages.dark;
  } else {
    document.documentElement.classList.remove("dark");
    vibeLabel.innerText = "Golden Hour";
    moonIcon.classList.add("hidden");
    sunIcon.classList.remove("hidden");
    heroImg.src = vibeImages.light;
  }
}

// --- Dynamic Map Switcher ---
let currentMapLocation = "kyoto";
const mapQueries = {
  kyoto: "32-1 Gionmachi Minamigawa, Higashiyama Ward, Kyoto",
  brooklyn: "145 Wythe Avenue, Williamsburg, Brooklyn, NY",
};

function switchMapLocation(loc) {
  if (currentMapLocation === loc) return;
  currentMapLocation = loc;

  const iframe = document.getElementById("google-map-iframe");
  const activeTitle = document.getElementById("active-location-title");
  const btnKyoto = document.getElementById("btn-loc-kyoto");
  const btnBrooklyn = document.getElementById("btn-loc-brooklyn");

  // Temporary fade-out animation effect for transition feel
  iframe.style.opacity = "0";

  setTimeout(() => {
    iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(mapQueries[loc])}&t=m&z=15&ie=UTF8&iwloc=&output=embed`;

    if (loc === "kyoto") {
      activeTitle.innerText = "Kyoto Studio";
      btnKyoto.className =
        "w-full text-left p-4 rounded-sm border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 transition-all duration-300 focus:outline-none";
      btnBrooklyn.className =
        "w-full text-left p-4 rounded-sm border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 focus:outline-none";

      btnKyoto.querySelector("h4").innerText = "Kyoto Studio (Active)";
      btnBrooklyn.querySelector("h4").innerText = "Brooklyn Loft";
    } else {
      activeTitle.innerText = "Brooklyn Loft";
      btnBrooklyn.className =
        "w-full text-left p-4 rounded-sm border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 transition-all duration-300 focus:outline-none";
      btnKyoto.className =
        "w-full text-left p-4 rounded-sm border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 focus:outline-none";

      btnBrooklyn.querySelector("h4").innerText = "Brooklyn Loft (Active)";
      btnKyoto.querySelector("h4").innerText = "Kyoto Studio";
    }

    // Fade map back in after sourcing the new embed
    setTimeout(() => {
      iframe.style.opacity = "1";
    }, 150);
  }, 300);
}

// --- Minimal Alert System ---
function showAlert(msg) {
  document.getElementById("alert-message").innerText = msg;
  const modal = document.getElementById("custom-alert");
  modal.classList.remove("opacity-0", "pointer-events-none");
}

function closeAlert() {
  const modal = document.getElementById("custom-alert");
  modal.classList.add("opacity-0", "pointer-events-none");
}

// --- Navigation click auto-scroll offset fix (for precise landing views) ---
document.querySelectorAll("nav a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: "smooth",
      });
    }
  });
});

function simulateMapRoute() {
  const locationName =
    currentMapLocation === "kyoto"
      ? "Tokyo Higashiyama"
      : "Brooklyn Williamsburg";
  showAlert(
    `Routing initialized. Loading our ${locationName} coordinate stream into your navigation deck.`,
  );
}

// --- Dynamic Realtime Open Status ---
function updateOpenStatus() {
  const now = new Date();
  const currentHour = now.getHours();
  const statusText = document.getElementById("status-text");
  const statusIndicator = document.getElementById("status-indicator");

  if (currentHour >= 7 && currentHour < 19) {
    statusText.innerText = "We are open right now. Pull up a stool.";
    statusIndicator.className =
      "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
  } else {
    statusText.innerText = "Quiet hours. Doors open again at 07:00 AM.";
    statusIndicator.className =
      "w-2 h-2 rounded-full bg-amber-500 animate-pulse";
  }
}

window.onload = function () {
  updateOpenStatus();
  setInterval(updateOpenStatus, 60000); // update every minute
};
