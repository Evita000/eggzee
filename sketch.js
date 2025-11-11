// 🐣 Eggzee — Full Interactive Sketch (Final 700+ lines Version)
// Includes: feed 🍩, dance 💃, mini-game ✨, jokes 😂, city night sleep 🌃, pastel animated buttons

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

// Pastel button animation
let buttonScales = { Feed: 1, Dance: 1, Game: 1, Joke: 1 };
let buttonBounceTimers = {};

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

// ---------- DRAW ----------
function draw() {
  resetTextStyle();

  // 🌃 Backgrounds
  const isNight = (energy <= 15 && startTime) || state === "sleep";
  if (isNight && cityNightImg) image(cityNightImg, width / 2, height / 2, width, height);
  else if (cityImg) image(cityImg, width / 2, height / 2, width, height);
  else background(200);

  // ⏳ Energy timer
  const elapsed = startTime ? (millis() - startTime) / 1000 : 0;
  energy = startTime ? max(0, 120 - elapsed) : 120;

  // 💤 Auto sleep
  if (energy < 15 && state !== "sleep") state = "sleep";

  // 🎬 Scene logic
  if (state === "egg") drawEggScene();
  else if (state === "hatching") drawHatchingScene();
  else if (state === "awake") drawEggzeeScene();
  else if (state === "feed") drawFeedScene();
  else if (state === "miniGame") drawMiniGame();
  else if (state === "sleep") drawSleepScene();

  // 🧩 Common draws
  drawFoods();
  drawHearts();
  drawButtons();
  drawJoke();
  drawEnergyBar();
  drawOverlayText();
}

function resetTextStyle() {
  textSize(20);
  textAlign(CENTER, CENTER);
  fill(255);
  noStroke();

  colorMode(RGB);

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
  animateSparkles();
  animateHearts();
  drawYumBubble();

  if (!feedStartTime) feedStartTime = millis();
  if (millis() - feedStartTime > 25000) {
    resetToMainMenu();
  }
} // ← this closing curly was missing!

// 🧩 Fix: restore missing drawFoods()
// 🧩 FIX — restore missing function
function drawFoods() {
  if (!foods || foods.length === 0) return;
  textSize(40);
  for (let f of foods) {
    text(f.emoji, f.x, f.y);
  }
}


// ---------- ANIMATION HELPERS ----------
function animateSparkles() {
  push();
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    fill(255, 255, 150, s.alpha);
    noStroke();
    ellipse(s.x, s.y, s.size);
    s.y += s.speedY || -2;
    s.alpha -= 5;
    if (s.alpha <= 0) sparkles.splice(i, 1);
  }
  pop();
}



function animateHearts() {
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    textSize(40);
    text("❤️", h.x, h.y);
    h.y += h.vy;
    h.alpha -= 3;
    if (h.alpha <= 0) hearts.splice(i, 1);
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
// ---------- MINI GAME ----------
// ---------- MINI GAME ----------
function drawMiniGame() {
  if (state !== "miniGame") return;
  eggzee.visible = true;

  // 🕒 start timer once
  if (gameStartTime === null) gameStartTime = millis();

  // 🐣 move Eggzee with touch or mouse
  if (touches && touches.length > 0) {
    eggzee.x = touches[0].x;
    eggzee.y = touches[0].y;
  } else if (mouseIsPressed) {
    eggzee.x = mouseX;
    eggzee.y = mouseY;
  }

  // 🐣 draw Eggzee
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
  pop();

  // ✨ spawn sparkles continuously
  if (frameCount % 10 === 0) {
    sparkles.push({
      x: random(50, width - 50),
      y: -10,
      size: random(10, 18),
      speed: random(2, 4),
      alpha: 255,
      hue: random(360)
    });
  }

  // ✨ draw sparkles + detect catches
  push();
  colorMode(HSB);
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    fill(s.hue, 80, 100, s.alpha / 255);
    noStroke();
    ellipse(s.x, s.y, s.size);
    s.y += s.speed;
    s.alpha -= 2;
    if (dist(s.x, s.y, eggzee.x, eggzee.y) < 70) {
      hearts.push({
        x: eggzee.x + random(-10, 10),
        y: eggzee.y - 40,
        vy: -2,
        alpha: 255
      });
      heartsCaught++;
      sparkles.splice(i, 1);
    } else if (s.y > height || s.alpha < 0) {
      sparkles.splice(i, 1);
    }
  }
  pop();
  colorMode(RGB); // reset for hearts and UI

  // ❤️ hearts float up
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    textSize(60);
    fill(255, 0, 0, h.alpha);
    text("❤️", h.x, h.y);
    h.y += h.vy;
    h.alpha -= 4;
    if (h.alpha < 0) hearts.splice(i, 1);
  }

  // 🧮 score
  fill(255);
  textSize(22);
  text("Hearts caught: " + heartsCaught, width / 2, 50);

  if (millis() - gameStartTime > 20000) {
    resetToMainMenu();
  }




 

