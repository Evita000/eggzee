// 🐣 Eggzee — Fixed interactive version (no p5.play conflicts)
let state = "egg";
let eggImg, eggzeeAwakeImg, eggzeeSleepImg;
let cityImg, cityNightImg;
let crackTime = 0;

// Timer
let energy = 120;
let startTime = null;

// Buttons
let buttons = [];
let buttonLabels = ["🍩 Feed", "💃 Dance", "✨ Game", "😂 Joke"];
let showJoke = false;
let jokeText = "";
let jokeTimer = 0;
let hasWelcomed = false;

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

  // 📱 Adjust button layout
  const spacing = width / 5;
  for (let i = 0; i < 4; i++) {
    buttons.push({
      x: spacing * (i + 1),
      y: height - 90,
      w: 100,
      h: 80,
      label: buttonLabels[i],
    });
  }
}

// ---------- DRAW ----------
function draw() {
  // 🌇 Background
  const isNight = (energy <= 15 && startTime) || state === "sleep";
  if (isNight && cityNightImg) image(cityNightImg, 0, 0, width, height);
  else if (cityImg) image(cityImg, 0, 0, width, height);
  else background(220);

  // 💤 State machine
  if (state === "egg") drawEggScene();
  else if (state === "hatching") drawHatchingScene();
  else if (state === "awake") drawEggzeeScene();
  else if (state === "sleep") drawSleepScene();

  if (state === "awake") drawButtons();
  drawOverlayText();
  drawJoke();
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
  image(eggzeeAwakeImg, 0, 0, 280, 280);
  pop();
}

function drawSleepScene() {
  background(30, 30, 60);
  push();
  translate(width / 2, height / 2);
  imageMode(CENTER);
  image(eggzeeSleepImg, 0, 0, 280, 280);
  pop();

  fill(255);
  text("💤 Eggzee is sleeping... Tap to wake! 💫", width / 2, height - 40);
}

// ---------- BUTTONS ----------
function drawButtons() {
  for (let b of buttons) {
    fill(255, 255, 255, 200);
    rect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 20);
    fill(0);
    textSize(18);
    text(b.label, b.x, b.y);
  }
}

// ---------- TEXT / JOKES ----------
function drawOverlayText() {
  fill(255);
  textAlign(CENTER);
  if (state === "awake") {
    if (!hasWelcomed) {
      const pulse = map(sin(frameCount * 0.1), -1, 1, 180, 255);
      fill(255, 140, 200, pulse);
      text("💛 Hi, I’m Eggzee! I may crack easily...", width / 2, 50);
      text("but what breaks me makes me stronger 💫", width / 2, 80);
    } else {
      text("Choose an activity below!", width / 2, height - 30);
    }
  }
}

function tellJoke() {
  const jokes = [
    "How did the egg get up the mountain? It scrambled up! 🏔️",
    "Stop yolking around! 😜",
    "What do you call an egg who tells jokes? A pun-scrambler! 🤓",
    "Shell yeah! 💛",
  ];
  jokeText = random(jokes);
  showJoke = true;
  jokeTimer = millis();
}

function drawJoke() {
  if (showJoke && millis() - jokeTimer < 4000) {
    fill(255, 255, 255, 230);
    stroke(200);
    rect(width / 2 - 150, height / 2 - 150, 300, 100, 20);
    noStroke();
    fill(0);
    textSize(16);
    text(jokeText, width / 2, height / 2 - 100);
  }
}

// ---------- INPUT ----------
function mousePressed() {
  if (state === "egg") {
    state = "hatching";
    crackTime = millis();
    return;
  }

  if (state === "sleep") {
    state = "awake";
    return;
  }

  if (state === "awake") {
    hasWelcomed = true;
    for (let b of buttons) {
      if (
        mouseX > b.x - b.w / 2 &&
        mouseX < b.x + b.w / 2 &&
        mouseY > b.y - b.h / 2 &&
        mouseY < b.y + b.h / 2
      ) {
        if (b.label.includes("Joke")) tellJoke();
        else if (b.label.includes("Feed")) jokeText = "🍩 Feed coming soon!";
        else if (b.label.includes("Dance"))
          jokeText = "💃 Eggzee starts to groove!";
        else if (b.label.includes("Game"))
          jokeText = "✨ Game loading soon...";
        showJoke = true;
        jokeTimer = millis();
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
