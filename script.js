/* ==========================================================================
   Bharati Tripathi — Portfolio  ·  v2
   Vanilla JS, no dependencies. Every feature is feature-detected and
   null-guarded, so a missing element never breaks the rest of the page.
   ========================================================================== */
(function () {
  'use strict';
  /* Everything that hides content (reveal, 3D entrance, bars, radar, flip cards) is gated on this
     class, and it is set HERE rather than in an inline head script: if this file ever fails to
     load, the class never lands and the page still shows all of its content. */
  document.documentElement.className += ' js';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;

  /* ---------- 1. THEME (persisted, respects OS default) ---------- */
  (function theme() {
    var KEY = 'bt-theme';
    var btn = $('#themeToggle');
    var meta = $('meta[name="theme-color"]');

    function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function apply(mode) {
      root.setAttribute('data-theme', mode);
      if (meta) meta.setAttribute('content', mode === 'light' ? '#F6F7FB' : '#07070B');
      if (btn) {
        btn.setAttribute('aria-pressed', mode === 'light' ? 'true' : 'false');
        btn.setAttribute('aria-label', mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
      }
    }
    var saved = stored();
    apply(saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));

    if (btn) btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* private mode */ }
      document.dispatchEvent(new CustomEvent('bt:theme', { detail: next }));
      drawAll(); // re-render dot-art with the new palette
    });
  })();

  /* ---------- 2. MOBILE NAV ---------- */
  (function mobileNav() {
    var burger = $('#burger');
    if (!burger) return;
    function close() { root.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); }
    burger.addEventListener('click', function () {
      var open = root.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('#navLinks a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  })();

  /* ---------- 3. CURSOR + SPOTLIGHT (one shared rAF, throttled) ---------- */
  (function pointer() {
    var spot = $('#spotlight');
    var dot = $('#cursor-dot');
    var ring = $('#cursor-ring');
    if (!finePointer || reduceMotion || !dot || !ring || !spot) return;

    root.classList.add('cursor-on');
    var mx = 0, my = 0, rx = 0, ry = 0, pending = false, px = null, py = null;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      // some browsers dispatch a synthetic move at (0,0) before any real input — only reveal the
      // glow once the pointer has actually changed position, otherwise it parks in the top-left corner
      if (px === null) { px = mx; py = my; }
      else if (!root.classList.contains('pointer-live') && (mx !== px || my !== py)) root.classList.add('pointer-live');
      px = mx; py = my;
      spot.style.left = mx + 'px'; spot.style.top = my + 'px';
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      if (!pending) { pending = true; requestAnimationFrame(step); }
    }, { passive: true });

    function step() {
      pending = false;
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      if (Math.abs(mx - rx) > 0.4 || Math.abs(my - ry) > 0.4) { pending = true; requestAnimationFrame(step); }
    }

    var hoverSel = 'a,button,.card,.c-card,.btn,.pill,.proj,.s-link,input,textarea,[role="button"]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) document.body.classList.add('cursor-hover');
    }, { passive: true });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) document.body.classList.remove('cursor-hover');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { dot.style.opacity = ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { dot.style.opacity = ring.style.opacity = ''; });
  })();

  /* ---------- 4. SCROLL PROGRESS + STICKY NAV + BACK TO TOP ---------- */
  (function scrollUI() {
    var bar = $('#progress'), nav = $('.nav'), toTop = $('#toTop'), t = false;
    var arc = $('#ringArc'), C = 2 * Math.PI * 20.4;
    if (arc) { arc.style.strokeDasharray = C.toFixed(1); arc.style.strokeDashoffset = C.toFixed(1); }
    function onScroll() {
      var y = window.scrollY || 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var prog = max > 0 ? Math.min(1, y / max) : 0;
      if (bar) bar.style.transform = 'scaleX(' + prog + ')';
      if (arc) arc.style.strokeDashoffset = (C * (1 - prog)).toFixed(1);
      if (nav) nav.classList.toggle('scrolled', y > 8);
      if (toTop) toTop.classList.toggle('show', y > 400);
      t = false;
    }
    window.addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  })();

  /* ---------- 5. ACTIVE NAV LINK ---------- */
  (function scrollSpy() {
    var links = $$('#navLinks a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('active'); });
        var a = map[en.target.id];
        if (a) a.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  })();

  /* ---------- 6. REVEAL ON SCROLL (staggered) ---------- */
  (function reveal() {
    var items = $$('.reveal');
    if (!items.length) return;
    $$('.grid,.proj-grid,.contact-cards,.timeline').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', i); });
    });
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in-view'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
    // charts/bars live inside cards: also mark their container
    $$('.card,.chart-box').forEach(function (c) { io.observe(c); });
  })();

  /* ---------- 7. COUNT-UP STATS ---------- */
  (function counters() {
    var nums = $$('.count');
    if (!nums.length || reduceMotion || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, to = parseFloat(el.dataset.to || el.textContent) || 0, t0 = null;
        (function run(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 900);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(run);
        })(performance.now());
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ---------- 8. CARD SPOTLIGHT GLOW (CSS vars only, no layout write) ---------- */
  (function glow() {
    if (!finePointer || reduceMotion) return;
    $$('.card,.proj').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  })();

  /* ---------- 9. (removed) the card tilt now lives in 14e tilt3d(), which covers the same cards
     and additionally lifts them on the Z axis. Two mousemove handlers writing the same property
     meant one of them was pure waste. ---------- */

  /* ---------- 10. TYPEWRITER ---------- */
  (function typewriter() {
    var el = $('#typewriter');
    if (!el) return;
    var roles = ['CSALML Student', 'Problem Solver', 'Web Developer', 'Database Enthusiast', 'Data Analyst', 'Competitive Programmer', 'Open Source Contributor'];
    if (reduceMotion) { el.textContent = roles[0]; return; }
    var ri = 0, ci = 0, del = false;
    (function tick() {
      var word = roles[ri];
      ci += del ? -1 : 1;
      el.textContent = word.slice(0, ci);
      var next = del ? 42 : 78;
      if (!del && ci === word.length) { del = true; next = 1500; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; next = 260; }
      setTimeout(tick, next);
    })();
  })();

  /* ---------- 11. RADAR SKILL GRAPH (hand-built SVG, no library) ---------- */
  (function radar() {
    var svg = $('#radar');
    if (!svg || !document.createElementNS) return;

    var DATA = [
      { label: 'Programming', now: 70, goal: 88 },
      { label: 'Web Dev', now: 82, goal: 95 },
      { label: 'Data Analysis', now: 65, goal: 85 },
      { label: 'Problem Solving', now: 75, goal: 90 },
      { label: 'DBMS', now: 55, goal: 80 },
      { label: 'Communication', now: 80, goal: 88 }
    ];
    var CX = 160, CY = 146, R = 110, NS = 'http://www.w3.org/2000/svg';
    var ringsG = svg.querySelector('.rings'), spokesG = svg.querySelector('.spokes'),
        labelsG = svg.querySelector('.labels'), dotsG = svg.querySelector('.dots');
    var pNow = svg.querySelector('.poly-now'), pGoal = svg.querySelector('.poly-goal');
    if (!ringsG || !pNow || !pGoal) return;

    function el(name, attrs) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
      return n;
    }
    function pt(i, v) {
      var a = -Math.PI / 2 + (i / DATA.length) * Math.PI * 2;
      return [CX + Math.cos(a) * R * v, CY + Math.sin(a) * R * v];
    }
    function poly(vals) {
      return vals.map(function (v, i) { var p = pt(i, v / 100); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    }

    // rings + scale labels (25 / 50 / 75 / 100)
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      ringsG.appendChild(el('polygon', { points: poly(DATA.map(function () { return f * 100; })) }));
      var lp = pt(0, f);
      var v = el('text', { x: (lp[0] + 5).toFixed(1), y: (lp[1] + 3).toFixed(1), class: 'ring-val' });
      v.textContent = f * 100;
      ringsG.appendChild(v);
    });
    // spokes + labels + dots
    DATA.forEach(function (d, i) {
      var e = pt(i, 1);
      spokesG.appendChild(el('line', { x1: CX, y1: CY, x2: e[0].toFixed(1), y2: e[1].toFixed(1) }));

      var L = pt(i, 1.2);
      var t = el('text', { x: L[0].toFixed(1), y: L[1].toFixed(1), 'text-anchor': L[0] > CX + 4 ? 'start' : (L[0] < CX - 4 ? 'end' : 'middle'), 'dominant-baseline': 'middle' });
      t.textContent = d.label;
      labelsG.appendChild(t);

      var dot = el('circle', { cx: 0, cy: 0, r: 4.5, 'data-tip': d.label + ' — ' + d.now + '% now, target ' + d.goal + '%', tabindex: '0' });
      var dp = pt(i, d.now / 100);
      dot.setAttribute('cx', dp[0].toFixed(1)); dot.setAttribute('cy', dp[1].toFixed(1));
      dotsG.appendChild(dot);
    });

    pGoal.setAttribute('points', poly(DATA.map(function (d) { return d.goal; })));
    pNow.setAttribute('points', poly(DATA.map(function (d) { return d.now; })));

    // summary line, derived from the same data the chart plots
    var avgBox = document.querySelector('.gf-avg b');
    if (avgBox) {
      var avg = Math.round(DATA.reduce(function (a, d) { return a + d.now; }, 0) / DATA.length);
      var gap = Math.round(DATA.reduce(function (a, d) { return a + (d.goal - d.now); }, 0) / DATA.length);
      avgBox.textContent = avg + '%  ·  +' + gap + '% to target';
    }

    // hover tooltip on vertices
    var card = pNow.closest('.card'), tip;
    if (card) {
      tip = document.createElement('div');
      tip.className = 'tooltip'; tip.setAttribute('role', 'status');
      card.appendChild(tip);
      $$('#radar .dots circle').forEach(function (c) {
        function show() { if (!tip) return; tip.textContent = c.getAttribute('data-tip'); tip.classList.add('show'); }
        function hide() { if (tip) tip.classList.remove('show'); }
        c.addEventListener('mouseenter', show); c.addEventListener('mouseleave', hide);
        c.addEventListener('focus', show); c.addEventListener('blur', hide);
      });
    }
  })();

  /* ---------- 12. STIPPLE DOT-ART CANVASES (crisp on HiDPI) ---------- */
  function stipple(canvas, drawShape, opts) {
    if (!canvas || !canvas.getContext) return;
    opts = opts || {};
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cssW = canvas.clientWidth || canvas.width;
    var cssH = canvas.clientHeight || canvas.height;
    if (!cssW || !cssH) return;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    var off = document.createElement('canvas');
    off.width = canvas.width; off.height = canvas.height;
    var octx = off.getContext('2d');
    if (!octx || !octx.getImageData) return;
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawShape(octx, cssW, cssH);
    var data;
    try { data = octx.getImageData(0, 0, off.width, off.height).data; } catch (e) { return; }

    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var spacing = Math.max(2, (opts.spacing || 4) * dpr);
    var light = root.getAttribute('data-theme') === 'light';
    var color = opts.color || (light ? 'rgba(16,16,24,.72)' : 'rgba(233,234,242,.82)');
    ctx.fillStyle = color;

    for (var y = 0; y < canvas.height; y += Math.round(spacing)) {
      for (var x = 0; x < canvas.width; x += Math.round(spacing)) {
        var idx = (y * canvas.width + x) * 4 + 3;
        if (data[idx] > 110) {
          ctx.globalAlpha = 0.5 + Math.random() * 0.5;
          ctx.beginPath();
          ctx.arc(x + (Math.random() - 0.5) * spacing * 0.5,
                  y + (Math.random() - 0.5) * spacing * 0.5,
                  (0.6 + Math.random() * 0.6) * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawAll() {
    var accent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#37E8D0';

    var blob = $('#blobCanvas');
    if (blob) stipple(blob, function (ctx, w, h) {
      ctx.strokeStyle = accent; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 10, 0, Math.PI * 2); ctx.stroke();
    }, { spacing: 6 });

    var name = $('#nameCanvas');
    if (name) stipple(name, function (ctx, w, h) {
      ctx.fillStyle = '#000';
      var size = Math.max(28, Math.min(64, w / 9.6));
      ctx.font = '700 ' + size + "px 'Space Grotesk', 'Inter', sans-serif";
      ctx.textBaseline = 'middle';
      ctx.fillText('BHARATI', 2, h / 2);
    }, { spacing: 4 });

    var env = $('#envelopeCanvas');
    if (env) stipple(env, function (ctx, w, h) {
      ctx.strokeStyle = '#000'; ctx.lineWidth = 6;
      var pad = 16, r = 14;
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, r); ctx.stroke(); }
      else ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);
      ctx.beginPath();
      ctx.moveTo(pad + 4, pad + 6); ctx.lineTo(w / 2, h / 2 + 14); ctx.lineTo(w - pad - 4, pad + 6);
      ctx.stroke();
    }, { spacing: 5 });
  }

  // fonts may load after first paint → redraw once they're ready
  drawAll();
  if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
    document.fonts.ready.then(drawAll).catch(function () {});
  }
  var rT;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(drawAll, 180); }, { passive: true });

  /* ---------- 13. COPY EMAIL ---------- */
  (function copyEmail() {
    var btn = $('#copyEmail');
    if (!btn) return;
    var label = $('.copy-label', btn);
    var email = btn.getAttribute('data-email') || '';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var done = function () {
        if (!label) return;
        var old = label.textContent;
        label.textContent = 'Copied ✓'; btn.classList.add('done');
        setTimeout(function () { label.textContent = old; btn.classList.remove('done'); }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () { window.location.href = 'mailto:' + email; });
      } else {
        window.location.href = 'mailto:' + email;
      }
    });
  })();


  /* ---------- 14. PARTICLE CONSTELLATION BACKGROUND (canvas, own rAF) ---------- */
  var fx = (function scene3d() {
    var cv = $('#fx');
    if (!cv || reduceMotion || !finePointer || !cv.getContext) return null;
    var ctx = cv.getContext('2d');
    // Render at 1x and let the compositor upscale — measured ~0.06 ms of a 16.7 ms frame for the
    // maths, so the only real cost is canvas raster; 1x cuts that 4-9x on retina screens.
    var dpr = 1;
    var W = 0, H = 0, raf = 0, visible = true, t = 0;
    var mouse = { x: 0, y: 0, has: false };
    var rgb = [55, 232, 208];
    var FL = 620;                      // focal length of the hand-rolled pinhole camera
    var stars = [], globe = null;

    function tint() {
      var probe = document.createElement('span');
      probe.style.color = 'var(--accent)'; probe.style.display = 'none';
      document.body.appendChild(probe);
      var m = getComputedStyle(probe).color.match(/[\d.]+/g);
      probe.remove();
      if (m && m.length >= 3) rgb = [+m[0], +m[1], +m[2]];
    }

    function buildStars() {
      var n = Math.max(70, Math.min(150, Math.round(W * H / 16000)));
      stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({
          x: (Math.random() - 0.5) * 2400,
          y: (Math.random() - 0.5) * 1500,
          z: Math.random() * 1500 - 300,
          vz: 0.55 + Math.random() * 1.15
        });
      }
    }

    // lat/long wireframe sphere + the edge list, so each frame only rotates + projects
    function buildGlobe() {
      var LA = 7, LO = 20, R = Math.round(Math.min(W, H) * 0.30), pts = [], edges = [], id = 0, li, lo;
      for (li = 1; li <= LA; li++) {
        var th = Math.PI * li / (LA + 1);
        for (lo = 0; lo < LO; lo++) {
          var ph = 2 * Math.PI * lo / LO;
          pts.push({ x: R * Math.sin(th) * Math.cos(ph), y: R * Math.cos(th), z: R * Math.sin(th) * Math.sin(ph), ring: li });
          if (lo > 0) edges.push([id - 1, id]);
          id++;
        }
        if (LO > 1) edges.push([id - 1, id - LO]);        // close each latitude ring
        if (li > 1) for (lo = 0; lo < LO; lo++) edges.push([(li - 2) * LO + lo, (li - 1) * LO + lo]);
      }
      return { pts: pts, edges: edges, R: R };
    }

    function size() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars(); globe = buildGlobe();
    }

    // rotate around Y (spin) then X (pointer tilt), then pinhole-project
    function rot(p, ay, ax) {
      var ca = Math.cos(ay), sa = Math.sin(ay), cb = Math.cos(ax), sb = Math.sin(ax);
      var x1 = p.x * ca + p.z * sa, z1 = -p.x * sa + p.z * ca;
      var y2 = p.y * cb - z1 * sb, z2 = p.y * sb + z1 * cb;
      return [x1, y2, z2];
    }

    var tiltX = 0.34, tiltTarget = 0.34;
    function frame() {
      raf = 0;
      if (!visible || !globe) return;
      t += 1;
      ctx.clearRect(0, 0, W, H);

      // ---- starfield: points flying past a real perspective plane ----
      var i, sp, depth, sx, sy, sz;
      ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.55)';
      ctx.beginPath();
      for (i = 0; i < stars.length; i++) {
        sp = stars[i];
        sp.z -= sp.vz;
        if (sp.z < -FL * 0.82) { sp.z = 1200; sp.x = (Math.random() - 0.5) * 2400; sp.y = (Math.random() - 0.5) * 1500; }
        depth = FL / (FL + sp.z + 400);
        if (depth <= 0) continue;
        sx = W * 0.5 + sp.x * depth; sy = H * 0.5 + sp.y * depth;
        if (sx < -6 || sx > W + 6 || sy < -6 || sy > H + 6) continue;
        var rr = 0.5 + depth * 1.9;
        ctx.moveTo(sx + rr, sy); ctx.arc(sx, sy, rr, 0, 6.2832);
      }
      ctx.fill();

      // ---- wireframe globe behind the hero cube ----
      var ay = t * 0.0021;
      tiltX += (tiltTarget - tiltX) * 0.06;
      var cx = W > 1040 ? W * 0.755 : W * 0.5;
      var cy = W > 1040 ? H * 0.40 : H * 0.30;
      var P = globe.pts, proj = new Array(P.length);
      for (i = 0; i < P.length; i++) {
        var r3 = rot(P[i], ay, tiltX);
        var k = FL / (FL + r3[2] + globe.R * 1.9);
        proj[i] = [cx + r3[0] * k, cy + r3[1] * k, r3[2]];
      }
      var E = globe.edges;
      for (var tier = 0; tier < 2; tier++) {                 // far lines faint, near lines brighter
        ctx.beginPath();
        for (i = 0; i < E.length; i++) {
          var a = proj[E[i][0]], b = proj[E[i][1]];
          if (!a || !b) continue;
          var near = (a[2] + b[2]) * 0.5 > 0;
          if ((tier === 0) === near) continue;
          ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        }
        ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (tier ? 0.20 : 0.075) + ')';
        ctx.lineWidth = tier ? 1 : 0.8;
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.5)';
      ctx.beginPath();
      for (i = 0; i < proj.length; i++) {
        var q = proj[i];
        if (q[2] < 0) continue;                                // front hemisphere dots only
        var rd = 0.9 + (q[2] / globe.R) * 1.1;
        ctx.moveTo(q[0] + rd, q[1]); ctx.arc(q[0], q[1], rd, 0, 6.2832);
      }
      ctx.fill();

      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }

    tint(); size(); kick();
    requestAnimationFrame(function () { cv.classList.add('on'); });
    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true;
      tiltTarget = 0.34 + ((e.clientY / Math.max(1, window.innerHeight)) - 0.5) * 0.5;
    }, { passive: true });
    window.addEventListener('resize', function () { clearTimeout(size._t); size._t = setTimeout(function () { size(); kick(); }, 200); }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
      if (visible) kick(); else { cancelAnimationFrame(raf); raf = 0; }
    });
    document.addEventListener('bt:theme', function () { tint(); });
    return { resize: size };
  })();
  void fx;

  /* ---------- 15. INTRO CURTAIN (first visit only, self-removing) ---------- */
  (function intro() {
    if (reduceMotion) return;
    var seen = false;
    try { seen = sessionStorage.getItem('bt-intro') === '1'; } catch (e) {}
    if (seen) return;
    try { sessionStorage.setItem('bt-intro', '1'); } catch (e) {}

    var layer = document.createElement('div');
    layer.className = 'intro';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '<div class="intro-mark"><span>B</span><span class="d">T</span></div><div class="intro-bar"><i></i></div>';
    document.body.appendChild(layer);
    var kill = function () {
      layer.classList.add('hide');
      setTimeout(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); }, 600);
    };
    var safety = setTimeout(kill, 2000);
    window.addEventListener('load', function () { setTimeout(function () { clearTimeout(safety); kill(); }, 620); }, { once: true });
  })();

  /* ---------- 16. SPLIT-TEXT HERO NAME ---------- */
  (function splitName() {
    var h1 = document.querySelector('.hero h1');
    if (!h1 || reduceMotion) return;
    var full = h1.textContent.replace(/\s+/g, ' ').trim();
    var idx = 0;

    function charsOf(text, into) {
      text.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { into.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'w';
        tok.split('').forEach(function (ch) {
          var c = document.createElement('span');
          c.className = 'c'; c.textContent = ch;
          c.style.setProperty('--i', idx++);
          w.appendChild(c);
        });
        into.appendChild(w);
      });
    }
    function walk(node, host) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) { charsOf(child.nodeValue, host); return; }
        if (child.nodeType === 1) {
          var clone = document.createElement(child.tagName.toLowerCase());
          if (child.className) clone.className = child.className;
          walk(child, clone);
          host.appendChild(clone);
        }
      });
    }
    var fresh = document.createElement('div');
    walk(h1, fresh);
    h1.innerHTML = fresh.innerHTML;
    h1.setAttribute('aria-label', full);   // screen readers still get one clean string
    h1.classList.add('js-split');
    var start = function () { requestAnimationFrame(function () { h1.classList.add('lit'); }); };
    if (document.readyState === 'complete') setTimeout(start, 120);
    else window.addEventListener('load', function () { setTimeout(start, 120); }, { once: true });
  })();

  /* ---------- 17. MAGNETIC CONTROLS ---------- */
  (function magnet() {
    if (!finePointer || reduceMotion) return;
    $$('.btn, .f-chip, .s-link, .icon-btn').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width;
        var y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = 'translate(' + (x * 9).toFixed(1) + 'px,' + (y * 7 - 2).toFixed(1) + 'px)';
      }, { passive: true });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; }, { passive: true });
    });
  })();

  /* ---------- 18. PROJECT FILTER ---------- */
  (function filterProjects() {
    var chips = $$('.f-chip'), grid = $('#projGrid'), note = $('#projCount');
    if (!chips.length || !grid) return;
    var cards = function () { return Array.prototype.slice.call(grid.querySelectorAll('.proj')); };
    function apply(cat) {
      var shown = 0;
      cards().forEach(function (c) {
        var on = cat === 'all' || c.getAttribute('data-cat') === cat;
        if (on) shown++;
        if (reduceMotion) { c.hidden = !on; return; }
        c.classList.add('leaving');
        setTimeout(function () { c.hidden = !on; c.classList.remove('leaving'); }, 190);
      });
      if (note) note.textContent = shown + (shown === 1 ? ' project' : ' projects');
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        apply(chip.getAttribute('data-cat'));
      });
    });
    apply('all');
  })();

  /* ---------- 19. MAILTO COMPOSER (no backend) ---------- */
  (function composer() {
    var form = $('#composer');
    if (!form) return;
    var msg = $('#formMsg');
    var TO = 'bharatitripath05@gmail.com';
    var f = { name: $('#cName'), mail: $('#cMail'), sub: $('#cSub'), body: $('#cMsg') };
    function say(text, kind) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = 'form-msg' + (kind ? ' ' + kind : '');
    }
    function mark(el, bad) {
      if (!el) return;
      if (bad) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    }
    Object.keys(f).forEach(function (k) {
      if (f[k]) f[k].addEventListener('input', function () { mark(f[k], false); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (f.name.value || '').trim(), mail = (f.mail.value || '').trim(),
          sub = (f.sub.value || '').trim(), body = (f.body.value || '').trim();
      var bad = [];
      if (name.length < 2) bad.push(f.name);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(mail)) bad.push(f.mail);
      if (body.length < 10) bad.push(f.body);
      bad.forEach(function (b) { mark(b, true); });
      if (bad.length) { say('Please fill ' + bad.length + ' field' + (bad.length > 1 ? 's' : '') + ' properly.', 'err'); bad[0].focus(); return; }

      var subject = sub || 'Hello from your portfolio — ' + name;
      var text = body + '\n\n— ' + name + '\n' + mail;
      var a = document.createElement('a');
      a.href = 'mailto:' + TO +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      a.style.display = 'none';
      a.setAttribute('data-mailto-composer', '1');
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); }, 0);
      say('Your mail app should now be open with the message ready.', 'ok');
    });
  })();

  /* ---------- 20. LIVE IST CLOCK ---------- */
  (function clock() {
    var el = $('#clock');
    if (!el) return;
    function tick() {
      try {
        el.textContent = new Intl.DateTimeFormat('en-IN', {
          hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata'
        }).format(new Date());
      } catch (e) {
        var d = new Date();
        el.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
      }
    }
    tick();
    setInterval(tick, 20000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });
  })();

  /* ---------- 21. CONFETTI EASTER EGG: type "bharati" anywhere ---------- */
  (function konami() {
    if (reduceMotion) return;
    var word = 'bharati', buf = '';
    window.addEventListener('keydown', function (e) {
      if (e.key && e.key.length === 1 && /[a-z]/i.test(e.key)) {
        buf = (buf + e.key.toLowerCase()).slice(-word.length);
        if (buf === word) { buf = ''; burst(); }
      }
    });
    function burst() {
      var cv = document.createElement('canvas');
      cv.id = 'confetti'; cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = cv.width = window.innerWidth * dpr, H = cv.height = window.innerHeight * dpr;
      cv.style.cssText = 'position:fixed;inset:0;z-index:800;pointer-events:none';
      var ctx = cv.getContext('2d');
      var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      var cols = [accent || '#37E8D0', '#7CF6A0', '#00B3FF', '#F5C24B', '#FF7A9C', '#FFFFFF'];
      var P = [], i;
      for (i = 0; i < 150; i++) {
        P.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.5, y: H * 0.32,
                 vx: (Math.random() - 0.5) * 9 * dpr, vy: (-6 - Math.random() * 9) * dpr,
                 s: (4 + Math.random() * 6) * dpr, rot: Math.random() * 6.28,
                 vr: (Math.random() - 0.5) * 0.4, c: cols[i % cols.length] });
      }
      var t0 = performance.now();
      (function run(now) {
        var age = now - t0;
        ctx.clearRect(0, 0, W, H);
        P.forEach(function (p) {
          p.vy += 0.34 * dpr; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.globalAlpha = Math.max(0, 1 - age / 2400);
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
          ctx.restore();
        });
        if (age < 2400) requestAnimationFrame(run);
        else if (cv.parentNode) cv.parentNode.removeChild(cv);
      })(t0);
    }
  })();


  /* ---------- 14b. DRAGGABLE 3D CUBE (inertia + keyboard) ---------- */
  (function cube() {
    var stage = $('#cubeStage'), el = $('#cube');
    if (!stage || !el) return;
    var ax = -16, ay = -34, vax = 0, vay = 0;
    var baseAx = ax, baseAy = ay, t0 = 0, touched = false;
    var dragging = false, lx = 0, ly = 0, id = null;

    function write() { el.style.transform = 'rotateX(' + ax.toFixed(2) + 'deg) rotateY(' + ay.toFixed(2) + 'deg)'; }
    /* Idle: breathe around a fixed three-quarter view, which is the only angle range where a
       translucent cube always reads as a cube (three broad faces) instead of going edge-on thin.
       Once the visitor grabs it, the cube is theirs: free inertia across the full 360. */
    function loop(now) {
      if (!dragging) {
        if (touched) {
          ay += vay; ax += vax; vax *= 0.955;
          if (Math.abs(vay) < 0.02) vay += (0.14 - vay) * 0.01;  // never fully stop, but stay slow
          vay *= 0.999;
          baseAx = ax; baseAy = ay;
        } else {
          // the base is an input here, never a copy of ax/ay: reading the animated angle back into
          // the base adds the sine term again every frame and the cube accelerates into a blur
          if (!t0) t0 = now || performance.now();
          var e = ((now || performance.now()) - t0) / 1000;
          ax = baseAx + Math.sin(e * 0.23) * 4;
          ay = baseAy + Math.sin(e * 0.33) * 14;
        }
      }
      write();
      cubeRaf = requestAnimationFrame(loop);
    }
    var cubeRaf = 0;
    if (reduceMotion) { ax = baseAx = -16; ay = baseAy = -34; write(); }   // static, still draggable
    else loop();

    stage.addEventListener('pointerdown', function (e) {
      dragging = true; touched = true; id = e.pointerId; lx = e.clientX; ly = e.clientY;
      baseAx = ax; baseAy = ay;
      if (stage.setPointerCapture) { try { stage.setPointerCapture(id); } catch (err) {} }
      e.preventDefault();
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      vay = dx * 0.45; vax = -dy * 0.45;
      ay += vay; ax += vax;
      write();
    });
    function release() {
      dragging = false; baseAx = ax; baseAy = ay;   // the breath re-centres on wherever they left it
      if (id !== null && stage.releasePointerCapture) { try { stage.releasePointerCapture(id); } catch (e) {} } id = null;
    }
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);

    stage.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 30 : 12, used = true;
      switch (e.key) {
        case 'ArrowLeft': ay -= step; break;
        case 'ArrowRight': ay += step; break;
        case 'ArrowUp': ax -= step; break;
        case 'ArrowDown': ax += step; break;
        case 'Home': touched = false; t0 = 0; ax = baseAx = -16; ay = baseAy = -34; break;
        default: used = false;
      }
      // the base moves with the key press, otherwise the idle breath would pull it straight back
      if (used) { baseAx = ax; baseAy = ay; e.preventDefault(); vax = vay = 0; write(); }
    });

    // stop the idle spin while the tab is hidden (same courtesy as the canvas)
    document.addEventListener('visibilitychange', function () {
      if (reduceMotion) return;
      if (document.hidden) { cancelAnimationFrame(cubeRaf); cubeRaf = 0; }
      else if (!cubeRaf) loop();
    });
  })();

  /* ---------- 14c. HERO DEPTH PARALLAX (whole scene leans with the pointer) ---------- */
  (function heroDepth() {
    var frame = $('#heroFrame');
    if (!frame || !finePointer || reduceMotion) return;
    var tx = 0, ty = 0, cur = { x: 0, y: 0 }, raf = 0;
    window.addEventListener('mousemove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 14;
      ty = (e.clientY / window.innerHeight - 0.5) * -10;
      if (!raf) raf = requestAnimationFrame(run);
    }, { passive: true });
    function run() {
      raf = 0;
      cur.x += (tx - cur.x) * 0.08; cur.y += (ty - cur.y) * 0.08;
      frame.style.transform = 'rotateY(' + cur.x.toFixed(2) + 'deg) rotateX(' + cur.y.toFixed(2) + 'deg)';
      if (Math.abs(tx - cur.x) > 0.05 || Math.abs(ty - cur.y) > 0.05) raf = requestAnimationFrame(run);
    }
  })();

  /* ---------- 14d. 3D FLIP CARDS (click, keyboard, hover on wide screens) ---------- */
  (function flip() {
    var cards = $$('.proj.flip');
    if (!cards.length) return;
    function vis(face, shown) { // keep the hidden side out of the tab order
      $$('a,button', face).forEach(function (el) { el.tabIndex = shown ? 0 : -1; });
    }
    function set(card, on) {
      card.classList.toggle('flipped', on);
      var btn = $('.flip-btn', card);
      if (btn) btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      var front = $('.face.front', card), back = $('.face.back', card);
      if (front) { front.setAttribute('aria-hidden', on ? 'true' : 'false'); vis(front, !on); }
      if (back) { back.setAttribute('aria-hidden', on ? 'false' : 'true'); vis(back, on); }
    }
    cards.forEach(function (card) {
      var btn = $('.flip-btn', card);
      if (btn) btn.addEventListener('click', function () { set(card, !card.classList.contains('flipped')); });
      card.addEventListener('keydown', function (e) { if (e.key === 'Escape' && card.classList.contains('flipped')) set(card, false); });
      // no hover-flip on purpose: a card that flips back when the pointer
      // leaves is unreadable, and hover + click would fight over the same state.
      set(card, false);
    });
  })();

  /* ---------- 14e. 3D ENTRANCE on section titles + deeper card tilt ---------- */
  (function tilt3d() {
    $$('section h2.reveal, section .section-sub.reveal, .contact-head h2').forEach(function (el) { el.classList.add('r3d'); });
    if (!finePointer || reduceMotion) return;
    $$('.grid > .card, .skills-layout > .card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateX(' + (-py * 7).toFixed(2) + 'deg) rotateY(' + (px * 7).toFixed(2) + 'deg) translateZ(14px)';
      }, { passive: true });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; }, { passive: true });
    });
  })();

  /* ---------- 22. YEAR ---------- */
  (function year() {
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  })();

})();
