# Site Improvement Tasks

## Booking URLs

- [ ] Replace all placeholder event checkout URLs with verified Square buy links when they are available.
- [x] Store each event's checkout URL alongside its date, location, ticket details, and attendee information in one event data source.
- [x] Send visitors directly from each event card to its Square checkout link.
- [x] Show a clear event and ticket summary before sending visitors to Square.
- [ ] Validate that published checkout URLs are HTTPS Square links and do not contain placeholder values.

## Mobile And Accessibility

- [x] Add a mobile navigation menu that remains usable on narrow screens.
- [x] Test and fix layouts at 320px, 375px, tablet, and desktop widths without horizontal scrolling.
- [x] Remove the obsolete booking wizard and adjust event grids, buttons, and footer content for small screens.
- [x] Add visible `:focus-visible` styles to all interactive controls.
- [x] Add a skip-to-content link.
- [x] Make the FAQ accordion expose its open/closed state with appropriate ARIA attributes.
- [x] Respect `prefers-reduced-motion` for animated and hover effects.
- [ ] Test keyboard-only navigation and 200% browser zoom in a browser.

## Accurate Content

- [ ] Review and rewrite site text so it reflects confirmed event and organisation details.
- [x] Add editable event fields for year, date, start/end time, venue, address, ticket rules, family ticket definition, accessibility, transport/parking, and refund policy.
- [ ] Ensure prices and event details match everywhere they appear.
- [ ] Replace generic or misleading payment/security language with accurate Square checkout wording.
- [ ] Update social links to the real Sydney Bush Dances accounts.
- [ ] Replace generic stock imagery and descriptions with approved, accurate photographs and alt text where available.

## SEO

- [x] Add a unique meta description to every public page.
- [x] Establish the production domain and add canonical URLs.
- [x] Add Open Graph and social-preview metadata.
- [x] Create `robots.txt` and `sitemap.xml` for public pages.
- [x] Add organisation structured data and dynamic event structured data.
- [x] Ensure every public page has a complete document structure, a unique title, and one clear `h1`.
- [ ] Make shared navigation and footer content available in the initial page HTML or through a build step so it can be reliably crawled.

## Demos

- [x] Add a Demos page.
- [ ] Add approved video embeds and accompanying captions.
- [ ] Add approved, optimized event photography with accurate alt text.

## Content Management

- [x] Add a system that lets the site manager edit key events without changing source code.
- [x] Make event date, time, venue, ticket summary, Square buy links, and publishing status editable in one place.
- [x] Protect site-manager access with email/password authentication and Firestore permissions.
- [ ] Add a preview workflow for event changes before publishing.
