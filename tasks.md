# Site Improvement Tasks

## Booking URLs

- [ ] Replace all placeholder event checkout URLs with verified Square buy links when they are available.
- [ ] Store each event's checkout URL alongside its date, location, and ticket prices in one event data source.
- [ ] Pass the selected event and ticket type from the booking flow to the payment page.
- [ ] Show a clear event and ticket summary before sending visitors to Square.
- [ ] Validate that published checkout URLs are HTTPS Square links and do not contain placeholder values.

## Mobile And Accessibility

- [ ] Add a mobile navigation menu that remains usable on narrow screens.
- [ ] Test and fix layouts at 320px, 375px, tablet, and desktop widths without horizontal scrolling.
- [ ] Reduce booking wizard padding and adjust event grids, buttons, and footer content for small screens.
- [ ] Add visible `:focus-visible` styles to all interactive controls.
- [ ] Add a skip-to-content link.
- [ ] Make the FAQ accordion expose its open/closed state with appropriate ARIA attributes.
- [ ] Make booking location and date selection understandable to keyboard and screen-reader users.
- [ ] Respect `prefers-reduced-motion` for animated and hover effects.
- [ ] Test keyboard-only navigation and 200% browser zoom.

## Accurate Content

- [ ] Review and rewrite site text so it reflects confirmed event and organisation details.
- [ ] Add complete event information: year, date, start/end time, venue, address, ticket rules, family ticket definition, accessibility, transport/parking, and refund policy.
- [ ] Ensure prices and event details match everywhere they appear.
- [ ] Replace generic or misleading payment/security language with accurate Square checkout wording.
- [ ] Update social links to the real Sydney Bush Dances accounts.
- [ ] Replace generic stock imagery and descriptions with approved, accurate photographs and alt text where available.

## SEO

- [ ] Add a unique meta description to every public page.
- [ ] Establish the production domain and add canonical URLs.
- [ ] Add Open Graph and social-preview metadata.
- [ ] Create `robots.txt` and `sitemap.xml` for public pages.
- [ ] Add accurate structured data for the organisation and individual events once event details are confirmed.
- [ ] Ensure every public page has a complete document structure, a unique title, and one clear `h1`.
- [ ] Make shared navigation and footer content available in the initial page HTML or through a build step so it can be reliably crawled.

## Demos

- [ ] Add a Demos page.

## Content Management

- [x] Add a system that lets the site manager edit key events without changing source code.
- [x] Make event date, time, venue, ticket summary, Square buy links, and publishing status editable in one place.
- [x] Protect site-manager access with email/password authentication and Firestore permissions.
- [ ] Add a preview workflow and richer event fields such as availability, accessibility, transport, and refund policy.
