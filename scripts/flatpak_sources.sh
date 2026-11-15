#!/bin/bash

set -euo pipefail

BUILDER_TOOLS_COMMIT=9d86d336a39b9af38b86f114b6ce5820fe260f91
APP_ID=com.elasticvue.Elasticvue

cd "$(dirname "$0")/.."

OUT="${1:-flatpak/build}"
TAG="${TAG:-}"
TOOLS="$(mktemp -d)"
trap 'rm -rf "$TOOLS"' EXIT

mkdir -p "$OUT"

git clone -q https://github.com/flatpak/flatpak-builder-tools.git "$TOOLS/tools"
git -C "$TOOLS/tools" checkout -q "$BUILDER_TOOLS_COMMIT"

python3 -m venv "$TOOLS/venv"
"$TOOLS/venv/bin/pip" install -q "$TOOLS/tools/node" aiohttp tomlkit PyYAML

"$TOOLS/venv/bin/flatpak-node-generator" --no-requests-cache -o "$OUT/node-sources.json" npm package-lock.json
"$TOOLS/venv/bin/python" "$TOOLS/tools/cargo/flatpak-cargo-generator.py" -o "$OUT/cargo-sources.json" src-tauri/Cargo.lock

if [ -n "$TAG" ]; then
  COMMIT="${COMMIT:-$(git rev-parse "$TAG^{commit}")}"
  cat > "$OUT/elasticvue-source.json" <<EOF
[
  {
    "type": "git",
    "url": "https://github.com/cars10/elasticvue.git",
    "tag": "$TAG",
    "commit": "$COMMIT"
  }
]
EOF
else
  cat > "$OUT/elasticvue-source.json" <<EOF
[
  {
    "type": "dir",
    "path": "$(pwd)",
    "skip": [
      ".git",
      "node_modules",
      "dist",
      "artifacts",
      "tmp",
      "src-tauri/target",
      "flatpak/build",
      "scripts/showcase/output",
      "test-results",
      "playwright-report",
      "playwright-report-ci"
    ]
  }
]
EOF
fi

cp "flatpak/$APP_ID.yml" "$OUT/$APP_ID.yml"
