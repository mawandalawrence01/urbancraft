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

  /** His own words, kept verbatim. */
  story: [
    "I started Urbancraft with a simple belief: Ugandan homes deserve high-quality, custom furniture that fits perfectly and lasts for years — without the cost of importing it.",
    "At my workshop in Kansanga, Kitalanga, I personally supervise every project, so every sofa, door, floor and interior detail is done right.",
    "When you choose Urbancraft you work directly with me and my team. No middlemen, no shortcuts — just honest work and beautiful results.",
  ],
} as const;
