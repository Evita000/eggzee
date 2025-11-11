// 🐣 Eggzee — Interactive v11 (Stable + Fun Edition)
let state = "egg";
let eggImg, eggzeeAwakeImg, eggzeeSleepImg, cityImg;
let crackTime = 0;
let eggzee = { visible: false };
let energy = 120;
let startTime;
let hasWelcomed = false;

// UI + mini elements
let feedBtn, danceBtn, gameBtn, jokeBtn;
let foods = [];
let hearts = [];
let showYum = false;
let yumTimer = 0;
let showJoke = false;
let jokeText = "";
let jokeTimer = 0;

function preload() {
  eggImg = loadImage("assets/idelegg.png");
  eggzeeAwakeImg = loadImage("assets/eggzee7.png");
  eggzeeSleepImg = loadImage("assets/eggzee5.png");
  cityImg = loadImage("assets/city.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);

  eggzee.x = width / 2;
  eggzee.y = height / 2;
  eggzee.scale = 0.12;

  const spacing = width / 5;
  feedBtn = { x: spacing * 1, y: height - 90, label: "🍩 Feed" };
  danceBtn = { x: spacing * 2, y: height - 90, label: "💃 Dance" };
  gameBtn = { x: spacing * 3, y: height - 90, label: "✨ Game" };
  jokeBtn = { x: spacing * 4, y: height - 90, label: "😂 Joke" };
}

function draw() {
  background(0);
  clear();
  image(cityImg, width / 2, height / 2, width, height);

  // Timer
  const elapsed = startTime ? (millis() - startTime) / 1000 : 0;
  energy = startTime ? max(0, 120 - elapsed) : 120;

  // Scene selector
  if (state === "egg") drawEggScene();
  else if (state === "hatching") drawHatchingScene();
  else if (state === "awake") drawEggzeeScene();
  else if (state === "feed") drawFeedScene();
  else if (state === "dance") drawDanceScene();
  else if (state === "sleep") drawSleepScene();

  drawHearts();
  drawButtons();
  if (showYum) drawYumBubble();
  if (showJoke) drawJoke();
  drawEnergyBar();
  drawOverlayText();
}

// ---------- Scenes ----------
function drawEggScene() {
  image(eggImg, width / 2, height / 2 + 40, 200, 200);
  fill(255);
  text("Tap the egg to hatch Eggzee 🥚", width / 2, height - 40);
}

function drawHatchingScene() {
  image(eggImg, width / 2, height / 2 + 40 + sin(frameCount * 0.3) * 5, 200, 200);
  if (frameCount % 10 < 5) text("⚡", width / 2 + random(-30, 30), height / 2 + 70);
  if (millis() - crackTime > 1000) {
    state = "awake";
    eggzee.visible = true;
    startTime = millis();
  }
}

function drawEggzeeScene() {
  if (!eggzee.visible) return;
  push();
  translate(eggzee.x, eggzee.y + sin(frameCount * 0.05) * 4);
  rotate(radians(sin(frameCount * 0.05) * 3));
  image(eggzeeAwakeImg, 0, 0, eggzeeAwakeImg.width * eggzee.scale, eggzeeAwakeImg.height * eggzee.scale);
  pop();
}

function drawDanceScene() {
  eggzee.visible = true;
  push();
  translate(width / 2 + sin(frameCount * 0.08) * 80, height / 2 + cos(frameCount * 0.2) * 10);
  rotate(radians(sin(frameCount * 0.3) * 10));
  image(eggzeeAwakeImg, 0, 0, eggzeeAwakeImg.width * 0.12, eggzeeAwakeImg.height * 0.12);
  pop();

  // floating hearts
  if (frameCount % 10 === 0)
    hearts.push({ x: random(width / 2 - 50, width / 2 + 50), y: height / 2 - 100, vy: -1, alpha: 255 });

  if (millis() - crackTime > 10000) state = "awake";
}

function drawFeedScene() {
  image(eggzeeAwakeImg, eggzee.x, eggzee.y, eggzeeAwakeImg.width * 0.12, eggzeeAwakeImg.height * 0.12);
  if (frameCount % 120 === 0 && foods.length < 5) {
    const emojiList = ["🍩", "🍓", "🍎", "🍪"];
    foods.push({ x: random(60, width - 60), y: random(height / 2, height - 100), emoji: random(emojiList) });
  }
  textSize(40);
  for (let f of foods) text(f.emoji, f.x, f.y);
}

function drawSleepScene() {
  background(15, 10, 40);
  image(eggzeeSleepImg, eggzee.x, eggzee.y + sin(frameCount * 0.03) * 8, 250, 250);
  fill(255);
  text("💤 Eggzee is sleeping... Tap to wake! 💫", width / 2, height - 100);
}

// ---------- Mini Elements ----------
function drawHearts() {
  for (let i = hearts.length - 1; i >= 0; i--) {
    let h = hearts[i];
    textSize(40);
    text("❤️", h.x, h.y);
    h.y += h.vy;
    h.alpha -= 2;
    if (h.alpha <= 0) hearts.splice(i, 1);
  }
}

function drawYumBubble() {
  fill(255, 220, 240);
  stroke(200, 150, 200);
  rect(width / 2 - 60, height / 2 - 150, 120, 50, 25);
  noStroke();
  fill(50);
  text("Yum! 💕", width / 2, height / 2 - 150);
  if (millis() - yumTimer > 1500) showYum = false;
}

function drawJoke() {
  fill(255);
  textSize(20);
  text(jokeText, width / 2, height / 2 - 150);
  if (millis() - jokeTimer > 4000) showJoke = false;
}

// ---------- Buttons ----------
function drawButtons() {
  if (state !== "awake") return;
  drawButton(feedBtn, "🍩", "Feed");
  drawButton(danceBtn, "💃", "Dance");
  drawButton(gameBtn, "✨", "Game");
  drawButton(jokeBtn, "😂", "Joke");
}
function drawButton(btn, emoji, label) {
  fill(255, 255, 255, 200);
  rect(btn.x - 50, btn.y - 40, 100, 80, 20);
  fill(0);
  textSize(20);
  text(emoji, btn.x, btn.y - 10);
  textSize(14);
  text(label, btn.x, btn.y + 25);
}

// ---------- Energy + Overlay ----------
function drawEnergyBar() {
  if (state === "egg") return;
  const barWidth = 300;
  const pct = constrain(energy / 120, 0, 1);
  fill(255, 200, 0);
  rect(width / 2 - barWidth / 2, 30, barWidth * pct, 15, 10);
  stroke(255);
  noFill();
  rect(width / 2 - barWidth / 2, 30, barWidth, 15, 10);
  noStroke();
  fill(255);
  text("Time left: " + ceil(energy) + "s", width / 2, 10);
}
function drawOverlayText() {
  fill(255);
  if (state === "awake") {
    if (!hasWelcomed)
      text("💛 Hi, I’m Eggzee! Tap a button below!", width / 2, 50);
    else text("Choose an activity below!", width / 2, 50);
  }
}

// ---------- Input ----------
function mousePressed() {
  if (state === "egg") {
    state = "hatching";
    crackTime = millis();
  } else if (state === "awake") {
    hasWelcomed = true;
    if (insideButton(feedBtn)) {
      state = "feed";
      showYum = true;
      yumTimer = millis();
    } else if (insideButton(danceBtn)) {
      state = "dance";
      crackTime = millis();
    } else if (insideButton(gameBtn)) {
      hearts.push({ x: random(width), y: height / 2, vy: -1, alpha: 255 });
    } else if (insideButton(jokeBtn)) {
      tellJoke();
    }
  } else if (state === "sleep") state = "awake";
}

function insideButton(btn) {
  return (
    mouseX > btn.x - 50 &&
    mouseX < btn.x + 50 &&
    mouseY > btn.y - 40 &&
    mouseY < btn.y + 40
  );
}

function tellJoke() {
  const jokes = [
    "Stop yolking around! 😜",
    "I’m on a roll — no need to eggsplain! 🥖",
    "Shell yeah! 💛",
    "Keep calm and egg on 🧘‍♀️",
  ];
  jokeText = random(jokes);
  showJoke = true;
  jokeTimer = millis();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
