// sketches/sketch5.js
// HWK 5 — "The Price of Time" scatter plot (Price vs Mileage)
// Segments: Luxury (red), Mid-range (blue), Economy (green)

registerSketch('sk5', function (p) {
  const CSV_PATH = "CarsData.csv";

  // -------------------- Segment Colors --------------------
  const SEGMENT_COLORS = {
    "Luxury":    [220, 70, 60],
    "Mid-range": [60, 110, 220],
    "Economy":   [40, 160, 120],
  };

  // -------------------- Brand Segmentation --------------------
  const LUXURY = [
    "Acura","Alfa Romeo","Aston Martin","Audi","Bentley","BMW","Bugatti","Cadillac",
    "Ferrari","Genesis","Infiniti","Jaguar","Karma","Lamborghini","Land Rover","Lexus",
    "Lucid","Maserati","Maybach","Mclaren","Mercedes","Porsche","Rolls-Royce","Tesla"
  ];
  const MIDRANGE = [
    "Buick","Chevrolet","Chrysler","Dodge","Ford","GMC","Honda","Hyundai","Jeep","Kia",
    "Lincoln","Mazda","MINI","Mitsubishi","Nissan","Polestar","RAM","Rivian","Subaru",
    "Toyota","Volkswagen","Volvo"
  ];
  const ECONOMY = [
    "Eagle","FIAT","Geo","Hummer","International Scout","Isuzu","Lotus","Mercury",
    "Oldsmobile","Plymouth","Pontiac","Saab","Saturn","Scion","Smart","Suzuki"
  ];

  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z]/g, "");
  const brandToSegment = new Map();
  LUXURY.forEach(b => brandToSegment.set(norm(b), "Luxury"));
  MIDRANGE.forEach(b => brandToSegment.set(norm(b), "Mid-range"));
  ECONOMY.forEach(b => brandToSegment.set(norm(b), "Economy"));

  const PAD = { top: 70, right: 30, bottom: 64, left: 84 };
  let plotW, plotH;

  let table;
  const REQUIRED = ["Brand", "Model", "Year", "Status", "Mileage", "Price"];
  let colIdx = {};
  let allRows = [], filteredRows = [], sampleRows = [];

  let xMin, xMax, yMin, yMax;
  let uiContainer, cbLuxury, cbMid, cbEco, inputSample, btnApply;
  let showSeg = { "Luxury": true, "Mid-range": true, "Economy": true };
  let hover = null;

  p.preload = function() {
    table = p.loadTable(CSV_PATH, "csv", "header");
  };

  p.setup = function() {
    const cnv = p.createCanvas(900, 700);
    if (p._userNode) cnv.parent(p._userNode);
    p.canvas = cnv.elt;

    plotW = p.width - PAD.left - PAD.right;
    plotH = p.height - PAD.top - PAD.bottom;

    const headers = table.columns;
    const lower = headers.map(h => (h || "").toLowerCase().trim());
    const findCol = (name) => {
      const i = lower.indexOf(name.toLowerCase());
      return i >= 0 ? i : -1;
    };
    REQUIRED.forEach(req => {
      const idx = findCol(req);
      if (idx === -1) {
        console.warn(`Missing column "${req}". Present: ${headers.join(", ")}`);
      } else colIdx[req] = headers[idx];
    });

    const toNumber = (s) => {
      if (!s) return NaN;
      s = String(s).replace(/[\$,]/g, "").replace(/\bmi\b/gi, "").replace(/[^0-9.\-]/g, "");
      const v = Number(s);
      return Number.isFinite(v) ? v : NaN;
    };
    const get = (r, name) => {
      const h = colIdx[name];
      return h ? table.getString(r, h) : null;
    };

    for (let r = 0; r < table.getRowCount(); r++) {
      const Brand = (get(r, "Brand") || "").trim();
      const Model = (get(r, "Model") || "").trim();
      const Year = toNumber(get(r, "Year"));
      const Status = (get(r, "Status") || "").trim();
      const Mileage = toNumber(get(r, "Mileage"));
      const Price = toNumber(get(r, "Price"));

      if (!Brand || !Number.isFinite(Price) || !Number.isFinite(Mileage)) continue;
      const seg = brandToSegment.get(norm(Brand)) || "Mid-range";
      allRows.push({ Brand, Model, Year, Status, Mileage, Price, Segment: seg });
    }

    buildUI();
    updateFilterAndSample();
    computeDomains();
    p.noLoop();
  };

  p.draw = function() {
    p.background(250);
    drawTitle();
    drawAxes();
    hover = null;
    drawPoints();
    drawLegend();
    if (hover) drawTooltip(hover);
  };

  function buildUI() {
    uiContainer = p.createDiv();
    if (p._userNode) uiContainer.parent(p._userNode);
    uiContainer.style("display", "flex");
    uiContainer.style("gap", "12px");
    uiContainer.style("align-items", "center");
    uiContainer.style("flex-wrap", "wrap");
    uiContainer.style("margin", "8px 8px 0 8px");
    uiContainer.style("font-family", "system-ui");
    uiContainer.style("font-size", "14px");

    cbLuxury = p.createCheckbox("Luxury", true).parent(uiContainer);
    cbLuxury.changed(() => { showSeg["Luxury"] = cbLuxury.checked(); updateFilterAndSample(true); });

    cbMid = p.createCheckbox("Mid-range", true).parent(uiContainer);
    cbMid.changed(() => { showSeg["Mid-range"] = cbMid.checked(); updateFilterAndSample(true); });

    cbEco = p.createCheckbox("Economy", true).parent(uiContainer);
    cbEco.changed(() => { showSeg["Economy"] = cbEco.checked(); updateFilterAndSample(true); });

    const labelSample = p.createSpan(" Sample size:").parent(uiContainer);
    inputSample = p.createInput("", "number").parent(uiContainer);
    inputSample.attribute("min", "1");
    inputSample.attribute("placeholder", "All");
    inputSample.size(90);

    btnApply = p.createButton("Apply / Resample").parent(uiContainer);
    btnApply.mousePressed(() => updateFilterAndSample(false));
  }

  function updateFilterAndSample(onCheckboxChange) {
    filteredRows = allRows.filter(d => showSeg[d.Segment]);
    const val = inputSample.value();
    const n = Number(val);
    if (!val || !Number.isFinite(n) || n <= 0 || n >= filteredRows.length)
      sampleRows = filteredRows.slice();
    else
      sampleRows = reservoirSample(filteredRows, n);

    computeDomains();
    p.redraw();
  }

  function reservoirSample(arr, k) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      if (i < k) result[i] = arr[i];
      else {
        const j = Math.floor(Math.random() * (i + 1));
        if (j < k) result[j] = arr[i];
      }
    }
    return result;
  }

  function computeDomains() {
    const src = sampleRows.length ? sampleRows : filteredRows;
    if (!src.length) { xMin = 0; xMax = 1; yMin = 0; yMax = 1; return; }
    const xs = src.map(d => d.Mileage);
    const ys = src.map(d => d.Price);
    xMin = Math.min(...xs); xMax = Math.max(...xs);
    yMin = 0; yMax = Math.max(...ys);
    const xPad = (xMax - xMin) * 0.05 || 1;
    xMin = Math.max(0, xMin - xPad);
    xMax += xPad;
    const yPad = (yMax - yMin) * 0.08 || 1;
    yMax += yPad;
  }

  function xScale(v){ return p.map(v, xMin, xMax, PAD.left, PAD.left + plotW); }
  function yScale(v){ return p.map(v, yMax, yMin, PAD.top, PAD.top + plotH); }

  function drawAxes() {
    p.stroke(0,0,0,80);
    p.line(PAD.left, PAD.top + plotH, PAD.left + plotW, PAD.top + plotH);
    p.line(PAD.left, PAD.top, PAD.left, PAD.top + plotH);
    p.textSize(12);
    p.noStroke(); p.fill(70);

    const yTicks = 5;
    for (let i=0;i<=yTicks;i++){
      const t = p.lerp(yMin, yMax, i / yTicks);
      const yy = yScale(t);
      p.stroke(0,0,0,18); p.line(PAD.left, yy, PAD.left + plotW, yy);
      p.noStroke(); p.textAlign(p.RIGHT, p.CENTER); p.fill(90);
      p.text(currencyFmt(t), PAD.left - 10, yy);
    }

    const xTicks = 8;
    for (let i=0;i<=xTicks;i++){
      const t = p.lerp(xMin, xMax, i / xTicks);
      const xx = xScale(t);
      p.stroke(0,0,0,18); p.line(xx, PAD.top, xx, PAD.top + plotH);
      p.noStroke(); p.textAlign(p.CENTER, p.TOP); p.fill(90);
      p.text(numberFmt(t), xx, PAD.top + plotH + 8);
    }

    p.noStroke(); p.fill(40); p.textAlign(p.CENTER, p.CENTER);
    p.text("Mileage (mi)", PAD.left + plotW / 2, PAD.top + plotH + 40);
    p.push(); p.translate(PAD.left - 58, PAD.top + plotH / 2); p.rotate(-p.HALF_PI);
    p.text("Price (USD)", 0, 0); p.pop();
  }

  function drawTitle() {
    p.textAlign(p.LEFT, p.TOP);
    p.noStroke(); p.fill(20); p.textSize(22);
    p.text("The Price of Time — Scatter", PAD.left, 18);
    p.textSize(13); p.fill(70);
    p.text("Price vs Mileage • Luxury (red) • Mid-range (blue) • Economy (green)", PAD.left, 46);
  }

  function drawPoints() {
    const pts = sampleRows.length ? sampleRows : filteredRows;
    const R = 5; p.noStroke();
    for (let d of pts) {
      const xx = xScale(d.Mileage), yy = yScale(d.Price);
      const col = SEGMENT_COLORS[d.Segment] || [120,120,120];
      p.fill(...col, 160); p.circle(xx, yy, R*2);
      if (p.dist(p.mouseX, p.mouseY, xx, yy) <= R+3) {
        hover = {
          x: xx, y: yy - 12, color: col,
          lines: [
            `${d.Brand}${d.Model ? " " + d.Model : ""} • ${d.Segment}`,
            `Price: ${currencyFmt(d.Price)} • Mileage: ${numberFmt(d.Mileage)}`,
            `${d.Status ? "Status: " + d.Status + " • " : ""}${Number.isFinite(d.Year) ? "Year: " + d.Year : ""}`
          ]
        };
      }
    }
  }

  function drawLegend() {
    const x = p.width - 220, y = 14;
    p.textSize(12); p.noStroke(); p.fill(30);
    p.textAlign(p.LEFT, p.CENTER); p.text("Segments:", x, y);
    let yc = y;
    ["Luxury", "Mid-range", "Economy"].forEach(seg => {
      yc += 18; const c = SEGMENT_COLORS[seg];
      p.fill(...c); p.rect(x + 82, yc - 7, 12, 12);
      p.noStroke(); p.fill(40); p.text(seg, x + 100, yc);
    });
  }

  function drawTooltip(info) {
    const w = 14 + Math.max(...info.lines.map(t => p.textWidth(t)));
    const h = 10 + info.lines.length * 16;
    let tx = info.x + 14, ty = info.y - h - 8;
    if (tx + w > p.width - 6) tx = p.width - 6 - w;
    if (ty < 6) ty = info.y + 16;
    p.noStroke(); p.fill(255,245); p.rect(tx, ty, w, h, 6);
    p.stroke(...info.color); p.noFill(); p.rect(tx, ty, w, h, 6);
    p.noStroke(); p.fill(20);
    let yy = ty + 8; info.lines.forEach(t => { p.text(t, tx + 7, yy + 12); yy += 16; });
  }

  function currencyFmt(v){ return "$" + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function numberFmt(v){ return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

}); // <-- end of registerSketch
