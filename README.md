# Bharati Tripathi — Portfolio v4 (3D)

Three plain files, zero frameworks, zero build step, same names as the Vartalab project:

```
portfolio/
├── index.html   markup + one inline script (4 lines) that applies the saved theme before first paint
├── style.css    design tokens, dark + light theme, layout, the whole 3D layer, print styles
├── script.js    cursor, spotlight, tilt, cube, flip cards, radar graph, 3D canvas scene, dot-art, UX
└── tests/       two Playwright suites (100 checks) + this README
```

`index.html` links `style.css` and `script.js` — no build step, no bundler, no import map.

## Live site

**<https://tripathibharati303-ops.github.io/My-portfolio/>** — GitHub Pages project site of the
repo `My-NEW-portfolio` (the root user site ` ` is a 404,
so always use the `/My-NEW-portfolio/` path).

> ### ⚠️ That link does not show this folder yet — checked 2026-10-19 (curl, from this sandbox)
>
> | file | on GitHub Pages | in this folder | consequence |
> | --- | --- | --- | --- |
> | `index.html` | 9,957 bytes | 30,518 bytes | no `#cubeStage`, no `hero-visual`, no flip cards → **no 3D at all** |
> | `script.js` | 6,234 bytes | 39,833 bytes | it is the old unguarded `getElementById('spotlight')` version |
> | `style.css` | 200 | 200 | only the *file names* were changed on GitHub |

>
> So the rename landed on GitHub, the v4 content did not. Upload all three files from this folder
> (below), then verify with:
>
> ```bash
> curl -s  https://tripathibharati303-ops.github.io/My-portfolio/ | wc -c   # want 30518, not 9957
> curl -s  https://tripathibharati303-ops.github.io/My-portfolio/ | grep -c cubeStage   # want 1
> ```

## Run it

Open `index.html` directly in a browser, or serve the folder:

```bash
cd portfolio
python3 -m http.server 8000     # then visit http://localhost:8000
```

## Deploy to GitHub Pages (`My-NEW-portfolio` repo)

Pages is already enabled for `My-NEW-portfolio` (Settings → Pages → Deploy from branch → `/ (root)`),
which is why <https://tripathibharati303-ops.github.io/My-portfolio/> answers 200. To publish
*this* version, replace all three files at the repo root — an incomplete swap is exactly how the
mismatch in the box above happened:

```bash
cd My-NEW-portfolio
cp /path/to/portfolio/{index.html,style.css,script.js} .
git add index.html style.css script.js && git commit -m "v4: 3D layer + rename to style.css/script.js"
git push        # Pages rebuilds in ~30-60 s
```

Uploading through the github.com web UI works too — drag all three files at once, commit, wait for
the build, then hard-reload (Ctrl+Shift+R) because Pages caches.

### Do not deploy a copy you saved out of the browser

If the site is ever served through Cloudflare with *Email Address Obfuscation* on, the HTML the
browser receives is rewritten: `mailto:` becomes `/cdn-cgi/l/email-protection#…`, the visible
address becomes `[email protected]`, and Cloudflare's `email-decode.min.js` + beacon scripts get
injected. Saving that page and re-uploading it breaks the email link on GitHub Pages, because
`/cdn-cgi/…` does not exist there. Keep the three files in this folder as the source of truth;
Cloudflare will re-apply its own rewriting at the edge whenever it wants.

## What changed vs. the previous version

### Bugs fixed (all were verified in a real browser)

