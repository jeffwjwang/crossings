#!/usr/bin/env bash
# Publish the current app to EAS Update and write the Expo Go play page.
# Requires EXPO_TOKEN. Run from apps/mobile.
set -euo pipefail

CHANNEL="${1:-production}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${EXPO_TOKEN:-}" ]]; then
  echo "EXPO_TOKEN is not set." >&2
  exit 1
fi

ACCOUNT="${EXPO_ACCOUNT:-jeffwjwangs-team}"

echo "Linking Expo project @${ACCOUNT}/crossings"
eas init --account "$ACCOUNT" --non-interactive

PROJECT_ID="$(node ./scripts/prepare-eas-update.mjs)"
echo "Project id: ${PROJECT_ID}"

MESSAGE="${UPDATE_MESSAGE:-GitHub ${GITHUB_SHA:-manual}}"
eas update \
  --channel "$CHANNEL" \
  --environment "$CHANNEL" \
  --platform ios \
  --message "$MESSAGE" \
  --non-interactive \
  --json > "${RUNNER_TEMP:-/tmp}/eas-update.json"

OUT="${PLAY_SITE_DIR:-play-site}"
node ./scripts/write-play-page.mjs "$CHANNEL" "$OUT" > /dev/null
OPEN_URL="$(sed -n '1p' "$OUT/link.txt")"
QR_URL="$(sed -n '2p' "$OUT/link.txt")"
npx --yes qrcode@1.5.4 -o "$OUT/qr.png" "$OPEN_URL"
echo "Expo Go URL: $OPEN_URL"
echo "QR image: $QR_URL"
echo "QR file: $OUT/qr.png"
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "### Crossings is ready to play ($CHANNEL)"
    echo
    echo "Scan this with the iPhone camera, then tap **Open in Expo Go**."
    echo
    echo "![QR code](${QR_URL})"
    echo
    if [[ "$CHANNEL" == "production" ]]; then
      echo "Bookmark: https://jeffwjwang.github.io/crossings/"
      echo
    else
      echo "This is the pull-request preview. The bookmark QR is only updated from main."
      echo
    fi
    echo "Direct link: \`$OPEN_URL\`"
  } >> "$GITHUB_STEP_SUMMARY"
fi
