/**
 * Renders `src/shows.js` into index.html at build time.
 *
 * Doing this here rather than in the browser means the gig list is real markup
 * in the served HTML: crawlers index it, it survives with JavaScript disabled,
 * and there is no layout shift while a fetch resolves. Two placeholders are
 * replaced — `<!--shows-->` and `<!--shows-jsonld-->`.
 */
import { upcomingShows } from '../src/shows.js'

const SITE = 'https://monkeebusinessband.com'
const TZ = 'America/Los_Angeles'

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
  )

const dayFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'America/Los_Angeles',
})
const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Los_Angeles',
})

/** True when the ISO string carried a time component, not just a date. */
const hasTime = (date) => date.includes('T')

/**
 * Stamps the Pacific UTC offset onto a bare local datetime.
 *
 * Google reads `startDate` as floating local time when there is no offset,
 * which puts a gig in the wrong slot for anyone browsing from another zone.
 * Every date in the list is a Bay Area show, so the offset is Pacific — and it
 * has to be resolved per-date because it flips between PST and PDT.
 */
function withPacificOffset(date) {
  if (!hasTime(date)) return date
  // Resolve twice: the first pass reads the offset from the datetime treated as
  // UTC, the second re-reads it from the corrected instant. That second pass
  // only changes anything for a show within hours of a DST switch, but it costs
  // nothing and removes the edge case entirely.
  let offset = pacificOffset(new Date(`${date}:00Z`))
  offset = pacificOffset(new Date(`${date}:00${offset}`))
  return `${date}:00${offset}`
}

function pacificOffset(instant) {
  const zone = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' })
    .formatToParts(instant)
    .find((part) => part.type === 'timeZoneName')?.value
  return (zone ?? 'GMT-08:00').replace('GMT', '')
}

function renderShow(show) {
  const when = new Date(show.date)
  const cancelled = show.status === 'cancelled'
  const time = hasTime(show.date) ? timeFormat.format(when) : 'Time TBA'
  const tickets = show.tickets
    ? `<a class="show__tickets button button--primary button--small" href="${escapeHtml(show.tickets)}" target="_blank" rel="noopener noreferrer">Tickets</a>`
    : ''
  const note = show.note ? `<p class="show__note">${escapeHtml(show.note)}</p>` : ''
  const status = cancelled ? '<p class="show__status">Cancelled</p>' : ''

  return `<li class="show${cancelled ? ' show--cancelled' : ''}">
            <time class="show__date" datetime="${escapeHtml(withPacificOffset(show.date))}">${escapeHtml(dayFormat.format(when))}</time>
            <div class="show__where">
              <p class="show__venue">${escapeHtml(show.venue)}</p>
              <p class="show__city">${escapeHtml(show.city)}</p>
              ${note}
            </div>
            <p class="show__time">${escapeHtml(time)}</p>
            ${status || tickets}
          </li>`
}

function renderJsonLd(list) {
  const events = list.map((show) => ({
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: `Monkee Business at ${show.venue}`,
    startDate: withPacificOffset(show.date),
    eventStatus: `https://schema.org/Event${
      show.status === 'cancelled'
        ? 'Cancelled'
        : show.status === 'postponed'
          ? 'Postponed'
          : 'Scheduled'
    }`,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: `${SITE}/#shows`,
    location: {
      '@type': 'Place',
      name: show.venue,
      address: show.address ?? show.city,
    },
    performer: { '@type': 'MusicGroup', name: 'Monkee Business', url: SITE },
    organizer: { '@type': 'MusicGroup', name: 'Monkee Business', url: SITE },
    ...(show.tickets || show.free
      ? {
          offers: {
            '@type': 'Offer',
            url: show.tickets ?? SITE,
            ...(show.free ? { price: '0', priceCurrency: 'USD' } : {}),
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  }))

  if (!events.length) return ''
  return `<script type="application/ld+json">${JSON.stringify(
    events.length === 1 ? events[0] : events
  )}</script>`
}

export function showsPlugin() {
  return {
    name: 'monkee-business:shows',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const list = upcomingShows()
        const markup = list.length
          ? `<ol class="shows">\n          ${list.map(renderShow).join('\n          ')}\n        </ol>`
          : `<p class="shows-empty">
            We're booking the next run of dates right now. Put your email in
            below and you'll be the first to know.
          </p>`

        return html
          .replace('<!--shows-->', markup)
          .replace('<!--shows-jsonld-->', renderJsonLd(list))
          .replace('<!--year-->', String(new Date().getFullYear()))
      },
    },
  }
}
