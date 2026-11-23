/* Charts for the stock crash vs real estate deck. Data in deck-data.js (window.DD). */
(function(){
  const T = Deck.theme, D = window.DD;
  // ?static=1 turns off animation (for screenshots and video export)
  if (/static/.test(location.search)) { document.documentElement.classList.add("static"); Chart.defaults.animation = false; Deck.drawIn = () => false; document.querySelectorAll("[data-count]").forEach((el) => el.removeAttribute("data-count")); }
  const C = { key:"#4f9dff", light:"#8fc6ff", white:"#ffffff", slate:"#7088b0", deep:"#2d5eb3", dim:"rgba(180,198,230,.35)" };
  const grid = { color: T.grid }, nogrid = { display:false };
  const pct = (v) => v + "%";
  const qLabel = (q) => q.replace(":", " ");
  // direct end labels on line charts
  const endLabels = { id:"endLabels", afterDatasetsDraw(chart, _a, opts){
    if (!opts || !opts.on) return;
    const ctx = chart.ctx; ctx.save(); ctx.font = '700 15px "DM Sans", sans-serif'; ctx.textBaseline = "middle";
    chart.data.datasets.forEach((ds, i) => {
      if (ds.noEnd) return; const meta = chart.getDatasetMeta(i); if (meta.hidden) return;
      let j = ds.data.length - 1; while (j >= 0 && (ds.data[j] == null || (typeof ds.data[j] === "object" && ds.data[j].y == null))) j--;
      const pt = meta.data[j]; if (!pt) return;
      const raw = ds.data[j]; const val = typeof raw === "object" ? raw.y : raw;
      ctx.fillStyle = ds.borderColor; ctx.textAlign = "left";
      ctx.fillText((ds.endText || ds.label) + (ds.endVal === false ? "" : " " + (ds.fmt ? ds.fmt(val) : val)), pt.x + 8, pt.y + (ds.dy || 0));
    });
    ctx.restore();
  }};
  const barLabels = { id:"barLabels", afterDatasetsDraw(chart, _a, opts){
    if (!opts || !opts.on) return;
    const ctx = chart.ctx; ctx.save(); ctx.font = '700 14px "DM Sans", sans-serif'; ctx.fillStyle = T.text; ctx.textBaseline = "middle";
    const horiz = chart.options.indexAxis === "y";
    chart.data.datasets.forEach((ds, i) => { const meta = chart.getDatasetMeta(i); if (meta.hidden) return;
      meta.data.forEach((b, j) => { const v = ds.data[j]; if (v == null) return; if (opts.min != null && Math.abs(v) < opts.min) return;
        const t = (opts.fmt ? opts.fmt(v) : v);
        if (opts.inside) { ctx.textAlign = "center"; const p = b.getCenterPoint(); ctx.fillText(t, p.x, p.y); }
        else if (horiz) { ctx.textAlign = v >= 0 ? "left" : "right"; ctx.fillText(t, b.x + (v >= 0 ? 6 : -6), b.y); }
        else { ctx.textAlign = "center"; ctx.fillText(t, b.x, b.y + (v >= 0 ? -12 : 14)); }
      }); });
    ctx.restore();
  }};
  Chart.register(endLabels, barLabels);
  const base = (extra) => Object.assign({ responsive:true, maintainAspectRatio:false, layout:{ padding:{ right:120, top:10 } } }, extra);
  const line = (label, data, color, w, extra) => Object.assign({ label, data, borderColor:color, backgroundColor:color, borderWidth:w||3, pointRadius:0, tension:.15, spanGaps:true }, extra||{});
  const legendOff = { legend:{ display:false } };

  // 1. S&P 2026
  Deck.chart("c-sp2026", () => {
    const d = D.sp2026; const peak = d.v.indexOf(Math.max(...d.v));
    return { type:"line", data:{ labels:d.d, datasets:[ line("S&P 500", d.v, C.key, 3, { fmt:(v)=>Deck.fmt(v,0), pointRadius:d.v.map((_,i)=> i===peak?6:0), pointBackgroundColor:C.white }) ] },
      options: base({ animation:Deck.drawIn(d.v.length, 1400), plugins:{ ...legendOff, endLabels:{ on:true } },
        scales:{ x:{ grid:nogrid, ticks:{ maxTicksLimit:11, callback(v){ const s=this.getLabelForValue(v); return new Date(s+"T12:00:00").toLocaleDateString("en-CA",{month:"short"}); } } }, y:{ grid, ticks:{ callback:(v)=>Deck.fmt(v) } } } }) };
  });
  // 2. summary bars
  Deck.chart("c-summary", () => {
    const s = D.summary; const lab = ["1987","1990","2000-02","2007-09","2020","2022"];
    return { type:"bar", data:{ labels:lab, datasets:[
      { label:"US (Case-Shiller)", data:s.map(x=>x.cs24), backgroundColor:C.light, borderRadius:4 },
      { label:"Canada (BIS)", data:s.map(x=>x.bisca24), backgroundColor:C.key, borderRadius:4 },
      { label:"Toronto new homes (NHPI)", data:s.map(x=>x.tor24), backgroundColor:C.slate, borderRadius:4 } ] },
      options: base({ layout:{ padding:{ top:24 } }, plugins:{ legend:{ labels:{ color:T.text, boxWidth:14 } }, barLabels:{ on:true, fmt:(v)=>(v>0?"+":"")+v.toFixed(0), min:0.5 } },
        scales:{ x:{ grid:nogrid, ticks:{ color:T.text, font:{ size:15, weight:"700" } } }, y:{ grid, ticks:{ callback:pct }, title:{ display:true, text:"Home price change, 24 months after the stock peak" } } } }) };
  });
  // 3. rates
  Deck.chart("c-rates", () => { const r = D.ratesNow; const lab = r.m;
    return { type:"line", data:{ labels:lab, datasets:[
      line("US 30-yr", r.m30, C.white, 3, { fmt:(v)=>v.toFixed(2)+"%" }), line("CA 5-yr posted", r.ca5, C.light, 3, { fmt:(v)=>v.toFixed(2)+"%" }),
      line("Fed funds", r.ff, C.slate, 2.5, { fmt:(v)=>v.toFixed(2)+"%" }), line("BoC", r.boc, C.key, 3.5, { fmt:(v)=>v.toFixed(2)+"%", dy:6 }) ] },
      options: base({ layout:{ padding:{ right:205, top:10 } }, animation:Deck.drawIn(lab.length, 1400), plugins:{ ...legendOff, endLabels:{ on:true } },
        scales:{ x:{ grid:nogrid, ticks:{ maxTicksLimit:8, callback(v){ const s=this.getLabelForValue(v); return s.endsWith("-01")? s.slice(0,4):""; }, autoSkip:false } }, y:{ grid, min:0, ticks:{ callback:pct } } } }) };
  });
  // 4. DFA
  Deck.chart("c-dfa", () => { const d = D.dfa;
    return { type:"line", data:{ labels:d.q.map(qLabel), datasets:[
      line("Stocks & funds", d.eq, C.key, 3.5, { fmt:(v)=>v.toFixed(1)+"%" }), line("Real estate", d.re, C.light, 3, { fmt:(v)=>v.toFixed(1)+"%" }) ] },
      options: base({ layout:{ padding:{ right:190, top:10 } }, animation:Deck.drawIn(d.q.length, 1500), plugins:{ ...legendOff, endLabels:{ on:true } },
        scales:{ x:{ grid:nogrid, ticks:{ autoSkip:false, callback(v){ const s=this.getLabelForValue(v); return (s.endsWith("Q1") && +s.slice(0,4)%5===0) ? s.slice(0,4):""; } } }, y:{ grid, min:0, max:40, ticks:{ callback:pct }, title:{ display:true, text:"% of US household assets" } } } }) };
  });
  // 5. NBSA
  Deck.chart("c-nbsa", () => { const d = D.nbsa;
    return { type:"line", data:{ labels:d.q, datasets:[
      line("Real estate", d.re, C.light, 3, { fmt:(v)=>v.toFixed(1)+"%" }), line("Listed stocks & funds", d.listed, C.key, 3.5, { fmt:(v)=>v.toFixed(1)+"%" }) ] },
      options: base({ layout:{ padding:{ right:230, top:10 } }, animation:Deck.drawIn(d.q.length, 1500), plugins:{ ...legendOff, endLabels:{ on:true } },
        scales:{ x:{ grid:nogrid, ticks:{ autoSkip:false, callback(v){ const s=this.getLabelForValue(v); return (s.endsWith("-01") && +s.slice(0,4)%5===0) ? s.slice(0,4):""; } } }, y:{ grid, min:0, max:50, ticks:{ callback:pct }, title:{ display:true, text:"% of Canadian household assets" } } } }) };
  });
  // 6. ratio
  Deck.chart("c-ratio", () => { const d = D.ratio; const n = d.v.length;
    return { type:"line", data:{ labels:d.q, datasets:[ line("Q2 2026", d.v, C.key, 3.5, { fmt:(v)=>"$"+v.toFixed(2), fill:{ target:{ value:1 }, above:"rgba(79,157,255,.16)", below:"rgba(143,198,255,.06)" }, pointRadius:d.v.map((_,i)=>i===n-1?6:0), pointBackgroundColor:C.white }),
      { label:"parity", data:d.v.map(()=>1), borderColor:C.dim, borderDash:[6,6], borderWidth:1.5, pointRadius:0, noEnd:true } ] },
      options: base({ animation:Deck.drawIn(n, 1500), plugins:{ ...legendOff, endLabels:{ on:true } },
        scales:{ x:{ grid:nogrid, ticks:{ autoSkip:false, callback(v){ const s=this.getLabelForValue(v); return (s.endsWith("-01") && +s.slice(0,4)%5===0) ? s.slice(0,4):""; } } }, y:{ grid, min:0.7, max:1.45, ticks:{ callback:(v)=>"$"+v.toFixed(2) }, title:{ display:true, text:"Financial assets per $1 of non-financial" } } } }) };
  });
  // 7. DFA mix
  const G = ["Top1","90-99","50-90","Bottom50"], GL = ["Top 1%","90th-99th","50th-90th","Bottom 50%"];
  Deck.chart("c-mix", () => { const m = D.dfaMix; const k = [["eq","Stocks & funds",C.key],["re","Real estate",C.light],["pen","Pensions",C.deep],["biz","Private business",C.slate],["oth","Other","rgba(180,198,230,.25)"]];
    return { type:"bar", data:{ labels:GL, datasets:k.map(([f,l,c])=>({ label:l, data:G.map(g=>m[g][f]), backgroundColor:c, borderColor:"#08183a", borderWidth:1 })) },
      options: base({ indexAxis:"y", layout:{ padding:{ right:10 } }, plugins:{ legend:{ position:"bottom", labels:{ color:T.text, boxWidth:14 } }, barLabels:{ on:true, inside:true, min:6, fmt:(v)=>v.toFixed(0)+"%" } },
        scales:{ x:{ stacked:true, max:100, grid, ticks:{ callback:pct } }, y:{ stacked:true, grid:nogrid, ticks:{ color:T.text, font:{ size:16, weight:"700" } } } } }) };
  });
  // 8. ownership
  Deck.chart("c-own", () => { const o = D.dfaOwn;
    return { type:"bar", data:{ labels:GL, datasets:[ { label:"Share of all household stocks & funds", data:G.map(g=>o[g].eq), backgroundColor:C.key, borderRadius:4 }, { label:"Share of all household real estate", data:G.map(g=>o[g].re), backgroundColor:C.light, borderRadius:4 } ] },
      options: base({ indexAxis:"y", layout:{ padding:{ right:60 } }, plugins:{ legend:{ position:"bottom", labels:{ color:T.text, boxWidth:14 } }, barLabels:{ on:true, fmt:(v)=>v.toFixed(1)+"%" } },
        scales:{ x:{ grid, max:60, ticks:{ callback:pct } }, y:{ grid:nogrid, ticks:{ color:T.text, font:{ size:16, weight:"700" } } } } }) };
  });
  // 9. DHEA mix
  const Q = ["Lowest wealth quintile","Second wealth quintile","Third wealth quintile","Fourth wealth quintile","Highest wealth quintile"], QL = ["Bottom 20%","2nd","3rd","4th","Top 20%"];
  Deck.chart("c-dhea", () => { const m = D.dhea; const k = [["re","Real estate",C.light],["pen","Pensions & life insurance",C.deep],["ofa","Other financial (incl. stocks)",C.key],["onf","Other non-financial",C.slate]];
    return { type:"bar", data:{ labels:QL, datasets:k.map(([f,l,c])=>({ label:l, data:Q.map(q=>m[q][f]), backgroundColor:c, borderColor:"#08183a", borderWidth:1 })) },
      options: base({ layout:{ padding:{ right:10 } }, plugins:{ legend:{ position:"bottom", labels:{ color:T.text, boxWidth:14 } }, barLabels:{ on:true, inside:true, min:6, fmt:(v)=>v.toFixed(0)+"%" } },
        scales:{ y:{ stacked:true, max:100, grid, ticks:{ callback:pct } }, x:{ stacked:true, grid:nogrid, ticks:{ color:T.text, font:{ size:16, weight:"700" } } } } }) };
  });
  // 10. DHEA distribution
  Deck.chart("c-dist", () => { const m = D.dhea;
    return { type:"bar", data:{ labels:QL, datasets:[ { label:"Share of all financial assets", data:Q.map(q=>m[q].distFin), backgroundColor:C.key, borderRadius:4 }, { label:"Share of all non-financial assets", data:Q.map(q=>m[q].distNonFin), backgroundColor:C.light, borderRadius:4 } ] },
      options: base({ layout:{ padding:{ top:24 } }, plugins:{ legend:{ position:"bottom", labels:{ color:T.text, boxWidth:14 } }, barLabels:{ on:true, fmt:(v)=>v.toFixed(1)+"%" } },
        scales:{ y:{ grid, max:80, ticks:{ callback:pct } }, x:{ grid:nogrid, ticks:{ color:T.text, font:{ size:16, weight:"700" } } } } }) };
  });
  // 13. MPC
  Deck.chart("c-mpc", () => ({ type:"bar", data:{ labels:["Real estate","Other net assets","Stocks"], datasets:[ { data:[5.15,2.9,1.18], backgroundColor:[C.key,C.slate,C.light], borderRadius:6 } ] },
    options: base({ indexAxis:"y", layout:{ padding:{ right:70 } }, plugins:{ ...legendOff, barLabels:{ on:true, fmt:(v)=>v.toFixed(2)+"¢" } },
      scales:{ x:{ grid, min:0, max:6, title:{ display:true, text:"Cents of spending per $1 change in wealth" } }, y:{ grid:nogrid, ticks:{ color:T.text, font:{ size:17, weight:"700" } } } } }) }));
  // episode charts
  const mLab = (labels) => labels.map((m,i)=> i===0 ? "Peak" : (i%6===0 ? "+"+i+"m" : ""));
  function episode(id, key, rateKey, rateLabel){
    Deck.chart(id, () => { const e = D[key]; const ds = [
      line("S&P 500", e.sp, C.white, 2.5, { fmt:(v)=>v.toFixed(0), yAxisID:"y" }), line("TSX", e.tsx, C.slate, 2.5, { fmt:(v)=>v.toFixed(0), yAxisID:"y" }),
      line("US homes", e.cs, C.light, 3.5, { fmt:(v)=>v.toFixed(0), yAxisID:"y" }) ];
      if (key === "e1987") ds.push(line("Toronto new homes", e.tor, C.key, 3.5, { fmt:(v)=>v.toFixed(0), yAxisID:"y" }));
      else ds.push(line("Canada homes", e.bisca, C.key, 3.5, { fmt:(v)=>v.toFixed(0), yAxisID:"y" }));
      if (rateKey) ds.push(line(rateLabel, e[rateKey], "rgba(143,198,255,.55)", 2, { borderDash:[5,5], yAxisID:"y2", fmt:(v)=>v.toFixed(2)+"%" }));
      const scales = { x:{ grid:nogrid, ticks:{ autoSkip:false, callback(v){ return mLab(e.labels)[v]; } } }, y:{ grid, title:{ display:true, text:"Index, stock peak month = 100" } } };
      if (rateKey) scales.y2 = { position:"right", grid:nogrid, ticks:{ callback:pct }, title:{ display:true, text:rateLabel } };
      return { type:"line", data:{ labels:e.labels, datasets:ds }, options: base({ layout:{ padding:{ right: rateKey?20:150, top:10 } }, animation:Deck.drawIn(e.labels.length, 1500), plugins:{ legend:{ display: !!rateKey, labels:{ color:T.text, boxWidth:14, usePointStyle:true } }, endLabels:{ on: !rateKey } }, scales }) };
    });
  }
  episode("c-e1987", "e1987");
  episode("c-e2000", "e2000", "ff", "Fed funds");
  episode("c-e2020", "e2020", "m30", "US 30-yr mortgage");
  episode("c-e2022", "e2022", "ff", "Fed funds");
  // GFC lead
  Deck.chart("c-gfc", () => { const g = D.gfcLead; const csPk = g.cs.indexOf(Math.max(...g.cs)), spPk = g.sp.indexOf(Math.max(...g.sp));
    return { type:"line", data:{ labels:g.labels, datasets:[
      line("US homes", g.cs, C.light, 3.5, { fmt:(v)=>v.toFixed(0), pointRadius:g.cs.map((_,i)=>i===csPk?7:0), pointBackgroundColor:C.light }),
      line("S&P 500", g.sp, C.key, 3.5, { fmt:(v)=>v.toFixed(0), pointRadius:g.sp.map((_,i)=>i===spPk?7:0), pointBackgroundColor:C.key }) ] },
      options: base({ animation:Deck.drawIn(g.labels.length, 1500), plugins:{ ...legendOff, endLabels:{ on:true } },
        scales:{ x:{ grid:nogrid, ticks:{ autoSkip:false, callback(v){ const s=this.getLabelForValue(v); return s.endsWith("-01")? s.slice(0,4) : (v===csPk? "Jul 06 home peak" : (v===spPk? "Oct 07 stock peak":"")); }, color:T.text } }, y:{ grid, title:{ display:true, text:"Index, Jan 2005 = 100" } } } }) };
  });
  // Toronto 1989
  Deck.chart("c-tor89", () => { const t = D.tor89;
    return { type:"bar", data:{ labels:t.y.map(String), datasets:[
      { type:"bar", label:"TRREB average price", data:t.trreb, backgroundColor:t.y.map(y=> (y===1989||y===1996)?C.key:"rgba(143,198,255,.45)"), borderRadius:3, yAxisID:"y", order:2 },
      { type:"line", label:"Bank Rate", data:t.bank, borderColor:C.white, backgroundColor:C.white, borderWidth:3, pointRadius:3, yAxisID:"y2", order:1, tension:.2 } ] },
      options: base({ layout:{ padding:{ top:10 } }, plugins:{ legend:{ labels:{ color:T.text, boxWidth:14 } }, barLabels:{ on:false } },
        scales:{ x:{ grid:nogrid }, y:{ grid, ticks:{ callback:(v)=>"$"+Deck.fmt(v/1000)+"K" }, title:{ display:true, text:"TRREB average price" } }, y2:{ position:"right", grid:nogrid, min:0, max:16, ticks:{ callback:pct }, title:{ display:true, text:"Bank Rate" } } } }) };
  });
  // scatter
  Deck.chart("c-scatter", () => { const s = D.summary; const lab = ["1987","1990","2000-02","2007-09","2020","2022"];
    const us = s.map((x,i)=>({ x:x.sp, y:x.cs24, l:lab[i] })), ca = s.map((x,i)=>({ x:x.sp, y: i===1 ? x.tor24 : x.bisca24, l: lab[i] + (i===1?" (Toronto)":"") }));
    const ptLabels = { id:"ptLabels", afterDatasetsDraw(chart){ const ctx=chart.ctx; ctx.save(); ctx.font='600 13px "DM Sans",sans-serif'; ctx.fillStyle=T.muted;
      chart.data.datasets.forEach((ds,i)=>chart.getDatasetMeta(i).data.forEach((p,j)=>{ ctx.textAlign="left"; ctx.fillText(ds.data[j].l, p.x+10, p.y-10); })); ctx.restore(); } };
    return { type:"scatter", data:{ datasets:[ { label:"US homes", data:us, backgroundColor:C.light, pointRadius:9 }, { label:"Canada homes (Toronto for 1990)", data:ca, backgroundColor:C.key, pointRadius:9, pointStyle:"rectRot" } ] },
      plugins:[ptLabels],
      options: base({ layout:{ padding:{ right:40, top:10 } }, plugins:{ legend:{ labels:{ color:T.text, usePointStyle:true } } },
        scales:{ x:{ grid, min:-55, max:0, title:{ display:true, text:"S&P 500 drop, peak to trough (monthly average)" }, ticks:{ callback:pct } }, y:{ grid, min:-25, max:45, title:{ display:true, text:"Home prices, 24 months after stock peak" }, ticks:{ callback:pct } } } }) };
  });
  // GoC 2026
  Deck.chart("c-goc", () => { const g = D.goc2026;
    return { type:"line", data:{ labels:g.d, datasets:[ line("5-yr", g.y5, C.key, 3.5, { fmt:(v)=>v.toFixed(2)+"%" }), line("10-yr", g.y10, C.light, 2.5, { fmt:(v)=>v.toFixed(2)+"%" }) ] },
      options: base({ layout:{ padding:{ right:130, top:10 } }, animation:Deck.drawIn(g.d.length, 1400), plugins:{ ...legendOff, endLabels:{ on:true } },
        scales:{ x:{ grid:nogrid, ticks:{ maxTicksLimit:11, callback(v){ const s=this.getLabelForValue(v); return new Date(s+"T12:00:00").toLocaleDateString("en-CA",{month:"short"}); } } }, y:{ grid, ticks:{ callback:(v)=>v.toFixed(1)+"%" } } } }) };
  });
  Deck.start();
})();