| # | Bug in the old code | Fix |
|---|---|---|
| 1 | `stipple(document.getElementById('nameCanvas'), …)` — that canvas did not exist, so the script threw `TypeError` and the envelope canvas never drew | every canvas call is null-guarded; both canvases now exist in the markup |
| 2 | `#cursor-dot` / `#cursor-ring` base sizes were commented out, but `cursor: none` was still applied → **invisible mouse pointer** on desktop | custom cursor only turns on when JS confirms a fine pointer (`html.cursor-on`), with real sizes restored |
| 3 | `.grid` closed right after the first card → Projects / Core Skills / Academics / Clubs rendered **outside** the grid (unbalanced `div`: 92 open vs 93 close) | markup rewritten, balanced structure |
| 4 | `width: 50` (unitless, invalid CSS) on `.icon svg` | removed; icons sized per context |
| 5 | GitHub link was the placeholder `https://github.com/YOUR_USERNAME` | real profile URL |
| 6 | Email used `href="https://tripathibharati303@gmail.com/"` (an invalid URL) and disagreed with the displayed address | `mailto:bharatitripath05@gmail.com` everywhere + copy-to-clipboard button |
| 7 | Theme toggle wrote 7 CSS variables by hand; `nav` background was hardcoded `rgba(10,10,13,.75)` so the bar stayed dark in light mode, and the choice was lost on reload | single `data-theme` attribute drives every token, persisted in `localStorage`, seeded from OS preference, applied before first paint (no flash) |
| 8 | `--text: #00ffe5` made body copy bright cyan | neutral text, cyan reserved for accents; all text now ≥ 4.5:1 (WCAG AA) |
| 9 | Hero right column was empty (`hero-visual` div had been deleted but its CSS remained) | dot-art monogram, floating tech chips and an `about.json` code card |
| 10 | Trailing `:` in the pill "Teamwork & Collaboration:" | cleaned |

### New

- **Skill Graph** — hand-built SVG radar (no chart library): 6 axes, "now" vs "6-month target",
  hover/focus tooltips on each node, ring scale 25/50/75/100. The summary line
  (`Average level 71% · +17% to target`) is computed from the same array that draws the chart, so
  editing `DATA` in `script.js` updates the graph, the labels and the footer together.
- **Projects section** — Vartalab, NetMirror, Rock-Paper-Scissors, Calculator with real live + repo
  links (all verified `HTTP 200`) and language dots matching your GitHub languages.
- **Journey timeline**, animated skill bars, count-up stats, tech marquee, contact card set.
- **UX**: scroll-progress bar, sticky nav with active-section highlight, mobile sheet menu,
  back-to-top, reveal-on-scroll, pointer-tracking card glow, 3D tilt (kept from your version).
- **Accessibility**: skip link, one `h1`, landmarks, `aria-pressed`/`aria-expanded`, labelled
  canvases, visible focus rings, `prefers-reduced-motion` fallback (nothing stays hidden),
  `noscript` text for the graph.
- **Print / PDF**: `@media print` forces a light palette — the old CSS printed white-on-white.
  `Ctrl/⌘-P` gives a clean one-colour-safe résumé page.

## Editing

- Skills graph numbers → `DATA` array in `script.js` (section 11).
- Language bars → `--w` custom property on each `.bar i` in `index.html`.
- Colours → tokens at the top of `style.css` (`:root` = dark, `[data-theme="light"]` = light).
- Projects → plain `<article class="proj">` blocks in `index.html`.

## Verified

`node --check` on the JS; a 35-assertion Playwright suite (Chromium) covering asset loading,
radar geometry, canvas ink, bar/reveal/count-up animation, theme flip + persistence, scroll-spy,
mobile 390 px (0 px horizontal overflow), link correctness, WCAG contrast, reduced-motion and
print media. 35/35 pass, 0 page errors.

---

# v3 — the "impress everyone" pass

## Added

