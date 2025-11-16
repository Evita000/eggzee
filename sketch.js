function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}



let state = localStorage.getItem("eggzeeForceAwake") === "true" ? "awake" : "egg";


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
// Instruction overlays


// ---------- Instruction overlays ----------
let showFeedInstructions = false;
let feedInstructionTimer = 0;

let showGameInstructions = false;
let gameInstructionTimer = 0;

let showJokeInstructions = false;
let jokeInstructionTimer = 0;

let showDanceInstructions = false;
let danceInstructionTimer = 0;


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
  localStorage.removeItem("eggzeeForceAwake"); // 🧹 ensures fresh hatch start

  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  frameRate(30);

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
    scale: 0.35,
    rotation: 0
  };

  // 🩵 Responsive button layout for mobile and desktop
let btnY = height - (width < 600 ? 120 : 90); // a little higher on mobile
let spacing = width < 600 ? width / 4.8 : width / 5; // wider gaps for mobile

feedBtn = { x: spacing * 1, y: btnY };
danceBtn = { x: spacing * 2, y: btnY };
gameBtn = { x: spacing * 3, y: btnY };
jokeBtn = { x: spacing * 4, y: btnY };


  setupDanceButtonFix(); // 🟢 ensures mobile works


  
   // 🕐 Auto-restore awake state if saved
  if (localStorage.getItem("eggzeeForceAwake") === "true") {
    state = "awake";
    eggzee.visible = true;
    hasWelcomed = true;
    startTime = millis();
   energy = parseFloat(localStorage.getItem("eggzeeEnergy")) || 120;
if (!startTime) startTime = millis();

  }
} // 👈 keep this closing brace at the end of setup()

// ---------- DRAW ----------

// ---------- DRAW ----------
function draw() {
  const isNight = (energy <= 15 && startTime) || state === "sleep";
  if (isNight && cityNightImg) image(cityNightImg, width / 2, height / 2, width, height);
  else if (cityImg) image(cityImg, width / 2, height / 2, width, height);
  else background(200);

  // 🕒 Always update energy every frame (global countdown)
if (startTime) {
  const elapsed = (millis() - startTime) / 1000;
  energy = max(0, 120 - elapsed);

  // 🌙 Auto-sleep when drained
  if (energy <= 0 && state !== "sleep") {
    state = "sleep";
    sleepFade = 0;
  }
}

 

  if (state === "egg") drawEggScene();
  else if (state === "hatching") drawHatchingScene();
  else if (state === "awake") drawEggzeeScene();
  else if (state === "feed") drawFeedScene();
  else if (state === "miniGame") drawMiniGame();
  else if (state === "sleep") drawSleepScene();

  drawFoods();
  drawHearts();
  drawButtons();
  drawYumBubble();
  drawEnergyBar();
  drawJoke();
  drawOverlayText();
  drawInstructions();
} // 👈 end of draw()

// ---------- EGG SCENE ----------
function drawEggScene() {
  // 🥚 Draw egg centered
  image(eggImg, width / 2, height / 2 + 40, 200, 200);

  // 💬 Tap text message
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
 

  eggzee.visible = false;
}



// ---------- SCENES ----------
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

  // 🐣 Hatch sequence (visible for ~4 seconds)
  let elapsed = millis() - crackTime;
  if (elapsed < 2000) {
    fill(255);
    textSize(24);
    text("...crack...", width / 2, height - 120);
  } else if (elapsed < 4000) {
    fill(255);
    textSize(26);
    text("Eggzee is hatching! 💫", width / 2, height - 120);
  } else {
    state = "awake";
    eggzee.visible = true;
    if (!startTime) startTime = millis();
    hasWelcomed = false;
  }
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

  // 🧭 Allow Eggzee to follow touch/mouse slowly for mobile
  if (touches && touches.length > 0) {
    eggzee.x = lerp(eggzee.x, touches[0].x, 0.25);
    eggzee.y = lerp(eggzee.y, touches[0].y, 0.25);
  } else if (mouseIsPressed) {
    eggzee.x = lerp(eggzee.x, mouseX, 0.25);
    eggzee.y = lerp(eggzee.y, mouseY, 0.25);
  }

  // 🍎 Spawn random foods (spawn immediately + ongoing)
  // 🍎 Timed food spawns — ensures multiple appear smoothly on laptop
