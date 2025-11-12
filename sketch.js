let state = "egg";
console.log("📱 Eggzee script loaded");
let eggImg, eggzeeAwakeImg, eggzeeSleepImg, cityImg, cityNightImg;
let eggzee = {};
let crackTime = 0;
let energy = 120;
let startTime = null;
let hasWelcomed = false;
let lastTouchTime = 0; // 🧩 prevent double bubble on mobile
let sleepFade = 0; // 🌙 controls smooth fade for sleep transition



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

// ---------- PRELOAD ----------
function preload() {
  console.log("🪄 Preloading assets...");
  
  // 🖼️ Load all images (unchanged)
  eggImg = loadImage("assets/idelegg.png");
  eggzeeAwakeImg = loadImage("assets/eggzee7.png");
  eggzeeSleepImg = loadImage("assets/eggzee5.png");
  cityImg = loadImage("assets/city.jpg");
  cityNightImg = loadImage("assets/city_night.jpg");
}

// ---------- SETUP ----------
function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);

  // ✨ temporary loading background
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Loading Eggzee… 🥚", width / 2, height / 2);

  imageMode(CENTER);
  textSize(20);
  textAlign(CENTER, CENTER);


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

  setupDanceButtonFix(); // 🟢 ensures mobile works
}

// ---------- DRAW LOOP ----------
function draw() {
  // Background
  const isNight = (energy <= 15 && startTime) || state === "sleep";
  if (isNight && cityNightImg) image(cityNightImg, width / 2, height / 2, width, height);
  else if (cityImg) image(cityImg, width / 2, height / 2, width, height);
  else background(200);

  // Update energy
const elapsed = startTime ? (millis() - startTime) / 1000 : 0;
energy = startTime ? max(0, 120 - elapsed) : 120;

// 🌙 Auto-sleep when energy runs out
if (energy <= 0 && state !== "sleep") {
  sleepFade = 0; // reset fade
  state = "sleep";
}



  // Scenes
  if (state === "egg") drawEggScene();
  else if (state === "hatching") drawHatchingScene();
  else if (state === "awake") drawEggzeeScene();
  else if (state === "feed") drawFeedScene();
  else if (state === "miniGame") drawMiniGame();
  else if (state === "sleep") drawSleepScene();

  // Draw UI + extras (🌟 no debug text anymore)
drawFoods();
drawHearts();
drawButtons();
drawYumBubble();
drawEnergyBar();
drawJoke(); // draw joke first
drawOverlayText(); // then the intro text on top
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

  // 🥚 Tremble animation only during hatching
  const trembleX = random(-3, 3);
  const trembleY = sin(frameCount * 0.3) * 5;
  push();
  translate(width / 2 + trembleX, height / 2 + 40 + trembleY);
  image(eggImg, 0, 0, 200, 200);
  pop();

  // ⏳ Wait 2 seconds before hatching Eggzee
  if (millis() - crackTime > 2000) {
    state = "awake";
    eggzee.visible = true;
    startTime = millis();
    hasWelcomed = false;
  }
}


