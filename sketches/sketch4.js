registerSketch('sk4', function (p) {
  let candle = { w: 90, maxH: 320, x: 0, baseY: 0 };
  let durationSec = 60;
  let remainingSec = 60;
  let running = false;
  let lastMillis = 0;

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function () {
    if (running && remainingSec > 0) {
      const now = p.millis();
      const dt = (now - lastMillis) / 1000.0;
      lastMillis = now;
      remainingSec = Math.max(0, remainingSec - dt);
      if (remainingSec === 0) running = false;
    } else {
      lastMillis = p.millis();
    }

    p.background(235);

    const cx = p.width / 2;
    const baseY = p.height / 2 + 160;
    candle.x = cx - candle.w / 2;
    candle.baseY = baseY;

    // Table
    p.fill(210);
    p.rect(0, baseY + 28, p.width, p.height - (baseY + 28));

    const h = candle.maxH * (remainingSec / durationSec);
    const candleTopY = baseY - h;

    // Candle body
    p.fill(255, 240, 205);
    p.rect(candle.x, candleTopY, candle.w, h, 10);

    // Wick
    p.fill(50);
    p.rect(cx - 2, baseY - candle.maxH - 10, 4, 12, 2);

    // Flame Ellipse
    if (remainingSec > 0) {
      p.fill(255, 180, 60);
      p.ellipse(cx, candleTopY - 22, 40, 56);
    } else {
      // simple smoke when finished
      p.fill(150);
      p.ellipse(cx, candleTopY - 18, 10, 12);
    }

    // readout
    p.fill(30);
    p.textSize(20);
    const t = Math.max(0, Math.floor(remainingSec));
    const mm = Math.floor(t / 60);
    const ss = t % 60;
    p.text(mm + ":" + (ss < 10 ? "0" + ss : ss), cx, baseY + 60);
  };
});
