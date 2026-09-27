#!/usr/bin/env sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_dir=$(CDPATH= cd -- "$script_dir/.." && pwd)

if [ "$(uname -s)" != "Darwin" ]; then
  echo "오류: DMG는 macOS에서만 만들 수 있습니다." >&2
  exit 1
fi

cd "$project_dir"
npm ci
npm run check

iconset_dir=$(mktemp -d)/WorkBridge.iconset
mkdir -p "$iconset_dir"
trap 'rm -rf "$(dirname "$iconset_dir")"; rm -f "$project_dir/build/icon.icns"' EXIT

for spec in \
  "16 icon_16x16.png" "32 icon_16x16@2x.png" \
  "32 icon_32x32.png" "64 icon_32x32@2x.png" \
  "128 icon_128x128.png" "256 icon_128x128@2x.png" \
  "256 icon_256x256.png" "512 icon_256x256@2x.png" \
  "512 icon_512x512.png" "1024 icon_512x512@2x.png"
do
  size=${spec%% *}
  name=${spec#* }
  sips -z "$size" "$size" build/icon.png --out "$iconset_dir/$name" >/dev/null
done
iconutil -c icns "$iconset_dir" -o build/icon.icns

npm run dist:mac

app_version=$(node -p "require('./package.json').version")
echo "완료: $project_dir/dist/WorkBridge-$app_version-x64.dmg"
echo "완료: $project_dir/dist/WorkBridge-$app_version-arm64.dmg"
