#!/bin/sh
# Purge jsDelivr cache untuk file design-system yang dipakai di project ini.
# Jalankan setiap kali ada perubahan di repo design-system (branch main)
# supaya perubahan langsung muncul di sini tanpa menunggu cache jsDelivr.

set -e

FILES="tera-header.js tokens.css"

for f in $FILES; do
  url="https://purge.jsdelivr.net/gh/titohnf/design-system@main/$f"
  echo "Purging $f ..."
  curl -s "$url" | grep -o '"id":"[^"]*"\|"status":"[^"]*"' || true
  echo
done
