/* Charts for the grandparent economy deck. Data in deck-data.js. */
(function(){
  const T = Deck.theme, D = window.DD;
  if (/static/.test(location.search)) {
    document.documentElement.classList.add("static");
    Chart.defaults.animation = false;
    Deck.drawIn = () => false;
    document.querySelectorAll("[data-count]").forEach((el) => el.removeAttribute("data-count"));
  }
  Chart.defaults.font.size = 15;
  const C = { key:"#4f9dff", light:"#8fc6ff", white:"#ffffff", slate:"#7088b0", deep:"#2d5eb3", navy:"#16356e", pale:"#dbe8ff" };
  const grid = { color: T.grid }, nogrid = { display:false };
  const pct = (v) => v + "%";
  const money = (v) => "$" + v.toLocaleString("en-CA");
  const moneyK = (v) => "$" + (v / 1000).toLocaleString("en-CA") + "K";

  const barLabels = { id:"barLabels", afterDatasetsDraw(chart, _a, opts){
    if (!opts || !opts.on) return;
    const ctx = chart.ctx; ctx.save(); ctx.font = '700 17px "DM Sans", sans-serif'; ctx.fillStyle = T.text; ctx.textBaseline = "middle";
    const horiz = chart.options.indexAxis === "y";
    chart.data.datasets.forEach((ds, i) => { const meta = chart.getDatasetMeta(i); if (meta.hidden) return;
      meta.data.forEach((b, j) => { const v = ds.data[j]; if (v == null) return; if (opts.min != null && Math.abs(v) < opts.min) return;
        const t = (opts.fmt ? opts.fmt(v) : v);
        if (opts.inside) { ctx.textAlign = "center"; const p = b.getCenterPoint(); ctx.fillText(t, p.x, p.y); }
        else if (horiz) { ctx.textAlign = "left"; ctx.fillText(t, b.x + 8, b.y); }
        else { ctx.textAlign = "center"; ctx.fillText(t, b.x, b.y - (opts.dy || 14)); }
      }); });
    if (opts.totals) {
      // Totals at the end of each stacked horizontal bar.
      const last = chart.getDatasetMeta(chart.data.datasets.length - 1);
      ctx.textAlign = "left"; ctx.font = '700 19px "DM Sans", sans-serif';
      last.data.forEach((b, j) => ctx.fillText(opts.totals[j], b.x + 10, b.y));
    }
    ctx.restore();
  }};
  const refLine = { id:"refLine", afterDatasetsDraw(chart, _a, opts){
    if (!opts || opts.value == null) return;
    const { ctx, chartArea:a, scales } = chart, y = scales.y.getPixelForValue(opts.value);
    ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = C.white; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(a.left, y); ctx.lineTo(a.right, y); ctx.stroke();
    ctx.setLineDash([]); ctx.font = '700 15px "DM Sans", sans-serif'; ctx.fillStyle = C.white; ctx.textAlign = "right"; ctx.textBaseline = "bottom";
    ctx.fillText(opts.label, a.right - 4, y - 6); ctx.restore();
  }};
  Chart.register(barLabels, refLine);

  const base = (extra) => Object.assign({ responsive:true, maintainAspectRatio:false, layout:{ padding:{ right:24, top:30 } } }, extra);
  const ticks = { color:T.text, font:{ size:16, weight:"700" } };
  const ytitle = (text) => ({ display:true, text, font:{ size:14 } });

  // Simple vertical bar chart.
  const cols = (id, labels, data, o) => Deck.chart(id, () => ({
    type:"bar",
    data:{ labels, datasets:[{ data, backgroundColor:o.colors || C.key, borderRadius:6, maxBarThickness:o.thick || 170 }] },
    options: base({ plugins:{ legend:{ display:false }, barLabels:{ on:true, fmt:o.fmt }, refLine:o.ref || {} },
      scales:{ x:{ grid:nogrid, ticks }, y:{ grid, min:0, max:o.max, ticks:{ callback:o.tick || o.fmt }, title:ytitle(o.title) } } })
  }));
  // Simple horizontal bar chart.
  const rows = (id, labels, data, o) => Deck.chart(id, () => ({
    type:"bar",
    data:{ labels, datasets:[{ data, backgroundColor:o.colors || C.key, borderRadius:6, maxBarThickness:90 }] },
    options: base({ indexAxis:"y", layout:{ padding:{ right:o.pad || 110, top:10 } }, plugins:{ legend:{ display:false }, barLabels:{ on:true, fmt:o.fmt } },
      scales:{ x:{ grid, min:0, max:o.max, ticks:{ callback:o.tick || o.fmt }, title:ytitle(o.title) }, y:{ grid:nogrid, ticks } } })
  }));

  rows("c-gifts", D.gifts.labels, D.gifts.v, { fmt:pct, max:40, pad:70, colors:[C.light, C.key, C.deep], title:"Share of grandparents who gave, by amount given in the past year" });

  cols("c-cibc-share", D.cibc.shareLabels, D.cibc.share, { fmt:pct, max:40, colors:[C.light, C.key], title:"First-time buyers who got a family gift" });
  cols("c-cibc-gift", D.cibc.giftLabels, D.cibc.gift, { fmt:money, tick:moneyK, max:160000, colors:[C.key, C.deep], title:"Average gift, first-time buyers" });

  cols("c-fertility", D.fertility.labels, D.fertility.v, { fmt:(v)=>v.toFixed(2), tick:(v)=>v.toFixed(1), max:2.4, colors:[C.key, C.light, C.light],
    title:"Children per woman, 2025", ref:{ value:D.fertility.replacement, label:"Replacement rate, 2.1" } });

  cols("c-growth", D.growth.labels, D.growth.v, { fmt:(v)=>"+"+v.toFixed(1)+"%", tick:pct, max:4, colors:[C.light, C.key], title:"Population growth" });
  cols("c-pr", D.pr.labels, D.pr.v, { fmt:(v)=>v.toLocaleString("en-CA"), tick:(v)=>(v/1000)+"K", max:600000, colors:[C.light, C.key], title:"Permanent residents" });

  rows("c-worth", D.worth.labels, D.worth.v, { fmt:(v)=>"$"+v.toFixed(2)+"T", tick:(v)=>"$"+v+"T", max:7, colors:[C.slate, C.light, C.key], title:"Household net worth by age group, 2023, trillions" });

  Deck.chart("c-own", () => ({
    type:"bar",
    data:{ labels:D.own.labels, datasets:[
      { label:"2011", data:D.own.y2011, backgroundColor:C.light, borderRadius:6, maxBarThickness:150 },
      { label:"2021", data:D.own.y2021, backgroundColor:C.key, borderRadius:6, maxBarThickness:150 } ] },
    options: base({ plugins:{ legend:{ position:"bottom", labels:{ color:T.text, boxWidth:14, font:{ size:16, weight:"700" } } }, barLabels:{ on:true, fmt:(v)=>v.toFixed(1)+"%" } },
      scales:{ x:{ grid:nogrid, ticks }, y:{ grid, min:0, max:70, ticks:{ callback:pct }, title:ytitle("Homeownership rate") } } })
  }));

  cols("c-assets", D.assets.labels, D.assets.v, { fmt:(v)=>"$"+v.toFixed(2)+"T", tick:(v)=>"$"+v+"T", max:24, colors:[C.slate, C.key], title:"Household assets, 2023, trillions" });

  cols("c-permits", D.permits.labels, D.permits.v, { fmt:(v)=>v.toLocaleString("en-CA"), max:5000, colors:[C.key, C.light, C.slate], title:"Units in permits" });

  rows("c-relief", D.relief.labels, D.relief.v, { fmt:money, tick:moneyK, max:150000, pad:120, colors:[C.key, C.light, C.slate], title:"Relief on a new home. Resale homes get none of it." });

  cols("c-price", D.price.labels, D.price.v, { fmt:money, tick:(v)=>"$"+(v/1000000).toFixed(1)+"M", max:1600000, colors:[C.key, C.light], title:"GTA price" });
  cols("c-psf", D.psf.labels, D.psf.v, { fmt:money, tick:money, max:1400, colors:[C.key, C.light], title:"Price per square foot, GTHA condos" });

  cols("c-ratio", D.ratio.labels, D.ratio.v, { fmt:(v)=>v.toFixed(1), max:4, colors:[C.light, C.key], title:"People aged 20 to 64 per person 65 and older" });
  cols("c-oas", D.oas.labels, D.oas.v, { fmt:(v)=>"$"+v.toFixed(1)+"B", tick:(v)=>"$"+v+"B", max:160, colors:[C.light, C.key], title:"Old Age Security cost per year, billions" });

  cols("c-tfr", D.tfr.labels, D.tfr.v, { fmt:(v)=>v.toFixed(2).replace(/0$/, ""), tick:(v)=>v.toFixed(1), max:2.4, thick:130,
    colors:D.tfr.labels.map((l)=> l === "Canada" ? C.key : C.light), title:"Children per woman", ref:{ value:D.tfr.replacement, label:"Replacement rate, 2.1" } });

  Deck.chart("c-immig", () => ({
    type:"line",
    data:{ labels:D.immig.labels, datasets:[{ data:D.immig.v, borderColor:C.key, backgroundColor:C.key, borderWidth:4, pointRadius:9, pointHoverRadius:10, tension:0 }] },
    options: base({ layout:{ padding:{ right:40, left:10, top:30 } }, plugins:{ legend:{ display:false }, barLabels:{ on:true, fmt:pct, dy:26 } },
      scales:{ x:{ grid:nogrid, ticks, offset:true }, y:{ grid, min:0, max:70, ticks:{ callback:pct }, title:ytitle("Say there is too much immigration") } } })
  }));

  cols("c-sell", D.sell.labels, D.sell.v, { fmt:(v)=>v.toFixed(1)+"%", tick:pct, max:90, colors:[C.light, C.light, C.key, C.key], title:"Owners who sell within five years, by age" });

  rows("c-nia", D.nia.labels, D.nia.v, { fmt:pct, max:100, pad:70, colors:[C.key, C.light], title:"Canadians 50 and older" });

  Deck.chart("c-move", () => {
    const shades = [C.key, C.light, C.deep, C.slate, C.navy, C.pale];
    return { type:"bar",
      data:{ labels:D.move.scenarios, datasets:D.move.rows.map(([label, data], i) => ({ label, data, backgroundColor:shades[i], borderColor:"#08183a", borderWidth:1, maxBarThickness:120 })) },
      options: base({ indexAxis:"y", layout:{ padding:{ right:110, top:8 } },
        plugins:{ legend:{ position:"bottom", labels:{ color:T.text, boxWidth:14, font:{ size:15 } } },
          barLabels:{ on:true, inside:true, min:9000, fmt:money, totals:D.move.total.map(money) } },
        scales:{ x:{ stacked:true, min:0, max:120000, grid, ticks:{ callback:moneyK }, title:ytitle("Switching cost") }, y:{ stacked:true, grid:nogrid, ticks } } }) };
  });

  cols("c-life", D.life.labels, D.life.v, { fmt:(v)=>v.toFixed(1)+" years", tick:(v)=>v, max:25, colors:[C.key, C.light], title:"Years of life expected at age 65" });

  cols("c-cottage", D.cottage.labels, D.cottage.v, { fmt:money, tick:moneyK, max:1000000, colors:[C.slate, C.light, C.deep, C.key], title:"Hypothetical cottage" });

  cols("c-give", D.give.labels, D.give.v, { fmt:pct, max:80, colors:[C.key, C.light], title:"Grandparents, preferred way to pass money on" });

  Deck.start();
})();
