#!/usr/bin/env bash
# Open bouncing_ball.html in the default browser.
# Works on macOS, Linux, and Windows (Git Bash / WSL).

set -euo pipefail

# Resolve the path to the HTML file relative to this script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HTML_FILE="$SCRIPT_DIR/bouncing_ball.html"

if [ ! -f "$HTML_FILE" ]; then
  echo "Error: bouncing_ball.html not found at $HTML_FILE" >&2
  exit 1
fi

case "$(uname -s)" in
  Darwin)
    # macOS
    open "$HTML_FILE"
    ;;
  Linux)
    if grep -qiE '(microsoft|wsl)' /proc/version 2>/dev/null; then
      # WSL: hand the Windows path to the default Windows browser.
      if command -v wslview >/dev/null 2>&1; then
        wslview "$HTML_FILE"
      else
        WIN_PATH="$(wslpath -w "$HTML_FILE")"
        cmd.exe /c start "" "$WIN_PATH"
      fi
    else
      # Native Linux
      xdg-open "$HTML_FILE"
    fi
    ;;
  CYGWIN*|MINGW*|MSYS*)
    # Windows (Git Bash / MSYS / Cygwin)
    start "" "$HTML_FILE"
    ;;
  *)
    echo "Error: unsupported operating system: $(uname -s)" >&2
    exit 1
    ;;
esac
