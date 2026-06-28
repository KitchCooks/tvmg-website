#!/usr/bin/env bash
# Manual publish from the server (cPanel Terminal / SSH), from inside the cloned repo:
#   bash ~/repositories/tvmg-website/deploy.sh
# Use this if you are not using the GitHub Action or cPanel auto-deploy.
set -e
cd "$(dirname "$0")"

echo "-> pulling latest..."
git pull --ff-only || true

# Primary domain -> $HOME/public_html. For an addon domain, set DEST to its doc root.
DEST="${DEST:-$HOME/public_html}"
echo "-> deploying to $DEST"
mkdir -p "$DEST"
rm -f "$DEST/index.php"   # remove Afrihost placeholder that shadows index.html
rm -rf "$DEST/css" "$DEST/js" "$DEST/assets"
cp -R Site/index.html Site/terms.html Site/intake.html Site/demo.html Site/css Site/js Site/assets "$DEST/"

echo "deployed. https://tvmg.co.za is now serving the latest build."