if (!drawFeedScene.lastSpawn || millis() - drawFeedScene.lastSpawn > 2500) {
  if (foods.length < 5) {
    const emojiList = ["🍩", "🍎", "🍓", "🍪", "🍕"];
    foods.push({
      x: random(60, width - 60),
      y: random(height / 2, height - 100),
      emoji: random(emojiList),
      beingDragged: false,
      toRemove: false
    });
  }
  drawFeedScene.lastSpawn = millis();
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

  // 🚮 Remove eaten foods
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

 // 💖 Score display (below the energy bar so it doesn’t overlap)
// 💖 Score display (well below the energy bar)
push();
textAlign(CENTER, CENTER);
textSize(24);

// soft glow behind text
for (let i = 5; i > 0; i--) {
  fill(255, 230, 120, 20 * i);
  text("Hearts caught: " + heartsCaught, width / 2 + i, 120 + i);
}

// crisp front text
fill(255, 230, 120);
stroke(0);
strokeWeight(4);
text("Hearts caught: " + heartsCaught, width / 2, 120);
noStroke();
pop();



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
  const btnW = width < 500 ? 110 : 120; // bigger for mobile
  const btnH = width < 500 ? 90 : 80;

  fill(255, 255, 255, 200);
  rect(btn.x - btnW / 2, btn.y - btnH / 2, btnW, btnH, 25);

  fill(0);
  textSize(width < 500 ? 26 : 20);
  text(emoji, btn.x, btn.y - 10);
  textSize(width < 500 ? 16 : 14);
  text(label, btn.x, btn.y + 25);
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

  hasWelcomed = true; // hide overlay while showing joke
  const duration = 4000;
  const elapsed = millis() - jokeTimer;
  let alpha = 255;

  // ⏳ Fade in/out
  if (elapsed < 400) alpha = map(elapsed, 0, 400, 0, 255);
  else if (elapsed > duration - 400) alpha = map(elapsed, duration - 400, duration, 255, 0);

  // 🧭 Base position (keeps text above Eggzee but never off-screen)
  const bx = constrain(eggzee.x, 120, width - 120);
  const by = constrain(eggzee.y - 180, 100, height - 180);

  textSize(width < 500 ? 16 : 20);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  // 🧠 Auto line wrapping
  const maxWidth = min(300, width * 0.8);
  const words = jokeText.split(" ");
  let lines = [""];
  for (let w of words) {
    const currentLine = lines[lines.length - 1];
    if (textWidth(currentLine + " " + w) < maxWidth) {
      lines[lines.length - 1] = currentLine + " " + w;
    } else {
      lines.push(w);
    }
  }

  const lineHeight = 24;
  const bubbleH = lines.length * lineHeight + 40;
  const bubbleW = maxWidth + 50;

  // 🎨 Bubble background (light pink)
  noStroke();
  fill(255, 230, 255, alpha);
  rect(bx - bubbleW / 2, by - bubbleH / 2, bubbleW, bubbleH, 25);
  fill(255, 190, 255, alpha * 0.9);
  rect(bx - bubbleW / 2 + 3, by - bubbleH / 2 + 3, bubbleW - 6, bubbleH - 6, 25);

  // 🫧 Tail — points toward Eggzee’s head
  fill(255, 210, 255, alpha);
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

  // 🕒 Auto-hide after time
  if (elapsed > duration) showJoke = false;
}

