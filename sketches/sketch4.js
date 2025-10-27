registerSketch('sk4', function (p) {
  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function () {
    p.background(235);
  };
});
