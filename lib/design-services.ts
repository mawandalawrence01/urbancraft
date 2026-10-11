/**
 * The fit-out side of the business, as plain data — deliberately free of
 * `server-only` and of any Prisma import so the seed script can read it from a
 * plain Node process. Each entry becomes a DesignService row and a gallery at
 * /design/<slug>.
 *
 * `kind` decides where a service surfaces:
 *   FITOUT       — a discipline we are commissioned for; listed on /design.
 *   STYLING      — room scenes that sell catalogue furniture, not a service.
 *   PRODUCT_LINE — pieces that belong in the shop once they carry a price.
 *   PROCESS      — behind the bench; never offered or sold.
 */
export const DESIGN_SERVICES = [
  {
    slug: "kitchens",
    name: "Kitchens & Cabinetry",
    kind: "FITOUT",
    tagline: "Built around how you actually cook",
    description:
      "Carcasses, fronts and worktops cut to your room rather than to a catalogue size. We set out the run so appliances sit flush, doors clear each other, and the last cabinet meets the wall without a filler strip.",
  },
  {
    slug: "wardrobes",
    name: "Wardrobes & Fitted Storage",
    kind: "FITOUT",
    tagline: "Floor to ceiling, wall to wall",
    description:
      "Fitted storage scribed to the room — no dust gap above, no wasted corner. Internals are planned around what you own: hanging heights, drawer depths and shelf spacing set before anything is cut.",
  },
  {
    slug: "staircases",
    name: "Staircases & Balustrades",
    kind: "FITOUT",
    tagline: "Treads that do not move underfoot",
    description:
      "Timber treads on steel or hardwood stringers, with balustrades fabricated to match. Rise and going are set out to a single consistent step, because the one that differs is the one people trip on.",
  },
  {
    slug: "feature-walls",
    name: "TV & Feature Walls",
    kind: "FITOUT",
    tagline: "Cabling hidden, slats landing true",
    description:
      "Media walls and slatted panelling with the services buried before the finish goes on. Slat spacing is set out from the centre so the run ends on a full slat at both ends.",
  },
  {
    slug: "ceilings",
    name: "Ceilings & Cove Lighting",
    kind: "FITOUT",
    tagline: "Light from a source you cannot see",
    description:
      "Dropped ceilings and coves built to carry concealed LED, with the gypsum detailed so the light grazes cleanly instead of showing every joint and screw head.",
  },
  {
    slug: "doors",
    name: "Doors & Frames",
    kind: "FITOUT",
    tagline: "Hung to a consistent gap",
    description:
      "Solid timber doors and frames in musambya, mahogany and nkuzinyana, hung with an even reveal on all four sides and finished so the grain reads through rather than under paint.",
  },
  {
    slug: "reception",
    name: "Reception, Retail & Hospitality",
    kind: "FITOUT",
    tagline: "The first surface anyone touches",
    description:
      "Counters, back-bars and display joinery for spaces that take daily punishment. Built to carry weight, take knocks and still look considered at the end of a trading year.",
  },
  {
    slug: "floor-decking",
    name: "Floor Decking",
    kind: "FITOUT",
    tagline: "Indoor and outdoor, laid to fall",
    description:
      "Timber decking inside and out, laid on a frame that is set out before the first board goes down. Outdoor runs are given a fall so water leaves them, and finished for sun and rain rather than for a showroom floor.",
  },
  {
    slug: "outdoor",
    name: "Outdoor Bars & Garden Structures",
    kind: "FITOUT",
    tagline: "Finished for weather, not for a showroom",
    description:
      "Garden bars, pergolas and covered seating in timber selected and sealed for sun and rain, with fixings specified so nothing bleeds rust down the posts after one wet season.",
  },

  {
    slug: "beds",
    name: "Bedrooms",
    kind: "STYLING",
    tagline: "Beds, headboards and the room around them",
    description: "Bedroom pieces photographed in the rooms they were built for.",
  },
  {
    slug: "dining",
    name: "Dining Rooms",
    kind: "STYLING",
    tagline: "Tables sized to the room, not the other way round",
    description: "Dining sets in place, from four-seaters to full-length tables.",
  },
  {
    slug: "consoles",
    name: "Consoles & Sideboards",
    kind: "STYLING",
    tagline: "The narrow pieces that finish a hallway",
    description: "Consoles, sideboards and dressers styled in situ.",
  },
  {
    slug: "desks",
    name: "Home Offices",
    kind: "STYLING",
    tagline: "Desks built for a real working day",
    description: "Workstations and study desks with storage planned in.",
  },

  {
    slug: "homeware",
    name: "Turned Wood Homeware",
    kind: "PRODUCT_LINE",
    tagline: "Off-cuts turned into something worth keeping",
    description:
      "Bowls, goblets, platters and serving pieces turned from the hardwood left over by larger commissions.",
  },

  {
    slug: "process",
    name: "On Site",
    kind: "PROCESS",
    tagline: "Behind the bench",
    description: "Installation and finishing, photographed mid-job.",
  },
] as const;

export type DesignServiceSeed = (typeof DESIGN_SERVICES)[number];

export const SERVICE_KINDS = ["FITOUT", "STYLING", "PRODUCT_LINE", "PROCESS"] as const;
