
const FRIEND_NAME = " Dear Doctor";
document.getElementById('greetingText').textContent = `Hey ${FRIEND_NAME} ❤️`;

const screens = {
  opening: document.getElementById('openingPopup'),
  question: document.getElementById('questionScreen'),
  celebration: document.getElementById('celebrationScreen'),
  planning: document.getElementById('planningScreen'),
  final: document.getElementById('finalScreen')
};

function showScreen(name){
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens[name].classList.remove('hidden');
}

// Date and time restrictions
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");

function updateDateAndTimeLimits() {

  const now = new Date();

  // Today's date: YYYY-MM-DD
  const todayString =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  // Do not allow previous dates
  dateInput.min = todayString;

  // No date selected yet
  if (!dateInput.value) {
    timeInput.removeAttribute("min");
    return;
  }

  // If user selects TODAY
  if (dateInput.value === todayString) {

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    // Past times today are not allowed
    timeInput.min = `${hours}:${minutes}`;

  } else {

    // Future date → any time is allowed
    timeInput.removeAttribute("min");
  }
}

// When the user changes the date
dateInput.addEventListener("change", updateDateAndTimeLimits);

// Run once when the page loads
updateDateAndTimeLimits();

// Update the minimum time every minute
setInterval(updateDateAndTimeLimits, 60000);



/* Floating hearts background */
const heartsCanvas = document.getElementById('heartsCanvas');
function spawnFloatingHeart(){
  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  const emojis = ['❤️','💕','💖','💗','💘'];
  heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

  const startX = Math.random() * 100;
  const size = 14 + Math.random() * 22;
  const duration = 8 + Math.random() * 8;
  const drift = (Math.random() * 160 - 80) + 'px';

  heart.style.left = startX + 'vw';
  heart.style.fontSize = size + 'px';
  heart.style.animationDuration = duration + 's';
  heart.style.setProperty('--drift', drift);

  heartsCanvas.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000 + 500);
}
setInterval(spawnFloatingHeart, 600);
for(let i = 0; i < 8; i++) setTimeout(spawnFloatingHeart, i * 150);

document.getElementById('openBtn').addEventListener('click', () => {
  showScreen('question');
});

/* Evasive "NO" Logic */
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const noMessageEl = document.getElementById('noMessage');
const questionScreen = document.getElementById('questionScreen');

const noMessages = [
  "Are you sure? 🥺",
  "Think again… ❤️",
  "Jay will be sad 😭",
  "Nice try! Still no 😏",
  "You can't catch me! 🏃‍♂️",
  "Just click Yes already! 💕"
];
let noMessageIdx = 0;

let isMoving = false;
function moveNoButton() {

  if (isMoving) return;

  isMoving = true;

  const SAFE = 50;

  /*
   * First time only:
   * Remove NO from the .card and put it directly in body.
   * This makes position: fixed relative to the browser viewport.
   */
  if (!noBtn.classList.contains("runaway")) {

    const rect = noBtn.getBoundingClientRect();

    document.body.appendChild(noBtn);

    noBtn.classList.add("runaway");

    noBtn.style.left = rect.left + "px";
    noBtn.style.top = rect.top + "px";
  }

  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  /*
   * HARD visible boundaries
   */
  const minX = SAFE;
  const minY = SAFE;

  const maxX = Math.max(
    minX,
    viewportW - btnW - SAFE
  );

  const maxY = Math.max(
    minY,
    viewportH - btnH - SAFE
  );

  const yesRect = yesBtn.getBoundingClientRect();

  let newX = minX;
  let newY = minY;

  /*
   * Find a random position that does not cover YES
   */
  for (let i = 0; i < 100; i++) {

    const x = Math.floor(
      minX + Math.random() * (maxX - minX)
    );

    const y = Math.floor(
      minY + Math.random() * (maxY - minY)
    );

    const overlapsYes =
      x < yesRect.right + 40 &&
      x + btnW > yesRect.left - 40 &&
      y < yesRect.bottom + 40 &&
      y + btnH > yesRect.top - 40;

    if (!overlapsYes) {
      newX = x;
      newY = y;
      break;
    }
  }

  /*
   * FINAL safety clamp
   */
  newX = Math.max(
    minX,
    Math.min(newX, maxX)
  );

  newY = Math.max(
    minY,
    Math.min(newY, maxY)
  );

  noBtn.style.left = newX + "px";
  noBtn.style.top = newY + "px";

  noMessageEl.textContent =
    noMessages[noMessageIdx % noMessages.length];

  noMessageIdx++;

  /*
   * Wait until smooth movement is finished
   */
  setTimeout(() => {
    isMoving = false;
  }, 400);
}


