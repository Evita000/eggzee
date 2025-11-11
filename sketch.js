// 🐣 Eggzee — Interactive v8 (Feed drag + Joke + Hearts + Dance fix)
let state = "egg";
let eggSprite, eggzee;
let eggImg, eggzeeAwakeImg, eggzeeSleepImg;
let cityImg, cityNightImg;
let crackTime = 0;

// Timer
let energy = 120;
let startTime = null;

// Mini-game + hearts + feeding
let sparkles = [];
let hearts = [];
let foods = [];
let stars = [];
let heartsCaught = 0;
let gameStartTime = 0;
let gameDuration = 25000;

// Buttons
let feedBtn, danceBtn, gameBtn, jokeBtn;
let showYum = false;
let yumTimer = 0;
let hasWelcomed = false;

// Jokes
let showJoke = false;
let jokeText = "";
let jokeTimer = 0;

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
  textAlign(CENTER);
  textSize(20);

  // 📱 Adjust text size for smaller screens
  if (windowWidth < 600) textSize(16);
  else textSize(20);


 // 🥚 Egg (drawn manually for fallback)
eggSprite = { 
  visible: true,
  img: eggImg,
  x: width / 2,
  y: height / 2 + 40,
  scale: 0.1,
  rotation: 0
};

// 🐣 Eggzee (also manual for fallback)
eggzee = {
  visible: false,
  img: eggzeeAwakeImg,
  x: width / 2,
  y: height / 2,
  scale: 0.1,
  rotation: 0
};


  // 🍩 Buttons
  const spacing = width / 5;
feedBtn = createSprite(spacing * 1, height - 90, 100, 80);
danceBtn = createSprite(spacing * 2, height - 90, 100, 80);
gameBtn = createSprite(spacing * 3, height - 90, 100, 80);
jokeBtn = createSprite(spacing * 4, height - 90, 100, 80);

  feedBtn.visible = danceBtn.visible = gameBtn.visible = jokeBtn.visible = false;
}


// ---------- DRAW ----------
function draw() {
  const elapsed = startTime ? (millis() - startTime) / 1000 : 0;
  energy = startTime ? max(0, 120 - elapsed) : 120;

  // 🌇 Background
  const isNight = (energy <= 15 && startTime) || state === "sleep";
  if (isNight && cityNightImg) image(cityNightImg, 0, 0, width, height);
  else if (cityImg) image(cityImg, 0, 0, width, height);
  else background(245, 220, 180);

  // 💤 Sleep logic
  if (state === "awake" && energy <= 15) eggzee.changeImage("sleep");
  else if (state === "awake") eggzee.changeImage("awake");
  if (energy <= 15 && state === "awake") {
  state = "sleep";
}


  // Scenes
  if (state === "egg") drawEggScene();
  else if (state === "hatching") drawHatchingScene();
  else if (state === "awake") drawEggzeeScene();
  else if (state === "miniGame") drawMiniGame();
  else if (state === "dance") drawDanceScene();
  else if (state === "feed") drawFeedScene();
  else if (state === "sleep") drawSleepScene();

  drawFoods();
  drawSprites();
  drawHearts();
  drawStars();


  if (showYum) drawYumBubble();
  if (state !== "egg" && state !== "hatching") drawEnergyBar();
  drawOverlayText();
  drawButtons();
  drawJoke();
}

// ---------- SCENES ----------
function drawEggScene() {
  eggSprite.visible = true;
  eggzee.visible = false;
  eggSprite.rotation = sin(frameCount * 0.3) * 10;
}

function drawHatchingScene() {
  eggSprite.rotation = random(-15, 15);
  if (millis() - crackTime > 1200) {
    state = "awake";
    eggSprite.visible = false;
    eggzee.visible = true;
    startTime = millis();
    hasWelcomed = false;
  }
}

function drawEggzeeScene() {
  eggzee.rotation = sin(frameCount * 0.05) * 5;
}

