// 🐣 Eggzee — Clean version (no p5.play dependencies)
let state = "egg";
let eggImg, eggzeeAwakeImg, eggzeeSleepImg, cityImg, cityNightImg;
let crackTime = 0;

// Timer
let energy = 120;
let startTime = null;

// Game elements
let hearts = [];
let foods = [];
let showYum = false;
let yumTimer = 0;

// ---------- PRELOAD ----------
function preload() {
  eggImg = loadImage("assets/idelegg.png");
  eggzeeAwakeImg = loadImage("assets/eggzee7.png");
  eggzeeSleepImg = loadImage("assets/eggzee5.png");
  cityImg = loadImage("assets/city.jpg");
  cityNightImg = loadImage("assets/city_night.jpg");
}

// ---------- SETUP ----------
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(20);
}

// ---------- DRAW ----------
function draw() {
  background(0);
  imageMode(CORNER);
  if (cityImg) image(cityImg, 0, 0, width, height);

  if (state === "egg") drawEggScene();
  else if (state === "hatching") drawHatchingScene();
  else if (state === "awake") drawEggzeeScene();
  else if (state === "sleep") drawSleepScene();

  drawButtons();
}

// ---------- SCENES ----------
function drawEggScene() {
  push();
  translate(width / 2, height / 2 + 60);
  rotate(radians(sin(frameCount * 0.3) * 5));
  imageMode(CENTER);
  image(eggImg, 0, 0, 240, 240);
  pop();

  fill(255);
  text("Tap the egg to hatch Eggzee 🥚", width / 2, height - 40);
}

function drawHatchingScene() {
  push();
  translate(width / 2, height / 2 + 60);
  rotate(radians(random(-10, 10)));
  imageMode(CENTER);
  image(eggImg, 0, 0, 240, 240);
  pop();

  if (millis() - crackTime > 1200) {
    state = "awake";
    startTime = millis();
  }
}

function drawEggzeeScene() {
  push();
  translate(width / 2, height / 2);
  rotate(radians(sin(frameCount * 0.1) * 5));
  imageMode(CENTER);
  image(eggzeeAwakeImg, 0, 0, 260, 260);
  pop();

  fill(255);
  text("Choose an activity below!", width / 2, height - 40);
}

function drawSleepScene() {
  background(20, 30, 60);
  push();
  translate(width / 2, height / 2);
  imageMode(CENTER);
  image(eggzeeSleepImg, 0, 0, 260, 260);
  pop();

  fill(255);
  text("💤 Eggzee is sleeping... Tap to wake! 💫", width / 2, height - 40);
}

// ---------- BUTTONS ----------
function drawButtons() {
  const labels = ["🍩 Feed", "💃 Dance", "✨ Game", "😂 Joke"];
  const spacing = width / 5;
  const y = height - 90;

  textAlign(CENTER, CENTER);
  for (let i = 0; i < 4; i++) {
    const x = spacing * (i + 1);
    fill(255, 220);
    rect(x - 50, y - 40, 100, 80, 20);
    fill(0);
    text(labels[i], x, y);
  }
}

// ---------- INPUT ----------
function mousePressed() {
  if (state === "egg") {
    state = "hatching";
    crackTime = millis();
  } else if (state === "sleep") {
    state = "awake";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
