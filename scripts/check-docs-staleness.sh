#!/bin/bash
# check-docs-staleness.sh
#
# Catches stale documentation before it ships. Run in CI or pre-push.
#
# Checks:
#   1. File paths in docs reference files that actually exist
#   2. Error codes in docs match the ErrorCode enum in source
#   3. No removed module/class names linger in docs
#
# Usage:
#   npm run check:docs
#   ./scripts/check-docs-staleness.sh
#
# Exit code 0 = clean, 1 = staleness detected.

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ERRORS=0
TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE"' EXIT

echo "Checking documentation staleness..."

# --------------------------------------------------------------------------
# 1. File paths referenced in docs must exist on disk
# --------------------------------------------------------------------------
echo ""
echo "=== Checking file path references ==="

# Exclude template/example paths (your-module, feature, etc.) since docs use
# them as illustrative placeholders, not references to real files.
grep -rhoE 'src/[a-zA-Z0-9_/.@-]+\.ts' "$REPO_ROOT/docs/" 2>/dev/null \
  | grep -v 'your-module\|feature\.' \
  | sort -u > "$TMPFILE" || true

while IFS= read -r filepath; do
  if [ ! -f "$REPO_ROOT/$filepath" ]; then
    echo "  STALE: $filepath referenced in docs/ but does not exist"
    ERRORS=$((ERRORS + 1))
  fi
done < "$TMPFILE"

if [ "$ERRORS" -eq 0 ]; then
  echo "  All file path references valid."
fi

# --------------------------------------------------------------------------
# 2. Error codes in docs must exist in the ErrorCode enum
# --------------------------------------------------------------------------
echo ""
echo "=== Checking error code references ==="

ERROR_CODES_FILE="$REPO_ROOT/src/common/constants/error-codes.constants.ts"

if [ ! -f "$ERROR_CODES_FILE" ]; then
  echo "  ERROR: Cannot find $ERROR_CODES_FILE"
  exit 1
fi

# Collect codes from the main ErrorCode enum AND any module-specific enums (e.g., TaskErrorCode)
DEFINED_CODES=$(grep -rhoE '[A-Z_]+ = "[A-Z_]+"' "$REPO_ROOT/src/" 2>/dev/null \
  | grep -oE '"[A-Z_]+"' | tr -d '"' | sort -u)
CODE_ERRORS=0

grep -rhoE '`(AUTH|TASK|USER|VALIDATION|SYSTEM|RESOURCE)_[A-Z_]+`' "$REPO_ROOT/docs/" 2>/dev/null \
  | tr -d '`' | sort -u > "$TMPFILE" || true

while IFS= read -r code; do
  [ -z "$code" ] && continue
  if ! echo "$DEFINED_CODES" | grep -qx "$code"; then
    echo "  STALE: $code referenced in docs/ but not defined in ErrorCode enum"
    CODE_ERRORS=$((CODE_ERRORS + 1))
  fi
done < "$TMPFILE"

ERRORS=$((ERRORS + CODE_ERRORS))

if [ "$CODE_ERRORS" -eq 0 ]; then
  echo "  All error code references valid."
fi

# --------------------------------------------------------------------------
# 3. Removed modules/classes must not appear in docs
# --------------------------------------------------------------------------
echo ""
echo "=== Checking for removed module references ==="

REMOVED_NAMES=(
  "PrismaModule"
  "LocalStrategy"
  "LocalAuthGuard"
  "local-auth.guard"
  "EmailExistsException"
  "UsernameExistsException"
  "cachemodule.ts"
  "HttpHealthIndicator"
  "Email already registered"
  "Username already taken"
)

MODULE_ERRORS=0

for name in "${REMOVED_NAMES[@]}"; do
  matches=$(grep -rl "$name" "$REPO_ROOT/docs/" 2>/dev/null || true)
  if [ -n "$matches" ]; then
    echo "  STALE: '$name' found in docs (removed from codebase):"
    echo "$matches" | sed 's/^/    /'
    MODULE_ERRORS=$((MODULE_ERRORS + 1))
  fi
done

ERRORS=$((ERRORS + MODULE_ERRORS))

if [ "$MODULE_ERRORS" -eq 0 ]; then
  echo "  No removed module references found."
fi

# --------------------------------------------------------------------------
# Summary
# --------------------------------------------------------------------------
echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "FAILED: $ERRORS staleness issue(s) found."
  exit 1
else
  echo "PASSED: No staleness issues found."
  exit 0
fi
