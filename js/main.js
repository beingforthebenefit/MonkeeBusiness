/**
 * Everything the page needs at runtime.
 *
 * This replaces jQuery, GSAP, ScrollMagic, Rellax and a lazyload library that
 * the old page pulled from three different CDNs. GSAP and ScrollMagic were
 * never called; Rellax was initialised against a `.rellax` selector that
 * matched nothing; the lazyload library was handed `data-src` values identical
 * to `src`, so it deferred nothing. Native `loading="lazy"` and
 * IntersectionObserver cover the two behaviours that were actually wanted.
 *
 * Nothing here is required for the page to be readable — it is progressive
 * enhancement on top of markup that already works.
 */

import '../css/style.css'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

/* -------------------------------------------------------------------------
   Header: solid background once the hero scrolls away
   ------------------------------------------------------------------------- */

function initHeader() {
  const header = document.querySelector('.site-header')
  const hero = document.querySelector('.hero')
  if (!header || !hero) return

  // Observing a sentinel beats a scroll listener: the browser only wakes us
  // when the hero actually crosses the header line.
  const observer = new IntersectionObserver(
    ([entry]) => header.toggleAttribute('data-stuck', !entry.isIntersecting),
    { rootMargin: '-70px 0px 0px 0px', threshold: 0 }
  )
  observer.observe(hero)
}

/* -------------------------------------------------------------------------
   Mobile navigation
   ------------------------------------------------------------------------- */

function initNav() {
  const header = document.querySelector('.site-header')
  const toggle = document.querySelector('.nav-toggle')
  const nav = document.querySelector('.site-nav')
  if (!header || !toggle || !nav) return

  const setOpen = (open) => {
    header.toggleAttribute('data-nav-open', open)
    toggle.setAttribute('aria-expanded', String(open))
    // Locking the body prevents the page scrolling behind the overlay, which
    // on Android reads as the layout jumping when the menu closes.
    document.body.style.overflow = open ? 'hidden' : ''
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true')
  })

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false)
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.hasAttribute('data-nav-open')) {
      setOpen(false)
      toggle.focus()
    }
  })

  // Resizing past the breakpoint should not strand the page in a locked state.
  window.matchMedia('(width > 860px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false)
  })
}

/* -------------------------------------------------------------------------
   Scroll spy: mark the nav link for the section in view
   ------------------------------------------------------------------------- */

function initScrollSpy() {
  const links = [...document.querySelectorAll('.site-nav__list a[href^="#"]')]
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean)
  if (!sections.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        for (const link of links) {
          const active = link.getAttribute('href') === `#${entry.target.id}`
          link.toggleAttribute('aria-current', active)
          if (active) link.setAttribute('aria-current', 'true')
        }
      }
    },
    // Trigger around the vertical middle of the viewport so the highlight
    // tracks what the reader is looking at, not what is barely on screen.
    { rootMargin: '-45% 0px -50% 0px' }
  )
  sections.forEach((section) => observer.observe(section))
}

/* -------------------------------------------------------------------------
   Reveal-on-scroll
   ------------------------------------------------------------------------- */

function initReveal() {
  if (prefersReducedMotion.matches) return

  const targets = document.querySelectorAll(
    '.section__head, .prose, .shows, .shows-empty, .section__foot, .member, .signup__inner, .contact'
  )
  if (!targets.length) return

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.setAttribute('data-reveal', 'shown')
        obs.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
  )

  for (const target of targets) {
    // The hidden state is only applied here, so a visitor without JS (or with
    // a thrown observer) never ends up staring at an empty page.
    target.setAttribute('data-reveal', '')
    observer.observe(target)
  }
}

/* -------------------------------------------------------------------------
   Back-to-top button
   ------------------------------------------------------------------------- */

function initBackToTop() {
  const button = document.querySelector('.to-top')
  if (!button) return

  const sentinel = document.querySelector('.hero') ?? document.body
  const observer = new IntersectionObserver(
    ([entry]) => {
      button.hidden = entry.isIntersecting
    },
    { threshold: 0 }
  )
  observer.observe(sentinel)

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
    })
    document.querySelector('.skip-link')?.focus({ preventScroll: true })
  })
}

/* -------------------------------------------------------------------------
   Email address, assembled at runtime
   ------------------------------------------------------------------------- */

function initEmail() {
  const holder = document.querySelector('[data-email-user]')
  if (!holder) return

  const address = `${holder.dataset.emailUser}@${holder.dataset.emailDomain}`
  const link = document.createElement('a')
  link.href = `mailto:${address}?subject=${encodeURIComponent('Monkee Business booking')}`
  link.textContent = address
  holder.replaceChildren(link)
}

/* -------------------------------------------------------------------------
   Forms: submit to Formspree over fetch so the visitor stays on the page
   ------------------------------------------------------------------------- */

const MESSAGES = {
  newsletter: "You're on the list. We'll be in touch when the next date lands.",
  contact: 'Thanks! Your message is on its way — we usually reply within a day or two.',
}

function initForms() {
  for (const form of document.querySelectorAll('form[data-form]')) {
    const status = form.querySelector('.form-status')
    const submit = form.querySelector('[type="submit"]')

    form.addEventListener('submit', async (event) => {
      // Without fetch support the default POST still works, so only take over
      // the submission when we can genuinely complete it ourselves.
      if (!window.fetch) return
      event.preventDefault()

      if (!form.reportValidity()) return

      const originalLabel = submit?.textContent
      if (submit) {
        submit.disabled = true
        submit.textContent = 'Sending…'
      }
      setStatus(status, '', 'pending')

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) throw new Error(`Formspree responded ${response.status}`)

        form.reset()
        setStatus(status, MESSAGES[form.dataset.form] ?? 'Thanks!', 'success')
      } catch {
        setStatus(
          status,
          'Something went wrong sending that. Please email us directly at monkeebusinessband@gmail.com.',
          'error'
        )
      } finally {
        if (submit) {
          submit.disabled = false
          submit.textContent = originalLabel
        }
      }
    })
  }
}

function setStatus(node, message, state) {
  if (!node) return
  node.textContent = message
  node.dataset.state = state
}

/* ---------------------------------------------------------------------- */

initHeader()
initNav()
initScrollSpy()
initReveal()
initBackToTop()
initEmail()
initForms()
