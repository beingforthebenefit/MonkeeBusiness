#!/bin/bash

# Ensure dependencies are installed
if ! command -v cwebp &> /dev/null || ! command -v avifenc &> /dev/null; then
  echo "Error: cwebp and avifenc must be installed. Install them with:"
  echo "  sudo apt install webp libavif-bin  (for Debian/Ubuntu)"
  echo "  sudo dnf install libwebp-tools libavif-tools  (for Fedora)"
  exit 1
fi

# Directory where images are located
ASSETS_DIR="${1:-.}"

# Convert images
find "$ASSETS_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) | while read -r IMAGE; do
  BASE="${IMAGE%.*}"
  
  # Convert to WebP and AVIF
  cwebp -q 80 "$IMAGE" -o "${BASE}.webp" >/dev/null 2>&1
  avifenc --min 20 --max 50 "$IMAGE" -o "${BASE}.avif" >/dev/null 2>&1

  # Determine smaller file size
  SIZE_WEBP=$(stat -c%s "${BASE}.webp")
  SIZE_AVIF=$(stat -c%s "${BASE}.avif")

  if [[ $SIZE_AVIF -lt $SIZE_WEBP ]]; then
    rm -f "${BASE}.webp"
    echo "Converted: $IMAGE → AVIF (smaller size)"
  else
    rm -f "${BASE}.avif"
    echo "Converted: $IMAGE → WebP (smaller size)"
  fi
done

echo "Conversion completed!"