| Feature | How | Fallback |
|---|---|---|
| **Particle constellation background** | one `<canvas>` + a single rAF loop; 22–52 drifting nodes, lines between close pairs in 3 alpha tiers, pointer parallax | off on touch & `prefers-reduced-motion`; pauses on `visibilitychange`; renders at 1x on purpose |
| **Intro curtain** | "BT" letters rise + a loading bar, auto-dismiss | only once per session (`sessionStorage`); element is created by JS, so no-JS visitors never see it; safety timeout 2 s |
| **Letter-by-letter name reveal** | `h1` split into word/char spans with a stagger | `aria-label` keeps one clean string for screen readers; static text under reduced motion |
| **Magnetic controls** | buttons/chips lean toward the cursor (±9px) | skipped on touch / reduced motion; inline transform cleared on leave |
| **Scroll ring** | back-to-top circle drawn with `stroke-dashoffset` from real scroll progress | decorative, `aria-hidden` |
| **Project filter** | All / Web apps / Data & tools / Logic, with `aria-pressed` + live count | reduced motion skips the fade and just toggles `hidden` |
| **"Featured" corner tab** | pinned inside the card's top padding band | measured: 0 px overlap with the title and language label at 1440 and 390 |
| **Live IST clock** | `Intl.DateTimeFormat` with `timeZone:'Asia/Kolkata'`, refresh 20 s + on tab focus | falls back to local clock if `Intl` throws |
| **mailto composer** | validates name/email/message, then builds `mailto:…?subject=…&body=…` and clicks a temp anchor | **no backend, no tracking** — it just opens the visitor's mail app; nothing is sent on invalid input |
| **Confetti easter egg** | type **`bharati`** anywhere → ~2.4 s burst on its own canvas, then the node removes itself | off under reduced motion |
| **Button shine** | CSS-only sweep on hover | — |

## Two bugs this pass found and fixed (they were mine, from v2)

1. **Glow parked in the corner** — `#spotlight` sat at `0,0` with `opacity:1` until the first
   `mousemove`, so a stray/synthetic move left a bright arc in the top-left. Fixed by starting it
   centred and revealing only after the pointer actually *changes* position.
   Measured corner strip: mean brightness 7.0, 0 pixels above 25 (was ~13.9k).
2. **"FEATURED" ribbon overlapped the `JavaScript` label** — the rotated ribbon was a
   bleed-and-clip trick that collided with the title row. Replaced with a corner tab in the card's
   padding band; the test now asserts `overlap area === 0` instead of trusting `overflow:hidden`.

## Performance, measured rather than assumed

`requestAnimationFrame` fps in headless Chromium bounces 45–60, so it proved nothing. Instead the
draw loop was instrumented directly and A/B'd across 4 configs at devicePixelRatio 1 and 2
(3 × 800 ms runs, medians):

```
dpr 1.5, uncapped (original)   ~0.06 ms of a 16.7 ms frame
dpr 1,   uncapped              ~0.06 ms
dpr 1,   capped to ~40 fps     ~0.06 ms  → cap only halved smoothness, bought nothing
```

So: the 40 fps cap was **removed** and DPR-1 rendering **kept** (the JS is 0.3 % of the budget;
the only real saving from 1x is canvas raster on the compositor). Retest gate in the suite is a
relative one — particles on vs the same page with the layer hidden must stay within 10 %.

## v4 — the 3D layer (real depth, no 3D library)

No three.js: a WebGL bundle would be ~600 kB and would not load in a sandboxed preview anyway.
Everything here is CSS `preserve-3d` plus one hand-written pinhole projection in canvas 2D.

| What | How | Where |
| --- | --- | --- |
| Hero cube, drag / arrow-key / Home rotatable, inertial spin | six `.face`s placed with `rotateY/rotateX(±90deg) translateZ(size/2)`, stage carries `perspective:900px` | `#cubeStage` + JS `14b` |
| 3D starfield + wireframe globe behind the hero | `scene3d()`: own projection `s = FL / (FL + z)`, focal length 620, star recycling on z, 7 lat × 20 long globe, DPR pinned to 1 | JS `14. 3D SCENE` |
| Skill/project cards lift on their own Z-layers | `translateZ` ladder: icon 86 → h3 66 → head 52 → tools 44 → tags/bars 30 px, revealed by `perspective(900px)` inside the tilt transform | `.card` + JS `14e` |
| Hero chips / code card / blob float at different depths | `.hero-visual{perspective:1200px}` with the frame rotated by `heroDepth` | CSS `16b`, JS `14c` |
| Project cards flip to an "Under the hood" face | `.flip-inner` rotateY(180deg), faces share one grid cell so the card is always as tall as its tallest side | CSS `16b`, JS `14d` |
| Section titles tilt up out of the page | `.r3d{transform:perspective(760px) rotateX(-16deg)}` → flat on `in-view` | CSS `16b` |

