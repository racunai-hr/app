#!/usr/bin/env bash
# Copy a generated API openapi.yaml into this repo. Do not edit the copy by hand.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-}"
if [ -z "$SRC" ]; then
  echo "Usage: scripts/sync-openapi.sh /path/to/api/openapi.yaml" >&2
  echo "Pass the canonical API artifact explicitly (no implied sibling checkout)." >&2
  exit 1
fi
mkdir -p "$ROOT/openapi"
cp "$SRC" "$ROOT/openapi/openapi.yaml"
echo "Synced $SRC -> $ROOT/openapi/openapi.yaml"
