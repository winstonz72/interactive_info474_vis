registerSketch('sk2', function (p) {
  const W = 800, H = 800;

  p.setup = function () {
    p.createCanvas(W, H);
    p.angleMode(p.DEGREES);
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont('serif');
  };

  p.draw = function () {
    p.background(240);
  };
});
