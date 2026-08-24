# Monkee Business

The website for **Monkee Business**, the San Francisco Bay Area's tribute to The Monkees.

Live at **[monkeebusinessband.com](https://monkeebusinessband.com/)**.

It is a single static page — no framework, no backend, no database. Vite bundles it and
GitHub Actions publishes it.

---

## Getting started

You need [Node.js](https://nodejs.org/) 20 or newer. Nothing else — the old Python
`livereload` server is gone.

```bash
git clone https://github.com/beingforthebenefit/MonkeeBusiness.git
cd MonkeeBusiness
npm install
npm run dev
```

`npm run dev` opens <http://localhost:5500> and reloads the page as you save.

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Builds the production site into `dist/` |
| `npm run preview` | Serves the built `dist/` exactly as it will be deployed |
| `npm run images` | Regenerates every web image from `originals/` |
| `npm run lint` | Checks JS and CSS |
| `npm run format` | Reformats source files |

---

## The jobs you'll actually do

### Add or change a show

Everything lives in [`src/shows.js`](src/shows.js). Add an entry to the `shows` array:

```js
{
  date: '2026-05-16T20:00',           // local Bay Area time
  venue: 'Club Fox',
  city: 'Redwood City, CA',
  address: '2209 Broadway, Redwood City, CA 94063',  // optional, helps Google Maps
  tickets: 'https://example.com/tickets',            // optional
  note: 'All ages',                                  // optional
}
```

Commit and push to `master`. That's it — the deploy is automatic.

Two things happen at build time from that one entry: the Shows section is rendered as real
HTML, and matching [schema.org `MusicEvent`](https://schema.org/MusicEvent) data is written
into the page so the gig can appear in Google's event results. **Past shows disappear from
the site automatically**, so leave them in the file as a history if you like.

For a cancelled date, add `status: 'cancelled'` rather than deleting the entry — the show
stays listed with a strikethrough so people who bought tickets aren't left guessing. Free
shows take `free: true`.

### Change a band photo or bio

Bios are plain HTML in [`index.html`](index.html) — search for the person's name.

Photos need one step. Drop the full-resolution original into `originals/members/` named
after the person (`originals/members/ken.jpg`), then:

```bash
npm run images
```

That writes AVIF and WebP versions at two sizes into `public/img/members/`. Commit both the
original and the generated files.

The square crop has no face detection behind it, so check the result. If someone's head
gets clipped, set their crop gravity in the `CROP` map at the top of
[`scripts/optimize-images.mjs`](scripts/optimize-images.mjs) — `'top'`, `'centre'`, or
`'attention'` (the automatic default) — and run it again.

### Add a new band member

Copy an existing `<li class="member">` block in `index.html`, swap the name, role, photo
paths and bio, and add them to the `"member"` array in the `MusicGroup` JSON-LD block in
`<head>` so search engines see the change too.

---

## How it's put together

```
index.html            The entire page. Content lives here.
src/shows.js          Gig list — the one file that changes often.
css/style.css         All styling, driven by custom properties at the top.
js/main.js            ~150 lines of vanilla JS. No jQuery, no CDN scripts.
public/               Copied to the site root verbatim (images, icons, CNAME, robots.txt).
originals/            Full-resolution photo sources. Never published.
scripts/              Image pipeline and the build-time shows renderer.
```

**Where things go.** Anything in `public/` is served at the URL matching its path —
`public/img/logo.svg` becomes `/img/logo.svg`. Those files are never renamed, so metadata
that needs a stable URL (the social-share image, favicons) belongs there. `css/` and `js/`
are bundled, minified, and content-hashed into `dist/assets/`.

**Fonts** are self-hosted through the `@fontsource/lato` package, so the site makes no
requests to Google. Only the Latin subset and the four weights in use are shipped.

**JavaScript is optional.** Every word, image, form, and link works with scripts disabled.
JS only adds the mobile menu, scroll reveals, and in-page form submission.

---

## Deploying

Push to `master`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) lints,
builds, and pushes `dist/` to the `gh-pages` branch, which is where the repository's Pages
setting points. A deploy takes about a minute.

You can also trigger one by hand from the repository's **Actions** tab (*Deploy* →
*Run workflow*) — useful after editing `src/shows.js` through the GitHub web UI.

`public/CNAME` is what holds the custom domain to the site. Don't delete it.

---

## Notes for the curious

The 2025 version of this site loaded jQuery, GSAP, ScrollMagic, Rellax, and a lazyload
library from three CDNs — roughly 250 KB of JavaScript. GSAP and ScrollMagic were never
called, Rellax was pointed at a CSS class that didn't exist in the markup, and the lazyload
library was given `data-src` values identical to `src`, so it deferred nothing. All of it
is now about 4 KB of hand-written JavaScript using `IntersectionObserver` and native
`loading="lazy"`.