// ---------- BUTTONS ----------
function drawButtons() {
  if (state !== "awake") return;
  drawButton(feedBtn, "🍩", "Feed");
  drawButton(danceBtn, "💃", "Dance");
  drawButton(gameBtn, "✨", "Game");
  drawButton(jokeBtn, "😂", "Joke");
}

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

// ---------- TEXT ----------
function drawOverlayText() {
  if (state !== "awake") return;
  let alpha = map(sin(frameCount * 0.05), -1, 1, 180, 255);
  fill(200, 180, 255, alpha);
  noStroke();
  textSize(20);
  if (!hasWelcomed)
    text("💛 Hi, I’m Eggzee! Tap a button below!", width / 2, height - 180);
  else
    text("✨ Choose an activity below! ✨", width / 2, height - 150);
}

// ---------- JOKES ----------
function drawJoke() {
  if (!showJoke) return;
  let elapsed = millis() - jokeTimer;
  let alpha = map(elapsed, 0, 3000, 255, 0);
  alpha = constrain(alpha, 0, 255);

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

  let glowR = map(sin(frameCount * 0.05), -1, 1, 200, 255);
  let glowG = map(cos(frameCount * 0.08), -1, 1, 100, 220);
  let glowB = map(sin(frameCount * 0.1), -1, 1, 180, 255);
  fill(glowR, glowG, glowB, alpha);
  textAlign(CENTER, CENTER);
  textSize(20);
  textStyle(BOLD);
  text(jokeText, bubbleX, bubbleY, bubbleW - 20, bubbleH - 20);
  pop();

  if (elapsed > 3000) showJoke = false;
}

function tellJoke() {
  const jokes = [
    "How did the egg get up the mountain? It scrambled up! 🏔️",
    "This is so eggstroidinary! 🤩",
    "I’m on a roll — no need to eggsplain! 🥖",
    "How do comedians like their eggs? Funny side-up! 😂",
    "I’m feeling a bit fried today 🍳",
    "Don’t egg-nore me! 🙃",
    "Stop yolking around! 😜",
    "You crack me up every time 🥚😆",
    "I’m living sunny-side up ☀️",
    "Keep calm and egg on 🧘‍♀️",
    "What do you call an egg who tells jokes? A pun-scrambler! 🤓",
    "I shell-ter my feelings sometimes… 🐚",
    "An egg-cellent day to hatch plans! 🐣",
    "Oops, my shell-fi camera cracked 📸🥚",
    "Shell yeah! 💛"
  ];
  jokeText = random(jokes);
  showJoke = true;
  jokeTimer = millis();
}

// ---------- ENERGY ----------
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
  console.log("🐣 tap detected, state:", state);   // ✅ ADD THIS LINE

  if (state === "egg") {
    state = "hatching";
    crackTime = millis();
  } else if (state === "awake") {
    hasWelcomed = true;
    if (insideButton(feedBtn)) {
      bounceButton("Feed");
      state = "feed";
    } else if (insideButton(danceBtn)) {
      bounceButton("Dance");
      openDancePage();
    } else if (insideButton(jokeBtn)) {
      bounceButton("Joke");
      tellJoke();
    } else if (insideButton(gameBtn)) {
      bounceButton("Game");
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

// ✅ Make mobile taps hatch the egg too
function touchStarted() {
  console.log("📱 touch detected, state:", state);
  mousePressed();
  return false;
}

// ✅ Missing helper so feeding doesn’t break anything
function drawYumBubble() {
  if (showYum && millis() - yumTimer < 1000) {
    fill(255, 230, 250, 220);
    textSize(32);
    text("Yum! 😋", eggzee.x, eggzee.y - 120);
  } else {
    showYum = false;
  }
}

function insideButton(btn) {
  return (
    mouseX > btn.x - 50 &&
    mouseX < btn.x + 50 &&
    mouseY > btn.y - 40 &&
    mouseY < btn.y + 40
  );
}

function touchMoved() {
  if (state === "feed" && touches.length > 0) {
    for (let f of foods) {
      if (dist(touches[0].x, touches[0].y, f.x, f.y) < 40) {
        f.beingDragged = true;
        f.x = touches[0].x;
        f.y = touches[0].y;
      }
    }
  }
  if (state === "miniGame" && touches.length > 0) {
    eggzee.x = touches[0].x;
    eggzee.y = touches[0].y;
  }
  return false;
}

function touchEnded() {
  for (let f of foods) f.beingDragged = false;
  return false;
}

// ---------- DANCE ----------
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
  danceLink.id("hiddenDanceLink");
  danceLink.attribute("target", "_blank");
  danceLink.style("display", "none");
}
// Ensure p5 uses RGB mode again after colorMode(HSB)
function beforeDraw() {
  colorMode(RGB);
}
function resetToMainMenu() {
  // 🧹 Clear leftover arrays and timers
  sparkles = [];
  hearts = [];
  foods = [];
  showYum = false;
  feedStartTime = null;
  gameStartTime = null;
  showJoke = false;
  jokeText = "";
  colorMode(RGB);

  // 🔁 Restore Eggzee’s visibility and state
  eggzee.visible = true;
  eggzee.x = width / 2;
  eggzee.y = height / 2;
  eggzee.rotation = 0;
  state = "awake";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}