// ✨ Mini-game (catch sparkles)
function drawMiniGame() {
  const targetX = mouseX;
  eggzee.position.x = constrain(targetX, 40, width - 40);
  eggzee.rotation = sin(frameCount * 0.05) * 5;

  if (frameCount % 15 === 0) {
    sparkles.push({
      x: random(50, width - 50),
      y: -20,
      size: random(8, 14),
      speed: random(1.5, 3),
      alpha: 255
    });
  }

  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    noStroke();
    fill(255, random(230, 255), random(180, 255), s.alpha);
    ellipse(s.x, s.y, s.size);
    s.y += s.speed;
    s.alpha -= 3;

    if (dist(s.x, s.y, eggzee.position.x, eggzee.position.y) < 250) {
      for (let j = 0; j < 3; j++) {
        hearts.push(makeHeart(
          eggzee.position.x + random(-30, 30),
          eggzee.position.y - random(20, 60)
        ));
      }
      sparkles.splice(i, 1);
      heartsCaught++;
    }

    if (s.alpha <= 0 || s.y > height + 20) sparkles.splice(i, 1);
  }

  fill(255);
  textSize(22);
  textAlign(CENTER, TOP);
  text("Hearts caught: " + heartsCaught, width / 2, 55);

  if (millis() - gameStartTime > gameDuration) {
    sparkles = [];
    state = "awake";
  }
}

function drawDanceScene() {
  // 🪩 Dancefloor background
  if (cityImg) image(cityImg, 0, 0, width, height);
  else background(0);

  // 💃 Eggzee's dance motion
  eggzee.visible = true;
  eggzee.position.x = width / 2 + sin(frameCount * 0.05) * 100;
  eggzee.position.y = height / 2 + cos(frameCount * 0.2) * 10;
  eggzee.rotation = sin(frameCount * 0.2) * 20;
  eggzee.scale = 0.12 + sin(frameCount * 0.1) * 0.01;

  // 💕 floating hearts while dancing
  if (frameCount % 10 === 0) {
    hearts.push(makeHeart(
      eggzee.position.x + random(-15, 15),
      eggzee.position.y - random(10, 30)
    ));
  }

  // ⏰ Automatically return to main menu after 10 seconds
  if (millis() - gameStartTime > 10000) {
    eggzee.position.x = width / 2;
    eggzee.position.y = height / 2;
    eggzee.rotation = 0;
    eggzee.scale = 0.1;
    state = "awake"; // ✅ go back to menu
  }
}


// 🍩 Feed scene with drag-to-feed
function drawFeedScene() {
  if (cityImg) image(cityImg, 0, 0, width, height);
  else background(255, 240, 200);

  eggzee.rotation = sin(frameCount * 0.2) * 10;
  eggzee.scale = 0.1 + sin(frameCount * 0.05) * 0.003;

  if (frameCount % 120 === 0 && foods.length < 5) {
    let emojiList = ["🍩", "🍎", "🍓", "🍪", "🍕"];
    foods.push({
      x: random(60, width - 60),
      y: random(height / 2 + 100, height - 100),
      emoji: random(emojiList),
      beingDragged: false
    });
  }

  textSize(40);
  for (let i = 0; i < foods.length; i++) {
    let f = foods[i];
    if (f.beingDragged) {
      f.x = mouseX;
      f.y = mouseY;
    }
    text(f.emoji, f.x, f.y);
  }

  for (let i = foods.length - 1; i >= 0; i--) {
    let f = foods[i];
    if (dist(f.x, f.y, eggzee.position.x, eggzee.position.y) < 80) {
      showYum = true;
      yumTimer = millis();
      for (let j = 0; j < 6; j++) {
  stars.push(makeStar(
    eggzee.position.x + random(-30, 30),
    eggzee.position.y - random(30, 60)
  ));
}

      foods.splice(i, 1);
    }
  }

  if (millis() - gameStartTime > 25000) {
    foods = [];
    state = "awake";
  }
}

// ---------- VISUAL HELPERS ----------
function drawFoods() {}
function drawYumBubble() {
  // 🐣 fun random reactions
  const phrases = [
    "Yum! 💕",
    "Delicious! 🍓",
    "So good! 😋",
    "Mmm… tasty! 🍪",
    "That hit the spot! 💫",
    "Egg-cellent choice! 🥚✨"
  ];

  // Pick one per feed interaction
  if (!drawYumBubble.currentPhrase || millis() - yumTimer < 100) {
    drawYumBubble.currentPhrase = random(phrases);
  }
  const phrase = drawYumBubble.currentPhrase;

  // 💬 Calculate bubble size dynamically based on text width
  textSize(18);
  const padding = 40;
  const bubbleW = textWidth(phrase) + padding;
  const bubbleH = 60;

  // 📍 Higher and better-positioned bubble
  const bx = eggzee.position.x + 80;
  const by = eggzee.position.y - 180; // raised higher

  // 🎀 Bubble style
  fill(255, 220, 240);
  stroke(200, 150, 200);
  strokeWeight(2);
  rect(bx - bubbleW / 2, by - bubbleH / 2, bubbleW, bubbleH, 25);

  // 💬 Tail pointing toward Eggzee
  noStroke();
  fill(255, 220, 240);
  triangle(
    bx - 10, by + bubbleH / 2,
    bx + 10, by + bubbleH / 2,
    bx, by + bubbleH / 2 + 15
  );

  // 🩷 Text
  fill(50);
  textAlign(CENTER, CENTER);
  text(phrase, bx, by);

  // 🕓 Duration
  if (millis() - yumTimer > 1500) showYum = false;
}



