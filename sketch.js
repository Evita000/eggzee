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
// ---------- DRAW LOOP ----------
function draw() {
  resetTextStyle(); // 💡 always start clean every frame

  // Background
  const isNight = (energy <= 15 && startTime) || state === "sleep";
  if (isNight && cityNightImg) image(cityNightImg, width / 2, height / 2, width, height);
  else if (cityImg) image(cityImg, width / 2, height / 2, width, height);
  else background(200);

  // Update energy
  const elapsed = startTime ? (millis() - startTime) / 1000 : 0;
  energy = startTime ? max(0, 120 - elapsed) : 120;
  // 💤 Auto sleep when time is almost over
if (energy < 15 && state !== "sleep") {
  state = "sleep";
}


  // Scenes
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

// ✅ Only ONE version of this
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

  // 🐣 Eggzee
  push();
  translate(eggzee.x, eggzee.y);
  image(eggzeeAwakeImg, 0, 0, eggzeeAwakeImg.width * 0.12, eggzeeAwakeImg.height * 0.12);
  pop();

  // 🍎 Spawn random foods
  if (frameCount % 120 === 0 && foods.length < 5) {
    let emojiList = ["🍩", "🍎", "🍓", "🍪", "🍕"];
    foods.push({
      x: random(60, width - 60),
      y: random(height / 2, height - 100),
      emoji: random(emojiList),
      beingDragged: false
    });
  }

  // 🍪 Draw & drag foods
  for (let f of foods) {
    if (f.beingDragged) {
      f.x = mouseX;
      f.y = mouseY;
    }
    textSize(40);
    text(f.emoji, f.x, f.y);

    // 🩷 Eat
    if (dist(f.x, f.y, eggzee.x, eggzee.y) < 80) {
      f.toRemove = true;
      showYum = true;
      yumTimer = millis();

      // ✨ Sparkles
      for (let i = 0; i < 10; i++) {
        sparkles.push({
          x: eggzee.x + random(-30, 30),
          y: eggzee.y + random(-30, 30),
          size: random(4, 10),
          speedY: random(-2, -5),
          alpha: 255
        });
      }

      // ❤️ Heart
      hearts.push({
        x: eggzee.x + random(-20, 20),
        y: eggzee.y - 60,
        vy: -2,
        alpha: 255
      });
    }
  }

  foods = foods.filter(f => !f.toRemove);

  // ✨ Sparkle animation
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    fill(255, 255, 200, s.alpha);
    noStroke();
    ellipse(s.x, s.y, s.size);
    s.y += s.speedY;
    s.alpha -= 5;
    if (s.alpha <= 0) sparkles.splice(i, 1);
  }

  // ❤️ Hearts animation
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    textSize(40);
    text("❤️", h.x, h.y);
    h.y += h.vy;
    h.alpha -= 3;
    if (h.alpha <= 0) hearts.splice(i, 1);
  }

drawYumBubble();



  // 🕒 Auto-return
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

// ---------- OTHER SCENES ----------
function drawSleepScene() {
  // 🌃 Show the city night background
  if (cityNightImg) {
    image(cityNightImg, width / 2, height / 2, width, height);
  } else {
    background(15, 10, 40); // fallback if image missing
  }

  // 😴 Floating Eggzee sleeping animation
  push();
  translate(eggzee.x, eggzee.y + sin(frameCount * 0.05) * 8);
  image(eggzeeSleepImg, 0, 0, eggzeeSleepImg.width * 0.1, eggzeeSleepImg.height * 0.1);
  pop();

  // 💬 Text overlay
  fill(255);
  textSize(20);
  text("💤 Eggzee is sleeping... Tap to wake! 💫", width / 2, height - 100);
}



function drawMiniGame() {
  if (state !== "miniGame") return;
  eggzee.visible = true;

  // 🕒 Start timer once per session
  if (gameStartTime === null) gameStartTime = millis();

  // 🐣 Control Eggzee movement
  if (touches && touches.length > 0) {
    eggzee.x = touches[0].x;
    eggzee.y = touches[0].y;
  } else if (mouseIsPressed) {
    eggzee.x = mouseX;
    eggzee.y = mouseY;
  }

  // 🐣 Draw Eggzee
  push();
  translate(eggzee.x, eggzee.y);
  rotate(radians(sin(frameCount * 0.05) * 5));
  image(eggzeeAwakeImg, 0, 0, eggzeeAwakeImg.width * eggzee.scale, eggzeeAwakeImg.height * eggzee.scale);
  pop();

  // ✨ Spawn sparkles
  if (frameCount % 10 === 0) {
    sparkles.push({
      x: random(50, width - 50),
      y: -10,
      size: random(10, 18),
      speed: random(2, 4),
      alpha: 255
    });
  }

  // ✨ Move sparkles + detect catches
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    fill(255, 255, 150, s.alpha);
    noStroke();
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

  // ❤️ Hearts float up
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    textSize(60);
    text("❤️", h.x, h.y);
    h.y += h.vy;
    h.alpha -= 4;
    if (h.alpha < 0) hearts.splice(i, 1);
  }

  // 🧮 Display score
  fill(255);
  textSize(22);
  text("Hearts caught: " + heartsCaught, width / 2, 50);

  // 🕒 Return to menu after 20 seconds
  if (millis() - gameStartTime > 20000) {
    hearts = [];
    sparkles = [];
    heartsCaught = 0;
    gameStartTime = null; // reset cleanly
    state = "awake";
  }
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

