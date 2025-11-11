// 🐣 Eggzee — Clean GitHub Version (v10)
let state = "egg";
let eggImg, eggzeeAwakeImg, eggzeeSleepImg, cityImg, cityNightImg;
let eggzee = {};
let crackTime = 0;
let energy = 120;
let startTime = null;
let hasWelcomed = false;

// Buttons + UI
let feedBtn, danceBtn, gameBtn, jokeBtn;
let hearts = [];
let foods = [];
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
  cityNightImg = loadImage("assets/city_night.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(20);

  eggzee = {
    visible: false,
    img: eggzeeAwakeImg,
    x: width / 2,
    y: height / 2,
    scale: 0.12,
    rotation: 0
  };

  const spacing = width / 5;
  feedBtn = { x: spacing * 1, y: height - 90, label: "🍩 Feed" };
  danceBtn = { x: spacing * 2, y: height - 90, label: "💃 Dance" };
  gameBtn = { x: spacing * 3, y: height - 90, label: "✨ Game" };
  jokeBtn = { x: spacing * 4, y: height - 90, label: "😂 Joke" };
}

function draw() {
  // 🌇 Background — only once per frame
  clear();
  const isNight = (energy <= 15 && startTime) || state === "sleep";
  if (isNight && cityNightImg) {
    image(cityNightImg, width / 2, height / 2, width, height);
  } else if (cityImg) {
    image(cityImg, width / 2, height / 2, width, height);
  } else {
    background(200);
  }

  // Energy
  const elapsed = startTime ? (millis() - startTime) / 1000 : 0;
  energy = startTime ? max(0, 120 - elapsed) : 120;

  // Scene switcher
  if (state === "egg") drawEggScene();
  else if (state === "hatching") drawHatchingScene();
  else if (state === "awake") drawEggzeeScene();
  else if (state === "feed") drawFeedScene();
  else if (state === "dance") drawDanceScene();
  else if (state === "sleep") drawSleepScene();

  drawFoods();
  drawHearts();
  drawButtons();
  drawYumBubble();
  drawJoke();
  drawEnergyBar();
  drawOverlayText();
}

// ---------- Scenes ----------
function drawEggScene() {
  image(eggImg, width / 2, height / 2 + 40, eggImg.width * 0.1, eggImg.height * 0.1);
  fill(255);
  text("Tap the egg to hatch Eggzee 🥚", width / 2, height - 40);
}

function drawHatchingScene() {
  image(eggImg, width / 2, height / 2 + 40, eggImg.width * 0.1, eggImg.height * 0.1);
  if (millis() - crackTime > 1000) {
    state = "awake";
    eggzee.visible = true;
    startTime = millis();
    hasWelcomed = false;
  }
}

function drawEggzeeScene() {
  if (!eggzee.visible) return;
  eggzee.rotation = sin(frameCount * 0.05) * 5;
  push();
  translate(eggzee.x, eggzee.y);
  rotate(radians(eggzee.rotation));
  image(eggzeeAwakeImg, 0, 0, eggzeeAwakeImg.width * eggzee.scale, eggzeeAwakeImg.height * eggzee.scale);
  pop();
}

function drawFeedScene() {
  eggzee.visible = true;
  push();
  translate(eggzee.x, eggzee.y);
  image(eggzeeAwakeImg, 0, 0, eggzeeAwakeImg.width * 0.12, eggzeeAwakeImg.height * 0.12);
  pop();

  if (frameCount % 120 === 0 && foods.length < 5) {
    let emojiList = ["🍩", "🍎", "🍓", "🍪", "🍕"];
    foods.push({ x: random(60, width - 60), y: random(height / 2, height - 100), emoji: random(emojiList) });
  }
  for (let f of foods) {
    textSize(40);
    text(f.emoji, f.x, f.y);
  }
  if (showYum) drawYumBubble();
}

function drawDanceScene() {
  eggzee.rotation = sin(frameCount * 0.2) * 20;
  eggzee.x = width / 2 + sin(frameCount * 0.05) * 100;
  eggzee.y = height / 2 + cos(frameCount * 0.1) * 10;
  push();
  translate(eggzee.x, eggzee.y);
  rotate(radians(eggzee.rotation));
  image(eggzeeAwakeImg, 0, 0, eggzeeAwakeImg.width * 0.12, eggzeeAwakeImg.height * 0.12);
  pop();
  if (millis() - crackTime > 10000) state = "awake";
}

function drawSleepScene() {
  background(15, 10, 40);
  eggzee.img = eggzeeSleepImg;
  push();
  translate(eggzee.x, eggzee.y + sin(frameCount * 0.05) * 8);
  image(eggzee.img, 0, 0, eggzee.img.width * 0.1, eggzee.img.height * 0.1);
  pop();
  fill(255);
  text("💤 Eggzee is sleeping... Tap to wake! 💫", width / 2, height - 100);
}

// ---------- UI ----------
function drawButtons() {
  if (state !== "awake") return;
  drawButton(feedBtn, "🍩", "Feed");
  drawButton(danceBtn, "💃", "Dance");
  drawButton(gameBtn, "✨", "Game");
  drawButton(jokeBtn, "😂", "Joke");
}

function drawButton(btn, emoji, label) {
  fill(255, 255, 255, 180);
  rect(btn.x - 50, btn.y - 40, 100, 80, 20);
  fill(0);
  textSize(20);
  text(emoji, btn.x, btn.y - 10);
  textSize(14);
  text(label, btn.x, btn.y + 25);
}

// ---------- Mini Elements ----------
function drawFoods() {}
function drawHearts() {
  for (let i = hearts.length - 1; i >= 0; i--) {
    let h = hearts[i];
    text("❤️", h.x, h.y);
    h.y -= 1;
    h.alpha -= 2;
    if (h.alpha <= 0) hearts.splice(i, 1);
  }
}
function drawYumBubble() {
  if (!showYum) return;
  fill(255, 220, 240);
  stroke(200, 150, 200);
  rect(width / 2 - 60, height / 2 - 150, 120, 50, 25);
  fill(50);
  noStroke();
  text("Yum! 💕", width / 2, height / 2 - 150);
  if (millis() - yumTimer > 1500) showYum = false;
}
function drawJoke() {
  if (showJoke && millis() - jokeTimer < 5000) {
    fill(255);
    textSize(18);
    text(jokeText, width / 2, height / 2 - 200);
  }
}
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
  textSize(20);
  if (state === "awake") {
    if (!hasWelcomed) text("💛 Hi, I’m Eggzee! Tap a button below!", width / 2, 50);
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
      yumTimer = millis();
      showYum = true;
    } else if (insideButton(danceBtn)) {
      state = "dance";
      crackTime = millis();
    } else if (insideButton(jokeBtn)) {
      tellJoke();
    } else if (insideButton(gameBtn)) {
      state = "awake";
    }
  } else if (state === "sleep") {
    state = "awake";
  }
}
function insideButton(btn) {
  return mouseX > btn.x - 50 && mouseX < btn.x + 50 && mouseY > btn.y - 40 && mouseY < btn.y + 40;
}
function tellJoke() {
  const jokes = [
    "You crack me up every time 🥚😂",
    "Keep calm and egg on 🧘‍♀️",
    "This is so eggstroidinary! 🤩",
    "I’m living sunny-side up ☀️",
  ];
  jokeText = random(jokes);
  showJoke = true;
  jokeTimer = millis();
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