function makeHeart(x, y) {
  return { x, y, vy: random(-1.5, -0.5), alpha: 255 };
}

function makeStar(x, y) {
  return {
    x,
    y,
    size: random(6, 12),
    vy: random(-1.5, -0.5),
    alpha: 255,
    rotate: random(TWO_PI)
  };
}


function drawHearts() {
  if (!hearts.length) return;
  textSize(50);
  textAlign(CENTER, CENTER);
  for (let h of hearts) {
    text("❤️", h.x, h.y);
    h.y += h.vy;
    h.alpha -= 2;
  }
  hearts = hearts.filter(h => h.alpha > 0);
}

function drawStars() {
  if (!stars.length) return;
  noStroke();
  push();
  for (let s of stars) {
    push();
    translate(s.x, s.y);
    rotate(s.rotate);

    // 🌟 Bright bold colours (yellow, cyan, magenta, orange, lime)
    const brightColors = [
      [255, 255, 0],   // yellow
      [0, 255, 255],   // cyan
      [255, 0, 255],   // magenta
      [255, 128, 0],   // orange
      [128, 255, 0]    // lime
    ];
    const c = random(brightColors);
    fill(c[0], c[1], c[2], s.alpha);

    // ⭐ Draw 5-point star
    beginShape();
    for (let i = 0; i < 5; i++) {
      let angle = i * TWO_PI / 5;
      let x1 = cos(angle) * s.size;
      let y1 = sin(angle) * s.size;
      vertex(x1, y1);
      angle += PI / 5;
      let x2 = cos(angle) * (s.size / 2.5);
      let y2 = sin(angle) * (s.size / 2.5);
      vertex(x2, y2);
    }
    endShape(CLOSE);

    pop();
    s.y += s.vy;
    s.alpha -= 3;
    s.rotate += 0.02;
  }
  pop();
  stars = stars.filter(s => s.alpha > 0);
}





// ---------- JOKES ----------
// ---------- JOKES ----------

function tellJoke() {
  // 🧹 Reset joke state immediately so the old bubble disappears
  showJoke = false;

  // 🥚 Small delay ensures the bubble refreshes cleanly
  setTimeout(() => {
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

    // 🗨️ Pick new random joke and reset timer
    jokeText = random(jokes);
    showJoke = true;
    jokeTimer = millis();
  }, 50); // short delay to fully reset display
}

function drawJoke() {
  if (showJoke && millis() - jokeTimer < 5000) {
    push();
    textSize(18);
    textAlign(LEFT, TOP);

    // 🧠 Word wrap for long jokes
    const maxWidth = 260;
    const words = jokeText.split(' ');
    let lines = [''];
    let currentLine = 0;
    for (let w of words) {
      const testLine = lines[currentLine] + w + ' ';
      if (textWidth(testLine) < maxWidth - 40) {
        lines[currentLine] = testLine;
      } else {
        lines.push(w + ' ');
        currentLine++;
      }
    }

    // 📦 Bubble size & position
    const bubbleW = maxWidth;
    const bubbleH = 30 + lines.length * 25;
    const bx = eggzee.position.x + 90;
    const by = eggzee.position.y - bubbleH - 40;

    // 💬 Chat bubble
    fill(255, 255, 255, 230);
    stroke(200);
    strokeWeight(2);
    rect(bx, by, bubbleW, bubbleH, 20);

    // Bubble tail
    noStroke();
    fill(255, 255, 255, 230);
    triangle(bx + 40, by + bubbleH, bx + 70, by + bubbleH, bx + 55, by + bubbleH + 15);

    // Joke text
    fill(50);
    noStroke();
    let yOffset = by + 15;
    for (let line of lines) {
      text(line, bx + 20, yOffset);
      yOffset += 25;
    }

    // 💖 Bright pink helper text (pulsing glow)
    textAlign(CENTER, TOP);
    textSize(16);
    const glow = map(sin(frameCount * 0.2), -1, 1, 180, 255);
    fill(255, 80, 170, glow); // 💗 bright pink color
    text("Click again for more jokes!", bx + bubbleW / 2, by + bubbleH + 25);

    pop();

    // 🩷 Pulse the 😂 Joke button softly
    const pulse = map(sin(frameCount * 0.1), -1, 1, 150, 255);
    fill(255, 200, 230, pulse); // pinkish-yellow glow for button
    rect(jokeBtn.position.x - 50, jokeBtn.position.y - 40, 100, 80, 20, 20);
    fill(0);
    textSize(18);
    textAlign(CENTER, CENTER);
    text("😂", jokeBtn.position.x, jokeBtn.position.y - 10);
    textSize(14);
    text("Joke", jokeBtn.position.x, jokeBtn.position.y + 25);
  } else {
    showJoke = false;
  }
}



