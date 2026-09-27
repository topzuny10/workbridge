#!/usr/bin/env sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
export WORKBRIDGE_CLOUD_DATA="${WORKBRIDGE_CLOUD_DATA:-$script_dir/data}"
export WORKBRIDGE_CLOUD_HOST="${WORKBRIDGE_CLOUD_HOST:-127.0.0.1}"
export WORKBRIDGE_CLOUD_PORT="${WORKBRIDGE_CLOUD_PORT:-8787}"
exec node "$script_dir/server.cjs"
