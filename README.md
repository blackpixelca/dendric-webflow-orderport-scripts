# Dendric Estate Webflow OrderPort Scripts

Public source repo for the Webflow + OrderPort scripts used on Dendric Estate.

## Files

- `scripts/dendric-shop-op.js` - Shop page filters, variants, quantity controls, add to cart, and nav OrderPort bridge.
- `scripts/dendric-product-op.js` - Product template variants, quantity controls, add to cart, and nav OrderPort bridge.

## Webflow Usage

This repo is public so Webflow can load the scripts through jsDelivr.

Shop page footer:

```html
<script defer src="https://cdn.jsdelivr.net/gh/blackpixelca/dendric-webflow-orderport-scripts@main/scripts/dendric-shop-op.js?v=20260609-2"></script>
```

Product template footer:

```html
<script defer src="https://cdn.jsdelivr.net/gh/blackpixelca/dendric-webflow-orderport-scripts@main/scripts/dendric-product-op.js?v=20260609-2"></script>
```

## Notes

- OrderPort startup is loaded by each script only if it is not already present.
- Native OrderPort controls are kept visually hidden; Webflow-built UI controls remain the visible interface.
- Product availability and SKUs are configured in each script's `productMap`.
