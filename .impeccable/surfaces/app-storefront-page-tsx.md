---
version: 1
slug: "app-storefront-page-tsx"
primary_target: "app/(storefront)/page.tsx"
related_targets: ["app/(storefront)/design/page.tsx","app/(storefront)/layout.tsx","app/globals.css"]
---

Scope: the storefront's public face — home, the interior-design landing and its
galleries, and the global chrome (header, footer, mobile tab bar, tokens, type)
that every other storefront route inherits. Visitor mode: Persuade.

Audience: two commercially equal arrivals. A furniture buyer who wants a price
and a delivery date, and a fit-out client — homeowner, developer, business, or
architect — who wants evidence of installed work and a survey booked. Neither
may feel they landed on the other's site.

Proof on hand: 211 photographs of the workshop's own installed work across 14
services, 243 real priced products, 23 installed projects. No testimonials, no
named clients, no press — none may be invented.

Constraint: the provenance gate is a correctness requirement. No surface may
render a design photo that is not marked OWN_WORK, and `heroRank` is NOT a
provenance gate — it ranks composition, and several hero-ranked products are
supplier catalogue renders.

## Direction contract

THESIS: Two trades of equal weight, presented as two identical doors. The page
refuses both category arrangements — no single styled-room hero funnelling into
shop-by-room tiles, and no full-bleed portfolio grid that buries the catalogue.
It is the category standard executed straight, taken deliberately after a bold
expressive world was built and rejected by the user in plain words.

OWN-WORLD: White ground throughout, with one quiet sand band (#f6f5f2) marking
the interiors section. Near-black ink (#1a1a18), hairline rules (#e6e4de), and a
single accent green (#2d4a3e) reserved for action and live state — the free
survey is tinted, the paid path is near-black, and nothing else on the page is
coloured. Hanken Grotesk at normal weights (headings 500) across every role;
photography is the loudest element and the type gets out of its way. A single
4px radius token. No kickers above headings anywhere; numbers only where the
sequence is real.

STORY: The visitor understands within one viewport that this workshop does two
distinct things at equal scale, believes it because the page shows real figures
and real installed work rather than adjectives, and acts by entering whichever
door is theirs — browse the catalogue, or book a survey.

FIRST VIEWPORT: White. A headline at normal weight stating the dual trade, one
supporting line naming the workshop and both offers. Below it two cards of
identical size, shape and weight, side by side at desktop and stacked on mobile:
each a large photograph, then the trade name, its live figure right-aligned
(243 pieces / 130 photographs), a line of body copy, and an underlined action.
The only difference between them is which action carries the accent, because
only one of the two is free.

FORM: The category standard, taken as the user's standing exit from the direction
roll; craft bar set to Nordic retail (HAY / Muuto / Article). Supersedes the
assigned direction "The Docket" (seed key aec51761), which was built in full and
rejected. Code-led.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
