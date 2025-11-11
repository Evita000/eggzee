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

  setupDanceButtonFix(); // mobile-safe
}

// ---------- DRAW LOOP ----------
function draw() {
  resetTextStyle();

  // 🌆 Background
  const isNight = (energy <= 15 && startTime) || state === "sleep";
  if (isNight && cityNightImg)
    image(cityNightImg, width / 2, height / 2, width, height);
  else if (cityImg)
    image(cityImg, width / 2, height / 2, width, height);
  else background(200);

  // ⏳ Energy countdown
  const elapsed = startTime ? (millis() - startTime) / 1000 : 0;
  energy = startTime ? max(0, 120 - elapsed) : 120;
  if (energy < 15 && state !== "sleep") state = "sleep";

  // 🎬 Scene control
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

// ---------- RESET STYLE ----------
function resetTextStyle() {
  textSize(20);
  textAlign(CENTER, CENTER);
  fill(255);
  noStroke();
}

// ---------- SCENES ----------
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
  if (!eggzee.visible) eggzee.visible = true;

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

      for (let i = 0; i < 10; i++) {
        sparkles.push({
          x: eggzee.x + random(-30, 30),
          y: eggzee.y + random(-30, 30),
          size: random(4, 10),
          speedY: random(-2, -5),
          alpha: 255
        });
      }

      hearts.push({
        x: eggzee.x + random(-20, 20),
        y: eggzee.y - 60,
        vy: -2,
        alpha: 255
      });
    }
  }

  foods = foods.filter(f => !f.toRemove);

  // ✨ Sparkles
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    fill(255, 255, 200, s.alpha);
    noStroke();
    ellipse(s.x, s.y, s.size);
    s.y += s.speedY;
    s.alpha -= 5;
    if (s.alpha <= 0) sparkles.splice(i, 1);
  }

  // ❤️ Hearts
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    textSize(40);
    text("❤️", h.x, h.y);
    h.y += h.vy;
    h.alpha -= 3;
    if (h.alpha <= 0) hearts.splice(i, 1);
  }

  drawYumBubble();

  if (!feedStartTime) feedStartTime = millis();
  if (millis() - feedStartTime > 25000) {
    foods = [];
    sparkles = [];
    hearts = [];
    showYum = false;
    feedStartTime = null;
    state = "awake";
  }
}

// ---------- SLEEP ----------
function drawSleepScene() {
  if (cityNightImg) image(cityNightImg, width / 2, height / 2, width, height);
  else background(15, 10, 40);

  push();
  translate(eggzee.x, eggzee.y + sin(frameCount * 0.05) * 8);
  image(eggzeeSleepImg, 0, 0, eggzeeSleepImg.width * 0.1, eggzeeSleepImg.height * 0.1);
  pop();

  fill(255);
  textSize(20);
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
  rotate(radians(sin(frameCount * 0.05) * 5));
  image(eggzeeAwakeImg, 0, 0, eggzeeAwakeImg.width * eggzee.scale, eggzeeAwakeImg.height * eggzee.scale);
  pop();

  if (frameCount % 10 === 0) {
    sparkles.push({
      x: random(50, width - 50),
      y: -10,
      size: random(10, 18),
      speed: random(2, 4),
      alpha: 255
    });
  }

  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    fill(255, 255, 150, s.alpha);
    ellipse(s.x, s.y, s.size);
    s.y += s.speed;
    s.alpha -= 2;

    if (dist(s.x, s.y, eggzee.x, eggzee.y) < 80) {
      hearts.push({ x: eggzee.x, y: eggzee.y - 40, vy: -2, alpha: 255 });
      heartsCaught++;
      sparkles.splice(i, 1);
    } else if (s.y > height || s.alpha < 0) {
      sparkles.splice(i, 1);
    }
  }

  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    textSize(60);
    text("❤️", h.x, h.y);
    h.y += h.vy;
    h.alpha -= 4;
    if (h.alpha < 0) hearts.splice(i, 1);
  }

  fill(255);
  textSize(22);
  text("Hearts caught: " + heartsCaught, width / 2, 50);

  if (millis() - gameStartTime > 20000) {
    hearts = [];
    sparkles = [];
    heartsCaught = 0;
    gameStartTime = null;
    state = "awake";
  }
}

// ---------- UI ----------
let buttonScales = {
  Feed: 1,
  Dance: 1,
  Game: 1,
  Joke: 1
};
let buttonBounceTimers = {};