// ---------- UI ----------
function drawButtons() {
  // 🧠 Only show buttons when Eggzee is awake
  if (state !== "awake") return;

  // 🍩 Feed button
  fill(255, 200, 200);
  rect(feedBtn.position.x - 50, feedBtn.position.y - 40, 100, 80, 20);
  fill(0);
  text("🍩", feedBtn.position.x, feedBtn.position.y - 10);
  textSize(14);
  text("Feed", feedBtn.position.x, feedBtn.position.y + 25);

  // 💃 Dance button
  fill(200, 255, 200);
  rect(danceBtn.position.x - 50, danceBtn.position.y - 40, 100, 80, 20);
  fill(0);
  text("💃", danceBtn.position.x, danceBtn.position.y - 10);
  textSize(14);
  text("Dance", danceBtn.position.x, danceBtn.position.y + 25);

  // ✨ Mini-game button
  fill(200, 200, 255);
  rect(gameBtn.position.x - 50, gameBtn.position.y - 40, 100, 80, 20);
  fill(0);
  text("✨", gameBtn.position.x, gameBtn.position.y - 10);
  textSize(14);
  text("Game", gameBtn.position.x, gameBtn.position.y + 25);

  // 😂 Joke button
  fill(255, 255, 180);
  rect(jokeBtn.position.x - 50, jokeBtn.position.y - 40, 100, 80, 20);
  fill(0);
  text("😂", jokeBtn.position.x, jokeBtn.position.y - 10);
  textSize(14);
  text("Joke", jokeBtn.position.x, jokeBtn.position.y + 25);
}


// ---------- OVERLAY ----------
function drawOverlayText() {
  fill(60);
  textSize(20);
  textAlign(CENTER);

 if (state === "awake") {
  if (!hasWelcomed) {
  push();
  textAlign(CENTER, TOP);
  textSize(22);
  const pulse = map(sin(frameCount * 0.1), -1, 1, 180, 255);
  fill(255, 140, 200, pulse);
  text("💛 Hi, I’m Eggzee! I may crack easily...", width / 2, 40);
  text("but what breaks me makes me stronger 💫", width / 2, 70);
  pop();
}

  else {
    text("Choose an activity below!", width / 2, height - 20);
  }
}

  else if (state === "egg") {
    text("Tap the egg to hatch Eggzee 🥚", width / 2, height - 20);
  } 
  
  else if (state === "miniGame") {
  push();
  textAlign(CENTER, CENTER);

  // ⏳ Smooth fade-in
  const fade = constrain(map(millis() - gameStartTime, 0, 1000, 0, 255), 0, 255);
  const pulse = map(sin(frameCount * 0.1), -1, 1, 180, 255);

  // 💗 pulsing pink title
  fill(255, 150, 220, min(fade, pulse));
  textSize(36);
  text("✨ CATCH THE SPARKLES! ✨", width / 2, height / 2 - 260); // moved higher

  // 💙 calm blue instructions
  fill(180, 220, 255, fade);
  textSize(22);
  text("Move Eggzee left & right to collect hearts!", width / 2, height / 2 - 220); // raised higher
  pop();
}


 else if (state === "feed") {
  push();
  textAlign(CENTER, CENTER);
  textSize(30);

  // 🌊 Soft gradient blue that pulses gently
  const pulse = map(sin(frameCount * 0.1), -1, 1, 180, 255);
  fill(100, 180, 255, pulse);

  // 🩵 Title higher above Eggzee
  text("🍩 Feeding Time! 🍩", width / 2, height / 2 - 280);

  // 🩵 Instructions just below, smaller & brighter
  textSize(20);
  fill(160, 210, 255, pulse);
  text("Drag food to Eggzee to feed her 💕", width / 2, height / 2 - 240);
  pop();
}



  
  else if (state === "dance") {
    text("Eggzee’s dancing 💃", width / 2, height - 20);
  }
}

