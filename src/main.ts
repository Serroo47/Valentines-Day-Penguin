import "./style.css";
import lines from "./lines.json";

const card = document.getElementById("card") as HTMLDivElement;
const content = document.getElementById("content") as HTMLDivElement;
const actions = document.getElementById("actions") as HTMLDivElement;
const tag = document.getElementById("tag") as HTMLDivElement;

const yesBtn = document.getElementById("yesBtn") as HTMLButtonElement;
const noBtn = document.getElementById("noBtn") as HTMLButtonElement;
const lineEl = document.getElementById("line") as HTMLParagraphElement;

let noClicks = 0;
let lastIndex: number | null = null;

const EVADE_START = 15;
let evadeActive = false;

let rafId: number | null = null;
let baseX = 0;
let baseY = 0;

function setLine(text: string) {
  lineEl.textContent = text;
}

function pickRandomNoLine(): string {
  const arr = lines.noLines ?? [];
  if (arr.length === 0) return "…";
  if (arr.length === 1) return arr[0];

  let idx = Math.floor(Math.random() * arr.length);
  while (idx === lastIndex) idx = Math.floor(Math.random() * arr.length);
  lastIndex = idx;
  return arr[idx];
}

function setNoBasePosition(x: number, y: number) {
  baseX = x;
  baseY = y;
  noBtn.style.left = `${baseX}px`;
  noBtn.style.top = `${baseY}px`;
}

function placeNoStaticInitially() {
  // Start: statisch rechts vom Center
  const area = actions.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();

  const y = (area.height - btn.height) / 2;
  const x = (area.width / 2) + 130;

  setNoBasePosition(Math.max(8, x), Math.max(8, y));
}

function moveNoToRandomSpot() {
  const area = actions.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();

  const padding = 8;
  const maxX = Math.max(padding, area.width - btn.width - padding);
  const maxY = Math.max(padding, area.height - btn.height - padding);

  const x = padding + Math.random() * (maxX - padding);
  const y = padding + Math.random() * (maxY - padding);

  setNoBasePosition(x, y);
}

function growYesButton() {
  const scale = 1 + Math.min(noClicks * 0.06, 0.9);
  yesBtn.style.transform = `scale(${scale})`;
}

function startSlideAroundBase() {
  if (rafId !== null) return;

  const amplitude = 12;
  const speed = 0.012;

  const start = performance.now();
  const tick = (now: number) => {
    const t = now - start;

    const dx = Math.sin(t * speed) * amplitude;
    const dy = Math.cos(t * speed * 1.1) * (amplitude * 0.55);

    noBtn.style.left = `${baseX + dx}px`;
    noBtn.style.top = `${baseY + dy}px`;

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
}

function activateEvadeModeOnce() {
  if (evadeActive) return;
  evadeActive = true;

  noBtn.classList.add("jitter");
  noBtn.textContent = "Nein??";

  setLine("Okay… jetzt wird’s wirklich schwer 😈🐧");
  moveNoToRandomSpot();
  startSlideAroundBase();
}

function showYesScreen() {
  // Stop “No” animation loop
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;

  tag.textContent = "from: Hademi Kabel";

  // ✅ Ganze Content-Area ersetzen (Karte verändert sich komplett)
  content.innerHTML = `
    <div class="yes-screen">
      <img class="hero" src="/penguin_yay.gif" alt="Yay Penguin" />
      <div class="yes-head">YAAAY! 💙💙💙</div>
      <p class="yes-sub">Hast mein Herz gewonnen Maus 🫶</p>
      <p class="line">Screenshotte das mal und schick’s mir zu, muss schauen ob meine TypeScript Datei funktioniert. </p>
    </div>
  `;

  // kleine “pop” animation auf die ganze Karte
  card.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }],
    { duration: 520, easing: "ease-out" }
  );
}

// ---- INIT ----
noBtn.classList.remove("jitter");
placeNoStaticInitially();

// ---- EVENTS ----
noBtn.addEventListener("click", () => {
  noClicks++;
  setLine(pickRandomNoLine());
  growYesButton();

  if (noClicks >= EVADE_START) {
    activateEvadeModeOnce();
    moveNoToRandomSpot();
  }
});

yesBtn.addEventListener("click", () => {
  showYesScreen();
});
