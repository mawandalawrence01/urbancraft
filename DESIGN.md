---
name: UrbanCraft
description: White ground, generous air, photography doing the work — one green accent reserved for action.
colors:
  ink: "#1a1a18"
  ink-2: "#44443f"
  ink-3: "#6a6a63"
  muted: "#8d8d85"
  paper: "#ffffff"
  cream: "#ffffff"
  sand: "#f6f5f2"
  sand-2: "#efeeea"
  line: "#e6e4de"
  line-2: "#f0efeb"
  rule: "#d8d5cd"
  accent: "#2d4a3e"
  accent-2: "#22392f"
  accent-soft: "#eef2ef"
  success: "#2d6a46"
  success-soft: "#ecf4ef"
  warn: "#8a6410"
  warn-soft: "#f8f0dc"
  danger: "#a33a30"
  danger-soft: "#f8ebe9"
typography:
  display:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 5.2vw, 3.9rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.45rem, 3vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  body-sm:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
    textTransform: "uppercase"
  figure:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.01em"
    fontFeature: "tabular-nums"
rounded:
  affordance: "2px"
  card: "4px"
  pill: "9999px"
spacing:
  gutter-sm: "1.25rem"
  gutter-md: "2rem"
  gutter-lg: "3rem"
  grid-gap: "1.25rem"
  grid-gap-lg: "1.5rem"
  heading-gap: "1.75rem"
  section: "5rem"
  section-lg: "7rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "0 1.75rem"
    height: "3rem"
    typography: "{typography.body-sm}"
  button-primary-hover:
    backgroundColor: "{colors.ink-2}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "0 1.75rem"
    height: "3rem"
  button-accent-hover:
    backgroundColor: "{colors.accent-2}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0 1.75rem"
    height: "3rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-ghost-hover:
    backgroundColor: "{colors.sand}"
  badge-neutral:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.ink-3}"
    rounded: "{rounded.card}"
    padding: "0.25rem 0.625rem"
  badge-accent:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-2}"
    rounded: "{rounded.card}"
    padding: "0.25rem 0.625rem"
  badge-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "0.25rem 0.625rem"
  input-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0.75rem 1rem"
    typography: "{typography.body-sm}"
  card-photo:
    backgroundColor: "{colors.sand}"
    rounded: "{rounded.card}"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.affordance}"
    size: "2.5rem"
  icon-button-hover:
    backgroundColor: "{colors.sand}"
---

# Design System: UrbanCraft

## Overview

**Creative North Star: "The Quiet Showroom"**

The page is a white room with good light. Nothing is decorated: the furniture and
the fitted rooms are photographed properly and then given space, and every other
element on the page steps back so the photograph reads first. Text is near-black
on white, rules are hairlines, headings sit in the normal weight range (500), and
exactly one colour — a considered forest green — appears, only where something can
be acted on or is live. This is the Nordic-retail craft standard executed straight,
with no irony and no smuggled quirk.

