# Branding Assets Setup

You've provided a beautiful logo! Here's what you need to do to complete the branding setup:

## 📁 Required Image Files

Save your logo in the `/public` directory with these names and sizes:

### 1. **favicon.ico** (32x32px)
- Classic browser favicon
- Convert your logo to ICO format
- Path: `/public/favicon.ico`

### 2. **icon-192.png** (192x192px)
- PWA icon for Android home screen
- PNG format with transparent background (or solid background)
- Path: `/public/icon-192.png`

### 3. **icon-512.png** (512x512px)
- High-res PWA icon
- PNG format
- Path: `/public/icon-512.png`

### 4. **apple-touch-icon.png** (180x180px)
- iOS home screen icon
- PNG format
- Path: `/public/apple-touch-icon.png`

### 5. **og-image.png** (1200x630px)
- Open Graph image for social media sharing (Twitter, Facebook, LinkedIn)
- When someone shares your app, this image shows up
- Include your logo + tagline: "Work with your energy, not against it"
- Path: `/public/og-image.png`

---

## 🛠️ How to Generate These Files

### Option 1: Online Tools (Easiest)
1. **Favicon Generator**: https://realfavicongenerator.net/
   - Upload your logo
   - It generates all sizes automatically
   - Download and place in `/public`

2. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
   - Upload your logo
   - Get all PWA icons instantly

### Option 2: Design Tool (Figma, Photoshop, etc.)
1. Open your logo
2. Resize to each dimension listed above
3. Export as PNG (except favicon.ico)
4. Save to `/public` directory

### Option 3: Command Line (ImageMagick)
```bash
# Install ImageMagick if you haven't
# Convert your logo to different sizes

convert logo.png -resize 32x32 public/favicon.ico
convert logo.png -resize 192x192 public/icon-192.png
convert logo.png -resize 512x512 public/icon-512.png
convert logo.png -resize 180x180 public/apple-touch-icon.png
convert logo.png -resize 1200x630 public/og-image.png
```

---

## ✅ What's Already Set Up

I've already configured:
- ✅ Metadata in `src/app/layout.tsx` with SEO tags
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card meta tags
- ✅ PWA manifest file (`/public/manifest.json`)
- ✅ Robots.txt for search engines
- ✅ Icon references in the app
- ✅ Theme colors matching your dark theme

---

## 🎨 Current Theme Colors

Based on your dark theme:
- **Primary Color**: `#00FF00` (Neon Green)
- **Background**: `#0d1810` (Dark Forest Green)
- **Theme**: Dark mode with high contrast

These are reflected in the manifest.json and will show when users install your PWA.

---

## 🚀 After Adding Images

Once you've placed all the images in `/public`, verify they work:

1. **Test Favicon**:
   - Open your app in browser
   - Check browser tab for favicon

2. **Test PWA Icons**:
   - Open Chrome DevTools → Application → Manifest
   - Verify all icons load correctly

3. **Test OG Image**:
   - Share your app URL on Twitter/LinkedIn
   - Verify the preview card shows your og-image.png

4. **Mobile Install**:
   - On mobile, tap "Add to Home Screen"
   - Verify the icon looks correct

---

## 📝 Next Steps

1. Save your logo in all required sizes to `/public`
2. Update the domain in `src/app/layout.tsx` (currently set to `https://currentstate.app`)
3. Build and test: `npm run build`
4. Deploy to production

---

## 💡 Pro Tips

- Keep logos simple and recognizable at small sizes
- Use transparent backgrounds for icons (except OG image)
- Test on both light and dark mode browsers
- The ocean/sunrise logo you shared is perfect - calm, flowing, matches the "current state" theme!
