#!/usr/bin/env sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
payload_dir="$script_dir/dist/linux-unpacked"
data_root="${XDG_DATA_HOME:-$HOME/.local/share}"
app_dir="$data_root/workbridge"
desktop_dir="$data_root/applications"
backup_dir=""

if [ ! -x "$payload_dir/workbridge" ]; then
  echo "오류: dist/linux-unpacked/workbridge를 찾지 못했습니다." >&2
  echo "먼저 npm run dist:linux를 실행하세요." >&2
  exit 1
fi

mkdir -p "$data_root" "$desktop_dir"
if [ -d "$app_dir" ]; then
  backup_dir="$app_dir.backup.$(date +%Y%m%d%H%M%S)"
  mv "$app_dir" "$backup_dir"
fi

if ! cp -R "$payload_dir" "$app_dir"; then
  [ -n "$backup_dir" ] && mv "$backup_dir" "$app_dir"
  echo "설치 실패. 이전 버전을 복원했습니다." >&2
  exit 1
fi

cat > "$desktop_dir/workbridge.desktop" <<EOF
[Desktop Entry]
Name=WorkBridge
Comment=Move selected ChatGPT and Codex conversations
Exec=$app_dir/workbridge
Icon=$app_dir/icon.png
Terminal=false
Type=Application
Categories=Utility;Development;
EOF

chmod +x "$app_dir/workbridge"
cp "$script_dir/build/icon.png" "$app_dir/icon.png"

if [ -f "$app_dir/chrome-sandbox" ]; then
  echo "Electron 보안 샌드박스를 설정하려면 관리자 암호가 한 번 필요합니다."
  sudo chown root:root "$app_dir/chrome-sandbox"
  sudo chmod 4755 "$app_dir/chrome-sandbox"
fi

echo "WorkBridge 설치 완료: $app_dir/workbridge"
[ -n "$backup_dir" ] && echo "이전 버전 백업: $backup_dir"
