/* TCI livestream deck runtime: navigation, dark Chart.js defaults, and per-slide animations.
   Register a chart with Deck.chart("canvas-id", () => configObject). It is rebuilt every time its
   slide comes on screen so the draw-in animation replays live. Use data-count on a number to count it up (add data-sep for thousands separators).
   Shared chart across consecutive slides: put <div class="chart-frame" data-shared="id"> with the canvas in the
   first slide's <div class="chart-slot" data-chart-slot="id" data-state="a">, and an empty slot with the same id and
   another data-state on the next slide. Register with Deck.chart("id", build(state), { update(chart, state) }).
   Moving between those slides keeps the chart in place and animates it from one state to the next. */
(function(){
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  const theme = { text:v("--text"), muted:v("--muted"), faint:v("--faint"), red:v("--red"), teal:v("--teal"), grid:v("--grid"), bg:v("--bg") };
  const builders = {}, live = {};
  const hooks = {};
  const Deck = window.Deck = { theme, reduce, chart(id, build, opts){ builders[id] = build; if (opts) hooks[id] = opts; } };

  if (window.Chart){
    Chart.defaults.color = theme.muted;
    Chart.defaults.borderColor = theme.grid;
    Chart.defaults.font.family = '"DM Sans", sans-serif';
    Chart.defaults.font.size = 14;
    Chart.defaults.plugins.tooltip.backgroundColor = "rgba(6,19,29,.94)";
    Chart.defaults.plugins.tooltip.borderColor = "rgba(159,182,198,.3)";
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    if (reduce) Chart.defaults.animation = false;
  }

  function moveShared(slide, prevSlide){
    const kept = new Set();
    slide.querySelectorAll("[data-chart-slot]").forEach((slot) => {
      const id = slot.dataset.chartSlot, state = slot.dataset.state;
      const frame = document.querySelector('[data-shared="' + id + '"]');
      if (!frame) return;
      if (frame.parentElement !== slot) slot.appendChild(frame);
      const cont = prevSlide && prevSlide.querySelector('[data-chart-slot="' + id + '"]');
      if (cont && live[id] && hooks[id] && hooks[id].update) {
        // Same chart, same spot: cut between the two slides and let the chart animate instead of the slide.
        [slide, prevSlide].forEach((s) => { s.style.transition = "none"; s.style.transform = "none"; });
        requestAnimationFrame(() => requestAnimationFrame(() => [slide, prevSlide].forEach((s) => { s.style.transition = ""; s.style.transform = ""; })));
        hooks[id].update(live[id], state); live[id].update(); kept.add(id);
      }
    });
    return kept;
  }
  function buildCharts(slide, kept){
    slide.querySelectorAll("canvas[id]").forEach((el) => {
      if (kept && kept.has(el.id)) return;
      const slot = el.closest("[data-chart-slot]");
      const build = builders[el.id];
      if (!build || !window.Chart) return;
      if (live[el.id]) { live[el.id].destroy(); delete live[el.id]; }
      live[el.id] = new Chart(el, build(slot ? slot.dataset.state : undefined));
      el.dataset.ready = "1";
    });
  }
  function countUp(slide){
    slide.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || "0", 10);
      const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
      const num = (x) => el.hasAttribute("data-sep") ? x.toLocaleString("en-CA", { minimumFractionDigits: dec, maximumFractionDigits: dec }) : x.toFixed(dec);
      const final = pre + num(target) + suf;
      if (reduce) { el.textContent = final; return; }
      const dur = parseInt(el.dataset.duration || "1400", 10), t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = p < 1 ? pre + num(target * e) + suf : final;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  const slides = Array.from(document.querySelectorAll(".slide"));
  document.querySelectorAll(".title-slide .hint").forEach((hint) => {
    if (slides.length < 2) hint.hidden = true;
  });
  const progress = document.querySelector(".progress > span");
  const counter = document.querySelector(".counter");
  const prevBtn = document.querySelector("[data-prev]");
  const nextBtn = document.querySelector("[data-next]");
  const deck = document.querySelector(".deck");
  let i = -1;

  function go(n){
    n = Math.max(0, Math.min(slides.length - 1, n));
    const changed = n !== i, prevSlide = slides[i];
    i = n;
    slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
    if (progress) progress.style.width = ((i + 1) / slides.length) * 100 + "%";
    if (counter) counter.textContent = (i + 1) + " / " + slides.length;
    if (prevBtn) prevBtn.disabled = i === 0;
    if (nextBtn) nextBtn.disabled = i === slides.length - 1;
    history.replaceState(null, "", "#" + (i + 1));
    if (changed) { const kept = moveShared(slides[i], prevSlide); buildCharts(slides[i], kept); countUp(slides[i]); }
    window.dispatchEvent(new CustomEvent("deck:change", { detail: { index: i, slide: slides[i] } }));
  }
  function fromHash(){
    const n = parseInt((location.hash || "#1").slice(1), 10);
    go(Number.isFinite(n) ? n - 1 : 0);
  }
  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const next = ["ArrowRight","ArrowDown","PageDown"," ","Space","j","J"];
    const prev = ["ArrowLeft","ArrowUp","PageUp","Backspace","k","K"];
    if (next.includes(e.key)) { e.preventDefault(); go(i + 1); }
    else if (prev.includes(e.key)) { e.preventDefault(); go(i - 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); }
    else if (e.key === "End") { e.preventDefault(); go(slides.length - 1); }
    else if (e.key === "c" || e.key === "C") { deck && deck.classList.toggle("show-cam"); }
  });
  let startX = null;
  document.addEventListener("touchstart", (e) => { if (e.changedTouches[0]) startX = e.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (startX == null || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - startX; startX = null;
    if (Math.abs(dx) > 48) go(i + (dx < 0 ? 1 : -1));
  }, { passive: true });
  if (prevBtn) prevBtn.addEventListener("click", () => go(i - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => go(i + 1));
  window.addEventListener("hashchange", fromHash);
  // Start after the page's chart registrations and fonts are in.
  Deck.start = () => (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(fromHash);

  /* Helpers for slide scripts */
  // Progressive line draw-in (Chart.js "progressive line" pattern).
  Deck.drawIn = (points, total = 1600) => {
    if (reduce) return false;
    const step = total / Math.max(1, points);
    const prevY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(ctx.chart.scales.y.min)
      : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(["y"], true).y;
    return {
      x: { type: "number", easing: "linear", duration: step, from: NaN,
        delay(ctx){ if (ctx.type !== "data" || ctx.xStarted) return 0; ctx.xStarted = true; return ctx.index * step; } },
      y: { type: "number", easing: "linear", duration: step, from: prevY,
        delay(ctx){ if (ctx.type !== "data" || ctx.yStarted) return 0; ctx.yStarted = true; return ctx.index * step; } }
    };
  };
  Deck.fmt = (n, d = 0) => n.toLocaleString("en-CA", { minimumFractionDigits: d, maximumFractionDigits: d });
})();
