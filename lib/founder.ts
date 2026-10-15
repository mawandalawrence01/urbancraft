/**
 * The founder, in one place.
 *
 * His name, portrait and words appear on his own page, as a pointer from the
 * About page, and in the organisation's structured data. Duplicating them
 * would guarantee the three drift apart.
 */
export const FOUNDER = {
  name: "David Collins Kibirige",
  role: "Founder and lead designer",
  photo: "/brand/founder-david-collins-kibirige.webp",
  /** The share card: a portrait cropped to 1.9:1 loses his head, so the
   *  card is composed separately rather than derived at request time. */
  ogCard: "/og/founder.jpg",
  blur:
    "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAAAQAgCdASoMABAAAwBSJaQAAlmI6mG8g9+AAP7uH+6F5YUfLEKKBvzdt93MZKgvY30gTmgdTc/cCRitPurNBe/TR6gfZ7jCrq3DLgAA",

  /**
   * Plain, factual, first person. An earlier version carried the marketing
   * copy — "no middlemen, no shortcuts, just honest work and beautiful
   * results" — which read as the founder selling himself. A profile states
   * who someone is; the site does the selling.
   */
  story: [
    "I run Urbancraft Furniture & Interior Design, a workshop in Kitalanga, Kansanga, Kampala. We make furniture to order and fit out interiors — kitchens, wardrobes, staircases, ceilings and feature walls.",
    "I trained in woodworking and I still work on site. Every job is measured, drawn, built in the workshop and installed by the same team, and I supervise each one from the first measurement to the last coat.",
  ],
} as const;