// ---------- ENERGY ----------
function drawEnergyBar() {
  const barWidth = 300;
  const pct = constrain(energy / 120, 0, 1);
  const currentWidth = barWidth * pct;
  noStroke();
  fill(255, 200, 0);
  rect(width / 2 - barWidth / 2, 30, currentWidth, 15, 10);
  stroke(255); noFill();
  rect(width / 2 - barWidth / 2, 30, barWidth, 15, 10);
  noStroke(); fill(255);
  textSize(14); textAlign(CENTER, TOP);
  text("Time left: " + ceil(energy) + "s", width / 2, 10);
}

// ---------- INPUT ----------
function mousePressed() {
  // 🖐 Check if user clicked a food to drag it
  for (let i = foods.length - 1; i >= 0; i--) {
    let f = foods[i];
    if (dist(mouseX, mouseY, f.x, f.y) < 30) {
      f.beingDragged = true;
      break;
    }
  }

  // 🥚 Handle hatch + buttons
  if (state === "egg") {
    state = "hatching";
    crackTime = millis();
  } 
 else if (state === "awake") {
  hasWelcomed = true;

  // 🧹 Clear any lingering joke bubble when switching activities
  showJoke = false;
  jokeText = "";


    if (mouseInsideRect(feedBtn)) {
      state = "feed";
      gameStartTime = millis();
    } 
    else if (mouseInsideRect(danceBtn)) {
      // 🪩 Open Animate dance tab
      window.open("eggzeedance.html", "_blank");
      state = "dance";
      gameStartTime = millis();

      // ⏰ Automatically return to main menu after 10 seconds
      setTimeout(() => {
        if (state === "dance") {
          state = "awake";
          eggzee.visible = true;
          eggzee.position.x = width / 2;
          eggzee.position.y = height / 2;
          eggzee.rotation = 0;
          eggzee.scale = 0.1;

          // ✅ Make sure all buttons are visible again
          feedBtn.visible = true;
          danceBtn.visible = true;
          gameBtn.visible = true;
          jokeBtn.visible = true;

          // 🥚 Optional: show message
          hasWelcomed = true;
          showJoke = true;
          jokeText = "💃 Dance complete — Eggzee’s back!";
          jokeTimer = millis();
        }
      }, 10000); // 10 seconds
    } 
    else if (mouseInsideRect(gameBtn)) {
      state = "miniGame";
      gameStartTime = millis();
      heartsCaught = 0;
    } 
    else if (mouseInsideRect(jokeBtn)) {
      tellJoke();
    }
  }
}


function mouseReleased() {
  for (let f of foods) f.beingDragged = false;
}

function mouseInsideRect(btn) {
  return (
    mouseX > btn.position.x - 50 &&
    mouseX < btn.position.x + 50 &&
    mouseY > btn.position.y - 40 &&
    mouseY < btn.position.y + 40
  );
}

// ---------- SLEEP SCENE ----------
function drawSleepScene() {
  // 🌌 Soft night gradient background
  for (let y = 0; y < height; y++) {
    let c = lerpColor(color(10, 10, 30), color(40, 30, 60), y / height);
    stroke(c);
    line(0, y, width, y);
  }

  // 💤 Eggzee visible and gently breathing
  eggzee.visible = true;
  eggzee.changeImage("sleep");
  eggzee.position.x = width / 2;
  eggzee.position.y = height / 2 + sin(frameCount * 0.03) * 8; // slow bobbing
  eggzee.scale = 0.1 + sin(frameCount * 0.03) * 0.003;

  // 🌟 Twinkling stars
  noStroke();
  for (let i = 0; i < 40; i++) {
    const x = (i * 100 + frameCount * 0.2) % width;
    const y = (i * 50 + frameCount * 0.3) % height / 1.5;
    const brightness = map(sin(frameCount * 0.05 + i), -1, 1, 180, 255);
    fill(255, 255, 200, brightness);
    ellipse(x, y, 2, 2);
  }

  // 🌙 Text
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(26);
  text("💤 Eggzee is sleeping... Tap to wake! 💫", width / 2, height - 100);
}


// ---------- RESIZE FOR PHONES ----------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function touchStarted() {
  mousePressed(); // reuse same logic
  return false;   // prevent mobile double-trigger scrolling
}