function drawOverlayText() {
  push();
  textAlign(CENTER, CENTER);
  textSize(20);
  fill(255);
  noStroke();

  if (state === "egg") {
    text("Tap the egg to hatch Eggzee 🥚", width / 2, height - 40);
  } 
 
  else if (state === "sleep") {
    text("Eggzee is sleeping 😴", width / 2, height - 60);
  } 
  else if (state === "awake" && energy <= 15) {
    text("Eggzee is getting sleepy... 🌙", width / 2, height - 60);
  }

  pop();
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
    lastTouchTime = millis() + 4000; // prevent fast re-tap
    return;
  }

  else if (state === "awake") {
    hasWelcomed = true;

    if (insideButton(feedBtn)) {
      state = "feed";
      foods = [];
      sparkles = [];
      hearts = [];
      showYum = false;
      drawYumBubble.currentPhrase = null;
      eggzee.x = width / 2;
      eggzee.y = height / 2;
      showFeedInstructions = true;
      feedInstructionTimer = millis();
    }

    else if (insideButton(danceBtn)) {
      showDanceInstructions = true;
      danceInstructionTimer = millis();

      localStorage.setItem("eggzeeForceAwake", "true");
      localStorage.setItem("eggzeeEnergy", energy.toString());
      openDancePage();

      state = "awake";
      hasWelcomed = true;
      eggzee.visible = true;
      if (!startTime) startTime = millis();

      window.addEventListener("focus", () => {
        if (localStorage.getItem("eggzeeForceAwake") === "true") {
          state = "awake";
          hasWelcomed = true;
          eggzee.visible = true;
          energy = parseFloat(localStorage.getItem("eggzeeEnergy")) || 120;
          if (!startTime) startTime = millis();
          foods = [];
          sparkles = [];
          hearts = [];
          localStorage.removeItem("eggzeeForceAwake");
        }
      });
    }

    else if (insideButton(jokeBtn)) {
      tellJoke();
      showJokeInstructions = true;
      jokeInstructionTimer = millis();
    }

    else if (insideButton(gameBtn)) {
      state = "miniGame";
      gameStartTime = millis();
      heartsCaught = 0;
      foods = [];
      showGameInstructions = true;
      gameInstructionTimer = millis();
    }
  } 
  else if (state === "sleep") {
    state = "awake";
  }

  for (let f of foods)
    if (dist(mouseX, mouseY, f.x, f.y) < 30)
      f.beingDragged = true;
}





function mouseReleased() {
  for (let f of foods) f.beingDragged = false;
}

function touchStarted() {
  // 🐣 Allow tapping egg to hatch on touch screens
  if (state === "egg" && millis() > lastTouchTime) {
    state = "hatching";
    crackTime = millis();
    lastTouchTime = millis() + 4000; // block further taps for 4s
    return false;
  }

  // 🧩 otherwise handle other game interactions
  if (millis() < lastTouchTime) return false;
  lastTouchTime = millis() + 4000;

  // 🔧 Sync touch → mouse before triggering mousePressed logic
  if (touches.length > 0) {
    mouseX = touches[0].x;
    mouseY = touches[0].y;
  }

  mousePressed();
  return false;
}


function insideButton(btn) {
  // 🖐️ Larger, more responsive hitbox for mobile screens
  const btnW = width < 600 ? 140 : 120; // wider on small screens
  const btnH = width < 600 ? 110 : 80;  // taller on small screens

  return (
    mouseX > btn.x - btnW / 2 &&
    mouseX < btn.x + btnW / 2 &&
    mouseY > btn.y - btnH / 2 &&
    mouseY < btn.y + btnH / 2
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

function drawInstructions() {
  fill(255, 255, 255, 240);
  textAlign(CENTER, CENTER);
  textSize(width < 600 ? 16 : 20);
  let now = millis();

  // 🍎 FEED instructions
  if (showFeedInstructions) {
    text("🍎 Drag food to Eggzee to feed her!", width / 2, height * 0.15);
    if (now - feedInstructionTimer > 5000) showFeedInstructions = false;
  }

  // ✨ GAME instructions
  if (showGameInstructions) {
    text("✨ Move Eggzee to catch falling sparkles!", width / 2, height * 0.15);
    if (now - gameInstructionTimer > 5000) showGameInstructions = false;
  }

  // 😂 JOKE instructions
  if (showJokeInstructions) {
    text("😂 Tap the button to make Eggzee tell a joke!", width / 2, height * 0.18);
    if (now - jokeInstructionTimer > 5000) showJokeInstructions = false;
  }

  // 💃 DANCE instructions
  if (showDanceInstructions) {
    text("💃 Tap once to make Eggzee dance in a new tab!", width / 2, height * 0.21);
    if (now - danceInstructionTimer > 5000) showDanceInstructions = false;
  }
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









































































