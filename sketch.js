// Fix: assign eggzee.img for awake/sleep
function drawEggzeeScene() {
  if (!eggzee.visible) return;

  // Always assign current image
  eggzee.img = eggzeeAwakeImg;

  eggzee.rotation = sin(frameCount * 0.05) * 5;
  push();
  translate(eggzee.x, eggzee.y);
  rotate(radians(eggzee.rotation));
  image(eggzee.img, 0, 0, eggzee.img.width * eggzee.scale, eggzee.img.height * eggzee.scale);
  pop();
}

// Also fix sleep scene
function drawSleepScene() {
  background(15,10,40);
  eggzee.img = eggzeeSleepImg;
  push();
  translate(eggzee.x, eggzee.y + sin(frameCount*0.05)*8);
  image(eggzee.img, 0, 0, eggzee.img.width*eggzee.scale, eggzee.img.height*eggzee.scale);
  pop();
  fill(255);
  text("💤 Eggzee is sleeping... Tap to wake! 💫", width/2, height - 100);
}

// And in hatching
function drawHatchingScene() {
  fill(0,50);
  rect(0,0,width,height);
  image(eggImg, width/2, height/2 + 40 + sin(frameCount*0.3)*5, 200, 200);

  if(millis() - crackTime > 1000){
    state = "awake";
    eggzee.visible = true;
    eggzee.img = eggzeeAwakeImg; // <--- assign here
    startTime = millis();
    hasWelcomed = false;
  }
}
