# Rainbow Ready Mades — Image Assets

These are cleaned copies of the 25 images supplied for the hackathon.

## Cleaning
- Storefront images: cropped to remove camera/photographer footer and reduce neighboring-shop/exterior clutter.
- Interior images: cropped to remove camera footer and excess border.
- Product/model images: lightly cropped to remove bottom watermark/footer areas where possible.
- Product tags, garment branding, and visible product details were retained.
- No product name, price, size, stock, fabric, or other business fact was inferred from the images.

## Suggested usage
- `store/` → store/about/contact/hero sections.
- `products/` → product gallery/catalog images.
- `models/` → product/model showcase images.
- `docs/asset_manifest.json` → stable asset IDs and filenames.

## Important
Before inserting product image paths into `product_images`, map each image to the correct verified product/SKU. Do not invent product metadata from the photo alone.
