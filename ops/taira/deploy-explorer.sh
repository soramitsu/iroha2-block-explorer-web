#!/usr/bin/env bash
set -euo pipefail

COMMAND="${1:-deploy}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
DEFAULT_ROOT="$(cd -- "$SCRIPT_DIR/../.." && pwd -P)"
ROOT="${TAIRA_EXPLORER_ROOT:-$DEFAULT_ROOT}"

case "$COMMAND" in
  manifest|initialize|deploy|prepare-transition|verify)
    if [[ "$#" -ne 1 ]]; then
      echo "Usage: $0 $COMMAND" >&2
      exit 2
    fi
    ;;
  transition|rollback)
    if [[ "$#" -ne 2 ]]; then
      echo "Usage: $0 $COMMAND <exact-release-id>" >&2
      exit 2
    fi
    ;;
  *)
    echo "Unknown command: $COMMAND" >&2
    echo "Usage: $0 {manifest|initialize|deploy|prepare-transition|transition <exact-release-id>|verify|rollback <exact-release-id>}" >&2
    exit 2
    ;;
esac

cd -- "$ROOT"
ROOT="$(pwd -P)"
export TAIRA_EXPLORER_ROOT="$ROOT"

unset NODE_OPTIONS NODE_PATH
exec node "$SCRIPT_DIR/release-tool.mjs" --taira-release-wrapper "$@"
