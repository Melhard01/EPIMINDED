#!/usr/bin/env python3
"""
Generate PNG/JPEG twins for every .webp asset, for browsers that cannot decode
WebP (Safari below 14, which is every iOS below 14).

The site serves WebP to everyone that accepts it; the Cloudflare worker (and the
Express server) swap in these twins for clients whose Accept header does not
include image/webp. See worker/index.ts. Nothing in the markup or the CSS
changes: the .webp URL stays exactly as written.

The twins are generated from the .webp rather than restored from the original
PNGs so that dimensions always match what the site actually ships — two of the
icons were resized when they were converted, and the pre-conversion originals
are 1024x1024.

Alpha decides the format: PNG where transparency is needed, JPEG at quality 92
otherwise, which keeps the fallbacks from reintroducing the multi-megabyte PNG
payload the conversion removed.

Run from the project root after adding or changing a .webp asset:

    python3 scripts/make-image-fallbacks.py
"""

import os
import sys

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required: pip install Pillow")

ROOT = os.path.join("client", "public")
JPEG_QUALITY = 92


def has_alpha(image: Image.Image) -> bool:
    return image.mode in ("RGBA", "LA") or "transparency" in image.info


def main() -> None:
    if not os.path.isdir(ROOT):
        sys.exit(f"run from the project root: {ROOT} not found")

    written, skipped, total_bytes = 0, 0, 0

    for dirpath, _dirs, files in os.walk(ROOT):
        for name in sorted(files):
            if not name.endswith(".webp"):
                continue

            source = os.path.join(dirpath, name)
            image = Image.open(source)
            stem = os.path.splitext(source)[0]

            if has_alpha(image):
                target = f"{stem}.png"
                image.convert("RGBA").save(target, "PNG", optimize=True)
            else:
                target = f"{stem}.jpg"
                image.convert("RGB").save(
                    target, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True
                )

            size = os.path.getsize(target)
            total_bytes += size
            written += 1
            print(f"  {os.path.relpath(target, ROOT):<46} {size / 1024:7.0f} KB")

    print(f"\n{written} fallbacks written, {skipped} skipped, {total_bytes / 1024 / 1024:.2f} MB total")


if __name__ == "__main__":
    main()