// Window resize guardian - if window resizes, pull the button back inside
// Window resize guardian
window.addEventListener('resize', () => {

  if (!noBtn.classList.contains("runaway")) return;

  const margin = 50;

  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;

  let currentX = parseFloat(noBtn.style.left) || margin;
  let currentY = parseFloat(noBtn.style.top) || margin;

  const maxX = Math.max(
    margin,
    window.innerWidth - btnW - margin
  );

  const maxY = Math.max(
    margin,
    window.innerHeight - btnH - margin
  );

  // Keep NO completely inside the visible screen
  currentX = Math.max(
    margin,
    Math.min(currentX, maxX)
  );

  currentY = Math.max(
    margin,
    Math.min(currentY, maxY)
  );

  noBtn.style.left = currentX + "px";
  noBtn.style.top = currentY + "px";
});


// Proximity triggers & click prevention
// SMART CURSOR DETECTION
document.addEventListener("mousemove", (e) => {

  if (questionScreen.classList.contains("hidden")) return;

  // Don't calculate another movement while button is moving
  if (isMoving) return;

  const rect = noBtn.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const distance = Math.hypot(
    e.clientX - centerX,
    e.clientY - centerY
  );

  // Start running before cursor reaches button
  if (distance < 120) {
    moveNoButton();
  }
});

noBtn.addEventListener("mouseenter", () => {
  if (!isMoving) {
    moveNoButton();
  }
});



// Dodge mobile touch events immediately
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  e.stopPropagation();
  moveNoButton();
}, { passive: false });

noBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  moveNoButton();
});

noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveNoButton();
});

// YES Button click
yesBtn.addEventListener('click', () => {
  showScreen('celebration');
  launchConfetti();
});

/* Confetti System */
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');
let confettiParticles = [];
let confettiAnimId = null;

function resizeCanvas(){
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const confettiColors = ['#ff6fa5', '#ff3d81', '#a86bff', '#ff5c7a', '#ffd166', '#ffffff'];

function createParticle(){
  return {
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * 200,
    size: 8 + Math.random() * 10,
    speedY: 2.5 + Math.random() * 3.5,
    speedX: (Math.random() - 0.5) * 2.5,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 8,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    shape: Math.random() > 0.4 ? 'heart' : 'circle'
  };
}

function drawHeart(x, y, size, color){
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  const s = size / 2;
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(0, 0, -s, 0, -s, s * 0.5);
  ctx.bezierCurveTo(-s, s * 1.1, 0, s * 1.4, 0, s * 1.8);
  ctx.bezierCurveTo(0, s * 1.4, s, s * 1.1, s, s * 0.5);
  ctx.bezierCurveTo(s, 0, 0, 0, 0, s * 0.3);
  ctx.fill();
  ctx.restore();
}

function animateConfetti(){
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach(p => {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotationSpeed;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    if (p.shape === 'heart') {
      drawHeart(0, 0, p.size, p.color);
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  confettiParticles = confettiParticles.filter(p => p.y < confettiCanvas.height + 30);
  if (confettiParticles.length > 0) {
    confettiAnimId = requestAnimationFrame(animateConfetti);
  } else {
    cancelAnimationFrame(confettiAnimId);
  }
}

function launchConfetti(){
  for (let i = 0; i < 100; i++) confettiParticles.push(createParticle());
  cancelAnimationFrame(confettiAnimId);
  animateConfetti();
  setTimeout(() => {
    for (let i = 0; i < 50; i++) confettiParticles.push(createParticle());
    animateConfetti();
  }, 500);
}

/* Form Handlers */
document.getElementById('planDateBtn').addEventListener('click', () => {
  showScreen('planning');
});

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5kmujiQlSD3BTrr0n4XL2WL8iZ0H3zSxEZk4TAiy5SHrdBcriot3WGrsxCHK4B71f/exec";

document.getElementById('dateForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const dateVal = document.getElementById('dateInput').value;
  const timeVal = document.getElementById('timeInput').value;
  const placeVal = document.getElementById('placeInput').value;
  const msgVal = document.getElementById('messageInput').value.trim();

    fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      name: FRIEND_NAME,
      date: dateVal,
      time: timeVal,
      place: placeVal,
      message: msgVal
    })
  });

  let prettyDate = dateVal;
  if (dateVal) {
    const d = new Date(dateVal + 'T00:00:00');
    if (!isNaN(d)) {
      prettyDate = d.toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }
  }

  let prettyTime = timeVal;
  if (timeVal) {
    const [h, m] = timeVal.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10));
    prettyTime = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  document.getElementById('finalDate').textContent = prettyDate;
  document.getElementById('finalTime').textContent = prettyTime;
  document.getElementById('finalPlace').textContent = placeVal;

  const msgWrap = document.getElementById('finalMsgWrap');
  if (msgVal) {
    document.getElementById('finalMsg').textContent = msgVal;
    msgWrap.classList.remove('hidden');
  } else {
    msgWrap.classList.add('hidden');
  }

  showScreen('final');
  launchConfetti();
});

showScreen('opening');
