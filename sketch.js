let eggImg, eggzeeImg, cityImg;
let state = "egg";
let buttons = [];

function preload() {
  eggImg = loadImage("assets/idelegg.png");
  eggzeeImg = loadImage("assets/eggzee7.png");
  cityImg = loadImage("assets/city.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(22);

  const spacing = width / 5;
  const labels = ["🍩 Feed", "💃 Dance", "✨ Game", "😂 Joke"];

  for (let i = 0; i < 4; i++) {
    buttons.push({
      x: spacing * (i + 1),
      y: height - 80,
      w: 100,
      h: 70,
      label: labels[i],
    });
  }
}

function draw() {
  // 🌇 Background
  if (cityImg) image(cityImg, 0, 0, width, height);
  else background(180);

  // 🐣 Egg or Eggzee
  imageMode(CENTER);
  if (state === "egg") image(eggImg, width / 2, height / 2, 200, 200);
  else image(eggzeeImg, width / 2, height / 2, 220, 220);

  // 🩷 Buttons
  textAlign(CENTER, CENTER);
  for (let b of buttons) {
    fill(255, 230);
    rect(b.x - 50, b.y - 35, b.w, b.h, 15);
    fill(0);
    textSize(18);
    text(b.label, b.x, b.y);
  }

  // 💬 Footer text
  fill(255);
  textSize(18);
  text("Tap the egg to hatch Eggzee 🥚", width / 2, height - 20);
}

function mousePressed() {
  // Toggle Egg <-> Eggzee
  state = state === "egg" ? "awake" : "egg";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


