#!/bin/bash
# Bundles the canonical /data JSON into the app. Run before building (also wired as an Xcode build phase).
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEST="$ROOT/ios/OpenProgression/Resources/data"
rm -rf "$DEST"; mkdir -p "$DEST/benchmarks"
cp "$ROOT/data"/*.json "$DEST"/
cp "$ROOT/data/benchmarks"/*.json "$DEST/benchmarks"/
echo "Copied data -> $DEST"
