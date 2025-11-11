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
  for (let i = 0; i < 4; i++) {
    buttons.push({
      x: spacing * (i + 1),
      y: height - 90,
      w: 100,
      h: 80,
      label: ["🍩", "💃", "✨", "😂"][i],
    });
  }
}

function draw() {
  background(180);
  if (cityImg) image(cityImg, 0, 0, width, height);

  // 🥚 or 🐣
  imageMode(CENTER);
  if (state === "egg") image(eggImg, width / 2, height / 2, 200, 200);
  else image(eggzeeImg, width / 2, height / 2, 240, 240);

  // 🧠 Buttons
  for (let b of buttons) {
    fill(255, 240);
    rect(b.x - 50, b.y - 40, 100, 80, 20);
    fill(0);
    text(b.label, b.x, b.y);
  }

  // 💬 Text
  fill(255);
  text("Tap anywhere to switch Egg / Eggzee", width / 2, height - 30);
}

function mousePressed() {
  state = state === "egg" ? "awake" : "egg";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

}

