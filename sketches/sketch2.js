registerSketch('sk2', function (p) {
  const W = 800, H = 800;
  const R = 300;
  const numerals = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

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

    // Numerals
    p.noStroke(); p.fill(0); p.textSize(28);
    for (let i = 0; i < 12; i++) {
      const angle = -60 + i * 30;
      const x = cx + (R - 40) * p.cos(angle);
      const y = cy + (R - 40) * p.sin(angle);
      p.text(numerals[i], x, y);
    }
  };
});
