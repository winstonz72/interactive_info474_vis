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

    // Time
    const hr = p.hour() % 12;
    const mn = p.minute();
    const sc = p.second();

    // Angles
    const hourAngle = hr * 30 + mn * 0.5;
    const minAngle  = mn * 6 + sc * 0.1;
    const secAngle  = sc * 6;

    p.push();
    p.translate(cx, cy);
    p.rotate(-90);

    // Hour hand
    p.stroke(0); 
    p.strokeWeight(6);
    p.line(0, 0, (R * 0.5) * p.cos(hourAngle), (R * 0.5) * p.sin(hourAngle));

    // Minute hand
    p.stroke(0); 
    p.strokeWeight(4);
    p.line(0, 0, (R * 0.7) * p.cos(minAngle), (R * 0.7) * p.sin(minAngle));

    // Second hand
    p.stroke(200, 0, 0); 
    p.strokeWeight(2);
    p.line(0, 0, (R * 0.85) * p.cos(secAngle), (R * 0.85) * p.sin(secAngle));

    // Center cap
    p.noStroke(); 
    p.fill(0);
    p.circle(0, 0, 10);

    p.pop();
  };
});
