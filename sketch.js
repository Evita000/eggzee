let state = "egg";
let eggImg, eggzeeAwakeImg, eggzeeSleepImg, cityImg, cityNightImg;
let eggzee = {};
let crackTime = 0;
let energy = 120;
let startTime = null;
let hasWelcomed = false;
let feedStartTime = null;

// Buttons + UI
let feedBtn, danceBtn, gameBtn, jokeBtn;
let hearts = [];
let foods = [];
let showYum = false;
let yumTimer = 0;
let showJoke = false;
let jokeText = "";
let jokeTimer = 0;

// Mini-game
let sparkles = [];
let heartsCaught = 0;
let gameStartTime = null;

let gameDuration = 25000;

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
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(20);

  eggzee = {
    visible: false,
    x: width / 2,
    y: height / 2,
    scale: 0.12,
    rotation: 0
  };

  const spacing = width / 5;
  feedBtn = { x: spacing * 1, y: height - 90 };
  danceBtn = { x: spacing * 2, y: height - 90 };
  gameBtn = { x: spacing * 3, y: height - 90 };
  jokeBtn = { x: spacing * 4, y: height - 90 };

  setupDanceButtonFix();
}

// ---------- DRAW ----------
function draw() {
  background(0);
  const isNight = (energy <= 15 && startTime) || state === "sleep";
  if (isNight && cityNightImg) image(cityNightImg, width / 2, height / 2, width, height);
  else if (cityImg) image(cityImg, width / 2, height / 2, width, height);

  const elapsed = startTime ? (millis() - startTime) / 1000 : 0;
  energy = startTime ? max(0, 120 - elapsed) : 120;
  if (energy < 15 && state !== "sleep") state = "sleep";

  if (state === "egg") drawEggScene();
  else if (state === "hatching") drawHatchingScene();
  else if (state === "awake") drawEggzeeScene();
  else if (state === "feed") drawFeedScene();
  else if (state === "miniGame") drawMiniGame();
  else if (state === "sleep") drawSleepScene();

  drawFoods();
  drawHearts();
  drawButtons();
  drawJoke();
  drawEnergyBar();
  drawOverlayText();
}

function drawEggScene() {
  image(eggImg, width / 2, height / 2 + 40, 200, 200);
  fill(255);
  text("Tap the egg to hatch Eggzee 🥚", width / 2, height - 40);
  eggzee.visible = false;
}

