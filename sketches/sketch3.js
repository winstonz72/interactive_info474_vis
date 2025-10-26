registerSketch('sk3', function (p) {
  let horizonY;

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    horizonY = p.height * 0.70;
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    horizonY = p.height * 0.70;
  };

  p.draw = function () {
    p.background(220);
    p.fill(60, 120, 70);
    p.rect(0, horizonY, p.width, p.height - horizonY);
  };
});
