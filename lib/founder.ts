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
   * The bio for his own site at david.urbancraft.co.ug, supplied and approved
   * by him, third person, as a profile page is normally written.
   *
   * It deliberately differs from `story` below. This is his personal page and
   * it is allowed to sell; the /founder page on the company site is not, which
   * is why there are two texts rather than one shared between them. Keep them
   * separate — collapsing them puts the sales language back on the company
   * site, which is the thing that was asked to be taken out.
   */
  bio: [
    [
      { text: "David Collins Kibirige", strong: true },
      { text: " is a Ugandan furniture maker, interior designer, and entrepreneur, and the Founder of " },
      { text: "Urbancraft Furniture & Interior Design", strong: true },
      { text: ", a Kampala-based workshop specializing in modern custom furniture and interior solutions." },
    ],
    [
      { text: "With a passion for transforming ordinary spaces into beautiful, functional homes, David leads a skilled team that offers complete service from 3D design, production, to delivery and installation. His work includes modern L-shaped sofas, luxury TV walls with fluted panels and LED lighting, gypsum ceilings, custom wardrobes with glass display, wooden staircases, and kitchens." },
    ],
    [
      { text: "Based in " },
      // "Kasanga" in the supplied copy; Kansanga is the spelling of the
      // neighbourhood and the one used everywhere else on the site.
      { text: "Kitalanga, Kansanga — Second Boda Boda Stage, Kampala", strong: true },
      { text: ", David is known for quality craftsmanship, timely delivery (7–14 days), affordable pricing direct from workshop, and a professional uniformed team. Urbancraft also supplies branded workwear — overalls, t-shirts, and reflector jackets." },
    ],
  ] as { text: string; strong?: boolean }[][],

  mission: "To craft durable, modern furniture that tells your story — Built to Last.",

  /**
   * Plain, factual, first person, for the /founder page on the company site.
   * An earlier version carried the marketing copy — "no middlemen, no
   * shortcuts, just honest work and beautiful results" — which read as the
   * founder selling himself there. See `bio` above.
   */
  story: [
    "I run Urbancraft Furniture & Interior Design, a workshop in Kitalanga, Kansanga, Kampala. We make furniture to order and fit out interiors — kitchens, wardrobes, staircases, ceilings and feature walls.",
    "I trained in woodworking and I still work on site. Every job is measured, drawn, built in the workshop and installed by the same team, and I supervise each one from the first measurement to the last coat.",
  ],
} as const;
