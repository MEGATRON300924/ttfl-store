# TTFL Store — Design Notes

## Direction
The brief explicitly rules out the current AI-generated defaults: no
glassmorphism, no heavy gradients, no futuristic neon look. It asks for
"polished, modern, trustworthy" — closer to a real marketplace (Jiji-like)
than an AI product landing page. That's a different register from the
MAX AI Ecosystem's dark cyan/gold futuristic branding — TTFL Store is its
own identity under the same parent company.

## Palette
Named "forge" — graphite (structure/trust) + ember (energy/CTA), because
The Tron Forge Limited's own name gives a real, ownable metaphor instead of
a generic marketplace blue.

| Token | Hex | Use |
|---|---|---|
| Graphite 950/900 | #12141A / #1A1D24 | header utility bar, footer, dark surfaces |
| Graphite 200/600 | #D6DAE1 / #5B6472 | borders, secondary text |
| Cloud 50/100 | #FBFBFC / #F5F6F8 | page background, input fills |
| Ember 600/700 | #E8622C / #B94A1F | primary CTA, discount tags, active states |
| Verified 600 | #1F9D63 | verified-vendor badge only — never decorative |
| Gold 600 | #B98A1F | ratings, one promo banner |

## Type
- **Plus Jakarta Sans** for both display and body — deliberately not Inter,
  which is the current AI-default choice for "clean SaaS." Jakarta has
  slightly more geometric warmth while staying highly legible at small
  marketplace card sizes.
- **JetBrains Mono** as the utility face for prices, discount tags, and SKU-
  like data. Marketplaces live and die by scannable numbers; giving prices a
  distinct monospace treatment makes them easier to compare at a glance
  down a grid of cards, and reads as "real commerce data" rather than
  decorative type.

## Signature element: the forge tag
Discount badges use `clip-path` to cut one corner at an angle — like a
stamped metal price tag — instead of a rounded pill (the generic default).
It's the one deliberate visual risk on the page; everything else (cards,
buttons, inputs) stays quiet and conventional so shoppers aren't relearning
how to shop.

## Layout
Standard marketplace grid conventions (sticky header → search → category
strip → homepage sections → dense product grids) are kept familiar on
purpose — the brief calls for "familiar enough that users immediately
understand how to shop." Distinctiveness lives in color, type, and the tag
shape, not in reinventing marketplace IA.
