registerSketch('sk4', function (p) {
  let candle = { w: 90, maxH: 320, x: 0, baseY: 0 };

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

  const cx = p.width / 2;
    const baseY = p.height / 2 + 160;
    candle.x = cx - candle.w / 2;
    candle.baseY = baseY;

    // Table
    p.fill(210);
    p.rect(0, baseY + 28, p.width, p.height - (baseY + 28));

    // Candle body
    p.fill(255, 240, 205);
    p.rect(candle.x, baseY - candle.maxH, candle.w, candle.maxH, 10);

    // Wick
    p.fill(50);
    p.rect(cx - 2, baseY - candle.maxH - 10, 4, 12, 2);

    // Flame Ellipse
    p.fill(255, 180, 60);
    p.ellipse(cx, baseY - candle.maxH - 22, 40, 56);
    };
});
