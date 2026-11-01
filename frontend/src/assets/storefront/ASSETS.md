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
- `ps5.png`: `images/PlayStation.png`, same repository. Retained only for the homepage family promotion.
- `ps5-digital-console.jpg`: user-provided `PS5 Digital 2.jpg`; Digital edition console photo and default product image.
- `ps5-digital-box.jpg`: user-provided `PS5 Digital 1.jpg`; Digital edition packaging gallery view.
- `ps5-disc-console.jpg`: user-provided `PS5 Disc 1.jpg`; Disc edition console photo and default product image.
- `ps5-disc-box.jpg`: user-provided `PS5 Disc 2.jpg`; Disc edition packaging gallery view.

The four edition photos were copied byte-for-byte from the user's Desktop attachments on November 1, 2026. Product galleries show the console and packaging separately; zoom applies to the selected photo. Admin-uploaded product images take precedence. Existing database IDs and image keys remain compatible; no database rewrite is needed.
- `iphone-black.jpg`: Apple newsroom, https://www.apple.com/newsroom/2022/09/apple-debuts-iphone-14-pro-and-iphone-14-pro-max/,
  image `Apple-iPhone-14-Pro-iPhone-14-Pro-Max-space-black-220907_inline.jpg.large.jpg`.
- `rtx-5090.jpg`: NVIDIA gallery shot 3, https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/.
- `rtx-5080.jpg`: NVIDIA Open Graph product photograph,
  https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5080/geforce-rtx-5080-og-1200x630.jpg.

All files were downloaded and visually inspected. No product photography was AI
generated or recolored. Layout cropping uses CSS and preserves source files.
Catalog entries and illustrative PHP prices live in `src/data/storefront-catalog.ts`.
