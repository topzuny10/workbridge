#!/usr/bin/env sh
set -eu

data_root="${XDG_DATA_HOME:-$HOME/.local/share}"
app_dir="$data_root/workbridge"
desktop_file="$data_root/applications/workbridge.desktop"

if [ ! -d "$app_dir" ]; then
  echo "WorkBridge가 설치되어 있지 않습니다."
  exit 0
fi

backup_dir="$app_dir.removed.$(date +%Y%m%d%H%M%S)"
mv "$app_dir" "$backup_dir"
[ -f "$desktop_file" ] && mv "$desktop_file" "$desktop_file.removed"
echo "앱을 백업 위치로 이동했습니다: $backup_dir"
echo "사용자 대화 데이터는 삭제하지 않았습니다."
