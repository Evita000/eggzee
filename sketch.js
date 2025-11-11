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

// Mini-game
let sparkles = [];
let heartsCaught = 0;
let gameStartTime = 0;
let gameDuration = 25000;

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
}

function draw() {
  // Background
  const isNight = (energy <= 15 && startTime) || state === "sleep";
  if (isNight && cityNightImg) image(cityNightImg, width / 2, height / 2, width, height);
  else if (cityImg) image(cityImg, width / 2, height / 2, width, height);
  else background(200);

  // Update energy
  const elapsed = startTime ? (millis() - startTime) / 1000 : 0;
  energy = startTime ? max(0, 120 - elapsed) : 120;

  // Scenes
  if (state === "egg") drawEggScene();
  else if (state === "hatching") drawHatchingScene();
  else if (state === "awake") drawEggzeeScene();
  else if (state === "feed") drawFeedScene();
  else if (state === "dance") drawDanceScene();
  else if (state === "miniGame") drawMiniGame();
  else if (state === "sleep") drawSleepScene();

  // Draw elements
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
  }
}

function drawDanceScene() {
  if (!eggzee.visible) eggzee.visible = true;
  push();
  translate(eggzee.x, eggzee.y);
  image(eggzeeAwakeImg, 0, 0, eggzeeAwakeImg.width * 0.12, eggzeeAwakeImg.height * 0.12);
  pop();
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

function drawMiniGame() {
  // make sure we're in game state
  if (state !== "miniGame") return;

  eggzee.visible = true;

  // follow mouse or finger
  if (touches.length > 0) {
    eggzee.x = touches[0].x;
    eggzee.y = touches[0].y;
  } else {
    eggzee.x = mouseX || width / 2;
    eggzee.y = height / 2;
  }

  // draw Eggzee
  push();
  translate(eggzee.x, eggzee.y);
  rotate(radians(sin(frameCount * 0.05) * 5));
  image(
    eggzeeAwakeImg,
    0,
    0,
    eggzeeAwakeImg.width * eggzee.scale,
    eggzeeAwakeImg.height * eggzee.scale
  );

  // 🟢 collision zone for test
  noFill();
  stroke(0, 255, 0);
  strokeWeight(4);
  ellipse(0, 0, 150, 150);
  pop();

  // create sparkles
  if (frameCount % 10 === 0) {
    sparkles.push({
      x: random(50, width - 50),
      y: -10,
      size: random(10, 18),
      speed: random(2, 4),
      alpha: 255
    });
  }

  // move sparkles
  for (let i = 0; i < sparkles.length; i++) {
    const s = sparkles[i];
    fill(255, 255, 100, s.alpha);
    noStroke();
    ellipse(s.x, s.y, s.size);
    s.y += s.speed;
    s.alpha -= 2;

    // force-visible debug point
    fill(0, 255, 255);
    ellipse(s.x, s.y, 5);

    // collision trigger
    if (dist(s.x, s.y, eggzee.x, eggzee.y) < 80) {
      hearts.push({
        x: eggzee.x,
        y: eggzee.y - 40,
        vy: -2,
        alpha: 255
      });
      heartsCaught++;
      sparkles.splice(i, 1);
      i--;
    }
  }

  // draw hearts above everything
  for (let i = 0; i < hearts.length; i++) {
    const h = hearts[i];
    textSize(60);
    noStroke();
    fill(255, 0, 100, h.alpha);
    text("❤️", h.x, h.y);
    h.y += h.vy;
    h.alpha -= 4;
    if (h.alpha < 0) hearts.splice(i, 1);
  }

  // score text
  fill(255);
  noStroke();
  textSize(22);
  textAlign(CENTER, TOP);
  text("Hearts caught: " + heartsCaught, width / 2, 50);

  // keep game running for now (don’t exit automatically)
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

// ---------- Food, Hearts, Yum, Joke ----------
function drawFoods() {
  for (let f of foods) {
    if (f.beingDragged) {
      f.x = mouseX;
      f.y = mouseY;
    }
    textSize(40);
    text(f.emoji, f.x, f.y);
  }
}

function drawHearts() {
  for (let i = hearts.length - 1; i >= 0; i--) {
    let h = hearts[i];
    textSize(50);
    textAlign(CENTER, CENTER);
    text("❤️", h.x, h.y);
    h.y += h.vy || -1;
    h.alpha = h.alpha || 255;
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
  textAlign(CENTER, CENTER);
  text("Yum! 💕", width / 2, height / 2 - 150);
  if (millis() - yumTimer > 1500) showYum = false;
}

// ---------- Text & Overlay ----------
function drawJoke() {
  if (!showJoke) return;
  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  text(jokeText, width / 2, height / 2 - 200);
}  // ✅ closes drawJoke properly

function drawOverlayText() {
  fill(255);
  textSize(20);
  if (state === "awake") {
    if (!hasWelcomed) {
      text("💛 Hi, I’m Eggzee! Tap a button below!", width / 2, 50);
    } else {
      text("Choose an activity below!", width / 2, 50);
    }
  }
}  // ✅ closes drawOverlayText properly

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

// ---------- Input ----------
function mousePressed() {
  if (state === "egg") {
    state = "hatching";
    crackTime = millis();
  } else if (state === "awake") {
    hasWelcomed = true;
    if (insideButton(feedBtn)) state = "feed";
    else if (insideButton(danceBtn)) window.open("eggzeedance.html", "_blank");
    else if (insideButton(jokeBtn)) tellJoke();
    else if (insideButton(gameBtn)) {
      state = "miniGame";
      gameStartTime = millis();
      heartsCaught = 0;
    }
  } else if (state === "sleep") state = "awake";

  for (let f of foods)
    if (dist(mouseX, mouseY, f.x, f.y) < 30) f.beingDragged = true;
}

function mouseReleased() {
  for (let f of foods) f.beingDragged = false;
}

function touchStarted() {
  mousePressed();
  return false;
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
    "You crack me up 🥚😂",
    "Keep calm and egg on 🧘‍♀️",
    "Eggstroidinary! 🤩",
    "Sunny-side up ☀️"
  ];
  jokeText = random(jokes);
  showJoke = true;
  jokeTimer = millis();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function touchMoved() {
  if (state === "miniGame" && touches.length > 0) {
    eggzee.x = touches[0].x;
    eggzee.y = touches[0].y;
  }
  return false;
}

function touchEnded() {
  return false;
}









