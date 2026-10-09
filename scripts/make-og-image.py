#!/usr/bin/env python3
"""
Build the social sharing card at client/public/assets/og-share.png.

The previous og:image was client/public/assets/logo.png, since deleted — the pre-rename
EpiMinded wordmark, grey on white. The metadata around it was already correct
SOULCHAIN copy, so WhatsApp and every other crawler showed the right title and
description beside the wrong brand.

The card is 1200x630, the size Open Graph, WhatsApp, Slack and LinkedIn all
render without re-cropping, on the site's own #080808 ground so the logo's
white wordmark reads. It is drawn from assets/navbar-logo.png, the same mark
the site's header uses, so the card can never drift from the live branding.

Run from the project root after changing the logo:

    python3 scripts/make-og-image.py
"""

import os
import sys

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required: pip install Pillow")

ASSETS = os.path.join("client", "public", "assets")
SOURCE = os.path.join(ASSETS, "navbar-logo.png")
TARGET = os.path.join(ASSETS, "og-share.png")

WIDTH, HEIGHT = 1200, 630
BACKGROUND = (8, 8, 8)          # --background on .dark, and body's own colour
LOGO_WIDTH = 720                # 60% of the canvas: clear in a chat thumbnail


def main() -> None:
    if not os.path.isfile(SOURCE):
        sys.exit(f"run from the project root: {SOURCE} not found")

    logo = Image.open(SOURCE).convert("RGBA")
    scale = LOGO_WIDTH / logo.width
    logo = logo.resize((LOGO_WIDTH, round(logo.height * scale)), Image.LANCZOS)

    card = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)
    # Composite rather than paste-with-mask alone, so the logo's antialiased
    # edges blend into the dark ground instead of keeping a white fringe.
    layer = Image.new("RGBA", (WIDTH, HEIGHT), BACKGROUND + (255,))
    layer.alpha_composite(logo, ((WIDTH - logo.width) // 2, (HEIGHT - logo.height) // 2))
    card = layer.convert("RGB")

    card.save(TARGET, "PNG", optimize=True)
    print(f"  {TARGET}  {WIDTH}x{HEIGHT}  {os.path.getsize(TARGET) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
