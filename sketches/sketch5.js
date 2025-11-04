window.sketch5 = function(p) {
  const CSV_PATH = "CarsData.csv";

  // Segment Colors
  const SEGMENT_COLORS = {
    "Luxury":    [220, 70, 60],
    "Mid-range": [60, 110, 220],
    "Economy":   [40, 160, 120],
  };

  // Segment Brand
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
  let allRows = []; 
  let filteredRows = []; 
  let sampleRows = []; 

  let xMin, xMax, yMin, yMax;

  let uiContainer;
  let cbLuxury, cbMid, cbEco;
  let inputSample, btnApply;
  let showSeg = { "Luxury": true, "Mid-range": true, "Economy": true };

  p.preload = function() {
    table = p.loadTable(CSV_PATH, "csv", "header");
  };

  p.setup = function() {
    p.createCanvas(900, 700);
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
      } else {
        colIdx[req] = headers[idx];
      }
    });

    const toNumber = (s) => {
      if (s == null) return NaN;
      s = String(s)
        .replace(/[\$,]/g, "")
        .replace(/\bmi\b/gi, "")
        .replace(/[^0-9.\-]/g, "")
        .trim();
      const v = Number(s);
      return Number.isFinite(v) ? v : NaN;
    };
    const get = (r, name) => {
      const h = colIdx[name];
      return h ? table.getString(r, h) : null;
    };

    for (let r = 0; r < table.getRowCount(); r++) {
      const Brand  = (get(r, "Brand")  || "").trim();
      const Model  = (get(r, "Model")  || "").trim();
      const Year   = toNumber(get(r, "Year"));
      const Status = (get(r, "Status") || "").trim();
      const Mileage= toNumber(get(r, "Mileage"));
      const Price  = toNumber(get(r, "Price"));

      if (!Brand || !Number.isFinite(Price) || !Number.isFinite(Mileage) || Price > 1_000_000) continue;

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
    drawPoints();
    drawLegend();
  };

  function buildUI() {
    uiContainer = p.createDiv();
    uiContainer.parent(p._userNode || undefined);
    uiContainer.style("display", "flex");
    uiContainer.style("gap", "12px");
    uiContainer.style("align-items", "center");
    uiContainer.style("flex-wrap", "wrap");
    uiContainer.style("margin", "8px 8px 0 8px");
    uiContainer.style("font-family", "system-ui, -apple-system, Segoe UI, Roboto, sans-serif");
    uiContainer.style("font-size", "14px");

    cbLuxury = p.createCheckbox("Luxury", true);
    cbLuxury.parent(uiContainer);
    cbLuxury.changed(() => { showSeg["Luxury"] = cbLuxury.checked(); updateFilterAndSample(true); });

    cbMid = p.createCheckbox("Mid-range", true);
    cbMid.parent(uiContainer);
    cbMid.changed(() => { showSeg["Mid-range"] = cbMid.checked(); updateFilterAndSample(true); });

    cbEco = p.createCheckbox("Economy", true);
    cbEco.parent(uiContainer);
    cbEco.changed(() => { showSeg["Economy"] = cbEco.checked(); updateFilterAndSample(true); });

    const labelSample = p.createSpan(" Sample size:");
    labelSample.parent(uiContainer);

    inputSample = p.createInput("", "number");
    inputSample.attribute("min", "1");
    inputSample.attribute("placeholder", "All");
    inputSample.size(90);
    inputSample.parent(uiContainer);

    btnApply = p.createButton("Apply / Resample");
    btnApply.parent(uiContainer);
    btnApply.mousePressed(() => updateFilterAndSample(false));
  }

  function updateFilterAndSample() {
    filteredRows = allRows.filter(d => showSeg[d.Segment]);

    const val = inputSample.value();
    const n = Number(val);
    if (!val || !Number.isFinite(n) || n <= 0 || n >= filteredRows.length) {
      sampleRows = filteredRows.slice();
    } else {
      sampleRows = reservoirSample(filteredRows, n);
    }

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
    const src = (sampleRows.length ? sampleRows : filteredRows);
    if (src.length === 0) {
      xMin = 0; xMax = 1; yMin = 0; yMax = 1;
      return;
    }
    const xs = src.map(d => d.Mileage);
    const ys = src.map(d => d.Price);

    xMin = Math.min(...xs);
    xMax = Math.max(...xs);
    yMin = 0;
    yMax = Math.max(...ys);

    const xPad = (xMax - xMin) * 0.05 || 1;
    xMin = Math.max(0, xMin - xPad);
    xMax = xMax + xPad;

    const yPad = (yMax - yMin) * 0.08 || 1;
    yMax = yMax + yPad;
  }

  function xScale(v) { return p.map(v, xMin, xMax, PAD.left, PAD.left + plotW); }
  function yScale(v) { return p.map(v, yMax, yMin, PAD.top,  PAD.top + plotH); }

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
      p.noStroke(); p.fill(90); p.textAlign(p.RIGHT, p.CENTER);
      p.text(currencyFmt(t), PAD.left - 10, yy);
    }

    const xTicks = 8;
    for (let i=0;i<=xTicks;i++){
      const t = p.lerp(xMin, xMax, i / xTicks);
      const xx = xScale(t);
      p.stroke(0,0,0,18); p.line(xx, PAD.top, xx, PAD.top + plotH);
      p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP);
      p.text(numberFmt(t), xx, PAD.top + plotH + 8);
    }

    p.noStroke(); p.fill(40); p.textAlign(p.CENTER, p.CENTER);
    p.text("Mileage", PAD.left + plotW / 2, PAD.top + plotH + 40);
    p.push(); p.translate(PAD.left - 58, PAD.top + plotH / 2); p.rotate(-p.HALF_PI);
    p.text("Price (USD)", 0, 0); p.pop();
  }

  function drawTitle() {
    p.push();
    p.textAlign(p.LEFT, p.TOP);
    p.noStroke(); p.fill(20);
    p.textSize(22);
    p.text("The Price of Time — Scatter", PAD.left, 18);
    p.textSize(13); p.fill(70);
    p.text("Price vs Mileage • Colors: Luxury (red), Mid-range (blue), Economy (green)",
    PAD.left, 46);
    p.pop();
  }

  function drawPoints() {
    const pts = (sampleRows.length ? sampleRows : filteredRows);
    const R = 5;
    p.noStroke();

    for (let i = 0; i < pts.length; i++) {
      const d = pts[i];
      const xx = xScale(d.Mileage);
      const yy = yScale(d.Price);
      const col = SEGMENT_COLORS[d.Segment] || [120,120,120];

      p.fill(col[0], col[1], col[2], 160);
      p.circle(xx, yy, R * 2);
    }
  }

  function drawLegend() {
    const x = p.width - 220, y = 14;
    p.textSize(12); p.noStroke(); p.fill(30); p.textAlign(p.LEFT, p.CENTER);
    p.text("Segments:", x, y);

    let yc = y;
    [["Luxury","red"],["Mid-range","blue"],["Economy","green"]].forEach((row, idx) => {
      yc += 18;
      const seg = row[0];
      const c = SEGMENT_COLORS[seg];
      p.fill(c[0], c[1], c[2]); p.rect(x + 82, yc - 7, 12, 12);
      p.noStroke(); p.fill(40); p.text(seg, x + 100, yc);
    });
  }

  function currencyFmt(v){
    const s = Math.round(v).toString();
    return "$" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function numberFmt(v){
    const s = Math.round(v).toString();
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};