function drawFeedScene() {
  if (!eggzee.visible) eggzee.visible = true;

  // 🐣 Draw Eggzee
  push();
  translate(eggzee.x, eggzee.y);
  image(
    eggzeeAwakeImg,
    0,
    0,
    eggzeeAwakeImg.width * 0.12,
    eggzeeAwakeImg.height * 0.12
  );
  pop();

  // 🍎 Spawn random foods safely
  if (frameCount % 120 === 0 && foods.length < 5) {
    const emojiList = ["🍩", "🍎", "🍓", "🍪", "🍕"];
    foods.push({
      x: random(60, width - 60),
      y: random(height / 2, height - 100),
      emoji: random(emojiList),
      beingDragged: false,
      toRemove: false
    });
  }

  // 🍪 Draw + drag foods
  for (let f of foods) {
    if (f.beingDragged) {
      f.x = mouseX;
      f.y = mouseY;
    }
    textSize(40);
    text(f.emoji, f.x, f.y);

    // 🩷 Detect “eating”
    if (dist(f.x, f.y, eggzee.x, eggzee.y) < 80 && !f.toRemove) {
      f.toRemove = true;

      if (!showYum) {
        showYum = true;
        yumTimer = millis();
        drawYumBubble.currentPhrase = null;
      }

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

      // ❤️ Heart float
      hearts.push({
        x: eggzee.x + random(-20, 20),
        y: eggzee.y - 60,
        vy: -2,
        alpha: 255
      });
    }
  }

  // 🚮 Safely remove eaten foods
  foods = foods.filter(f => !f.toRemove);

  // ✨ Animate sparkles
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    fill(255, 255, 200, s.alpha);
    noStroke();
    ellipse(s.x, s.y, s.size);
    s.y += s.speedY;
    s.alpha -= 5;
    if (s.alpha <= 0) sparkles.splice(i, 1);
  }

  // ❤️ Animate hearts
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    textSize(40);
    text("❤️", h.x, h.y);
    h.y += h.vy;
    h.alpha -= 3;
    if (h.alpha <= 0) hearts.splice(i, 1);
  }

  // 🕒 Return to main menu after 25 seconds of feeding
  if (startTime && millis() - startTime > 25000) {
    state = "awake";
  }
}





function drawSleepScene() {
  // 🌌 Soft fade to night background
  background(15, 10, 40);
  if (cityNightImg) {
    image(cityNightImg, width / 2, height / 2, width, height);
  }

  // 💤 Gentle floating sleep motion (no side drift)
  const floatY = sin(frameCount * 0.03) * 6;

  push();
  translate(width / 2, eggzee.y + floatY);
  image(
    eggzeeSleepImg,
    0,
    0,
    eggzeeSleepImg.width * 0.1,
    eggzeeSleepImg.height * 0.1
  );
  pop();

  // 🌙 Calm “sleeping” text
  textAlign(CENTER, CENTER);
  textSize(width < 600 ? 18 : 22);
  fill(255, 230, 255);
  text("💤 Eggzee is sleeping... Tap to wake! 💫", width / 2, height - 100);
}



function drawMiniGame() {
  if (state !== "miniGame") return;
  
  // 🧹 Safety clear in case any food emojis remain
  foods = [];

  eggzee.visible = true;


  // Follow mouse or touch
  if (touches && touches.length > 0) {
    eggzee.x = touches[0].x;
    eggzee.y = touches[0].y;
  } else if (mouseX && mouseY) {
    eggzee.x = mouseX;
    eggzee.y = mouseY;
  } else {
    eggzee.x = width / 2;
    eggzee.y = height / 2;
  }

  // 🐣 Eggzee sprite
  push();
  translate(eggzee.x, eggzee.y);
  rotate(radians(sin(frameCount * 0.05) * 5));
  image(eggzeeAwakeImg, 0, 0, eggzeeAwakeImg.width * eggzee.scale, eggzeeAwakeImg.height * eggzee.scale);
  pop();

  // ✨ Drop sparkles
  if (frameCount % 10 === 0) {
    sparkles.push({
      x: random(50, width - 50),
      y: -10,
      size: random(10, 18),
      speed: random(2, 4),
      alpha: 255
    });
  }

  // Move sparkles + catch hearts
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
      i--;
    }
    if (s.y > height || s.alpha < 0) sparkles.splice(i, 1);
  }

  // ❤️ Hearts float
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

 // 🕒 Return to main menu after 20 seconds of mini-game play
  if (millis() - gameStartTime > 20000) {
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

function drawEggzeeScene() {
  if (!eggzee.visible) return;

  // 🧘 Gentle idle motion for Eggzee
  let sway = sin(frameCount * 0.03) * 2; // small side sway
  let bounce = showJoke ? sin(frameCount * 0.2) * 3 : 0; // gentle bounce when laughing

  push();
  translate(eggzee.x, eggzee.y + bounce);
  rotate(radians(sway));
  image(
    eggzeeAwakeImg,
    0, 0,
    eggzeeAwakeImg.width * eggzee.scale,
    eggzeeAwakeImg.height * eggzee.scale
  );
  pop();
}


// ---------- FEED HELPERS ----------
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
  // 🩷 Prevent multiple overlapping or double-triggered bubbles
  if (!showYum) return;

  // 💬 Choose phrase once per feed
  if (!drawYumBubble.currentPhrase) {
    const phrases = [
      "Yum! 💕",
      "Delicious! 🍓",
      "So good! 😋",
      "Mmm… tasty! 🍪",
      "That hit the spot! 💫",
      "Egg-cellent choice! 🥚✨"
    ];
    drawYumBubble.currentPhrase = random(phrases);
  }
  const phrase = drawYumBubble.currentPhrase;

  // 🫧 Bubble style
  textSize(18);
  const padding = 40;
  const bubbleW = textWidth(phrase) + padding;
  const bubbleH = 60;

  const bx = eggzee.x + 80;
  const by = eggzee.y - 160;

  fill(255, 230, 250);
  stroke(200, 120, 200);
  strokeWeight(2);
  rect(bx - bubbleW / 2, by - bubbleH / 2, bubbleW, bubbleH, 25);

  noStroke();
  fill(255, 230, 250);
  triangle(
    bx - 10, by + bubbleH / 2,
    bx + 10, by + bubbleH / 2,
    bx, by + bubbleH / 2 + 15
  );

  fill(50);
  noStroke();
  textAlign(CENTER, CENTER);
  text(phrase, bx, by);

  // 🕒 Hide + reset phrase once done
  if (millis() - yumTimer > 1500) {
    showYum = false;
    drawYumBubble.currentPhrase = null;
  }
}

