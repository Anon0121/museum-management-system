# Image Size Guidelines for Museum Management System

## Current System Limits

### File Size Limits
- **Promotional Images**: **5MB maximum**
- **Profile Photos**: **5MB maximum**
- **Events/Exhibits**: **No explicit limit** (uses default multer settings)
- **Cultural Objects**: **No explicit limit** (uses default multer settings)

### Accepted File Types
All image uploads accept:
- JPEG/JPG
- PNG
- GIF
- WebP

---

## Recommended Image Dimensions

### 1. **Promotional Images** (Banner/Carousel)
**Recommended Size:**
- **Width**: 1920px
- **Height**: 800px - 1080px
- **Aspect Ratio**: 16:9 or 21:9 (wide banner format)
- **File Size**: Under 5MB
- **Format**: JPEG (for photos) or PNG (for graphics with text)

**Why**: Promotional banners are displayed prominently and need to look good on all screen sizes.

---

### 2. **Event Images**
**Recommended Size:**
- **Width**: 1200px - 1920px
- **Height**: 675px - 1080px
- **Aspect Ratio**: 16:9 (standard widescreen)
- **File Size**: Under 2MB per image
- **Format**: JPEG

**Why**: Events are displayed in cards/grids, so consistent aspect ratios look better.

---

### 3. **Exhibit Images**
**Recommended Size:**
- **Width**: 1200px - 1920px
- **Height**: 800px - 1200px
- **Aspect Ratio**: 3:2 or 16:9
- **File Size**: Under 2MB per image
- **Format**: JPEG

**Why**: Exhibits need high-quality images for detail viewing, but shouldn't be too large.

---

### 4. **Cultural Object Images**
**Recommended Size:**
- **Width**: 1200px - 2000px
- **Height**: 1200px - 2000px
- **Aspect Ratio**: 1:1 (square) or 4:3
- **File Size**: Under 3MB per image
- **Format**: JPEG (for photos) or PNG (for detailed artifacts)

**Why**: Cultural objects need high resolution for detailed viewing, and square format works well in galleries.

---

## Quick Reference Table

| Type | Max File Size | Recommended Dimensions | Aspect Ratio | Format |
|------|--------------|----------------------|--------------|--------|
| **Promotional** | 5MB | 1920 x 800-1080px | 16:9 / 21:9 | JPEG/PNG |
| **Events** | No limit* | 1200-1920 x 675-1080px | 16:9 | JPEG |
| **Exhibits** | No limit* | 1200-1920 x 800-1200px | 3:2 / 16:9 | JPEG |
| **Cultural Objects** | No limit* | 1200-2000 x 1200-2000px | 1:1 / 4:3 | JPEG/PNG |

*No explicit limit in code, but recommended to keep under 5MB for performance

---

## Tips for Best Results

1. **Optimize Images**: Use tools like TinyPNG, ImageOptim, or Photoshop's "Save for Web" to reduce file size while maintaining quality.

2. **Consistent Aspect Ratios**: Using the same aspect ratio for all images in a category makes the gallery look more professional.

3. **File Format**:
   - Use **JPEG** for photos (smaller file size)
   - Use **PNG** for images with text or transparency
   - Use **WebP** for modern browsers (best compression)

4. **Resolution**: 
   - For web display, 1920px width is usually sufficient
   - Higher resolution (2000px+) is good for cultural objects that users might zoom into

5. **File Size**: Even if there's no limit, keep images under 2-3MB for faster loading times.

---

## Current System Status

✅ **File type validation**: Working (JPG, PNG, GIF, WebP)
✅ **File size limit**: Only for Promotional (5MB) and Profile Photos (5MB)
⚠️ **No dimension validation**: System accepts any image dimensions
⚠️ **No file size limit**: For Events, Exhibits, and Cultural Objects (may cause performance issues with very large files)

---

## Recommendations for Future Updates

Consider adding:
1. File size limits for Events, Exhibits, and Cultural Objects (recommend 5MB)
2. Optional dimension validation to ensure consistent display
3. Automatic image compression/resizing on upload
4. Image optimization service integration

