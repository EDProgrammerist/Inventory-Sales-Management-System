# Storefront product photography

Used only by the public display catalog. No asset implies live stock, an authorized
retailer relationship, verified prices, or a completed sale. Product trademarks and
images remain the property of their respective owners; commercial reuse rights have
not been independently cleared by this implementation.

## Sources

- `iphone-hero.png`: `images/Iphone Image.png` from https://github.com/highdee218/cyber,
  the product artwork matching the user-supplied Home-ref.png.
- `iphone-purple.png`: `images/big view.png`, same reference asset repository.
- `iphone-gold.png`: `images/gold iphone.png`, same repository.
- `iphone-silver.png`: `images/silver iphone.png`, same repository.
- `ps5.png`: `images/PlayStation.png`, same repository. Historical generic artwork, no longer used by the homepage.
- `ps5-digital-console.jpg`: user-provided `PS5 Digital 2.jpg`; Digital edition console photo and default product image.
- `ps5-digital-box.jpg`: user-provided `PS5 Digital 1.jpg`; Digital edition packaging gallery view.
- `ps5-disc-console.jpg`: user-provided `PS5 Disc 1.jpg`; Disc edition console photo and default product image.
- `ps5-disc-box.jpg`: user-provided `PS5 Disc 2.jpg`; Disc edition packaging gallery view.

The four edition photos were copied byte-for-byte from the user's Desktop attachments on November 1, 2026. Product galleries show the console and packaging separately; zoom applies to the selected photo. Admin-uploaded product images take precedence. Existing database IDs and image keys remain compatible; no database rewrite is needed.

On November 3, 2026 the user requested a **homepage-promotions-only** update. The top PS5 promotion now uses `ps5-disc-console.jpg`; the editorial console promotion uses `ps5-digital-console.jpg`; the decorative closing promotion uses `ps5-disc-box.jpg`. Source photos are reused unchanged. The mobile top promotion contains the complete photo rather than cropping its console/controller. Product cards, galleries, prices, stock, IDs and image overrides were not changed by this update.
- `iphone-black.jpg`: Apple newsroom, https://www.apple.com/newsroom/2022/09/apple-debuts-iphone-14-pro-and-iphone-14-pro-max/,
  image `Apple-iPhone-14-Pro-iPhone-14-Pro-Max-space-black-220907_inline.jpg.large.jpg`.
- `rtx-5090.jpg`: user-provided `5090.jpg`, ASUS ROG Astral RTX 5090 card and packaging.
- `rtx-5080.png`: user-provided `5080.png`, ASUS ROG Astral RTX 5080 card and packaging; original PNG transparency preserved.

The two GPU product images were copied byte-for-byte from the user's Desktop attachments on November 1, 2026. Existing database image keys resolve to these bundled replacements in storefront and admin views. Admin-uploaded custom images retain precedence.

- `gpu-feature.png`: user-provided `h732 (1).png`, historical homepage promotion artwork; original transparency preserved.
- `gpu-next-level.jpg`: user-provided `1735958276509.jpg`, copied byte-for-byte on November 3, 2026 for the homepage “Built for your next level” promotion. The complete landscape card is contained against the existing black surface; catalog imagery is unchanged.
- `gpu-aura.jpg`: user-provided `aurasync.jpg`, used in the homepage “Make room for more” promotion.

These promotional photos were copied unchanged. They are independent of the boxed product images used by the catalog.

Photos use the sources or user-provided files listed above. No product photography was AI
generated or recolored. Layout cropping uses CSS and preserves source files.
Catalog entries and illustrative PHP prices live in `src/data/storefront-catalog.ts`.