// ---------- TEXT & ENERGY ----------
function drawJoke() {
  if (!showJoke) return;

  // 🧩 Temporarily hide overlay text
  hasWelcomed = true; // ensures only joke shows during display

  const duration = 4000;
  const elapsed = millis() - jokeTimer;
  let alpha = 255;

  // Fade in/out
  if (elapsed < 400) alpha = map(elapsed, 0, 400, 0, 255);
  else if (elapsed > duration - 400) alpha = map(elapsed, duration - 400, duration, 255, 0);

  const bx = eggzee.visible ? eggzee.x : width / 2;
  const by = eggzee.visible ? eggzee.y - 220 : height / 2 - 200;

  textSize(20);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  // 🧠 Auto line wrap so jokes stay in the bubble
  const maxWidth = min(320, width * 0.8);
  const words = jokeText.split(" ");
  let lines = [""];
  for (let w of words) {
    let currentLine = lines[lines.length - 1];
    if (textWidth(currentLine + " " + w) < maxWidth) {
      lines[lines.length - 1] = currentLine + " " + w;
    } else {
      lines.push(w);
    }
  }

  const lineHeight = 26;
  const bubbleH = lines.length * lineHeight + 40;
  const bubbleW = maxWidth + 60;

  // 🎨 Bubble background
  noStroke();
  fill(255, 220, 255, alpha);
  rect(bx - bubbleW / 2, by - bubbleH / 2, bubbleW, bubbleH, 25);
  fill(255, 180, 255, alpha * 0.9);
  rect(bx - bubbleW / 2 + 3, by - bubbleH / 2 + 3, bubbleW - 6, bubbleH - 6, 25);

  // 🫧 Tail
  fill(255, 200, 255, alpha);
  triangle(
    bx - 15, by + bubbleH / 2,
    bx + 15, by + bubbleH / 2,
    bx, by + bubbleH / 2 + 18
  );

  // 💬 Text
  fill(80, 0, 120, alpha);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i].trim(), bx, by - (lines.length - 1) * lineHeight / 2 + i * lineHeight);
  }

  if (elapsed > duration) showJoke = false;
}




