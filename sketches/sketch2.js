registerSketch('sk2', function (p) {
  const W = 800, H = 800;
  const R = 300;

  p.setup = function () {
    p.createCanvas(W, H);
    p.angleMode(p.DEGREES);
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont('serif');
  };

  p.draw = function () {
    p.background(240);
    
    const cx = W / 2, cy = H / 2;

    // Outer dial
    p.noFill();
    p.stroke(0);
    p.strokeWeight(3);
    p.circle(cx, cy, R * 2);
  };
});
