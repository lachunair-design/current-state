# Icon Generation Guide

## Current Status

✅ **SVG icons created** - Ready to use and convert to PNG
- `icon.svg` - App logo (circular gradient design)
- `og-image.svg` - Social sharing image (1200x630)

## What You Need to Do

Convert these SVG files to PNG format for full PWA support.

### Option 1: Online Tool (Easiest - 5 minutes)

1. **For App Icons** (favicon, PWA icons, Apple touch icon):
   - Go to https://realfavicongenerator.net/
   - Upload `public/icon.svg`
   - Click "Generate favicons"
   - Download the package
   - Extract files to `public/` directory
   - **Done!** All sizes will be created automatically

2. **For OG Image** (social sharing):
   - Go to https://cloudconvert.com/svg-to-png
   - Upload `public/og-image.svg`
   - Set width to 1200px
   - Download as `og-image.png`
   - Move to `public/og-image.png`

### Option 2: Command Line (If you have ImageMagick)

```bash
# Convert icon.svg to all required sizes
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
convert public/icon.svg -resize 180x180 public/apple-touch-icon.png
convert public/icon.svg -resize 32x32 public/favicon-32x32.png
convert public/icon.svg -resize 16x16 public/favicon-16x16.png

# Convert OG image
convert public/og-image.svg -resize 1200x630 public/og-image.png

# Generate favicon.ico (multi-size)
convert public/favicon-32x32.png public/favicon-16x16.png public/favicon.ico
```

### Option 3: NPM Package

```bash
npm install -g pwa-asset-generator
pwa-asset-generator public/icon.svg public/ --icon-only
```

## Required Files Checklist

After conversion, you should have these files in `public/`:

- [ ] `favicon.ico` (16x16, 32x32, 48x48 multi-size)
- [ ] `icon-192.png` (192x192 for Android)
- [ ] `icon-512.png` (512x512 for Android)
- [ ] `apple-touch-icon.png` (180x180 for iOS)
- [ ] `og-image.png` (1200x630 for social sharing)

## Testing After Generation

1. **Local test:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/icon-192.png
   # Visit http://localhost:3000/og-image.png
   ```

2. **PWA install test:**
   - Open on mobile device
   - Look for "Add to Home Screen" prompt
   - Install and verify icon appears correctly

3. **Social sharing test:**
   - Share link on Twitter/LinkedIn
   - Verify og-image.png displays

## Your Brand Colors

Use these colors from your logo if creating custom graphics:

**Sunset Gradient:**
- Start: `#FF9D76` (Coral)
- Mid: `#FFD4A3` (Soft Peach)

**Ocean Gradient:**
- Mid: `#A8E6CF` (Light Mint)
- End: `#4FB3D4` (Ocean Blue)

## Notes

- SVG files work in many browsers but PNG is required for PWA installation
- OG image MUST be PNG for social media platforms
- favicon.ico is required for older browsers
- The manifest.json already references these files

## Quick Start (Recommended)

Just use https://realfavicongenerator.net/ - upload `icon.svg` and you're done in 2 minutes!
