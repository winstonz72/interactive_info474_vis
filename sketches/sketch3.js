registerSketch('sk3', function (p) {
  let horizonY, arcHeight;

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    horizonY = p.height * 0.70;
    arcHeight = p.height * 0.40;
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    horizonY = p.height * 0.70;
    arcHeight = p.height * 0.40;
  };

  function windowProgress(startHour, endHour, h, m, s) {
    const t = h + m / 60 + s / 3600;
    let st = startHour, en = endHour;
    if (en <= st) en += 24;
    let tt = t;
    if (tt < st) tt += 24;
    if (tt >= en) return -1;
    return (tt - st) / (en - st);
  }

  p.draw = function () {
    p.background(220);
    p.fill(60, 120, 70);
    p.rect(0, horizonY, p.width, p.height - horizonY);

    const h = p.hour(), m = p.minute(), s = p.second();
    const cx = p.width / 2;

    // Sun visible 06:00–18:00, peak at 12:00
    const sunProg = windowProgress(6, 18, h, m, s);
    if (sunProg >= 0) {
      const y = horizonY - arcHeight * Math.sin(Math.PI * sunProg);
      p.fill(255, 210, 80);
      p.ellipse(cx, y, 100, 100);
    };

    // Moon visible 18:00-06:00, peak at 00:00
    const moonProg = windowProgress(18, 6, h, m, s);
    if (moonProg >= 0) {
      const y = horizonY - arcHeight * Math.sin(Math.PI * moonProg);
      p.fill(235);
      p.ellipse(cx, y, 80, 80);
    }

    // Digital clock (HH:MM:SS AM/PM)
    const pad = n => (n < 10 ? '0' + n : '' + n);
    const hh12 = (h % 12) === 0 ? 12 : (h % 12);
    const ampm = h < 12 ? 'AM' : 'PM';
    p.fill(0);
    p.textSize(20);
    p.text(`${pad(hh12)}:${pad(m)}:${pad(s)} ${ampm}`, cx, horizonY + 40);
  };
});