Density is low and deliberate. Sections are separated by large vertical gaps (5rem
rising to 7rem), headings are followed by air rather than ornament, and a single
quiet sand band (#f6f5f2) is the only alternative ground — used to mark the
interiors territory, never to add texture. Photography carries the weight;
typography carries the facts.

The world has one authored moment: a lead photograph settling into its frame
(`animate-settle`, 0.7s, a 2.5% scale release). Everything else moves only as a
response to the pointer — a slow 900ms image scale on hover, an underline, a
background tint. A previous canary-yellow stationery world was rejected outright by
the user; nothing from it belongs here, and bright yellow, stamp red, monospace
chrome and zero-radius card frames are out of the system.

**Key Characteristics:**
- White ground throughout; `paper` and `cream` are both pure white by design.
- One accent (#2d4a3e), for action and live state only.
- Hairline rules (#e6e4de / #d8d5cd); the grid is suggested, never drawn.
- One typeface, Hanken Grotesk, at normal weights; headings 500.
- A single 4px corner radius, 2px only on icon buttons and focus rings.
- No kickers, no eyebrows, no decorative colour, no shadow as decoration.

## Colors

A white room with near-black text, four greys, one quiet sand band, and a single
green.

### Primary
- **Workshop Green** (`accent`): Action and live state only. Primary action on the
  free paths (book a site survey), the active cart count badge, link underlines on
  the interiors door, the stage numerals on the fit-out sequence, the caret, the
  text selection and the focus ring. Never a fill for decoration.
- **Deep Workshop Green** (`accent-2`): The hover/pressed state of any green
  surface, and green text on a tinted ground.
- **Green Wash** (`accent-soft`): The only tinted chip background; discount and
  interiors badges sit on it.

### Neutral
- **Near-Black Ink** (`ink`): All headings, primary body text, the primary
  (paid-path) button fill, and the mobile active nav state.
- **Soft Ink** (`ink-2`): Secondary paragraphs, standfirsts, resting nav links,
  and the primary button's hover fill.
- **Grey Ink** (`ink-3`): Supporting detail, table body copy, list descriptions.
- **Muted Grey** (`muted`): Counts, captions, footer column headings, inactive
  tabs. The quietest legible grey.
- **Paper White** (`paper`, `cream`): The page and every raised surface — menu
  panels, drawers, cards, inputs. Both tokens are white; there is no off-white.
- **Sand** (`sand`): The one alternating band (the interiors section) and the
  placeholder ground behind every image frame before it loads.
- **Sand Deep** (`sand-2`): The placeholder ground for the smaller interiors
  tiles, one step down from sand.
- **Hairline** (`line`): Every default border — header, footer, table rows,
  inputs, menu panels, drawer dividers.
- **Faint Hairline** (`line-2`): The lighter band inside the loading shimmer.
- **Strong Hairline** (`rule`): The slightly stronger stroke on outline buttons
  and the scrollbar thumb; it darkens to `ink` on hover.

### Status
- **Success / Warn / Danger** (`success`, `warn`, `danger`) with their soft
  grounds: confirmations, order states, validation errors only. They are status
  signals, not palette colours, and never appear as styling.

### Named Rules
**The One Colour Rule.** `accent` is the only hue on the page. It is reserved for
action and live state; nothing else is coloured. If a surface is green for emphasis
rather than for action, the green is wrong.

**The Free-Path Rule.** The free action is tinted green; the paid action is
near-black. That asymmetry is load-bearing — it tells the visitor which door costs
nothing. Do not equalise the two buttons.

**The Legacy Alias Rule.** `tan`, `tan-2`, `tan-soft`, `bronze`, `canary` and
`stamp` are aliases pointing into this palette so untouched routes move with the
world. They are migration plumbing, not tokens. New work names `accent`, `ink`,
`sand`.

## Typography

**Display Font:** Hanken Grotesk (variable), with `ui-sans-serif, system-ui`
**Body Font:** Hanken Grotesk — the same family in every role
**Label Font:** Hanken Grotesk at 600 / uppercase / 0.08em

**Character:** One neutral grotesque doing all the work. It is warm enough to read
as a workshop rather than a bank, and quiet enough that the photography stays the
loudest thing on the page. There is no second family and no display face.

### Hierarchy
- **Display** (500, `clamp(2.1rem, 5.2vw, 3.9rem)`, 1.04, -0.025em): Page H1 only,
  capped around 20–22ch so it breaks into two or three balanced lines.
- **Headline** (500, `clamp(1.45rem, 3vw, 2rem)`, -0.02em): Section H2. The larger
  `clamp(1.6rem, 3.4vw, 2.4rem)` variant is used for the two band-level sections
  (interiors, closing call).
- **Title** (500, 1.5rem): Card titles on the two doors; 1rem for stage and tile
  titles.
- **Body** (400, 1.02rem / 1.625): Standfirsts under an H1, capped 52–58ch.
  Supporting copy drops to 0.94rem and detail text to 0.88rem.
- **Label** (600, 0.68rem, 0.08em, uppercase): Column headings, mobile drawer
  group labels, table headers, empty-state notices. Smaller 0.6–0.62rem
  variants exist for table headers and fieldset legends.
- **Figure** (tabular, -0.01em): Prices, counts, dimensions, stage numerals,
  cart badges. Numerals are tabular everywhere they can be compared.

### Named Rules
**The Normal-Weight Rule.** Headings are 500. Nothing on a storefront surface goes
heavier than 600, and nothing is set in uppercase except `label-xs`. Weight is not
how this system creates emphasis — space and photography are.

**The No-Kicker Rule.** Absolute: no kicker, eyebrow, or small uppercase line above
a heading, anywhere. `label-xs` is chrome for column headings, nav group labels and
table headers; if it is sitting above an H1/H2/H3, it is a defect.

**The Sequence-Only Numbering Rule.** Section numbers appear in exactly one place —
the four fit-out stages (01–04) — because the order of those stages is the
information. Numbers are never added to sections for rhythm.

## Layout

A single centred container (`container-page`, max 88rem) with gutters that step
1.25rem → 2rem at 640px → 3rem at 1024px. Full-bleed is used only for the
alternating sand band and the sticky chrome; content always returns to the
container.

Vertical rhythm is coarse and consistent: 5rem between sections on mobile, 7rem
from 1024px, 1.75rem between a section heading and its content, 0.35–0.5rem
between a title and its supporting line. A hairline top border plus 2rem of
padding is the standard way to open a definition or stage list.

Grids: the two doors are a 2-column equal split from 1024px (never 60/40). Product
and room grids run 2 columns on mobile, 3 at md, 4 at lg/xl, with a wider row gap
(2.5rem) than column gap (1–1.5rem) so captions bind to their image. Interiors
tiles run up to 6 columns. Below lg, horizontal collections become snap rails
(`snap-rail`, scrollbar hidden) rather than compressing. Image aspect ratios are
fixed per role: 4/5 products and rooms, 4/3 doors and projects, 3/4 interiors
tiles.

Chrome: a sticky 4.25rem (5rem at lg) header on 90% white with a backdrop blur and
a hairline bottom border; a fixed five-tab bottom bar below lg with
safe-area padding and a 4rem spacer reserved in the footer. Scroll padding is 5.5rem
so anchors clear the header. Inputs are forced to 16px below 768px to stop iOS
zooming.

## Elevation & Depth

Flat by default. Depth comes from the white/sand ground change, hairline borders,
and the photographs themselves — not from shadows. Exactly one shadow exists in the
storefront, and only on a surface that genuinely floats above the page: the desktop
nav panel. Cards, buttons, inputs, badges and bands have no shadow at any state.

### Shadow Vocabulary
- **Panel Drop** (`box-shadow: 0 24px 60px -32px rgba(26,26,24,0.35)`): The
  hover-opened desktop nav panel only. Large, soft, low-opacity; it reads as the
  panel lifting off the header, not as a card effect.

### Named Rules
**The Flat-Page Rule.** Nothing on the page surface casts a shadow. Shadow is
reserved for elements that overlay the page (nav panel, and nothing else today).
Scrims (`ink/30`–`ink/40`) carry the depth for drawers and sheets instead.

## Shapes

One radius: 4px (`--radius-card`) on cards, buttons, badges, inputs, panels and
sheets. 2px is used only for small affordances — icon buttons, nav row hovers — and
by the focus ring. `rounded-full` appears only on the circular cart count badge and
the filter checkbox tick.

Borders are 1px in `line` (default) or `rule` (outline buttons, which darken to
`ink` on hover). Image frames are radius-clipped rectangles over a sand ground,
with no border and no inner stroke. Underlines, not boxes, mark inline actions: a
1px bottom border in `ink` (paid path) or `accent` (free path) with 0.25rem of
padding beneath.

## Components

### Buttons
- **Shape:** Gently squared (4px), full-height flex row with a 0.5rem gap for a
  trailing chevron.
- **Primary:** Near-black fill, white text, 1.75rem horizontal padding at 3rem
  height (`lg` 3.25rem, `md` 2.75rem, `sm` 2.25rem). This is the paid/commit path.
- **Accent:** Green fill, white text, identical geometry. Reserved for the free
  path (site survey, enquiry).
- **Hover / Focus:** Fill shifts one step darker (`ink`→`ink-2`,
  `accent`→`accent-2`); pressing scales to 0.98. Focus is the global 2px green
  outline at 2px offset. Disabled drops to 50% opacity.
- **Outline:** White fill, `rule` hairline, ink text; the border darkens to `ink`
  on hover. The standing secondary next to either primary.
- **Ghost:** Ink text on no fill, sand on hover. Used inside toolbars and sheets.

### Chips
- **Style:** 4px corners, 0.7rem text at 500, 0.25rem/0.625rem padding, tinted
  ground with a matching darker text tone; no border.
- **State:** `neutral` (sand/grey ink) for facts such as "Made to order";
  `accent` (green wash) for a discount; `ink` for "Bestseller"; status tones for
  order states. Two chips never stack in the same corner of a card by
  default — they list vertically at 0.375rem apart, top-left.

### Cards / Containers
- **Corner Style:** 4px, clipping the photograph.
- **Background:** White card body, sand behind the image while it loads.
- **Shadow Strategy:** None (see Elevation & Depth).
- **Border:** None on photo cards; a `line` hairline on form panels and
  empty-state boxes.
- **Internal Padding:** Photo cards have no padding — the caption block sits
  0.75rem below the frame. Panelled containers use 1.5rem (nav panel) to 2rem.
- **Hover:** The image scales 3–5% over 700–900ms on `ease-out-soft`
  (`cubic-bezier(0.22, 1, 0.36, 1)`); product cards with a second photograph
  cross-fade to it over 500ms instead. The frame itself never moves.

### Inputs / Fields
- **Style:** White ground, 1px `line` border, 4px corners, 0.75rem/1rem padding,
  0.92rem text, no default outline.
- **Focus:** The border darkens to the accent; the global green focus ring applies
  to keyboard focus.
- **Error:** Border swaps to `danger`, with the message on a `danger-soft` panel.
- **Legends/labels:** `label-xs` in `ink-3`.

### Navigation
- **Desktop:** Two trade links plus "Our work" at 0.95rem, resting in `ink-2` and
  going to `ink` on hover; the active trade is marked by a 1px ink underline
  flush to the header's bottom hairline. Hovering a trade opens a white panel
  (46rem, 4px, hairline border, Panel Drop) listing children with right-aligned
  tabular counts; each panel closes with a single underlined link — ink for
  furniture, accent for the free survey.
- **Icons:** 20–22px line icons in 2.5rem hit targets with 2px corners and a sand
  hover. The cart count is a green pill with white tabular digits.
- **Mobile:** A left drawer (88% width, max 24rem, white) with `label-xs` group
  headings over hairline-divided rows, and a fixed five-tab bottom bar where the
  active tab is ink with a filled icon and the rest are `muted` with line icons.

### The Two Doors (signature)
Two equal `PathCard`s on the home page: identical 4/3 photograph, identical title
scale (1.5rem/500), identical body width, a right-aligned tabular figure with a
muted label, and an underlined action. The only difference permitted between them
is which action is tinted — green for the free interiors survey, ink for the
catalogue. Co-equality of the two trades is enforced in the nav, the home page and
the footer alike.

## Do's and Don'ts

### Do:
- **Do** keep the ground white (#ffffff) and use `sand` (#f6f5f2) for at most one
  alternating band per page.
- **Do** reserve `accent` (#2d4a3e) for action and live state, and tint the free
  path green while the paid path stays near-black.
- **Do** let the photograph be the loudest element: fixed aspect ratio, 4px clip,
  sand placeholder, and type that stays at 500 or lighter beside it.
- **Do** use one radius (4px), with 2px only on icon buttons and focus rings.
- **Do** set counts, prices and dimensions with `figure-num` so columns of
  numerals line up.
- **Do** use `label-xs` for column headings, nav group labels and table headers
  only.
- **Do** number a sequence only when the order is the information (the four
  fit-out stages).
- **Do** keep the two trades co-equal in every navigation, grid and footer
  position.
- **Do** gate "our work" surfaces on `DesignImage.origin = OWN_WORK`; `heroRank`
  ranks composition, not provenance, and several hero-ranked products are supplier
  catalogue renders.
- **Do** keep motion as a response to the pointer, with one authored exception:
  `animate-settle` on a lead photograph.

### Don't:
- **Don't** put a kicker or eyebrow above a heading, anywhere, in any form.
- **Don't** introduce a second hue. Status colours are signals, not palette.
- **Don't** set storefront headings above 600, in uppercase, or in a second
  typeface.
- **Don't** add shadows to cards, buttons, inputs or bands; shadow belongs only to
  surfaces overlaying the page.
- **Don't** use 2px borders or zero-radius frames; the stroke is a 1px hairline and
  the corner is 4px.
- **Don't** name legacy aliases (`tan`, `canary`, `stamp`, `bronze`) in new work.
- **Don't** apply `animate-settle` to text — it is scoped to media.
- **Don't** let a product render reach a surface that claims the work is ours.
