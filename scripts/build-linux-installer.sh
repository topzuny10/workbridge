#!/usr/bin/env sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_dir=$(CDPATH= cd -- "$script_dir/.." && pwd)
version=$(node -p "require('$project_dir/package.json').version")
payload_dir="$project_dir/dist/linux-unpacked"
release_dir="$project_dir/releases"
output="$release_dir/WorkBridge-$version-linux-x64.sh"
archive=$(mktemp)
header=$(mktemp)
staging=$(mktemp -d)
trap 'rm -f "$archive" "$header"; rm -rf "$staging"' EXIT

if [ ! -x "$payload_dir/workbridge" ]; then
  echo "Build missing: run npm run dist:linux first." >&2
  exit 1
fi

mkdir -p "$release_dir"
cp -R "$payload_dir/." "$staging/"
cp "$project_dir/build/icon.png" "$staging/icon.png"
tar -C "$staging" -czf "$archive" .

cat > "$header" <<'INSTALLER'
#!/usr/bin/env sh
set -eu

data_root=${XDG_DATA_HOME:-"$HOME/.local/share"}
app_dir="$data_root/workbridge"
desktop_dir="$data_root/applications"
desktop_file="$desktop_dir/workbridge.desktop"
temporary=$(mktemp -d)
backup_dir=""
trap 'rm -rf "$temporary"' EXIT

archive_line=$(awk '/^__WORKBRIDGE_ARCHIVE__$/ { print NR + 1; exit }' "$0")
if [ -z "$archive_line" ]; then
  echo "Invalid WorkBridge installer." >&2
  exit 1
fi

tail -n +"$archive_line" "$0" | tar -xzf - -C "$temporary"
if [ ! -x "$temporary/workbridge" ]; then
  echo "The WorkBridge payload is damaged." >&2
  exit 1
fi

mkdir -p "$data_root" "$desktop_dir"
if [ -d "$app_dir" ]; then
  backup_dir="$app_dir.backup.$(date +%Y%m%d%H%M%S)"
  mv "$app_dir" "$backup_dir"
fi

if ! cp -R "$temporary" "$app_dir"; then
  [ -n "$backup_dir" ] && mv "$backup_dir" "$app_dir"
  echo "Installation failed; the previous version was restored." >&2
  exit 1
fi

cat > "$desktop_file" <<DESKTOP
[Desktop Entry]
Name=WorkBridge
Comment=Move selected AI conversations between operating systems
Exec=$app_dir/workbridge
Icon=$app_dir/icon.png
Terminal=false
Type=Application
Categories=Utility;Development;
DESKTOP

chmod +x "$app_dir/workbridge"
if [ -f "$app_dir/chrome-sandbox" ]; then
  echo "Administrator access is required once to configure Electron's security sandbox."
  sudo chown root:root "$app_dir/chrome-sandbox"
  sudo chmod 4755 "$app_dir/chrome-sandbox"
fi

echo "WorkBridge installed: $app_dir/workbridge"
[ -n "$backup_dir" ] && echo "Previous version backup: $backup_dir"
exit 0
__WORKBRIDGE_ARCHIVE__
INSTALLER

cat "$header" "$archive" > "$output"
chmod +x "$output"
echo "$output"
