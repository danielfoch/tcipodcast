/* Charts for the "Do your real estate investments own you?" deck. Data in deck-data.js. */
(function(){
  const T = Deck.theme, D = window.DD;
  if (/static/.test(location.search)) {
    document.documentElement.classList.add("static");
    Chart.defaults.animation = false;
    Deck.drawIn = () => false;
    document.querySelectorAll("[data-count]").forEach((el) => el.removeAttribute("data-count"));
  }
  const C = { key:"#4f9dff", light:"#8fc6ff", white:"#ffffff", slate:"#7088b0", deep:"#2d5eb3", dim:"rgba(180,198,230,.35)" };
  const grid = { color: T.grid }, nogrid = { display:false };
  const pct = (v) => v + "%";
  const barLabels = { id:"barLabels", afterDatasetsDraw(chart, _a, opts){
    if (!opts || !opts.on) return;
    const ctx = chart.ctx; ctx.save(); ctx.font = '700 14px "DM Sans", sans-serif'; ctx.fillStyle = T.text; ctx.textBaseline = "middle";
    const horiz = chart.options.indexAxis === "y";
    chart.data.datasets.forEach((ds, i) => { const meta = chart.getDatasetMeta(i); if (meta.hidden) return;
      meta.data.forEach((b, j) => { const v = ds.data[j]; if (v == null) return; if (opts.min != null && Math.abs(v) < opts.min) return;
        const t = (opts.fmt ? opts.fmt(v) : v);
        if (opts.inside) { ctx.textAlign = "center"; const p = b.getCenterPoint(); ctx.fillText(t, p.x, p.y); }
        else if (horiz) {
          // Keep a negative label inside the bar so it does not cover the category name.
          ctx.textAlign = "left";
          ctx.fillText(t, b.x + (v >= 0 ? 8 : 12), b.y);
        }
        else { ctx.textAlign = "center"; ctx.fillText(t, b.x, v >= 0 ? b.y - 12 : b.y - 16); }
      }); });
    ctx.restore();
  }};
  Chart.register(barLabels);
  const base = (extra) => Object.assign({ responsive:true, maintainAspectRatio:false, layout:{ padding:{ right:24, top:18 } } }, extra);
  const ticks = { color:T.text, font:{ size:15, weight:"700" } };

  Deck.chart("c-neg", () => ({
    type:"bar",
    data:{ labels:D.neg.y, datasets:[{ data:D.neg.v, backgroundColor:D.neg.v.map((v,i)=> i>=2 ? C.key : C.light), borderRadius:6 }] },
    options: base({ plugins:{ legend:{ display:false }, barLabels:{ on:true, fmt:(v)=>v+"%" } },
      scales:{ x:{ grid:nogrid, ticks }, y:{ grid, min:0, max:100, ticks:{ callback:pct }, title:{ display:true, text:"Share cash-flow negative" } } } })
  }));

  Deck.chart("c-cash", () => ({
    type:"bar",
    data:{ labels:D.cash.y, datasets:[{ data:D.cash.v, backgroundColor:D.cash.v.map(v=> v>=0 ? C.light : C.key), borderRadius:6 }] },
    options: base({ plugins:{ legend:{ display:false }, barLabels:{ on:true, fmt:(v)=>(v<0?"−$":"+$")+Math.abs(v) } },
      scales:{ x:{ grid:nogrid, ticks }, y:{ grid, ticks:{ callback:(v)=>(v<0?"−$":"$")+Math.abs(v) }, title:{ display:true, text:"Average monthly cash flow" } } } })
  }));

  Deck.chart("c-tax", () => ({
    type:"bar",
    data:{ labels:["Median profit", "Median loss"], datasets:[{ data:[D.tax.profit, D.tax.loss], backgroundColor:[C.light, C.key], borderRadius:6 }] },
    options: base({ indexAxis:"y", layout:{ padding:{ right:80, top:10 } }, plugins:{ legend:{ display:false }, barLabels:{ on:true, fmt:(v)=>(v<0?"−$":"$")+Math.abs(v).toLocaleString("en-CA") } },
      scales:{ x:{ grid, ticks:{ callback:(v)=>(v<0?"−$":"$")+Math.abs(v/1000)+"k" } }, y:{ grid:nogrid, ticks } } })
  }));

  Deck.chart("c-leak", () => ({
    type:"bar",
    data:{ labels:D.leak.labels, datasets:[{ data:D.leak.v, backgroundColor:C.key, borderRadius:6 }] },
    options: base({ indexAxis:"y", layout:{ padding:{ right:70 } }, plugins:{ legend:{ display:false }, barLabels:{ on:true, fmt:(v)=>"−$"+Math.abs(v) } },
      scales:{ x:{ grid, ticks:{ callback:(v)=>"−$"+Math.abs(v) } }, y:{ grid:nogrid, ticks } } })
  }));

  Deck.chart("c-renew", () => ({
    type:"bar",
    data:{ labels:D.renew.labels, datasets:[{ data:D.renew.v, backgroundColor:[C.light, C.slate, C.key], borderRadius:6 }] },
    options: base({ plugins:{ legend:{ display:false }, barLabels:{ on:true, fmt:(v)=>"+"+v+"%" } },
      scales:{ x:{ grid:nogrid, ticks }, y:{ grid, min:0, max:28, ticks:{ callback:(v)=>"+"+v+"%" }, title:{ display:true, text:"Average payment change vs December 2024" } } } })
  }));

  Deck.chart("c-rents", () => ({
    type:"bar",
    data:{ labels:D.rents.labels, datasets:[{ label:"Year-over-year change, October 2026", data:D.rents.yoy, backgroundColor:C.key, borderRadius:6 }] },
    options: base({ plugins:{ legend:{ display:false }, barLabels:{ on:true, fmt:(v)=>v.toFixed(1)+"%" } },
      scales:{ x:{ grid:nogrid, ticks }, y:{ grid, max:0, min:-8, ticks:{ callback:(v)=>v+"%" }, title:{ display:true, text:"Asking rent, October 2026 vs October 2025" } } } })
  }));

  Deck.chart("c-delinq", () => ({
    type:"bar",
    data:{ labels:D.delinq.labels, datasets:[{ data:D.delinq.yoy, backgroundColor:[C.light, C.key, C.slate], borderRadius:6 }] },
    options: base({ plugins:{ legend:{ display:false }, barLabels:{ on:true, fmt:(v)=>"+"+v+"%" } },
      scales:{ x:{ grid:nogrid, ticks }, y:{ grid, min:0, max:70, ticks:{ callback:(v)=>"+"+v+"%" }, title:{ display:true, text:"Mortgage delinquency rate, Q1 2026 vs Q1 2025" } } } })
  }));

  Deck.chart("c-own", () => {
    const rows = [
      ["Small-scale individual", D.own.smallInd, C.key],
      ["Small-scale business", D.own.smallBiz, C.light],
      ["Medium-scale individual", D.own.medInd, C.deep],
      ["Medium-scale business", D.own.medBiz, C.slate],
      ["Institutional", D.own.inst, "#16356e"]
    ];
    return { type:"bar", data:{ labels:D.own.prov, datasets:rows.map(([l,data,c])=>({ label:l, data, backgroundColor:c, borderColor:"#08183a", borderWidth:1 })) },
      options: base({ indexAxis:"y", layout:{ padding:{ right:8, top:8 } }, plugins:{ legend:{ position:"bottom", labels:{ color:T.text, boxWidth:12 } }, barLabels:{ on:true, inside:true, min:9, fmt:(v)=>v.toFixed(1)+"%" } },
        scales:{ x:{ stacked:true, max:100, grid, ticks:{ callback:pct } }, y:{ stacked:true, grid:nogrid, ticks } } }) };
  });

  Deck.chart("c-owners", () => ({
    type:"bar",
    data:{ labels:D.owners.prov, datasets:[{ data:D.owners.v, backgroundColor:C.key, borderRadius:6 }] },
    options: base({ indexAxis:"y", layout:{ padding:{ right:64 } }, plugins:{ legend:{ display:false }, barLabels:{ on:true, fmt:(v)=>v.toFixed(1)+"%" } },
      scales:{ x:{ grid, min:0, max:40, ticks:{ callback:pct }, title:{ display:true, text:"Share of owners who are investors, 2020" } }, y:{ grid:nogrid, ticks } } })
  }));

  Deck.chart("c-pay", () => ({
    type:"bar",
    data:{ labels:D.pay.labels, datasets:[{ data:D.pay.monthly, backgroundColor:[C.light, C.key], borderRadius:6 }] },
    options: base({ plugins:{ legend:{ display:false }, barLabels:{ on:true, fmt:(v)=>"$"+Math.round(v).toLocaleString("en-CA") } },
      scales:{ x:{ grid:nogrid, ticks, title:{ display:true, text:"Contract rate" } }, y:{ grid, min:0, ticks:{ callback:(v)=>"$"+v.toLocaleString("en-CA") }, title:{ display:true, text:"Monthly payment, $500,000, 25 years" } } } })
  }));

  Deck.start();
})();
