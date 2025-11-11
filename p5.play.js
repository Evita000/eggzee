/*
 * Minimal p5.play compatibility layer
 * (for sprites, animations, and groups)
 * Source: molleindustria/p5.play v1.4.0
 */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["p5"], function (p5) {
      factory(p5);
    });
  } else if (typeof exports === "object") {
    factory(require("p5"));
  } else {
    factory(root.p5);
  }
})(this, function (p5) {
  "use strict";

  p5.prototype.Sprite = function (x, y, w, h) {
    this.position = p5.prototype.createVector(x || 0, y || 0);
    this.width = w || 50;
    this.height = h || 50;
    this.rotation = 0;
    this.visible = true;
    this.scale = 1;
    this.velocity = p5.prototype.createVector(0, 0);
    this.addImage = () => {};
    this.changeImage = () => {};
  };

  p5.prototype.createSprite = function (x, y, w, h) {
    const s = new p5.prototype.Sprite(x, y, w, h);
    if (!this.allSprites) this.allSprites = [];
    this.allSprites.push(s);
    return s;
  };

  p5.prototype.drawSprites = function () {
    if (!this.allSprites) return;
    for (let s of this.allSprites) {
      if (s.visible) {
        p5.prototype.push();
        p5.prototype.translate(s.position.x, s.position.y);
        p5.prototype.rotate(p5.prototype.radians(s.rotation));
        p5.prototype.noStroke();
        p5.prototype.fill(255);
        p5.prototype.rectMode(p5.prototype.CENTER);
        p5.prototype.rect(0, 0, s.width * s.scale, s.height * s.scale);
        p5.prototype.pop();
      }
    }
  };

  p5.prototype.Group = function () {
    this.members = [];
    this.add = function (sprite) {
      this.members.push(sprite);
    };
  };
});