function drawOverlayText() {
  // 👇 only show when awake, and when NO joke is showing
  if (state === "awake" && !showJoke) {
    push(); // isolate text style so jokes don’t affect it
    textAlign(CENTER, CENTER);
    textStyle(BOLD);

    // 🪄 Adjust size for mobile screens
    const baseSize = width < 450 ? 16 : width < 800 ? 20 : 26;
    textSize(baseSize);

    const message = !hasWelcomed
      ? "💛 Hi, I’m Eggzee! What breaks me, makes me."
      : "Choose an activity below!";

    // 🌈 Gold shimmer animation
    let pulse = sin(frameCount * 0.05) * 50 + 205;
    let goldenColor = color(pulse, 210, 70);

    // 🔸 Word wrapping for mobile so text never cuts off
    textWrap(WORD);
    for (let i = 0; i < 6; i++) {
      fill(255, 140 - i * 15, 0, 100 - i * 10);
      text(message, width / 2, height * 0.12 + i * 0.5, width * 0.9);
    }

    fill(goldenColor);
    stroke(255, 200, 0);
    strokeWeight(2);
    text(message, width / 2, height * 0.12, width * 0.9);
    noStroke();
    pop();
  }
}


function drawEnergyBar() {
  if (state === "egg") return;

  push(); // 🧩 isolates all style changes so nothing leaks out

  const barWidth = 300;
  const barHeight = 15;
  const pct = constrain(energy / 120, 0, 1);
  const x = width / 2 - barWidth / 2;
  const y = 30;

  // 🟡 Reset text + drawing styles (stops inherited scaling)
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  textFont('sans-serif'); // forces consistent font baseline
  textSize(18); // fixed forever, doesn’t grow

  // 🔋 Color shifts smoothly by energy
  let energyColor;
  if (pct > 0.6) energyColor = color(255, 220, 80);
  else if (pct > 0.3) energyColor = color(255, 160, 60);
  else energyColor = color(255, 70, 70);

  // ✨ Soft glow behind bar
  noStroke();
  fill(red(energyColor), green(energyColor), blue(energyColor), 60);
  rect(x - 3, y - 3, barWidth + 6, barHeight + 6, 12);

  // Main bar
  fill(energyColor);
  rect(x, y, barWidth * pct, barHeight, 10);

  // Outline
  stroke(255);
  noFill();
  rect(x, y, barWidth, barHeight, 10);
  noStroke();

  // ⏳ Stable label (never flickers or grows)
  fill(255);
  text("Time left: " + ceil(energy) + "s", width / 2, 12);

  pop(); // 🧩 restore previous text settings
}




// ---------- INPUT ----------
function mousePressed() {
  if (state === "egg") {
    state = "hatching";
    crackTime = millis();
  } else if (state === "awake") {
    hasWelcomed = true;
    if (insideButton(feedBtn)) {
  state = "feed";

  // 🧹 Reset feed state cleanly each time
  foods = [];
  sparkles = [];
  hearts = [];
  showYum = false;
  drawYumBubble.currentPhrase = null;

  // 🍳 Reset Eggzee’s position to center
  eggzee.x = width / 2;
  eggzee.y = height / 2;
}

    else if (insideButton(danceBtn)) openDancePage();
    else if (insideButton(jokeBtn)) tellJoke();
   else if (insideButton(gameBtn)) {
  state = "miniGame";
  gameStartTime = millis();
  heartsCaught = 0;

  // 🧹 Clear leftover food items from Feed mode
  foods = [];
}


  } else if (state === "sleep") state = "awake";

  for (let f of foods)
    if (dist(mouseX, mouseY, f.x, f.y) < 30) f.beingDragged = true;
}

function mouseReleased() {
  for (let f of foods) f.beingDragged = false;
}

function touchStarted() {
  // 🧩 Prevent double tap on mobile
  if (millis() - lastTouchTime < 600) return false;
  lastTouchTime = millis();

  // 🔧 Sync touch → mouse position before triggering press
  if (touches.length > 0) {
    mouseX = touches[0].x;
    mouseY = touches[0].y;
  }

  // 🥚 trigger the same press logic
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
    "Keep calm and egg on. 🧘‍♀️",
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

// ---------- DANCE BUTTON ----------
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

// ✅ End of Eggzee Script — all good!











