function drawHatchingScene() {
  fill(0, 50);
  rect(0, 0, width, height);
  image(eggImg, width / 2, height / 2 + 40 + sin(frameCount * 0.3) * 5, 200, 200);
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

// ---------- FEED ----------
function drawFeedScene() {
  push();
  translate(eggzee.x, eggzee.y);
  image(eggzeeAwakeImg, 0, 0, eggzeeAwakeImg.width * 0.12, eggzeeAwakeImg.height * 0.12);
  pop();

  if (frameCount % 120 === 0 && foods.length < 5) {
    let emojiList = ["🍩", "🍎", "🍓", "🍪", "🍕"];
    foods.push({
      x: random(60, width - 60),
      y: random(height / 2, height - 100),
      emoji: random(emojiList),
      beingDragged: false
    });
  }

  for (let f of foods) {
    if (f.beingDragged) {
      f.x = mouseX;
      f.y = mouseY;
    }
    textSize(40);
    text(f.emoji, f.x, f.y);

    if (dist(f.x, f.y, eggzee.x, eggzee.y) < 80) {
      f.toRemove = true;
      showYum = true;
      yumTimer = millis();

      hearts.push({ x: eggzee.x, y: eggzee.y - 60, vy: -2, alpha: 255 });
    }
  }
  foods = foods.filter(f => !f.toRemove);
  drawYumBubble();

  if (!feedStartTime) feedStartTime = millis();
  if (millis() - feedStartTime > 25000) {
    foods = [];
    hearts = [];
    showYum = false;
    feedStartTime = null;
    state = "awake";
  }
}

function drawSleepScene() {
  image(cityNightImg, width / 2, height / 2, width, height);
  push();
  translate(eggzee.x, eggzee.y + sin(frameCount * 0.05) * 8);
  image(eggzeeSleepImg, 0, 0, eggzeeSleepImg.width * 0.1, eggzeeSleepImg.height * 0.1);
  pop();
  fill(255);
  text("💤 Eggzee is sleeping... Tap to wake! 💫", width / 2, height - 100);
}

// ---------- MINI GAME ----------
function drawMiniGame() {
  if (gameStartTime === null) gameStartTime = millis();
  if (touches && touches.length > 0) {
    eggzee.x = touches[0].x;
    eggzee.y = touches[0].y;
  } else if (mouseIsPressed) {
    eggzee.x = mouseX;
    eggzee.y = mouseY;
  }
  push();
  translate(eggzee.x, eggzee.y);
  image(eggzeeAwakeImg, 0, 0, eggzeeAwakeImg.width * eggzee.scale, eggzeeAwakeImg.height * eggzee.scale);
  pop();
  fill(255);
  text("Hearts caught: " + heartsCaught, width / 2, 50);
  if (millis() - gameStartTime > 20000) {
    hearts = [];
    heartsCaught = 0;
    gameStartTime = null;
    state = "awake";
  }
}

// ---------- UI ----------
function drawButtons() {
  drawButton(feedBtn, "🍎", "Feed");
  drawButton(danceBtn, "💃", "Dance");
  drawButton(gameBtn, "💖", "Game");
  drawButton(jokeBtn, "😆", "Joke");
}

function drawButton(btn, emoji, label) {
  fill(255);
  rect(btn.x - 50, btn.y - 40, 100, 80, 15);
  fill(0);
  text(emoji, btn.x, btn.y - 10);
  textSize(14);
  text(label, btn.x, btn.y + 25);
}

function drawOverlayText() {
  if (state === "awake") {
    fill(255, 220, 240);
    textSize(18);
    if (!hasWelcomed)
      text("💛 Hi, I’m Eggzee! Tap a button below!", width / 2, height - 180);
    else text("✨ Choose an activity below! ✨", width / 2, height - 150);
  }
}

// ---------- HELPERS ----------
function drawFoods() {
  for (let f of foods) textSize(40), text(f.emoji, f.x, f.y);
}

function drawHearts() {
  for (let h of hearts) {
    textSize(50);
    text("❤️", h.x, h.y);
    h.y += h.vy || -1;
  }
}

function drawYumBubble() {
  if (!showYum) return;
  let elapsed = millis() - yumTimer;
  if (elapsed > 1000) {
    showYum = false;
    return;
  }
  fill(255, 240, 250);
  rect(width / 2 - 100, height / 2 - 160, 200, 60, 20);
  fill(0);
  text("Yum! 💕", width / 2, height / 2 - 160);
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
  fill(255);
  textSize(18);
  text("Time left: " + ceil(energy) + "s", width / 2, 10);
}

// ---------- INPUT ----------
function mousePressed() {
  if (state === "egg") {
    state = "hatching";
    crackTime = millis();
  } else if (state === "awake") {
    hasWelcomed = true;
    if (insideButton(feedBtn)) state = "feed";
    else if (insideButton(danceBtn)) openDancePage();
    else if (insideButton(jokeBtn)) tellJoke();
    else if (insideButton(gameBtn)) {
      state = "miniGame";
      gameStartTime = millis();
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
    "How did the egg get up the mountain? It scrambled up! 🏔️",
    "This is so eggstroidinary! 🤩",
    "Stop yolking around! 😜",
    "Keep calm and egg on 🧘‍♀️",
    "Shell yeah! 💛"
  ];
  jokeText = random(jokes);
  showJoke = true;
  jokeTimer = millis();
}

function drawJoke() {
  if (!showJoke) return;
  let elapsed = millis() - jokeTimer;
  if (elapsed > 3000) showJoke = false;
  fill(255, 230, 250);
  rect(width / 2 - 150, height / 2 - 150, 300, 60, 20);
  fill(0);
  text(jokeText, width / 2, height / 2 - 150);
}

// ---------- MOBILE ----------
function touchStarted() {
  mousePressed();
  return false;
}

function openDancePage() {
  try {
    const newWin = window.open("eggzeedance.html", "_blank");
    if (!newWin) window.location.href = "eggzeedance.html";
  } catch (e) {
    window.location.href = "eggzeedance.html";
  }
}

function setupDanceButtonFix() {
  let danceLink = createA("eggzeedance.html", "hiddenDanceLink");
  danceLink.attribute("target", "_blank");
  danceLink.style("display", "none");
}