function drawButton(btn, emoji, label) {
  let baseColor;
  if (label === "Feed") baseColor = color(255, 200, 220);
  else if (label === "Dance") baseColor = color(200, 220, 255);
  else if (label === "Game") baseColor = color(220, 255, 200);
  else if (label === "Joke") baseColor = color(255, 230, 180);
  else baseColor = color(255);

  const hover = dist(mouseX, mouseY, btn.x, btn.y) < 60 && state === "awake" ? 50 : 0;

  if (buttonBounceTimers[label]) {
    let elapsed = millis() - buttonBounceTimers[label];
    if (elapsed < 250) {
      let progress = elapsed / 250;
      buttonScales[label] = 1 + sin(progress * PI) * 0.15;
    } else {
      buttonScales[label] = 1;
      delete buttonBounceTimers[label];
    }
  }

  push();
  translate(btn.x, btn.y);
  scale(buttonScales[label]);
  translate(-btn.x, -btn.y);

  noStroke();
  fill(red(baseColor), green(baseColor), blue(baseColor), 190);
  rect(btn.x - 55, btn.y - 45, 110, 90, 25);

  stroke(red(baseColor), green(baseColor), blue(baseColor), 80 + hover);
  strokeWeight(4);
  noFill();
  rect(btn.x - 55, btn.y - 45, 110, 90, 25);

  noStroke();
  textSize(28);
  fill(50);
  text(emoji, btn.x, btn.y - 8);

  textSize(15);
  fill(80, 50, 80);
  text(label, btn.x, btn.y + 28);
  pop();
}

function bounceButton(label) {
  buttonBounceTimers[label] = millis();
}

function drawOverlayText() {
  if (state !== "awake") return;
  let alpha = map(sin(frameCount * 0.05), -1, 1, 180, 255);
  fill(200, 180, 255, alpha);
  noStroke();
  textSize(20);
  if (!hasWelcomed)
    text("💛 Hi, I’m Eggzee! Tap a button below!", width / 2, height - 180);
  else text("✨ Choose an activity below! ✨", width / 2, height - 150);
}

// ---------- HELPERS ----------
function drawFoods() {
  for (let f of foods) textSize(40), text(f.emoji, f.x, f.y);
}

function drawHearts() {
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    textSize(50);
    text("❤️", h.x, h.y);
    h.y += h.vy || -1;
    h.alpha -= 2;
    if (h.alpha <= 0) hearts.splice(i, 1);
  }
}

function drawYumBubble() {
  if (!showYum) return;
  let elapsed = millis() - yumTimer;
  let fadeAmt = map(elapsed, 0, 1000, 255, 0);
  fadeAmt = constrain(fadeAmt, 0, 255);
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  const bubbleX = width / 2;
  const bubbleY = height / 2 - 160;
  const bubbleW = min(width * 0.55, 350);
  const bubbleH = 80;
  fill(255, 240, 250, fadeAmt);
  stroke(200, 100, 200, fadeAmt);
  rect(bubbleX, bubbleY, bubbleW, bubbleH, 25);
  noStroke();
  fill(0, 0, 0, fadeAmt);
  textSize(22);
  text("Yum! 💕", bubbleX, bubbleY + 2);
  pop();
  if (elapsed > 1000) showYum = false;
}

// ---------- JOKES ----------
function drawJoke() {
  if (!showJoke) return;
  let elapsed = millis() - jokeTimer;
  let alpha = map(elapsed, 0, 3000, 255, 0);
  const pulse = 1 + sin(frameCount * 0.08) * 0.05;
  const pulseAlpha = 180 + sin(frameCount * 0.1) * 60;
  const bubbleX = width / 2;
  const bubbleY = height / 2 - 150;
  const bubbleW = min(width * 0.5, 320);
  const bubbleH = 70;
  push();
  translate(bubbleX, bubbleY);
  scale(pulse);
  translate(-bubbleX, -bubbleY);
  noStroke();
  fill(255, 230, 250, pulseAlpha);
  rectMode(CENTER);
  rect(bubbleX, bubbleY, bubbleW, bubbleH, 20);
  stroke(255, 150, 220, alpha * 0.7);
  strokeWeight(3);
  noFill();
  rect(bubbleX, bubbleY, bubbleW + 8, bubbleH + 8, 25);
  noStroke();
  fill(255, 230, 250, pulseAlpha);
  beginShape();
  vertex(bubbleX + 20, bubbleY + bubbleH / 2 - 8);
  vertex(bubbleX + 40, bubbleY + bubbleH / 2 + 15);
  vertex(bubbleX + 2, bubbleY + bubbleH / 2 - 4);
  endShape(CLOSE);
  fill(230, 100, 220, alpha);
  textAlign(CENTER, CENTER);
  textSize(20);
  textStyle(BOLD);
  text(jokeText, bubbleX, bubbleY, bubbleW - 20, bubbleH - 20);
  pop();
  if (elapsed > 3000) showJoke = false;
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
  textSize(20);
  text("Time left: " + ceil(energy) + "s", width / 2, 10);
}

// ---------- INPUT ----------
function mousePressed() {
  if (state === "egg") {
    state = "hatching";
    crackTime = millis();
  } else if (state === "awake") {
    hasWelcomed = true;
    if (insideButton(feedBtn)) {
      bounceButton("Feed");
      state = "feed";
    } else if (insideButton(danceBtn)) {
      bounce
