#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/standalone"
python3 -m http.server 8766
