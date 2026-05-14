# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running Locally

No build step required. Open directly or serve with any static server:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

The Code Playground requires internet access on first load to fetch Pyodide v0.25.1 (~10MB WebAssembly) from CDN, then it caches in the browser.

## Architecture

**PyTrack** is a zero-dependency, browser-only Python course. Everything runs client-side with no framework, no npm, no compilation.

### Key files

- [`js/app.js`](js/app.js) — all JavaScript: theme toggle, progress tracking, sidebar, quiz logic, Pyodide playground, lesson navigation
- [`css/style.css`](css/style.css) — all styles via CSS custom properties; dark/light theme, layout, components
- [`index.html`](index.html) — homepage with unit cards and overall progress bar
- [`units/unit-N.html`](units/unit-1.html) — one file per unit (1–10); each contains the full sidebar, lesson panels, and an `initUnit({...})` call
- [`capstone.html`](capstone.html) — three capstone project descriptions
- [`roadmap.html`](roadmap.html) — professional path coverage board and expansion plan
- [`New Logo last.png`](<New Logo last.png>) — site logo (black background; `mix-blend-mode:screen` removes it on dark, `multiply` on light)

### How unit pages work

Each `units/unit-N.html` has:
1. A static sidebar listing all 10 units and their lessons (cross-unit links are plain `href`, same-unit links call `showLesson(idx)`)
2. A `<div id="lesson-panels">` containing one `.lesson-panel` div per lesson (toggled via `active` class)
3. A `<script>` block at the bottom that calls `initUnit({id, lessons: [{title, quizzes: [{q, opts, ans, exp}]}]})` — this wires up the entire page

### Theme system

Light/dark mode is controlled by `data-theme` on `<html>`, persisted to `localStorage('pytrack_theme')`.

- `initTheme()` runs immediately at the top of `app.js` (before DOM ready) to avoid flash
- `toggleTheme()` is called by `<button id="theme-toggle">` present in every page's nav
- All colors are CSS custom properties in `:root`; the `[data-theme="light"]` block overrides them
- Code blocks and output blocks have their own variables (`--code-bg`, `--output-bg`, etc.) and are overridden in light mode too
- When adding a new page, copy the nav pattern including the theme toggle button

### Progress persistence

All progress is stored in `localStorage` under the key `pytrack_v3` as a nested object:
```
{ unitId: { lessonIdx: true, "q"+lessonIdx: true } }
```
Lesson completion uses numeric keys; quiz completion uses `"q" + idx` string keys. The `unitDoneCount()` function filters out quiz keys when counting completed lessons.

### CSS conventions

- Fonts: `--sans: 'Nunito'` (body), `--mono: 'JetBrains Mono'` (code/labels)
- All hardcoded colors were converted to CSS variables — do not introduce new hardcoded hex colors; add a variable instead
- The sidebar is 260px fixed on desktop; collapses off-screen on mobile (`<768px`) with a toggle button and backdrop overlay

### Adding or editing content

To add a lesson to an existing unit:
1. Add a `.lesson-panel` div in the `#lesson-panels` container
2. Add a matching sidebar link in the `.sidebar-lessons` block
3. Add a lesson entry (with 5 quiz questions) in the `initUnit()` call at the bottom of the file

Quiz answer index (`ans`) is 0-based. Each quiz needs exactly 5 questions per lesson.
