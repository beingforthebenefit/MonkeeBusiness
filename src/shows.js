/**
 * Single source of truth for the gig calendar.
 *
 * Edit this list and push — the build renders it into the Shows section AND
 * into schema.org `MusicEvent` markup, which is what puts the band in Google's
 * event results. Nothing here is fetched at runtime.
 *
 * date/time: an ISO 8601 local datetime, "YYYY-MM-DDTHH:MM". Omit the time for
 *   an all-day or TBA slot.
 * status:  "scheduled" (default) | "cancelled" | "postponed"
 * tickets: optional URL. Omitted or empty renders no button.
 * free:    true for no-cover shows; drives the schema.org offer.
 *
 * Past shows drop off the public list automatically but stay here as history.
 */

/** @type {Array<{date: string, venue: string, city: string, address?: string, tickets?: string, note?: string, status?: string, free?: boolean}>} */
export const shows = [
  // Example — delete or replace once the first date is booked:
  // {
  //   date: '2026-05-16T20:00',
  //   venue: 'Club Fox',
  //   city: 'Redwood City, CA',
  //   address: '2209 Broadway, Redwood City, CA 94063',
  //   tickets: 'https://example.com/tickets',
  //   note: 'All ages',
  // },
]

/** Shows that have not happened yet, soonest first. */
export function upcomingShows(now = new Date()) {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  return shows
    .filter((show) => new Date(show.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}
