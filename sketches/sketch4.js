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

  const fmt = t => { 
    t = Math.max(0, Math.floor(t)); 
    const m = Math.floor(t/60), s = t%60; return m+":"+(s<10?"0"+s:s); };


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

    p.background(235);

    const cx = p.width / 2;
    const baseY = p.height / 2 + 160;
    candle.x = cx - candle.w / 2;
    candle.baseY = baseY;
    const progress = 1 - (remainingSec / durationSec);
    const h = candle.maxH * (remainingSec / durationSec);
    const candleTopY = baseY - h;

    // Table
    p.fill(210);
    p.rect(0, baseY + 28, p.width, p.height - (baseY + 28));

    // wax pool
    const poolW = p.map(progress, 0, 1, 40, 220);
    const poolH = p.map(progress, 0, 1, 8, 22);
    p.fill(255, 220, 180, 230);
    p.ellipse(cx, baseY + 18, poolW, poolH);

    // Candle body
    p.fill(255, 240, 205);
    p.rect(candle.x, candleTopY, candle.w, h, 10);

    // drips
    p.fill(255, 230, 190, 210);
    const drips = Math.floor(progress * 12);
    for (let i = 0; i < drips; i++) {
      const dx = p.map(i % 6, 0, 5, 6, candle.w - 12);
      const len = 6 + (i % 5) * 5;
      const x = cx - candle.w / 2 + dx;
      const y = p.map(i, 0, drips, candleTopY + 18, baseY - 10);
      p.rect(x, y, 6, len, 3);
    }

    // Wick
    p.fill(50);
    p.rect(cx - 2, candleTopY - 10, 4, 12, 2);

    // Flame
    if (remainingSec > 0) {
      const t = p.millis() * 0.006;
      const fw = 40 * (0.95 + 0.08 * p.sin(t)) + p.random(-1, 1);
      const fh = 56 * (0.95 + 0.10 * p.sin(t + 0.7)) + p.random(-1, 1);
      // glow
      p.fill(255, 140, 40, 60); p.ellipse(cx, candleTopY - 20, fw * 2.0, fh * 1.8);
      // core
      p.fill(255, 180, 60); p.ellipse(cx, candleTopY - 22, fw, fh);
      // hot center
      p.fill(255, 235, 180, 200); p.ellipse(cx, candleTopY - 18, fw * 0.45, fh * 0.45);
    } else {
      p.fill(150); p.ellipse(cx, candleTopY - 18, 10, 12);
    }
    // Remaining Time Text
    p.fill(30);
    p.textSize(24);
    p.text(fmt(remainingSec), cx, baseY + 100);
  };
});