**Four traps that made "3D" silently flat** — all of them leave `getComputedStyle` reporting
`preserve-3d`, so a CSSOM check cannot detect them. The only test that works is rotating the
parent and diffing the children's rects:

1. `overflow` other than `visible` flattens the box (`.card`/`.proj` are deliberately un-clipped;
   every glow is `inset:0`, so nothing needs clipping).
2. `backdrop-filter` flattens it too. The cards lost their `blur(10px)` glass and gained
   `linear-gradient(150deg,rgba(glow,.045),transparent),var(--card-solid)` — which also *raised*
   text contrast, because the backdrop is now opaque.
3. `opacity` below 1 flattens it. A `.reveal` that has not entered the viewport yet is therefore
   flat; that is invisible to the user (it is not on screen yet) but it will fool a measurement, so
   the suite scrolls the card in and asserts `opacity === '1'` before measuring depth.
4. `align-self:start` on an *absolutely positioned* grid child shrinks it to its content height —
   the flip-card rule quietly turned the hero cube into a 206 × 84 slab for a whole round.

**Bugs the 3D pass found in the previous version and fixed**

* The hidden `.face.back` was `position:absolute;inset:0` over the whole card: `backface-visibility`
  hides *pixels*, not pointer events, so it was swallowing clicks on the title, tags and links.
  Faces now swap with `visibility`, which removes hit-testing, tab order and the a11y tree at once.
* Hover flipped the card *and* the button flipped it, so clicking while hovering opened then closed
  it, and moving the mouse away hid the text you were trying to read. Hover-flip is gone; the flip
  is `Details` / `Escape` / tap only.
* `.reveal.r3d{opacity:0}` had the same specificity as `.reveal.in-view` but came later in the file,
  so every 3D section title was pinned permanently invisible.
* Hovering a project moved `mouseenter` before the *first real* pointer position, so the fake cursor
  painted in the top-left corner. Both the cursor and `cursor:none` now wait for `.pointer-live`.
* `.back-inline` ("Back to top") was a 91 × 20 px tap target; it has padding now.
* **Without JavaScript the entire page was invisible**: `.reveal{opacity:0}` was unconditional. The
  `.js` marker now comes from `script.js` itself, so if that file ever fails to load nothing is
  hidden; bars, radar and the flip back-face fall back to their final CSS state and the `Details`
  button hides itself. (Also corrected: the `<noscript>` skill line said "Web 80", the data says 82.)
* The idle cube spin re-read its own animated angle into the animation base every frame, which added
  the sine term 60 times a second — a ~700 °/s blur. Idle now breathes inside a clamped 3/4 arc
  (yaw −42°…−20°) so three faces always face the viewer, and only after a drag does it free-spin.

## Test totals

Suites live in `tests/` and run against a static server (`python3 -m http.server 8099` at the
workspace root, then `node tests/pf_3d.js`). They need Playwright; `PW=/path/to/node_modules/playwright`
overrides the import path.

* `tests/pf_regress.js` — structure, links, anchors, placeholders, filter, **no-JS fallback**,
  WCAG AA in both themes, IST clock, a11y wiring, mobile, print: **47/47**
* `tests/pf_3d.js` — depth measured as child-rect parallax (7.6 px with the ladder, 0 px with it
  zeroed), cube geometry/drag/keys, flip behaviour + hit-testing + tab order, canvas scene density
  and A/B fps, reduced-motion, mobile, print: **53/53**
* 0 console or page errors, 0 failed requests; horizontal overflow at 390 px: **0 px**;
  layout jump on flip: **0 px** (card 325 → 325, grid 671 → 671).
