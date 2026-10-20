# Bharati Tripathi — Portfolio

A modern, interactive, single-page portfolio website for **Bharati Tripathi**, a B.Tech Computer Science (AI & ML) student at Jaypee University of Engineering and Technology (JUET), Rewa, Madhya Pradesh. It presents her profile, skills, projects, academic journey and contact details.

## Live site

**https://tripathibharati303-ops.github.io/My-portfolio/**

---

## Table of contents

1. [Sections](#sections)
2. [Technologies used](#technologies-used)
3. [Features](#features)
4. [Accessibility](#accessibility)
5. [Responsive design](#responsive-design)
6. [Performance notes](#performance-notes)
7. [Project structure](#project-structure)
8. [Run locally](#run-locally)
9. [Customize](#customize)
10. [Deploy on GitHub Pages](#deploy-on-github-pages)
11. [Contact](#contact)

---

## Sections

| Section | What it contains |
| --- | --- |
| **Hero** | Name with animated intro, typewriter role line, short description, call-to-action buttons, social icons, stat counters, draggable 3D cube, floating tech chips and an `about.json` code card |
| **Marquee** | Scrolling ticker of focus areas (Problem Solving, Data Analysis, Web Design, DSA, DBMS, System Design, Foundations of AI) |
| **About** | Who I am, education background, quick facts (location, studying, looking for), mini stats (Class X, Class XII, clubs), monogram card and a quote |
| **Skills** | Interactive radar skill graph, language/tool progress bars, core skills, currently-learning topics and clubs |
| **Projects** | Filterable project cards that flip in 3D to show technical details, with live-demo and source links |
| **Journey** | Vertical timeline of academics and milestones |
| **Contact** | Email, GitHub, LinkedIn and LeetCode cards |
| **Footer** | Credit line with automatically updated year |

---

## Technologies used

### Languages and markup
- **HTML5** — semantic structure (`header`, `nav`, `main`, `section`, `article`, `figure`, `footer`), ARIA attributes, `noscript` fallback
- **CSS3** — one stylesheet with no framework
- **Vanilla JavaScript (ES5-style, no dependencies)** — organised as independent, null-guarded modules so one failing feature never breaks the rest

### CSS techniques
- CSS custom properties (design tokens) for colors, radii, shadows, fonts and easing
- Dark and light themes through `[data-theme]`
- CSS Grid and Flexbox layouts
- `clamp()` for fluid typography
- 3D transforms: `perspective`, `preserve-3d`, `translateZ`, `rotateX/Y`, `backface-visibility`
- `backdrop-filter` (glass navbar), `mask-image` (fading grid and marquee), `color-mix()` with a fallback
- Keyframe animations (pulse, blink, float, spin, marquee, intro)
- Media queries for responsive layout, `prefers-reduced-motion` and print

### Browser APIs used in JavaScript
- **Canvas 2D API** — starfield, wireframe globe, dot-art (stipple) rendering and confetti
- **SVG (created with `createElementNS`)** — the radar chart
- **IntersectionObserver** — scroll reveal, counters, bar/radar entrance, active nav link
- **requestAnimationFrame** — all animation loops
- **Pointer Events** — drag and inertia for the 3D cube
- **localStorage / sessionStorage** — saved theme, first-visit intro
- **Intl.DateTimeFormat** — live IST clock
- **matchMedia** — theme, reduced motion and pointer detection
- **Page Visibility API** — pauses animations when the tab is hidden
- **CustomEvent** — theme change notification between modules

### Fonts and assets
- **Google Fonts:** Space Grotesk (headings), JetBrains Mono (labels and code), Inter (body text)
- Inline SVG icons and an inline SVG favicon (no image files needed)

### Hosting
- **GitHub Pages**

---

## Features

### Theme and first impression
- **Dark / light theme toggle** — defaults to the visitor's OS preference, remembers the choice, and applies before first paint so there is no flash
- Browser `theme-color` updates with the theme
- **Intro curtain** with an animated "BT" mark and loading bar, shown once per session and removed automatically
- **Split-text hero name** — each letter animates in
- **Typewriter role line** cycling through: CSALML Student, Problem Solver, Web Developer, Database Enthusiast, Data Analyst, Competitive Programmer, Open Source Contributor

### Hero
- **Draggable 3D cube** with six faces (BT, `</>`, `{ }`, SQL, C++, π)
  - Drag with mouse or touch, with inertia after release
  - Keyboard control: arrow keys rotate, `Shift` rotates faster, `Home` resets
  - Gentle idle "breathing" motion at a three-quarter view
- **Floating tech chips** (C++, Python, JavaScript, Database System)
- **Code card** styled as `about.json` with syntax coloring
- **Depth parallax** — the whole hero scene leans toward the pointer
- **Count-up stat cards** (languages, core skills, GitHub projects)
- **Open-to-work badge** with a **live IST clock**

### Background and atmosphere
- **Particle starfield** flying past a perspective camera
- **Rotating wireframe globe** that tilts with mouse position
- Subtle grid, floating blurred orbs and a **cursor spotlight glow**
- **Custom cursor** (dot and ring) that grows on interactive elements
- Dot-art (stipple) rendering helper for canvas artwork

### Navigation and scrolling
- Sticky, blurred navbar with a border that appears on scroll
- **Scroll progress bar** at the top of the page
- **Active-section highlight** in the nav (scroll-spy)
- **Mobile menu** (burger) that closes on link click or `Esc`
- **Back-to-top button** with a circular scroll-progress ring
- Smooth scrolling and offset so section titles are not hidden under the navbar
- **Marquee ticker** that pauses on hover

### Skills section
- **Radar skill graph** built by hand in SVG
  - Six axes: Programming, Web Dev, Data Analysis, Problem Solving, DBMS, Communication
  - Two layers: current level and 6-month target
  - Hover or focus a node for an exact-level tooltip
  - Auto-calculated average level and gap to target
- **Animated skill bars** for C, C++, Python, JavaScript, HTML5/CSS3 and MySQL
- Tool pills (Git & GitHub, VS Code, Excel, Figma, MySQL, Pandas, Canvas, Linux)
- Core skills, currently-learning topics (dashed pills) and clubs (CSALML Development, Bitwise Club)

### Projects section
- **Filter chips:** All, Web apps, Data & tools, Logic, with a live "N projects" counter
- **3D flip cards:** front shows the summary, tech tags and links; back shows "Under the hood" details
- Featured ribbon on the highlighted project
- Language color dots, live-demo and source buttons
- Currently showcases Vartalab, NetMirror, Rock · Paper · Scissors and Calculator

### Journey and About
- **Timeline** with hover-highlighted markers (B.Tech, Class XII, Class X, clubs and first web apps)
- Fact list, academic stat cards (88% Class X, 85% Class XII), monogram card and quote card

### Micro-interactions
- **Card spotlight glow** that follows the pointer
- **3D tilt** on skill cards, lifting layers on the Z axis
- **Magnetic buttons, chips and icons** that lean toward the cursor
- Shine sweep on buttons, lift on hover for pills and links
- **Staggered scroll-reveal** animations and 3D entrance for section headings
- **Easter egg:** type `bharati` anywhere on the page for a confetti burst

### SEO and sharing
- Page title and meta description
- Open Graph title, description and type
- `color-scheme` and `theme-color` meta tags

---

## Accessibility

- "Skip to content" link
- Visible keyboard focus ring (`:focus-visible`)
- ARIA labels, roles and `aria-pressed` / `aria-expanded` states on toggles and flip buttons
- Decorative canvases and effects hidden from screen readers
- Hidden flip-card face removed from tab order
- Cube is keyboard-operable
- Screen readers get the clean hero name even though it is split into letters
- **`prefers-reduced-motion` support** — heavy effects are turned off
- **No-JavaScript fallback** — all content stays visible if scripts fail to load, plus a `noscript` message for the skill graph

## Responsive design

Layout adapts at 1040px, 900px, 860px, 640px, 560px, 520px and 420px: the hero stacks, grids collapse to one or two columns, the nav becomes a slide-down menu, and extra effects such as the custom cursor are disabled on touch devices.

## Performance notes

- No frameworks, libraries or build step
- Canvas rendered at 1x and animation paused when the tab is hidden
- Pointer effects use CSS variables and `requestAnimationFrame`
- Effects are feature-detected and only run on devices with a fine pointer

## Print support

A print stylesheet switches to a clean light palette, hides decorative elements and avoids breaking cards across pages.

---

## Project structure

```
portfolio/
├── index.html   # page markup and content
├── style.css    # themes, layout, animations, 3D layer, responsive and print styles
├── script.js    # theme, radar chart, cube, filters, canvas effects, interactions
└── README.md
```

## Run locally

1. Download or clone the repository files into one folder.
2. Open `index.html` in your browser, or start a local server:
   ```bash
   python -m http.server 8000
   ```
   Then visit http://localhost:8000.

No installation or build step is required.

## Customize

- **Content:** edit text, links and project cards in `index.html`
- **Skill graph values:** edit the `DATA` array in the radar section of `script.js`
- **Typewriter roles:** edit the `roles` array in `script.js`
- **Colors and theme:** change the CSS variables at the top of `style.css`
- **Easter-egg word:** change the `word` variable in the confetti section of `script.js`

## Deploy on GitHub Pages

1. Keep `index.html` in the root of the repository.
2. Go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**, then select your main branch and the `/ (root)` folder.
4. Save. The site goes live after a minute or two.

---

## Contact

- **Email:** tripathibharati303@gmail.com
- **GitHub:** [tripathibharati303-ops](https://github.com/tripathibharati303-ops)
- **LinkedIn:** [bharati-tripathi](https://www.linkedin.com/in/bharati-tripathi-a8a2a6375)
- **LeetCode:** [TripathiBharati](https://leetcode.com/TripathiBharati)

---

Designed and built by **Bharati Tripathi**.
