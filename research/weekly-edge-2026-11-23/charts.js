/* Chart registrations for the Weekly Edge deck (week of Nov 23, 2026). Data lives in deck-data.js. */
(function(){
  const D = window.DECK_DATA, T = Deck.theme;
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const alpha = (hex, a) => { const n = parseInt(hex.replace("#", ""), 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; };
  const TEAL = T.teal || "#3fb8cc", RED = T.red || "#ff5a69", TEXT = T.text || "#fdf7ee", GREY = "#9fb6c6";
  const pLabel = (p) => MONTHS[p % 100 - 1] + " " + Math.floor(p / 100);
  const pct = (d = 1) => (v) => v.toFixed(d) + "%";
  const num = (v) => Deck.fmt(v);

  function tag(ctx, text, x, y, o = {}){
    ctx.save();
    ctx.font = (o.weight || 700) + " " + (o.size || 13) + 'px "DM Sans", sans-serif';
    ctx.fillStyle = o.color || TEXT; ctx.textAlign = o.align || "left"; ctx.textBaseline = o.base || "middle";
    ctx.fillText(text, x, y); ctx.restore();
  }

  /* Time-series line chart. series: [{ data: [[yyyymm, value]], color, label, width, dash }] */
  function line(series, o = {}){
    const labels = series[0].data.map((r) => r[0]);
    const years = Math.floor(labels[labels.length - 1] / 100) - Math.floor(labels[0] / 100);
    const step = o.step || (years > 28 ? 5 : years > 13 ? 2 : 1);
    const fmt = o.fmt || num, small = !!o.small;
    const datasets = series.map((s) => {
      const m = new Map(s.data);
      return { label: s.label, data: labels.map((p) => m.has(p) ? m.get(p) : null), borderColor: s.color || TEAL, backgroundColor: s.color || TEAL,
        borderWidth: s.width || (small ? 2 : 3), borderDash: s.dash || [], pointRadius: 0, pointHoverRadius: 4, tension: .15, spanGaps: true,
        fill: s.fill ? { target: "origin", above: alpha(s.color || TEAL, .12), below: alpha(s.color || TEAL, .12) } : false };
    });
    return {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
        layout: { padding: { top: small ? 6 : 14, right: o.right != null ? o.right : (small ? 10 : 74) } },
        animation: Deck.reduce ? false : Deck.drawIn(labels.length, 1500),
        plugins: {
          legend: series.length > 1 && !small ? { position: "top", align: "start", labels: { color: TEXT, usePointStyle: true, pointStyle: "line", font: { size: 14 } } } : { display: false },
          tooltip: { callbacks: { title: (it) => pLabel(labels[it[0].dataIndex]), label: (c) => (c.dataset.label ? c.dataset.label + ": " : "") + fmt(c.raw) } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { autoSkip: false, maxRotation: 0, font: { size: small ? 11 : 14 },
            callback(v, i){ const p = labels[i], y = Math.floor(p / 100);
              const need = (small ? 34 : 46) / (this.chart.width / Math.max(1, years)), fit = [1, 2, 4, 5, 10].find((n) => n >= need) || 10;
              return p % 100 === 1 && y % Math.max(step, fit) === 0 ? y : null; } } },
          y: { min: o.min, max: o.max, grid: { color: T.grid }, ticks: { font: { size: small ? 11 : 14 }, maxTicksLimit: small ? 5 : 8, callback: (v) => (o.axisFmt || fmt)(v) } }
        }
      },
      plugins: [{ id: "extras", beforeDatasetsDraw(chart){
        const { ctx, chartArea: a, scales: { y } } = chart;
        if (o.band) { ctx.save(); ctx.fillStyle = alpha(RED, .09); const t = y.getPixelForValue(o.band[1]), b = y.getPixelForValue(o.band[0]); ctx.fillRect(a.left, t, a.right - a.left, b - t); ctx.restore(); }
        (o.refs || []).forEach((r) => {
          const py = y.getPixelForValue(r.value);
          ctx.save(); ctx.strokeStyle = alpha(r.color || GREY, .75); ctx.setLineDash([5, 4]); ctx.lineWidth = 1.25; ctx.beginPath(); ctx.moveTo(a.left, py); ctx.lineTo(a.right, py); ctx.stroke(); ctx.restore();
          if (r.label) tag(ctx, r.label, a.left + 8, py - 9, { size: 12, weight: 600, color: T.muted });
        });
      }, afterDatasetsDraw(chart){
        if (small && !o.endTag) return;
        chart.data.datasets.forEach((ds, di) => {
          const meta = chart.getDatasetMeta(di); let k = ds.data.length - 1;
          while (k >= 0 && ds.data[k] == null) k--;
          const pt = meta.data[k]; if (!pt || !isFinite(pt.x) || !isFinite(pt.y)) return;
          const ctx = chart.ctx; ctx.save(); ctx.fillStyle = ds.borderColor; ctx.beginPath(); ctx.arc(pt.x, pt.y, small ? 3 : 4.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          if (!small) tag(ctx, fmt(ds.data[k]), pt.x + 9, pt.y, { color: ds.borderColor, size: 15 });
        });
      } }]
    };
  }

  Deck.chart("mortgage-growth", () => line([{ data: D.mortgageGrowth, color: RED }], { fmt: pct(1), axisFmt: pct(0), min: 0 }));
  Deck.chart("originations", () => line([{ data: D.originations12, color: TEAL, fill: true }], { fmt: (v) => "$" + Math.round(v) + "B", min: 200 }));
  Deck.chart("variable-share", () => line([
    { data: D.varShareOrig, color: RED, label: "Share of new originations (3-mo avg)" },
    { data: D.varShareDebt, color: TEAL, label: "Share of outstanding mortgage debt" }
  ], { fmt: pct(1), axisFmt: pct(0), min: 0 }));
  Deck.chart("qc-listings", () => line([{ data: D.qcNewListings12, color: RED }], { fmt: num, axisFmt: (v) => Math.round(v / 1000) + "K", step: 2 }));
  Deck.chart("snlr", () => line([{ data: D.snlr3, color: TEAL }], { fmt: pct(1), axisFmt: pct(0), refs: [{ value: 50, label: "50%" }] }));
  Deck.chart("insolvencies", () => line([{ data: D.insolvConsumer12, color: RED }], { fmt: num, axisFmt: (v) => Math.round(v / 1000) + "K", step: 2 }));
  Deck.chart("starts", () => line([
    { data: D.starts12.rental, color: RED, label: "Rental" },
    { data: D.starts12.homeowner, color: TEAL, label: "Homeowner (freehold)" },
    { data: D.starts12.condo, color: GREY, label: "Condo" }
  ], { fmt: num, axisFmt: (v) => Math.round(v / 1000) + "K", min: 0 }));
  Deck.chart("cpi", () => line([
    { data: D.cpiYoy, color: RED, label: "Headline CPI, y/y" },
    { data: D.coreAvg, color: TEAL, label: "Core: average of CPI-median and CPI-trim" }
  ], { fmt: pct(1), axisFmt: pct(0), band: [1, 3], step: 2 }));
  Deck.chart("rent-cpi", () => line([{ data: D.rentYoy, color: TEAL }], { fmt: pct(1), axisFmt: pct(0), min: 0, refs: [{ value: 2, label: "2%" }] }));

  [["al-bc", "BC", RED], ["al-ab", "Alberta", TEAL], ["al-on", "Ontario", RED], ["al-qc", "Quebec", TEAL]].forEach(([id, key, color]) => {
    Deck.chart(id, () => line([{ data: D.active[key], color }], { small: true, endTag: true, step: 4, fmt: num, axisFmt: (v) => Math.round(v / 1000) + "K" }));
  });

  /* Cumulative sales, one line per year */
  Deck.chart("cum-sales", () => {
    const years = Object.keys(D.cumSales).map(Number).sort((a, b) => a - b);
    const style = (y) => y === 2026 ? { c: RED, w: 4 } : y === 2025 ? { c: TEXT, w: 2.5 } : y === 2021 ? { c: TEAL, w: 2.5 } : { c: alpha(GREY, .32), w: 1.25 };
    const order = (y) => y === 2026 ? 0 : y === 2025 || y === 2021 ? 1 : 2;
    return {
      type: "line",
      data: { labels: MONTHS, datasets: years.map((y) => ({ label: String(y), data: D.cumSales[y], borderColor: style(y).c, backgroundColor: style(y).c, borderWidth: style(y).w, pointRadius: 0, pointHoverRadius: 3, tension: .2, order: order(y) })) },
      options: {
        responsive: true, maintainAspectRatio: false, layout: { padding: { top: 14, right: 54 } },
        animation: Deck.reduce ? false : { duration: 1100, easing: "easeOutCubic" },
        plugins: { legend: { display: false }, tooltip: { mode: "nearest", intersect: false, callbacks: { label: (c) => c.dataset.label + ": " + num(c.raw) } } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 14 } } }, y: { min: 0, grid: { color: T.grid }, ticks: { font: { size: 14 }, callback: (v) => Math.round(v / 1000) + "K" } } }
      },
      plugins: [{ id: "yearTags", afterDatasetsDraw(chart){
        chart.data.datasets.forEach((ds, di) => {
          if (!["2021", "2025", "2026"].includes(ds.label)) return;
          const pts = chart.getDatasetMeta(di).data, pt = pts[ds.data.length - 1];
          if (!pt || !isFinite(pt.x) || !isFinite(pt.y)) return;
          tag(chart.ctx, ds.label, pt.x + 8, pt.y + (ds.label === "2025" ? -2 : 0), { color: ds.borderColor, size: 15 });
        });
      } }]
    };
  });

  /* MLS HPI monthly change by province, from the report's table */
  Deck.chart("hpi-mom", () => {
    const labels = ["Canada", "BC", "Alberta", "Ontario", "Quebec"], vals = [0.1, -0.2, -0.1, -0.2, 1.4];
    return {
      type: "bar",
      data: { labels, datasets: [{ data: vals, borderRadius: 6, borderSkipped: false, barPercentage: .6,
        backgroundColor: vals.map((v, i) => i === 4 ? RED : alpha(TEAL, .85)) }] },
      options: {
        responsive: true, maintainAspectRatio: false, layout: { padding: { top: 30 } },
        animation: Deck.reduce ? false : { duration: 900, easing: "easeOutCubic", delay: (c) => c.type === "data" ? c.dataIndex * 130 : 0 },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => (c.raw > 0 ? "+" : "−") + Math.abs(c.raw).toFixed(1) + "% m/m" } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: TEXT, font: { size: 16, weight: 600 } } },
          y: { min: -0.4, max: 1.6, grid: { color: (c) => c.tick.value === 0 ? alpha(GREY, .6) : T.grid }, ticks: { font: { size: 14 }, callback: (v) => v.toFixed(1) + "%" } }
        }
      },
      plugins: [{ id: "vals", afterDatasetsDraw(chart){
        chart.getDatasetMeta(0).data.forEach((b, i) => {
          if (!isFinite(b.x) || !isFinite(b.y)) return;
          const v = vals[i];
          tag(chart.ctx, (v > 0 ? "+" : "−") + Math.abs(v).toFixed(1) + "%", b.x, v > 0 ? b.y - 12 : b.y + 14, { align: "center", size: i === 4 ? 20 : 15, color: i === 4 ? RED : TEXT });
        });
      } }]
    };
  });

  Deck.start();
})();
