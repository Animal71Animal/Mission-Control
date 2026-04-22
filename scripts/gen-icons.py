#!/usr/bin/env python3
"""Generate simple PWA icons for Mission Control"""
import struct, zlib, os

def make_png(size, bg=(10,10,15), fg=(155,93,229)):
    """Generate a simple PNG with WLP purple background and MC text"""
    # Use PIL if available, otherwise create minimal PNG
    try:
        from PIL import Image, ImageDraw, ImageFont
        img = Image.new("RGB", (size, size), bg)
        draw = ImageDraw.Draw(img)
        # Purple circle background
        margin = size // 8
        draw.ellipse([margin, margin, size-margin, size-margin], fill=fg)
        # "MC" text
        text = "MC"
        font_size = size // 3
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()
        bbox = draw.textbbox((0,0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text(((size-tw)//2, (size-th)//2), text, fill=(255,255,255), font=font)
        return img
    except ImportError:
        return None

out_dir = os.path.expanduser("~/wlp/projects/mission-control/public")

for size in [192, 512]:
    img = make_png(size)
    if img:
        img.save(f"{out_dir}/icon-{size}.png")
        print(f"✅ Generated icon-{size}.png")
    else:
        print(f"⚠️  PIL not available — skipping icon-{size}.png")
