# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences of equal commercial weight, arriving with different jobs. The site's
first duty is letting a visitor identify which one they are without reading.

**Furniture buyers.** Individuals in and around Kampala buying a finished piece —
a sofa, a bed, a dining set. They browse a catalogue, compare prices in UGX, and
expect to buy or enquire the same day. Price, delivery and whether it will fit are
the decisions.

**Fit-out clients.** Four confirmed segments, all wanted:

- Homeowners and apartment owners fitting a kitchen, wardrobes or a staircase.
- Developers and landlords fitting out multiple units — larger contracts, longer
  cycles, judged on schedule and consistency across units.
- Businesses and retail — offices, shops, salons, bars needing counters,
  reception joinery or a full commercial fit-out.
- Architects and contractors who sub out joinery and judge the workshop on
  tolerances, drawings and hitting a programme date.

Fit-out clients do not buy from a catalogue. They are won by evidence of installed
work and by a survey-and-drawing process, and they convert through a brief, not a
cart.

## Product Purpose

UrbanCraft is a furniture workshop in Kansanga, Kampala that both sells finished
furniture and designs, builds and installs fitted interiors. Success is a visitor
recognising within seconds which of those two they came for, and reaching either a
product page or a submitted design brief without passing through the other.

## Positioning

One team from survey to installation. The workshop cuts, joints and finishes in
its own premises and fits on site, rather than subcontracting the build — which is
what lets it quote a fixed price and carry a warranty on both joinery and finish.

Pricing is published rather than negotiated in the room. Every catalogue piece is
offered in three named quality classes (Economy, Standard, Top Class) with the
timber and finishing attached to each, so the customer chooses the class instead of
haggling the price.

For fit-out, the site survey and the drawing are free, and no deposit is taken
until a quote is approved.

## Operating Context

- Kampala, Uganda. Prices are whole Ugandan Shillings; UGX has no minor unit.
- Payment is mobile money (MTN / Airtel via Yo! Payments), cash on delivery, or
  bank deposit. Mobile money is the common path.
- Phone and WhatsApp are primary contact channels, not fallbacks. A visible phone
  number does real conversion work here.
- Delivery is free within Kampala Central and quoted by zone beyond it.
- Build lead time runs roughly one to two weeks (7–14 days) for catalogue pieces.
- Warranty is six months on joinery and finish, the same in every quality class.
  The classes differ by timber and finishing, not by cover.
- Payment on commissions is 50% deposit, 50% on delivery.
- Fit-out runs as four stages: survey on site, drawing and itemised price, build
  in the workshop, install and finish.

## Capabilities and Constraints

- Catalogue: 243 active products across 28 categories, with variants for the three
  quality classes, cart, checkout and order tracking.
- Interior design: 14 services grouped as fit-out (kitchens, wardrobes,
  staircases, feature walls, ceilings, doors, reception, outdoor), furniture
  styling, a turned-wood homeware line, and behind-the-scenes process.
- Design briefs capture space type, budget band and timeline, and land in the same
  admin queue as product enquiries, distinguished by kind.
- 23 installed projects exist as individual case entries, separate from the
  service galleries.
- Admin covers products, categories, orders, enquiries, projects and the design
  photo library.
- Every design photo carries a provenance flag. Only photos marked as the
  workshop's own work are ever public; this gate is a correctness requirement,
  not a preference.
- Stack is fixed: Next.js App Router, React, Tailwind v4, Prisma on Neon Postgres,
  deployed on Vercel. Galleries and product pages are statically generated with
  hourly revalidation.

### Undecided

- The turned-wood homeware line has no prices and cannot be sold until it does.
- No photo ordering exists, so each gallery's cover is its first import.

## Brand Commitments

- Name: UrbanCraft (UrbanCraft Furnishings). Existing logo lockup and mark.
- Voice in the shipped copy is plain, concrete and measurement-led — "We cut the
  piece to fit it", "priced openly, not negotiated in the room". Specific and
  unembellished rather than lyrical. This voice is working and should be kept.
- The brand vision in CLAUDE.md (workshop door entrance sequence, ambient workshop
  audio, GT Sectra, 3D assembly, carbon footprint calculator) is **explicitly not
  binding** — confirmed aspirational, superseded by this record. Future work
  should not treat it as a brief.
- **The visual direction is a standing preference, not one session's choice.**
  A bold expressive world was built and rejected in plain words ("not buying the
  yellow... we need minimal white background with a clean theme"). The committed
  direction is the category standard executed straight: white ground, generous
  air, photography doing the work, near-black text, hairline rules, one
  restrained accent, quiet type. The craft bar is Nordic retail — HAY, Muuto,
  Article. Do not re-propose an expressive or high-colour world without the
  user raising it first.

## Evidence on Hand

Real and usable:

- 211 photographs of the workshop's own installed and built work, live across 14
  services in `public/design/`.
- 23 installed projects with titles, summaries and client types.
- 243 real products with real UGX prices and photography.
- Real contact details, address in Kansanga (Kitalanga), and published delivery zones.

Absent — must not be fabricated:

- No testimonials, reviews, named clients or case-study quotes.
- No press coverage, awards, partner logos or certifications.
- No headcount, founding date, years-in-business or project-count claims.
- No sustainability or carbon data of any kind.
- Three photographs carry other companies' watermarks and are permanently held
  out of public view.

## Product Principles

1. **Two front doors, one workshop.** A buyer and a fit-out client want different
   things on arrival. Serve both at the top level without making either feel they
   landed in the wrong place, and without implying two separate companies.
2. **Evidence over adjectives.** The workshop has 211 photographs of real work and
   no testimonials. Persuade with installed work, named timbers, dimensions,
   warranties and prices — never with invented social proof.
3. **Publish the number.** Prices, quality classes, warranty terms, delivery
   zones and what the survey costs are all stated rather than withheld. Hiding a
   figure behind an enquiry form contradicts the positioning.
4. **The gate holds.** Nothing the workshop did not build is ever shown as its own
   work. Design must never create a surface that bypasses the provenance flag.
5. **Phone-first, Kampala-first.** Most visitors are on a phone on a variable
   connection, paying by mobile money. Mobile is the real design target.

## Accessibility & Inclusion

No product-specific standard has been established. General web accessibility
applies; copy must stay legible at small sizes on low-end Android devices, which
is the common device class for this audience.