// ---------- HELPERS ----------
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
    const h = hearts[i];
    textSize(50);
    text("❤️", h.x, h.y);
    h.y += h.vy || -1;
    h.alpha = h.alpha || 255;
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

  // 💭 bubble position — consistent on all devices
  const bubbleX = width / 2;
  const bubbleY = height / 2 - height * 0.28;

  const bubbleW = 150;
  const bubbleH = 65;

  // 💭 draw bubble
  fill(255, 240, 250, fadeAmt);
  stroke(200, 100, 200, fadeAmt);
  rect(bubbleX, bubbleY, bubbleW, bubbleH, 25);

  // 🖋 text centered inside bubble
  noStroke();
  fill(0, 0, 0, fadeAmt);
  textSize(22);
  text("Yum! 💕", bubbleX, bubbleY + 2); // +2 tiny optical correction

  pop();

  // ⏰ fade out cleanly
  if (elapsed > 1000) showYum = false;
}









// ---------- TEXT & ENERGY ----------
let bubbleScale = 1; // new global variable near top of your file

function drawJoke() {
  if (!showJoke) return;

  let elapsed = millis() - jokeTimer;
  let alpha = map(elapsed, 0, 3000, 255, 0);
  alpha = constrain(alpha, 0, 255);

  // 🫧 Smooth pop-in
  bubbleScale = lerp(bubbleScale, 1, 0.15);

  const bubbleX = width / 2;
  const bubbleY = height / 2 - 200;
  const bubbleW = min(width * 0.7, 420);
  const bubbleH = 110;

  push();
  translate(bubbleX, bubbleY);
  scale(bubbleScale);
  translate(-bubbleX, -bubbleY);

  // 💭 bubble background (soft pink glow)
  fill(255, 230, 250, alpha);
  stroke(255, 120, 220, alpha);
  strokeWeight(4);
  rectMode(CENTER);
  rect(bubbleX, bubbleY, bubbleW, bubbleH, 30);

  // 💫 tail
  noStroke();
  fill(255, 230, 250, alpha);
  beginShape();
  vertex(bubbleX + 30, bubbleY + bubbleH / 2 - 10);
  vertex(bubbleX + 55, bubbleY + bubbleH / 2 + 25);
  vertex(bubbleX + 5, bubbleY + bubbleH / 2 - 5);
  endShape(CLOSE);

  // 🌈 glowing text — bright gradient effect
  let glowR = map(sin(frameCount * 0.05), -1, 1, 200, 255);
  let glowG = map(cos(frameCount * 0.08), -1, 1, 100, 220);
  let glowB = map(sin(frameCount * 0.1), -1, 1, 180, 255);
  fill(glowR, glowG, glowB, alpha);
  textAlign(CENTER, CENTER);
  textSize(22);
  textStyle(BOLD);
  text(jokeText, bubbleX, bubbleY, bubbleW - 20, bubbleH - 20);

  pop();

  // ⏰ hide after ~3s
  if (elapsed > 3000) showJoke = false;
}



function drawOverlayText() {
  fill(255);
  textSize(20);
  if (state === "awake") {
    if (!hasWelcomed) text("💛 Hi, I’m Eggzee! Tap a button below!", width / 2, 50);
    else text("Choose an activity below!", width / 2, 50);
  }
}

function drawEnergyBar() {
  if (state === "egg") return;

  const barWidth = 300;
  const pct = constrain(energy / 120, 0, 1);

  // Draw bar
  fill(255, 200, 0);
  rect(width / 2 - barWidth / 2, 30, barWidth * pct, 15, 10);
  stroke(255);
  noFill();
  rect(width / 2 - barWidth / 2, 30, barWidth, 15, 10);

  // ✅ Reset text formatting before drawing
  noStroke();
  fill(255);
  textSize(20); // force consistent size every frame
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


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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




















