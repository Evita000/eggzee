function drawMiniGame() {
  if (!eggzee.visible) eggzee.visible = true;
  eggzee.img = eggzeeAwakeImg; // ensure image is set

  // Eggzee follows mouse horizontally
  eggzee.x = mouseX;
  eggzee.y = height / 2;

  // Draw Eggzee
  push();
  translate(eggzee.x, eggzee.y);
  rotate(radians(sin(frameCount*0.05)*5));
  imageMode(CENTER);
  image(eggzee.img, 0, 0, eggzee.img.width * eggzee.scale, eggzee.img.height * eggzee.scale);
  pop();

  // --- Sparkles ---
  if(frameCount % 15 === 0) {
    sparkles.push({x: random(50,width-50), y: -20, size: random(8,14), speed: random(1.5,3), alpha: 255});
  }

  for(let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    noStroke();
    fill(255,255,150,s.alpha);
    ellipse(s.x,s.y,s.size);
    s.y += s.speed;
    s.alpha -= 3;

    if(dist(s.x,s.y,eggzee.x,eggzee.y) < 80){
      hearts.push({x: eggzee.x + random(-30,30), y: eggzee.y - random(20,60), vy: -1, alpha: 255});
      sparkles.splice(i,1);
      heartsCaught++;
    }

    if(s.alpha <= 0 || s.y > height+20) sparkles.splice(i,1);
  }

  // --- UI text ---
  fill(255);
  textSize(22);
  textAlign(CENTER,TOP);
  text("Hearts caught: " + heartsCaught, width/2, 55);

  // End mini-game
  if(millis() - gameStartTime > gameDuration) {
    sparkles = [];
    state = "awake";
  }
}
