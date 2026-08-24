# Working in this repo

Single static page for a Bay Area Monkees tribute band. Vite builds it; GitHub Actions
publishes `dist/` to the `gh-pages` branch. No framework, no backend.

Read `README.md` first — it covers the routine content edits (adding a show, swapping a
photo). This file covers the conventions that aren't obvious from the code.

## Ground rules

**No runtime dependencies.** `@fontsource/lato` is the only one, and it ships font files,
not code. Don't add a CDN `<script>`, a framework, or a utility library. The previous
version of this site carried ~250 KB of JavaScript, three quarters of which was never
called. If something needs a library, say why it can't be twenty lines of vanilla JS.

**The page must work with JavaScript disabled.** All content is in `index.html` as real
markup. JS adds the mobile menu, scroll reveals, and fetch-based form submission — each of
which degrades to something usable. Never move content into a script. In particular, the
`[data-reveal]` hidden state is applied *by JS*, so a no-JS visitor never gets an invisible
page; keep it that way.

**Never size type or layout in `vh`.** The old stylesheet set font sizes in `vh`, which
made text resize whenever Android Chrome's URL bar slid away — this was a real, reported
bug. Use `rem` and `clamp()` against viewport *width*. For full-height blocks use `svh`
with a `vh` fallback, and `min-height` rather than `height` or `max-height`.

**Design tokens live at the top of `css/style.css`.** Colours, type scale, spacing, and
easing are custom properties on `:root`. Change them there, not inline. Don't reintroduce
hard-coded hex values.

## Layout conventions

- Sections set their own max width via `.section--shows` / `--band` / `--contact`. Children
  then align flush with their heading. Don't put `margin-inline: auto` on a child — that
  centres narrow blocks away from the heading they belong to.
- `.signup` is deliberately full-bleed (it has a background image) and centres its own
  `.signup__inner` instead.
- Breakpoints are `860px` (nav collapses, members stack) and `720px` (show rows stack).

## Images

Never hand-edit anything in `public/img/`. Put the original in `originals/` and run
`npm run images`. The script writes AVIF + WebP at the sizes the markup asks for, detects
grayscale sources and drops their chroma, and regenerates `public/og-image.png`.

Every `<img>` needs `width`, `height`, and `alt`. Below-the-fold images need
`loading="lazy"`; the hero and logo must not have it.

## Shows

`src/shows.js` is the only source of gig data. `scripts/vite-plugin-shows.mjs` renders it
into `index.html` at build time — both the visible list and the `MusicEvent` JSON-LD — by
replacing the `<!--shows-->` and `<!--shows-jsonld-->` comments. Don't fetch it at runtime;
the point is that crawlers see the dates.

Dates are bare local datetimes (`2026-05-16T20:00`). The plugin stamps the correct Pacific
offset on, resolving DST per-date. Keep it that way — a floating `startDate` puts the gig
in the wrong slot for anyone in another timezone.

## Before you call something done

```bash
npm run lint && npm run build
```

Then look at the page at both a phone width (412px) and desktop. Layout regressions on
Android are the failure mode this site has actually had.

## Things deliberately removed — don't restore them

- `.htaccess` — GitHub Pages is not Apache and ignores it entirely.
- `server.py` / the `.venv` — replaced by `npm run dev`.
- `deploy.sh` — the manual `git checkout gh-pages && git merge master` dance is now CI.
- The Songkick embed — a render-blocking third-party script on a protocol-relative URL.
  `src/shows.js` replaced it. The Songkick *link* in the Shows section stays.
- The radial icon-only nav menu — unlabelled, keyboard-inaccessible, and its icons were
  23–50 KB Inkscape/PDF exports. Replaced by a labelled header nav with inline SVG.
