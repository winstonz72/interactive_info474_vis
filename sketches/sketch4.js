registerSketch('sk4', function (p) {
  let candle = { w: 90, maxH: 320, x: 0, baseY: 0 };
  let durationSec = 60;
  let remainingSec = 60;
  let running = false;
  let lastMillis = 0;
  let startBtn, pauseBtn, resetBtn;

  function layoutUI() {
    const cx = p.width / 2;
    const y = p.height - 80;
    startBtn.position(cx - 120, y);
    pauseBtn.position(cx - 40, y);
    resetBtn.position(cx + 40, y);
  }

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);

    startBtn = p.createButton('Start');
    pauseBtn = p.createButton('Pause');
    resetBtn = p.createButton('Reset');

    startBtn.mousePressed(() => { running = true; lastMillis = p.millis(); });
    pauseBtn.mousePressed(() => { running = false; });
    resetBtn.mousePressed(() => { running = false; remainingSec = durationSec; });

    layoutUI();
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    layoutUI();
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
    const progress = 1 - (remainingSec / durationSec);

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

    // Wick & flame
    p.fill(50);
    p.rect(cx - 2, baseY - candle.maxH - 10, 4, 12, 2);
    if (remainingSec > 0) {
      p.fill(255, 180, 60);
      p.ellipse(cx, candleTopY - 22, 40, 56);
    } else {
      p.fill(150);
      p.ellipse(cx, candleTopY - 18, 10, 12);
    }
  };
});
